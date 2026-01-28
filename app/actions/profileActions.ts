// app/actions/profileActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper: สร้าง Client
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );
}

// --- Actions ---

export async function getProfileDataAction() {
  const supabase = await getSupabase();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return { 
        success: true, 
        user: { id: user.id, email: user.email },
        profile 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProfileAction(userId: string, payload: any) {
  const supabase = await getSupabase();
  try {
    // Security check: Ensure updating own profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) throw new Error("Unauthorized");

    const updateData = {
        full_name: payload.full_name,
        phone: payload.phone,
        avatar_url: payload.avatar_url, // อัปเดตเฉพาะถ้ามีการส่งค่ามา
        updated_at: new Date().toISOString()
    };

    // Remove undefined keys
    // ✅ แก้เป็นแบบนี้
Object.keys(updateData).forEach(key => (updateData as any)[key] === undefined && delete (updateData as any)[key]);

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) throw error;
    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}