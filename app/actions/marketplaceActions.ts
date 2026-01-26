// app/actions/marketplaceActions.ts
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

export async function getMarketplaceDataAction() {
  const supabase = await getSupabase();
  try {
    // 1. Check Auth & Get Brand ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
    const brandId = profile?.brand_id;

    // 2. Fetch Data Parallel
    const [categoriesRes, themesRes, ownedThemesRes] = await Promise.all([
      supabase.from('marketplace_categories').select('*').order('name'),
      supabase.from('marketplace_themes').select('*, marketplace_categories(name)').eq('is_active', true).order('created_at', { ascending: false }),
      brandId ? supabase.from('themes').select('marketplace_theme_id').eq('brand_id', brandId) : { data: [] }
    ]);

    if (categoriesRes.error) throw categoriesRes.error;
    if (themesRes.error) throw themesRes.error;

    // 3. Format Data
    const ownedThemeIds = ownedThemesRes.data?.map((t: any) => t.marketplace_theme_id) || [];

    return { 
        success: true, 
        categories: categoriesRes.data || [],
        themes: themesRes.data || [],
        ownedThemeIds,
        brandId
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}