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

// ----------------------------------------------------------------------
// ⚡ MAIN WEBHOOK LOGIC
// ----------------------------------------------------------------------

export async function POST(req: NextRequest) {
    try {
        const event = await req.json();

        if (event.key === 'charge.complete') {
            const rawCharge = event.data;

            // ⚠️ ใช้ SERVICE_ROLE_KEY
            const supabaseAdmin = createClient(
                process.env.SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // 🛑 เช็คก่อนเลย: "รายการนี้ Frontend ทำไปหรือยัง?"
            // ถ้าสถานะใน DB เป็น successful แล้ว แปลว่าหน้าเว็บทำเสร็จแล้ว -> Webhook จบงานได้เลย
            const { data: existingLog } = await supabaseAdmin
                .from('payment_logs')
                .select('status')
                .eq('charge_id', rawCharge.id)
                .single();

            if (existingLog?.status === 'successful') {
                console.log(`✨ Skipped: Charge ${rawCharge.id} was already handled by Frontend.`);
                return NextResponse.json({ message: 'Skipped (Already Success)' });
            }

            // --------------------------------------------------------------
            // ถ้ายังไม่เสร็จ (เช่น ลูกค้าปิดจอหนี) -> Webhook ค่อยทำงานต่อจากตรงนี้
            // --------------------------------------------------------------

            // 1. ตรวจสอบสถานะกับ Omise อีกครั้ง
            const charge = await new Promise<any>((resolve, reject) => {
                omise.charges.retrieve(rawCharge.id, (err, resp) => {
                    if (err) reject(err);
                    else resolve(resp);
                });
            });

            // อัปเดต Log
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
            // CASE 1: UPGRADE PLAN
            // =================================================================
            if (metadata.type === 'upgrade_plan' && metadata.brand_id) {
                const { brand_id, new_plan, period } = metadata;
                const { data: brand } = await supabaseAdmin.from('brands').select('*').eq('id', brand_id).single();
                if (!brand) throw new Error(`Brand ID ${brand_id} not found`);

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

            // =================================================================
            // CASE 2: BUY THEME (Logic คำนวณวัน)
            // =================================================================
            else if (metadata.type === 'buy_theme' && metadata.brand_id && metadata.theme_id) {

                const { brand_id, theme_id, plan } = metadata; 
                
                // ดึงข้อมูลเดิม (Top-up)
                const { data: existing } = await supabaseAdmin
                    .from('themes')
                    .select('expires_at, purchase_type')
                    .eq('brand_id', brand_id)
                    .eq('marketplace_theme_id', theme_id)
                    .single();

                if (existing?.purchase_type === 'lifetime') {
                    await markAsProcessed(charge.id, metadata);
                    return NextResponse.json({ message: 'Lifetime preserved' });
                }

                // คำนวณวัน
                const now = dayjs();
                let baseDate = now;
                if (existing?.expires_at && dayjs(existing.expires_at).isAfter(now)) {
                    baseDate = dayjs(existing.expires_at);
                }

                let daysToAdd = 30; // Default
                // ✅ ใช้ plan จาก metadata ชัวร์ๆ
                if (plan === 'weekly') daysToAdd = 7;
                else if (plan === 'monthly') daysToAdd = 30;
                else if (plan === 'yearly') daysToAdd = 365;
                
                const finalExpiresAt = baseDate.add(daysToAdd, 'day').toISOString();
                const finalPurchaseType = plan || 'monthly'; 

                await supabaseAdmin.from('themes').upsert({
                    brand_id: brand_id,
                    marketplace_theme_id: theme_id,
                    purchase_type: finalPurchaseType, 
                    expires_at: finalExpiresAt,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'brand_id, marketplace_theme_id' });

                console.log(`✅ Webhook Theme: Added ${daysToAdd} days`);
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