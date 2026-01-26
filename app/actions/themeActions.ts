// app/actions/themeActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper: สร้าง Client
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );
}

// Helper: หา Brand ID และเช็ค Role
async function getMyBrandInfo(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: profile } = await supabase.from('profiles').select('brand_id, role').eq('id', user.id).single();
  if (!profile?.brand_id) throw new Error("No brand assigned");
  
  return { 
      brandId: profile.brand_id, 
      isOwner: profile.role === 'owner' 
  };
}

// --- Actions ---

export async function getThemesDataAction() {
  const supabase = await getSupabase();
  try {
    const { brandId, isOwner } = await getMyBrandInfo(supabase);

    // 1. ดึง Config ปัจจุบันของ Brand
    let { data: brand } = await supabase
        .from('brands')
        .select('slug, theme_mode')
        .eq('id', brandId)
        .single();

    // 2. ดึง Themes ที่ร้านนี้เป็นเจ้าของ
    const { data: themes } = await supabase.from('themes')
        .select(`
          id,
          purchase_type,
          expires_at,
          marketplace_theme_id,
          marketplace_themes (
            name, slug, image_url, theme_mode,
            marketplace_categories ( name )
          )
        `)
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

    // ---------------------------------------------------------
    // 🛡️ DASHBOARD KILL SWITCH (เพิ่มตรงนี้)
    // ---------------------------------------------------------
    // เช็คว่าธีมที่ใช้อยู่ (Active) มันหมดอายุหรือยัง?
    if (brand?.theme_mode && brand.theme_mode !== 'standard') {
        // หาธีมตัวที่ใช้อยู่ในรายการ themes ที่ดึงมา
        const activeTheme = themes?.find((t: any) => t.marketplace_themes.theme_mode === brand.theme_mode);
        
        if (activeTheme) {
            const isLifetime = activeTheme.purchase_type === 'lifetime';
            const isExpired = activeTheme.expires_at && new Date(activeTheme.expires_at) < new Date();

            // ถ้าไม่ใช่ Lifetime และ หมดอายุแล้ว -> ดีดกลับเป็น Standard เดี๋ยวนี้!
            if (!isLifetime && isExpired) {
                console.log(`⚠️ Dashboard Check: Theme expired. Reverting to standard.`);
                
                // 1. อัปเดต Database
                await supabase.from('brands').update({ theme_mode: 'standard' }).eq('id', brandId);
                
                // 2. อัปเดตตัวแปร local เพื่อให้หน้าเว็บเปลี่ยนทันทีไม่ต้อง refresh
                brand.theme_mode = 'standard';
            }
        }
    }
    // ---------------------------------------------------------

    // 3. ปรุงข้อมูล (คำนวณวันหมดอายุสำหรับแสดงผล)
    const processedThemes = themes?.map((theme: any) => {
        const isExpired = theme.expires_at && new Date(theme.expires_at) < new Date();
        
        let daysLeft: string | number = 'Lifetime';
        if (theme.purchase_type === 'monthly' && theme.expires_at) {
            const diff = new Date(theme.expires_at).getTime() - new Date().getTime();
            daysLeft = Math.ceil(diff / (1000 * 3600 * 24));
            if (daysLeft < 0) daysLeft = 0;
        }

        return {
            ...theme,
            is_expired: isExpired, 
            days_left: daysLeft
        };
    });

    return { 
        success: true, 
        themes: processedThemes || [], 
        currentConfig: { slug: brand?.slug || '', mode: brand?.theme_mode || '' },
        brandId,
        isOwner
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function applyThemeAction(slug: string, themeMode: string) {
  const supabase = await getSupabase();
  try {
    const { brandId, isOwner } = await getMyBrandInfo(supabase);

    if (!isOwner) throw new Error("Permission denied: Only owner can apply themes.");
    
    // ก่อนเปลี่ยนธีม เช็คก่อนว่าธีมเป้าหมายหมดอายุไหม (กันเหนียว)
    if (themeMode !== 'standard') {
         const { data: targetTheme } = await supabase
            .from('themes')
            .select('expires_at, purchase_type, marketplace_themes!inner(theme_mode)')
            .eq('brand_id', brandId)
            .eq('marketplace_themes.theme_mode', themeMode)
            .single();
            
         if (targetTheme) {
             const isLifetime = targetTheme.purchase_type === 'lifetime';
             const isExpired = targetTheme.expires_at && new Date(targetTheme.expires_at) < new Date();
             
             if (!isLifetime && isExpired) {
                 throw new Error("ไม่สามารถใช้งานธีมนี้ได้เนื่องจากวันใช้งานหมดอายุแล้ว");
             }
         }
    }

    // Update Brand Config
    const { error } = await supabase.from('brands')
        .update({ 
            slug: slug, 
            theme_mode: themeMode,
            updated_at: new Date().toISOString() 
        })
        .eq('id', brandId);

    if (error) throw error;
    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}