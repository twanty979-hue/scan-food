// app/actions/marketplaceActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, // ใช้ตัวแปร Environment ให้ถูก
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );
}

export async function getMarketplaceDataAction() {
  const supabase = await getSupabase();
  
  try {
    // 1. ลองดึง User (แต่อย่าเพิ่ง Error ถ้าไม่มี)
    const { data: { user } } = await supabase.auth.getUser();
    
    let brandId = null;
    let ownedThemeIds: any[] = [];

    // 2. ถ้ามี User ค่อยไปดึงข้อมูล Brand และ Theme ที่ซื้อแล้ว
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('brand_id')
        .eq('id', user.id)
        .single();
      
      brandId = profile?.brand_id;

      if (brandId) {
        const { data: ownedThemes } = await supabase
          .from('themes')
          .select('marketplace_theme_id')
          .eq('brand_id', brandId);
          
        ownedThemeIds = ownedThemes?.map((t: any) => t.marketplace_theme_id) || [];
      }
    }

    // 3. ดึงข้อมูล Themes และ Categories (อันนี้ต้องดึงเสมอ ไม่ว่าล็อกอินหรือไม่)
    // ⚠️ ลบเงื่อนไข throw Error ออก เพื่อให้คนทั่วไปดึงได้
    const [categoriesRes, themesRes] = await Promise.all([
      supabase.from('marketplace_categories').select('*').order('name'),
      supabase.from('marketplace_themes')
        .select('*, min_plan, marketplace_categories(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false }),
    ]);

    if (categoriesRes.error) console.error("Categories Error:", categoriesRes.error);
    if (themesRes.error) console.error("Themes Error:", themesRes.error);

    return { 
        success: true, 
        categories: categoriesRes.data || [],
        themes: themesRes.data || [],
        ownedThemeIds,
        brandId
    };

  } catch (error: any) {
    console.error("Action Error:", error.message);
    // คืนค่าว่างไปก่อน ดีกว่า Error แดงเถือก
    return { success: false, error: error.message, themes: [], categories: [] };
  }
}