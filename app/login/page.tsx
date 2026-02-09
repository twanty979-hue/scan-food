//app/login/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // ตรวจสอบ path ให้ถูกต้อง
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // State สำหรับสลับหน้า (Login vs Forgot Password)
  const [isRecovery, setIsRecovery] = useState(false); 

  // เช็ค Session (Logic เดิม)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('brand_id')
          .eq('id', session.user.id)
          .single();

        if (profile?.brand_id) router.replace('/dashboard');
        else router.replace('/setup');
      }
    };
    checkSession();
  }, [router]);

  const addGmailSuffix = () => {
    if (!email.includes('@')) setEmail((prev) => prev + '@gmail.com');
  };

  // ✅ 1. เพิ่มฟังก์ชัน Google Login (เอามาจากโค้ดแรกของคุณ)
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // ให้เด้งกลับมาที่หน้า Auth Callback ของเรา
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  // ฟังก์ชัน Login ปกติ (Logic เดิม)
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('brand_id')
        .eq('id', authData.user.id)
        .single();

      if (!profile?.brand_id) router.push('/setup');
      else router.push('/dashboard');

    } catch (error: any) {
      setErrorMsg(error.message);
      setLoading(false); 
    }
  };

 const handleResetPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setErrorMsg(null);
  setSuccessMsg(null);

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // ✅ แก้ไขบรรทัดนี้: ให้วิ่งไปที่หน้า callback ก่อน
      // และส่งพารามิเตอร์ next เพื่อบอกว่าหลังจากแลก Session เสร็จให้ไปหน้าเปลี่ยนรหัส
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password&type=recovery`,
    });

    if (error) throw error;

    setSuccessMsg("ส่งลิงก์เปลี่ยนรหัสผ่านไปที่อีเมลแล้ว! ");
    
  } catch (error: any) {
    setErrorMsg(error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50/50 relative overflow-hidden p-4">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-200 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>

      <div className="bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl shadow-brand-500/10 border border-white/50 backdrop-blur-sm relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 mx-auto mb-4 p-2 border border-slate-100 relative overflow-hidden">
             <Image 
               src="/logo.png" 
               alt="Shop Logo" 
               fill 
               className="object-contain p-2"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.parentElement?.classList.add('fallback-icon');
               }}
             />
             <i className="fa-solid fa-store text-4xl text-brand-500 hidden fallback-icon:block absolute"></i>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800">
            {isRecovery ? 'กู้คืนรหัสผ่าน' : 'ยินดีต้อนรับกลับ!'}
          </h1>
          <p className="text-slate-500 mt-2">
            {isRecovery ? 'กรอกอีเมลเพื่อรับลิงก์ตั้งรหัสใหม่' : 'FoodScan Management System'}
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl flex items-center gap-3 animate-pulse">
            <i className="fa-solid fa-circle-exclamation"></i>
            {errorMsg}
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl flex items-center gap-3">
            <i className="fa-solid fa-circle-check"></i>
            {successMsg}
          </div>
        )}

        

        {/* Form (สลับฟังก์ชันตามโหมด) */}
        <form onSubmit={isRecovery ? handleResetPassword : handleLogin} className="space-y-5">
          
          {/* ช่องอีเมล (ใช้ร่วมกันทั้ง 2 โหมด) */}
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
              {email.length > 0 && !email.includes('@') && (
                <button type="button" onClick={addGmailSuffix} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold bg-brand-100 text-brand-600 px-2 py-1.5 rounded-lg hover:bg-brand-200 transition-colors">
                  + @gmail.com
                </button>
              )}
            </div>
          </div>

          {/* ช่องรหัสผ่าน (ซ่อนเมื่ออยู่โหมดกู้คืน) */}
          {!isRecovery && (
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
          )}

          {/* ปุ่มสลับโหมด */}
          <div className="flex justify-end">
            <button 
                type="button"
                onClick={() => {
                    setIsRecovery(!isRecovery);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                }}
                className="text-sm font-bold text-brand-500 hover:text-brand-600"
            >
              {isRecovery ? 'กลับไปหน้าเข้าสู่ระบบ' : 'ลืมรหัสผ่าน?'}
            </button>
            
          </div>
          <div className="relative flex py-2 items-center mt-6">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase">หรือเข้าสู่ระบบด้วยอีเมล</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
          {/* ✅ 2. ส่วน Google Login (แสดงเฉพาะตอน Login ไม่แสดงตอนกู้รหัสผ่าน) */}
        {!isRecovery && (
          <div className="mb-6">
            <button 
              onClick={handleGoogleLogin}
              type="button"
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 active:scale-95 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"/><path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"/><path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05"/><path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.0344664 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"/></svg>
              เข้าสู่ระบบด้วย Google
            </button>

            {/* เส้นคั่น Or */}
            
          </div>
        )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : (isRecovery ? 'ส่งลิงก์รีเซ็ตรหัสผ่าน' : 'เข้าสู่ระบบ')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          ยังไม่มีบัญชีร้านค้า? 
          <Link href="/register" className="text-brand-600 font-bold ml-1 hover:underline">สมัครสมาชิกฟรี</Link>
        </div>
      </div>
    </div>
  );
}