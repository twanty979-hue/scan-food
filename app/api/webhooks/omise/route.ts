// app/api/webhooks/omise/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Omise from 'omise';
// ✅ Import 2 ไฟล์ที่เราแยกไว้
import { handleBuyTheme } from './theme-handler';
import { handleUpgradePlan } from './plan-handler';

const omise = Omise({
    publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!,
    secretKey: process.env.OMISE_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
    try {
        const event = await req.json();
        if (event.key !== 'charge.complete') return NextResponse.json({ received: true });

        const rawCharge = event.data;
        const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        // 🛡️ STEP 1: ลองอัปเดตสถานะเป็น 'processing' เฉพาะรายการที่ยังเป็น 'pending'
        // ถ้าอัปเดตไม่ได้ (เพราะมีคนทำอยู่ หรือสำเร็จไปแล้ว) ให้หยุดทันที!
        const { data: lockAttempt, error: lockError } = await supabaseAdmin
            .from('payment_logs')
            .update({ status: 'processing' })
            .eq('charge_id', rawCharge.id)
            .eq('status', 'pending') // <--- หัวใจสำคัญ: ต้องยังไม่เคยถูกแตะต้อง
            .select();

        if (lockError || !lockAttempt || lockAttempt.length === 0) {
            console.log(`🚫 [Webhook] Blocked concurrent request for charge: ${rawCharge.id}`);
            return NextResponse.json({ message: 'Already processing or successful' });
        }

        // -----------------------------------------------------------
        // 🚀 ถ้าหลุดมาถึงตรงนี้ แปลว่าเราคือ "คนแรก" ที่ได้สิทธิ์จัดการ!
        // -----------------------------------------------------------
        const charge = await new Promise<any>((resolve) => omise.charges.retrieve(rawCharge.id, (err, resp) => resolve(resp)));
        const metadata = charge.metadata || {};

        if (metadata.type === 'buy_theme') {
            await handleBuyTheme(supabaseAdmin, omise, charge, metadata);
        } else if (metadata.type === 'upgrade_plan') {
            await handleUpgradePlan(supabaseAdmin, omise, charge, metadata);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}