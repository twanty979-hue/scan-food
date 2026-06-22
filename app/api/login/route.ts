// app/api/login/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// ✅ 1. เพิ่มฟังก์ชัน OPTIONS เพื่อรองรับการยิงจาก Android/Flutter (CORS Preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // อนุญาตให้ทุก Domain เข้าถึงได้
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // ล็อกอินผ่าน Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    // ถ้าล็อกอินไม่ผ่าน ส่ง Error กลับพร้อม Header
    if (authError) {
      return NextResponse.json(
        { error: authError.message }, 
        { 
          status: 401,
          headers: { 'Access-Control-Allow-Origin': '*' } 
        }
      );
    }

    // ดึงข้อมูล Profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('brand_id, full_name')
      .eq('id', authData.user.id)
      .single();

    // ✅ 2. เตรียมข้อมูลส่งกลับ (มี Session ครบถ้วนตามที่คุณป้อต้องการ)
    const responseData = {
      success: true,
      session: authData.session, // ส่งไปทั้งก้อนเพื่อให้ Flutter เอาไปใช้ต่อ
      brand_id: profile?.brand_id,
      shop_name: profile?.full_name,
      redirectTo: !profile?.brand_id ? '/setup' : '/dashboard'
    };

    // ✅ 3. ส่งข้อมูลกลับพร้อมตั้งค่า CORS ให้ Android เรียกใช้ได้ไม่ติดขัด
    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // สำคัญมากสำหรับ Android
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Server Error" }, 
      { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}
