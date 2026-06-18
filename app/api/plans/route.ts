// app/api/plans/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ใช้ Admin Client เพื่อทะลุ RLS คิวรีราคาและประวัติ
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) throw new Error('Unauthorized');

    // ตรวจสอบ User ฝั่ง Client
    const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const { data: profile } = await supabaseClient.from('profiles').select('brand_id').eq('id', user.id).single();
    if (!profile?.brand_id) throw new Error('No brand assigned');

    const brandId = profile.brand_id;

    // 🌟 1. ดึงโครงสร้างราคาทั้งหมดที่เปิดขาย
    const { data: plans, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (planError) throw planError;

    // 🌟 2. เช็คประวัติการชำระเงินว่าเคยจ่ายสำเร็จไหม (หาความเป็น First-time buyer)
    const { count } = await supabaseAdmin
      .from('payment_logs')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId)
      .eq('status', 'successful');

    const isFirstTimeBuyer = !count || count === 0;

    // 🌟 3. ดึงข้อมูลแบรนด์เพื่อดูแพ็กเกจปัจจุบันและวันหมดอายุมาคำนวณวันคงเหลือ
    const { data: brand, error: brandError } = await supabaseAdmin
      .from('brands')
      .select('plan, expiry_basic, expiry_pro, expiry_ultimate')
      .eq('id', brandId)
      .single();

    if (brandError) throw brandError;

    let daysLeft = 0;
    let expiryDate: string | null = null;
    const currentPlan = brand?.plan || 'free';

    if (brand && currentPlan !== 'free') {
      let rawExpiry = null;

      // เลือกคอลัมน์วันหมดอายุให้ตรงตามแพลนปัจจุบันของร้านค้า
      if (currentPlan === 'basic') rawExpiry = brand.expiry_basic;
      else if (currentPlan === 'pro') rawExpiry = brand.expiry_pro;
      else if (currentPlan === 'ultimate') rawExpiry = brand.expiry_ultimate;

      if (rawExpiry) {
        expiryDate = rawExpiry;
        const expiry = new Date(rawExpiry);
        const now = new Date();
        
        // คำนวณส่วนต่างมิลลิวินาทีแปลงออกมาเป็นจำนวนวัน
        const diffTime = expiry.getTime() - now.getTime();
        daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }
    }

    // 🚀 ส่งข้อมูลแพลนปัจจุบัน วันหมดอายุ และจำนวนวันคงเหลือกลับไปพร้อมกันทีเดียว
    return new NextResponse(JSON.stringify({ 
        success: true, 
        plans, 
        isFirstTimeBuyer,
        currentPlan,
        expiryDate,
        daysLeft
    }), {
      status: 200, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}