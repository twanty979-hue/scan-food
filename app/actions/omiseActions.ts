'use server'

import Omise from 'omise';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
// ✅ Import ทั้งตัวสร้าง และตัวอัปเดต Log
import { createPaymentLog, updatePaymentLogStatus } from './logActions'; 

const omise = Omise({
  publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!,
  secretKey: process.env.OMISE_SECRET_KEY!,
});

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );
}

// ---------------------------------------------------------
// 🟢 1. PromptPay QR (สร้างรายการพร้อมเก็บ Log)
// ---------------------------------------------------------
export async function createPromptPayQRCode(amount: number, themeId?: string, plan?: string) {
  try {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    let brandId = '';
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
        brandId = profile?.brand_id || '';
    }

    const amountInSatang = Math.round(amount * 100);
    const source = await omise.sources.create({ amount: amountInSatang, currency: 'thb', type: 'promptpay' });
    const charge = await omise.charges.create({
      amount: amountInSatang,
      currency: 'thb',
      source: source.id,
      return_uri: process.env.NEXT_PUBLIC_BASE_URL,
      metadata: { type: 'buy_theme', brand_id: brandId, theme_id: themeId, plan: plan }
    });

    if (brandId) {
        await createPaymentLog({
            brand_id: brandId,
            charge_id: charge.id,
            amount: amountInSatang,
            status: 'pending',
            payment_method: 'promptpay',
            type: 'buy_theme',
            plan_detail: themeId,
            period: plan
        });
    }

    return { success: true, qrImage: charge.source?.scannable_code?.image?.download_uri, chargeId: charge.id, status: charge.status };

  } catch (error: any) {
    console.error("Omise QR Error:", error);
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------
// 🔵 2. Credit Card (ตัดบัตรทันทีพร้อมเก็บ Log)
// ---------------------------------------------------------
export async function createCreditCardCharge(amount: number, token: string, themeId: string, plan: string) {
    try {
        const supabase = await getSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        let brandId = '';
        if (user) {
            const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
            brandId = profile?.brand_id || '';
        }

        const amountInSatang = Math.round(amount * 100);

        const charge = await omise.charges.create({
            amount: amountInSatang,
            currency: 'thb',
            card: token,
            metadata: { type: 'buy_theme', brand_id: brandId, theme_id: themeId, plan: plan }
        });

        if (brandId) {
            await createPaymentLog({
                brand_id: brandId,
                charge_id: charge.id,
                amount: amountInSatang,
                status: charge.status === 'successful' ? 'successful' : 'failed',
                payment_method: 'credit_card',
                type: 'buy_theme',
                plan_detail: themeId,
                period: plan
            });
        }

        if (charge.status === 'successful') {
            return { success: true, chargeId: charge.id };
        } else {
            return { success: false, error: charge.failure_message || 'Payment declined' };
        }

    } catch (error: any) {
        console.error("Omise CC Error:", error);
        return { success: false, error: error.message };
    }
}

// ---------------------------------------------------------
// 🛠️ 3. Check Status (อัปเกรดตัวโปร: Real-time Sync Log)
// ---------------------------------------------------------
export async function checkOmisePaymentStatus(chargeId: string) {
    try {
        const charge = await omise.charges.retrieve(chargeId);
        
        // ✅ ถ้าเช็คแล้วเจอว่าสำเร็จหรือล้มเหลว ให้สั่งอัปเดต Log ทันที
        // ทำให้ข้อมูลใน Database แม่นยำเท่ากับที่ลูกค้าเห็นบนหน้าจอครับ
        if (charge.status === 'successful' || charge.status === 'failed') {
            await updatePaymentLogStatus(chargeId, charge.status, charge.failure_message);
        }

        return { success: true, status: charge.status };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}