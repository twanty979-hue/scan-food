// app/actions/settingsActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js'; // ✅ เพิ่ม import นี้เพื่อสร้าง Admin Client
import { cookies } from 'next/headers';
import Omise from 'omise';
import dayjs from 'dayjs';

// ✅ Import Logic ธีม และ Log
import { syncThemesWithPlan } from './themeActions'; 
import { createPaymentLog, updatePaymentLogStatus } from './logActions'; // ✅ Import updatePaymentLogStatus มาด้วย

const omise = Omise({
  publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!,
  secretKey: process.env.OMISE_SECRET_KEY!,
});

// ----------------------------------------------------------------------
// 🗝️ สร้าง Admin Client (Service Role)
// ใช้สำหรับ checkPaymentStatusAction เพื่อทะลุ RLS
// ----------------------------------------------------------------------
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const BASE_PRICES: Record<string, number> = {
  free: 0,
  basic: 25000, 
  pro: 48900, 
  ultimate: 199900 
};

// Client สำหรับ User ทั่วไป (ใช้ตรวจสอบสิทธิ์เจ้าของ)
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
// 📅 HELPER: คำนวณวันหมดอายุ (แยกตาม Tier)
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

    if (period === 'monthly') {
        // 🌙 รายเดือน
        return baseDate.add(30, 'day').toISOString();
    } else {
        // ☀️ รายปี
        return baseDate.add(1, 'year').toISOString();
    }
}

function calculatePrice(plan: string, period: 'monthly' | 'yearly') {
    const base = BASE_PRICES[plan] || 0;
    return period === 'yearly' ? Math.floor((base * 12) * 0.8) : base;
}

// ======================================================================
// 👤 STANDARD ACTIONS (ใช้ User Context เพื่อความปลอดภัยเรื่อง Ownership)
// ======================================================================

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

// ======================================================================
// 💳 PAYMENT ACTIONS
// ======================================================================

