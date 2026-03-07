// app/api/login/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) return NextResponse.json({ error: authError.message }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('brand_id, full_name')
      .eq('id', authData.user.id)
      .single();

    // ✅ แก้ตรงนี้: ส่ง authData.session กลับไปทั้งก้อนเลย เพื่อให้ Frontend เอาไปใช้ต่อได้
    return NextResponse.json({
      success: true,
      session: authData.session, // <--- เพิ่มบรรทัดนี้เข้าไป
      brand_id: profile?.brand_id,
      shop_name: profile?.full_name,
      redirectTo: !profile?.brand_id ? '/setup' : '/dashboard'
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}