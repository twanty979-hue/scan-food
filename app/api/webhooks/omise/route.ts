// api/webhooks/omise/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import Omise from 'omise';

// Config Omise
const omise = Omise({
    publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!,
    secretKey: process.env.OMISE_SECRET_KEY!,
});

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

function calculateNewExpiryForTier(currentExpiry: string | null, period: string) {
    const now = dayjs();
    let baseDate = now;
    if (currentExpiry) {
        const oldExpiry = dayjs(currentExpiry);
        if (oldExpiry.isAfter(now)) baseDate = oldExpiry;
    }
    return period === 'monthly' ? baseDate.add(30, 'day').toISOString() : baseDate.add(1, 'year').toISOString();
}

function calculateEffectivePlan(brand: any) {
    const now = dayjs();
    if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) return 'ultimate';
    if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) return 'pro';
    if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) return 'basic';
    return 'free';
}

async function markAsProcessed(chargeId: string, metadata: any) {
    try {
        await new Promise((resolve) => {
            omise.charges.update(chargeId, {
                metadata: { ...metadata, is_processed: 'true' }
            } as any, resolve);
        });
    } catch (omiseError) {
        console.error('⚠️ Failed to update Omise metadata:', omiseError);
    }
}

// ----------------------------------------------------------------------
// ⚡ MAIN WEBHOOK LOGIC
// ----------------------------------------------------------------------

