'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // เช็คว่าเคยล็อกอินหรือยัง
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', session.user.id).single();
        if (profile?.brand_id) router.replace('/setup');
        else router.replace('/setup');
      }
    };
    checkSession();
  }, [router]);

  // ฟังก์ชันปุ่มลัดเติม @gmail.com
  const addGmailSuffix = () => {
    if (!email.includes('@')) setEmail((prev) => prev + '@gmail.com');
  };

  // 🔥 ฟังก์ชันล็อกอินด้วย Magic Link (ไม่ง้อ Google, ไม่ง้อรหัสผ่าน)
  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // สั่ง Supabase ส่งอีเมล (ฟรี! ไม่ต้องผูกบัตร)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`, // พอกดลิงก์ในเมล มันจะเด้งกลับมาที่หน้านี้
          shouldCreateUser: true, // ถ้ายังไม่เคยสมัคร มันจะสมัครให้เลยอัตโนมัติ!
        },
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: '✅ ส่งลิงก์วิเศษไปที่อีเมลแล้ว! เปิดอีเมลแล้วกดปุ่มเข้าสู่ระบบได้เลย (เช็ค Junk Mail ด้วยนะ)'
      });

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50/50 relative overflow-hidden p-4">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-200 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
      
      <div className="bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl shadow-brand-500/10 border border-white/50 backdrop-blur-sm relative z-10">
        
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 mx-auto mb-4 p-2 border border-slate-100 relative overflow-hidden">
             {/* ใส่ Logo ร้านตรงนี้ */}
             <Image 
               src="/logo.png" 
               alt="Shop Logo" 
               fill 
               className="object-contain p-2"
               onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('fallback-icon'); }}
             />
             <i className="fa-solid fa-store text-4xl text-brand-500 hidden fallback-icon:block absolute"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">เข้าสู่ระบบร้านค้า</h1>
          <p className="text-slate-500 mt-2 text-sm">ง่ายและปลอดภัย ไม่ต้องจำรหัสผ่าน</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 border text-sm rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-500 animate-pulse'}`}>
            <i className={`fa-solid mt-0.5 ${message.type === 'success' ? 'fa-envelope-circle-check' : 'fa-circle-exclamation'}`}></i>
            <span>{message.text}</span>
          </div>
        )}

        {/* Login Form */}
        {!message?.text.includes('ส่งลิงก์') ? (
          <form onSubmit={handleMagicLinkLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">อีเมลของคุณ</label>
              <div className="relative group">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors"></i>
                
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-medium text-slate-700"
                  placeholder="name@example.com"
                />

                {/* ปุ่มทางลัด @gmail.com */}
                {email.length > 0 && !email.includes('@') && (
                  <button type="button" onClick={addGmailSuffix} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold bg-brand-100 text-brand-600 px-2 py-1.5 rounded-lg hover:bg-brand-200 transition-colors animate-in fade-in zoom-in">
                    + @gmail.com
                  </button>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : (
                <>
                  <i className="fa-solid fa-paper-plane"></i> รับลิงก์เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>
        ) : (
          <button 
            onClick={() => setMessage(null)}
            className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
          >
            ส่งใหม่อีกครั้ง / เปลี่ยนอีเมล
          </button>
        )}

        <div className="mt-8 text-center text-xs text-slate-400">
          *ระบบจะสร้างบัญชีให้อัตโนมัติหากคุณยังไม่มีสมาชิก
        </div>
      </div>
    </div>
  );
}