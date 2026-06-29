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
  
  // ✅ ดักจับทั้งแบบ code (Google/Email Login) และแบบ token_hash (กู้รหัสผ่าน)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const source = searchParams.get('source')
  
  const next = searchParams.get('next') ?? '/dashboard/pai_order'

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
        remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }) },
      },
    }
  )

  let sessionData = null;
  let sessionError = null;

  // 1️⃣ ถ้าส่ง token_hash มา (มาจากการกู้รหัสผ่าน)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })
    sessionData = data;
    sessionError = error;
  } 
  // 2️⃣ ถ้าส่ง code มา (มาจาก Login ปกติ หรือ Google)
  else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    sessionData = data;
    sessionError = error;
  } 
  // 3️⃣ ถ้าไม่มีอะไรส่งมาเลย (โดนเตะออก)
  else {
    return NextResponse.redirect(`${origin}/login?error=missing_parameters`)
  }

  // ถ้าแลก Token ไม่ผ่าน
  if (sessionError) {
    console.error('Auth Error:', sessionError.message)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(sessionError.message)}`)
  }

  // 🟢 ถ้าเข้าเงื่อนไขนี้ แสดงว่าล็อกอิน/กู้รหัสสำเร็จ 100%
  if (source === 'app' && sessionData?.user) {
    const deepLink = new URL('/mobile/auth/callback', origin)
    
    if (type === 'recovery') {
      deepLink.searchParams.set('type', 'recovery')
      deepLink.searchParams.set('ticket', recoveryTicket(sessionData.user.id))
    } else {
      deepLink.searchParams.set('type', 'verified')
    }
    
    // พ่น HTML บังคับดีดเข้าแอป
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
            setTimeout(() => {
              window.location.href = "${deepLink.toString()}";
            }, 500);
          </script>
        </body>
      </html>
    `;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  // สำหรับกรณีใช้งานผ่านเว็บ
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/reset-password`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
