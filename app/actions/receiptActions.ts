'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// เพิ่ม params เพื่อรับค่าวันที่และหน้า
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

        // คำนวณ Range สำหรับ Pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                brand:brands ( name ),
                order_items ( * ),
                pai_orders!orders_payment_id_fkey (
                    payment_method,
                    cashier_id,
                    cashier:profiles ( full_name )
                )
            `) 
            .eq('brand_id', profile.brand_id)
            .in('status', ['paid', 'cancelled'])
            // ✅ เพิ่ม Filter ระดับ Database (ประหยัดทรัพยากรสุดๆ)
            .gte('created_at', startDate) // มากกว่าหรือเท่ากับเวลาเริ่ม
            .lte('created_at', endDate)   // น้อยกว่าหรือเท่ากับเวลาจบ
            .order('created_at', { ascending: false })
            .range(from, to); // ✅ ดึงแค่ 50 ตัวแรก

        if (error) throw error;

        // Mapping Data เหมือนเดิม
        const formattedData = data?.map(order => {
            const paymentInfo = Array.isArray(order.pai_orders) ? order.pai_orders[0] : order.pai_orders;
            return {
                id: order.id,
                created_at: order.created_at,
                total_amount: order.total_price, 
                payment_method: paymentInfo?.payment_method || (order.status === 'cancelled' ? 'CANCELLED' : '-'),
                cashier: paymentInfo?.cashier || { full_name: 'System/Admin' },
                brand: order.brand,
                orders: order 
            };
        });

        return { success: true, data: formattedData || [], hasMore: (data?.length || 0) === limit };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}