// app/api/marketplace/purchase/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs'; // ใช้งาน dayjs เพื่อจัดการวันที่

const PURCHASED_THEME_TYPES = ['free', 'weekly', 'monthly', 'yearly', 'lifetime'];

// ตั้งค่า CORS ให้ Flutter หรือแอปอื่นสามารถยิง API เข้ามาได้
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// จัดการ Preflight Request
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    // 1. รับข้อมูลจาก Flutter (body: { theme_id, plan })
    const body = await request.json();
    const { theme_id, plan } = body; 

    if (!theme_id || !plan) {
      return NextResponse.json(
        { success: false, error: 'กรุณาส่ง theme_id และ plan ให้ครบถ้วน' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. ตรวจสอบ Token (ผู้ใช้ต้องล็อกอิน)
    const authHeader = request.headers.get('authorization');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader || '' } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized: กรุณาล็อกอิน');

    // 3. ตรวจสอบสิทธิ์ (ต้องเป็น owner เท่านั้นถึงจะซื้อได้)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, brand_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.brand_id) throw new Error('ไม่พบข้อมูลร้านค้า');
    if (profile.role !== 'owner') throw new Error('Permission denied: เจ้าของร้านเท่านั้นที่สามารถสั่งซื้อได้');

    const brandId = profile.brand_id;

    // 4. ดึงข้อมูล ธีม และ ยอดเหรียญปัจจุบันจาก Database
    const { data: themeData } = await supabase.from('marketplace_themes').select('*').eq('id', theme_id).single();
    const { data: brand } = await supabase.from('brands').select('*').eq('id', brandId).single();

    if (!themeData || !brand) throw new Error('ไม่พบข้อมูลธีมหรือร้านค้า');

    // 5. คำนวณราคาและจำนวนวันที่ต้องบวกเพิ่ม
    let requiredCoins = 0;
    let daysToAdd = 0;
    
    switch (plan) {
      case 'weekly':
        requiredCoins = themeData.price_weekly || 0;
        daysToAdd = 7;
        break;
      case 'monthly':
        requiredCoins = themeData.price_monthly || 0;
        daysToAdd = 30;
        break;
      case 'yearly':
        requiredCoins = themeData.price_yearly || 0;
        daysToAdd = 365;
        break;
      case 'free':
        requiredCoins = 0;
        daysToAdd = 0; 
        break;
      default:
        throw new Error("Plan ที่ส่งมาไม่ถูกต้อง (รองรับ: free, weekly, monthly, yearly)");
    }

    const currentCoins = brand.coins || 0;

    // 6. กระบวนการจ่ายเงิน (ถ้าต้องใช้เหรียญ)
    if (requiredCoins > 0) {
      if (currentCoins < requiredCoins) {
        return NextResponse.json({ success: false, error: 'เหรียญไม่เพียงพอ' }, { status: 400, headers: corsHeaders });
      }

      // ตัดเหรียญ
      const { error: updateBrandError } = await supabase
        .from('brands')
        .update({ coins: currentCoins - requiredCoins })
        .eq('id', brandId);

      if (updateBrandError) throw new Error('ตัดเหรียญไม่สำเร็จ');

      // บันทึกประวัติการใช้เหรียญ (Coin Logs)
      await supabase.from('coin_logs').insert({
        brand_id: brandId,
        amount: -requiredCoins,
        action: 'buy_theme',
        details: `Purchased theme: ${themeData.name} (${plan}) via App`
      });
    }

    // 7. คำนวณวันหมดอายุ และ แจกธีมให้แบรนด์
    const now = dayjs();
    let baseDate = now;
    
    // เช็กว่ามีของเดิมอยู่ไหม ถ้ามีและยังไม่หมดอายุ ให้บวกวันเพิ่ม (Top-up)
    const { data: existingTheme } = await supabase.from('themes')
      .select('expires_at')
      .eq('brand_id', brandId)
      .eq('marketplace_theme_id', theme_id)
      .in('purchase_type', PURCHASED_THEME_TYPES)
      .single();

    if (existingTheme?.expires_at && dayjs(existingTheme.expires_at).isAfter(now)) {
      baseDate = dayjs(existingTheme.expires_at);
    }

    const finalExpiresAt = plan === 'free' ? null : baseDate.add(daysToAdd, 'day').toISOString();
    const purchaseType = plan === 'free' ? 'free' : plan;

    // Upsert ข้อมูลการครอบครองธีม
    const { error: upsertError } = await supabase.from('themes').upsert({
      brand_id: brandId,
      marketplace_theme_id: theme_id,
      purchase_type: purchaseType,
      expires_at: finalExpiresAt,
      updated_at: new Date().toISOString()
    }, { onConflict: 'brand_id, marketplace_theme_id' });

    if (upsertError) {
      // (ถ้ามี Error ตรงนี้ ในระบบใหญ่ควรทำ Rollback คืนเงิน แต่เบื้องต้นดัก Error ไว้ก่อนครับ)
      throw new Error('เกิดข้อผิดพลาดในการมอบสิทธิ์ธีม');
    }




    
    // 8. ส่งผลลัพธ์กลับให้ Flutter แบบสวยๆ
    return NextResponse.json({
      success: true,
      message: 'สั่งซื้อสำเร็จ!',
      new_coin_balance: currentCoins - requiredCoins,
      expires_at: finalExpiresAt
    }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}