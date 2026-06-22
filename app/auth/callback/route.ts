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
        
        // 🟢 เปลี่ยนจากการใช้ NextResponse.redirect ธรรมดา เป็นพ่น HTML + JS
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>กำลังกลับเข้าสู่แอป...</title>
            </head>
            <body style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; background:#F2FBF4; margin:0;">
              <div style="text-align:center;">
                <div style="width:50px; height:50px; border:4px solid #B7E7C3; border-top-color:#15803D; border-radius:50%; animation:spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <h2 style="color:#15803D; margin:0;">กำลังกลับเข้าสู่แอป SuparPOS...</h2>
                <p style="color:#64748B;">หากแอปไม่เปิดอัตโนมัติ <a href="${deepLink.toString()}" style="color:#2563EB;">คลิกที่นี่</a></p>
              </div>
              <style>@keyframes spin { 100% { transform:rotate(360deg); } }</style>
              <script>
                // บังคับดีดเข้าแอปด้วย JavaScript
                setTimeout(() => {
                  window.location.href = "${deepLink.toString()}";
                }, 500); // หน่วง 0.5 วิให้หน้าเว็บโหลดเสร็จก่อนค่อยดีด
              </script>
            </body>
          </html>
        `;
        
        return new NextResponse(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
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
