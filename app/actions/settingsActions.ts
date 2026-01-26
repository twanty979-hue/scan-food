// app/actions/settingsActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Omise from 'omise';

const omise = Omise({
  publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!,
  secretKey: process.env.OMISE_SECRET_KEY!,
});

const PLAN_PRICES: Record<string, number> = {
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

// --- Standard Actions ---

export async function getBrandSettingsAction() {
  const supabase = await getSupabase();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('brand_id, role').eq('id', user.id).single();
    if (!profile?.brand_id) throw new Error("No brand assigned");
    const { data: brand } = await supabase.from('brands').select('*').eq('id', profile.brand_id).single();
    return { success: true, brand, brandId: profile.brand_id, isOwner: profile.role === 'owner' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBrandSettingsAction(brandId: string, payload: any) {
  const supabase = await getSupabase();
  try {
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
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Payment Actions ---

// ✅ รองรับ Auto Renew
export async function upgradeBrandPlanAction(brandId: string, newPlan: string, token: string, isAutoRenew: boolean) {
  const supabase = await getSupabase();
  try {
    const { data: { user } } = await supabase.auth.getUser();


    if (!user) throw new Error("Unauthorized");

    
    
    // ดึงข้อมูล Brand เพื่อเอา Customer ID เดิม (ถ้ามี)
    const { data: brand } = await supabase.from('brands').select('omise_customer_id').eq('id', brandId).single();

    const amount = PLAN_PRICES[newPlan] || 0;
    let omiseCustomerId = brand?.omise_customer_id;
    
    if (amount > 0) {
       if (!token) throw new Error("Payment token required");

       let chargeParams: any = {
          amount,
          currency: 'thb',
          description: `Upgrade ${newPlan.toUpperCase()} (Brand: ${brandId})`
       };

       if (isAutoRenew) {
           // สร้าง/อัปเดต Customer เพื่อเก็บข้อมูลบัตร
           if (!omiseCustomerId) {
               const customer = await new Promise<any>((resolve, reject) => {
                   omise.customers.create({
                       email: user.email,
                       description: `Brand: ${brandId}`,
                       card: token
                   }, (err, resp) => err ? reject(err) : resolve(resp));
               });
               omiseCustomerId = customer.id;
           } else {
               await new Promise<any>((resolve, reject) => {
                   omise.customers.update(omiseCustomerId, { card: token }, (err, resp) => err ? reject(err) : resolve(resp));
               });
           }
           chargeParams.customer = omiseCustomerId; // ตัดจาก Customer
       } else {
           chargeParams.card = token; // ตัดจาก Token (ครั้งเดียว)
       }

       const charge = await new Promise<any>((resolve, reject) => {
          omise.charges.create(chargeParams, (err, resp) => err ? reject(err) : resolve(resp));
       });

       if (charge.status !== 'successful') throw new Error(`Payment Failed: ${charge.failure_message || 'Declined'}`);
    }

    // อัปเดต DB
    const { error } = await supabase
  .from('brands')
  .update({ 
      plan: newPlan,
      is_auto_renew: isAutoRenew,
      omise_customer_id: omiseCustomerId,
      expiry_date: nextMonth.toISOString(), // ✅ บันทึกวันหมดอายุ
      updated_at: new Date().toISOString()
  })
  .eq('id', brandId);

    if (error) throw error;
    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// PromptPay
export async function createPromptPayChargeAction(brandId: string, newPlan: string, sourceId: string) {
  const supabase = await getSupabase();
  try {
    const amount = PLAN_PRICES[newPlan] || 0;
    if (amount === 0) {
        await supabase.from('brands').update({ plan: newPlan, updated_at: new Date().toISOString() }).eq('id', brandId);
        return { success: true, type: 'free' };
    }

    const charge = await new Promise<any>((resolve, reject) => {
        omise.charges.create({
            amount, currency: 'thb', source: sourceId,
            description: `Upgrade ${newPlan} (PromptPay) - ${brandId}`
        }, (err, resp) => err ? reject(err) : resolve(resp));
    });

    if (charge.status === 'pending') {
        return { success: true, type: 'promptpay', chargeId: charge.id, qrImage: charge.source.scannable_code.image.download_uri };
    } else if (charge.status === 'successful') {
        await supabase.from('brands').update({ plan: newPlan, updated_at: new Date().toISOString() }).eq('id', brandId);
        return { success: true, type: 'success' };
    } else {
        throw new Error('Charge failed');
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkPaymentStatusAction(brandId: string, chargeId: string, newPlan: string) {
    const supabase = await getSupabase();
    try {
        const charge = await new Promise<any>((resolve, reject) => {
            omise.charges.retrieve(chargeId, (err, resp) => err ? reject(err) : resolve(resp));
        });

        if (charge.status === 'successful') {
            await supabase.from('brands').update({ plan: newPlan, updated_at: new Date().toISOString() }).eq('id', brandId);
            return { status: 'successful' };
        } else if (charge.status === 'failed') return { status: 'failed' };
        return { status: 'pending' };
    } catch (error: any) {
        return { status: 'error', error: error.message };
    }
}

