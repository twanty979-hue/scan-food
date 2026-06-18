// app/actions/settingsActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js'; 
import { cookies } from 'next/headers';
import dayjs from 'dayjs';

import { createPaymentLog, updatePaymentLogStatus } from './logActions'; 

// 🚨 นำเข้า Key และ Merchant ID ของ Beam
const BEAM_SECRET_KEY = process.env.BEAM_SECRET_KEY!;
const BEAM_MERCHANT_ID = process.env.BEAM_MERCHANT_ID!;

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );
}

async function calculatePriceFromDB(brandId: string, planKey: string, period: 'monthly' | 'yearly'): Promise<number> {
  const { data: plan, error: planError } = await supabaseAdmin
    .from('subscription_plans')
    .select('*')
    .eq('plan_key', planKey)
    .eq('is_active', true)
    .single();
      
  if (planError || !plan) throw new Error(`ไม่พบข้อมูลแพ็กเกจราคา: ${planKey}`);

  const { count, error: logError } = await supabaseAdmin
    .from('payment_logs')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brandId)
    .eq('status', 'successful');

  if (logError) throw new Error("ไม่สามารถตรวจสอบประวัติการชำระเงินได้");

  const isFirstTime = !count || count === 0;

  if (period === 'monthly') {
      if (isFirstTime && plan.first_time_price_monthly !== null && plan.first_time_price_monthly !== undefined) return Number(plan.first_time_price_monthly);
      return Number(plan.price_monthly);
  } else {
      if (isFirstTime && plan.first_time_price_yearly !== null && plan.first_time_price_yearly !== undefined) return Number(plan.first_time_price_yearly);
      return Number(plan.price_yearly);
  }
}

function calculateEffectivePlan(brand: any) {
    const now = dayjs();
    if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) return 'ultimate';
    if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) return 'pro';
    if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) return 'basic';
    return 'free'; 
}

function calculateNewExpiryForTier(currentExpiry: string | null, period: 'monthly' | 'yearly') {
    const now = dayjs();
    let baseDate = now;
    if (currentExpiry) {
        const oldExpiry = dayjs(currentExpiry);
        if (oldExpiry.isAfter(now)) baseDate = oldExpiry;
    }
    return period === 'monthly' ? baseDate.add(30, 'day').toISOString() : baseDate.add(1, 'year').toISOString();
}

