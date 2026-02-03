'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // เช็ค path ให้ถูกต้อง
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false); // โหมดสลับระหว่าง Login / Register
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // เช็คว่ามีคนล็อกอินอยู่แล้วหรือไม่
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // เช็คว่าเคย Setup ร้านหรือยัง
        const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', session.user.id).single();
        if (profile?.brand_id) router.replace('/dashboard/pai_order');
        else router.replace('/setup');
      }
    };
    checkSession();
  }, [router]);

  // 1. Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    }
  };

  // 2. Email & Password (Login / Register)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isRegister) {
        // --- โหมดสมัครสมาชิก ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: '✅ สมัครสมาชิกสำเร็จ! (กรุณาเช็คอีเมลเพื่อยืนยันตัวตน ก่อนล็อกอิน)' });
        setIsRegister(false); // สลับกลับมาหน้าล็อกอิน
      } else {
        // --- โหมดเข้าสู่ระบบ ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.refresh(); // ให้มันเช็ค session ใหม่และดีดไปเองตาม useEffect
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4 font-sans text-slate-800">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="bg-white w-full max-w-[420px] p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            {isRegister ? 'สร้างบัญชีใหม่' : 'ยินดีต้อนรับ'}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {isRegister ? 'สมัครสมาชิกเพื่อเริ่มต้นใช้งาน' : 'เข้าสู่ระบบจัดการร้านค้าของคุณ'}
          </p>
        </div>

        {/* Alert Message */}
        {message && (
          <div className={`mb-6 p-4 text-sm rounded-xl flex items-start gap-3 border ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
            <span className="mt-0.5">{message.type === 'success' ? '✅' : '⚠️'}</span>
            <span className="leading-snug">{message.text}</span>
          </div>
        )}

        

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase">หรือ</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">อีเมล</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">รหัสผ่าน</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
              placeholder="••••••••"
            />
          </div>
          {/* Google Button */}
        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 mb-6 active:scale-95 group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"/><path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"/><path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05"/><path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.0344664 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"/></svg>
          {isRegister ? 'สมัครด้วย Google' : 'เข้าสู่ระบบด้วย Google'}
        </button>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'กำลังโหลด...' : (isRegister ? 'ยืนยันการสมัคร' : 'เข้าสู่ระบบ')}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage(null);
            }}
            className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
          >
            {isRegister 
              ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' 
              : 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่'}
          </button>
        </div>

      </div>
      
      <p className="absolute bottom-6 text-slate-400 text-xs text-center w-full opacity-60">
        ScanFood System
      </p>
    </div>
  );
}