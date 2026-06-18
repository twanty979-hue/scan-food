// app/api/receipts/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🎯 เปลี่ยนมาตรฐานการแบ่งหน้าส่งข้อมูลทีละ 20 รายการตามใจนายครับ
const PAGE_SIZE = 20;

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

const getSupabaseAndBrandId = async (request: Request) => {
  const authHeader = request.headers.get('authorization');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles').select('brand_id').eq('id', user.id).single();

  if (!profile?.brand_id) throw new Error('No brand assigned');
  return { supabase, brandId: profile.brand_id };
};

export async function GET(request: Request) {
  try {
    const { supabase, brandId } = await getSupabaseAndBrandId(request);
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (!startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุ start_date และ end_date' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // 1. ดึงบิลสำเร็จ (pai_orders)
    const paidPromise = supabase
      .from('pai_orders')
      .select(`
        *,
        brand:brands(name),
        cashier:profiles(full_name),
        orders:orders!orders_payment_id_fkey (
          id, table_label, status,
          order_items (product_name, quantity, price, variant, promotion_snapshot, status, note)
        )
      `, { count: 'exact' })
      .eq('brand_id', brandId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })
      .range(from, to);

    // 2. ดึงบิลยกเลิก (orders)
    const cancelledPromise = supabase
      .from('orders')
      .select(`
        *,
        brand:brands(name),
        order_items (product_name, quantity, price, variant, promotion_snapshot, status, note)
      `, { count: 'exact' })
      .eq('brand_id', brandId)
      .eq('status', 'cancelled') 
      .is('payment_id', null)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })
      .range(from, to);

    const [paidRes, cancelledRes] = await Promise.all([paidPromise, cancelledPromise]);

    if (paidRes.error) throw paidRes.error;
    if (cancelledRes.error) throw cancelledRes.error;

    const paidData = (paidRes.data || []).map((receipt: any) => {
      const allItems = receipt.orders?.flatMap((o: any) => o.order_items || []) || [];
      const tableName = receipt.orders?.[0]?.table_label || 'Walk-in';
      const isActuallyCancelled = receipt.orders?.every((o: any) => o.status === 'cancelled');

      return {
        id: receipt.id,
        brand_id: receipt.brand_id,
        created_at: receipt.created_at,
        table_label: tableName,
        total_amount: receipt.total_amount,
        received_amount: receipt.received_amount,
        change_amount: receipt.change_amount,
        payment_method: isActuallyCancelled ? 'CANCELLED' : receipt.payment_method,
        brand: receipt.brand,
        cashier: receipt.cashier || { full_name: 'System' },
        items: allItems,
        status: isActuallyCancelled ? 'cancelled' : 'paid',
        orders: receipt.orders 
      };
    });

    const cancelledData = (cancelledRes.data || []).map((order: any) => {
      return {
        id: order.id, 
        brand_id: order.brand_id,
        created_at: order.created_at,
        table_label: order.table_label,
        total_amount: order.total_price,
        received_amount: 0, 
        change_amount: 0,
        payment_method: 'CANCELLED',
        brand: order.brand,
        cashier: { full_name: 'System (Void)' }, 
        items: order.order_items,
        status: 'cancelled',
        orders: [order] 
      };
    });

    const combinedData = [...paidData, ...cancelledData].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const hasMore = (paidRes.count! > to + 1) || (cancelledRes.count! > to + 1);

    return new NextResponse(JSON.stringify({ success: true, data: combinedData, hasMore }), {
      status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}