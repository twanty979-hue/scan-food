// app/actions/bannerActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper สร้าง Client
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );
}

// Helper หา Brand ID ของคนล็อกอิน (เพื่อความปลอดภัย ไม่รับจาก Client)
async function getMyBrandId(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
  if (!profile?.brand_id) throw new Error("No brand assigned");
  return profile.brand_id;
}

// --- Actions ---

export async function getBannersAction() {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('brand_id', brandId)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return { success: true, data, brandId }; // ส่ง brandId กลับไปด้วยเพื่อเอาไปใช้ทำ path รูป
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// app/actions/bannerActions.ts

// ... (ส่วน import และ helper ด้านบนเหมือนเดิม) ...

export async function upsertBannerAction(bannerData: any) {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    
    // ✅ 1. แยก id ออกจากข้อมูลที่จะบันทึก (Destructuring)
    // เพื่อไม่ให้ส่ง id: null ไปตอน Insert
    const { id, ...dataToSave } = bannerData;

    // ✅ 2. เอาข้อมูลที่เหลือมารวมกับ brand_id
    const payload = { ...dataToSave, brand_id: brandId };

    let error;

    if (id) {
      // 🛠 กรณี Update: ส่ง payload ปกติ และใช้ id ในการระบุแถว
      const res = await supabase
        .from('banners')
        .update(payload)
        .eq('id', id)
        .eq('brand_id', brandId); // เช็ค brand_id อีกรอบเพื่อความชัวร์
      error = res.error;
    } else {
      // ✨ กรณี Insert: ส่ง payload ที่ **ไม่มี field id** ไป
      // Database จะสร้าง UUID ให้เองจาก gen_random_uuid()
      const res = await supabase
        .from('banners')
        .insert([payload]);
      error = res.error;
    }

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ... (functions อื่นๆ เหมือนเดิม)

export async function deleteBannerAction(id: string) {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    // ลบเฉพาะของร้านตัวเอง
    const { error } = await supabase.from('banners').delete().eq('id', id).eq('brand_id', brandId);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}