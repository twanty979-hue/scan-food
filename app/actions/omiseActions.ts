// app/actions/omiseActions.ts
'use server'

import Omise from 'omise';
console.log("Secret Key:", process.env.OMISE_SECRET_KEY);
// สร้าง Client เชื่อมต่อ Omise
const omise = Omise({
  publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!,
  secretKey: process.env.OMISE_SECRET_KEY!,
});

// --- 1. สร้าง QR Code PromptPay ---
export async function createPromptPayQRCode(amount: number) {
  try {
    // Omise รับหน่วยเป็น "สตางค์" (เช่น 100 บาท = 10000 สตางค์)
    const amountInSatang = Math.round(amount * 100);

    // 1. สร้าง Source (ต้นทางเงิน: PromptPay)
    const source = await omise.sources.create({
      amount: amountInSatang,
      currency: 'thb',
      type: 'promptpay',
    });

    // 2. สร้าง Charge (ใบแจ้งหนี้)
    const charge = await omise.charges.create({
      amount: amountInSatang,
      currency: 'thb',
      source: source.id,
      return_uri: 'http://localhost:3000', // ใส่ URL หลอกๆ ไว้ก่อนได้ (เพราะเราเช็ค status เอง)
    });

    // 3. ดึงลิงก์รูป QR Code
    const qrImage = charge.source.scannable_code?.image?.download_uri;

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

// --- 2. เช็คสถานะว่าลูกค้าจ่ายยัง ---
export async function checkOmisePaymentStatus(chargeId: string) {
  try {
    const charge = await omise.charges.retrieve(chargeId);
    return { 
      success: true, 
      status: charge.status // 'pending', 'successful', 'failed'
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}