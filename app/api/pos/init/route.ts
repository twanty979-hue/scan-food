// app/api/pos/init/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brand_id');

    if (!brandId) {
      return NextResponse.json(
        { error: "Missing brand_id" }, 
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const [categoriesRes, productsRes, retailRes, discountsRes, tablesRes] = await Promise.all([
      supabaseAdmin.from('categories').select('*').eq('brand_id', brandId).order('sort_order'),
      // 🔥 ใส่ .eq('brand_id', brandId) กลับคืนมาตรงนี้ครับนาย!
      supabaseAdmin.from('products').select('*').eq('brand_id', brandId).eq('is_available', true), 
      supabaseAdmin.from('product_master').select('*').eq('brand_id', brandId).eq('is_active', true), 
      supabaseAdmin.from('discounts').select(`*, discount_products(product_id)`).eq('brand_id', brandId).eq('is_active', true),
      supabaseAdmin.from('tables').select('*').eq('brand_id', brandId).order('label')
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
      tables: tablesRes.data || []
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}