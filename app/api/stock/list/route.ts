import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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

    const { data, error } = await supabase
      .from('stock')
      .select(`
        quantity,
        updated_at,
        product_master!inner (
          id, name, barcode, sku, image_url, brand_id, price 
        )
      `)
      .eq('product_master.brand_id', brandId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const formatted = (data || []).map((item: any) => ({
      id: item.product_master.id,
      name: item.product_master.name,
      barcode: item.product_master.barcode,
      sku: item.product_master.sku,
      quantity: item.quantity,
      updated_at: item.updated_at,
      image_url: item.product_master.image_url,
      price: item.product_master.price || 0 // 🚀 ดึงราคาลงมาด้วย
    }));

    return NextResponse.json(
      { success: true, data: formatted },
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