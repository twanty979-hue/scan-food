import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brand_id');

    if (!brandId) return NextResponse.json({ error: "Missing brand_id" }, { status: 400 });

    // ดึงข้อมูล 3 อย่างพร้อมกันเพื่อความรวดเร็ว
    const [categoriesRes, productsRes, tablesRes] = await Promise.all([
      supabaseAdmin.from('categories').select('*').eq('brand_id', brandId).order('sort_order'),
      supabaseAdmin.from('products').select('*').eq('brand_id', brandId).eq('status', 'active'),
      supabaseAdmin.from('tables').select('*').eq('brand_id', brandId).order('label')
    ]);

    return NextResponse.json({
      success: true,
      categories: categoriesRes.data || [],
      products: productsRes.data || [],
      tables: tablesRes.data || []
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}