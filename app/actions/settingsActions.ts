// app/actions/settingsActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Omise from 'omise';
import dayjs from 'dayjs';
// ✅ 1. Import ตัวเทพมาจากไฟล์ themeActions (เพื่อให้ Logic การลบ/เพิ่ม เหมือนกันเป๊ะ)
import { syncThemesWithPlan } from './themeActions'; 

const omise = Omise({
  publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!,
  secretKey: process.env.OMISE_SECRET_KEY!,
});

const BASE_PRICES: Record<string, number> = {
  free: 0,
  basic: 39900, 
  pro: 129900, 
  ultimate: 199900 
};

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );
}

// ----------------------------------------------------------------------
// 🏆 HELPER: คำนวณ Effective Plan (ยศสูงสุดที่ยังไม่หมดอายุ)
// ----------------------------------------------------------------------
function calculateEffectivePlan(brand: any) {
    const now = dayjs();
    
    // เช็คไล่จาก Ultimate -> Pro -> Basic
    if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) return 'ultimate';
    if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) return 'pro';
    if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) return 'basic';
    
    return 'free'; 
}

// ----------------------------------------------------------------------
// 📅 HELPER: คำนวณวันหมดอายุ (แยกตาม Tier) - *Logic เดิม ห้ามแตะ*
// ----------------------------------------------------------------------
function calculateNewExpiryForTier(currentExpiry: string | null, period: 'monthly' | 'yearly') {
    const now = dayjs();
    let baseDate = now;

    // ถ้าของเดิมยังไม่หมด ให้ต่อเวลาจากเดิม
    if (currentExpiry) {
        const oldExpiry = dayjs(currentExpiry);
        if (oldExpiry.isAfter(now)) {
            baseDate = oldExpiry;
        }
    }

    const amountToAdd = 1;
    const unitToAdd = period === 'yearly' ? 'year' : 'month';
    return baseDate.add(amountToAdd, unitToAdd).toISOString();
}

function calculatePrice(plan: string, period: 'monthly' | 'yearly') {
    const base = BASE_PRICES[plan] || 0;
    return period === 'yearly' ? Math.floor((base * 12) * 0.8) : base;
}

// ❌ ลบฟังก์ชัน syncThemesWithPlan ตัวเก่าทิ้งไปเลย (เพราะมันคือตัวที่ทำธีมหาย)
// เราจะใช้ตัวที่ Import มาจาก themeActions แทนครับ

// --- Standard Actions ---

