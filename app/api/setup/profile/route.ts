import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const admin = () => createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null
    if (!token) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบใหม่' }, { status: 401 })
    }
    const db = admin()
    const { data: { user }, error: authError } = await db.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' }, { status: 401 })
    }
    const { fullName, phone, avatarUrl } = await request.json()
    const metadata = user.user_metadata || {}
    const resolvedName = String(
      fullName || metadata.full_name || metadata.name || user.email || '',
    ).trim()
    const resolvedAvatar = String(
      avatarUrl || metadata.avatar_url || metadata.picture || '',
    ).trim() || null
    const { error } = await db.from('profiles').upsert({
      id: user.id,
      full_name: resolvedName || null,
      phone: String(phone || '').trim() || null,
      avatar_url: resolvedAvatar,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'บันทึกโปรไฟล์ไม่สำเร็จ' },
      { status: 500 },
    )
  }
}
