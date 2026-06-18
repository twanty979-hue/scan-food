// app/api/discounts/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- 🌐 จัดการ CORS Preflight ---
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// 🔐 Helper: แกะ Token หารหัสร้านค้า (brand_id) จากพนักงานที่ล็อกอิน
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

// --- 📥 1. [GET] ดึงข้อมูลส่วนลด + สินค้า (SaaS สไตล์: แกะ Token เอง) ---
export async function GET(request: Request) {
  try {
    // 🚀 แกะ brand_id จาก Token ไม่ต้องรอรับจาก URL
    const { supabase, brandId } = await getSupabaseAndBrandId(request);

    // ยิงดึงข้อมูลขนาน 3 ตารางรวด
    const [discountsRes, productsRes, masterRes] = await Promise.all([
      supabase
        .from('discounts')
        .select(`
          id, name, type, value, apply_to, 
          apply_normal, apply_special, apply_jumbo, 
          start_date, end_date, is_active,
          discount_products(product_id)
        `)
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false }),
        
      supabase
        .from('products')
        .select('id, name, price, price_special, price_jumbo, category_id')
        .eq('brand_id', brandId)
        .is('deleted_at', null)
        .order('name', { ascending: true }),

      supabase
        .from('product_master')
        .select('id, name, price, barcode, sku, category_id')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('name', { ascending: true })
    ]);

    if (discountsRes.error) throw discountsRes.error;
    if (productsRes.error) throw productsRes.error;
    if (masterRes.error) throw masterRes.error;

    return new NextResponse(JSON.stringify({
      success: true,
      discounts: discountsRes.data || [],
      products: productsRes.data || [],       // กลุ่มอาหารหน้าร้าน
      product_master: masterRes.data || []    // กลุ่มสแกนบาร์โค้ดขาย
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

// --- 📤 2. [POST] สร้างโปรโมชันใหม่ + ผูกความสัมพันธ์ลงตารางกลาง ---
export async function POST(request: Request) {
  try {
    // 🚀 ตรวจจับแบรนด์ด้วยสิทธิ์ระบบล็อกอิน
    const { supabase, brandId } = await getSupabaseAndBrandId(request);
    const body = await request.json();
    const { 
      name, type, value, apply_to, 
      apply_normal, apply_special, apply_jumbo, product_ids 
    } = body;

    if (!name || !value) {
      return NextResponse.json({ success: false, error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // บันทึกลงตาราง public.discounts (ใช้ brandId จาก Token)
    const { data: discountData, error: discountError } = await supabase
      .from('discounts')
      .insert([{
        brand_id: brandId, 
        name, type, value, apply_to,
        apply_normal, apply_special, apply_jumbo
      }])
      .select('id')
      .single();

    if (discountError) throw discountError;

    // ถ้าเลือกเฉพาะบางเมนู ให้ผูกเข้าตาราง discount_products
    if (apply_to === 'specific' && product_ids && product_ids.length > 0) {
      const relationRows = product_ids.map((pId: string) => ({
        discount_id: discountData.id,
        product_id: pId
      }));

      const { error: relError } = await supabase.from('discount_products').insert(relationRows);
      if (relError) throw relError;
    }

    return new NextResponse(JSON.stringify({ success: true, message: 'สร้างโปรโมชันเรียบร้อยแล้ว' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

// --- ❌ 3. [DELETE] ลบโปรโมชันออกจากระบบ ---
export async function DELETE(request: Request) {
  try {
    // 🚀 ตรวจสิทธิ์ก่อนลบ ป้องกันการยิงมั่ว
    const { supabase, brandId } = await getSupabaseAndBrandId(request);
    
    const { searchParams } = new URL(request.url);
    const discountId = searchParams.get('id');

    if (!discountId) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุ id ของโปรโมชันที่ต้องการลบ' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // สั่งลบโปรโมชันตัวนั้นตรงๆ โดยล็อกด้วย brand_id ของตัวเองเสมอ
    const { error } = await supabase
      .from('discounts')
      .delete()
      .eq('id', discountId)
      .eq('brand_id', brandId);

    if (error) throw error;

    return new NextResponse(JSON.stringify({ success: true, message: 'ลบโปรโมชันออกจากระบบสำเร็จแล้ว' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}