export async function getAvailablePlansAction(brandId: string) {
    try {
        const { data: plans, error: planError } = await supabaseAdmin
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('price_monthly', { ascending: true });

        if (planError) throw planError;

        const { count } = await supabaseAdmin
            .from('payment_logs')
            .select('*', { count: 'exact', head: true })
            .eq('brand_id', brandId)
            .eq('status', 'successful');

        return { success: true, plans, isFirstTime: !count || count === 0 };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getBrandSettingsAction() {
  const supabase = await getSupabase();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    
    const { data: profile } = await supabase.from('profiles').select('brand_id, role').eq('id', user.id).single();
    if (!profile?.brand_id) throw new Error("No brand assigned");
    
    const { data: brand } = await supabase.from('brands').select('*').eq('id', profile.brand_id).single();
    const effectivePlan = calculateEffectivePlan(brand);
    
    if (brand.plan !== effectivePlan) {
        await supabase.from('brands').update({ plan: effectivePlan }).eq('id', profile.brand_id);
        brand.plan = effectivePlan; 
    }

    return { success: true, brand, brandId: profile.brand_id, isOwner: profile.role === 'owner' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBrandSettingsAction(brandId: string, payload: any) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('brand_id, role').eq('id', user.id).single();
    if (!profile || profile.brand_id !== brandId || profile.role !== 'owner') throw new Error("Unauthorized");

    const { data: currentBrand } = await supabase
        .from('brands')
        .select('config, table_qr_mode')
        .eq('id', brandId)
        .single();

    const updateData: any = {
        name: payload.name, phone: payload.phone, address: payload.address,
        promptpay_number: payload.promptpay_number, logo_url: payload.logo_url, qr_image_url: payload.qr_image_url,
        updated_at: new Date().toISOString()
    };

    if (payload.qr_mode !== undefined) {
        updateData.table_qr_mode = payload.qr_mode === 'static' ? 'static' : 'rotating';
        updateData.config = {
            ...(currentBrand?.config || {}),
            qr_mode: updateData.table_qr_mode
        };
    }
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { error } = await supabase.from('brands').update(updateData).eq('id', brandId);
    if (error) throw error;
    return { success: true };
}

// ======================================================================
// 💳 BEAM PAYMENT ACTIONS (อัปเดต API Endpoint & โครงสร้างข้อมูล)
// ======================================================================

export async function createBeamCheckoutAction(
    brandId: string, 
    newPlan: string, 
    period: 'monthly' | 'yearly',
    successUrl: string, 
    cancelUrl: string
) {
  const supabase = await getSupabase();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: brand } = await supabase.from('brands').select('*').eq('id', brandId).single();
    if (!brand) throw new Error("Brand not found");

    const amount = await calculatePriceFromDB(brandId, newPlan, period);
    
    // ดักจับกรณี 0 บาท (Free Plan)
    if (amount === 0) {
       const freeRes = await processFreeUpgradeFromApi(brandId, newPlan, period);
       if (freeRes.success) return { success: true, isFree: true };
       throw new Error(freeRes.error);
    }

    const SECRET_KEY = process.env.BEAM_SECRET_KEY;
    const MERCHANT_ID = process.env.BEAM_MERCHANT_ID;

    if (!SECRET_KEY || !MERCHANT_ID) {
        throw new Error("ตั้งค่า BEAM_MERCHANT_ID หรือ BEAM_SECRET_KEY ใน .env ไม่ครบ");
    }

    const orderReferenceId = `beam_${brandId}_${Date.now()}`;

    // 🚨 ไฮไลท์: เพิ่ม paymentMethods บังคับให้เป็น promptpay เท่านั้น
    const payload = {
        order: {
            netAmount: amount,
            currency: "THB",
            description: `Upgrade ${newPlan.toUpperCase()} (${period})`,
            referenceId: orderReferenceId
        },
        paymentMethods: ["promptpay"], // 🎯 บังคับให้โชว์แค่พร้อมเพย์
        redirectUrl: successUrl
    };

    // 🔐 เข้าสู่ระบบด้วย Basic Auth
    const authString = Buffer.from(`${MERCHANT_ID}:${SECRET_KEY}`).toString('base64');
    const BEAM_PRODUCTION_ENDPOINT = 'https://api.beamcheckout.com/api/v1/payment-links';

    const response = await fetch(BEAM_PRODUCTION_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${authString}`,
            'Idempotency-Key': orderReferenceId 
        },
        body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error(`เซิร์ฟเวอร์ Beam ตอบกลับผิดพลาด: ${text.substring(0, 40)}...`);
    }

    if (!response.ok) {
        console.error("❌ Beam API Error Details:", data);
        throw new Error(data.message || "การส่งขอลิงก์ชำระเงินถูกปฏิเสธจาก Beam");
    }

    // บันทึก Log ลง Database
    await createPaymentLog({
        brand_id: brandId,
        charge_id: orderReferenceId, 
        amount: amount,
        status: 'pending',
        payment_method: 'beam_checkout',
        type: 'upgrade_plan',
        plan_detail: newPlan,
        period: period
    });

    // สำเร็จ! คืนค่า URL ไปให้หน้าเว็บ
    const checkoutUrl = data.paymentUrl || data.url; 
    return { success: true, isFree: false, checkoutUrl: checkoutUrl };

  } catch (error: any) {
    console.error("Beam Production Error:", error);
    return { success: false, error: error.message };
  }
}

export async function checkPaymentStatusAction(brandId: string, chargeId: string) {
  try {
      const { data: log, error } = await supabaseAdmin
          .from('payment_logs')
          .select('status')
          .eq('charge_id', chargeId)
          .single();

      if (error || !log) return { status: 'pending' };
      if (log.status === 'successful') return { status: 'successful' };
      if (log.status === 'failed') return { status: 'failed' };
      
      return { status: 'pending' };
  } catch (error: any) {
      return { status: 'error', error: error.message };
  }
}

export async function processFreeUpgradeFromApi(
    brandId: string, 
    newPlan: string, 
    period: 'monthly' | 'yearly'
) {
    try {
        const { data: brand } = await supabaseAdmin.from('brands').select('*').eq('id', brandId).single();
        if (!brand) throw new Error("Brand not found");

        let updateData: any = { updated_at: new Date().toISOString() };
        if (newPlan === 'basic') updateData.expiry_basic = calculateNewExpiryForTier(brand.expiry_basic, period);
        else if (newPlan === 'pro') updateData.expiry_pro = calculateNewExpiryForTier(brand.expiry_pro, period);
        else if (newPlan === 'ultimate') updateData.expiry_ultimate = calculateNewExpiryForTier(brand.expiry_ultimate, period);

        await supabaseAdmin.from('brands').update(updateData).eq('id', brandId);

        const { data: updatedBrand } = await supabaseAdmin.from('brands').select('*').eq('id', brandId).single();
        const effectivePlan = calculateEffectivePlan(updatedBrand);
        
        const { data: planData } = await supabaseAdmin.from('subscription_plans').select('coins_monthly, coins_yearly').eq('plan_key', newPlan).single();
        let bonusCoins = planData ? (period === 'monthly' ? planData.coins_monthly : planData.coins_yearly) : 0;

        await supabaseAdmin.from('brands').update({ 
            plan: effectivePlan, 
            coins: (updatedBrand.coins || 0) + bonusCoins 
        }).eq('id', brandId);

        if (bonusCoins > 0) {
            await supabaseAdmin.from('coin_logs').insert({ 
                brand_id: brandId, amount: bonusCoins, action: 'plan_bonus', details: `Bonus for upgrading to ${newPlan.toUpperCase()} (Free Promo)` 
            });
        }

        await supabaseAdmin.from('payment_logs').insert({
            brand_id: brandId, charge_id: `promo_${newPlan}_${Date.now()}`, amount: 0, status: 'successful', payment_method: 'system_promo', type: 'upgrade_plan', plan_detail: newPlan, period: period
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    } 
}
