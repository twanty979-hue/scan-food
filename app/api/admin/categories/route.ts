import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const getSupabase = (request: Request) => {
  const authHeader = request.headers.get('authorization');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  );
};

export async function GET(request: Request) {
  try {
    const supabase = getSupabase(request);

    const { data, error } = await supabase
      .from('admin_master_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const response = NextResponse.json({ success: true, data });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase(request);
    const body = await request.json();

    const { id, name, sort_order, is_active } = body;

    let res;
    if (id) {
      // Update
      res = await supabase
        .from('admin_master_categories')
        .update({
          name,
          sort_order: Number(sort_order) || 0,
          is_active: is_active !== false
        })
        .eq('id', id)
        .select()
        .single();
    } else {
      // Insert
      res = await supabase
        .from('admin_master_categories')
        .insert({
          name,
          sort_order: Number(sort_order) || 0,
          is_active: is_active !== false
        })
        .select()
        .single();
    }

    if (res.error) throw res.error;

    const response = NextResponse.json({ success: true, data: res.data });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
