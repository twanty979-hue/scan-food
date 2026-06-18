import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Set CORS Headers ให้ Flutter เรียกใช้ได้
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ดัก OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    // 1. เช็ค Token ใน Header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401, headers: corsHeaders });
    }
    const token = authHeader.split(' ')[1];

    // 2. สร้าง Supabase Client โดยใช้ Token ของยูสเซอร์นั้นๆ
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    // 3. Verify Token และดึงข้อมูล User
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) throw new Error('Invalid Token');

    // 4. ดึง brand_id จากตาราง profiles (ดึงจากระบบหลังบ้านของจริง)
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('brand_id')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile?.brand_id) throw new Error('Brand profile not found');
    const brandId = profile.brand_id;

    // 5. Query ประวัติสต็อก (ใช้ Logic คล้าย Server Action ฝั่งเว็บ)
    const { data: txData, error: txErr } = await supabase
      .from('stock_transactions')
      .select(`
        id, ref_no, note, created_at,
        stock_logs (
          id, change_amount, action_type,
          product_master!inner(id, name, image_url, barcode)
        )
      `)
      .eq('brand_id', brandId)
      .not('ref_no', 'ilike', 'POS-%') // กรองบิลขายย่อยออก
      .order('created_at', { ascending: false });

    if (txErr) throw txErr;

    // ส่งคืนข้อมูลให้ Flutter
    return NextResponse.json({ success: true, data: txData }, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400, headers: corsHeaders }
    );
  }
}