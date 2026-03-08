// app/actions/PaimasterActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );
}

async function getMyBrandId(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
  return profile?.brand_id;
}

// ✅ ค้นหาสินค้าขายปลีก จากตาราง product_master โดยใช้ Barcode หรือ SKU
export async function scanRetailProductAction(barcode: string) {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    
    const { data, error } = await supabase
      .from('product_master')
      .select('*')
      .eq('brand_id', brandId)
      .eq('is_active', true) // เอาเฉพาะที่เปิดขาย
      .or(`barcode.eq.${barcode},sku.eq.${barcode}`)
      .single();

    if (error || !data) return { success: false, message: 'ไม่พบสินค้า' };
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}