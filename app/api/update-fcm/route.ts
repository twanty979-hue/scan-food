// app/api/update-fcm/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' },
  });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { global: { headers: { Authorization: authHeader || '' } } });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const { fcm_token } = await request.json();

    // 🌟 อัปเดต Token ลงตาราง profiles ของพนักงานคนนั้นๆ
    const { error } = await supabase.from('profiles').update({ fcm_token }).eq('id', user.id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "FCM Token Updated" }, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' }});
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' }});
  }
}