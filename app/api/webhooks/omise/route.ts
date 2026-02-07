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

        if (event.key === 'charge.complete') {
            const rawCharge = event.data;

            // 🛑 SECURITY CHECKPOINT: อย่าเพิ่งเชื่อ data จาก event ทันที
            // ✅ Double Check: เอา ID ไปถาม Omise โดยตรงว่าจ่ายจริงไหม?
            const charge = await new Promise<any>((resolve, reject) => {
                omise.charges.retrieve(rawCharge.id, (err, resp) => {
                    if (err) reject(err);
                    else resolve(resp);
                });
            });
            
            // ✅ ตรวจสอบสถานะจากข้อมูลที่เพิ่งดึงมาสดๆ (Real Source of Truth)
            if (charge.status !== 'successful') {
                console.log(`⚠️ Fake or Failed Webhook attempt for ID: ${rawCharge.id}`);
                return NextResponse.json({ message: 'Charge verification failed' });
            }

            const metadata = charge.metadata || {};

            // 🛡️ ป้องกันการทำงานซ้ำ: ถ้าทำไปแล้ว ให้จบเลย
            if (metadata.is_processed === 'true') {
                console.log(`⚠️ Transaction ${charge.id} already processed.`);
                return NextResponse.json({ message: 'Already processed' });
            }

            // ⚠️ ใช้ SERVICE_ROLE_KEY เพื่อแก้ไข DB ได้โดยไม่ต้อง Login
            const supabaseAdmin = createClient(
                process.env.SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY! 
            );

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

                // Mark as processed
                await markAsProcessed(charge.id, metadata);
            }

            // =================================================================
            // CASE 2: BUY THEME (ซื้อธีม)
            // =================================================================
           else if (metadata.type === 'buy_theme' && metadata.brand_id && metadata.theme_id) {
                
                const { brand_id, theme_id, plan } = metadata; // ✅ รับค่า plan มาด้วย

                // คำนวณวันหมดอายุ
                let finalPurchaseType = plan || 'lifetime'; // ถ้าไม่มีให้เป็น lifetime ไว้ก่อน (กันเหนียว)
                let finalExpiresAt = null;

                // ✅ ถ้าเป็น monthly ให้บวกไป 30 วัน
                if (finalPurchaseType === 'monthly') {
                    finalExpiresAt = dayjs().add(30, 'day').toISOString();
                } 
                // ถ้าเป็น lifetime ค่า finalExpiresAt จะเป็น null (ถูกต้องแล้ว)

                const { error } = await supabaseAdmin.from('themes').upsert({
                    brand_id: brand_id,
                    marketplace_theme_id: theme_id,
                    purchase_type: finalPurchaseType, // ✅ บันทึกประเภทที่ถูกต้อง
                    expires_at: finalExpiresAt,       // ✅ บันทึกวันหมดอายุ (หรือ null)
                    updated_at: new Date().toISOString()
                }, { onConflict: 'brand_id, marketplace_theme_id' });

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