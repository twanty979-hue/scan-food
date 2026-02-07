//app/auth/callback/page.tsx
'use client';

import { useEffect, useRef, Suspense } from 'react'; // ✅ เพิ่ม Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// 1. ย้าย Logic เดิมทั้งหมดมาไว้ใน Component ย่อย
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const runOnce = useRef(false);

 // ... โค้ดส่วนบนเดิม ...
  useEffect(() => {
    const handleAuthCallback = async () => {
      if (runOnce.current) return;
      runOnce.current = true;

      const code = searchParams.get('code');
      const type = searchParams.get('type'); // ✅ 1. เพิ่มการดึงค่า type
      const next = searchParams.get('next') || '/dashboard/pai_order';

      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (!error) {
            // ✅ 2. เพิ่มเงื่อนไขเช็คว่าถ้าเป็น Recovery ให้ไปหน้า Reset Password
            if (type === 'recovery') {
              router.replace('/auth/reset-password');
              return;
            }
          } else {
            console.warn('Auth Error:', error.message);
            router.replace('/login');
            return;
          }
        } catch (err) {
          console.error('Unexpected error:', err);
          router.replace('/login');
          return;
        }
      }
// ... โค้ดส่วนล่าง (ตรวจ Session/Profile) เดิม ...

      // ตรวจสอบว่ามี Session ไหม
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // เช็คว่ามีร้านหรือยัง
        const { data: profile } = await supabase
          .from('profiles')
          .select('brand_id')
          .eq('id', session.user.id)
          .maybeSingle();
       if (profile?.brand_id) {
          router.replace(next);
        } else {
          router.replace('/setup');
        }
      } else {
        // ถ้าไม่มีอะไรเลย กลับไป Login
        router.replace('/login');
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500">กำลังเข้าสู่ระบบ...</p>
    </div>
  );
}

// 2. Component หลัก (ตัวจริง) มีหน้าที่แค่เอา Suspense มาครอบ
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}