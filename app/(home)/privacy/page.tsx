// app/privacy/page.tsx (หรือ path ที่คุณใช้งานอยู่)
'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPage() {
  // วันที่อัปเดตล่าสุด (เปลี่ยนได้ตามจริง)
  const lastUpdated = "8 กุมภาพันธ์ 2026";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-600">
      
      {/* Background Decor (Optional - ให้เหมือนหน้า Login) */}
      <div className="fixed top-[-10%] right-[-5%] w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-96 h-96 bg-cyan-100 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg shadow-blue-500/10 mb-6 text-blue-500 border border-blue-50">
            {/* ใส่ Logo หรือ Icon ความปลอดภัย */}
            <i className="fa-solid fa-shield-halved text-3xl"></i>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
            นโยบายความเป็นส่วนตัว
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Pos-FoodScan Management System
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
          
          <div className="p-8 md:p-12 space-y-10">
            
            {/* Intro */}
            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
              <p className="leading-relaxed">
                <strong className="text-blue-700">Pos-FoodScan</strong> ("เรา") ให้ความสำคัญกับความเป็นส่วนตัวและความปลอดภัยของข้อมูลผู้ใช้งานอย่างสูงสุด 
                นโยบายฉบับนี้จัดทำขึ้นเพื่อชี้แจงให้ท่านทราบถึงวิธีการที่เราเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของท่านเมื่อเข้าใช้งานระบบ POS และบริการของเรา
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <i className="fa-solid fa-database"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-800">1. ข้อมูลที่เราเก็บรวบรวม</h2>
              </div>
              <div className="pl-14">
                <p className="mb-3">เราอาจเก็บรวบรวมข้อมูลต่อไปนี้เมื่อท่านลงทะเบียนร้านค้าหรือใช้งานระบบ:</p>
                <ul className="space-y-2">
                  {[
                    "ข้อมูลระบุตัวตน (เช่น ชื่อ-นามสกุล, อีเมล, เบอร์โทรศัพท์)",
                    "ข้อมูลร้านอาหาร (เช่น ชื่อแบรนด์, โลโก้, รายการเมนู, ราคา)",
                    "ข้อมูลธุรกรรม (ประวัติการสั่งซื้อ, ยอดขายรายวัน)",
                    "ข้อมูลทางเทคนิค (IP Address, ประเภทอุปกรณ์, Cookies)"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm md:text-base">
                      <i className="fa-solid fa-check text-green-500 mt-1"></i>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 2 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                  <i className="fa-solid fa-chart-pie"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-800">2. วัตถุประสงค์การใช้ข้อมูล</h2>
              </div>
              <div className="pl-14 space-y-2 text-sm md:text-base">
                <p>เรานำข้อมูลของท่านไปใช้เพื่อประโยชน์ในการ:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 marker:text-indigo-300">
                  <li>ให้บริการจัดการร้านอาหาร ระบบสั่งอาหาร และสรุปยอดขาย</li>
                  <li>ยืนยันตัวตนและรักษาความปลอดภัยของบัญชีผู้ใช้</li>
                  <li>พัฒนาและปรับปรุงฟีเจอร์ใหม่ๆ ของ Pos-FoodScan</li>
                  <li>ติดต่อสื่อสาร แจ้งเตือนสถานะระบบ หรือโปรโมชั่นที่เกี่ยวข้อง</li>
                </ul>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 3 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                  <i className="fa-solid fa-user-shield"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-800">3. การเปิดเผยและการปกป้องข้อมูล</h2>
              </div>
              <div className="pl-14 text-sm md:text-base space-y-3">
                <p>
                  เราไม่มีนโยบายจำหน่าย จ่าย แจก หรือให้เช่าข้อมูลส่วนบุคคลของท่านแก่บุคคลภายนอก เว้นแต่จะได้รับความยินยอมจากท่าน หรือเป็นการปฏิบัติตามกฎหมาย
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm flex gap-3">
                   <i className="fa-solid fa-lock text-slate-400 mt-0.5"></i>
                   <p>
                     ข้อมูลของท่านถูกจัดเก็บอย่างปลอดภัยด้วยมาตรฐานการเข้ารหัส (Encryption) และระบบรักษาความปลอดภัยระดับสากลผ่าน Supabase Infrastructure
                   </p>
                </div>
              </div>
            </section>

            {/* Footer Date */}
            <div className="pt-6 mt-8 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                แก้ไขล่าสุดเมื่อ: {lastUpdated}
              </p>
            </div>

          </div>

          {/* Bottom Action */}
          <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex justify-center">
             <Link 
              href="/" 
              className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors px-6 py-2 rounded-full hover:bg-white hover:shadow-sm"
            >
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
              กลับสู่หน้าหลัก
            </Link>
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