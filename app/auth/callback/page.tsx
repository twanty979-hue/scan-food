'use client';
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const runOnce = useRef(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // กันรันซ้ำ 2 รอบ
      if (runOnce.current) return;
      runOnce.current = true;

      const code = searchParams.get('code');
      const next = searchParams.get('next') || '/dashboard/pai_order';

      if (code) {
        try {
          // พยายามแลก Code เป็น Session
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            // ⚠️ ดักจับ Error ตรงนี้! ถ้าเจอปัญหา (เช่น กุญแจหาย, โค้ดเก่า)
            console.warn('Auth Error (Code Exchange):', error.message);
            // ดีดกลับไปหน้า Login ทันที ไม่ต้องโชว์ Error
            router.replace('/login');
            return;
          }
        } catch (err) {
          console.error('Unexpected error:', err);
          router.replace('/login');
          return;
        }
      }

      // ถ้าแลกผ่าน หรือมี Session อยู่แล้ว -> ไปต่อ
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