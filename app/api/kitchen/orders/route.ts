// app/api/kitchen/orders/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- 🌐 จัดการ CORS Preflight สำหรับจอห้องครัว ---
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// 🔐 Helper พระเอกประจำตระกูล: แกะตัวตนหารหัสร้าน (brand_id) จาก Token
const getSupabaseAndBrandId = async (request: Request) => {
  const authHeader = request.headers.get('authorization');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  );

  // พิสูจน์ตั๋วพนักงานพนักงาน
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  // ควานหาชื่อแบรนด์ที่ดูแลอยู่
  const { data: profile } = await supabase
    .from('profiles').select('brand_id').eq('id', user.id).single();

  if (!profile?.brand_id) throw new Error('No brand assigned');
  return { supabase, brandId: profile.brand_id };
};

export async function GET(request: Request) {
  try {
    // 🚀 สไตล์ SaaS แท้: ดึงท่อเชื่อมต่อและ brandId จาก Token โดยตรง (ไม่ต้องง้อ URL พ่วงไอดี)
    const { supabase, brandId } = await getSupabaseAndBrandId(request);

    // ดึงออเดอร์ที่ค้างคาอยู่ในห้องครัว
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('brand_id', brandId) // ป้องกันการดึงข้ามร้านอย่างเด็ดขาด
      .in('status', ['pending', 'preparing'])
      .order('created_at', { ascending: true });

    if (error) throw error;

    const response = NextResponse.json({ success: true, data: data });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    console.error("❌ [API] Get Kitchen Orders Error:", error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}