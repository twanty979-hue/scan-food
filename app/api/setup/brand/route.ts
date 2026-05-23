// app/api/setup/brand/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    const { userId, shopName, shopPhone } = await request.json();

    if (!userId || !shopName) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // --- ส่วนสำคัญ: ทำงานต่อเนื่องกัน ---

    // 1. สร้าง Brand ใหม่
    const { data: brand, error: brandErr } = await supabaseAdmin.from('brands').insert({
      name: shopName,
      phone: shopPhone,
      plan: 'free',
      status: 'trial'
    }).select().single();

    if (brandErr) throw brandErr;

    // 2. อัปเดต Profile ให้ผูกกับ Brand นี้
    const { error: profileErr } = await supabaseAdmin.from('profiles').update({
      brand_id: brand.id,
      role: 'owner',
      updated_at: new Date().toISOString()
    }).eq('id', userId);

    if (profileErr) throw profileErr;

    const response = NextResponse.json({ 
      success: true, 
      brandId: brand.id,
      message: "สร้างร้านค้าและตั้งค่าเจ้าของสำเร็จ" 
    });
    
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}