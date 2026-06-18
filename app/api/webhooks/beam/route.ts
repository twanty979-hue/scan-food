// app/api/webhooks/beam/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// ✅ Import handler ที่เราจะแก้ใหม่
import { handleBuyTheme } from './theme-handler';
import { handleUpgradePlan } from './plan-handler';

export async function POST(req: NextRequest) {
    try {
        // 1. อ่านข้อมูลที่ Beam ส่งมา
        const event = await req.json();

        // 💡 ตรวจสอบ Event Type (ต้องดูใน Doc ของ Beam ว่าเขาใช้คำว่าอะไร เช่น payment.successful)
        if (event.type !== 'charge.succeeded') {
             return NextResponse.json({ received: true });
        }

        // 💡 ดึงข้อมูล Order/Charge จาก Payload ของ Beam
        const rawCharge = event.data; 
        const chargeId = rawCharge.id; 
        
        // Beam มักจะส่ง metadata ที่เราแนบตอนสร้าง Checkout กลับมาด้วย
        const metadata = rawCharge.metadata || {}; 

        const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        // 🛡️ STEP 1: Atomic Lock (ลอจิกเดิมของคุณที่ทำไว้ดีมากอยู่แล้ว)
        const { data: lockAttempt, error: lockError } = await supabaseAdmin
            .from('payment_logs')
            .update({ status: 'processing' })
            .eq('charge_id', chargeId) // ใช้ ID ของ Beam
            .eq('status', 'pending')
            .select();

        if (lockError || !lockAttempt || lockAttempt.length === 0) {
            console.log(`🚫 [Webhook] Blocked concurrent request for charge: ${chargeId}`);
            return NextResponse.json({ message: 'Already processing or successful' });
        }

        // -----------------------------------------------------------
        // 🚀 แยกประเภทการทำงานตาม Metadata
        // -----------------------------------------------------------
        if (metadata.type === 'buy_theme') {
            await handleBuyTheme(supabaseAdmin, rawCharge, metadata); // ไม่ต้องส่ง omise ไปแล้ว
        } else if (metadata.type === 'upgrade_plan') {
            await handleUpgradePlan(supabaseAdmin, rawCharge, metadata); // ไม่ต้องส่ง omise ไปแล้ว
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}