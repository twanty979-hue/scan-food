'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // ฟังก์ชันนี้จะคอยฟังว่า Supabase อ่านค่าจากลิงก์อีเมลเสร็จหรือยัง
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // ถ้ายืนยันสำเร็จ (มี Session แล้ว) -> ส่งไปหน้าตั้งร้าน
        router.replace('/setup');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-bold text-slate-700">กำลังยืนยันตัวตน...</h2>
      <p className="text-slate-500">กรุณารอสักครู่ ระบบกำลังพาคุณไปหน้าตั้งค่าร้าน</p>
    </div>
  );
}