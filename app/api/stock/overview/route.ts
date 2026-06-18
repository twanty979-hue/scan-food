// app/api/stock/overview/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    // 1. ตรวจสอบ Token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }
    const token = authHeader.split(' ')[1];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    // 2. ดึงข้อมูล User & Brand ID
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) throw new Error('Invalid Token');

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('brand_id')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile?.brand_id) throw new Error('Brand not found');
    const brandId = profile.brand_id;

    // 🚀 3. ใช้ Promise.all ดึงข้อมูล 3 ก้อนพร้อมกัน (รีด Performance สุดๆ)
    const [stocksRes, lostLogsRes, recentTxRes] = await Promise.all([
      // ก้อน 1: สต็อกปัจจุบันและราคา
      supabase
        .from('stock')
        .select('quantity, product_master!inner(brand_id, price, cost_price)')
        .eq('product_master.brand_id', brandId),
      // ก้อน 2: ประวัติของเสีย
      supabase
        .from('stock_logs')
        .select('change_amount, product_master!inner(brand_id, price, cost_price)')
        .eq('product_master.brand_id', brandId)
        .in('action_type', ['ADJUST_OUT', 'WASTE']),
      // ก้อน 3: ประวัติล่าสุด 5 รายการ
      supabase
        .from('stock_transactions')
        .select('id, ref_no, note, created_at')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    if (stocksRes.error) throw stocksRes.error;
    if (lostLogsRes.error) throw lostLogsRes.error;
    if (recentTxRes.error) throw recentTxRes.error;

    // 4. คำนวณค่าต่างๆ ให้เสร็จจากหลังบ้าน
    let totalSKUs = 0, totalItems = 0, lowStockCount = 0, outOfStockCount = 0, totalValue = 0;
    if (stocksRes.data) {
      totalSKUs = stocksRes.data.length;
      stocksRes.data.forEach((s: any) => {
        if (s.quantity > 0) {
          totalItems += s.quantity;
          const itemPrice = Number(s.product_master.cost_price || s.product_master.price || 0);
          totalValue += s.quantity * itemPrice;
        }
        if (s.quantity > 0 && s.quantity <= 5) lowStockCount++;
        if (s.quantity <= 0) outOfStockCount++;
      });
    }

    let lostValue = 0, lostItemsCount = 0;
    if (lostLogsRes.data) {
      lostLogsRes.data.forEach((log: any) => {
        const amount = Math.abs(log.change_amount); 
        const itemPrice = Number(log.product_master.cost_price || log.product_master.price || 0);
        lostValue += amount * itemPrice;
        lostItemsCount += amount;
      });
    }

    return NextResponse.json({
      success: true,
      stats: { totalSKUs, totalItems, lowStockCount, outOfStockCount, totalValue, lostValue, lostItemsCount },
      recentTransactions: recentTxRes.data || []
    }, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400, headers: corsHeaders });
  }
}