// 1. Credit Card (Upgrade)
// ใช้ User Context เพราะต้องเช็คว่าคนกดเป็นเจ้าของ Brand จริงไหมก่อนจ่าย
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

    const { data: brand } = await supabase.from('brands').select('*').eq('id', brandId).single();
    if (!brand) throw new Error("Brand not found");

    const amount = calculatePrice(newPlan, period);
    
    // ... Process Payment ...
    if (amount > 0) {
       if (!token) throw new Error("Payment token required");
       let description = `Upgrade ${newPlan.toUpperCase()} (${period}) - Brand: ${brandId}`;
       
       const charge = await new Promise<any>((resolve, reject) => {
          omise.charges.create({ 
              amount, 
              currency: 'thb', 
              description, 
              card: token,
              metadata: {
                  brand_id: brandId,
                  new_plan: newPlan,
                  period: period,
                  type: 'upgrade_plan'
              }
          }, (err, resp) => err ? reject(err) : resolve(resp));
       });

       // ❌ CASE 1: จ่ายไม่ผ่าน
       if (charge.status !== 'successful') {
            // บันทึก Log ว่าล้มเหลว
            await createPaymentLog({
                brand_id: brandId,
                charge_id: charge.id,
                amount: amount,
                status: 'failed',
                payment_method: 'credit_card',
                type: 'upgrade_plan',
                plan_detail: newPlan,
                period: period
            });
            throw new Error(`Payment Failed: ${charge.failure_message || 'Declined'}`);
       }

       // ✅ CASE 2: จ่ายผ่าน
       await createPaymentLog({
            brand_id: brandId,
            charge_id: charge.id,
            amount: amount,
            status: 'successful',
            payment_method: 'credit_card',
            type: 'upgrade_plan',
            plan_detail: newPlan,
            period: period
       });
    }
    
    // ... Update Logic ...
    let updateData: any = { 
        is_auto_renew: isAutoRenew, 
        updated_at: new Date().toISOString() 
    };

    if (newPlan === 'basic') updateData.expiry_basic = calculateNewExpiryForTier(brand.expiry_basic, period);
    else if (newPlan === 'pro') updateData.expiry_pro = calculateNewExpiryForTier(brand.expiry_pro, period);
    else if (newPlan === 'ultimate') updateData.expiry_ultimate = calculateNewExpiryForTier(brand.expiry_ultimate, period);

    await supabase.from('brands').update(updateData).eq('id', brandId);

    // Recalculate Plan
    const { data: updatedBrand } = await supabase.from('brands').select('*').eq('id', brandId).single();
    const effectivePlan = calculateEffectivePlan(updatedBrand);
    
    await supabase.from('brands').update({ plan: effectivePlan }).eq('id', brandId);
    
    // Sync Theme
    let activeExpiry = null;
    if (effectivePlan === 'ultimate') activeExpiry = updatedBrand.expiry_ultimate;
    else if (effectivePlan === 'pro') activeExpiry = updatedBrand.expiry_pro;
    else if (effectivePlan === 'basic') activeExpiry = updatedBrand.expiry_basic;

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
    // ใช้ User Context เพื่อความปลอดภัย
    const supabase = await getSupabase(); // ✅ Correct
    try {
        const amount = calculatePrice(newPlan, period);
        if (amount === 0) return { success: true, type: 'free' };

        const charge = await new Promise<any>((resolve, reject) => {
            omise.charges.create({
                amount, 
                currency: 'thb', 
                source: sourceId,
                description: `Upgrade ${newPlan.toUpperCase()} (${period}) - PromptPay`,
                metadata: {
                    brand_id: brandId,
                    new_plan: newPlan,
                    period: period,
                    type: 'upgrade_plan'
                }
            }, (err, resp) => err ? reject(err) : resolve(resp));
        });

        if (charge.status === 'pending') {
            // ⏳ CASE 3: สร้าง QR เสร็จ (รอจ่าย)
            // บันทึก Log ว่า Pending
            await createPaymentLog({
                brand_id: brandId,
                charge_id: charge.id,
                amount: amount,
                status: 'pending',
                payment_method: 'promptpay',
                type: 'upgrade_plan',
                plan_detail: newPlan,
                period: period
            });

            return { success: true, type: 'promptpay', chargeId: charge.id, qrImage: charge.source.scannable_code.image.download_uri };
        } else {
            throw new Error('Charge creation failed');
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ----------------------------------------------------------------------
// ⚡ 3. PromptPay (Check Status) - 🛠️ ใช้ SERVICE ROLE เต็มระบบ
// ----------------------------------------------------------------------
export async function checkPaymentStatusAction(
  brandId: string, 
  chargeId: string, 
  newPlan: string,
  period: 'monthly' | 'yearly'
) {
  // ⚠️ ไม่เรียก getSupabase() เพราะเราจะใช้ supabaseAdmin แทน
  // เพื่อแก้ปัญหา User ปิดหน้าเว็บ หรือ Session หลุด แล้ว Log ไม่บันทึก
  
  try {
      const charge = await new Promise<any>((resolve, reject) => {
          omise.charges.retrieve(chargeId, (err, resp) => err ? reject(err) : resolve(resp));
      });

      if (charge.status === 'successful') {
          
          // 🛡️ เช็คว่า Process ไปหรือยัง
          if (charge.metadata && charge.metadata.is_processed === 'true') {
              return { status: 'successful' }; 
          }

          // -------------------------------------------------------
          // ✅ อัปเดต Log เป็น Successful (ใช้ Admin Function)
          // -------------------------------------------------------
          await updatePaymentLogStatus(chargeId, 'successful');

          // -------------------------------------------------------
          // ✅ เริ่มกระบวนการอัปเกรด (ใช้ supabaseAdmin ทะลุ RLS)
          // -------------------------------------------------------
          
          // 1. ดึงข้อมูล Brand
          const { data: brand, error: brandError } = await supabaseAdmin
              .from('brands')
              .select('*')
              .eq('id', brandId)
              .single();
              
          if (brandError || !brand) {
             console.error("Brand not found (Admin Check):", brandError);
             throw new Error("Brand not found");
          }

          // 2. คำนวณวันหมดอายุ
          let updateData: any = { updated_at: new Date().toISOString() };

          if (newPlan === 'basic') updateData.expiry_basic = calculateNewExpiryForTier(brand.expiry_basic, period);
          else if (newPlan === 'pro') updateData.expiry_pro = calculateNewExpiryForTier(brand.expiry_pro, period);
          else if (newPlan === 'ultimate') updateData.expiry_ultimate = calculateNewExpiryForTier(brand.expiry_ultimate, period);

          // 3. อัปเดตวันหมดอายุ
          await supabaseAdmin.from('brands').update(updateData).eq('id', brandId);

          // 4. Recalculate & Sync Plan
          const { data: updatedBrand } = await supabaseAdmin.from('brands').select('*').eq('id', brandId).single();
          const effectivePlan = calculateEffectivePlan(updatedBrand);
          
          await supabaseAdmin.from('brands').update({ plan: effectivePlan }).eq('id', brandId);

          let activeExpiry = null;
          if (effectivePlan === 'ultimate') activeExpiry = updatedBrand.expiry_ultimate;
          else if (effectivePlan === 'pro') activeExpiry = updatedBrand.expiry_pro;
          else if (effectivePlan === 'basic') activeExpiry = updatedBrand.expiry_basic;

          // ✅ ส่ง supabaseAdmin เข้าไปใน syncThemes เพื่อให้ทะลุ RLS ในตาราง themes ด้วย
          await syncThemesWithPlan(supabaseAdmin, brandId, effectivePlan, activeExpiry);

          // -------------------------------------------------------
          // ✅ Mark processed at Omise
          // -------------------------------------------------------
          await new Promise((resolve) => {
              omise.charges.update(chargeId, {
                metadata: { ...charge.metadata, is_processed: 'true' }
              } as any, resolve);
          });

          return { status: 'successful' };

      } else if (charge.status === 'failed') {
          // ❌ ถ้าเช็คแล้วเจอว่า Failed ก็อัปเดต Log ด้วย (ใช้ Admin Function)
          await updatePaymentLogStatus(chargeId, 'failed', charge.failure_message);
          return { status: 'failed' };
      }
      
      return { status: 'pending' };

  } catch (error: any) {
      console.error("❌ Check Status Error:", error.message);
      return { status: 'error', error: error.message };
  }
}