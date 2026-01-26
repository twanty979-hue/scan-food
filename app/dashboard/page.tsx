'use client';

import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    // 1. สั่ง Supabase ให้ Logout
    await supabase.auth.signOut();
    
    // 2. ดีดกลับไปหน้า Login
    router.replace('/login');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
      
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-slate-800">Dashboard</h1>
        <p className="text-slate-400 font-bold">หน้าทดสอบระบบ (Test Mode)</p>
      </div>

      <button 
        onClick={handleLogout}
        className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-red-500/30 transition-all active:scale-95 flex items-center gap-3"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        ออกจากระบบ
      </button>

    </div>
  );
}