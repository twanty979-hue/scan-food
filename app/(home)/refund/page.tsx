// app/(home)/refund/page.tsx
'use client';
import Link from 'next/link';

export default function RefundPage() {
  const lastUpdated = "8 กุมภาพันธ์ 2026";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-600">
      
      {/* Background Decor */}
      <div className="fixed top-[-10%] right-[-10%] w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-96 h-96 bg-cyan-100 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg shadow-blue-500/10 mb-6 text-blue-600 border border-blue-50">
            <i className="fa-solid fa-receipt text-3xl"></i>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
            นโยบายการคืนเงิน
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Refund Policy for <span className="text-blue-600 font-bold">FoodScan</span>
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
          
          <div className="p-8 md:p-12 space-y-10">
            
            {/* Intro */}
            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50 text-center md:text-left">
              <p className="leading-relaxed">
                <strong className="text-blue-700">FoodScan</strong> มุ่งมั่นที่จะให้บริการระบบจัดการร้านอาหารที่มีคุณภาพและเสถียรภาพสูงสุด 
                อย่างไรก็ตาม เราเข้าใจว่าอาจเกิดเหตุสุดวิสัยหรือข้อผิดพลาดทางเทคนิค นโยบายนี้จึงกำหนดเงื่อนไขการขอคืนเงินไว้อย่างชัดเจน
              </p>
            </div>

            {/* Refund List */}
            <div className="grid gap-8">

              {/* Item 1 */}
              <div className="flex gap-4 items-start group">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">1</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">นโยบายทั่วไป (General Policy)</h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    เนื่องจากบริการของ FoodScan เป็นสินค้าดิจิทัล (Digital Product) และมีการให้ทดลองใช้งานฟรี (Free Tier) อยู่แล้ว 
                    ทางบริษัทฯ <strong className="text-red-500">ขอสงวนสิทธิ์ในการไม่คืนเงินทุกกรณี</strong> สำหรับความไม่พึงพอใจส่วนตัว หรือการเปลี่ยนแปลงแผนธุรกิจของผู้ใช้งาน
                  </p>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Item 2 */}
              <div className="flex gap-4 items-start group">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">2</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">ข้อยกเว้นในการคืนเงิน (Exceptions)</h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-3">
                    เรายินดีพิจารณาคืนเงินเต็มจำนวน หากเกิดกรณีดังต่อไปนี้:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm md:text-base bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <li>เกิดการหักเงินซ้ำซ้อน (Double Charge) จากความผิดพลาดของระบบ</li>
                    <li>ระบบล่มหรือไม่สามารถใช้งานฟีเจอร์หลักได้เกิน 24 ชั่วโมง โดยไม่ได้มีการแจ้งล่วงหน้า</li>
                    <li>ถูกหักเงินหลังจากที่ได้ทำการยกเลิกสมาชิก (Cancel Subscription) สำเร็จแล้วอย่างน้อย 24 ชั่วโมง</li>
                  </ul>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Item 3 */}
              <div className="flex gap-4 items-start group">
                 <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">3</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">ขั้นตอนการขอคืนเงิน</h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    หากท่านเข้าข่ายตามเงื่อนไขในข้อ 2 กรุณาติดต่อทีมงาน Support ผ่านทางอีเมลภายใน <strong>7 วัน</strong> นับจากวันที่เกิดรายการ 
                    โดยแนบหลักฐานการชำระเงินและรายละเอียดปัญหา ทางเราจะตรวจสอบและดำเนินการภายใน 7-14 วันทำการ
                  </p>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Item 4 */}
              <div className="flex gap-4 items-start group">
                 <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">4</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">การยกเลิกบริการ (Cancellation)</h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    ท่านสามารถยกเลิกการต่ออายุสมาชิกอัตโนมัติได้ตลอดเวลาผ่านหน้า Dashboard การยกเลิกจะมีผลในรอบบิลถัดไป 
                    โดยท่านยังสามารถใช้งานระบบได้จนกว่าจะสิ้นสุดระยะเวลาที่ชำระเงินไว้แล้ว
                  </p>
                </div>
              </div>

            </div>

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
          © {new Date().getFullYear()} FoodScan System. All rights reserved.
        </p>

      </div>
    </div>
  );
}