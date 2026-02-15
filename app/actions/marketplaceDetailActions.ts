// app/actions/marketplaceDetailActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Omise from 'omise';
import dayjs from 'dayjs';
import { canAccessTheme } from '@/lib/planConfig'; // ตรวจสอบ path นี้ว่าถูกต้องนะครับ

const omise = Omise({
    publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!,
    secretKey: process.env.OMISE_SECRET_KEY!,
});

async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        { cookies: { get(name) { return cookieStore.get(name)?.value } } }
    );
}

function calculateEffectivePlan(brand: any) {
    const now = dayjs();
    if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) return 'ultimate';
    if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) return 'pro';
    if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) return 'basic';
    return 'free'; 
}

// ------------------------------------------------------------------
// Helper: แปะป้ายบอก Omise ว่า "ทำรายการนี้แล้ว" (กัน Webhook ทำซ้ำ)
// ------------------------------------------------------------------
async function markOmiseAsProcessed(chargeId: string, metadata: any) {
    try {
        await new Promise((resolve) => {
            omise.charges.update(chargeId, {
                metadata: { ...metadata, is_processed: 'true' }
            } as any, resolve);
        });
    } catch (e) {
        console.error("Failed to mark Omise as processed:", e);
    }
}

// --- Action 1: getThemeDetailAction (ดึงข้อมูลธีมปกติ) ---
export async function getThemeDetailAction(themeId: string) {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: profile } = await supabase.from('profiles').select('role, brand_id, brands(*)').eq('id', user.id).single();
        if (!profile?.brand_id) throw new Error("No brand assigned");

        const brandData = profile.brands as any;
        const currentPlan = calculateEffectivePlan(brandData);

        const { data: themeData } = await supabase
            .from('marketplace_themes')
            .select('*, min_plan, marketplace_categories(name)') 
            .eq('id', themeId)
            .single();

        if (!themeData) throw new Error('Theme not found');
        const { data: owned } = await supabase.from('themes').select('*').eq('brand_id', profile.brand_id).eq('marketplace_theme_id', themeId).single();

        return { success: true, theme: themeData, isOwned: !!owned, ownedData: owned, isOwner: profile.role === 'owner', currentPlan };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ------------------------------------------------------------------
// ✅ Action 2: installThemeAction (ตัวแก้หลัก: ซื้อ 7 ได้ 7, ซื้อ 30 ได้ 30)
export async function installThemeAction(marketplaceThemeId: string, chargeId: string | null, plan: 'weekly' | 'monthly' | 'yearly') {
    const supabase = await getSupabase();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");
        
        const { data: profile } = await supabase.from('profiles').select('role, brand_id').eq('id', user.id).single();
        if (!profile?.brand_id || profile.role !== 'owner') throw new Error("Permission denied");
        const brandId = profile.brand_id;

        const { data: themeData } = await supabase.from('marketplace_themes').select('*').eq('id', marketplaceThemeId).single();
        const { data: brand } = await supabase.from('brands').select('*').eq('id', brandId).single();
        if (!themeData || !brand) throw new Error("Data not found");

        const currentBrandPlan = calculateEffectivePlan(brand);
        const hasRightAccess = canAccessTheme(currentBrandPlan, themeData.min_plan);

        let finalPurchaseType = '';
        let finalExpiresAt = '';

        // 🔥 กรณีที่ 1: "จ่ายเงินซื้อเพิ่ม" (มี chargeId)
        if (chargeId) {
            const charge = await omise.charges.retrieve(chargeId);
            if (charge.status !== 'successful') throw new Error("Payment failed");

            // 🛑 1. เช็คดัก Webhook
            if (charge.metadata?.is_processed === 'true') {
                console.log("✅ Already processed by Webhook. Skipping.");
                return { success: true };
            }

            // 🛡️ [จุดเพิ่มใหม่] 2. เช็ค Log ถ้าค่า plan ที่ส่งมาจากหน้าบ้านหายไป
            let finalPlan = plan; 
            if (!finalPlan) {
                console.log("🕵️ Plan parameter missing, checking payment_logs...");
                const { data: fallbackLog } = await supabase.from('payment_logs')
                    .select('period')
                    .eq('charge_id', chargeId)
                    .single();
                
                if (fallbackLog?.period) {
                    finalPlan = fallbackLog.period as any;
                    console.log(`✅ Recovered plan [${finalPlan}] from logs.`);
                }
            }

            finalPurchaseType = finalPlan || 'monthly';

            const now = dayjs();
            let baseDate = now;
            const { data: existingTheme } = await supabase.from('themes').select('expires_at')
                .eq('brand_id', brandId).eq('marketplace_theme_id', marketplaceThemeId).single();
            
            if (existingTheme?.expires_at && dayjs(existingTheme.expires_at).isAfter(now)) {
                baseDate = dayjs(existingTheme.expires_at);
            }

            // 3. คำนวณวัน (ใช้ค่าที่กู้คืนมาได้)
            let daysToAdd = 18; 
            switch (finalPlan) {
                case 'weekly':  daysToAdd = 7; break;
                case 'monthly': daysToAdd = 30; break;
                case 'yearly':  daysToAdd = 365; break;
                default: 
                    daysToAdd = 18; // 🚨 บัคโชว์เลข 18 ให้เห็นชัดๆ
                    console.warn("⚠️ System still could not find plan, using debug: 18");
            }
            
            finalExpiresAt = baseDate.add(daysToAdd, 'day').toISOString();

            // 4. แปะป้ายบอก Webhook ว่าหน้าบ้านทำแล้วนะ
            markOmiseAsProcessed(chargeId, charge.metadata);
        } 
        // ... (กรณีใช้สิทธิ์ฟรี คงเดิม) ...
        else if (hasRightAccess) {
            finalPurchaseType = 'subscription';
            if (currentBrandPlan === 'ultimate') finalExpiresAt = brand.expiry_ultimate;
            else if (currentBrandPlan === 'pro') finalExpiresAt = brand.expiry_pro;
            else if (currentBrandPlan === 'basic') finalExpiresAt = brand.expiry_basic;
            else finalExpiresAt = dayjs().add(30, 'day').toISOString();
        } 
        else {
            throw new Error("Payment required");
        }

        if (!finalExpiresAt) finalExpiresAt = dayjs().add(30, 'day').toISOString();

        // 5. บันทึก/อัปเดต
        const { error } = await supabase.from('themes').upsert({
            brand_id: brandId,
            marketplace_theme_id: marketplaceThemeId,
            purchase_type: finalPurchaseType, 
            expires_at: finalExpiresAt,
            updated_at: new Date().toISOString()
        }, { onConflict: 'brand_id, marketplace_theme_id' });

        if (error) throw error;
        return { success: true };

    } catch (error: any) {
        console.error("Install Error:", error.message);
        return { success: false, error: error.message };
    }
}