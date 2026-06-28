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

    // 3. เริ่มนับยอดขาย 30 วันย้อนหลัง
    const startOfPeriod = now.subtract(30, 'day').startOf('day').toISOString();
    const endOfPeriod = now.endOf('day').toISOString();

    // ดึงออเดอร์ที่เป็นโต๊ะมาก่อน
    const { data: tableOrders, error: orderErr } = await supabase
        .from('orders')
        .select('id')
        .eq('brand_id', brandId)
        .eq('type', 'table')
        .not('table_id', 'is', null)
        .gte('created_at', startOfPeriod);
        
    if (orderErr) throw new Error("ระบบตรวจสอบโควต้าขัดข้อง");
    
    const orderIds = tableOrders?.map(o => o.id) || [];
    
    let usage = 0;
    if (orderIds.length > 0) {
        const { count, error } = await supabase
            .from('pai_orders')
            .select('id', { count: 'exact', head: true })
            .in('order_id', orderIds)
            .gte('created_at', startOfPeriod)
            .lte('created_at', endOfPeriod);
            
        if (error) throw new Error("ระบบตรวจสอบโควต้าขัดข้อง");
        usage = count || 0;
    }

    // 4. ตัดสิน: ถ้าเกิน Limit -> ระเบิด Error
    if (usage >= MAX_FREE_ORDERS) {
        throw new Error(`🚫 แพ็กเกจฟรีจำกัดบิล QR ${MAX_FREE_ORDERS} บิล/เดือน (ใช้ไปแล้ว ${usage}) กรุณาอัปเกรด!`);
    }

    return true; 
}

// ----------------------------------------------------------------------------
// 📊 ฟังก์ชัน 2: ดึงข้อมูลสถานะไปโชว์ (ใช้แสดงผลที่ปุ่ม QR Code)
// ----------------------------------------------------------------------------
export async function getOrderUsage(brandId: string, customSupabase?: any) {
    const supabase = customSupabase || await getSupabase();
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
        return { usage: 0, limit: Infinity, isLocked: false, plan: effectivePlan, history: [] };
    }

    // กรณีฟรี (Free) -> นับยอด 30 วันย้อนหลัง
    const startOfPeriod = now.subtract(30, 'day').startOf('day').toISOString();
    const endOfPeriod = now.endOf('day').toISOString();
    
    // ดึงเฉพาะ order_id ของโต๊ะ
    const { data: tableOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('brand_id', brandId)
        .eq('type', 'table')
        .not('table_id', 'is', null)
        .gte('created_at', startOfPeriod);
        
    const orderIds = tableOrders?.map((o: any) => o.id) || [];
    
    let ordersData: any[] = [];
    if (orderIds.length > 0) {
        const { data } = await supabase
            .from('pai_orders')
            .select('created_at')
            .in('order_id', orderIds)
            .gte('created_at', startOfPeriod)
            .lte('created_at', endOfPeriod);
        ordersData = data || [];
    }

    const usage = ordersData.length;

    const historyMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
        historyMap[now.subtract(i, 'day').format('YYYY-MM-DD')] = 0;
    }
    
    if (ordersData) {
        for (const order of ordersData) {
            if (order.created_at) {
                const dateStr = dayjs(order.created_at).format('YYYY-MM-DD');
                if (historyMap[dateStr] !== undefined) {
                    historyMap[dateStr]++;
                }
            }
        }
    }

    const history = Object.entries(historyMap).map(([date, count]) => ({ date, count }));

    return { 
        usage, 
        limit: MAX_FREE_ORDERS, 
        isLocked: usage >= MAX_FREE_ORDERS, 
        plan: 'free',
        history
    };
}