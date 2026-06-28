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
      // Inclusive of today: today + previous 29 days = 30 calendar days.
      const limitDate = nowLocal.subtract(29, 'day').startOf('day');
      if (startDate.isBefore(limitDate)) {
        startDate = limitDate;
        if (endDate.isBefore(limitDate)) endDate = limitDate;
        limitWarning = true;
      }
    }

    // 🚀 อ่านจากตารางสรุปทั้งหมด เพื่อให้ Dashboard ตอบสนองเร็วเมื่อข้อมูลโตขึ้น
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

    // เติมข้อมูลวันที่ขาดหายไปด้วยยอดขาย 0 เพื่อให้กราฟพล็อตได้ตรงกับปฏิทินจริงและยอดสะสมไม่ข้ามวัน
    const filledDailySales: any[] = [];
    let cur = startDate.clone();
    const salesMap = new Map(dailySales.map(item => [item.report_date, item]));

    while (cur.isBefore(endDate) || cur.isSame(endDate, 'day')) {
      const dateStr = cur.format('YYYY-MM-DD');
      const existing = salesMap.get(dateStr);
      if (existing) {
        filledDailySales.push(existing);
      } else {
        filledDailySales.push({
          brand_id: brandId,
          report_date: dateStr,
          total_revenue: 0,
          total_orders: 0,
          total_payments: 0,
          customer_count: 0,
          total_cash: 0,
          total_transfer: 0
        });
      }
      cur = cur.add(1, 'day');
    }

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
      summary.totalOrders += Number(day.total_payments || 0);
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

    let hourlySales: any[] = [];
    let paymentStats: any[] = [];
    let tableStats: any[] = [];
    let cashierStats: any[] = [];

    if (effectivePlan === 'pro' || effectivePlan === 'ultimate') {
      const [hourlyRes, paymentRes, tableRes, cashierRes] = await Promise.all([
        supabase
          .from('dashboard_hourly_sales')
          .select('*')
          .eq('brand_id', brandId)
          .gte('report_date', startDate.format('YYYY-MM-DD'))
          .lte('report_date', endDate.format('YYYY-MM-DD')),
        supabase
          .from('dashboard_payment_stats')
          .select('*')
          .eq('brand_id', brandId)
          .gte('report_date', startDate.format('YYYY-MM-DD'))
          .lte('report_date', endDate.format('YYYY-MM-DD')),
        supabase
          .from('dashboard_table_stats')
          .select('*')
          .eq('brand_id', brandId)
          .gte('report_date', startDate.format('YYYY-MM-DD'))
          .lte('report_date', endDate.format('YYYY-MM-DD')),
        supabase
          .from('dashboard_cashier_stats')
          .select(`
            total_revenue,
            total_payments,
            cashier_id,
            profiles (
              full_name,
              avatar_url
            )
          `)
          .eq('brand_id', brandId)
          .gte('report_date', startDate.format('YYYY-MM-DD'))
          .lte('report_date', endDate.format('YYYY-MM-DD'))
      ]);

      if (hourlyRes.error) console.error("Hourly stats error:", hourlyRes.error);
      if (paymentRes.error) console.error("Payment stats error:", paymentRes.error);
      if (tableRes.error) console.error("Table stats error:", tableRes.error);
      if (cashierRes.error) console.error("Cashier stats error:", cashierRes.error);

      const hourlyRaw = hourlyRes.data || [];
      const paymentRaw = paymentRes.data || [];
      const tableRaw = tableRes.data || [];
      const cashierRaw = cashierRes.data || [];

      // A. Hourly aggregation (0 - 23)
      const hourlyMap: Record<number, { hour: number, revenue: number, orders: number }> = {};
      for (let h = 0; h < 24; h++) {
        hourlyMap[h] = { hour: h, revenue: 0, orders: 0 };
      }
      hourlyRaw.forEach(row => {
        const h = Number(row.report_hour);
        if (hourlyMap[h] !== undefined) {
          hourlyMap[h].revenue += Number(row.total_revenue || 0);
          hourlyMap[h].orders += Number(row.total_payments || 0);
        }
      });
      hourlySales = Object.values(hourlyMap);

      // B. Payment aggregation
      const paymentMap: Record<string, { method: string, revenue: number, orders: number }> = {};
      paymentRaw.forEach(row => {
        const m = (row.payment_method || 'unknown').toLowerCase();
        if (!paymentMap[m]) {
          paymentMap[m] = { method: m, revenue: 0, orders: 0 };
        }
        paymentMap[m].revenue += Number(row.total_revenue || 0);
        paymentMap[m].orders += Number(row.total_payments || 0);
      });
      paymentStats = Object.values(paymentMap);

      // C. Table aggregation
      const tableMap: Record<string, { table: string, type: string, revenue: number, orders: number }> = {};
      tableRaw.forEach(row => {
        const key = `${row.order_type || ''}_${row.table_label || ''}`;
        if (!tableMap[key]) {
          tableMap[key] = {
            table: row.table_label || '',
            type: row.order_type || '',
            revenue: 0,
            orders: 0
          };
        }
        tableMap[key].revenue += Number(row.total_revenue || 0);
        tableMap[key].orders += Number(row.total_payments || 0);
      });
      tableStats = Object.values(tableMap);

      // D. Cashier aggregation
      const cashierMap: Record<string, { cashierId: string, name: string, avatarUrl: string, revenue: number, orders: number }> = {};
      cashierRaw.forEach(row => {
        const cid = row.cashier_id || 'unknown';
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        const name = profile?.full_name || 'พนักงาน';
        const avatarUrl = profile?.avatar_url || '';

        if (!cashierMap[cid]) {
          cashierMap[cid] = {
            cashierId: cid,
            name,
            avatarUrl,
            revenue: 0,
            orders: 0
          };
        }
        cashierMap[cid].revenue += Number(row.total_revenue || 0);
        cashierMap[cid].orders += Number(row.total_payments || 0);
      });
      cashierStats = Object.values(cashierMap);
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        chartData: filledDailySales,
        topProducts,
        effectivePlan,
        limitWarning,
        hourlySales,
        paymentStats,
        tableStats,
        cashierStats
      }
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
