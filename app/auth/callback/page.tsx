'use client';

import { useEffect, useRef, Suspense } from 'react'; // ✅ เพิ่ม Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// 1. ย้าย Logic เดิมทั้งหมดมาไว้ใน Component ย่อย
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const runOnce = useRef(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // กันรันซ้ำ
      if (runOnce.current) return;
      runOnce.current = true;

      const code = searchParams.get('code');
      const next = searchParams.get('next') || '/dashboard/pai_order'; // ถ้าไม่มี next ให้ไปหน้าขาย

      if (code) {
        try {
          // แลก Code เป็น Session
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.warn('Auth Error (Code Exchange):', error.message);
            router.replace('/login');
            return;
          }
        } catch (err) {
          console.error('Unexpected error:', err);
          router.replace('/login');
          return;
        }
      }

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