// app/api/pos/sync/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rebuildDashboardCashierStats } from '@/lib/dashboardCashierStats';
import { rebuildDashboardDailyPaymentCount } from '@/lib/dashboardDailySales';
import { checkOrderLimitOrThrow } from '@/app/actions/limitGuard';

// --- 🌐 จัดการ CORS Preflight รองรับการยิงจากโมบายล์แอป ---
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const makeTableToken = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const uniqueTokens = (tokens: any[]) => Array.from(new Set((tokens || []).filter(Boolean).map(String)));
const getTableTokens = (table: any) => {
  const tokens = Array.isArray(table?.access_tokens) ? table.access_tokens.filter(Boolean).map(String) : [];
  if (tokens.length > 0) return uniqueTokens(tokens);
  return table?.access_token ? [String(table.access_token)] : [];
};
const removeUsedTokens = (currentTokens: any[], usedTokens: any[]) => {
  const used = new Set(uniqueTokens(usedTokens));
  const remaining = uniqueTokens(currentTokens).filter(token => !used.has(token));
  return remaining.length > 0 ? remaining : [makeTableToken()];
};

const getSupabaseAndBrandId = async (request: Request) => {
  const authHeader = request.headers.get('authorization');
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('brand_id')
    .eq('id', user.id)
    .single();

  if (!profile?.brand_id) throw new Error('No brand assigned');
  
  // 🔥 ส่ง userId ออกไปใช้งานด้วย
  return { supabase, brandId: profile.brand_id, userId: user.id };
};


