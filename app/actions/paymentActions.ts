// app/actions/paymentActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import dayjs from 'dayjs';
import { syncThemesWithPlan } from './themeActions';
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

async function getMyBrandId(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('*, brands(*)').eq('id', user.id).single();
    if (!profile?.brand_id) throw new Error("No brand assigned");
    return { brandId: profile.brand_id, user, profile, brand: profile.brands };
}

// --- 1. Fetch Initial Data ---
export async function getPaymentInitialDataAction() {
  const supabase = await getSupabase();
  try {
    const { brandId, user, profile, brand } = await getMyBrandId(supabase);

    // Check Plan & Theme
    const { plan: effectivePlan, expiry: activeExpiry } = calculateEffectivePlan(brand);
    if (brand.plan !== effectivePlan) {
        await supabase.from('brands').update({ plan: effectivePlan }).eq('id', brandId);
        brand.plan = effectivePlan;
    }
    await syncThemesWithPlan(supabase, brandId, effectivePlan, activeExpiry);

    if (brand.theme_mode && brand.theme_mode !== 'standard') {
        const { data: activeTheme } = await supabase.from('themes')
            .select('id, expires_at, marketplace_themes!inner(theme_mode)')
            .eq('brand_id', brandId)
            .eq('marketplace_themes.theme_mode', brand.theme_mode)
            .single();

        let isValid = false;
        if (activeTheme) {
             const isExpired = activeTheme.expires_at && dayjs(activeTheme.expires_at).isBefore(dayjs());
             if (!isExpired) isValid = true; 
        }
        if (!isValid) {
            await supabase.from('brands').update({ theme_mode: 'standard' }).eq('id', brandId);
            brand.theme_mode = 'standard';
        }
    }

    const [cats, prods, discs] = await Promise.all([
      supabase.from('categories').select('*').eq('brand_id', brandId).order('sort_order'),
      supabase.from('products').select('*').eq('brand_id', brandId).eq('is_available', true).order('created_at', { ascending: false }),
      supabase.from('discounts').select(`*, discount_products(product_id)`).eq('brand_id', brandId).eq('is_active', true),
    ]);

    const tables = await getAllTablesAction(brandId);

    return { 
        success: true, 
        brandId, 
        user, 
        profile, 
        brand,
        categories: cats.data || [],
        products: prods.data || [],
        discounts: discs.data || [],
        tables: tables || [] 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- 2. Fetch Unpaid Orders ---
export async function getUnpaidOrdersAction(brandId: string) {
    const supabase = await getSupabase();
    // ✅ เพิ่มการดึง id, status ให้ชัดเจน
    const { data: rawOrders } = await supabase.from('orders')
        .select(`*, order_items(*)`)
        .eq('brand_id', brandId)
        .eq('status', 'done') 
        .order('created_at', { ascending: false });

    if (!rawOrders) return [];

    const grouped: { [key: string]: any } = {};
    
    rawOrders.forEach(order => {
        if (order.status === 'cancelled') return;

        const table = order.table_label || 'Walk-in';
        if (!grouped[table]) {
            grouped[table] = { 
                id: order.id, 
                table_label: table, 
                brand_id: order.brand_id, 
                total_price: 0, 
                order_items: [], 
                original_ids: [] 
            };
        }

        if (order.order_items && order.order_items.length > 0) {
            const activeItems = order.order_items.filter((item: any) => item.status !== 'cancelled');
            const itemsTotal = activeItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
            
            grouped[table].total_price += itemsTotal;
            grouped[table].order_items.push(...activeItems);
        } else {
            grouped[table].total_price += Number(order.total_price);
        }

        grouped[table].original_ids.push(order.id);
    });

    return Object.values(grouped).filter((g: any) => g.order_items.length > 0);
}

export async function processPaymentAction(payload: any) {
    const supabase = await getSupabase();
    const { brandId, userId, totalAmount, receivedAmount, changeAmount, paymentMethod, type, selectedOrder, cart, paymentTime } = payload;

    try {
        await checkOrderLimitOrThrow(brandId);

        // 🚨 1. Time Tampering Check & Sync Gap Fix
        // ใช้เวลาจากเครื่อง Client ที่ส่งมา (paymentTime) เพื่อให้ยอดขายตรงวัน
        const saleTime = paymentTime || new Date().toISOString();
        
        // กันคนแฮกตั้งเวลา iPad ล่วงหน้าไปอนาคตเพื่อปั่นยอด (ยอมให้เวลาคลาดเคลื่อนได้ไม่เกิน 1 วัน)
        if (dayjs(saleTime).isAfter(dayjs().add(1, 'day'))) {
            throw new Error("Time manipulation detected");
        }

        let finalOrderId: any = null;
        let receiptItems: any[] = [];
        let tableLabel = 'Walk-in';

        // 🚨 2. Price Tampering Check (ห้ามเชื่อราคาฝั่ง Client 100%)
        if (type === 'pos' && cart && cart.length > 0) {
            // ไปดึงราคาของแท้จากฐานข้อมูล (Server)
            const productIds = cart.map((c: any) => c.id);
            const { data: realProducts } = await supabase
                .from('products')
                .select('id, price, price_special, price_jumbo')
                .in('id', productIds);

            // บังคับเปลี่ยนราคาสินค้าในตะกร้าให้ตรงกับ Server ก่อนเซฟ
            cart.forEach((item: any) => {
                const realP = realProducts?.find(p => p.id === item.id);
                if (realP) {
                    if (item.variant === 'normal') item.price = Number(realP.price);
                    if (item.variant === 'special') item.price = Number(realP.price_special || realP.price);
                    if (item.variant === 'jumbo') item.price = Number(realP.price_jumbo || realP.price);
                }
            });
        }

        if (type === 'tables' && selectedOrder) {
            finalOrderId = selectedOrder.id; 
            tableLabel = selectedOrder.table_label;
            receiptItems = selectedOrder.order_items.filter((i: any) => i.status !== 'cancelled');
        } 
        else {
            // 🔥 ยัด saleTime เข้าไปใน created_at เพื่อแก้บัคซิงค์ยอดเหลื่อมวัน
            const { data: newOrder, error: orderErr } = await supabase.from('orders').insert({
                brand_id: brandId, 
                status: 'paid', 
                total_price: totalAmount, 
                table_label: 'Walk-in', 
                type: 'pos',
                created_at: saleTime,  // <--- จุดแก้
                updated_at: saleTime   // <--- จุดแก้
            }).select().single();
            
            if (orderErr) throw orderErr;
            finalOrderId = newOrder.id;

            receiptItems = cart.map((i: any) => ({ 
                order_id: finalOrderId, 
                product_id: i.id, 
                product_name: i.name, 
                quantity: i.quantity, 
                price: i.price, // เป็นราคาที่ถูก Verify แล้วจากด้านบน
                variant: i.variant,
                promotion_snapshot: i.promotion_snapshot 
            }));
            await supabase.from('order_items').insert(receiptItems);
        }

        // 🔥 ยัด saleTime เข้าไปใน created_at ด้วย
        const { data: payRecord, error: payError } = await supabase.from('pai_orders').insert({
            order_id: finalOrderId, 
            brand_id: brandId, 
            total_amount: totalAmount, 
            received_amount: receivedAmount, 
            change_amount: changeAmount, 
            payment_method: paymentMethod, 
            cashier_id: userId,
            created_at: saleTime  // <--- จุดแก้
        }).select().single();

        if (payError) throw payError;

     if (type === 'tables') {
            // 🚨 1. แก้ไขตรงนี้: ล็อกเป้าอัปเดตด้วย finalOrderId ตรงๆ เลย ไม่ต้องสนสถานะแล้ว เพราะยังไงก็คือบิลที่เราเพิ่งจ่าย
            await supabase.from('orders')
                .update({ 
                    status: 'paid', 
                    payment_id: payRecord.id, // 👈 เอา ID ใบเสร็จไปเสียบ
                    updated_at: saleTime 
                })
                .eq('id', finalOrderId); 
            
            // 🌟 2. ให้เอา Token ที่ POS สุ่มมาให้ ไปบันทึกลง Database ได้เลย
            const validToken = payload.newAccessToken || Math.random().toString(36).substring(2, 6).toUpperCase();
            
            await supabase.from('tables')
                // 🚨 ลบ status: 'available' ออก เพื่อกันบัค Error 400 (Bad Request)
                .update({ access_token: validToken }) 
                .eq('brand_id', brandId)
                .eq('label', selectedOrder.table_label);

        } else {
            await supabase.from('orders')
                .update({ payment_id: payRecord.id })
                .eq('id', finalOrderId);
        }

        return { success: true, payRecord, receiptItems, tableLabel };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- 4. Auto Kitchen & Status Actions ---
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

export async function getPendingAndPreparingOrdersAction(brandId: string) {
    const supabase = await getSupabase();
    const { data } = await supabase.from('orders')
        .select('id, status, updated_at') 
        .eq('brand_id', brandId)
        .in('status', ['pending', 'preparing']); 
    return data || [];
}

// --- 5. Cancel Actions ---
export async function cancelOrderAction(orderId: string) {
    const supabase = await getSupabase();
    const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
    return { success: !error, error: error?.message };
}

export async function cancelOrderItemAction(itemId: string) {
    const supabase = await getSupabase();
    const { error } = await supabase.from('order_items').update({ status: 'cancelled' }).eq('id', itemId);
    return { success: !error, error: error?.message };
}

export async function getAllTablesAction(brandId: string) {
    const supabase = await getSupabase();

    const { data: tables } = await supabase
        .from('tables')
        .select('*')
        .eq('brand_id', brandId)
        .order('label');

    if (!tables) return [];

    // เช็คว่าโต๊ะไหนมีออเดอร์ค้างอยู่บ้าง (ที่ไม่ใช่ paid/cancelled)
    const { data: activeOrders } = await supabase
        .from('orders')
        .select('table_id, table_label, status')
        .eq('brand_id', brandId)
        .in('status', ['pending', 'preparing', 'cooking', 'served', 'done']); 

    const tablesWithStatus = tables.map(table => {
        const isOccupied = activeOrders?.some(order => 
            (order.table_id && order.table_id === table.id) || 
            (order.table_label && order.table_label === table.label)
        );

        return {
            ...table,
            status: isOccupied ? 'occupied' : 'available' 
        };
    });
    
    return tablesWithStatus;
}