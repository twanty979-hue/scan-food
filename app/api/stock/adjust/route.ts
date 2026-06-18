import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

type StockAdjustmentItem = {
  id?: string;
  product_id?: string;
  qty?: number | string | null;
  quantity?: number | string | null;
  change_amount?: number | string | null;
  action_type?: string | null;
  type?: string | null;
  note?: string | null;
};

type StockAdjustmentBody = {
  ref_no?: string;
  refNo?: string;
  note?: string;
  items?: StockAdjustmentItem[];
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('brand_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.brand_id) throw new Error('No brand assigned');
  return { supabase, brandId: profile.brand_id, userId: user.id };
};

const getRequestedType = (item: StockAdjustmentItem) => {
  return (item.action_type ?? item.type ?? '').toUpperCase();
};

const getItemQty = (item: StockAdjustmentItem, index: number) => {
  const qty = Number(item.qty ?? item.quantity ?? item.change_amount);
  if (!Number.isFinite(qty) || qty === 0) {
    throw new Error(`Invalid qty at item ${index + 1}`);
  }

  const requestedType = getRequestedType(item);
  if (requestedType === 'ADJUST_OUT' || requestedType === 'WASTE') {
    return -Math.abs(qty);
  }
  if (requestedType === 'ADJUST_IN') {
    return Math.abs(qty);
  }

  return qty;
};

const getProductId = (item: StockAdjustmentItem, index: number) => {
  const productId = item.product_id ?? item.id;
  if (!productId) throw new Error(`Missing product_id at item ${index + 1}`);
  return productId;
};

const getActionType = (item: StockAdjustmentItem, qty: number) => {
  if (qty >= 0) return 'ADJUST_IN';

  const requestedType = getRequestedType(item);
  return requestedType === 'WASTE' ? 'WASTE' : 'ADJUST_OUT';
};

export async function POST(request: Request) {
  try {
    const { supabase, brandId, userId } = await getSupabaseAndBrandId(request);
    const body = await request.json() as StockAdjustmentBody | null;
    const items = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No stock adjustment items' },
        { status: 400, headers: corsHeaders }
      );
    }

    const note = body?.note || 'Stock adjustment';

    const { data: tx, error: txErr } = await supabase
      .from('stock_transactions')
      .insert({
        brand_id: brandId,
        ref_no: body?.ref_no || body?.refNo || `ADJ-${Date.now()}`,
        note,
        created_by: userId,
      })
      .select()
      .single();

    if (txErr) throw txErr;

    const logs = items.map((item, index) => {
      const qty = getItemQty(item, index);

      return {
        transaction_id: tx.id,
        product_id: getProductId(item, index),
        change_amount: qty,
        action_type: getActionType(item, qty),
        note: item.note || note,
      };
    });

    const { error: logsErr } = await supabase
      .from('stock_logs')
      .insert(logs);

    if (logsErr) throw logsErr;

    return NextResponse.json(
      { success: true, message: 'Stock adjustment saved' },
      { headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message === 'Unauthorized' ? 401 : 400;
    return NextResponse.json(
      { success: false, error: message },
      { status, headers: corsHeaders }
    );
  }
}
