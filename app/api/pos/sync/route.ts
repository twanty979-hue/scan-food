// app/api/pos/sync/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    let { newOrderData, itemsToSave, paiOrderData, syncPayload } = payload;

    if (!newOrderData || !itemsToSave || !paiOrderData) {
      throw new Error('รูปแบบโครงสร้างข้อมูลใน Payload ไม่ถูกต้องหรือไม่ครบถ้วน');
    }
    
    // 🛡️ ผูก brand_id และ cashier_id
    newOrderData.brand_id = brandId;
    paiOrderData.brand_id = brandId;
    paiOrderData.cashier_id = userId; // 👈 2️⃣ ยัด ID พนักงานแคชเชียร์อัตโนมัติ ปลอดภัยกว่าให้แอปส่งมา

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

    // C. สร้าง order_items และ pai_orders ขนานกันได้เลย (เพราะ orders ถูกสร้างรอไว้แล้ว)
    const [itemsRes, paiRes] = await Promise.all([
      supabase.from('order_items').upsert(processedItems),
      supabase.from('pai_orders').upsert(paiOrderData)
    ]);
    if (itemsRes.error) throw itemsRes.error;
    if (paiRes.error) throw paiRes.error;

    // D. ย้อนกลับไปอัปเดตใส่ payment_id ให้กับ orders เพื่อให้ Foreign Key สมบูรณ์
    if (targetPaymentId) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_id: targetPaymentId })
        .eq('id', newOrderData.id);
      if (updateError) throw updateError;
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