export async function POST(request: Request) {
  try {
    // 🔥 รับ userId มาใช้งาน
    const { supabase, brandId, userId } = await getSupabaseAndBrandId(request);
    
    const payload = await request.json();
    console.log("📦 [DEBUG] โครงสร้างที่แอปส่งมา:", JSON.stringify(payload, null, 2));

    let { action, newOrderData, itemsToSave, paiOrderData, syncPayload, orderId, orderIds, itemId, itemIds, cancelledAt, cancelReason, isNewOffline } = payload;

    // 🛡️ เช็คโควต้าก่อนทำการบันทึกข้อมูล (ไม่เช็คกรณียกเลิกออเดอร์)
    if (action !== 'cancel_order' && action !== 'cancel_order_item') {
      await checkOrderLimitOrThrow(brandId);
    }

    if (action === 'cancel_order_item') {
      const targetItemIds = Array.isArray(itemIds)
        ? itemIds.filter(Boolean).map(String)
        : itemId
          ? [String(itemId)]
          : [];

      if (targetItemIds.length === 0) {
        throw new Error('Missing itemId for item cancellation');
      }
      if (!orderId) {
        throw new Error('Missing orderId for item cancellation');
      }

      const { data: orderData, error: orderFetchError } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .eq('brand_id', brandId)
        .maybeSingle();

      if (orderFetchError) throw orderFetchError;
      if (!orderData?.id) throw new Error('Order not found for this brand');

      const cancelledAtValue = cancelledAt || new Date().toISOString();
      const { error: itemUpdateError } = await supabase
        .from('order_items')
        .update({
          status: 'cancelled',
          cancelled_by: userId,
          cancelled_at: cancelledAtValue,
          cancel_reason: cancelReason || null
        })
        .in('id', targetItemIds)
        .eq('order_id', orderData.id);

      if (itemUpdateError) throw itemUpdateError;

      const response = NextResponse.json({
        success: true,
        message: 'ยกเลิกรายการสำเร็จ',
        itemIds: targetItemIds,
      });
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    if (action === 'cancel_order') {
      const targetOrderIds = Array.isArray(orderIds)
        ? orderIds.filter(Boolean).map(String)
        : orderId
          ? [String(orderId)]
          : [];

      if (targetOrderIds.length === 0) throw new Error('Missing orderId for cancellation');
      
      if (isNewOffline && newOrderData && itemsToSave) {
        // ออเดอร์แบบ Walk-in ที่ยังไม่เคยขึ้น Cloud เลย แต่ถูกยกเลิกไปแล้ว
        const { error: orderError } = await supabase.from('orders').upsert(newOrderData);
        if (orderError) throw orderError;
        
        const { error: itemsError } = await supabase.from('order_items').upsert(itemsToSave);
        if (itemsError) throw itemsError;
      } else {
        // ออเดอร์ที่มีอยู่บน Cloud อยู่แล้ว แค่อัปเดตสถานะ
        const { error: orderError } = await supabase.from('orders').update({
          status: 'cancelled',
          cancelled_by: userId,
          cancelled_at: cancelledAt || new Date().toISOString()
        }).in('id', targetOrderIds).eq('brand_id', brandId);
        if (orderError) throw orderError;
        
        const { error: itemsError } = await supabase.from('order_items').update({
          status: 'cancelled',
          cancelled_by: userId,
          cancelled_at: cancelledAt || new Date().toISOString()
        }).in('order_id', targetOrderIds);
        if (itemsError) throw itemsError;
      }

      const response = NextResponse.json({
        success: true,
        message: 'ยกเลิกออเดอร์สำเร็จ',
        orderIds: targetOrderIds,
      });
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    if (!newOrderData || !itemsToSave || !paiOrderData) {
      throw new Error('รูปแบบโครงสร้างข้อมูลใน Payload ไม่ถูกต้องหรือไม่ครบถ้วน');
    }
    
    // 🛡️ ผูก brand_id และ cashier_id
    newOrderData.brand_id = brandId;
    paiOrderData.brand_id = brandId;

    // Keep the cashier who made the offline sale, not the user who happens to
    // press sync later. Only accept a cached cashier from the same brand.
    const requestedCashierId = String(paiOrderData.cashier_id || '');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestedCashierId);
    let resolvedCashierId = userId;
    const privilegedSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { autoRefreshToken: false, persistSession: false } }
        )
      : supabase;

    if (isUuid && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: cashierProfile } = await privilegedSupabase
        .from('profiles')
        .select('id')
        .eq('id', requestedCashierId)
        .eq('brand_id', brandId)
        .maybeSingle();
      if (cashierProfile?.id) resolvedCashierId = cashierProfile.id;
    }
    paiOrderData.cashier_id = resolvedCashierId;

    const processedItems = itemsToSave.map((item: any) => ({
      ...item,
      promotion_snapshot: typeof item.promotion_snapshot === 'string' 
        ? JSON.parse(item.promotion_snapshot) 
        : item.promotion_snapshot
    }));

    // ---------------------------------------------------------
    // 🚧 3️⃣ จัดลำดับการเซฟใหม่ แก้ปัญหา "ไก่กับไข่" (Circular Foreign Key)
    // ---------------------------------------------------------

    // A. เก็บ payment_id ของบิลนี้ไว้ก่อน แล้วลบออกจาก object ชั่วคราวเพื่อไม่ให้ติด Error
    const targetPaymentId = paiOrderData.id; 
    delete newOrderData.payment_id; 

    // B. สร้างหัวบิล orders ก่อน (ตอนนี้ยังไม่มี payment_id)
    const { error: orderError } = await supabase
      .from('orders')
      .upsert(newOrderData);
    if (orderError) throw orderError;

    // C. บันทึกรายการสินค้า และสร้าง Pai เฉพาะเมื่อยังไม่มี
    // ห้าม upsert Pai เดิม เพราะการ retry จะกลายเป็น UPDATE และอาจเรียก
    // trigger ฝั่งฐานข้อมูลที่ไม่เกี่ยวกับการซิงค์ซ้ำ
    const itemsRes = await supabase
      .from('order_items')
      .upsert(processedItems);
    if (itemsRes.error) throw itemsRes.error;

    const { data: existingPayment, error: existingPaymentError } =
      await supabase
        .from('pai_orders')
        .select('id')
        .eq('id', targetPaymentId)
        .maybeSingle();
    if (existingPaymentError) throw existingPaymentError;

    if (!existingPayment) {
      const { error: paiError } = await supabase
        .from('pai_orders')
        .insert(paiOrderData);
      if (paiError) throw paiError;
    }

    // D. ย้อนกลับไปอัปเดตใส่ payment_id ให้กับ orders เพื่อให้ Foreign Key สมบูรณ์
    if (targetPaymentId) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_id: targetPaymentId })
        .eq('id', newOrderData.id);
      if (updateError) throw updateError;
    }

    // Dashboard summaries must never make a completed sale fail to sync.
    // They are derived data and can be rebuilt later from pai_orders.
    const paymentCreatedAt =
      paiOrderData.created_at || new Date().toISOString();
    const dashboardResults = await Promise.allSettled([
      rebuildDashboardCashierStats(privilegedSupabase, {
        brandId,
        cashierId: resolvedCashierId,
        paymentCreatedAt,
      }),
      rebuildDashboardDailyPaymentCount(privilegedSupabase, {
        brandId,
        paymentCreatedAt,
      }),
    ]);
    dashboardResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        const summaryName = index === 0 ? 'cashier' : 'daily-payment';
        console.error(
          `[SYNC] Dashboard ${summaryName} summary failed:`,
          result.reason,
        );
      }
    });

    // Cut stock only for active retail products that have a barcode.
    // Reuse order_item.id as stock_logs.id so retrying an offline sync cannot
    // deduct the same sold item more than once.
    const stockCandidates = processedItems.filter((item: any) => {
      const quantity = Number(item.quantity ?? item.qty ?? 0);
      return (
        item.id &&
        item.product_id &&
        item.status !== 'cancelled' &&
        Number.isFinite(quantity) &&
        quantity > 0
      );
    });

    const stockProductIds = Array.from(
      new Set(stockCandidates.map((item: any) => String(item.product_id)))
    );

    if (stockProductIds.length > 0) {
      const { data: barcodeProducts, error: barcodeProductsError } = await supabase
        .from('product_master')
        .select('id, barcode')
        .eq('brand_id', brandId)
        .in('id', stockProductIds);

      if (barcodeProductsError) throw barcodeProductsError;

      const barcodeProductIds = new Set(
        (barcodeProducts || [])
          .filter((product: any) => String(product.barcode || '').trim().length > 0)
          .map((product: any) => String(product.id))
      );

      const { data: cashierProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', resolvedCashierId)
        .maybeSingle();

      const saleStockLogs = stockCandidates
        .filter((item: any) => barcodeProductIds.has(String(item.product_id)))
        .map((item: any) => {
          const quantity = Math.trunc(Number(item.quantity ?? item.qty));
          return {
            id: item.id,
            product_id: item.product_id,
            change_amount: -quantity,
            action_type: 'SALE',
            note: `ขาย ${item.product_name || 'สินค้า'} จำนวน ${quantity}`,
            transaction_id: null,
            source_event_id: item.id,
            order_id: newOrderData.id,
            performed_by: resolvedCashierId,
            performed_by_name: cashierProfile?.full_name || null,
          };
        });

      if (saleStockLogs.length > 0) {
        const { error: stockLogsError } = await supabase
          .from('stock_logs')
          .upsert(saleStockLogs, {
            onConflict: 'id',
            ignoreDuplicates: true,
          });

        if (stockLogsError) throw stockLogsError;
      }
    }

    // ---------------------------------------------------------
    if (syncPayload?.type === 'tables' && syncPayload?.table_label && syncPayload.table_label !== 'Walk-in') {
      let tableQuery = supabase
        .from('tables')
        .select('id, access_token, access_tokens')
        .eq('brand_id', brandId);

      tableQuery = syncPayload.table_id ? tableQuery.eq('id', syncPayload.table_id) : tableQuery.eq('label', syncPayload.table_label);
      const { data: tableData, error: tableFetchError } = await tableQuery.single();
      if (tableFetchError) throw tableFetchError;

      const usedTokens = uniqueTokens(syncPayload.used_tokens || []);
      const nextTokens = removeUsedTokens(getTableTokens(tableData), usedTokens.length > 0 ? usedTokens : [tableData?.access_token]);
      const { error: tableUpdateError } = await supabase
        .from('tables')
        .update({ access_token: nextTokens[0], access_tokens: nextTokens })
        .eq('id', tableData.id)
        .eq('brand_id', brandId);
      if (tableUpdateError) throw tableUpdateError;
    }
    const response = NextResponse.json({
      success: true,
      message: 'ซิงค์ข้อมูลบิลออฟไลน์เข้าสู่ระบบ Cloud เรียบร้อยแล้ว',
      orderId: newOrderData.id
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    console.error("❌ [API Sync Error]:", error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
