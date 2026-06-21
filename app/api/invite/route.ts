import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// ⚠️ สำคัญมาก: ตรงนี้ต้องเปลี่ยนมาใช้ SERVICE_ROLE_KEY เพื่อให้มีสิทธิ์เชิญคนอื่นนะครับนาย
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // คีย์แอดมินหลังบ้าน ห้ามหลุดไปหน้าบ้าน
)

export async function POST(request: Request) {
  try {
    const { email, role } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'กรุณากรอกอีเมล' }, { status: 400 })
    }

    // สั่งเชิญผ่าน Supabase (มันจะวิ่งไปสั่ง Resend ส่งเมล HTML ที่เราตั้งไว้ให้เองโดยอัตโนมัติ)
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { role: role || 'staff' } // แนบ metadata ไปด้วยได้
    })

    if (error) throw error

    return NextResponse.json({ message: 'ส่งคำเชิญสำเร็จแล้ว!', data }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}