import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json()
    if (!refreshToken || typeof refreshToken !== 'string') {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 })
    }
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
    if (error || !data.session) {
      return NextResponse.json({ error: error?.message || 'Session expired' }, { status: 401 })
    }
    return NextResponse.json({ success: true, session: data.session })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
