import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendProfilePush } from '@/lib/pushNotifications'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

async function authenticatedUser(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return null
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data: { user } } = await client.auth.getUser()
  return user
}

const unauthorized = () => NextResponse.json({ success: false, error: 'กรุณาเข้าสู่ระบบใหม่' }, { status: 401 })

export async function GET(request: NextRequest) {
  const user = await authenticatedUser(request)
  if (!user) return unauthorized()
  const db = admin()
  const { data: profile, error } = await db.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (error || !profile) return NextResponse.json({ success: false, error: error?.message || 'ไม่พบโปรไฟล์' }, { status: 404 })

  const brandIds = [profile.brand_id, profile.own_brand_id, profile.invited_brand_id].filter(Boolean)
  const { data: brands } = brandIds.length
    ? await db.from('brands').select('id,name,logo_url').in('id', brandIds)
    : { data: [] as { id: string; name: string; logo_url?: string }[] }
  const brandMap = new Map((brands || []).map(brand => [brand.id, brand]))
  const { data: invitation } = profile.invited_brand_id
    ? await db.from('invitation_logs').select('role,created_at').eq('employee_id', user.id).eq('from_brand_id', profile.invited_brand_id).eq('status', 'pending').order('created_at', { ascending: false }).limit(1).maybeSingle()
    : { data: null }

  return NextResponse.json({
    success: true,
    profile: {
      ...profile,
      email: user.email,
      current_brand: brandMap.get(profile.brand_id) || null,
      own_brand: brandMap.get(profile.own_brand_id) || null,
      invited_brand: brandMap.get(profile.invited_brand_id) || null,
      invited_role: invitation?.role || 'staff',
      invited_at: invitation?.created_at || null,
    },
  })
}

export async function PATCH(request: NextRequest) {
  const user = await authenticatedUser(request)
  if (!user) return unauthorized()
  const body = await request.json().catch(() => ({}))
  const db = admin()
  const { data: profile, error: profileError } = await db.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (profileError || !profile) return NextResponse.json({ success: false, error: profileError?.message || 'ไม่พบโปรไฟล์' }, { status: 404 })

  if (!body.action || body.action === 'update') {
    const update = {
      full_name: String(body.full_name || '').trim() || null,
      phone: String(body.phone || '').trim() || null,
      avatar_url: body.avatar_url ? String(body.avatar_url) : null,
    }
    const { error } = await db.from('profiles').update(update).eq('id', user.id)
    return error
      ? NextResponse.json({ success: false, error: error.message }, { status: 400 })
      : NextResponse.json({ success: true, profile: { ...profile, ...update } })
  }

  if (body.action === 'accept_invitation') {
    const invitedBrandId = profile.invited_brand_id
    if (!invitedBrandId) return NextResponse.json({ success: false, error: 'ไม่พบคำเชิญที่รอตอบรับ' }, { status: 400 })
    const { data: invitation } = await db.from('invitation_logs').select('role').eq('employee_id', user.id).eq('from_brand_id', invitedBrandId).eq('status', 'pending').order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (!invitation) return NextResponse.json({ success: false, error: 'คำเชิญนี้หมดอายุหรือถูกยกเลิกแล้ว' }, { status: 400 })
    const ownBrandId = profile.own_brand_id || profile.brand_id
    const { error } = await db.from('profiles').update({ brand_id: invitedBrandId, own_brand_id: ownBrandId, invited_brand_id: null, role: invitation.role || 'staff', is_joined: true }).eq('id', user.id)
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    await db.from('invitation_logs').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('employee_id', user.id).eq('from_brand_id', invitedBrandId).eq('status', 'pending')
    const { data: owners } = await db.from('profiles').select('id').eq('brand_id', invitedBrandId).eq('role', 'owner')
    await sendProfilePush({ profileIds: (owners || []).map(item => item.id), title: 'พนักงานตอบรับคำเชิญแล้ว', message: `${profile.full_name || 'พนักงาน'} เข้าร่วมร้านแล้ว`, type: 'STAFF_INVITATION_ACCEPTED', data: { employeeId: user.id, brandId: invitedBrandId, path: '/dashboard/settingss' } })
    return NextResponse.json({ success: true, brandId: invitedBrandId, requiresRelogin: true })
  }

  if (body.action === 'reject_invitation') {
    const invitedBrandId = profile.invited_brand_id
    if (!invitedBrandId) return NextResponse.json({ success: false, error: 'ไม่พบคำเชิญที่รอตอบรับ' }, { status: 400 })
    await db.from('profiles').update({ invited_brand_id: null, is_joined: false }).eq('id', user.id)
    await db.from('invitation_logs').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('employee_id', user.id).eq('from_brand_id', invitedBrandId).eq('status', 'pending')
    const { data: owners } = await db.from('profiles').select('id').eq('brand_id', invitedBrandId).eq('role', 'owner')
    await sendProfilePush({ profileIds: (owners || []).map(item => item.id), title: 'พนักงานปฏิเสธคำเชิญ', message: `${profile.full_name || 'พนักงาน'} ปฏิเสธคำเชิญเข้าร่วมร้าน`, type: 'STAFF_INVITATION_REJECTED', data: { employeeId: user.id, brandId: invitedBrandId, path: '/dashboard/settingss' } })
    return NextResponse.json({ success: true })
  }

  if (body.action === 'leave_store') {
    if (!profile.own_brand_id || profile.brand_id === profile.own_brand_id) return NextResponse.json({ success: false, error: 'บัญชีนี้ไม่ได้เข้าร่วมร้านอื่น' }, { status: 400 })
    const { error } = await db.from('profiles').update({ brand_id: profile.own_brand_id, own_brand_id: null, invited_brand_id: null, role: 'owner', is_joined: false }).eq('id', user.id)
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    return NextResponse.json({ success: true, brandId: profile.own_brand_id, requiresRelogin: true })
  }

  return NextResponse.json({ success: false, error: 'คำสั่งไม่ถูกต้อง' }, { status: 400 })
}
