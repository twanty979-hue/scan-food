import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 🌐 อนุญาต CORS
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

// 🔐 Helper: แกะ Token เพื่อดึง brand_id และ user_id จากฝั่ง Server
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
  return { supabase, brandId: profile.brand_id, userId: user.id };
};

export async function POST(request: Request) {
  try {
    // 🚀 เช็คบัตร VIP และดึงข้อมูลร้าน/พนักงานจากหลังบ้าน
    const { supabase, brandId, userId } = await getSupabaseAndBrandId(request);

    const body = await request.json();
    const { ref_no, note, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ข้อมูลไม่ครบถ้วน (ไม่มีรายการสินค้า)' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 1. บันทึกหัวเอกสารรับเข้า (ใช้ brandId และ userId จาก Server ปลอดภัย 100%)
    const { data: tx, error: txErr } = await supabase
      .from('stock_transactions')
      .insert({
        brand_id: brandId,
        ref_no: ref_no || `IN-${Date.now()}`, 
        note: note || 'รับเข้าสต็อกผ่านแอปมือถือ',
        created_by: userId
      })
      .select()
      .single();

    if (txErr) throw txErr;

    // 2. เตรียมข้อมูลรายการสินค้า (Logs)
    const logs = items.map((item: any) => ({
      transaction_id: tx.id,
      product_id: item.product_id,
      change_amount: Math.abs(item.qty), // รับเข้าต้องเป็นบวกเสมอ
      action_type: 'IN',
      note: note || 'รับเข้าสต็อกผ่านแอปมือถือ'
    }));

    // 3. บันทึกรายการสินค้าลง Log
    const { error: logsErr } = await supabase
      .from('stock_logs')
      .insert(logs);

    if (logsErr) throw logsErr;

    return NextResponse.json(
      { success: true, message: 'บันทึกสต็อกเรียบร้อยแล้ว' },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}