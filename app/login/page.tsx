'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // ✅ 1. import Image เข้ามา

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // เช็ค Session (โค้ดเดิม)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('brand_id')
          .eq('id', session.user.id)
          .single();

        if (profile?.brand_id) {
          router.replace('/dashboard');
        } else {
          router.replace('/setup');
        }
      }
    };

    checkSession();
  }, [router]);

  // ✅ ฟังก์ชันเติม @gmail.com
  const addGmailSuffix = () => {
    if (!email.includes('@')) {
      setEmail((prev) => prev + '@gmail.com');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;
      if (!authData.user) throw new Error("ไม่พบข้อมูลผู้ใช้");

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('brand_id')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile || !profile.brand_id) {
        router.push('/setup'); 
      } else {
        router.push('/dashboard');
      }

    } catch (error: any) {
      setErrorMsg(error.message);
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50/50 relative overflow-hidden p-4">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-200 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>

      <div className="bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl shadow-brand-500/10 border border-white/50 backdrop-blur-sm relative z-10">
        
        {/* Header with Shop Logo */}
        <div className="text-center mb-8">
          {/* ✅ ส่วนแสดง Logo ร้าน */}
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 mx-auto mb-4 p-2 border border-slate-100 relative overflow-hidden">
             {/* ⚠️ เปลี่ยน src="/logo.png" เป็น path รูปของคุณ */}
             {/* ถ้ายังไม่มีรูป ให้ใช้ Placeholder นี้ไปก่อนได้ครับ */}
             <Image 
               src="/logo.png" 
               alt="Shop Logo" 
               fill 
               className="object-contain p-2"
               onError={(e) => {
                 // Fallback ถ้าหารูปไม่เจอ ให้ซ่อนแล้วโชว์ไอคอนแทน (เทคนิคเสริม)
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.parentElement?.classList.add('fallback-icon');
               }}
             />
             {/* Fallback Icon (เผื่อรูปเสียหรือไม่ใส่รูป) */}
             <i className="fa-solid fa-store text-4xl text-brand-500 hidden fallback-icon:block absolute"></i>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800">ยินดีต้อนรับกลับ!</h1>
          <p className="text-slate-500 mt-2">FoodScan Management System</p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl flex items-center gap-3 animate-pulse">
            <i className="fa-solid fa-circle-exclamation"></i>
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">อีเมล</label>
            <div className="relative group">
              <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors"></i>
              
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-medium text-slate-700"
                placeholder="ชื่อบัญชีของคุณ"
              />

              {/* ✅ ปุ่มทางลัด + @gmail.com */}
              {/* จะแสดงเมื่อมีข้อความ และยังไม่มีเครื่องหมาย @ */}
              {email.length > 0 && !email.includes('@') && (
                <button
                  type="button" // สำคัญมาก! ต้องเป็น type button ไม่งั้นมันจะ submit form
                  onClick={addGmailSuffix}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold bg-brand-100 text-brand-600 px-2 py-1.5 rounded-lg hover:bg-brand-200 transition-colors animate-in fade-in zoom-in duration-200"
                >
                  + @gmail.com
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">รหัสผ่าน</label>
            <div className="relative group">
              <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors"></i>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-medium text-slate-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-sm font-bold text-brand-500 hover:text-brand-600">ลืมรหัสผ่าน?</a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          ยังไม่มีบัญชีร้านค้า? 
          <Link href="/register" className="text-brand-600 font-bold ml-1 hover:underline">สมัครสมาชิกฟรี</Link>
        </div>
      </div>
    </div>
  );
}