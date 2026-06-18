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

const PURCHASED_THEME_TYPES = ['free', 'weekly', 'monthly', 'yearly', 'lifetime'];

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
export async function syncThemesWithPlan(
    supabase: any, 
    brandId: string, 
    plan: string, 
    planExpiry: string | null,
    periodToAdd?: 'monthly' | 'yearly',
    chargeIdForCheck?: string // 🆕 เพิ่ม: ส่ง Charge ID มาเช็คเพื่อความชัวร์ (ถ้ามี)
) {
    // Theme access is purchase-only now. Keep this exported for older callers,
    // but never create plan-granted `subscription` theme rows.
    return;
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
    const { plan: effectivePlan } = calculateEffectivePlan(brand);

    // 4. Update Plan
    if (brand && brand.plan !== effectivePlan) {
        await supabase.from('brands').update({ plan: effectivePlan }).eq('id', brandId);
    }

    // 5. ดึง Themes ที่ร้านซื้อ/ถือสิทธิ์อยู่จริง
    const { data: ownedThemes } = await supabase.from('themes')
        .select(`
          id, purchase_type, expires_at, marketplace_theme_id,
          marketplace_themes ( 
            name, slug, image_url, theme_mode, category_id, description,
            marketplace_categories ( name ) 
          )
        `)
        .eq('brand_id', brandId)
        .in('purchase_type', PURCHASED_THEME_TYPES)
        .order('created_at', { ascending: false });

    // 5.1 ดึงธีมฟรีจาก Marketplace มาแสดงอัตโนมัติ โดยไม่สร้างสิทธิ์ตาม plan
    const { data: freeMarketplaceThemes } = await supabase
        .from('marketplace_themes')
        .select(`
          id, name, slug, image_url, theme_mode, category_id, description,
          marketplace_categories ( name )
        `)
        .eq('is_active', true)
        .eq('min_plan', 'free')
        .order('created_at', { ascending: false });

    const ownedThemeIds = new Set((ownedThemes || []).map((t: any) => t.marketplace_theme_id));
    const freeThemeRows = (freeMarketplaceThemes || [])
        .filter((theme: any) => !ownedThemeIds.has(theme.id))
        .map((theme: any) => ({
            id: `free-${theme.id}`,
            purchase_type: 'free',
            expires_at: null,
            marketplace_theme_id: theme.id,
            marketplace_themes: theme,
        }));
    const themes = [...(ownedThemes || []), ...freeThemeRows];

    // 6. Kill Switch
    if (brand?.theme_mode && brand.theme_mode !== 'standard') {
        const activeThemeExists = themes?.some((t: any) => {
            const isPermanent = t.purchase_type === 'free' || t.purchase_type === 'lifetime';
            const isUsable = isPermanent || Boolean(t.expires_at && dayjs(t.expires_at).isAfter(dayjs()));
            return t.marketplace_themes.theme_mode === brand.theme_mode && isUsable;
        });
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
             const { data: targetTheme } = await supabase
                .from('themes')
                .select('expires_at, purchase_type, marketplace_themes!inner(theme_mode)')
                .eq('brand_id', brandId)
                .eq('marketplace_themes.theme_mode', themeMode)
                .in('purchase_type', PURCHASED_THEME_TYPES)
                .single();
             if (targetTheme) {
                 const isLifetime = targetTheme.purchase_type === 'lifetime';
                 const isExpired = targetTheme.expires_at && dayjs(targetTheme.expires_at).isBefore(dayjs());
                 if (!isLifetime && isExpired) throw new Error("Theme expired");
             } else {
                 const { data: freeTheme } = await supabase
                    .from('marketplace_themes')
                    .select('id')
                    .eq('theme_mode', themeMode)
                    .eq('is_active', true)
                    .eq('min_plan', 'free')
                    .maybeSingle();

                 if (!freeTheme) throw new Error("Theme not owned");
             }
        }
        const { error } = await supabase.from('brands').update({ slug, theme_mode: themeMode, updated_at: new Date().toISOString() }).eq('id', brandId);
        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
