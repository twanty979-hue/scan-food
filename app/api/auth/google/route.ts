import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const client = () => createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

const admin = () => createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()
    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Google ID token is required' }, { status: 400 })
    }
    const { data, error } = await client().auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    })
    if (error || !data.session) {
      return NextResponse.json({ error: error?.message || 'Google sign-in failed' }, { status: 401 })
    }
    const user = data.user
    const metadata = user.user_metadata || {}
    const fullName = String(metadata.full_name || metadata.name || '').trim() || null
    const avatarUrl = String(metadata.avatar_url || metadata.picture || '').trim() || null
    const db = admin()
    const { data: existing, error: profileReadError } = await db
      .from('profiles')
      .select('id,full_name,avatar_url')
      .eq('id', user.id)
      .maybeSingle()
    if (profileReadError) {
      return NextResponse.json({ error: profileReadError.message }, { status: 500 })
    }
    if (!existing) {
      const { error: insertError } = await db.from('profiles').insert({
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    } else {
      const missingGoogleData = {
        ...(!existing.full_name && fullName ? { full_name: fullName } : {}),
        ...(!existing.avatar_url && avatarUrl ? { avatar_url: avatarUrl } : {}),
      }
      if (Object.keys(missingGoogleData).length) {
        await db.from('profiles').update({
          ...missingGoogleData,
          updated_at: new Date().toISOString(),
        }).eq('id', user.id)
      }
    }
    return NextResponse.json({ success: true, session: data.session })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
