'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error'|'success', text: string } | null>(null);

  // ✅ เพิ่ม State สำหรับเปิด/ปิดตาดูรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setMsg({ type: 'error', text: 'ลิงก์ไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่' });
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMsg({ type: 'error', text: 'รหัสผ่านไม่ตรงกัน' });
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

      setMsg({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จ! กำลังพากลับหน้า Dashboard...' });
      
      setTimeout(() => {
        router.replace('/dashboard');
      }, 2000);

    } catch (error: any) {
      setMsg({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">ตั้งรหัสผ่านใหม่</h1>
        <p className="text-slate-500 text-center mb-6 text-sm">กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>

        {msg && (
          <div className={`p-3 mb-4 rounded-lg text-sm flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            <i className={`fa-solid ${msg.type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'}`}></i>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          
          {/* ช่องรหัสผ่านใหม่ */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">รหัสผ่านใหม่</label>
            <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} // ✅ สลับ type
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none pr-10" // pr-10 เผื่อที่ให้ไอคอน
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* ปุ่มรูปตา */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <i className="fa-solid fa-eye-slash"></i>
                  ) : (
                    <i className="fa-solid fa-eye"></i>
                  )}
                </button>
            </div>
          </div>

          {/* ช่องยืนยันรหัสผ่าน */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ยืนยันรหัสผ่าน</label>
            <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} // ✅ สลับ type
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none pr-10"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {/* ปุ่มรูปตา */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <i className="fa-solid fa-eye-slash"></i>
                  ) : (
                    <i className="fa-solid fa-eye"></i>
                  )}
                </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/30 disabled:opacity-70"
          >
            {loading ? 'กำลังบันทึก...' : 'ยืนยันรหัสผ่านใหม่'}
          </button>
        </form>
      </div>
    </div>
  );
}