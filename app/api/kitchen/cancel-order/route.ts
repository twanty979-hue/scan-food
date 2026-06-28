// app/api/kitchen/cancel-order/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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

// 🔐 Helper: แกะบัตรพนักงานหา brand_id
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
  return { supabase, user, brandId: profile.brand_id };
};

export async function POST(request: Request) {
  try {
    const { supabase, user, brandId } = await getSupabaseAndBrandId(request);
    
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // 🌟 อัปเดตสถานะบิลหลักเป็น cancelled (ล็อกด้วย brand_id ป้องกันข้ามร้าน)
    const { error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        cancelled_by: user.id,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('brand_id', brandId); // ล็อกสิทธิ์!

    if (orderError) throw orderError;

    // อัปเดต item ข้างในให้เป็น cancelled ด้วย
    const { error: itemsError } = await supabase
      .from('order_items')
      .update({ 
        status: 'cancelled',
        cancelled_by: user.id,
        cancelled_at: new Date().toISOString()
      })
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return NextResponse.json({ success: true }, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}