export async function getBrandSettingsAction() {
  const supabase = await getSupabase();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    
    const { data: profile } = await supabase.from('profiles').select('brand_id, role').eq('id', user.id).single();
    if (!profile?.brand_id) throw new Error("No brand assigned");
    
    // ดึงข้อมูลวันหมดอายุทั้ง 3 ระดับ
    const { data: brand } = await supabase.from('brands').select('*').eq('id', profile.brand_id).single();
    
    // คำนวณ Plan ที่แท้จริง (Real-time check)
    const effectivePlan = calculateEffectivePlan(brand);
    
    // ถ้า Plan ใน DB ไม่ตรงกับความจริง -> อัปเดตทันที
    if (brand.plan !== effectivePlan) {
        await supabase.from('brands').update({ plan: effectivePlan }).eq('id', profile.brand_id);
        brand.plan = effectivePlan; 
    }

    return { success: true, brand, brandId: profile.brand_id, isOwner: profile.role === 'owner' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBrandSettingsAction(brandId: string, payload: any) {
    // ... Logic เดิม ...
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('brand_id, role').eq('id', user.id).single();
    if (!profile || profile.brand_id !== brandId || profile.role !== 'owner') throw new Error("Unauthorized");

    const updateData: any = {
        name: payload.name, phone: payload.phone, address: payload.address,
        promptpay_number: payload.promptpay_number, logo_url: payload.logo_url, qr_image_url: payload.qr_image_url,
        updated_at: new Date().toISOString()
    };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { error } = await supabase.from('brands').update(updateData).eq('id', brandId);
    if (error) throw error;
    return { success: true };
}

// --- Payment Actions ---

// 1. Credit Card (Upgrade)
export async function upgradeBrandPlanAction(
    brandId: string, 
    newPlan: string, 
    period: 'monthly' | 'yearly', 
    token: string, 
    isAutoRenew: boolean
) {
  const supabase = await getSupabase();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // ดึงวันหมดอายุแยก Tier
    const { data: brand } = await supabase
        .from('brands')
        .select('omise_customer_id, expiry_basic, expiry_pro, expiry_ultimate')
        .eq('id', brandId)
        .single();

    const amount = calculatePrice(newPlan, period);
    
    // ... (ตัดบัตร Omise เหมือนเดิม) ...
    if (amount > 0) {
       if (!token) throw new Error("Payment token required");
       let description = `Upgrade ${newPlan.toUpperCase()} (${period}) - Brand: ${brandId}`;
       
       const charge = await new Promise<any>((resolve, reject) => {
          omise.charges.create({ amount, currency: 'thb', description, card: token }, (err, resp) => err ? reject(err) : resolve(resp));
       });
       if (charge.status !== 'successful') throw new Error(`Payment Failed: ${charge.failure_message || 'Declined'}`);
    }
    
    // ✅ คำนวณวันหมดอายุ (Logic เดิม)
    let updateData: any = { 
        is_auto_renew: isAutoRenew, 
        updated_at: new Date().toISOString() 
    };
    if (!brand) {
    throw new Error("ไม่พบข้อมูลร้านค้า (Brand not found)");
}

    if (newPlan === 'basic') updateData.expiry_basic = calculateNewExpiryForTier(brand.expiry_basic, period);
    else if (newPlan === 'pro') updateData.expiry_pro = calculateNewExpiryForTier(brand.expiry_pro, period);
    else if (newPlan === 'ultimate') updateData.expiry_ultimate = calculateNewExpiryForTier(brand.expiry_ultimate, period);

    // อัปเดตวันหมดอายุ
    await supabase.from('brands').update(updateData).eq('id', brandId);

    // คำนวณ Effective Plan ใหม่
    const { data: updatedBrand } = await supabase.from('brands').select('*').eq('id', brandId).single();
    const effectivePlan = calculateEffectivePlan(updatedBrand);
    
    // อัปเดต Plan หลัก
    await supabase.from('brands').update({ plan: effectivePlan }).eq('id', brandId);
    
    // ------------------------------------------------------------------
    // ✅ เรียกใช้ Sync Theme ตัวเทพ (แก้ไขตรงนี้ให้ส่งค่าถูกต้อง)
    // ------------------------------------------------------------------
    // ต้องดึงวันหมดอายุของ Plan นั้นๆ ส่งไปให้ syncThemesWithPlan
    let activeExpiry = null;
    if (effectivePlan === 'ultimate') activeExpiry = updatedBrand.expiry_ultimate;
    else if (effectivePlan === 'pro') activeExpiry = updatedBrand.expiry_pro;
    else if (effectivePlan === 'basic') activeExpiry = updatedBrand.expiry_basic;

    // เรียกฟังก์ชันที่ Import มา (ไม่ใช่ตัวเก่าในไฟล์นี้)
    await syncThemesWithPlan(supabase, brandId, effectivePlan, activeExpiry);

    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 2. PromptPay (Create Charge)
export async function createPromptPayChargeAction(
    brandId: string, 
    newPlan: string, 
    period: 'monthly' | 'yearly', 
    sourceId: string
) {
    // ... Logic เดิม ...
    const supabase = await getSupabase();
    try {
        const amount = calculatePrice(newPlan, period);
        if (amount === 0) return { success: true, type: 'free' };

        const charge = await new Promise<any>((resolve, reject) => {
            omise.charges.create({
                amount, currency: 'thb', source: sourceId,
                description: `Upgrade ${newPlan.toUpperCase()} (${period}) - PromptPay`
            }, (err, resp) => err ? reject(err) : resolve(resp));
        });

        if (charge.status === 'pending') {
            return { success: true, type: 'promptpay', chargeId: charge.id, qrImage: charge.source.scannable_code.image.download_uri };
        } else {
            throw new Error('Charge creation failed');
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 3. PromptPay (Check Status)
export async function checkPaymentStatusAction(
    brandId: string, 
    chargeId: string, 
    newPlan: string,
    period: 'monthly' | 'yearly'
) {
    const supabase = await getSupabase();
    try {
        const charge = await new Promise<any>((resolve, reject) => {
            omise.charges.retrieve(chargeId, (err, resp) => err ? reject(err) : resolve(resp));
        });

        if (charge.status === 'successful') {
            const { data: brand } = await supabase.from('brands').select('*').eq('id', brandId).single();
            let updateData: any = { updated_at: new Date().toISOString() };

            if (newPlan === 'basic') updateData.expiry_basic = calculateNewExpiryForTier(brand.expiry_basic, period);
            else if (newPlan === 'pro') updateData.expiry_pro = calculateNewExpiryForTier(brand.expiry_pro, period);
            else if (newPlan === 'ultimate') updateData.expiry_ultimate = calculateNewExpiryForTier(brand.expiry_ultimate, period);

            await supabase.from('brands').update(updateData).eq('id', brandId);

            // Recalculate & Sync
            const { data: updatedBrand } = await supabase.from('brands').select('*').eq('id', brandId).single();
            const effectivePlan = calculateEffectivePlan(updatedBrand);
            
            await supabase.from('brands').update({ plan: effectivePlan }).eq('id', brandId);

            // ------------------------------------------------------------------
            // ✅ เรียกใช้ Sync Theme ตัวเทพ (แก้ไขตรงนี้ด้วย)
            // ------------------------------------------------------------------
            let activeExpiry = null;
            if (effectivePlan === 'ultimate') activeExpiry = updatedBrand.expiry_ultimate;
            else if (effectivePlan === 'pro') activeExpiry = updatedBrand.expiry_pro;
            else if (effectivePlan === 'basic') activeExpiry = updatedBrand.expiry_basic;

            await syncThemesWithPlan(supabase, brandId, effectivePlan, activeExpiry);

            return { status: 'successful' };
        } else if (charge.status === 'failed') return { status: 'failed' };
        return { status: 'pending' };
    } catch (error: any) {
        return { status: 'error', error: error.message };
    }
}