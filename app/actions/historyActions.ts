'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getPaymentHistoryAction() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );

  try {
    // 1. ตรวจสอบ User และหา Brand ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from('profiles')
      .select('brand_id')
      .eq('id', user.id)
      .single();

    if (!profile?.brand_id) return { success: true, history: [] };

    // 2. ดึงข้อมูล Payment Logs ตามปกติ
    const { data: logs, error: logsError } = await supabase
      .from('payment_logs')
      .select('*')
      .eq('brand_id', profile.brand_id)
      .order('created_at', { ascending: false });

    if (logsError) throw logsError;

    // 3. รวบรวม ID ของธีมทั้งหมด (เฉพาะรายการที่เป็น buy_theme)
    const themeIds = logs
      .filter(log => log.type === 'buy_theme' && log.plan_detail)
      .map(log => log.plan_detail);

    // 4. ดึงชื่อธีมจากตาราง marketplace_themes ทีเดียว (เพื่อลดการยิง Database หลายรอบ)
    let themesMap: Record<string, string> = {};
    
    if (themeIds.length > 0) {
      const { data: themes } = await supabase
        .from('marketplace_themes')
        .select('id, name')
        .in('id', themeIds);
        
      if (themes) {
        themes.forEach(t => {
          themesMap[t.id] = t.name;
        });
      }
    }

    // 5. ปรุงข้อมูลใหม่ ใส่ชื่อธีม (displayName) เข้าไปให้เลย Frontend จะได้ใช้ง่ายๆ
    const enrichedHistory = logs.map(log => {
      let displayName = log.plan_detail; // ค่าเริ่มต้นคือ ID (กันเหนียว)

      if (log.type === 'buy_theme') {
        // ถ้าเป็นธีม ให้ใช้ชื่อจาก Map ถ้าหาไม่เจอให้ใช้คำว่า "Unknown Theme" หรือ ID เดิม
        displayName = themesMap[log.plan_detail] || `Theme ID: ${log.plan_detail}`;
      } else if (log.type === 'upgrade_plan') {
        // ถ้าเป็นแพ็คเกจ จัดคำให้สวยงาม
        displayName = `Package ${log.plan_detail.toUpperCase()}`;
      }

      return {
        ...log,
        displayName: displayName, // ส่งค่านี้ไปให้หน้าบ้านใช้
      };
    });

    return { success: true, history: enrichedHistory };

  } catch (error: any) {
    console.error('Fetch History Error:', error);
    return { success: false, error: error.message };
  }
}