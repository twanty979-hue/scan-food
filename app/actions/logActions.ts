'use server'

import { createClient } from '@supabase/supabase-js';

// 🗝️ สร้าง Admin Client (กุญแจผี) เพื่อข้ามระบบ RLS สำหรับงานหลังบ้านโดยเฉพาะ
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

/**
 * 📝 1. สร้าง Log ใหม่ (ใช้ตอนเริ่มธุรกรรม เช่น สร้าง QR Code)
 */
export async function createPaymentLog(data: {
    brand_id: string,
    charge_id: string,
    amount: number,
    status: string,
    payment_method: string,
    type: string,
    plan_detail?: string,
    period?: string
}) {
    const { error } = await supabaseAdmin.from('payment_logs').insert({
        ...data,
        created_at: new Date().toISOString()
    });

    if (error) {
        console.error("❌ บันทึก Log ไม่เข้า:", error.message);
    } else {
        console.log("✅ บันทึก Log สำเร็จ (Pending)");
    }
}

/**
 * 🔄 2. อัปเดตสถานะ Log (ใช้ตอน Webhook ยิงมา หรือตอนหน้าจอเช็คสถานะสำเร็จ)
 */
export async function updatePaymentLogStatus(
    chargeId: string, 
    status: string, 
    errorMessage?: string
) {
    const { error } = await supabaseAdmin
        .from('payment_logs')
        .update({ 
            status: status, // 'successful' หรือ 'failed'
            error_message: errorMessage || null 
        })
        .eq('charge_id', chargeId);

    if (error) {
        console.error("❌ อัปเดตสถานะ Log ไม่สำเร็จ:", error.message);
    } else {
        console.log(`📝 อัปเดต Log [${chargeId}] เป็น -> ${status}`);
    }
}