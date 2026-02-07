// app/api/webhooks/omise/route.ts
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
// Helper Functions (สำหรับการคำนวณวันหมดอายุ)
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

// ----------------------------------------------------------------------
// ⚡ MAIN WEBHOOK LOGIC
// ----------------------------------------------------------------------

export async function POST(req: NextRequest) {
    try {
        const event = await req.json();

        // เราสนใจแค่ Event ที่บอกว่าการตัดเงิน "จบแล้ว" (ไม่ว่าจะสำเร็จหรือล้มเหลว)
        if (event.key === 'charge.complete') {
            const rawCharge = event.data;

            // 🛑 SECURITY CHECKPOINT
            const charge = await new Promise<any>((resolve, reject) => {
                omise.charges.retrieve(rawCharge.id, (err, resp) => {
                    if (err) reject(err);
                    else resolve(resp);
                });
            });

            // ⚠️ ใช้ SERVICE_ROLE_KEY
            const supabaseAdmin = createClient(
                process.env.SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // =================================================================
            // ✅ LOGGING UPDATE
            // =================================================================
            const { error: logError } = await supabaseAdmin
                .from('payment_logs')
                .update({
                    status: charge.status,
                    error_message: charge.failure_message || null
                })
                .eq('charge_id', charge.id);

            if (logError) console.error('⚠️ Failed to update payment_logs:', logError);
            else console.log(`📝 Log updated for charge ${charge.id} -> ${charge.status}`);

            // =================================================================
            // 🛑 CHECK STATUS
            // =================================================================
            if (charge.status !== 'successful') {
                console.log(`⚠️ Charge ${charge.id} failed: ${charge.failure_message}`);
                return NextResponse.json({ message: 'Charge failed (Logged)' });
            }

            const metadata = charge.metadata || {};

            // 🛡️ ป้องกันการทำงานซ้ำ
            if (metadata.is_processed === 'true') {
                console.log(`⚠️ Transaction ${charge.id} already processed.`);
                return NextResponse.json({ message: 'Already processed' });
            }

            // =================================================================
            // CASE 1: UPGRADE PLAN (สมัครแพ็กเกจ)
            // =================================================================
            if (metadata.type === 'upgrade_plan' && metadata.brand_id) {
                const { brand_id, new_plan, period } = metadata;

                // 1. ดึงข้อมูล Brand
                const { data: brand } = await supabaseAdmin.from('brands').select('*').eq('id', brand_id).single();
                if (!brand) throw new Error(`Brand ID ${brand_id} not found`);

                // 2. คำนวณวันหมดอายุ
                let updateData: any = { updated_at: new Date().toISOString() };
                if (new_plan === 'basic') updateData.expiry_basic = calculateNewExpiryForTier(brand.expiry_basic, period);
                else if (new_plan === 'pro') updateData.expiry_pro = calculateNewExpiryForTier(brand.expiry_pro, period);
                else if (new_plan === 'ultimate') updateData.expiry_ultimate = calculateNewExpiryForTier(brand.expiry_ultimate, period);

                // 3. อัปเดต Database
                const { error: updateError } = await supabaseAdmin.from('brands').update(updateData).eq('id', brand_id);
                if (updateError) throw updateError;

                // 4. อัปเดต Plan
                const { data: updatedBrand } = await supabaseAdmin.from('brands').select('*').eq('id', brand_id).single();
                const effectivePlan = calculateEffectivePlan(updatedBrand);
                await supabaseAdmin.from('brands').update({ plan: effectivePlan }).eq('id', brand_id);

                console.log(`✅ Webhook Success: Upgraded brand ${brand_id} to ${new_plan}`);

                await markAsProcessed(charge.id, metadata);
            }

            // =================================================================
            // CASE 2: BUY THEME (ซื้อธีม)
            // =================================================================
            else if (metadata.type === 'buy_theme' && metadata.brand_id && metadata.theme_id) {

                const { brand_id, theme_id, plan } = metadata;

                // ✅✅✅ 1. ย้ายมาตรวจสอบตรงนี้ (หลังจากได้ brand_id, theme_id แล้ว) ✅✅✅
                const { data: existing } = await supabaseAdmin
                    .from('themes')
                    .select('purchase_type')
                    .eq('brand_id', brand_id)
                    .eq('marketplace_theme_id', theme_id)
                    .single();

                // ✅✅✅ 2. ถ้าเขามี Lifetime อยู่แล้ว ไม่ต้องทำอะไรต่อ ✅✅✅
                if (existing?.purchase_type === 'lifetime') {
                    console.log(`🛡️ Brand ${brand_id} already has lifetime. Skipping update.`);
                    await markAsProcessed(charge.id, metadata);
                    return NextResponse.json({ message: 'Lifetime preserved' });
                }
                // ----------------------------------------------------------

                // คำนวณวันหมดอายุ
                let finalPurchaseType = plan || 'lifetime';
                let finalExpiresAt = null;

                if (finalPurchaseType === 'monthly') {
                    finalExpiresAt = dayjs().add(30, 'day').toISOString();
                }

                const { error } = await supabaseAdmin.from('themes').upsert({
                    brand_id: brand_id,
                    marketplace_theme_id: theme_id,
                    purchase_type: finalPurchaseType,
                    expires_at: finalExpiresAt,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'brand_id, marketplace_theme_id' }); // ใช้ composite key

                if (error) throw error;

                console.log(`✅ Webhook Success: Bought theme ${theme_id} (${finalPurchaseType}) for brand ${brand_id}`);

                await markAsProcessed(charge.id, metadata);
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('❌ Webhook Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Helper: แจ้งกลับ Omise ว่ารายการนี้ Process แล้ว
async function markAsProcessed(chargeId: string, metadata: any) {
    try {
        await new Promise((resolve) => {
            omise.charges.update(chargeId, {
                metadata: { ...metadata, is_processed: 'true' }
            } as any, resolve);
        });
        console.log('✅ Marked as processed in Omise');
    } catch (omiseError) {
        console.error('⚠️ Failed to update Omise metadata:', omiseError);
    }
}