// app/actions/marketplaceDetailActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Omise from 'omise';
import dayjs from 'dayjs';

// Config Omise
const omise = Omise({
  publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!,
  secretKey: process.env.OMISE_SECRET_KEY!,
});

// Helper: สร้าง Client
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );
}

// --- Action 1: ดึงรายละเอียดธีมและสิทธิ์ ---
export async function getThemeDetailAction(themeId: string) {
  const supabase = await getSupabase();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. เช็ค Role ของคนเรียก (Owner หรือไม่?)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, brand_id')
        .eq('id', user.id)
        .single();
    
    if (!profile?.brand_id) throw new Error("No brand assigned");
    const isOwner = profile.role === 'owner'; // ✅ เช็คสิทธิ์ว่าเป็นเจ้าของไหม

    // 2. ดึงข้อมูล Theme
    const { data: themeData } = await supabase
      .from('marketplace_themes')
      .select('*, marketplace_categories(name)')
      .eq('id', themeId)
      .single();

    if (!themeData) throw new Error('Theme not found');

    // 3. เช็คสถานะการซื้อ (Owned Data)
    const { data: owned } = await supabase.from('themes')
      .select('*') // ดึงหมดเลยรวมถึง expires_at
      .eq('brand_id', profile.brand_id)
      .eq('marketplace_theme_id', themeId)
      .single();

    return { 
        success: true, 
        theme: themeData, 
        isOwned: !!owned,
        ownedData: owned, // ส่งข้อมูลการซื้อกลับไป (วันหมดอายุ)
        isOwner: isOwner  // ✅ ส่งสิทธิ์กลับไปบอกหน้าเว็บ
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Action 2: สั่งซื้อ / ติดตั้งธีม / ต่ออายุ ---
export async function installThemeAction(marketplaceThemeId: string, chargeId: string | null, plan: 'monthly' | 'lifetime') {
  const supabase = await getSupabase();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. เช็คสิทธิ์ Owner (สำคัญมาก! กันคนอื่นแอบยิง API)
    const { data: profile } = await supabase.from('profiles').select('role, brand_id').eq('id', user.id).single();
    if (!profile?.brand_id) throw new Error("No brand assigned");
    
    // 🔒 Security Check
    if (profile.role !== 'owner') {
        throw new Error("Permission denied: Only owner can purchase.");
    }

    const brandId = profile.brand_id;

    // 2. ดึงข้อมูลธีมและราคา
    const { data: themeData } = await supabase
        .from('marketplace_themes')
        .select('price_monthly, price_lifetime')
        .eq('id', marketplaceThemeId)
        .single();
    
    if (!themeData) throw new Error("Theme not found");

    // 3. ตรวจสอบการจ่ายเงิน (ถ้ามีราคา)
    const priceToPay = plan === 'monthly' ? themeData.price_monthly : themeData.price_lifetime;
    if (priceToPay > 0) {
        if (!chargeId) throw new Error("Payment required");
        const charge = await omise.charges.retrieve(chargeId);
        if (charge.status !== 'successful') throw new Error("Payment failed");
        
        // เช็คยอดเงิน (กัน Hacker แก้ราคาหน้าเว็บ)
        if (charge.amount < (priceToPay * 100)) throw new Error("Invalid payment amount");
    }

    // ✅ 4. ดึงข้อมูลเดิมก่อน (เพื่อดูว่าจะต่ออายุจากวันไหน)
    const { data: existingTheme } = await supabase
        .from('themes')
        .select('expires_at')
        .eq('brand_id', brandId)
        .eq('marketplace_theme_id', marketplaceThemeId)
        .single();

    // ✅ 5. คำนวณวันหมดอายุแบบ "ทบยอด" (Extend Logic)
    let newExpiresAt = null; // เริ่มต้นเป็น null (สำหรับ Lifetime)

if (plan === 'monthly') {
    const now = dayjs();
    let baseDate = now; 

    // ถ้ามีวันหมดอายุเดิม และยังไม่หมด ให้ทบวัน
    if (existingTheme?.expires_at) {
        const currentExpire = dayjs(existingTheme.expires_at);
        if (currentExpire.isAfter(now)) {
            baseDate = currentExpire;
        }
    }
    // บวก 30 วัน
    newExpiresAt = baseDate.add(30, 'day').toISOString();
}
    // ถ้า lifetime ให้เป็น null (แปลว่าตลอดชีพ)

    // 6. บันทึก (Upsert: ถ้ามีแล้วให้ Update วันหมดอายุใหม่)
    const { error } = await supabase.from('themes').upsert({
    brand_id: brandId,
    marketplace_theme_id: marketplaceThemeId,
    purchase_type: plan, // 'lifetime'
    expires_at: newExpiresAt, // ส่ง null ไปทับของเก่าเลย
    updated_at: new Date().toISOString()
}, { onConflict: 'brand_id, marketplace_theme_id' });

    if (error) throw error;
    return { success: true };

  } catch (error: any) {
    console.error("Install Error:", error.message);
    return { success: false, error: error.message };
  }
}