// app/actions/kitchenActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ✅ ฟังก์ชัน Helper เพื่อลดการเขียนซ้ำ (Optional แต่แนะนำ)
async function createClient() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.SUPABASE_URL!,       // เปลี่ยนตรงนี้
        process.env.SUPABASE_ANON_KEY!,  // เปลี่ยนตรงนี้
        { cookies: { get(name) { return cookieStore.get(name)?.value } } }
    );
}

export async function getKitchenOrdersAction() {
    // ✅ เรียกใช้ Helper (หรือจะก๊อป code createServerClient มาวางทับตรงนี้ก็ได้)
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
        if (!profile?.brand_id) throw new Error("No brand assigned");

        const { data, error } = await supabase
            .from('orders')
            .select(`*, order_items (*)`)
            .eq('brand_id', profile.brand_id)
            .in('status', ['pending', 'preparing'])
            .order('created_at', { ascending: true });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
    // ✅ จุดที่ 2: ก็ต้องเปลี่ยนเหมือนกัน (ใช้ Helper ก็ง่ายเลย)
    const supabase = await createClient();

    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

    return { success: !error, error: error?.message };
}