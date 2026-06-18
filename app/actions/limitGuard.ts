// app/actions/limitGuard.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import dayjs from 'dayjs';

// 🔧 CONFIG: ตั้งค่าจำนวนออเดอร์ฟรีตรงนี้ที่เดียว (แก้เป็น 30 เมื่อเทสเสร็จนะครับ)
const MAX_FREE_ORDERS = 220; 

// Helper สร้าง Supabase
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );
}

// ----------------------------------------------------------------------------
// 🛡️ ฟังก์ชัน 1: เช็คและบล็อก (ใช้ตอนกดจ่ายเงิน ใน PaymentActions)
// ----------------------------------------------------------------------------
export async function checkOrderLimitOrThrow(brandId: string) {
    const supabase = await getSupabase();
    const now = dayjs();

    // 1. ดึง Plan
    const { data: brand } = await supabase.from('brands').select('plan, expiry_basic, expiry_pro, expiry_ultimate').eq('id', brandId).single();
    if (!brand) throw new Error("Brand not found");

    // 2. คำนวณ Plan (Logic เดิม)
    let effectivePlan = 'free';
    if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) effectivePlan = 'ultimate';
    else if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) effectivePlan = 'pro';
    else if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) effectivePlan = 'basic';

    // ✅ ถ้าไม่ใช่ 'free' (จ่ายเงินแล้ว) -> ผ่านตลอด ไม่จำกัด
    if (effectivePlan !== 'free') return true; 

    // 3. เริ่มนับยอดขาย "เดือนนี้"
    const startOfMonth = now.startOf('month').toISOString();
    const endOfMonth = now.endOf('month').toISOString();

    const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true }) 
        .eq('brand_id', brandId)
        .neq('status', 'cancelled') 
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);

    if (error) throw new Error("ระบบตรวจสอบโควต้าขัดข้อง");

    // 4. ตัดสิน: ถ้าเกิน Limit -> ระเบิด Error
    if (count !== null && count >= MAX_FREE_ORDERS) {
        throw new Error(`🚫 แพ็กเกจฟรีจำกัด ${MAX_FREE_ORDERS} ออเดอร์/เดือน (ใช้ไปแล้ว ${count}) กรุณาอัปเกรด!`);
    }

    return true; 
}

// ----------------------------------------------------------------------------
// 📊 ฟังก์ชัน 2: ดึงข้อมูลสถานะไปโชว์ (ใช้แสดงผลที่ปุ่ม QR Code)
// ----------------------------------------------------------------------------
export async function getOrderUsage(brandId: string) {
    const supabase = await getSupabase();
    const now = dayjs();

    const { data: brand } = await supabase.from('brands').select('plan, expiry_basic, expiry_pro, expiry_ultimate').eq('id', brandId).single();
    if (!brand) return { usage: 0, limit: 0, isLocked: false, plan: 'unknown' };

    // คำนวณ Plan เหมือนข้างบน
    let effectivePlan = 'free';
    if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) effectivePlan = 'ultimate';
    else if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) effectivePlan = 'pro';
    else if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) effectivePlan = 'basic';

    // กรณีจ่ายเงิน (Infinity)
    if (effectivePlan !== 'free') {
        return { usage: 0, limit: Infinity, isLocked: false, plan: effectivePlan };
    }

    // กรณีฟรี (Free) -> นับยอด
    const startOfMonth = now.startOf('month').toISOString();
    const endOfMonth = now.endOf('month').toISOString();
    const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brandId)
        .neq('status', 'cancelled')
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);

    const usage = count || 0;

    return { 
        usage, 
        limit: MAX_FREE_ORDERS, 
        isLocked: usage >= MAX_FREE_ORDERS, // ส่งค่า true ถ้าเกินลิมิต (เอาไปทำปุ่มแดง)
        plan: 'free'
    };
}