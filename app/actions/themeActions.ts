// app/actions/themeActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import dayjs from 'dayjs';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );
}

async function getMyBrandInfo(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from('profiles').select('brand_id, role').eq('id', user.id).single();
  if (!profile?.brand_id) throw new Error("No brand assigned");
  return { brandId: profile.brand_id, isOwner: profile.role === 'owner' };
}

// ----------------------------------------------------------------------
// 🏆 HELPER: คำนวณ Plan ปัจจุบัน (คงเดิม 100%)
// ----------------------------------------------------------------------
function calculateEffectivePlan(brand: any) {
    const now = dayjs();
    if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) {
        return { plan: 'ultimate', expiry: brand.expiry_ultimate };
    }
    if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) {
        return { plan: 'pro', expiry: brand.expiry_pro };
    }
    if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) {
        return { plan: 'basic', expiry: brand.expiry_basic };
    }
    return { plan: 'free', expiry: null }; 
}

// ----------------------------------------------------------------------
// ✅ HELPER: ระบบ Sync Themes แบบ Smart Merge (คงเดิม 100%)
// ----------------------------------------------------------------------
export async function syncThemesWithPlan(supabase: any, brandId: string, plan: string, planExpiry: string | null) {
    // 1. กำหนดสิทธิ์ Tier (เหมือนเดิม)
    let allowedTiers: string[] = [];
    if (plan === 'free') allowedTiers = ['free'];
    else if (plan === 'basic') allowedTiers = ['free', 'basic'];
    else if (plan === 'pro') allowedTiers = ['free', 'basic', 'pro'];
    else if (plan === 'ultimate') allowedTiers = ['free', 'basic', 'pro', 'ultimate'];

    // 2. ดึง ID ธีมที่อนุญาต (เพิ่ม is_free_with_plan = true เพื่อดึงเฉพาะของแถม)
    const { data: allowedThemes } = await supabase
        .from('marketplace_themes')
        .select('id')
        .in('min_plan', allowedTiers)
        .eq('is_active', true)
        .eq('is_free_with_plan', true); 

    const allowedIds = allowedThemes?.map((t: any) => t.id) || [];

    // --- PHASE A: ล้างบาง (Delete) ---
    // ลบเฉพาะที่เป็น 'subscription' (ของแถม) ที่ไม่อยู่ในรายการ allowedIds แล้ว
    // ✅ ของที่ซื้อแยก (weekly/monthly) จะไม่ถูกลบ เพราะ purchase_type ไม่ตรงเงื่อนไข
    let deleteQuery = supabase.from('themes')
        .delete()
        .eq('brand_id', brandId)
        .eq('purchase_type', 'subscription'); 

    if (allowedIds.length > 0) {
        deleteQuery = deleteQuery.not('marketplace_theme_id', 'in', `(${allowedIds.join(',')})`);
    }
    await deleteQuery;

    // --- PHASE B: เติมของ/อัปเดต (Upsert) ---
    if (allowedIds.length > 0) {
        const { data: existingThemes } = await supabase
            .from('themes')
            .select('marketplace_theme_id, purchase_type, expires_at')
            .eq('brand_id', brandId)
            .in('marketplace_theme_id', allowedIds);

        const existingMap = new Map();
        existingThemes?.forEach((t: any) => existingMap.set(t.marketplace_theme_id, t));

        const records = allowedIds.map((id: string) => {
            const existing = existingMap.get(id);
            
            // ค่า Default สำหรับของใหม่ (คือ Subscription ตาม Plan)
            let finalPurchaseType = 'subscription'; 
            let finalExpiresAt = planExpiry; 

            if (existing) {
                // 🛑 CHECKPOINT สำคัญ: เช็คก่อนว่าเป็นของที่ "ซื้อแยก" มาหรือเปล่า?
                if (['weekly', 'monthly', 'yearly'].includes(existing.purchase_type)) {
                     // ✅ ถ้าซื้อแยกมา:
                     // 1. ให้คงสถานะ Type เดิมไว้ (เช่น weekly)
                     finalPurchaseType = existing.purchase_type;
                     
                     // 2. ใช้วันหมดอายุเดิมใน DB เท่านั้น!! (ห้ามเอา planExpiry ไปทับ)
                     // เพราะการบวกลบวัน (25+7 หรือ 30+7) ต้องทำจบไปแล้วตั้งแต่ตอนกดซื้อ/อัปเกรด
                     // หน้าที่ตรงนี้คือ "แสดงผลตามจริง" ห้ามไปแก้ของเขา
                     finalExpiresAt = existing.expires_at; 
                } 
                else {
                    // ✅ ถ้าเป็น Subscription (ของแถม) อยู่แล้ว:
                    // ให้ Sync วันตาม Plan ปัจจุบัน (เช่น Plan ยืด อายุธีมก็ยืดตาม)
                    finalPurchaseType = 'subscription';
                    finalExpiresAt = planExpiry;
                }
            }

            return {
                brand_id: brandId,
                marketplace_theme_id: id,
                purchase_type: finalPurchaseType,
                expires_at: finalExpiresAt,
                updated_at: new Date().toISOString()
            };
        });

        if (records.length > 0) {
            await supabase.from('themes').upsert(records, { 
                onConflict: 'brand_id, marketplace_theme_id',
                ignoreDuplicates: false 
            });
        }
    }
}

