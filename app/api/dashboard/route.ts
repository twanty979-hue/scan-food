// app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// --- 🌐 จัดการ CORS Preflight ---
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

// 🔐 Helper: คำนวณสิทธิ์ใช้งานร้านค้า (ถอดแบบความปลอดภัยจาก Server Action)
function calculateEffectivePlan(brand: any) {
  const now = dayjs();
  const parseExpiry = (dateString: string | null) => {
    if (!dateString) return null;
    return dayjs(dateString.replace(' ', 'T'));
  };
  
  if (brand?.plan === 'ultimate') {
    const exp = parseExpiry(brand.expiry_ultimate);
    if (exp && exp.isValid() && exp.isAfter(now)) return 'ultimate';
  }
  if (brand?.plan === 'pro') {
    const exp = parseExpiry(brand.expiry_pro);
    if (exp && exp.isValid() && exp.isAfter(now)) return 'pro';
  }
  if (brand?.plan === 'basic') {
    const exp = parseExpiry(brand.expiry_basic);
    if (exp && exp.isValid() && exp.isAfter(now)) return 'basic';
  }
  return 'free';
}

// 🔐 Helper: แกะ Token ตรวจสอบสิทธิ์ความปลอดภัยและเอาข้อมูลแผนใช้งาน
const getSupabaseAndBrandContext = async (request: Request) => {
  const authHeader = request.headers.get('authorization');
  const supabase = createClient(
    process.env.SUPABASE_URL!, // ใช้ตัวแปรฝั่งเซิร์ฟเวอร์โดยตรงเพื่อความปลอดภัย
    process.env.SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('brand_id, brands(timezone, plan, expiry_basic, expiry_pro, expiry_ultimate)')
    .eq('id', user.id)
    .single();

  if (!profile?.brand_id) throw new Error('No brand assigned');
  
  const brand = Array.isArray(profile.brands) ? profile.brands[0] : profile.brands;
  return { 
    supabase, 
    brandId: profile.brand_id, 
    timezone: brand?.timezone || 'Asia/Bangkok',
    effectivePlan: calculateEffectivePlan(brand)
  };
};

// 📊 [GET] ดึงข้อมูลสถิติหน้าแดชบอร์ดส่งให้ตัวแปรในแอปพลิเคชัน
export async function GET(request: Request) {
  try {
    const { supabase, brandId, timezone: brandTimezone, effectivePlan } = await getSupabaseAndBrandContext(request);
    const { searchParams } = new URL(request.url);
    
    // 🛠️ เคลียร์บัคเวลา: ตั้งแกนวันเวลาปัจจุบันให้ตรงตาม Timezone ประจำร้านอาหาร
    let nowLocal = dayjs().tz(brandTimezone);
    
    let startDateInput = searchParams.get('start_date');
    let endDateInput = searchParams.get('end_date');

    let startDate = startDateInput ? dayjs.tz(startDateInput, brandTimezone).startOf('day') : nowLocal.subtract(30, 'day').startOf('day');
    let endDate = endDateInput ? dayjs.tz(endDateInput, brandTimezone).endOf('day') : nowLocal.endOf('day');

    // 🛡️ Limit Guard: ล็อกข้อมูลถ้าร้านค้าเป็น Free Plan ให้ดึงดูรายงานได้แค่ 30 วัน
    let limitWarning = false;
    if (effectivePlan === 'free') {
      const limitDate = nowLocal.subtract(30, 'day').startOf('day');
      if (startDate.isBefore(limitDate)) {
        startDate = limitDate;
        if (endDate.isBefore(limitDate)) endDate = limitDate;
        limitWarning = true;
      }
    }

    // 🚀 ดึงข้อมูลรายงานทั้ง 2 ส่วนพร้อมกันเพื่อลดระยะเวลาประมวลผล
    const [salesRes, productsRes] = await Promise.all([
      supabase
        .from('dashboard_daily_sales')
        .select('*')
        .eq('brand_id', brandId)
        .gte('report_date', startDate.format('YYYY-MM-DD'))
        .lte('report_date', endDate.format('YYYY-MM-DD'))
        .order('report_date', { ascending: true }),
        
      supabase
        .from('dashboard_product_stats')
        .select('*')
        .eq('brand_id', brandId)
        .gte('report_date', startDate.format('YYYY-MM-DD'))
        .lte('report_date', endDate.format('YYYY-MM-DD'))
    ]);

    if (salesRes.error) throw salesRes.error;
    if (productsRes.error) throw productsRes.error;

    const dailySales = salesRes.data || [];
    const productStats = productsRes.data || [];

    // 🧮 1. คำนวณสรุปยอดรวม (Summary)
    const summary = {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalCash: 0,
      totalTransfer: 0
    };

    dailySales.forEach(day => {
      summary.totalRevenue += Number(day.total_revenue || 0);
      summary.totalOrders += Number(day.total_orders || 0);
      summary.totalCustomers += Number(day.customer_count || 0);
      summary.totalCash += Number(day.total_cash || 0);
      summary.totalTransfer += Number(day.total_transfer || 0);
    });

    // 🏆 2. จัดอันดับสินค้าขายดี Top 10
    const productMap: Record<string, { name: string, qty: number, revenue: number }> = {};
    
    productStats.forEach(p => {
      if (!productMap[p.product_id]) {
        productMap[p.product_id] = { name: p.product_name, qty: 0, revenue: 0 };
      }
      productMap[p.product_id].qty += Number(p.total_quantity || 0);
      productMap[p.product_id].revenue += Number(p.total_revenue || 0);
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    const response = NextResponse.json({
      success: true,
      data: {
        summary,
        chartData: dailySales,
        topProducts,
        limitWarning // ส่งกลับบอกตัวแอปเผื่อเอาไปแสดงแจ้งเตือนอัปแพ็กเกจ
      }
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    console.error("❌ [API] Dashboard Error:", error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}