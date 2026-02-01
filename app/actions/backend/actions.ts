'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache' // 👈 อย่าลืม import อันนี้

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// ... (ฟังก์ชัน createEmployee ตัวเดิมของคุณ ปล่อยไว้เหมือนเดิม) ...
export async function createEmployee(formData: FormData) {
  const name = formData.get('fullName') as string
  let phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string 
  const brandId = formData.get('brandId') as string

  if (phone && phone.startsWith('0')) {
    phone = '+66' + phone.substring(1)
  }

  const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    phone: phone,
    user_metadata: { full_name: name }
  })

  if (authError) {
    console.error("Create User Error:", authError)
    if (authError.message.includes('already registered') || authError.status === 422) {
        return { success: false, error: 'อีเมลหรือเบอร์โทรนี้มีผู้ใช้งานแล้วในระบบ' }
    }
    if (authError.message.includes('phone')) {
        return { success: false, error: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ระบบต้องการรหัสประเทศ เช่น +66)' }
    }
    return { success: false, error: 'เกิดข้อผิดพลาดในการสร้างบัญชี: ' + authError.message }
  }

  if (user.user) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.user.id,
        brand_id: brandId,
        full_name: name,
        phone: phone,
        email: email,
        role: 'cashier',
        is_active: true
      })

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(user.user.id)
      return { success: false, error: 'บันทึกข้อมูลพนักงานไม่สำเร็จ: ' + profileError.message }
    }
  }

  // ✅ สั่งรีเฟรชหน้าจอเมื่อเพิ่มเสร็จ
  revalidatePath('/dashboard/settings')
  return { success: true }
}

// ---------------------------------------------------------
// ✅ เพิ่มฟังก์ชันลบพนักงาน (ส่วนใหม่)
// ---------------------------------------------------------
export async function deleteEmployee(userId: string) {
  try {
    // ลบ User ออกจาก Auth (ข้อมูลใน Profiles จะหายไปด้วยถ้า Database ตั้ง On Delete Cascade ไว้)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
      console.error("Delete Error:", error)
      return { success: false, error: error.message }
    }

    // สั่ง Refresh หน้าจอ Settings ทันที
    revalidatePath('/dashboard/settings') 
    return { success: true }
  } catch (err) {
    return { success: false, error: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ' }
  }
}