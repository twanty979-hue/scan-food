import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
// 🌟 1. แก้ไขบรรทัด Import ด้านบน: เปลี่ยนจาก upgradeBrandPlanAction เป็น processFreeUpgradeFromApi
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

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) throw new Error('Unauthorized');

    const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const body = await request.json();
    const { brandId, newPlan, period } = body;

    if (!brandId || !newPlan || !period) {
        return NextResponse.json({ success: false, error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    const result = await createBeamCheckoutAction(brandId, newPlan, period, '', '');

    if (result.success && (result as any).isFree) {
        // 🌟 2. เปลี่ยนมาเรียกใช้ฟังก์ชันสำหรับ API โดยเฉพาะ (ลบ upgradeBrandPlanAction ตัวเดิมทิ้งเลยครับ)
        const freeUpgradeResult = await processFreeUpgradeFromApi(brandId, newPlan, period);
        
        if (!freeUpgradeResult.success) throw new Error(freeUpgradeResult.error);
        
        return new NextResponse(JSON.stringify({ success: true, type: 'free' }), {
          status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}