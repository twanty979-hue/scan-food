// app/api/register/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✅ 1. รองรับ OPTIONS สำหรับ Android/Flutter
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
    const { email, password } = await request.json();

    // 2. สั่งสมัครสมาชิกผ่าน Supabase
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        // กำหนดให้หลังจากยืนยันอีเมลแล้ว วิ่งกลับมาที่หน้านี้
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback?next=/setup`,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // ✅ 3. เตรียมข้อมูลส่งกลับ
    // กรณีที่ Supabase ตั้งค่าให้ต้องยืนยันอีเมล data.session จะเป็น null
    const responseData = {
      success: true,
      user: data.user,
      session: data.session, // จะมีค่าก็ต่อเมื่อปิดการยืนยันอีเมลใน Supabase
      message: data.session ? "สมัครสมาชิกสำเร็จ" : "โปรดเช็คอีเมลเพื่อยืนยันตัวตน",
    };

    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}