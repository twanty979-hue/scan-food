'use server'

import { createClient } from '@supabase/supabase-js'
import { sendProfilePush } from '@/lib/pushNotifications'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const roleLabel = (role: string) => {
  if (role === 'cashier') return 'แคชเชียร์'
  if (role === 'chef') return 'ครัว'
  return 'พนักงาน'
}

export async function inviteEmployee(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const myBrandId = formData.get('brandId') as string
    const role = formData.get('role') as string 

    if (!email || !myBrandId || !role) {
      throw new Error('กรุณากรอกข้อมูลและเลือกตำแหน่งให้ครบถ้วน')
    }

    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    if (authError) throw authError

    const targetAuthUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (!targetAuthUser) {
      throw new Error('ไม่พบอีเมลนี้ในระบบสมาชิกร้านค้า กรุณาให้พนักงานสมัครเข้าแอพก่อนครับ')
    }

    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('brand_id, invited_brand_id, is_joined')
      .eq('id', targetAuthUser.id)
      .maybeSingle()

    if (userProfile && userProfile.brand_id === myBrandId) {
      throw new Error('ผู้ใช้นี้เป็นพนักงานในร้านของคุณอยู่แล้วครับ')
    }

    if (userProfile && userProfile.invited_brand_id === myBrandId && userProfile.is_joined === false) {
      throw new Error('คุณได้ส่งคำเชิญให้พนักงานคนนี้ไปแล้ว อยู่ระหว่างรอการตอบรับครับ')
    }

    // 🟢 แก้จุดนี้: หยอดแค่ ID ร้านค้าที่เชิญไว้ในฟิลด์พัก ห้ามเปลี่ยนฟิลด์ role ของเขาเด็ดขาด!
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        invited_brand_id: myBrandId,
        is_joined: false
        // ❌ เอา role: role ออกจากตรงนี้ เพื่อไม่ให้สิทธิ์ปัจจุบันของเขาพังครับนาย
      })
      .eq('id', targetAuthUser.id)

    if (updateError) throw updateError

    // 📜 ฝากตำแหน่ง (role) ไว้ใน Log ประวัติคำเชิญแทน
    const { error: logError } = await supabaseAdmin
      .from('invitation_logs')
      .insert({
        employee_id: targetAuthUser.id,
        from_brand_id: myBrandId,
        status: 'pending',
        role: role // 👈 ปลอดภัยที่สุด เก็บไว้ตรงนี้เพื่อรอใช้ตอนเขากดยอมรับ
      })

    if (logError) throw logError

    const { data: invitedBrand } = await supabaseAdmin
      .from('brands')
      .select('name')
      .eq('id', myBrandId)
      .maybeSingle()

    await sendProfilePush({
      profileIds: [targetAuthUser.id],
      title: 'คุณได้รับคำเชิญเข้าร่วมร้าน',
      message: `${invitedBrand?.name || 'ร้านค้า'} เชิญคุณเข้าร่วมในตำแหน่ง ${roleLabel(role)}`,
      type: 'STAFF_INVITATION',
      data: {
        brandId: myBrandId,
        role,
        path: '/dashboard/profile',
      },
    })

    return { success: true, message: 'ส่งคำเชิญสำเร็จแล้ว พนักงานจะไม่หลุดจากระบบเดิมจนกว่าจะกดยอมรับครับ!' }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
// 🟢 เพิ่มฟังก์ชันนี้เข้าไปที่ท้ายไฟล์ app/actions/backend/actions.ts ครับนาย
export async function searchEmployeeByEmail(email: string) {
  try {
    if (!email) return { success: false, message: 'กรุณากรอกอีเมล' };

    // 1. วิ่งไปค้นหาจากรายชื่อระบบ Auth ของ Supabase (อีเมลจริง)
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // เทียบอีเมลจริงแบบไม่สนตัวพิมพ์เล็กพิมพ์ใหญ่
    const targetUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!targetUser) {
      return { success: false, message: 'ไม่พบอีเมลนี้ในระบบสมาชิกร้านค้า กรุณาให้พนักงานสมัครเข้าแอพก่อนครับ' };
    }

    // 2. ดึงชื่อจริงและเบอร์โทรจากตาราง profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, phone')
      .eq('id', targetUser.id)
      .maybeSingle();

    return {
      success: true,
      profile: {
        id: targetUser.id,
        full_name: profile?.full_name || 'พนักงานใหม่ (ยังไม่ได้ตั้งชื่อ)',
        phone: profile?.phone || '-',
        email: targetUser.email
      }
    };
  } catch (error: any) {
    return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการค้นหา' };
  }
}