// --- Main Action ---

export async function getThemesDataAction() {
  const supabase = await getSupabase();
  try {
    const { brandId, isOwner } = await getMyBrandInfo(supabase);

    // ✅ 1. เพิ่ม: ดึง Categories ทั้งหมด
    const { data: categories } = await supabase
        .from('marketplace_categories')
        .select('id, name')
        .order('name');

    // 2. ดึงข้อมูล Plan
    let { data: brand } = await supabase
        .from('brands')
        .select('slug, theme_mode, plan, expiry_basic, expiry_pro, expiry_ultimate') 
        .eq('id', brandId)
        .single();

    // 3. คำนวณ Plan จริง & Force Sync
    const { plan: effectivePlan, expiry: activeExpiry } = calculateEffectivePlan(brand);
    await syncThemesWithPlan(supabase, brandId, effectivePlan, activeExpiry);

    // 4. Update Plan
    if (brand && brand.plan !== effectivePlan) {
        await supabase.from('brands').update({ plan: effectivePlan }).eq('id', brandId);
    }

    // 5. ดึง Themes (✅ เพิ่ม category_id เข้าไปใน query)
    const { data: themes } = await supabase.from('themes')
        .select(`
          id, purchase_type, expires_at, marketplace_theme_id,
          marketplace_themes ( 
            name, slug, image_url, theme_mode, category_id, description,
            marketplace_categories ( name ) 
          )
        `)
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

    // 6. Kill Switch
    if (brand?.theme_mode && brand.theme_mode !== 'standard') {
        const activeThemeExists = themes?.some((t: any) => t.marketplace_themes.theme_mode === brand.theme_mode);
        if (!activeThemeExists) {
            await supabase.from('brands').update({ theme_mode: 'standard' }).eq('id', brandId);
            brand.theme_mode = 'standard';
        }
    }

    // 7. ปรุงข้อมูล Display
    const processedThemes = themes?.map((theme: any) => {
        const isExpired = theme.expires_at && dayjs(theme.expires_at).isBefore(dayjs());
        let daysLeft: string | number = 'Lifetime';
        if (theme.expires_at) {
            const diff = dayjs(theme.expires_at).diff(dayjs(), 'day');
            daysLeft = diff < 0 ? 0 : diff;
        }
        return { ...theme, is_expired: isExpired, days_left: daysLeft };
    }) || [];

    const activeThemes = processedThemes.filter((t: any) => !t.is_expired);
    const expiredThemes = processedThemes.filter((t: any) => t.is_expired);

    // ✅ ส่ง categories กลับไปด้วย
    return { 
        success: true, 
        themes: processedThemes, 
        categories: categories || [], // <--- เพิ่มตรงนี้
        activeThemes, 
        expiredThemes, 
        currentConfig: { slug: brand?.slug || '', mode: brand?.theme_mode || '' },
        currentPlan: effectivePlan, 
        brandId,
        isOwner
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function applyThemeAction(slug: string, themeMode: string) {
    // ... (ส่วนนี้เหมือนเดิม 100% ไม่แตะต้อง) ...
    const supabase = await getSupabase();
    try {
        const { brandId, isOwner } = await getMyBrandInfo(supabase);
        if (!isOwner) throw new Error("Permission denied");
        
        if (themeMode !== 'standard') {
             const { data: targetTheme } = await supabase.from('themes').select('expires_at, purchase_type, marketplace_themes!inner(theme_mode)').eq('brand_id', brandId).eq('marketplace_themes.theme_mode', themeMode).single();
             if (targetTheme) {
                 const isLifetime = targetTheme.purchase_type === 'lifetime';
                 const isExpired = targetTheme.expires_at && dayjs(targetTheme.expires_at).isBefore(dayjs());
                 if (!isLifetime && isExpired) throw new Error("Theme expired");
             } else {
                 throw new Error("Theme not owned");
             }
        }
        const { error } = await supabase.from('brands').update({ slug, theme_mode: themeMode, updated_at: new Date().toISOString() }).eq('id', brandId);
        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}