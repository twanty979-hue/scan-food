// app/api/settings/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs'; // 🌟 นำเข้า dayjs มาใช้คำนวณวันหมดอายุ

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
    .from('profiles').select('brand_id, role').eq('id', user.id).single();

  if (!profile?.brand_id) throw new Error('No brand assigned');
  return { supabase, brandId: profile.brand_id, role: profile.role };
};

// 🌟 HELPER: ฟังก์ชันเช็ควันหมดอายุ
function calculateEffectivePlan(brand: any) {
    const now = dayjs();
    if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) return 'ultimate';
    if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) return 'pro';
    if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) return 'basic';
    return 'free'; 
}

export async function GET(request: Request) {
  try {
    const { supabase, brandId, role } = await getSupabaseAndBrandId(request);

    const { data: brand, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .single();

    if (error) throw error;

    // 🌟 เช็ควันหมดอายุแบบเรียลไทม์
    const effectivePlan = calculateEffectivePlan(brand);
    if (brand.plan !== effectivePlan) {
        await supabase.from('brands').update({ plan: effectivePlan }).eq('id', brandId);
        brand.plan = effectivePlan; // อัปเดตค่าที่จะส่งกลับให้ Flutter ทันที
    }

    // ส่ง isOwner ไปให้แอปด้วย (เผื่อเอาไปซ่อน/โชว์ปุ่มตั้งค่าในแอป)
    const isOwner = role === 'owner';

    return new NextResponse(JSON.stringify({ success: true, brand: brand, isOwner }), {
      status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, brandId, role } = await getSupabaseAndBrandId(request);
    
    // ดักไว้ก่อน เผื่อพนักงานทั่วไปแอบยิง API มาแก้ข้อมูลร้าน
    if (role !== 'owner') throw new Error('Unauthorized: Owners only');

    const body = await request.json();

        const updateData: any = { updated_at: new Date().toISOString() };
    for (const key of ['name', 'phone', 'address', 'promptpay_number']) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    if (body.table_qr_mode === 'static' || body.table_qr_mode === 'rotating') {
      updateData.table_qr_mode = body.table_qr_mode;
    }

    const { error } = await supabase.from('brands').update(updateData).eq('id', brandId);
    if (error) throw error;

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}