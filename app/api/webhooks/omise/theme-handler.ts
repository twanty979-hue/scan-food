// app/api/webhooks/omise/theme-handler.ts
import dayjs from 'dayjs';

// ------------------------------------------------------------------
// 🛠️ Helper: แปะป้ายว่าทำรายการแล้ว (กันเบิ้ลที่ Omise)
// ------------------------------------------------------------------
async function markAsProcessed(omise: any, chargeId: string, metadata: any) {
    try {
        await new Promise((resolve) => {
            omise.charges.update(chargeId, {
                metadata: { ...metadata, is_processed: 'true' }
            } as any, resolve);
        });
    } catch (e) { console.error('Failed to mark processed', e); }
}

// ------------------------------------------------------------------
// 🎯 Main Logic: จัดการเรื่องซื้อธีม (Buy Theme)
// ------------------------------------------------------------------
export async function handleBuyTheme(supabaseAdmin: any, omise: any, charge: any, metadata: any) {
    const { brand_id, theme_id } = metadata;
    
    // 🔍 1. หา Plan (เริ่มจาก Metadata -> ถ้าไม่มีไปขุดจาก DB)
    let plan = metadata.plan || metadata.period; // รับค่ามาตามจริง
    
    if (!plan) {
        console.log(`🕵️ [Theme] Plan missing in metadata (${charge.id}), checking DB...`);
        const { data: fallbackLog } = await supabaseAdmin
            .from('payment_logs')
            .select('period')
            .eq('charge_id', charge.id)
            .single();
            
        if (fallbackLog?.period) {
            plan = fallbackLog.period;
            console.log(`✅ [Theme] Recovered plan from DB: ${plan}`);
        }
    }

    // 🛡️ 2. ตรวจสอบความถูกต้อง (Strict Mode)
    let daysToAdd = 0;
    let isValidPlan = true;
    let errorMessage = null;

    switch (plan) {
        case 'weekly':  
            daysToAdd = 7; 
            break;
        case 'monthly': 
            daysToAdd = 30; 
            break;
        case 'yearly':  
            daysToAdd = 365; 
            break;
        default:
            // ❌ ถ้าหลุดมานี่ คือค่าผิดปกติ! (จะไม่บวกวันให้เด็ดขาด)
            isValidPlan = false;
            errorMessage = `CRITICAL: Invalid Plan received [${plan}]. No days added.`;
            console.error(`❌ ${errorMessage}`);
    }

    // 📝 3. บันทึกผลลง Payment Logs (ไม่ว่าจะสำเร็จหรือพัง)
    // ถ้า Plan ผิด สถานะจะเป็น 'requires_action' เพื่อให้แอดมินรู้ตัว
   await supabaseAdmin.from('payment_logs').update({
    status: isValidPlan ? charge.status : 'requires_action',
    payment_method: charge.source?.type || 'credit_card',
    type: 'buy_theme',
    plan_detail: theme_id,
    period: plan || 'unknown_missing',
    error_message: errorMessage
}).eq('charge_id', charge.id);

    // 🚀 4. อัปเดตอายุธีม (ทำเฉพาะตอนที่ข้อมูลถูกต้องเท่านั้น!)
    if (charge.status === 'successful' && isValidPlan) {
        // ดึงวันหมดอายุเดิมมาเช็ค
        const { data: existing } = await supabaseAdmin
            .from('themes')
            .select('expires_at')
            .eq('brand_id', brand_id)
            .eq('marketplace_theme_id', theme_id)
            .single();

        const now = dayjs();
        // ถ้าวันหมดอายุเดิมยังไม่ถึง ให้บวกต่อจากเดิม / ถ้าหมดแล้ว ให้เริ่มนับจากตอนนี้
        let baseDate = (existing?.expires_at && dayjs(existing.expires_at).isAfter(now)) 
            ? dayjs(existing.expires_at) 
            : now;
        
        const newExpiry = baseDate.add(daysToAdd, 'day').toISOString();

        // เขียนลงฐานข้อมูล
        const { error: upsertError } = await supabaseAdmin.from('themes').upsert({
            brand_id,
            marketplace_theme_id: theme_id,
            purchase_type: plan,
            expires_at: newExpiry,
            updated_at: new Date().toISOString()
        }, { onConflict: 'brand_id, marketplace_theme_id' });

        if (!upsertError) {
            console.log(`✅ [Theme] Success: Plan=${plan}, Added=${daysToAdd} days`);
            // แปะป้ายจบงานที่ Omise
            await markAsProcessed(omise, charge.id, metadata);
        } else {
            console.error(`❌ [Theme] DB Update Failed:`, upsertError.message);
        }
    }
}