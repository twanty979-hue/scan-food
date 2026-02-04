'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getReceiptsAction(
    startDate: string, 
    endDate: string, 
    page: number = 1, 
    limit: number = 50
) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.SUPABASE_URL!, 
        process.env.SUPABASE_ANON_KEY!, 
        { cookies: { get(name) { return cookieStore.get(name)?.value } } }
    );

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Unauthorized");

        const { data: profile } = await supabase
            .from('profiles').select('brand_id').eq('id', user.id).single();

        if (!profile?.brand_id) throw new Error("No brand assigned");

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // ✅ แก้ไข Query: ระบุ FK (!pai_orders_cashier_id_fkey) ให้ชัดเจน
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                brand:brands ( name ),
                order_items ( * ),
                pai_orders!pai_orders_order_id_fkey (
                    payment_method,
                    cashier_id,
                    cashier:profiles!pai_orders_cashier_id_fkey ( full_name ) 
                )
            `) 
            .eq('brand_id', profile.brand_id)
            .in('status', ['paid', 'cancelled'])
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        // ✅ Mapping Data
        const formattedData = data?.map(order => {
            const paymentInfo = Array.isArray(order.pai_orders) ? order.pai_orders[0] : order.pai_orders;
            
            return {
                id: order.id,
                created_at: order.created_at,
                total_amount: order.total_price, 
                payment_method: paymentInfo?.payment_method || (order.status === 'cancelled' ? 'CANCELLED' : '-'),
                
                // ตรวจสอบ: ถ้ามี cashier และมี full_name ให้ใช้ชื่อนั้น ถ้าไม่มีให้ใช้ System/Admin
                cashier: (paymentInfo?.cashier && paymentInfo.cashier.full_name) 
                    ? paymentInfo.cashier 
                    : { full_name: 'System/Admin' },
                    
                brand: order.brand,
                orders: order 
            };
        });

        return { success: true, data: formattedData || [], hasMore: (data?.length || 0) === limit };

    } catch (error: any) {
        console.error("Fetch Error:", error);
        return { success: false, error: error.message };
    }
}