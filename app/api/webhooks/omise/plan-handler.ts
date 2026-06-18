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
    
    // 🛡️ ด่านที่ 1: เช็คจาก Omise Metadata (ถ้า Webhook หรือระบบอื่นทำจบไปแล้ว)
    if (charge.metadata && charge.metadata.is_processed === 'true') {
        console.log("✅ [PlanHandler] Already processed (Metadata check)");
        return; 
    }

    // 🛡️ ด่านที่ 2: Atomic Lock เพื่อป้องกัน Race Condition (ต้องดึงจากสถานะ pending เท่านั้น)
    // สำหรับ Credit Card, เราเพิ่มเข้าไปตรงๆ เป็น successful หรือรันจบแล้ว ถ้ารันจบแล้วจะไม่มี pending
    // แต่เพื่อรองรับทั้งสองแบบ เราจะ Update จาก pending ไปเป็น processing
    const { data: lockAttempt, error: lockError } = await supabaseAdmin
        .from('payment_logs')
        .update({ status: 'processing' })
        .eq('charge_id', charge.id)
        .eq('status', 'pending') // ล็อกเฉพาะ pending เท่านั้น เพื่อไม่ให้ทับซ้อนกับ Credit Card ที่เป็น successful ไปแล้ว
        .select();

    if (lockError || !lockAttempt || lockAttempt.length === 0) {
        console.log(`🚫 [PlanHandler] Blocked! Already handling or completed for ${charge.id}`);
        return;
    }

    const trustedLog = lockAttempt[0];
    const new_plan = trustedLog.plan_detail; 
    const period = trustedLog.period;        

    console.log(`✅ [PlanHandler] Verified from Log: Plan=${new_plan}, Period=${period}`);

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
        
        // 🎁 โบนัสเหรียญ (แถมฟรีเมื่ออัปเกรด)
        let bonusCoins = 0;
        if (new_plan === 'basic') bonusCoins = 100;
        else if (new_plan === 'pro') bonusCoins = 150;
        else if (new_plan === 'ultimate') bonusCoins = 200;

        if (period === 'yearly') {
            bonusCoins = Math.floor(bonusCoins * 12 * 1.2);
        }

        await supabaseAdmin.from('brands').update({ 
            plan: effectivePlan,
            coins: (updatedBrand.coins || 0) + bonusCoins
        }).eq('id', brand_id);

        if (bonusCoins > 0) {
            await supabaseAdmin.from('coin_logs').insert({
                brand_id: brand_id,
                amount: bonusCoins,
                action: 'plan_bonus',
                details: `Bonus for upgrading to ${new_plan.toUpperCase()}`
            });
        }

        // --- ✅ บันทึกความสำเร็จลง Log และปลดล็อก ---
        await supabaseAdmin.from('payment_logs').update({
            status: 'successful',
            payment_method: charge.source?.type || 'credit_card'
        }).eq('charge_id', charge.id);

        console.log(`✅ [Plan] Success: Upgraded ${brand_id} to ${new_plan} (${period}) with ${bonusCoins} coins bonus`);
        
        // บอก Omise ว่าจบงาน
        await markAsProcessed(omise, charge.id, metadata);
    } else if (charge.status === 'failed') {
        await supabaseAdmin.from('payment_logs').update({ status: 'failed' }).eq('charge_id', charge.id);
    }
}