'use client';
import { useState, useEffect } from 'react'; // ✅ เพิ่ม useEffect
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ✅ เพิ่มส่วนนี้: เช็คว่าล็อกอินค้างไว้หรือยัง?
  useEffect(() => {
    const checkSession = async () => {
      // 1. ดูว่ามี Session ค้างในเครื่องไหม
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 2. ถ้ามี -> เช็คต่อว่ามีร้านหรือยัง (เหมือนตอนกด Login)
        const { data: profile } = await supabase
          .from('profiles')
          .select('brand_id')
          .eq('id', session.user.id)
          .single();

        if (profile?.brand_id) {
          router.replace('/dashboard'); // มีครบ -> ไป Dashboard
        } else {
          router.replace('/setup');     // มีแต่ตัว ไม่มีร้าน -> ไป Setup
        }
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. ล็อกอินเข้าสู่ระบบ (Auth)
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;
      if (!authData.user) throw new Error("ไม่พบข้อมูลผู้ใช้");

      // 2. เช็คว่ามีร้านหรือยัง? (Check Profile & Brand)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('brand_id')
        .eq('id', authData.user.id)
        .single();

      // Logic การเปลี่ยนหน้า:
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
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-brand-500/30 mx-auto mb-4">
            <i className="fa-solid fa-right-to-bracket"></i>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">ยินดีต้อนรับกลับ!</h1>
          <p className="text-slate-500 mt-2">เข้าสู่ระบบเพื่อจัดการร้านของคุณ</p>
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
            <div className="relative">
              <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-medium text-slate-700"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">รหัสผ่าน</label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
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