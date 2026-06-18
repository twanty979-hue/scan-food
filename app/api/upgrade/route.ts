// app/api/payments/upgrade/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createBeamCheckoutAction, processFreeUpgradeFromApi } from '@/app/actions/settingsActions';

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
    .from('profiles').select('brand_id, role').eq('id', user.id).single();

  if (!profile?.brand_id) throw new Error('No brand assigned');
  return { brandId: profile.brand_id, role: profile.role };
};

export async function POST(request: Request) {
  try {
    const { brandId, role } = await getSupabaseAndBrandId(request);
    
    if (role !== 'owner') throw new Error('Unauthorized: Owners only');

    const body = await request.json();
    const { planKey, period, paymentMethod } = body;

    if (!planKey || !period || !paymentMethod) {
      throw new Error('Missing required fields (planKey, period, paymentMethod)');
    }

    // 💰 เคสที่ 1: ชำระเงินผ่านบัตรเครดิต หรือ บิลโปรโมชัน 0 บาท
    if (paymentMethod === 'credit_card') {
      const res = await processFreeUpgradeFromApi(brandId, planKey, period);
      if (!res.success) throw new Error(res.error);

      return new NextResponse(JSON.stringify({ success: true, type: 'free' }), {
        status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } 
    // 🌀 เคสที่ 2: ชำระเงินผ่านการสแกน PromptPay
    else if (paymentMethod === 'promptpay') {
      // เรียกใช้ Server Action ที่เราแก้ตัดตัวแปร sourceId ออก ให้ระบบหลังบ้านเจนคิวอาร์เอง
      const res = await createBeamCheckoutAction(brandId, planKey, period, '', '');
      if (!res.success) throw new Error(res.error);

      return new NextResponse(JSON.stringify(res), {
        status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } else {
      throw new Error('Invalid payment method');
    }

  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}