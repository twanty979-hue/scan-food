'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ❌ ลบ import { useReceipts } ออกไปครับ เพราะหน้านี้ไม่ต้องใช้

export default function RegisterPage() {
  const router = useRouter();
  
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      setErrorMsg("รหัสผ่านไม่ตรงกันครับ");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          // ยืนยันอีเมลเสร็จให้เด้งไปที่ callback
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        setIsSuccess(true);
      } else {
        router.push('/setup');
      }

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50/50 p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-[2rem] shadow-xl border border-white/50 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl text-green-600 animate-bounce">
             <i className="fa-solid fa-envelope-circle-check"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">กรุณาตรวจสอบอีเมล</h2>
          <p className="text-slate-500 mb-6">
            เราได้ส่งลิงก์ยืนยันไปที่ <b>{form.email}</b><br/>
            กรุณากดลิงก์ในอีเมลเพื่อเปิดใช้งานบัญชี
          </p>
          <Link href="/login" className="block mt-8 text-brand-600 font-bold hover:underline">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50/50 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-[2rem] shadow-xl border border-white/50">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">สร้างบัญชีเจ้าของร้าน</h1>
          <p className="text-slate-500 text-sm">ขั้นตอนที่ 1/2: สร้างรหัสผ่าน</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg flex gap-2 items-center">
            <i className="fa-solid fa-circle-exclamation"></i> {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">อีเมล (ต้องใช้จริง)</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">รหัสผ่าน</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50" placeholder="8+ ตัวอักษร" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ยืนยันรหัสผ่าน</label>
            <input type="password" required value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50" placeholder="พิมพ์อีกครั้ง" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all mt-2 disabled:opacity-70">
            {loading ? 'กำลังส่งข้อมูล...' : 'ถัดไป: ยืนยันอีเมล'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-slate-500">
          มีบัญชีแล้ว? <Link href="/login" className="text-brand-600 font-bold hover:underline">เข้าสู่ระบบ</Link>
        </div>
      </div>
    </div>
  );
}