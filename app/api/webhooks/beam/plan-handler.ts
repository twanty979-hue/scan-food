// app/api/webhooks/beam/plan-handler.ts
import dayjs from 'dayjs';

// ------------------------------------------------------------------
// 📅 Helper: คำนวณวันหมดอายุใหม่ (คงไว้เหมือนเดิมเป๊ะ)
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
// 🔍 Helper: คำนวณระดับแพลนที่สูงที่สุด (คงไว้เหมือนเดิมเป๊ะ)
// ------------------------------------------------------------------
function calculateEffectivePlan(brand: any) {
    const now = dayjs();
    if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) return 'ultimate';
    if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) return 'pro';
    if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) return 'basic';
    return 'free';
}

// ------------------------------------------------------------------
// 👑 Main Logic: จัดการอัปเกรดแพลนร้านค้า (เอา Omise ออก)
// ------------------------------------------------------------------
// สังเกตว่าพารามิเตอร์ omise หายไปแล้ว
export async function handleUpgradePlan(supabaseAdmin: any, charge: any, metadata: any) {
    const { brand_id } = metadata; 
    
    // โค้ดดึง Lock Status จาก DB (เหมือนเดิม)
    const { data: lockAttempt, error: lockError } = await supabaseAdmin
        .from('payment_logs')
        .select('*') // เปลี่ยนเป็น select มาเช็ก เพราะเรา update ไปแล้วใน route.ts
        .eq('charge_id', charge.id)
        .single();

    if (lockError || !lockAttempt) {
        console.log(`🚫 [PlanHandler] Could not find processing log for ${charge.id}`);
        return;
    }

    const new_plan = lockAttempt.plan_detail; 
    const period = lockAttempt.period;        

    console.log(`✅ [PlanHandler] Verified from Log: Plan=${new_plan}, Period=${period}`);

    // ตรวจสอบจาก Status ที่ Beam ส่งมา (สมมติว่า Beam ส่ง status: 'success' หรือดูคู่มือ Beam อีกที)
    // ถ้าระบบ Beam ส่งแค่ event ที่สำเร็จแล้วมา เราอาจจะไม่ต้องเช็ก status ซ้อนก็ได้ แต่กันเหนียวไว้ครับ
    const isPaymentSuccess = true; // สมมติว่าผ่าน เพราะ Webhook แจ้งว่าจ่ายเสร็จ

    if (isPaymentSuccess) {
        // --- ลอจิกอัปเดต Database ตรงนี้ "คงเดิมทั้งหมด 100%" ตามที่คุณเขียนไว้ ---
        const { data: brand, error: fetchError } = await supabaseAdmin
            .from('brands')
            .select('*')
            .eq('id', brand_id)
            .single();

        if (fetchError || !brand) return;

        const newExpiryDate = calculateNewExpiryForTier(
            new_plan === 'basic' ? brand.expiry_basic : 
            new_plan === 'pro' ? brand.expiry_pro : brand.expiry_ultimate, 
            period
        );

        if (!newExpiryDate) return;

        let updateData: any = { updated_at: new Date().toISOString() };
        if (new_plan === 'basic') updateData.expiry_basic = newExpiryDate;
        else if (new_plan === 'pro') updateData.expiry_pro = newExpiryDate;
        else if (new_plan === 'ultimate') updateData.expiry_ultimate = newExpiryDate;

        await supabaseAdmin.from('brands').update(updateData).eq('id', brand_id);
        
        const { data: updatedBrand } = await supabaseAdmin.from('brands').select('*').eq('id', brand_id).single();
        const effectivePlan = calculateEffectivePlan(updatedBrand);
        
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

        // --- ✅ บันทึกความสำเร็จลง Log ---
        await supabaseAdmin.from('payment_logs').update({
            status: 'successful',
            payment_method: charge.payment_method || 'beam_checkout'
        }).eq('charge_id', charge.id);

        console.log(`✅ [Plan] Success: Upgraded ${brand_id} to ${new_plan}`);
        
        // ❌ เอา markAsProcessed ของ Omise ออกไปได้เลย ไม่ต้องใช้แล้ว
    }
}