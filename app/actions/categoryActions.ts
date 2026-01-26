// app/actions/categoryActions.ts
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

// Helper: หา Brand ID (Security Check)
async function getMyBrandId(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
  if (!profile?.brand_id) throw new Error("No brand assigned");
  return profile.brand_id;
}

// --- Actions ---

export async function getCategoriesAction() {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('brand_id', brandId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function upsertCategoryAction(categoryData: any) {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    
    // บังคับใช้ brand_id ของ user เท่านั้น
    const payload = { 
        name: categoryData.name,
        sort_order: categoryData.sort_order,
        brand_id: brandId,
        is_active: categoryData.is_active ?? true // ถ้าไม่มีค่าส่งมา ให้ default เป็น true
    };

    const { error } = categoryData.id 
      ? await supabase.from('categories').update(payload).eq('id', categoryData.id).eq('brand_id', brandId)
      : await supabase.from('categories').insert([payload]);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategoryAction(id: string) {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    // ลบเฉพาะของร้านตัวเอง
    const { error } = await supabase.from('categories').delete().eq('id', id).eq('brand_id', brandId);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleCategoryStatusAction(id: string, isActive: boolean) {
    const supabase = await getSupabase();
    try {
      const brandId = await getMyBrandId(supabase);
      const { error } = await supabase
        .from('categories')
        .update({ is_active: isActive })
        .eq('id', id)
        .eq('brand_id', brandId);
      
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }