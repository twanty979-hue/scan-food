// app/(home)/pricing/page.tsx
'use client';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white py-20 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Background Decor */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">
            เลือกแพ็กเกจที่ใช่สำหรับร้านคุณ
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            เริ่มต้นใช้งานฟรีได้ทันที หรืออัปเกรดเพื่อฟีเจอร์ระดับโปรที่ช่วยให้ร้านของคุณเติบโตอย่างก้าวกระโดด
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">

          {/* 1. STARTER Plan */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 relative group h-full flex flex-col">
            <div className="mb-6 text-center">
              <h3 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-2">STARTER</h3>
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-4xl font-black text-slate-800">ฟรี</span>
                <span className="text-sm text-slate-400 font-medium">ตลอดชีพ</span>
              </div>
              <p className="text-xs text-slate-500">เริ่มต้นใช้งานร้านอาหาร</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <i className="fa-solid fa-check text-slate-400 mt-1"></i>
                เลือกได้ 2 ธีม
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <i className="fa-solid fa-check text-slate-400 mt-1"></i>
                รองรับ 30 ออเดอร์/เดือน
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <i className="fa-solid fa-check text-slate-400 mt-1"></i>
                QR Code สั่งอาหาร
              </li>
            </ul>

            <Link 
              href="/register" 
              className="w-full block text-center py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:border-slate-800 hover:text-slate-800 transition-colors"
            >
              สมัครฟรี
            </Link>
          </div>

          {/* 2. BASIC Plan */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <div className="mb-6 text-center">
              <h3 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-2">BASIC</h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl font-black text-slate-800">399</span>
                <span className="text-sm text-slate-400 font-medium">บาท/เดือน</span>
              </div>
              <p className="text-xs text-slate-500">สำหรับร้านที่ต้องการขยายยอดขาย</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                ออเดอร์ไม่จำกัด
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                สร้าง QR Code ไม่จำกัด
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                คิดเงินได้ไม่จำกัด
              </li>
               <li className="flex items-start gap-3 text-sm text-slate-600">
                <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                ฟรี 10 ธีม
              </li>
               <li className="flex items-start gap-3 text-sm text-slate-600">
                <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                จัดโปรโมชั่น
              </li>
            </ul>

            <Link 
              href="/register?plan=basic" 
              className="w-full block text-center py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-colors"
            >
              เลือกแผนนี้
            </Link>
          </div>

          {/* 3. PRO Plan (Highlight) */}
          <div className="bg-white rounded-3xl p-8 border-2 border-blue-500 shadow-2xl shadow-blue-500/20 relative transform md:-translate-y-4 h-full flex flex-col z-10">
            {/* Badge */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
              BEST VALUE
            </div>

            <div className="mb-6 text-center pt-2">
              <h3 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-2">PRO</h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-5xl font-black text-slate-800">1,299</span>
                <span className="text-sm text-slate-400 font-medium">บาท/เดือน</span>
              </div>
              <p className="text-xs text-slate-500">สำหรับร้านที่ต้องการระบบจัดการครบวงจร</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow">
               <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                   <i className="fa-solid fa-check text-blue-600 text-xs"></i>
                </div>
                ทุกฟีเจอร์ใน Basic
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                 <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                ระบบจัดการพนักงาน
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                 <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                กำหนดสิทธิ์พนักงาน
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                 <i className="fa-solid fa-check text-blue-500 mt-1"></i>
                เลือกได้ 15 ธีม
              </li>
            </ul>

            <Link 
              href="/register?plan=pro" 
              className="w-full block text-center py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
            >
              แนะนำ
            </Link>
          </div>

          {/* 4. ULTIMATE Plan */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg shadow-purple-200/50 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <div className="mb-6 text-center">
              <h3 className="text-sm font-bold text-purple-600 tracking-widest uppercase mb-2">ULTIMATE</h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl font-black text-slate-800">1,999</span>
                <span className="text-sm text-slate-400 font-medium">บาท/เดือน</span>
              </div>
              <p className="text-xs text-slate-500">จัดเต็มทุกฟีเจอร์สูงสุด</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow">
               <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                   <i className="fa-solid fa-check text-purple-600 text-xs"></i>
                </div>
                ทุกฟีเจอร์ใน Pro
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <i className="fa-solid fa-check text-purple-500 mt-1"></i>
                เลือกได้ 30 ธีม
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <i className="fa-solid fa-check text-purple-500 mt-1"></i>
                ทีมซัพพอร์ตดูแลพิเศษ
              </li>
            </ul>

            <Link 
              href="/register?plan=ultimate" 
              className="w-full block text-center py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold hover:from-purple-700 hover:to-pink-600 shadow-lg shadow-purple-500/30 transition-all"
            >
              เลือกแผนนี้
            </Link>
          </div>

        </div>

        {/* FAQ or Contact Link (Optional) */}
        <div className="mt-16 text-center">
          <p className="text-slate-500">
            มีคำถามเพิ่มเติม? <Link href="/contact" className="text-blue-600 font-bold hover:underline">ติดต่อทีมขายของเรา</Link>
          </p>
        </div>

      </div>
    </div>
  );
}