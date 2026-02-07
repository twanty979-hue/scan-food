// app/terms/page.tsx
'use client';
import Link from 'next/link';

export default function TermsPage() {
  const lastUpdated = "8 กุมภาพันธ์ 2026";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-600">
      
      {/* Background Decor */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-100 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg shadow-blue-500/10 mb-6 text-blue-600 border border-blue-50">
            <i className="fa-solid fa-scale-balanced text-3xl"></i>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
            เงื่อนไขการให้บริการ
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            ข้อตกลงระหว่างผู้ใช้งานและ <span className="text-blue-600 font-bold">FoodScan</span>
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
          
          <div className="p-8 md:p-12 space-y-10">
            
            {/* Intro */}
            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50 text-center md:text-left">
              <p className="leading-relaxed">
                ยินดีต้อนรับสู่ <strong className="text-blue-700">FoodScan</strong> การเข้าใช้งานหรือสมัครสมาชิกเพื่อใช้บริการระบบของเรา 
                ถือว่าท่านได้อ่าน ทำความเข้าใจ และตกลงยอมรับเงื่อนไขการให้บริการดังต่อไปนี้อย่างครบถ้วน
              </p>
            </div>

            {/* Terms List */}
            <div className="grid gap-8">

              {/* Item 1 */}
              <div className="flex gap-4 items-start group">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">1</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">การใช้งานบริการ</h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    ท่านตกลงที่จะใช้บริการเพื่อวัตถุประสงค์ที่ถูกต้องตามกฎหมายเท่านั้น ห้ามใช้บริการเพื่อเผยแพร่เนื้อหาที่ผิดกฎหมาย 
                    ไม่เหมาะสม ละเมิดลิขสิทธิ์ หรือกระทำการใดๆ ที่อาจก่อให้เกิดความเสียหายต่อระบบ Server หรือผู้ใช้งานรายอื่น
                  </p>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Item 2 */}
              <div className="flex gap-4 items-start group">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">2</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">บัญชีผู้ใช้และความปลอดภัย</h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    ท่านมีหน้าที่รับผิดชอบในการรักษาความลับของข้อมูลบัญชี (Email) และรหัสผ่าน (Password) ของท่าน 
                    การกระทำใดๆ ที่เกิดขึ้นภายใต้บัญชีของท่าน จะถือว่าเป็นการกระทำของท่านเองทั้งหมด
                  </p>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Item 3 */}
              <div className="flex gap-4 items-start group">
                 <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">3</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">ทรัพย์สินทางปัญญา</h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    ซอร์สโค้ด, การออกแบบ, โลโก้ และระบบทั้งหมดภายในเว็บไซต์ (ยกเว้นข้อมูลเมนูที่ท่านอัปโหลดเอง) เป็นทรัพย์สินทางปัญญาของ <strong>FoodScan</strong> 
                    ห้ามคัดลอก ทำซ้ำ ดัดแปลง หรือนำไปขายต่อโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
                  </p>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Item 4 */}
              <div className="flex gap-4 items-start group">
                 <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">4</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">การระงับบริการ</h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    FoodScan ขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีผู้ใช้ทันที หากตรวจพบว่ามีการละเมิดเงื่อนไขการให้บริการ หรือมีการใช้งานที่ผิดปกติ 
                    โดยไม่จำเป็นต้องแจ้งให้ทราบล่วงหน้า
                  </p>
                </div>
              </div>

               <hr className="border-slate-100" />

              {/* Item 5 & 6 Combined */}
              <div className="flex gap-4 items-start group">
                 <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">5</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">ความรับผิดชอบและการคืนเงิน</h3>
                  <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm md:text-base">
                    <li>บริการของ FoodScan ให้บริการในลักษณะ "ตามสภาพ" (As is) เราไม่รับประกันความเสียหายทางธุรกิจที่อาจเกิดขึ้นจากการใช้งานระบบ</li>
                    <li>ทางบริษัทฯ ขอสงวนสิทธิ์ในการไม่คืนเงินค่าบริการ (No Refund Policy) เว้นแต่จะเกิดความผิดพลาดจากระบบของเราโดยตรงเท่านั้น</li>
                  </ul>
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