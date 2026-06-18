// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- 🌐 จัดการ CORS Preflight ---
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// 🔐 Helper: แกะ Token หา brand_id ของพนักงาน
const getSupabaseAndBrandId = async (request: Request) => {
  const authHeader = request.headers.get('authorization');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles').select('brand_id').eq('id', user.id).single();

  if (!profile?.brand_id) throw new Error('No brand assigned');
  return { supabase, brandId: profile.brand_id };
};

// --- 📥 [GET] ดึงข้อมูลสินค้าและหมวดหมู่ของร้านตัวเอง ---
export async function GET(request: Request) {
  try {
    // 🚀 แกะ brand_id จาก Token ไม่ต้องรอรับจาก URL
    const { supabase, brandId } = await getSupabaseAndBrandId(request);

    // ยิงคิวรีขนานพร้อมกัน 2 ตาราง
    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, brand_id, category_id, name, description, image_name, price, price_special, price_jumbo, options, is_available, is_recommended')
        .eq('brand_id', brandId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
        
      supabase
        .from('categories')
        .select('id, name, sort_order, is_active')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
    ]);

    if (productsRes.error) throw productsRes.error;
    if (categoriesRes.error) throw categoriesRes.error;

    return new NextResponse(JSON.stringify({ 
      success: true, 
      products: productsRes.data || [],      
      categories: categoriesRes.data || []   
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

// --- 📤 [POST] สร้างใหม่ หรือ อัปเดตข้อมูลเมนูอาหาร ---
export async function POST(request: Request) {
  try {
    // 🚀 แกะ brand_id จาก Token ป้องกันการปลอมแปลง
    const { supabase, brandId } = await getSupabaseAndBrandId(request);
    
    const body = await request.json();
    const { 
      id, category_id, name, description, image_name, 
      price, price_special, price_jumbo, options, is_recommended, is_available 
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'ข้อมูลไม่ครบถ้วน บังคับระบุ name และ price' }, 
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const productPayload = {
      brand_id: brandId, // ใช้ brandId จากระบบชัวร์ 100%
      category_id: category_id || null,
      name,
      description: description || null,
      image_name: image_name || null,
      price: Number(price),
      price_special: price_special ? Number(price_special) : null,
      price_jumbo: price_jumbo ? Number(price_jumbo) : null,
      options: options || [], 
      is_recommended: is_recommended ?? false,
      is_available: is_available ?? true,
      updated_at: new Date().toISOString()
    };

    if (id) {
      const { data, error } = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', id)
        .eq('brand_id', brandId) // ล็อกความปลอดภัยข้ามร้าน
        .select()
        .single();

      if (error) throw error;
      return new NextResponse(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productPayload, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;
      return new NextResponse(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  } 
}