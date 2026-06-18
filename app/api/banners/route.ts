// app/api/banners/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- 🌐 จัดการ CORS Preflight สำหรับ Mobile ---
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

// 🔐 Helper: แกะ Token หารหัสร้านค้า (brand_id)
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

// --- 📥 [GET] ดึงข้อมูลแบนเนอร์ของร้าน เรียงตาม sort_order ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get('only_active') === 'true'; 

    // 🚀 แกะ brandId จาก Token
    const { supabase, brandId } = await getSupabaseAndBrandId(request);

    let query = supabase
      .from('banners')
      .select('id, brand_id, image_name, title, link_url, sort_order, is_active, created_at')
      .eq('brand_id', brandId);

    if (onlyActive) {
      query = query.eq('is_active', true);
    }

    const { data: banners, error } = await query.order('sort_order', { ascending: true });

    if (error) throw error;

    return new NextResponse(JSON.stringify({ success: true, banners: banners || [] }), {
      status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

// --- 📤 [POST] สร้างแบนเนอร์ใหม่ หรือ อัปเดตข้อมูลเดิม ---
export async function POST(request: Request) {
  try {
    // 🚀 ตรวจสิทธิ์พนักงานด้วย Token
    const { supabase, brandId } = await getSupabaseAndBrandId(request);
    
    const body = await request.json();
    const { id, image_name, title, link_url, sort_order, is_active } = body;

    if (!image_name) {
      return NextResponse.json({ success: false, error: 'กรุณาเลือกรูปภาพ (image_name)' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const bannerPayload = {
      brand_id: brandId, // ล็อกเซฟเข้ากระเป๋าร้านตัวเองเท่านั้น
      image_name: image_name.trim(),
      title: title && title.trim() !== '' ? title.trim() : null,
      link_url: link_url && link_url.trim() !== '' ? link_url.trim() : null,
      sort_order: sort_order !== undefined ? Number(sort_order) : 0,
      is_active: is_active ?? true,
    };

    if (id) {
      const { data, error } = await supabase
        .from('banners').update(bannerPayload).eq('id', id).eq('brand_id', brandId).select().single();

      if (error) throw error;
      return new NextResponse(JSON.stringify({ success: true, message: 'อัปเดตแบนเนอร์สำเร็จ', data }), { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
    } else {
      const { data, error } = await supabase
        .from('banners').insert([bannerPayload]).select().single();

      if (error) throw error;
      return new NextResponse(JSON.stringify({ success: true, message: 'เพิ่มแบนเนอร์ใหม่สำเร็จ', data }), { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}