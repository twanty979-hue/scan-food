import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ใช้ Service Role Key เพื่อให้หลังบ้านมีอำนาจจัดการข้ามตารางอย่างสมบูรณ์
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

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
    // 🛡️ ขั้นตอนที่ 1: ดึง Token จาก Header ที่ Flutter ส่งมา
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: "ไม่พบสิทธิ์ในการเข้าถึงระบบ" }, 
        { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 🛡️ ขั้นตอนที่ 2: แกะ Token ตรวจสอบกับ Supabase Auth เพื่อเอา User ID ที่แท้จริง
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: "เซสชันหมดอายุหรือสิทธิ์ไม่ถูกต้อง" }, 
        { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const secureUserId = user.id; // นี่คือ ID ของคนที่ล็อกอินอยู่ชัวร์ๆ ปลอมไม่ได้แล้ว
    const { shopName, shopPhone } = await request.json();

    if (!shopName) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน" }, 
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 🛑 ขั้นตอนที่ 3: เช็คเงื่อนไขล็อกสิทธิ์ (1 คน ต่อ 1 ร้านเท่านั้น)
    let { data: currentProfile, error: profileReadError } = await supabaseAdmin
      .from('profiles')
      .select('brand_id')
      .eq('id', secureUserId)
      .maybeSingle();

    if (profileReadError) throw profileReadError;
    if (!currentProfile) {
      const metadata = user.user_metadata || {};
      const { data: createdProfile, error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: secureUserId,
          full_name: String(metadata.full_name || metadata.name || user.email || '').trim() || null,
          avatar_url: String(metadata.avatar_url || metadata.picture || '').trim() || null,
          updated_at: new Date().toISOString(),
        })
        .select('brand_id')
        .single();
      if (createProfileError) throw createProfileError;
      currentProfile = createdProfile;
    }

    if (currentProfile?.brand_id) {
      return NextResponse.json(
        { success: true, brandId: currentProfile.brand_id, alreadyExists: true },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 🚀 ขั้นตอนที่ 4: เริ่มทำธุรกรรมเมื่อผ่านการตรวจสอบทั้งหมด

    // สร้าง Brand ใหม่
    const { data: brand, error: brandErr } = await supabaseAdmin.from('brands').insert({
      name: shopName,
      phone: shopPhone,
      plan: 'free',
      status: 'trial'
    }).select().single();

    if (brandErr) throw brandErr;

    // อัปเดต Profile ให้ผูกกับ Brand นี้
    const { error: profileErr } = await supabaseAdmin.from('profiles').update({
      brand_id: brand.id,
      own_brand_id: brand.id,
      role: 'owner',
      updated_at: new Date().toISOString()
    }).eq('id', secureUserId).select('id').single(); // อัปเดตตรงไอดีที่ได้มาจาก Token

    if (profileErr) {
      await supabaseAdmin.from('brands').delete().eq('id', brand.id);
      throw profileErr;
    }

    const response = NextResponse.json({ 
      success: true, 
      brandId: brand.id,
      message: "สร้างร้านค้าและตั้งค่าเจ้าของสำเร็จ" 
    });
    
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดภายในระบบ" }, 
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
