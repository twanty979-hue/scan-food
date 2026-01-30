// app/actions/paymentActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import dayjs from 'dayjs';
// ✅ 1. Import ฟังก์ชัน Sync Theme
import { syncThemesWithPlan } from './themeActions';
// ✅ 2. Import ยามเฝ้าประตู (จำกัดออเดอร์)
import { checkOrderLimitOrThrow } from './limitGuard';

// --- Helpers ---
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );
}

// ----------------------------------------------------------------------
// 🏆 HELPER: คำนวณ Plan (Logic เดียวกับ ThemeActions)
// ----------------------------------------------------------------------
function calculateEffectivePlan(brand: any) {
    const now = dayjs();
    if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) {
        return { plan: 'ultimate', expiry: brand.expiry_ultimate };
    }
    if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) {
        return { plan: 'pro', expiry: brand.expiry_pro };
    }
    if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) {
        return { plan: 'basic', expiry: brand.expiry_basic };
    }
    return { plan: 'free', expiry: null }; 
}

// ... (getMyBrandId function เดิม) ...
async function getMyBrandId(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('*, brands(*)').eq('id', user.id).single();
    if (!profile?.brand_id) throw new Error("No brand assigned");
    return { brandId: profile.brand_id, user, profile, brand: profile.brands };
}

