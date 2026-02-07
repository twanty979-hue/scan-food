'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // เพิ่ม State นี้เพื่อสลับหน้าจอเมื่อสมัครสำเร็จ
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/setup');
      }
    };
    checkSession();
  }, [router]);

  const addGmailSuffix = () => {
    if (!email.includes('@')) setEmail((prev) => prev + '@gmail.com');
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/setup`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/setup`,
        },
      });

      if (error) throw error;

      if (data.session) {
        // กรณีไม่ต้องยืนยันอีเมล (บาง Setting ของ Supabase)
        router.replace('/setup');
      } else {
        // ✅ กรณีต้องยืนยันอีเมล: เปลี่ยน State เพื่อแสดงหน้า Success
        setIsSuccess(true);
        setLoading(false);
      }

    } catch (error: any) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E0F7FA] via-white to-[#E3F2FD] relative overflow-hidden p-4 font-sans text-slate-800">
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-200/40 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-white/80 backdrop-blur-md w-full max-w-[420px] p-8 rounded-[2rem] shadow-2xl shadow-blue-500/10 border border-white relative z-10">
        
        {/* Header Logo (แสดงตลอด) */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mx-auto mb-4 p-2 border border-slate-50 relative overflow-hidden">
             <Image 
               src="/logo.png" 
               alt="FoodScan Logo" 
               fill 
               className="object-contain p-2"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.parentElement?.classList.add('fallback-icon');
               }}
             />
             <i className="fa-solid fa-rocket text-4xl text-[#00AEEF] hidden fallback-icon:block absolute"></i>
          </div>
        </div>

        {/* --- เงื่อนไขการแสดงผล --- */}
        {isSuccess ? (
          // ✅ ส่วนที่ 1: แสดงเมื่อสมัครสำเร็จ (หน้าแจ้งเตือนเช็คอีเมล)
          <div className="text-center animate-fadeIn">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
              <i className="fa-regular fa-envelope-open"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">ยืนยันอีเมลของคุณ</h2>
            <p className="text-slate-600 mb-6">
              เราได้ส่งลิงก์ยืนยันไปที่<br/>
              <span className="font-bold text-[#00AEEF]">{email}</span><br/>
              กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึง Junk/Spam)
            </p>
            
            <Link 
              href="/login"
              className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          // ✅ ส่วนที่ 2: ฟอร์มสมัครสมาชิก (แสดงตอนแรก)
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                สร้างบัญชีใหม่
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                เริ่มต้นใช้งานระบบ FoodScan ฟรี
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl flex items-center gap-3 animate-pulse">
                <i className="fa-solid fa-circle-exclamation"></i>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">อีเมล</label>
                <div className="relative group">
                  <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00AEEF] transition-colors"></i>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00AEEF]/20 focus:border-[#00AEEF] transition-all text-slate-700 font-medium"
                    placeholder="ชื่อบัญชีของคุณ"
                  />
                  {email.length > 0 && !email.includes('@') && (
                    <button type="button" onClick={addGmailSuffix} className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-blue-50 text-[#00AEEF] px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors">
                      + @gmail.com
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">รหัสผ่าน</label>
                <div className="relative group">
                  <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00AEEF] transition-colors"></i>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00AEEF]/20 focus:border-[#00AEEF] transition-all text-slate-700 font-medium"
                    placeholder="ตั้งรหัสผ่าน 6 หลักขึ้นไป"
                    minLength={6}
                  />
                </div>
              </div>
              
              <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase">หรือสมัครด้วยอีเมล</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
              
              {/* Google Signup Button */}
              <button 
                onClick={handleGoogleSignup}
                type="button"
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 mb-6 active:scale-95 group"
              >
                 <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"/><path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"/><path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05"/><path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.0344664 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"/></svg>
                 สมัครด้วย Google
              </button>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#00AEEF] hover:bg-[#009ACD] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'ยืนยันการสมัคร'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
              มีบัญชีอยู่แล้ว? 
              <Link href="/login" className="text-[#00AEEF] font-bold ml-1 hover:underline">เข้าสู่ระบบ</Link>
            </div>
          </>
        )}

      </div>
      
      <p className="absolute bottom-6 text-slate-400 text-xs text-center w-full opacity-60">
        © 2024 FoodScan System
      </p>
    </div>
  );
}