export async function POST(req: NextRequest) {
    try {
        const event = await req.json();

        if (event.key === 'charge.complete') {
            const rawCharge = event.data;

            // ⚠️ เชื่อมต่อ Database ด้วย Service Role
            const supabaseAdmin = createClient(
                process.env.SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // 🛑 เช็คความปลอดภัย 1: หน้าบ้านทำไปหรือยัง?
            const { data: existingLog } = await supabaseAdmin
                .from('payment_logs')
                .select('status')
                .eq('charge_id', rawCharge.id)
                .single();

            if (existingLog?.status === 'successful') {
                return NextResponse.json({ message: 'Skipped (Already Success by Frontend)' });
            }

            // ดึงข้อมูลล่าสุดจาก Omise
            const charge = await new Promise<any>((resolve, reject) => {
                omise.charges.retrieve(rawCharge.id, (err, resp) => {
                    if (err) reject(err);
                    else resolve(resp);
                });
            });

            const metadata = charge.metadata || {};

            // =================================================================
            // 🔵 CASE 2: BUY THEME (ซื้อธีม)
            // =================================================================
            if (metadata.type === 'buy_theme' && metadata.brand_id && metadata.theme_id) {

                // 🛑 1. Race Condition Check
                const freshCharge = await new Promise<any>((resolve) => {
                    omise.charges.retrieve(rawCharge.id, (err, resp) => resolve(resp || {}));
                });
                if (freshCharge?.metadata?.is_processed === 'true') {
                    return NextResponse.json({ message: 'Skipped (Already processed)' });
                }

                const { brand_id, theme_id } = metadata;

                // 🔍 2. พยายามดึงค่า plan จาก Metadata ก่อน
                // ❌ ของเดิมที่มี || 'monthly' เอาออกแล้ว!
                let plan = metadata.plan || metadata.period;

                // 🛡️ [จุดแก้ให้หายขาด] ถ้าหาจาก Metadata ไม่เจอ ให้ไปขุดจากตาราง payment_logs
                if (!plan) {
                    console.log(`🕵️ Plan missing in metadata for charge ${rawCharge.id}, searching DB...`);
                    const { data: fallbackLog } = await supabaseAdmin
                        .from('payment_logs')
                        .select('period') // เช็คจากคอลัมน์ period ใน DB
                        .eq('charge_id', rawCharge.id)
                        .single();

                    if (fallbackLog?.period) {
                        plan = fallbackLog.period;
                        console.log(`✅ Recovered plan [${plan}] from payment_logs table!`);
                    }
                }

                // --- 🧠 CALCULATOR LOGIC ---
                let daysToAdd = 18; // 🚨 เลขนำโชคสำหรับ Debug (18 วัน)
                let finalPurchaseType = plan || 'unknown_plan_error';

                // ✅ เช็ค Plan แบบเข้มงวด
                switch (plan) {
                    case 'weekly':  
                        daysToAdd = 7; 
                        break;
                    case 'monthly': 
                        daysToAdd = 30; 
                        break;
                    case 'yearly':  
                        daysToAdd = 365; 
                        break;
                    default:
                        // ❌ ถ้าไม่เจอจริงๆ ให้เป็น 18 (ห้ามเป็น 30 เด็ดขาด)
                        daysToAdd = 18; 
                        console.error(`❌ CRITICAL: Unknown plan [${plan}] - Assigned 18 days fallback`);
                }

                // --- 📝 บันทึกข้อมูลกลับลง Log (Update Status) ---
                await supabaseAdmin.from('payment_logs').upsert({
                    brand_id: brand_id,
                    charge_id: charge.id,
                    amount: charge.amount,
                    status: charge.status,
                    payment_method: charge.source?.type || 'credit_card',
                    type: 'buy_theme',
                    plan_detail: theme_id,
                    period: plan, // บันทึกค่าที่กู้คืนมาได้ลงไป
                }, { onConflict: 'charge_id' });

                if (charge.status !== 'successful') return NextResponse.json({ message: 'Failed' });

                // --- 🚀 UPDATE THEME EXPIRY ---
                const { data: existing } = await supabaseAdmin.from('themes').select('expires_at')
                    .eq('brand_id', brand_id).eq('marketplace_theme_id', theme_id).single();

                const now = dayjs();
                let baseDate = (existing?.expires_at && dayjs(existing.expires_at).isAfter(now)) 
                    ? dayjs(existing.expires_at) : now;

                const finalExpiresAt = baseDate.add(daysToAdd, 'day').toISOString();

                await supabaseAdmin.from('themes').upsert({
                    brand_id: brand_id,
                    marketplace_theme_id: theme_id,
                    purchase_type: finalPurchaseType, 
                    expires_at: finalExpiresAt,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'brand_id, marketplace_theme_id' });

                console.log(`✅ Webhook Theme Success: Plan=${finalPurchaseType}, Added=${daysToAdd} days`);
                await markAsProcessed(charge.id, metadata);
            }

            // =================================================================
            // 🟢 CASE 1: UPGRADE PLAN (สมัครสมาชิกร้านค้า)
            // =================================================================
            else if (metadata.type === 'upgrade_plan' && metadata.brand_id) {
                const { brand_id, new_plan, period } = metadata;

                // บันทึก Log สำหรับ Upgrade Plan
                await supabaseAdmin.from('payment_logs').upsert({
                    brand_id: brand_id,
                    charge_id: charge.id,
                    amount: charge.amount,
                    currency: charge.currency,
                    status: charge.status,
                    payment_method: charge.source?.type || 'credit_card',
                    type: 'upgrade_plan',
                    plan_detail: new_plan,
                    period: period,
                    error_message: charge.failure_message || null
                }, { onConflict: 'charge_id' });

                if (charge.status !== 'successful') return NextResponse.json({ message: 'Failed' });

                const { data: brand } = await supabaseAdmin.from('brands').select('*').eq('id', brand_id).single();
                if (brand) {
                    let updateData: any = { updated_at: new Date().toISOString() };
                    if (new_plan === 'basic') updateData.expiry_basic = calculateNewExpiryForTier(brand.expiry_basic, period);
                    else if (new_plan === 'pro') updateData.expiry_pro = calculateNewExpiryForTier(brand.expiry_pro, period);
                    else if (new_plan === 'ultimate') updateData.expiry_ultimate = calculateNewExpiryForTier(brand.expiry_ultimate, period);

                    await supabaseAdmin.from('brands').update(updateData).eq('id', brand_id);
                    
                    const { data: updatedBrand } = await supabaseAdmin.from('brands').select('*').eq('id', brand_id).single();
                    const effectivePlan = calculateEffectivePlan(updatedBrand);
                    await supabaseAdmin.from('brands').update({ plan: effectivePlan }).eq('id', brand_id);

                    await markAsProcessed(charge.id, metadata);
                }
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('❌ Webhook Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}