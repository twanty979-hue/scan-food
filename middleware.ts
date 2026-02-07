import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 1️⃣ โซนห้ามเข้า: เฉพาะ Owner เท่านั้น (Path ย่อย)
const OWNER_ONLY_PATHS = [
  '/dashboard/tables',
  '/dashboard/discounts',
  '/dashboard/products',
  '/dashboard/categories',
  '/dashboard/banners',
  '/dashboard/settings',
  '/dashboard/settingss', // เผื่อพิมพ์ผิดใน array เดิม
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

  // ดึง User (User จะถูก Refresh Token อัตโนมัติถ้าจำเป็น)
  const { data: { user } } = await supabase.auth.getUser()

  // -----------------------------------------------------------
  // 🚫 Logic 1: ยังไม่ล็อกอิน -> ดีดไปหน้า Login
  // -----------------------------------------------------------
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // -----------------------------------------------------------
  // ✅ Logic 2: ล็อกอินแล้ว -> เริ่มตรวจบัตรพนักงาน/เจ้าของ
  // -----------------------------------------------------------
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    
    // 1. ดึงข้อมูล Role และ Plan ของร้าน
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
    const currentPath = request.nextUrl.pathname;

    // 🔥🔥 กฎเหล็กใหม่: ห้ามพนักงานเข้าหน้า Dashboard หลัก (หน้าดูยอดขาย) 🔥🔥
    // เช็คว่า path ปัจจุบันคือ '/dashboard' เป๊ะๆ หรือไม่ (Exact Match)
    if (currentPath === '/dashboard' && role !== 'owner') {
       const url = request.nextUrl.clone();
       
       // ถ้าไม่ใช่เจ้าของ ให้เด้งไปหน้าทำงานแทน
       if (isPremiumStore) {
           url.pathname = '/dashboard/pai_order'; // ส่งไปหน้า POS
       } else {
           url.pathname = '/dashboard/profile';   // ส่งไปหน้า Profile
       }
       return NextResponse.redirect(url);
    }

    // 🔒 กฎ 3: โซนห้ามเข้า (OWNER_ONLY_PATHS)
    // เช็คว่า path ปัจจุบันขึ้นต้นด้วย path หวงห้ามหรือไม่
    const isTargetingOwnerPath = OWNER_ONLY_PATHS.some(path => 
      currentPath.startsWith(path)
    );

    if (role !== 'owner' && isTargetingOwnerPath) {
      const url = request.nextUrl.clone()
      // ห้ามดีดกลับไป /dashboard เพราะจะวนลูป ให้ไปหน้า Profile แทน
      url.pathname = '/dashboard/profile' 
      return NextResponse.redirect(url)
    }

    // 🔒 กฎ 4: โซนพนักงานพรีเมียม (PREMIUM_STAFF_PATHS)
    const isTargetingStaffPath = PREMIUM_STAFF_PATHS.some(path => 
      currentPath.startsWith(path)
    );
    
    if (role !== 'owner' && !isPremiumStore && isTargetingStaffPath) {
       const url = request.nextUrl.clone()
       url.pathname = '/dashboard/profile'
       url.searchParams.set('error', 'premium_required')
       return NextResponse.redirect(url);
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}