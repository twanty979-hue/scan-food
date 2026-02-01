import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 1️⃣ โซนห้ามเข้า: เฉพาะ Owner เท่านั้น
const OWNER_ONLY_PATHS = [
  '/dashboard/tables',
  '/dashboard/discounts',
  '/dashboard/products',
  '/dashboard/categories',
  '/dashboard/banners',
  '/dashboard/settings',
  '/dashboard/settingss',
];

// 2️⃣ โซนพนักงานพรีเมียม: เข้าได้เฉพาะร้าน Pro/Ultimate
const PREMIUM_STAFF_PATHS = [
  '/dashboard/orders',    
  '/dashboard/pai_order', 
  '/dashboard/receipts',  
];

export async function middleware(request: NextRequest) {
  // สร้าง response เริ่มต้น
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // ✅ แก้ไข: Loop set cookies ทีเดียว เพื่อไม่ให้ response ถูกทับ
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // ⚠️ สำคัญ: ห้ามใช้ getSession() ใน Middleware เพราะมันไม่ปลอดภัย
  // getUser() จะช่วย Refresh Token ให้ถ้ามันหมดอายุ
  const { data: { user } } = await supabase.auth.getUser()

  // -----------------------------------------------------------
  // 👇 Logic เดิมของคุณ (Security Gate)
  // -----------------------------------------------------------

  // 🚫 ยังไม่ล็อกอิน -> ไป Login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // ✅ ล็อกอินแล้ว -> เริ่มตรวจบัตร
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    
    // ดึงข้อมูล Profile และ Plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, brand_id, brands(plan)') 
      .eq('id', user.id)
      .single();

    const role = profile?.role;
    
    let brandPlan = 'free';
    const brandsData = (profile as any)?.brands;

    if (Array.isArray(brandsData)) {
        if (brandsData.length > 0) brandPlan = brandsData[0].plan; 
    } else if (brandsData && typeof brandsData === 'object') {
        brandPlan = brandsData.plan;    
    }

    const isPremiumStore = ['pro', 'ultimate'].includes(brandPlan);

    // 🔒 กฎ 1: Owner Only
    const isTargetingOwnerPath = OWNER_ONLY_PATHS.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );
    if (role !== 'owner' && isTargetingOwnerPath) {
      // ให้ redirect กลับไปหน้าแรกของ Dashboard แทน
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // 🔒 กฎ 2: Premium Staff Only
    const isTargetingStaffPath = PREMIUM_STAFF_PATHS.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );
    
    if (role !== 'owner' && !isPremiumStore && isTargetingStaffPath) {
       const url = request.nextUrl.clone()
       url.pathname = '/dashboard/profile'
       url.searchParams.set('error', 'premium_required')
       return NextResponse.redirect(url);
    }
  }

  // ส่ง response ที่มี Cookies ใหม่กลับไป
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}