// app/actions/historyActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getPaymentHistoryAction(brandId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );

  try {
    // ดึงข้อมูลจาก payment_logs เรียงจากล่าสุดไปเก่าสุด
    const { data, error } = await supabase
      .from('payment_logs')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, history: data };
  } catch (error: any) {
    console.error('Fetch History Error:', error);
    return { success: false, error: error.message };
  }
}