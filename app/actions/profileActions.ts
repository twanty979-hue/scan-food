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
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

// --- Actions ---

export async function getProfileDataAction() {
  const supabase = await getSupabase();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 🟢 แก้ไขจุดนี้: ทำการดึงโปรไฟล์ พ่วงข้อมูลชื่อร้านปัจจุบัน (current_brand) และชื่อร้านดั้งเดิมตัวเอง (own_brand) มาด้วยครับนาย
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        invitation_logs(role, created_at, status)
      `)
      .eq('id', user.id)
      .single();

    if (error) throw error;

    const pendingLog = Array.isArray(profile?.invitation_logs)
      ? profile.invitation_logs.find((log: any) => log.status === 'pending')
      : null;

    // แกะอ็อบเจ็กต์แยกแยะชื่อร้านค้าให้คลีนส่งต่อง่ายๆ
    const brandIds = [...new Set([profile.brand_id, profile.own_brand_id].filter(Boolean))];
    const { data: relatedBrands } = brandIds.length > 0
      ? await supabase.from('brands').select('id, name').in('id', brandIds)
      : { data: [] as { id: string; name: string }[] };
    const brandNameById = new Map((relatedBrands || []).map(brand => [brand.id, brand.name]));
    const currentBrandName = profile.brand_id ? brandNameById.get(profile.brand_id) : null;
    const ownBrandName = profile.own_brand_id ? brandNameById.get(profile.own_brand_id) : null;

    const enrichedProfile = {
      ...profile,
      current_brand_name: currentBrandName || 'ร้านค้าเครือข่าย',
      own_brand_name: ownBrandName || 'ร้านค้าส่วนตัวของคุณ', // 💎 ส่งชื่อร้านดั้งเดิมออกไป
      invited_brand_name: 'ร้านค้าที่ไม่ระบุชื่อ',
      invited_role: pendingLog?.role || profile.role,
      invited_at: pendingLog?.created_at || profile.created_at
    };

    // คิวรีแยกดึงชื่อร้านค้าที่เชิญมา (ถ้ามี) แบบแยกชิ้นเพื่อลด Error เหมือนเดิม
    if (profile.invited_brand_id) {
       const { data: brandData } = await supabase
         .from('brands')
         .select('name')
         .eq('id', profile.invited_brand_id)
         .maybeSingle();
         
       if (brandData) enrichedProfile.invited_brand_name = brandData.name;
    }

    return { 
        success: true, 
        user: { id: user.id, email: user.email },
        profile: enrichedProfile
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

export async function leaveStoreAction() {
  const supabase = await getSupabase();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. ดึงข้อมูลโปรไฟล์เดิมเพื่อเอา own_brand_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('own_brand_id')
      .eq('id', user.id)
      .single();

    if (!profile?.own_brand_id) throw new Error("ไม่พบข้อมูลร้านค้าส่วนตัวของคุณ");

    // 2. อัปเดตสลับกลับไปร้านตัวเอง
    const { error } = await supabase
      .from('profiles')
      .update({
        brand_id: profile.own_brand_id, // สลับกลับร้านเดิม
        role: 'owner',                  // กลับไปเป็นเจ้าของร้านตัวเอง
        is_joined: false                // ยกเลิกสถานะการเข้าร่วม
      })
      .eq('id', user.id);

    if (error) throw error;
    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
