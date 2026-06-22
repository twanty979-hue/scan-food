// app/auth/callback/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createHmac } from 'node:crypto'

function recoveryTicket(userId: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('Missing recovery signing secret')
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    purpose: 'password_recovery',
    exp: Math.floor(Date.now() / 1000) + 10 * 60,
  })).toString('base64url')
  const signature = createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // ✅ รับค่า type มาด้วย
  const source = searchParams.get('source')
  
  // ถ้ามีค่า next ส่งมาให้ใช้ท่านั้น ถ้าไม่มีให้ไป /dashboard/pai_order
  const next = searchParams.get('next') ?? '/dashboard/pai_order'

  if (code) {
    const cookieStore = await cookies() // ใน Next.js รุ่นใหม่ต้อง await

    // สร้าง Supabase Client สำหรับฝั่ง Server
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    // แลก Code เป็น Session (ขั้นตอนนี้สำคัญมาก มันจะฝัง Cookie ลง Browser ให้เอง)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (source === 'app') {
        const deepLink = new URL('com.suparpos.app://login-callback')
        if (type === 'recovery') {
          if (!data.user) return NextResponse.redirect(`${origin}/login`)
          deepLink.searchParams.set('type', 'recovery')
          deepLink.searchParams.set('ticket', recoveryTicket(data.user.id))
        } else {
          deepLink.searchParams.set('type', 'verified')
        }
        return NextResponse.redirect(deepLink.toString())
      }
      // ✅ ถ้าเป็นเคส Recovery (ลืมรหัสผ่าน) ให้บังคับไปหน้า reset-password
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }

      // ถ้า Login ปกติ ให้ไปหน้าปลายทางที่ตั้งไว้
      return NextResponse.redirect(`${origin}${next}`)
    } else {
        console.error('Exchange Error:', error.message)
    }
  }

  // ถ้ามี Error หรือไม่มี Code ให้ดีดกลับไปหน้า Login
  return NextResponse.redirect(`${origin}/login`)
}
