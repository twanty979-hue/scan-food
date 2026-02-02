'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase'; // ⚠️ เช็ค path ให้ถูกนะครับ

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // ฟังก์ชันนี้จะคอยฟังว่า Supabase อ่านค่าจากลิงก์อีเมลเสร็จหรือยัง
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      if (event === 'SIGNED_IN' && session) {
        // ✅ 1. ล็อกอินสำเร็จแล้ว!
        
        // ✅ 2. เช็คต่อทันทีว่า "มีร้านหรือยัง?"
        const { data: profile } = await supabase
          .from('profiles')
          .select('brand_id')
          .eq('id', session.user.id)
          .single();

        if (profile?.brand_id) {
          // มีร้านแล้ว -> ไป Dashboard
          router.replace('/dashboard');
        } else {
          // ยังไม่มีร้าน -> ไปหน้าตั้งค่าร้าน
          router.replace('/setup');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  //หน้านี้จะโชว์แค่แป๊บเดียว ระหว่างที่ระบบกำลังดีดคนไปหน้าอื่น
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-bold text-slate-700">กำลังยืนยันตัวตน...</h2>
      <p className="text-slate-500">กรุณารอสักครู่ ระบบกำลังพาคุณเข้าสู่ร้านค้า</p>
    </div>
  );
}