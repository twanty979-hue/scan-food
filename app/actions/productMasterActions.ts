// app/actions/productMasterActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// --- 🛠️ Helper: สร้าง Supabase Client แบบเดียวกับที่พี่ใช้ ---
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value }
      }
    }
  );
}

// --- 🛠️ Helper: หา Brand ID จาก Profile ของ User (Security Check) ---
async function getMyBrandId(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("เข้าสู่ระบบก่อนครับพี่");
  
  // ดึง brand_id จากตาราง profiles หรือจะดึงจาก brands โดยตรงก็ได้
  // ผมปรับให้ดึงจาก profiles ตามโครงสร้างเดิมของพี่นะครับ
  const { data: profile } = await supabase
    .from('profiles')
    .select('brand_id')
    .eq('id', user.id)
    .single();

  if (!profile?.brand_id) throw new Error("ไม่พบข้อมูลแบรนด์ของพี่ครับ");
  return profile.brand_id;
}

// --- 📦 Actions สำหรับ Product Master ---

// 1. ดึงข้อมูลสินค้ามาสเตอร์ (Retail Mode)
export async function getMasterProducts() {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    const { data, error } = await supabase
      .from('product_master')
      .select(`
        *,
        stock ( quantity )
      `)
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error:', error.message);
    return [];
  }
}

// 7. สร้างหมวดหมู่มาสเตอร์ใหม่ (Quick Add)
export async function createMasterCategory(formData: any) {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    
    const payload = {
        name: formData.name,
        sort_order: Number(formData.sort_order) || 0,
        brand_id: brandId
    };

    const { data, error } = await supabase
      .from('master_categories')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 2. ดึงหมวดหมู่มาสเตอร์
export async function getMasterCategories() {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    const { data, error } = await supabase
      .from('master_categories')
      .select('*')
      .eq('brand_id', brandId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    return [];
  }
}

// 3. สร้างสินค้าใหม่ (พร้อมใส่สต็อกเริ่มต้น)
export async function createMasterProduct(formData: any, initialStock: number) {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    
    const payload = {
        ...formData,
        brand_id: brandId,
        price: Number(formData.price),
        cost_price: Number(formData.cost_price) || 0
    };

    // สร้างสินค้า
    const { data: newProduct, error: productError } = await supabase
      .from('product_master')
      .insert([payload])
      .select()
      .single();

    if (productError) throw productError;

    // บันทึกสต็อกเริ่มต้นเข้า Log (ถ้ามี)
    if (initialStock > 0 && newProduct) {
      await supabase.from('stock_logs').insert([{
        product_id: newProduct.id,
        change_amount: initialStock,
        action_type: 'IN',
        note: 'ยอดยกมา / สต็อกเริ่มต้นระบบ'
      }]);
    }

    return { success: true, data: newProduct };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 4. อัปเดตข้อมูลสินค้า
export async function updateMasterProduct(id: string, formData: any) {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    const payload = {
        ...formData,
        price: Number(formData.price),
        cost_price: Number(formData.cost_price) || 0
    };

    const { error } = await supabase
      .from('product_master')
      .update(payload)
      .eq('id', id)
      .eq('brand_id', brandId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 5. ปิด/เปิด สถานะสินค้า
export async function toggleProductStatus(id: string, currentStatus: boolean) {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    const { error } = await supabase
      .from('product_master')
      .update({ is_active: !currentStatus })
      .eq('id', id)
      .eq('brand_id', brandId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 6. ลบสินค้า
export async function deleteMasterProduct(id: string) {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    const { error } = await supabase
      .from('product_master')
      .delete()
      .eq('id', id)
      .eq('brand_id', brandId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}