// app/actions/receiptActions.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const PAGE_SIZE = 50;

export async function getReceiptsAction(startDate: string, endDate: string, page: number = 1) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles').select('brand_id').eq('id', user.id).single();

    if (!profile?.brand_id) return { success: false, error: 'No brand assigned' };

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // =================================================================================
    // 1. ดึงบิลที่ "จ่ายเงินแล้ว" (จากตาราง pai_orders เป็นหลัก)
    // =================================================================================
    // เราใช้ความสัมพันธ์ orders_payment_id_fkey เพื่อดึงออเดอร์ทั้งหมดที่ผูกกับบิลนี้
    const paidPromise = supabase
      .from('pai_orders')
      .select(`
        *,
        brand:brands(name),
        cashier:profiles(full_name),
        orders:orders!orders_payment_id_fkey (
          id,
          table_label,
          status,
          order_items (
            product_name,
            quantity,
            price,
            variant,
            promotion_snapshot,
            status,
            note
          )
        )
      `, { count: 'exact' })
      .eq('brand_id', profile.brand_id)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })
      .range(from, to);

    // =================================================================================
    // 2. ดึงบิลที่ "ยกเลิก" (จากตาราง orders โดยตรง)
    // =================================================================================
    // เงื่อนไข: status ต้องเป็น cancelled และต้องไม่มี payment_id (เพื่อไม่ให้ซ้ำกับข้างบน)
    const cancelledPromise = supabase
      .from('orders')
      .select(`
        *,
        brand:brands(name),
        order_items (
            product_name,
            quantity,
            price,
            variant,
            promotion_snapshot,
            status,
            note
        )
      `, { count: 'exact' })
      .eq('brand_id', profile.brand_id)
      .eq('status', 'cancelled') 
      .is('payment_id', null) // ✅ สำคัญ: ดึงเฉพาะอันที่ยังไม่ได้จ่ายเงิน
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })
      .range(from, to);

    // ทำงานพร้อมกัน 2 queries
    const [paidRes, cancelledRes] = await Promise.all([paidPromise, cancelledPromise]);

    if (paidRes.error) throw paidRes.error;
    if (cancelledRes.error) throw cancelledRes.error;

    // =================================================================================
    // 3. รวมข้อมูล (Mapping) ให้เป็น format เดียวกัน
    // =================================================================================
    
    // แปลงข้อมูล Paid
    const paidData = (paidRes.data || []).map((receipt: any) => {
      // รวม items จากทุกออเดอร์ในบิล (กรณีรวมโต๊ะ)
      const allItems = receipt.orders?.flatMap((o: any) => o.order_items || []) || [];
      const tableName = receipt.orders?.[0]?.table_label || 'Walk-in';

      // เช็คเผื่อว่าออเดอร์ในบิลถูกยกเลิกทีหลัง (Paid -> Cancelled)
      const isActuallyCancelled = receipt.orders?.every((o: any) => o.status === 'cancelled');

      return {
        id: receipt.id,
        created_at: receipt.created_at,
        table_label: tableName,
        total_amount: receipt.total_amount,
        received_amount: receipt.received_amount, // ✅ ได้ค่าจาก pai_orders เป๊ะๆ
        change_amount: receipt.change_amount,     // ✅ ได้ค่าจาก pai_orders เป๊ะๆ
        payment_method: isActuallyCancelled ? 'CANCELLED' : receipt.payment_method,
        brand: receipt.brand,
        cashier: receipt.cashier || { full_name: 'System' },
        items: allItems,
        status: isActuallyCancelled ? 'cancelled' : 'paid',
        orders: receipt.orders // เก็บ structure เดิมไว้เผื่อใช้
      };
    });

    // แปลงข้อมูล Cancelled
    const cancelledData = (cancelledRes.data || []).map((order: any) => {
      return {
        id: order.id, // ใช้ Order ID เป็น ID หลัก
        created_at: order.created_at,
        table_label: order.table_label,
        total_amount: order.total_price,
        received_amount: 0, // ยกเลิก = ไม่ได้รับเงิน
        change_amount: 0,
        payment_method: 'CANCELLED', // ✅ บังคับเป็น CANCELLED ให้ตัวหนังสือเป็นสีแดง
        brand: order.brand,
        cashier: { full_name: 'System (Void)' }, // ไม่มี cashier_id ใน orders เลยใช้ System แทน
        items: order.order_items,
        status: 'cancelled',
        // จำลอง structure ให้เหมือน paid เพื่อให้หน้าบ้านไม่ต้องแก้เยอะ
        orders: [order] 
      };
    });

    // จับรวมกันแล้วเรียงตามเวลาล่าสุด
    const combinedData = [...paidData, ...cancelledData].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const hasMore = (paidRes.count! > to + 1) || (cancelledRes.count! > to + 1);

    return { success: true, data: combinedData, hasMore };

  } catch (error: any) {
    console.error("Get Receipts Error:", error);
    return { success: false, error: error.message };
  }
}