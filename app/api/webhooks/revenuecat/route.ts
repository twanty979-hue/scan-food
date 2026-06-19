// app/api/webhooks/revenuecat/route.ts
import dayjs from 'dayjs';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

type PlanKey = 'basic' | 'pro' | 'ultimate';
type BillingPeriod = 'monthly' | 'yearly';

const PLAN_KEYS: PlanKey[] = ['basic', 'pro', 'ultimate'];
const SUCCESS_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
]);
const EXPIRY_EVENTS = new Set(['EXPIRATION']);
const NON_BLOCKING_EVENTS = new Set([
  'CANCELLATION',
  'BILLING_ISSUE',
  'SUBSCRIPTION_PAUSED',
  'TRANSFER',
]);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const authResponse = validateWebhookAuth(req);
    if (authResponse) return authResponse;

    const payload = await req.json();
    const event = payload.event ?? payload;
    const eventType = String(event.type ?? '').toUpperCase();
    const brandId = String(event.app_user_id ?? event.appUserID ?? '').trim();
    const productId = String(event.product_id ?? event.productId ?? '').trim();
    const transactionId = String(
      event.transaction_id ??
        event.transactionId ??
        event.original_transaction_id ??
        event.originalTransactionId ??
        event.id ??
        ''
    ).trim();

    if (!eventType) {
      return NextResponse.json({ error: 'Missing RevenueCat event type' }, { status: 400 });
    }

    // RevenueCat uses synthetic events without a customer ID to validate the endpoint.
    if (eventType === 'TEST' || eventType === 'PING') {
      return NextResponse.json({ received: true, test: true });
    }

    if (!brandId) {
      console.warn(`[RevenueCat] Ignoring ${eventType} event without app_user_id`);
      return NextResponse.json({
        received: true,
        ignored: 'missing_app_user_id',
      });
    }

    if (NON_BLOCKING_EVENTS.has(eventType)) {
      await logRevenueCatEvent(event, brandId, productId, transactionId, eventType);
      return NextResponse.json({ received: true, ignored: eventType });
    }

    if (EXPIRY_EVENTS.has(eventType)) {
      await refreshEffectivePlan(brandId);
      await logRevenueCatEvent(event, brandId, productId, transactionId, eventType);
      return NextResponse.json({ received: true, expired: true });
    }

    if (!SUCCESS_EVENTS.has(eventType)) {
      await logRevenueCatEvent(event, brandId, productId, transactionId, eventType);
      return NextResponse.json({ received: true, ignored: eventType });
    }

    // RevenueCat Test Store accelerates subscription renewals (a monthly
    // product renews every few minutes). The first purchase grants the real
    // business duration below; accelerated sandbox renewals must not stack it.
    if (eventType === 'RENEWAL' && isSandboxEvent(event)) {
      await logRevenueCatEvent(event, brandId, productId, transactionId, eventType);
      return NextResponse.json({ received: true, ignored: 'sandbox_renewal' });
    }

    const plan = inferPlan(event, productId);
    const period = inferPeriod(event, productId);

    if (!plan || !period) {
      console.warn(`[RevenueCat] Ignoring unsupported product: ${productId || 'unknown'}`);
      return NextResponse.json({
        received: true,
        ignored: 'unsupported_product',
        productId,
      });
    }

    const expiryDate = inferExpiryDate(event, period);

    await applyPlanPurchase({
      brandId,
      plan,
      period,
      expiryDate,
      event,
      productId,
      transactionId,
      eventType,
    });

    return NextResponse.json({ received: true, plan, period, expiryDate });
  } catch (error: any) {
    console.error('[RevenueCat Webhook] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function validateWebhookAuth(req: NextRequest) {
  const expected = process.env.REVENUECAT_WEBHOOK_SECRET?.trim();
  if (!expected) return null;

  const rawHeader =
    req.headers.get('authorization') ??
    req.headers.get('x-revenuecat-signature') ??
    '';
  const actual = rawHeader.replace(/^Bearer\s+/i, '').trim();

  if (actual !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

// 🌟 1. ฟังก์ชันเช็กสิทธิ์แบบอุดรอยรั่ว (ดักคำว่า "product" ได้แล้ว 555)
function inferPlan(event: any, productId: string): PlanKey | null {
  console.log('[RevenueCat Debug Payload]:', JSON.stringify(event));

  const productPlan = planFromIdentifier(productId);
  if (productPlan) return productPlan;

  const packagePlan = planFromIdentifier(
    event.package_id ?? event.packageId ?? event.package_identifier ?? ''
  );
  if (packagePlan) return packagePlan;

  // 1. ดักสิทธิ์การเงินจริง (ปลอดภัยสุด)
  const rawEntitlements = [
    ...(Array.isArray(event.entitlement_ids) ? event.entitlement_ids : []),
    ...(Array.isArray(event.entitlementIds) ? event.entitlementIds : []),
  ];
  const entitlementPlans = rawEntitlements
    .map((id) => planFromIdentifier(String(id)))
    .filter((plan): plan is PlanKey => plan !== null);

  if (entitlementPlans.includes('ultimate')) return 'ultimate';
  if (entitlementPlans.includes('pro')) return 'pro';
  if (entitlementPlans.includes('basic')) return 'basic';

  // 2. ดักจาก Offering (ชื่อกล่องที่เราตั้ง)
  const offering = String(event.presented_offering_id ?? event.presentedOfferingIdentifier ?? '').toLowerCase();
  if (offering.includes('ultimate')) return 'ultimate';
  if (offering.includes('basic')) return 'basic';
  if (/\bpro\b/.test(offering)) return 'pro'; // \b คือบังคับว่าต้องเป็นคำว่า pro โดดๆ

  // 3. ดักจาก Product ID
  const idSource = String(productId).trim().toLowerCase();
  if (idSource.includes('ultimate')) return 'ultimate';
  if (idSource.includes('basic')) return 'basic';
  if (/\bpro\b/.test(idSource)) return 'pro';

  // 4. ท่าไม้ตายสำหรับ Test Store ที่ชอบส่งมาแค่คำว่า monthly/yearly
  // Never guess a plan from a period-only ID. Guessing used to grant Basic
  // for every monthly/yearly package and was the main source of wrong plans.

  console.warn(`[RevenueCat Check Failed] ProductID: ${productId}, OfferingID: ${event.presented_offering_id}`);
  return null;
}

function normalizeIdentifier(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function planFromIdentifier(value: unknown): PlanKey | null {
  const tokens = normalizeIdentifier(value).split('_');
  if (tokens.includes('ultimate')) return 'ultimate';
  if (tokens.includes('pro')) return 'pro';
  if (tokens.includes('basic')) return 'basic';
  return null;
}

// 🌟 2. ฟังก์ชันเช็กรอบบิลแบบรัดกุม
function inferPeriod(event: any, productId: string): BillingPeriod | null {
  const productPeriod = periodFromIdentifier(productId);
  if (productPeriod) return productPeriod;

  const packagePeriod = periodFromIdentifier(
    event.package_id ?? event.packageId ?? event.package_identifier ?? ''
  );
  if (packagePeriod) return packagePeriod;

  const periodType = String(event.period_type ?? event.periodType ?? '').toLowerCase();
  
  if (periodType === 'normal' || periodType === 'intro') {
     const id = String(productId).toLowerCase();
     if (/\b(yearly|annual|p1y)\b/.test(id)) return 'yearly';
     if (/\b(monthly|p1m)\b/.test(id)) return 'monthly';
  }

  if (periodType.includes('year') || periodType.includes('annual')) return 'yearly';
  if (periodType.includes('month')) return 'monthly';

  const fallbackId = String(productId).toLowerCase();
  if (/\b(yearly|annual|p1y)\b/.test(fallbackId)) return 'yearly';
  if (/\b(monthly|p1m)\b/.test(fallbackId)) return 'monthly';

  return null;
}

function periodFromIdentifier(value: unknown): BillingPeriod | null {
  const tokens = normalizeIdentifier(value).split('_');
  if (tokens.some((token) => ['yearly', 'annual', 'year', 'p1y'].includes(token))) {
    return 'yearly';
  }
  if (tokens.some((token) => ['monthly', 'month', 'p1m'].includes(token))) {
    return 'monthly';
  }
  return null;
}

function inferExpiryDate(event: any, period: BillingPeriod): string {
  const expirationMs = Number(event.expiration_at_ms ?? event.expirationAtMs ?? 0);
  if (!isSandboxEvent(event) && Number.isFinite(expirationMs) && expirationMs > 0) {
    return new Date(expirationMs).toISOString();
  }

  const purchasedMs = Number(event.purchased_at_ms ?? event.purchasedAtMs ?? Date.now());
  const base = Number.isFinite(purchasedMs) && purchasedMs > 0 ? dayjs(purchasedMs) : dayjs();
  return period === 'yearly'
    ? base.add(1, 'year').toISOString()
    : base.add(1, 'month').toISOString();
}

function isSandboxEvent(event: any) {
  const environment = String(event.environment ?? '').toUpperCase();
  const store = String(event.store ?? '').toUpperCase();
  return environment === 'SANDBOX' || store === 'TEST_STORE';
}

async function applyPlanPurchase(params: {
  brandId: string;
  plan: PlanKey;
  period: BillingPeriod;
  expiryDate: string;
  event: any;
  productId: string;
  transactionId: string;
  eventType: string;
}) {
  const { brandId, plan, period, expiryDate, event, productId, transactionId, eventType } = params;

  const eventId = String(event.id ?? transactionId ?? `${brandId}_${productId}_${eventType}_${expiryDate}`);
  const chargeId = `revenuecat_${eventId}`;

  const { data: existingLog } = await supabaseAdmin
    .from('payment_logs')
    .select('id, status')
    .eq('charge_id', chargeId)
    .maybeSingle();

  if (existingLog?.status === 'successful') {
    console.log(`[RevenueCat] Already processed ${chargeId}`);
    return;
  }

  const { data: brand, error: brandError } = await supabaseAdmin
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .single();

  if (brandError || !brand) {
    throw new Error(`Brand not found for RevenueCat app_user_id: ${brandId}`);
  }

  const expiryColumn = expiryColumnFor(plan);
  const currentExpiry = brand[expiryColumn] ? dayjs(brand[expiryColumn]) : null;
  const incomingExpiry = dayjs(expiryDate);
  const shouldStackSandboxPurchase =
    eventType === 'INITIAL_PURCHASE' &&
    isSandboxEvent(event) &&
    currentExpiry &&
    currentExpiry.isAfter(incomingExpiry.subtract(1, period === 'yearly' ? 'year' : 'month'));
  const nextExpiry = shouldStackSandboxPurchase
    ? currentExpiry.add(1, period === 'yearly' ? 'year' : 'month').toISOString()
    : currentExpiry && currentExpiry.isAfter(incomingExpiry)
      ? currentExpiry.toISOString()
      : incomingExpiry.toISOString();

  const { error: expiryUpdateError } = await supabaseAdmin
    .from('brands')
    .update({
      [expiryColumn]: nextExpiry,
      updated_at: new Date().toISOString(),
    })
    .eq('id', brandId);

  if (expiryUpdateError) throw expiryUpdateError;

  const { data: updatedBrand } = await supabaseAdmin
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .single();

  const effectivePlan = calculateEffectivePlan(updatedBrand);
  const bonusCoins = await calculateBonusCoins(plan, period);

  await supabaseAdmin
    .from('brands')
    .update({
      plan: effectivePlan,
      coins: (updatedBrand.coins || 0) + bonusCoins,
    })
    .eq('id', brandId);

  if (bonusCoins > 0) {
    await supabaseAdmin.from('coin_logs').insert({
      brand_id: brandId,
      amount: bonusCoins,
      action: 'plan_bonus',
      details: `RevenueCat bonus for ${plan.toUpperCase()} (${period})`,
    });
  }

  const amount = Math.round(Number(event.price ?? event.price_in_purchased_currency ?? 0) * 100);
  const paymentLog = {
    brand_id: brandId,
    charge_id: chargeId,
    amount,
    status: 'successful',
    payment_method: event.store ? `revenuecat_${String(event.store).toLowerCase()}` : 'revenuecat',
    type: 'upgrade_plan',
    plan_detail: plan,
    period,
  };

  if (existingLog) {
    await supabaseAdmin.from('payment_logs').update(paymentLog).eq('charge_id', chargeId);
  } else {
    await supabaseAdmin.from('payment_logs').insert(paymentLog);
  }

  console.log(`[RevenueCat] Upgraded ${brandId} to ${plan} (${period})`);
}

async function logRevenueCatEvent(
  event: any,
  brandId: string,
  productId: string,
  transactionId: string,
  eventType: string
) {
  const eventId = String(event.id ?? transactionId ?? `${brandId}_${productId}_${eventType}`);
  const chargeId = `revenuecat_${eventId}`;

  const { data: existingLog } = await supabaseAdmin
    .from('payment_logs')
    .select('id')
    .eq('charge_id', chargeId)
    .maybeSingle();

  if (existingLog) return;

  const plan = inferPlan(event, productId);
  const period = inferPeriod(event, productId);
  const amount = Math.round(Number(event.price ?? event.price_in_purchased_currency ?? 0) * 100);

  await supabaseAdmin.from('payment_logs').insert({
    brand_id: brandId,
    charge_id: chargeId,
    amount,
    status: eventType === 'BILLING_ISSUE' ? 'failed' : 'pending',
    payment_method: event.store ? `revenuecat_${String(event.store).toLowerCase()}` : 'revenuecat',
    type: 'upgrade_plan',
    plan_detail: plan ?? productId ?? 'unknown',
    period: period ?? 'unknown',
  });
}

async function refreshEffectivePlan(brandId: string) {
  const { data: brand, error } = await supabaseAdmin
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .single();

  if (error || !brand) return;

  await supabaseAdmin
    .from('brands')
    .update({ plan: calculateEffectivePlan(brand), updated_at: new Date().toISOString() })
    .eq('id', brandId);
}

function expiryColumnFor(plan: PlanKey) {
  if (plan === 'basic') return 'expiry_basic';
  if (plan === 'pro') return 'expiry_pro';
  return 'expiry_ultimate';
}

function calculateEffectivePlan(brand: any) {
  const now = dayjs();
  if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) return 'ultimate';
  if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) return 'pro';
  if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) return 'basic';
  return 'free';
}

async function calculateBonusCoins(plan: PlanKey, period: BillingPeriod) {
  const { data } = await supabaseAdmin
    .from('subscription_plans')
    .select('coins_monthly, coins_yearly')
    .eq('plan_key', plan)
    .single();

  if (!data) return 0;
  return Number(period === 'yearly' ? data.coins_yearly : data.coins_monthly) || 0;
}
