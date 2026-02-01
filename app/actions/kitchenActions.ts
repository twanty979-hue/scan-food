'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function createClient() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        { cookies: { get(name) { return cookieStore.get(name)?.value } } }
    );
}

export async function getKitchenOrdersAction() {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
        if (!profile?.brand_id) throw new Error("No brand assigned");

        const { data, error } = await supabase
            .from('orders')
            .select(`*, order_items (*)`) // ดึงมาหมดเลยรวมถึงตัวที่ cancel แล้ว
            .eq('brand_id', profile.brand_id)
            .in('status', ['pending', 'preparing'])
            .order('created_at', { ascending: true });

        if (error) throw error;

        // ✅ ส่ง data กลับไปตรงๆ เลย Frontend จะไปจัดการแสดงผลเอง (ขีดฆ่า/จาง)
        return { success: true, data: data || [] };

    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
    return { success: !error, error: error?.message };
}

// ✅ อัปเดตใหม่: ยกเลิกทั้งบิล และลามไปยกเลิกรายการย่อยทุกตัว
export async function cancelOrderAction(orderId: string) {
    const supabase = await createClient();
    
    // ดึง User ปัจจุบันที่กดปุ่ม
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const now = new Date().toISOString(); // ใช้เวลาเดียวกันทั้งชุด

    // 1. อัปเดตสถานะของ "บิลหลัก" (Orders)
    const { error: orderError } = await supabase
        .from('orders')
        .update({ 
            status: 'cancelled',
            cancelled_by: user.id,      // 👈 เก็บ ID คนลบ
            cancelled_at: now           // 👈 เก็บเวลา
        })
        .eq('id', orderId);

    if (orderError) return { success: false, error: orderError.message };

    // 2. อัปเดตสถานะของ "รายการอาหารลูก" (Order Items) ทั้งหมดในบิลนี้
    const { error: itemsError } = await supabase
        .from('order_items')
        .update({ 
            status: 'cancelled',
            cancelled_by: user.id,
            cancelled_at: now
        })
        .eq('order_id', orderId); // เลือกทุกรายการที่เป็นของ Order นี้

    return { success: !itemsError, error: itemsError?.message };
}

// ✅ ยกเลิกบางรายการ (รายตัว)
export async function cancelOrderItemAction(itemId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
        .from('order_items')
        .update({ 
            status: 'cancelled',
            cancelled_by: user?.id,
            cancelled_at: new Date().toISOString()
        })
        .eq('id', itemId);
    return { success: !error, error: error?.message };
}

// ✅ กู้คืนรายการ (Restore)
export async function restoreOrderItemAction(itemId: string) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from('order_items')
        .update({ 
            status: 'active', // หรือ 'pending' ตาม Default ใน DB
            cancelled_by: null,
            cancelled_at: null
        })
        .eq('id', itemId);
    return { success: !error, error: error?.message };
}