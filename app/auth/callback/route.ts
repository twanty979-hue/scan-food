// app/auth/callback/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // ✅ รับค่า type มาด้วย
  
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
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
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