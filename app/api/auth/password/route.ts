import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'node:crypto'

function ticketUserId(ticket: unknown) {
  if (typeof ticket !== 'string') return null
  const [payload, signature] = ticket.split('.')
  if (!payload || !signature) return null
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) return null
  const expected = createHmac('sha256', secret).update(payload).digest('base64url')
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (decoded.purpose !== 'password_recovery' || decoded.exp < Math.floor(Date.now() / 1000)) return null
    return typeof decoded.sub === 'string' ? decoded.sub : null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const { password, ticket } = await request.json()
    const recoveryUserId = ticketUserId(ticket)
    if (!authorization?.startsWith('Bearer ') && !recoveryUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must contain at least 6 characters' }, { status: 400 })
    }
    if (recoveryUserId) {
      const admin = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
      )
      const { error } = await admin.auth.admin.updateUserById(recoveryUserId, { password })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ success: true })
    }
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authorization! } },
        auth: { autoRefreshToken: false, persistSession: false },
      },
    )
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
