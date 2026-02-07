// app/manual/page.tsx (หรือ path ที่คุณใช้งานอยู่)
'use client';
import Link from 'next/link';

export default function ManualPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-600">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-cyan-100 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-lg shadow-blue-500/10 mb-6 text-blue-500 border border-blue-50 rotate-3 hover:rotate-0 transition-transform duration-300">
            <i className="fa-solid fa-book-open-reader text-4xl"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
            คู่มือการเริ่มต้นใช้งาน
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            เริ่มต้นใช้งาน <span className="text-blue-600 font-bold">Pos-FoodScan</span> ง่ายๆ ใน 4 ขั้นตอน เพื่อยกระดับร้านอาหารของคุณสู่อนาคต
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
          
          <div className="p-8 md:p-16">
            
            {/* Steps Container */}
            <div className="relative space-y-12 md:space-y-0">
              
              {/* Vertical Line (Desktop Only) */}
              <div className="hidden md:block absolute left-[3.25rem] top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-200 via-blue-100 to-transparent"></div>

              {/* Step 1 */}
              <div className="relative flex flex-col md:flex-row gap-8 md:gap-10 group">
                <div className="flex-shrink-0 z-10">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-white border-4 border-blue-50 rounded-3xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-5xl font-black text-blue-100 group-hover:text-blue-500 transition-colors">1</span>
                  </div>
                </div>
                <div className="flex-grow pt-4">
                  <h3 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
                    สมัครสมาชิกและสร้างร้าน
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">Start</span>
                  </h3>
                  <p className="text-slate-600 text-lg leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 group-hover:border-blue-200 transition-colors">
                    คลิกปุ่ม <strong className="text-blue-600">"สมัครใช้งานฟรี"</strong> จากนั้นกรอกอีเมลและรหัสผ่าน ระบบจะให้คุณตั้งชื่อร้านอาหาร และอัปโหลดโลโก้ร้าน เพื่อสร้างตัวตนของร้านคุณให้โดดเด่น
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col md:flex-row gap-8 md:gap-10 group">
                 <div className="flex-shrink-0 z-10">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-white border-4 border-cyan-50 rounded-3xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-5xl font-black text-cyan-100 group-hover:text-cyan-500 transition-colors">2</span>
                  </div>
                </div>
                <div className="flex-grow pt-4">
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">การตั้งค่า TimeZone</h3>
                  <p className="text-slate-600 text-lg leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 group-hover:border-cyan-200 transition-colors">
                    เลือก Time Zone ให้ตรงกับพื้นที่ของร้าน (เช่น Asia/Bangkok) เพื่อให้การแสดงผลยอดขาย รายงาน และข้อมูลย้อนหลังมีความแม่นยำสูงสุดตามเวลาจริง
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col md:flex-row gap-8 md:gap-10 group">
                 <div className="flex-shrink-0 z-10">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-white border-4 border-indigo-50 rounded-3xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-5xl font-black text-indigo-100 group-hover:text-indigo-500 transition-colors">3</span>
                  </div>
                </div>
                <div className="flex-grow pt-4">
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">จัดการเมนูและโต๊ะอาหาร</h3>
                  <p className="text-slate-600 text-lg leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 group-hover:border-indigo-200 transition-colors">
                    ระบบจะสร้างข้อมูลตัวอย่างให้คุณเห็นภาพ คุณสามารถ <strong className="text-indigo-600">เพิ่ม/ลบ/แก้ไข</strong> เมนูอาหาร หมวดหมู่ และจำนวนโต๊ะ ให้ตรงกับร้านของคุณได้ทันที
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex flex-col md:flex-row gap-8 md:gap-10 group">
                 <div className="flex-shrink-0 z-10">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl shadow-lg shadow-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <i className="fa-solid fa-rocket text-4xl text-white animate-pulse"></i>
                  </div>
                </div>
                <div className="flex-grow pt-4">
                  <h3 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
                    เริ่มรับออเดอร์ได้ทันที!
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">Ready</span>
                  </h3>
                  <p className="text-slate-600 text-lg leading-relaxed bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    เพียงปริ้น QR Code แปะที่โต๊ะ เมื่อลูกค้าสแกนสั่งอาหาร ออเดอร์จะเด้งเข้าสู่หน้า <strong>"ครัว (Kitchen)"</strong> แบบ Real-time พนักงานกดรับและเสิร์ฟได้ทันที สะดวก รวดเร็ว!
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Call to Action */}
          <div className="bg-slate-50 px-8 py-10 border-t border-slate-100 text-center">
            <h4 className="text-xl font-bold text-slate-800 mb-6">พร้อมที่จะยกระดับร้านอาหารของคุณหรือยัง?</h4>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register" 
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transform active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-store"></i>
                เริ่มต้นใช้งานฟรี
              </Link>
              <Link 
                href="/" 
                className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-arrow-left"></i>
                กลับหน้าหลัก
              </Link>
            </div>
          </div>

        </div>
        
        {/* Copyright */}
        <p className="text-center text-slate-400 text-xs mt-8 opacity-60">
          © {new Date().getFullYear()} Pos-FoodScan System. All rights reserved.
        </p>

      </div>
    </div>
  );
}