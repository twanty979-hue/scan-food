// app/api/setup/profile/route.ts
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
    const { userId, fullName, phone, avatarUrl } = await request.json();

    if (!userId || !fullName) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // ✅ ทำการ Upsert ข้อมูลลงในตาราง profiles
    const { error } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      phone: phone,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    });

    if (error) throw error;

    const response = NextResponse.json({ success: true, message: "บันทึกโปรไฟล์สำเร็จ" });
    
    // ตั้งค่า CORS
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}