// --- 1. Fetch Initial Data (โหลดครั้งแรกทีเดียวจบ) ---
export async function getPaymentInitialDataAction() {
  const supabase = await getSupabase();
  try {
    const { brandId, user, profile, brand } = await getMyBrandId(supabase);

    // ======================================================================
    // 🛡️ SECURITY CHECK: Sync Theme ทุกครั้งที่เข้าหน้าขาย (Payment)
    // ======================================================================
    
    // 1. คำนวณ Plan ล่าสุด ณ วินาทีนี้
    const { plan: effectivePlan, expiry: activeExpiry } = calculateEffectivePlan(brand);

    // 2. ถ้า Plan ใน DB ไม่ตรงกับความจริง (เช่น หมดอายุเมื่อกี้) -> อัปเดต DB
    if (brand.plan !== effectivePlan) {
        await supabase.from('brands').update({ plan: effectivePlan }).eq('id', brandId);
        brand.plan = effectivePlan; // อัปเดตตัวแปรใน memory ด้วย
    }

    // 3. สั่ง Sync Theme (ลบตัวเกินสิทธิ์ / รักษาตัวซื้อแยก)
    await syncThemesWithPlan(supabase, brandId, effectivePlan, activeExpiry);

    // 4. (แถม) ตรวจสอบ Theme Mode ปัจจุบัน
    // ถ้า Theme Mode ที่ใช้อยู่ "เป็นของที่หมดสิทธิ์" -> ดีดกลับเป็น Standard
    if (brand.theme_mode && brand.theme_mode !== 'standard') {
        // เช็คว่าธีมที่ใช้อยู่ ยังมีสิทธิ์ใช้ไหม?
        const { data: activeTheme } = await supabase.from('themes')
            .select('id, expires_at, marketplace_themes!inner(theme_mode)')
            .eq('brand_id', brandId)
            .eq('marketplace_themes.theme_mode', brand.theme_mode)
            .single();

        let isValid = false;
        if (activeTheme) {
             const isExpired = activeTheme.expires_at && dayjs(activeTheme.expires_at).isBefore(dayjs());
             // ถ้ายังไม่หมดอายุ หรือเป็น Lifetime -> ถือว่า Valid
             if (!isExpired) isValid = true; 
        }

        // ถ้าไม่ Valid -> ดีดกลับเป็น Standard ทันที
        if (!isValid) {
            await supabase.from('brands').update({ theme_mode: 'standard' }).eq('id', brandId);
            brand.theme_mode = 'standard'; // อัปเดตให้หน้าบ้านเห็นทันที
        }
    }
    // ======================================================================

    const [cats, prods, discs, tables] = await Promise.all([
      supabase.from('categories').select('*').eq('brand_id', brandId).order('sort_order'),
      supabase.from('products').select('*').eq('brand_id', brandId).eq('is_available', true).order('created_at', { ascending: false }),
      supabase.from('discounts').select(`*, discount_products(product_id)`).eq('brand_id', brandId).eq('is_active', true),
      supabase.from('tables').select('*').eq('brand_id', brandId).order('label')
    ]);

    return { 
        success: true, 
        brandId, 
        user, 
        profile, 
        brand, // ส่ง brand ที่อัปเดต plan/theme_mode แล้วกลับไป
        categories: cats.data || [],
        products: prods.data || [],
        discounts: discs.data || [],
        tables: tables.data || []
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- 2. Fetch Unpaid Orders (ดึงบิลค้างจ่าย) ---
export async function getUnpaidOrdersAction(brandId: string) {
    const supabase = await getSupabase();
    // ดึงออเดอร์ที่ 'done' (ทำเสร็จแล้ว) แต่ยังไม่จ่าย
    const { data: rawOrders } = await supabase.from('orders')
        .select(`*, order_items(*)`)
        .eq('brand_id', brandId)
        .eq('status', 'done') 
        .order('created_at', { ascending: false });

    if (!rawOrders) return [];

    // Grouping Logic (เหมือนเดิม)
    const grouped: { [key: string]: any } = {};
    rawOrders.forEach(order => {
        const table = order.table_label || 'Walk-in';
        if (!grouped[table]) {
            grouped[table] = { 
                id: order.id, // ID ตัวแทน (ใช้อันล่าสุด)
                table_label: table, 
                brand_id: order.brand_id, 
                total_price: 0, 
                order_items: [], 
                original_ids: [] // เก็บ ID จริงๆ ของทุก Order ย่อย
            };
        }
        grouped[table].total_price += Number(order.total_price);
        if (order.order_items) grouped[table].order_items.push(...order.order_items);
        grouped[table].original_ids.push(order.id);
    });

    return Object.values(grouped);
}

// --- 3. Process Payment (หัวใจสำคัญ: จ่ายเงิน) ---
export async function processPaymentAction(payload: any) {
    const supabase = await getSupabase();
    
    // Payload ประกอบด้วย: brandId, userId, amount, method, received, change, type ('tables' | 'pos'), selectedOrder?, cart?
    const { brandId, userId, totalAmount, receivedAmount, changeAmount, paymentMethod, type, selectedOrder, cart } = payload;

    try {
        // ======================================================================
        // 🛑 เพิ่มบรรทัดนี้: เรียกยามมาตรวจก่อน! (ห้ามเกิน 30 ออเดอร์)
        // ======================================================================
        await checkOrderLimitOrThrow(brandId);
        // ======================================================================

        let finalOrderId: any = null;
        let receiptItems: any[] = [];
        let tableLabel = 'Walk-in';

        // Case A: จ่ายจากโต๊ะ (มี Order อยู่แล้ว)
        if (type === 'tables' && selectedOrder) {
            finalOrderId = selectedOrder.id; // ใช้ ID ล่าสุดเป็นตัวหลัก
            tableLabel = selectedOrder.table_label;
            receiptItems = selectedOrder.order_items;
        } 
        // Case B: จ่ายแบบ POS (ต้องสร้าง Order ใหม่ก่อน)
        else {
            const { data: newOrder, error: orderErr } = await supabase.from('orders').insert({
                brand_id: brandId, 
                status: 'paid', // จ่ายเลย
                total_price: totalAmount, 
                table_label: 'Walk-in', 
                type: 'pos'
            }).select().single();
            
            if (orderErr) throw orderErr;
            finalOrderId = newOrder.id;

            // บันทึก Order Items
            receiptItems = cart.map((i: any) => ({ 
                order_id: finalOrderId, 
                product_id: i.id, 
                product_name: i.name, 
                quantity: i.quantity, 
                price: i.price, 
                variant: i.variant,
                promotion_snapshot: i.promotion_snapshot 
            }));
            await supabase.from('order_items').insert(receiptItems);
        }

        // 2. สร้าง Record การจ่ายเงิน (pai_orders)
        const { data: payRecord, error: payError } = await supabase.from('pai_orders').insert({
            order_id: finalOrderId, 
            brand_id: brandId, 
            total_amount: totalAmount, 
            received_amount: receivedAmount, 
            change_amount: changeAmount, 
            payment_method: paymentMethod, 
            cashier_id: userId 
        }).select().single();

        if (payError) throw payError;

        // 3. อัปเดตสถานะ Order และ Table (ถ้าเป็นโต๊ะ)
        if (type === 'tables') {
            // อัปเดตทุก Order ย่อยของโต๊ะนี้เป็น 'paid'
            await supabase.from('orders')
                .update({ status: 'paid', payment_id: payRecord.id })
                .in('id', selectedOrder.original_ids);
            
            // รีเซ็ตโต๊ะ
            const newToken = Math.random().toString(36).substring(2, 6).toUpperCase();
            await supabase.from('tables')
                .update({ status: 'available', access_token: newToken })
                .eq('brand_id', brandId)
                .eq('label', selectedOrder.table_label);
        } else {
            // ถ้าเป็น POS อัปเดต payment_id ใส่ Order
            await supabase.from('orders').update({ payment_id: payRecord.id }).eq('id', finalOrderId);
        }

        return { success: true, payRecord, receiptItems, tableLabel };

    } catch (error: any) {
        // 🚨 ถ้าติด Limit จะ Error ตรงนี้ และส่งข้อความกลับไปหน้าบ้าน
        return { success: false, error: error.message };
    }
}

// --- 4. Auto Kitchen Actions (Server Side Logic) ---
export async function updateOrderStatusAction(orderId: string, status: string) {
    const supabase = await getSupabase();
    await supabase.from('orders').update({ status }).eq('id', orderId);
    return { success: true };
}

export async function getPendingOrdersAction(brandId: string) {
    const supabase = await getSupabase();
    const { data } = await supabase.from('orders').select('id, status').eq('brand_id', brandId).eq('status', 'pending');
    return data || [];
}