import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendProfilePush } from '@/lib/pushNotifications'

const admin = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })

async function ownerContext(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return null
  const auth = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { global: { headers: { Authorization: authorization } }, auth: { autoRefreshToken: false, persistSession: false } })
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return null
  const db = admin()
  const { data: profile } = await db.from('profiles').select('id,brand_id,role').eq('id', user.id).maybeSingle()
  if (!profile?.brand_id || profile.role !== 'owner') return null
  return { user, profile, db }
}

const denied = () => NextResponse.json({ success: false, error: 'เฉพาะเจ้าของร้านเท่านั้น' }, { status: 403 })

export async function GET(request: NextRequest) {
  const context = await ownerContext(request)
  if (!context) return denied()
  const { db, profile } = context
  const { data: members, error } = await db.from('profiles').select('id,full_name,phone,avatar_url,role,brand_id,invited_brand_id,is_joined').or(`brand_id.eq.${profile.brand_id},invited_brand_id.eq.${profile.brand_id}`).neq('id', profile.id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  const ids = (members || []).map(item => item.id)
  const { data: logs } = ids.length ? await db.from('invitation_logs').select('employee_id,role,status,created_at,updated_at').eq('from_brand_id', profile.brand_id).in('employee_id', ids).order('created_at', { ascending: false }) : { data: [] }
  const latest = new Map<string, any>()
  for (const log of logs || []) if (!latest.has(log.employee_id)) latest.set(log.employee_id, log)
  const { data: users } = await db.auth.admin.listUsers()
  const emails = new Map((users?.users || []).map(user => [user.id, user.email]))
  const data = (members || []).map(member => ({ ...member, name: member.full_name, email: emails.get(member.id) || '', invitation: latest.get(member.id) || null, status: member.brand_id === profile.brand_id && member.is_joined ? 'active' : latest.get(member.id)?.status || 'pending' }))
  return NextResponse.json({ success: true, data, history: logs || [] })
}

export async function POST(request: NextRequest) {
  const context = await ownerContext(request)
  if (!context) return denied()
  const { db, profile } = context
  const body = await request.json().catch(() => ({}))
  const email = String(body.email || '').trim().toLowerCase()
  if (!email) return NextResponse.json({ success: false, error: 'กรุณากรอกอีเมล' }, { status: 400 })
  const { data: users, error: authError } = await db.auth.admin.listUsers()
  if (authError) return NextResponse.json({ success: false, error: authError.message }, { status: 400 })
  const target = users.users.find(user => user.email?.toLowerCase() === email)
  if (!target) return NextResponse.json({ success: false, error: 'ไม่พบอีเมลนี้ในระบบ กรุณาให้พนักงานสมัครสมาชิกก่อน' }, { status: 404 })
  const { data: targetProfile } = await db.from('profiles').select('id,full_name,phone,avatar_url,brand_id,invited_brand_id,is_joined').eq('id', target.id).maybeSingle()
  if (!targetProfile) return NextResponse.json({ success: false, error: 'ผู้ใช้นี้ยังไม่มีโปรไฟล์' }, { status: 404 })
  if (body.action === 'search') return NextResponse.json({ success: true, profile: { ...targetProfile, email: target.email } })
  if (target.id === profile.id) return NextResponse.json({ success: false, error: 'ไม่สามารถเชิญบัญชีของตัวเองได้' }, { status: 400 })
  if (targetProfile.brand_id === profile.brand_id && targetProfile.is_joined) return NextResponse.json({ success: false, error: 'ผู้ใช้นี้อยู่ในร้านแล้ว' }, { status: 400 })
  if (targetProfile.invited_brand_id === profile.brand_id) return NextResponse.json({ success: false, error: 'ส่งคำเชิญให้ผู้ใช้นี้แล้ว' }, { status: 400 })
  const role = ['cashier', 'chef', 'staff'].includes(body.role) ? body.role : 'staff'
  const { error } = await db.from('profiles').update({ invited_brand_id: profile.brand_id, is_joined: false }).eq('id', target.id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  await db.from('invitation_logs').insert({ employee_id: target.id, from_brand_id: profile.brand_id, status: 'pending', role })
  const { data: brand } = await db.from('brands').select('name').eq('id', profile.brand_id).maybeSingle()
  await sendProfilePush({ profileIds: [target.id], title: 'คุณได้รับคำเชิญเข้าร่วมร้าน', message: `${brand?.name || 'ร้านค้า'} เชิญคุณเข้าร่วมทีม`, type: 'STAFF_INVITATION', data: { brandId: profile.brand_id, role, path: '/dashboard/profile' } })
  return NextResponse.json({ success: true, message: 'ส่งคำเชิญเรียบร้อยแล้ว' })
}

export async function DELETE(request: NextRequest) {
  const context = await ownerContext(request)
  if (!context) return denied()
  const { db, profile } = context
  const body = await request.json().catch(() => ({}))
  const employeeId = String(body.employeeId || '')
  const { data: target } = await db.from('profiles').select('brand_id,own_brand_id,invited_brand_id').eq('id', employeeId).maybeSingle()
  if (!target || (target.brand_id !== profile.brand_id && target.invited_brand_id !== profile.brand_id)) return NextResponse.json({ success: false, error: 'ไม่พบพนักงานในร้านนี้' }, { status: 404 })
  const update = target.brand_id === profile.brand_id
    ? { brand_id: target.own_brand_id, own_brand_id: null, invited_brand_id: null, role: target.own_brand_id ? 'owner' : 'staff', is_joined: false }
    : { invited_brand_id: null, is_joined: false }
  const { error } = await db.from('profiles').update(update).eq('id', employeeId)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  await db.from('invitation_logs').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('employee_id', employeeId).eq('from_brand_id', profile.brand_id).eq('status', 'pending')
  return NextResponse.json({ success: true })
}
