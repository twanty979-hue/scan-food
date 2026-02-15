// app/api/webhooks/omise/plan-handler.ts
import dayjs from 'dayjs';

// ------------------------------------------------------------------
// 🛠️ Helper: แปะป้ายจบงานที่ Omise
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
// 📅 Helper: คำนวณวันหมดอายุใหม่ (ห้ามมั่ว)
// ------------------------------------------------------------------
function calculateNewExpiryForTier(currentExpiry: string | null, period: string) {
    const now = dayjs();
    let baseDate = now;
    
    if (currentExpiry) {
        const oldExpiry = dayjs(currentExpiry);
        if (oldExpiry.isAfter(now)) baseDate = oldExpiry;
    }

    if (period === 'monthly') return baseDate.add(30, 'day').toISOString();
    if (period === 'yearly') return baseDate.add(1, 'year').toISOString();
    
    return null; 
}

// ------------------------------------------------------------------
// 🔍 Helper: คำนวณระดับแพลนที่สูงที่สุดที่มีผลอยู่
// ------------------------------------------------------------------
function calculateEffectivePlan(brand: any) {
    const now = dayjs();
    if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) return 'ultimate';
    if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) return 'pro';
    if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) return 'basic';
    return 'free';
}

// ------------------------------------------------------------------
// 👑 Main Logic: จัดการอัปเกรดแพลนร้านค้า (Upgrade Plan)
// ------------------------------------------------------------------
export async function handleUpgradePlan(supabaseAdmin: any, omise: any, charge: any, metadata: any) {
    const { brand_id } = metadata; // brand_id ยังอิงจาก metadata ได้
    
    // 🛡️ SECURITY CHECK: ดึงข้อมูลจริงจาก Payment Logs เท่านั้น!
    // เราจะไม่เชื่อ new_plan หรือ period ที่ส่งมาใน metadata เพราะอาจจะเพี้ยนได้
    const { data: trustedLog, error: logError } = await supabaseAdmin
        .from('payment_logs')
        .select('plan_detail, period')
        .eq('charge_id', charge.id)
        .single();

    if (logError || !trustedLog) {
        console.error(`❌ [PlanHandler] Critical: Payment Log not found for ${charge.id}`);
        return;
    }

    // ✅ ใช้ค่าที่ตรวจสอบแล้วจาก Log เป็นหลัก
    const new_plan = trustedLog.plan_detail; // เช่น 'basic', 'pro'
    const period = trustedLog.period;        // เช่น 'monthly', 'yearly'

    console.log(`✅ [PlanHandler] Verified from Log: Plan=${new_plan}, Period=${period}`);

    // อัปเดตสถานะใน Log เป็นสถานะปัจจุบันจาก Omise
    await supabaseAdmin.from('payment_logs').update({
        status: charge.status,
        payment_method: charge.source?.type || 'credit_card',
        type: 'upgrade_plan',
        plan_detail: new_plan,
        period: period,
    }).eq('charge_id', charge.id);

    // 🚀 เริ่มกระบวนการอัปเดต (เมื่อจ่ายสำเร็จ)
    if (charge.status === 'successful') {
        const { data: brand, error: fetchError } = await supabaseAdmin
            .from('brands')
            .select('*')
            .eq('id', brand_id)
            .single();

        if (fetchError || !brand) {
            console.error(`❌ [Plan] Brand not found: ${brand_id}`);
            return;
        }

        const newExpiryDate = calculateNewExpiryForTier(
            new_plan === 'basic' ? brand.expiry_basic : 
            new_plan === 'pro' ? brand.expiry_pro : brand.expiry_ultimate, 
            period
        );

        if (!newExpiryDate) {
            console.error(`❌ [Plan] Invalid period from log: ${period}`);
            return;
        }

        let updateData: any = { updated_at: new Date().toISOString() };
        if (new_plan === 'basic') updateData.expiry_basic = newExpiryDate;
        else if (new_plan === 'pro') updateData.expiry_pro = newExpiryDate;
        else if (new_plan === 'ultimate') updateData.expiry_ultimate = newExpiryDate;

        // 1. อัปเดตวันหมดอายุ
        await supabaseAdmin.from('brands').update(updateData).eq('id', brand_id);
        
        // 2. คำนวณและอัปเดตยศปัจจุบัน (Effective Plan)
        const { data: updatedBrand } = await supabaseAdmin.from('brands').select('*').eq('id', brand_id).single();
        const effectivePlan = calculateEffectivePlan(updatedBrand);
        await supabaseAdmin.from('brands').update({ plan: effectivePlan }).eq('id', brand_id);

        // --- ✅ บันทึกความสำเร็จลง Log และปลดล็อก ---
        await supabaseAdmin.from('payment_logs').update({
            status: 'successful'
        }).eq('charge_id', charge.id);

        console.log(`✅ [Plan] Success: Upgraded ${brand_id} to ${new_plan} (${period})`);
        
        // บอก Omise ว่าจบงาน
        await markAsProcessed(omise, charge.id, metadata);
    } else if (charge.status === 'failed') {
        await supabaseAdmin.from('payment_logs').update({ status: 'failed' }).eq('charge_id', charge.id);
    }
}