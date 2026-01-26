// app/actions/receiptActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getReceiptsAction() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        // ✅ เปลี่ยนมาใช้ Key ฝั่ง Server (เหมือน kitchenActions)
        process.env.SUPABASE_URL!, 
        process.env.SUPABASE_ANON_KEY!, 
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            throw new Error("Unauthorized: กรุณาเข้าสู่ระบบ");
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('brand_id')
            .eq('id', user.id)
            .single();

        if (!profile?.brand_id) throw new Error("บัญชีนี้ยังไม่ผูกกับสาขา");

        // ดึงข้อมูลบิล (ปลอดภัยเพราะกรอง brand_id แล้ว)
        const { data, error } = await supabase
            .from('pai_orders')
            .select(`
                *,
                brand:brands ( name ),
                cashier:profiles ( full_name ),
                orders!payment_id ( 
                    id, table_label, type,
                    order_items ( product_name, quantity, price, variant, promotion_snapshot )
                )
            `)
            .eq('brand_id', profile.brand_id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { success: true, data };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}