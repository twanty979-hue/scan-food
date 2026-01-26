'use client';

import { useRouter } from 'next/navigation';

export default function TutorialPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
      
      <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-8 animate-bounce">
        <span className="text-5xl">🚀</span>
      </div>

      <h1 className="text-4xl font-black mb-4">ยินดีต้อนรับเจ้าของร้าน!</h1>
      <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
        ขอบคุณที่เปิดร้านใหม่กับเรา หน้านี้จะเป็นส่วนสอนการใช้งานเบื้องต้น (Tutorial)
        <br/><br/>
        <span className="text-xs uppercase tracking-widest text-slate-500 block mt-2">-- COMING SOON --</span>
      </p>

      <button 
        onClick={() => router.push('/dashboard')}
        className="mt-12 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all active:scale-95 shadow-xl"
      >
        เข้าสู่ Dashboard
      </button>

    </div>
  );
}