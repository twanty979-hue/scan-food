import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    // 1. ตรวจด่านความปลอดภัย แกะ Bearer Token ของคนล็อกอิน
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'สิทธิ์ไม่ถูกต้อง (401)' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // 2. ยิงหา User ID เจ้าของเซสชัน
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'เซสชันหมดอายุ' }, { status: 401 });
    }

    // 3. งัดหา Brand ID จากตาราง profiles ตามสิทธิ์จริง
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('brand_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData || !profileData.brand_id) {
      return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลแบรนด์ของยูสเซอร์นี้' }, { status: 404 });
    }

    const myBrandId = profileData.brand_id;

    // 4. 🚀 ยิงคิวรี่ขนานพร้อมกัน 2 ตาราง (Parallel Fetching) รวดเร็วทันใจ
    const [paymentsResponse, coinsResponse] = await Promise.all([
      supabase.from('payment_logs').select('*').eq('brand_id', myBrandId).order('created_at', { ascending: false }),
      supabase.from('coin_logs').select('*').eq('brand_id', myBrandId).order('created_at', { ascending: false })
    ]);

    if (paymentsResponse.error) throw paymentsResponse.error;
    if (coinsResponse.error) throw coinsResponse.error;

    // 5. ส่งแพ็กเกจคู่กลับไปให้แอป Flutter ดึงค่าไปกระจายแสดงผล
    return NextResponse.json({
      success: true,
      payments: paymentsResponse.data ?? [],
      coins: coinsResponse.data ?? []
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}