'use server'

import Omise from 'omise';
import { createServerClient } from '@supabase/ssr'; // ✅ เพิ่ม
import { cookies } from 'next/headers';          // ✅ เพิ่ม

const omise = Omise({
  publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!,
  secretKey: process.env.OMISE_SECRET_KEY!,
});

// ✅ Helper ดึง Supabase (เหมือนไฟล์อื่น)
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );
}

// --- 1. สร้าง QR Code PromptPay ---
// ✅ รับแค่ amount กับ themeId พอ (brandId เดี๋ยวหาเอง)
export async function createPromptPayQRCode(amount: number, themeId?: string) {
  try {
    
    // 1. หา Brand ID ของคนกดซื้อ (Server-side Secure Check)
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    let brandId = '';
    
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
        if (profile?.brand_id) {
            brandId = profile.brand_id;
        }
    }

    // 2. เตรียม Metadata
    let metadata = {};
    if (themeId && brandId) {
        metadata = {
            type: 'buy_theme',
            brand_id: brandId,
            theme_id: themeId
        };
    }

    // 3. สร้าง Source & Charge
    const amountInSatang = Math.round(amount * 100);
    const source = await omise.sources.create({
      amount: amountInSatang,
      currency: 'thb',
      type: 'promptpay',
    });

    const charge = await omise.charges.create({
      amount: amountInSatang,
      currency: 'thb',
      source: source.id,
      return_uri: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      metadata: metadata // ✅ ยัด Metadata ที่มี brandId จาก Server
    });

    const qrImage = charge.source?.scannable_code?.image?.download_uri;

    return { 
      success: true, 
      qrImage: qrImage, 
      chargeId: charge.id, 
      status: charge.status 
    };

  } catch (error: any) {
    console.error("Omise Error:", error);
    return { success: false, error: error.message };
  }
}

// ... checkOmisePaymentStatus เหมือนเดิม
export async function checkOmisePaymentStatus(chargeId: string) {
    // ... (โค้ดเดิม)
    try {
        const charge = await omise.charges.retrieve(chargeId);
        return { success: true, status: charge.status };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}