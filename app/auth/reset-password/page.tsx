// app/auth/reset-password/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // ตรวจสอบ path ให้ถูกต้อง
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error'|'success', text: string } | null>(null);

  // State สำหรับเปิด/ปิดตาดูรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // ถ้าไม่มี Session (ลิ้งก์ตาย หรือไม่ได้กดมาจาก Email)
        setMsg({ type: 'error', text: 'ลิงก์ไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่' });
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMsg({ type: 'error', text: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน' });
      return;
    }
    if (password.length < 6) {
        setMsg({ type: 'error', text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
        return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;

      setMsg({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จ! กำลังพาเข้าสู่ระบบ...' });
      
      // หน่วงเวลาเล็กน้อยให้ user อ่านข้อความ แล้วไป Dashboard หรือ Login
      setTimeout(() => {
        router.replace('/dashboard'); 
      }, 2000);

    } catch (error: any) {
      setMsg({ type: 'error', text: error.message });
      setLoading(false);
    }
  };

  return (
    // ธีม: Gradient ฟ้า-ขาว (เหมือนหน้า Register)
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E0F7FA] via-white to-[#E3F2FD] relative overflow-hidden p-4 font-sans text-slate-800">
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-200/40 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-white/80 backdrop-blur-md w-full max-w-[420px] p-8 rounded-[2rem] shadow-2xl shadow-blue-500/10 border border-white relative z-10">
        
        {/* Logo & Header */}
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
             <i className="fa-solid fa-key text-3xl text-[#00AEEF] hidden fallback-icon:block absolute"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">ตั้งรหัสผ่านใหม่</h1>
          <p className="text-slate-500 text-sm">กรุณากำหนดรหัสผ่านใหม่เพื่อเข้าใช้งาน</p>
        </div>

        {/* Message Box */}
        {msg && (
          <div className={`p-4 mb-6 rounded-xl text-sm flex items-center gap-3 animate-pulse border ${
            msg.type === 'success' 
              ? 'bg-green-50 text-green-600 border-green-100' 
              : 'bg-red-50 text-red-500 border-red-100'
          }`}>
            <i className={`fa-solid ${msg.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          
          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">รหัสผ่านใหม่</label>
            <div className="relative group">
              <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00AEEF] transition-colors"></i>
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00AEEF]/20 focus:border-[#00AEEF] transition-all text-slate-700 font-medium"
                placeholder="••••••••"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">ยืนยันรหัสผ่าน</label>
            <div className="relative group">
              <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00AEEF] transition-colors"></i>
              <input 
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00AEEF]/20 focus:border-[#00AEEF] transition-all text-slate-700 font-medium"
                placeholder="••••••••"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showConfirmPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#00AEEF] hover:bg-[#009ACD] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'บันทึกรหัสผ่านใหม่'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-slate-500">
           หรือ <Link href="/login" className="text-[#00AEEF] font-bold ml-1 hover:underline">ยกเลิกและกลับไปหน้าล็อกอิน</Link>
        </div>

      </div>
       <p className="absolute bottom-6 text-slate-400 text-xs text-center w-full opacity-60">
        © 2024 FoodScan System
      </p>
    </div>
  );
}