// 🟢 1. ฟังก์ชันกดยอมรับคำเชิญ (Accept Invite) - แปะท้ายไฟล์ actions.ts
export async function acceptInvitation(employeeId: string, invitedBrandId: string, targetRole: string) {
  try {
    // ดึงโปรไฟล์ปัจจุบันมาดูก่อนเพื่อความปลอดภัย
    const { data: currentProfile } = await supabaseAdmin
      .from('profiles')
      .select('brand_id, own_brand_id, full_name')
      .eq('id', employeeId)
      .single()

    // ลอจิกออโต้แบคอัพ: ถ้า own_brand_id ยังว่างอยู่ ให้ก๊อปปี้ brand_id เดิมไปเก็บไว้
    let backupBrandId = currentProfile?.own_brand_id;
    if (!backupBrandId && currentProfile?.brand_id) {
      backupBrandId = currentProfile.brand_id;
    }

    // ⚡️ ทำการอัปเดตสลับร้านทันที
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        brand_id: invitedBrandId,       // เปลี่ยนแบรนด์หลักเป็นร้านใหม่ที่ไปทำงาน
        own_brand_id: backupBrandId,     // ล็อกแบรนด์ตัวเองไว้ในช่องสำรอง
        invited_brand_id: null,          // เคลียร์ช่องเชิญออก
        role: targetRole,                // เปลี่ยนบทบาทตามที่ร้านใหม่กำหนด
        is_joined: true                  // ยืนยันการเข้าร่วมสำเร็จ
      })
      .eq('id', employeeId)

    if (updateError) throw updateError

    // 📜 อัปเดตตาราง Log บันทึกประวัติ
    await supabaseAdmin
      .from('invitation_logs')
      .update({ status: 'accepted', updated_at: new Date() })
      .eq('employee_id', employeeId)
      .eq('from_brand_id', invitedBrandId)
      .eq('status', 'pending')

    const { data: owners } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('brand_id', invitedBrandId)
      .eq('role', 'owner')

    await sendProfilePush({
      profileIds: (owners || []).map(owner => owner.id),
      title: 'พนักงานตอบรับคำเชิญแล้ว',
      message: `${currentProfile?.full_name || 'พนักงาน'} ยอมรับคำเชิญเข้าร่วมร้านแล้ว`,
      type: 'STAFF_INVITATION_ACCEPTED',
      data: {
        employeeId,
        brandId: invitedBrandId,
        path: '/dashboard/settingss',
      },
    })

    return { success: true, message: 'เข้าร่วมร้านค้าสำเร็จแล้ว เริ่มงานได้เลยครับนาย!' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function rejectInvitation(employeeId: string, invitedBrandId: string) {
  try {
    const { data: employeeProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', employeeId)
      .maybeSingle()

    // 1. เคลียร์ฟิลด์เชิญในตารางสิทธิ์หลักทิ้งทันที (ไม่เปลี่ยนแบรนด์เดิมที่เขาทำงานอยู่)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        invited_brand_id: null,
        is_joined: false
      })
      .eq('id', employeeId)

    if (updateError) throw updateError

    // 2. อัปเดตสถานะในตารางประวัติคำเชิญแถวเดิมให้เป็นปฏิเสธ (rejected)
    const { error: logError } = await supabaseAdmin
      .from('invitation_logs')
      .update({ 
        status: 'rejected', 
        updated_at: new Date().toISOString() 
      })
      .eq('employee_id', employeeId)
      .eq('from_brand_id', invitedBrandId)
      .eq('status', 'pending') // ล็อกเป้าเฉพาะแถวที่กำลังรออยู่

    if (logError) throw logError

    const { data: owners } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('brand_id', invitedBrandId)
      .eq('role', 'owner')

    await sendProfilePush({
      profileIds: (owners || []).map(owner => owner.id),
      title: 'พนักงานปฏิเสธคำเชิญ',
      message: `${employeeProfile?.full_name || 'พนักงาน'} ปฏิเสธคำเชิญเข้าร่วมร้าน`,
      type: 'STAFF_INVITATION_REJECTED',
      data: {
        employeeId,
        brandId: invitedBrandId,
        path: '/dashboard/settingss',
      },
    })

    return { success: true, message: 'ปฏิเสธคำเชิญเรียบร้อยแล้ว' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
// 🟢 เพิ่มฟังก์ชันลบพนักงาน/ยกเลิกคำเชิญนี้ไว้ที่ท้ายไฟล์ app/actions/backend/actions.ts ครับนาย
export async function deleteEmployee(employeeId: string) {
  try {
    if (!employeeId) {
      throw new Error('ไม่พบรหัสพนักงานที่ต้องการดำเนินการ');
    }

    // 1. เคลียร์สังกัดในตาราง profiles (ปลดบล็อกให้เขากลับไปอยู่ร้านตัวเอง หรือพร้อมโดนเชิญใหม่)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        brand_id: null, // ถ้าเป็นพนักงานปัจจุบัน ก็เคลียร์ออก
        invited_brand_id: null, // ถ้าเป็นสถานะรอเชิญ (Pending) ก็ล้างทิ้งตัวนี้
        is_joined: false,
        role: 'staff' // รีเซ็ตตำแหน่งกลับเป็นพนักงานทั่วไป
      })
      .eq('id', employeeId);

    if (profileError) throw profileError;

    // 2. ปรับสถานะคำเชิญล่าสุดในตาราง Log ให้กลายเป็นยกเลิก (cancelled) เพื่อเก็บประวัติ
    const { error: logError } = await supabaseAdmin
      .from('invitation_logs')
      .update({ 
        status: 'cancelled', 
        updated_at: new Date().toISOString() 
      })
      .eq('employee_id', employeeId)
      .eq('status', 'pending'); // เจาะจงเปลี่ยนเฉพาะอันที่ยังค้างพิจารณาอยู่

    if (logError) throw logError;

    return { success: true, message: 'ดำเนินการลบหรือยกเลิกคำเชิญเรียบร้อยแล้วครับนาย!' };

  } catch (error: any) {
    return { success: false, error: error.message || 'เกิดข้อผิดพลาดหลังบ้าน' };
  }
}
