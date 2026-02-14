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
// Helper Functions (คงเดิม ห้ามแก้!)
// ----------------------------------------------------------------------

function calculateNewExpiryForTier(currentExpiry: string | null, period: string) {
    const now = dayjs();
    let baseDate = now;
    if (currentExpiry) {
        const oldExpiry = dayjs(currentExpiry);
        if (oldExpiry.isAfter(now)) baseDate = oldExpiry;
    }
    // Logic เดิมของ Plan ร้านค้า: รองรับแค่ 'monthly' กับ 'yearly'
    return period === 'monthly' ? baseDate.add(30, 'day').toISOString() : baseDate.add(1, 'year').toISOString();
}

function calculateEffectivePlan(brand: any) {
    const now = dayjs();
    if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) return 'ultimate';
    if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) return 'pro';
    if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) return 'basic';
    return 'free';
}

// ----------------------------------------------------------------------
// ⚡ MAIN WEBHOOK LOGIC
// ----------------------------------------------------------------------

export async function POST(req: NextRequest) {
    try {
        const event = await req.json();

        if (event.key === 'charge.complete') {
            const rawCharge = event.data;

            // 🛑 1. Security Check
            const charge = await new Promise<any>((resolve, reject) => {
                omise.charges.retrieve(rawCharge.id, (err, resp) => {
                    if (err) reject(err);
                    else resolve(resp);
                });
            });

            // ⚠️ ใช้ SERVICE_ROLE_KEY เท่านั้น
            const supabaseAdmin = createClient(
                process.env.SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // ✅ Update Payment Log
            await supabaseAdmin.from('payment_logs').update({
                status: charge.status,
                error_message: charge.failure_message || null
            }).eq('charge_id', charge.id);

            if (charge.status !== 'successful') {
                return NextResponse.json({ message: 'Charge failed (Logged)' });
            }

            const metadata = charge.metadata || {};

            if (metadata.is_processed === 'true') {
                return NextResponse.json({ message: 'Already processed' });
            }

            // =================================================================
            // 🟢 CASE 1: UPGRADE PLAN (สมัครสมาชิก Brand - Logic เดิม 100%)
            // =================================================================
            if (metadata.type === 'upgrade_plan' && metadata.brand_id) {
                const { brand_id, new_plan, period } = metadata;
                const { data: brand } = await supabaseAdmin.from('brands').select('*').eq('id', brand_id).single();
                
                if (brand) {
                    let updateData: any = { updated_at: new Date().toISOString() };
                    
                    // ใช้ Helper เดิม
                    if (new_plan === 'basic') updateData.expiry_basic = calculateNewExpiryForTier(brand.expiry_basic, period);
                    else if (new_plan === 'pro') updateData.expiry_pro = calculateNewExpiryForTier(brand.expiry_pro, period);
                    else if (new_plan === 'ultimate') updateData.expiry_ultimate = calculateNewExpiryForTier(brand.expiry_ultimate, period);

                    await supabaseAdmin.from('brands').update(updateData).eq('id', brand_id);
                    
                    // Update Effective Plan
                    const { data: updatedBrand } = await supabaseAdmin.from('brands').select('*').eq('id', brand_id).single();
                    const effectivePlan = calculateEffectivePlan(updatedBrand);
                    await supabaseAdmin.from('brands').update({ plan: effectivePlan }).eq('id', brand_id);

                    console.log(`✅ Upgrade Success: ${brand_id} -> ${new_plan}`);
                    await markAsProcessed(charge.id, metadata);
                }
            }

            // =================================================================
            // 🔵 CASE 2: BUY THEME (ซื้อธีม - แก้ไขใหม่ รองรับ Weekly!)
            // =================================================================
            else if (metadata.type === 'buy_theme' && metadata.brand_id && metadata.theme_id) {

                const { brand_id, theme_id, plan } = metadata; 
                // plan ที่รับมา: 'weekly', 'monthly', 'yearly' หรือ 'lifetime'

                // 1. ดึงข้อมูลธีมเดิม (เพื่อทำ Top-up บวกวันเพิ่ม)
                const { data: existing } = await supabaseAdmin
                    .from('themes')
                    .select('expires_at, purchase_type')
                    .eq('brand_id', brand_id)
                    .eq('marketplace_theme_id', theme_id)
                    .single();

                // 🛑 ถ้าของเดิมเป็น Lifetime อยู่แล้ว ห้ามทับ!
                if (existing?.purchase_type === 'lifetime') {
                    console.log(`🛡️ Lifetime preserved for brand ${brand_id}`);
                    await markAsProcessed(charge.id, metadata);
                    return NextResponse.json({ message: 'Lifetime preserved' });
                }

                // 2. ตั้งต้นวันที่จะบวก
                const now = dayjs();
                let baseDate = now;

                // ถ้ามีวันเหลืออยู่ ให้เริ่มนับต่อจากวันเดิม (Top-up Logic)
                if (existing?.expires_at && dayjs(existing.expires_at).isAfter(now)) {
                    baseDate = dayjs(existing.expires_at);
                }

                // ✅✅✅ ส่วนที่แก้: เพิ่ม Switch Case คำนวณวันให้ครบ ✅✅✅
                let daysToAdd = 30; // Default
                let finalPurchaseType = plan || 'monthly'; // ถ้า plan หลุดมาว่างๆ ให้เป็น monthly

                if (plan === 'weekly') {
                    daysToAdd = 7;
                } else if (plan === 'monthly') {
                    daysToAdd = 30;
                } else if (plan === 'yearly') {
                    daysToAdd = 365;
                } else if (plan === 'lifetime') {
                    daysToAdd = 36500; // 100 ปี
                    finalPurchaseType = 'lifetime';
                }

                // คำนวณวันจบ
                let finalExpiresAt = baseDate.add(daysToAdd, 'day').toISOString();
                
                // กรณี Lifetime ให้วันที่เป็น null หรือยาวนานมากๆ (ที่นี่เลือกยาวนานเพื่อให้ Logic อื่นทำงานง่าย)
                if (finalPurchaseType === 'lifetime') {
                    finalExpiresAt = baseDate.add(100, 'year').toISOString(); 
                }

                // 3. บันทึกลงตาราง themes
                const { error } = await supabaseAdmin.from('themes').upsert({
                    brand_id: brand_id,
                    marketplace_theme_id: theme_id,
                    purchase_type: finalPurchaseType, 
                    expires_at: finalExpiresAt, // ✅ ค่านี้จะมีค่าเสมอ ไม่ NULL
                    updated_at: new Date().toISOString()
                }, { onConflict: 'brand_id, marketplace_theme_id' });

                if (error) {
                    console.error("❌ Failed to upsert theme:", error);
                    throw error;
                }

                console.log(`✅ Theme Bought: ${finalPurchaseType} (+${daysToAdd} days)`);
                await markAsProcessed(charge.id, metadata);
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('❌ Webhook Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
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