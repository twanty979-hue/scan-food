// app/api/pos/checkout/route.ts
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

export async function POST(request: Request) {
  try {
    const { supabase, brandId } = await getSupabaseAndBrandId(request);
    const body = await request.json();
    const { order_id, order_ids, table_id, table_label, used_tokens, now_iso } = body;
    const checkoutOrderIds = Array.isArray(order_ids) && order_ids.length > 0 ? order_ids : [order_id].filter(Boolean);

    if (checkoutOrderIds.length === 0) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const paidAt = now_iso || new Date().toISOString();
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: 'paid', updated_at: paidAt })
      .in('id', checkoutOrderIds)
      .eq('brand_id', brandId);

    if (orderError) throw new Error(`Order Update Failed: ${orderError.message}`);

    if (table_label && table_label !== 'Walk-in') {
      let tokensToRemove = uniqueTokens(used_tokens || []);
      if (tokensToRemove.length === 0) {
        const { data: paidOrders } = await supabase
          .from('orders')
          .select('table_access_token')
          .in('id', checkoutOrderIds)
          .eq('brand_id', brandId);
        tokensToRemove = uniqueTokens((paidOrders || []).map((order: any) => order.table_access_token));
      }

      let tableQuery = supabase
        .from('tables')
        .select('id, access_token, access_tokens')
        .eq('brand_id', brandId);

      tableQuery = table_id ? tableQuery.eq('id', table_id) : tableQuery.eq('label', table_label);
      const { data: tableData, error: tableFetchError } = await tableQuery.single();
      if (tableFetchError) throw new Error(`Table Fetch Failed: ${tableFetchError.message}`);

      const fallbackUsedTokens = tokensToRemove.length > 0 ? tokensToRemove : [tableData?.access_token];
      const nextTokens = removeUsedTokens(getTableTokens(tableData), fallbackUsedTokens);
      const { error: tableError } = await supabase
        .from('tables')
        .update({ access_token: nextTokens[0], access_tokens: nextTokens })
        .eq('id', tableData.id)
        .eq('brand_id', brandId);

      if (tableError) throw new Error(`Table Update Failed: ${tableError.message}`);
    }

    return NextResponse.json({ success: true, message: 'Checkout and table tokens cleared' }, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error: any) {
    console.error('Checkout API Error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message },
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}