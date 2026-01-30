// app/actions/marketplaceDetailActions.ts
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

// ... (Action 1: getThemeDetailAction เหมือนเดิม ไม่ต้องแก้) ...
export async function getThemeDetailAction(themeId: string) {
    // ... (โค้ดเดิม) ...
    // ใส่โค้ดเดิมของนายตรงนี้ได้เลย ผมละไว้เพื่อความสั้น
    const supabase = await getSupabase();
    // ...
    // Copy โค้ดเดิมมาใส่ได้เลยครับ ส่วนนี้ไม่มีผลกับการบันทึก
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");
        const { data: profile } = await supabase.from('profiles').select('role, brand_id, brands(plan, expiry_basic, expiry_pro, expiry_ultimate)').eq('id', user.id).single();
        if (!profile?.brand_id) throw new Error("No brand assigned");
        const brandData = profile.brands as any;
        const currentPlan = calculateEffectivePlan(brandData);
        const { data: themeData } = await supabase.from('marketplace_themes').select('*, min_plan, marketplace_categories(name)').eq('id', themeId).single();
        if (!themeData) throw new Error('Theme not found');
        const { data: owned } = await supabase.from('themes').select('*').eq('brand_id', profile.brand_id).eq('marketplace_theme_id', themeId).single();
        return { success: true, theme: themeData, isOwned: !!owned, ownedData: owned, isOwner: profile.role === 'owner', currentPlan };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// --- Action 2: สั่งซื้อ / ติดตั้ง (แก้ตรงนี้!!) ---
export async function installThemeAction(marketplaceThemeId: string, chargeId: string | null, plan: 'monthly' | 'lifetime') {
  const supabase = await getSupabase();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from('profiles').select('role, brand_id').eq('id', user.id).single();
    if (!profile?.brand_id || profile.role !== 'owner') throw new Error("Permission denied");
    const brandId = profile.brand_id;

    // ดึงข้อมูล
    const [themeRes, brandRes] = await Promise.all([
        supabase.from('marketplace_themes').select('price_monthly, price_lifetime, min_plan').eq('id', marketplaceThemeId).single(),
        supabase.from('brands').select('plan, expiry_basic, expiry_pro, expiry_ultimate').eq('id', brandId).single()
    ]);
    const themeData = themeRes.data;
    const brand = brandRes.data;
    if (!themeData || !brand) throw new Error("Data not found");

    // -------------------------------------------------------------
    // 🛡️ SECURITY CHECK
    // -------------------------------------------------------------
    const priceToPay = plan === 'monthly' ? themeData.price_monthly : themeData.price_lifetime;
    const currentBrandPlan = calculateEffectivePlan(brand);
    const hasRightAccess = canAccessTheme(currentBrandPlan, themeData.min_plan);

    // เช็คว่าต้องจ่ายตังไหม
    if (!hasRightAccess) {
        if (priceToPay && priceToPay > 0) {
            if (!chargeId) throw new Error("Payment required");
            const charge = await omise.charges.retrieve(chargeId);
            if (charge.status !== 'successful') throw new Error("Payment failed");
        }
    }
    // -------------------------------------------------------------

    // 4. ดึงข้อมูลธีมเดิม (สำคัญมาก! เอามาเช็คว่าเคยซื้อขาดไปหรือยัง)
    const { data: existingTheme } = await supabase
        .from('themes')
        .select('expires_at, purchase_type') // ✅ ดึง purchase_type มาด้วย
        .eq('brand_id', brandId)
        .eq('marketplace_theme_id', marketplaceThemeId)
        .single();

    // =============================================================
    // 🧠 LOGIC ใหม่: ห้ามลดเกรด (Protect Lifetime & Expiry)
    // =============================================================
    
    // 1. เช็คว่า "เป็นอมตะ" (Lifetime) หรือไม่?
    // - ถ้าของเดิมเป็น lifetime อยู่แล้ว -> ถือว่าเป็น lifetime
    // - ถ้าอันใหม่ที่กำลังซื้อเป็น lifetime -> ถือว่าเป็น lifetime
    const isPreviouslyLifetime = existingTheme?.purchase_type === 'lifetime';
    const isBuyingLifetime = plan === 'lifetime';
    const isFinalLifetime = isPreviouslyLifetime || isBuyingLifetime;

    let finalExpiresAt = null;
    let finalPurchaseType = '';

    if (isFinalLifetime) {
        // ✅ ถ้าเป็น Lifetime ให้เซ็ตเป็น Lifetime ตลอดไป (วันหมดอายุเป็น NULL)
        finalPurchaseType = 'lifetime';
        finalExpiresAt = null;
    } else {
        // 🔄 ถ้าไม่ใช่ Lifetime (เป็น Subscription หรือ Monthly)
        // ให้หาวันหมดอายุที่ "ไกลที่สุด" (Max Date)
        
        const now = dayjs();
        let targetDate = now;

        // A. วันหมดอายุจาก Plan (ถ้ามีสิทธิ์)
        let planExpiryDate = null;
        if (hasRightAccess) {
            if (currentBrandPlan === 'ultimate') planExpiryDate = brand.expiry_ultimate;
            else if (currentBrandPlan === 'pro') planExpiryDate = brand.expiry_pro;
            else if (currentBrandPlan === 'basic') planExpiryDate = brand.expiry_basic;
        }

        // B. วันหมดอายุจากการซื้อเพิ่ม (ถ้าซื้อ)
        let purchaseExpiryDate = null;
        if (plan === 'monthly') {
             // ถ้าของเดิมยังไม่หมด ให้บวกเพิ่มจากของเดิม
             let base = now;
             if (existingTheme?.expires_at && dayjs(existingTheme.expires_at).isAfter(now)) {
                 base = dayjs(existingTheme.expires_at);
             }
             purchaseExpiryDate = base.add(30, 'day');
        }

        // C. เทียบวัน: เอาวันที่ไกลที่สุด
        const dates = [
            existingTheme?.expires_at ? dayjs(existingTheme.expires_at) : null, // วันเดิม
            planExpiryDate ? dayjs(planExpiryDate) : null,                      // วันตาม Plan
            purchaseExpiryDate                                                  // วันที่ซื้อเพิ่ม
        ].filter(d => d !== null) as dayjs.Dayjs[];

        if (dates.length > 0) {
            // เรียงวันที่จากน้อยไปมาก แล้วเอาตัวสุดท้าย (ไกลสุด)
            // @ts-ignore
            const maxDate = dates.sort((a, b) => a.valueOf() - b.valueOf()).pop(); 
            finalExpiresAt = maxDate?.toISOString();
        }

        // กำหนด Type:
        // ถ้าซื้อแยก -> ให้เป็น 'monthly' (หรือ plan ที่ส่งมา) เพื่อกันระบบ Sync ลบทิ้ง
        // ถ้าใช้สิทธิ์ Plan -> ให้เป็น 'subscription'
        // แต่ถ้าเคยซื้อแยกมาก่อน ให้คงสถานะซื้อแยกไว้
        if (plan === 'monthly' || existingTheme?.purchase_type === 'monthly') {
            finalPurchaseType = 'monthly';
        } else {
            finalPurchaseType = 'subscription';
        }
    }

    // 6. บันทึก
    const { error } = await supabase.from('themes').upsert({
        brand_id: brandId,
        marketplace_theme_id: marketplaceThemeId,
        purchase_type: finalPurchaseType, // ✅ ใช้ค่าที่คำนวณใหม่
        expires_at: finalExpiresAt,       // ✅ ใช้วันที่ไกลที่สุด
        updated_at: new Date().toISOString()
    }, { onConflict: 'brand_id, marketplace_theme_id' });

    if (error) throw error;
    return { success: true };

  } catch (error: any) {
    console.error("Install Error:", error.message);
    return { success: false, error: error.message };
  }
}