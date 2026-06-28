// app/api/pos/quota/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getOrderUsage } from '@/app/actions/limitGuard';

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
  return { brandId: profile.brand_id, supabase };
};

export async function GET(request: Request) {
  try {
    // 🚀 ยืนยันตัวตนก่อนเรียกฟังก์ชัน limitGuard
    const { brandId, supabase } = await getSupabaseAndBrandId(request);

    const quotaData = await getOrderUsage(brandId, supabase);

    const response = NextResponse.json({ success: true, ...quotaData });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}