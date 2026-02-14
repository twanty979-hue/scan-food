'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Omise from 'omise';
import dayjs from 'dayjs';
import { canAccessTheme } from '@/lib/planConfig';

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
// ✅ Action 2: installThemeAction (แก้ Logic คำนวณวันตรงนี้!)
// ------------------------------------------------------------------
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

        // =============================================================
        // 🧠 LOGIC การคำนวณวันหมดอายุ (ฉบับแก้ไข)
        // =============================================================
        
        let finalPurchaseType = '';
        let finalExpiresAt = ''; // ต้องมีค่าเสมอ ห้ามเป็น NULL หรือ Empty String

        // 🔥 กรณีที่ 1: "จ่ายเงินซื้อเพิ่ม" (มี chargeId)
        if (chargeId) {
            const charge = await omise.charges.retrieve(chargeId);
            if (charge.status !== 'successful') throw new Error("Payment failed");

            finalPurchaseType = plan || 'monthly'; // กันเหนียวถ้า plan หลุดมาเป็น null

            // ดึงวันหมดอายุเดิมมาเช็ค (Top-up)
            const now = dayjs();
            let baseDate = now;
            const { data: existingTheme } = await supabase.from('themes').select('expires_at').eq('brand_id', brandId).eq('marketplace_theme_id', marketplaceThemeId).single();
            
            if (existingTheme?.expires_at && dayjs(existingTheme.expires_at).isAfter(now)) {
                baseDate = dayjs(existingTheme.expires_at);
            }

            // ✅ คำนวณวัน (Calculator)
            let daysToAdd = 30; // Default
            switch (plan) {
                case 'weekly': daysToAdd = 7; break;
                case 'monthly': daysToAdd = 30; break;
                case 'yearly': daysToAdd = 365; break;
                default: daysToAdd = 30; // ถ้าไม่ตรงเคสไหนเลย ให้เป็น 30 วัน
            }
            
            finalExpiresAt = baseDate.add(daysToAdd, 'day').toISOString();
        } 
        // 🎁 กรณีที่ 2: "ใช้สิทธิ์ฟรี" (Bundle)
        else if (hasRightAccess) {
            finalPurchaseType = 'subscription';
            // วันหมดอายุ ยึดตามวันหมดอายุของแพ็กเกจร้าน
            if (currentBrandPlan === 'ultimate') finalExpiresAt = brand.expiry_ultimate;
            else if (currentBrandPlan === 'pro') finalExpiresAt = brand.expiry_pro;
            else if (currentBrandPlan === 'basic') finalExpiresAt = brand.expiry_basic;
            else finalExpiresAt = dayjs().add(30, 'day').toISOString();
        } 
        else {
            throw new Error("Payment required");
        }

        // 🛡️ กันเหนียวครั้งสุดท้าย: ถ้า finalExpiresAt ว่าง ให้ Default เป็น 30 วัน
        if (!finalExpiresAt) {
            finalExpiresAt = dayjs().add(30, 'day').toISOString();
        }

        // 4. บันทึก (Upsert)
        const { error } = await supabase.from('themes').upsert({
            brand_id: brandId,
            marketplace_theme_id: marketplaceThemeId,
            purchase_type: finalPurchaseType, 
            expires_at: finalExpiresAt, // ✅ รับรองไม่ NULL แน่นอน
            updated_at: new Date().toISOString()
        }, { onConflict: 'brand_id, marketplace_theme_id' });

        if (error) throw error;
        return { success: true };

    } catch (error: any) {
        console.error("Install Error:", error.message);
        return { success: false, error: error.message };
    }
}