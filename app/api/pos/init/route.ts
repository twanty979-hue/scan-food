// app/api/pos/init/route.ts
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

// 🔐 Helper: แกะ Token
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
    // 🚀 ใช้ Token ดึงสิทธิ์แทน URL
    const { supabase, brandId } = await getSupabaseAndBrandId(request);

    const [categoriesRes, productsRes, retailRes, discountsRes, tablesRes, unpaidOrdersRes] = await Promise.all([
      supabase.from('categories').select('*').eq('brand_id', brandId).order('sort_order'),
      supabase.from('products').select('*').eq('brand_id', brandId).eq('is_available', true).is('deleted_at', null), 
      supabase.from('product_master').select('*').eq('brand_id', brandId).eq('is_active', true), 
      supabase.from('discounts').select(`*, discount_products(product_id)`).eq('brand_id', brandId).eq('is_active', true),
      supabase.from('tables').select('*').eq('brand_id', brandId).order('label'),
      supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('brand_id', brandId)
        
        .in('status', ['pending', 'preparing', 'done'])
    ]);

    const formattedFood = (productsRes.data || []).map(p => ({ ...p, item_type: 'food' }));
    const formattedRetail = (retailRes.data || []).map(p => ({
        ...p,
        item_type: 'retail',
        price_special: null,
        price_jumbo: null,
        is_available: p.is_active
    }));
    const allCombinedProducts = [...formattedFood, ...formattedRetail];

    const response = NextResponse.json({
      success: true,
      categories: categoriesRes.data || [],
      products: allCombinedProducts,
      discounts: discountsRes.data || [],
      tables: tablesRes.data || [],
      unpaid_orders: unpaidOrdersRes.data || [] 
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}