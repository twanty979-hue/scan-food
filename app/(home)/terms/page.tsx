'use client';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="p-8 md:p-16">
          <h1 className="text-3xl font-black text-slate-900 mb-8 border-b pb-4">เงื่อนไขการให้บริการ</h1>
          
          <div className="space-y-6 text-slate-600 text-sm md:text-base leading-relaxed">
            <p>
              ยินดีต้อนรับสู่ <strong>QuickOrder</strong> การเข้าใช้งานหรือใช้บริการ <strong>QuickOrder</strong> ถือว่าท่านได้อ่าน ทำความเข้าใจ และตกลงยอมรับเงื่อนไขการให้บริการดังต่อไปนี้
            </p>

            <h3 className="text-lg font-bold text-slate-800 mt-6">1. การใช้งานบริการ</h3>
            <p>
          ท่านตกลงที่จะใช้บริการเพื่อวัตถุประสงค์ที่ถูกต้องตามกฎหมายเท่านั้น
ห้ามใช้บริการเพื่อเผยแพร่เนื้อหาที่ผิดกฎหมาย ไม่เหมาะสม ละเมิดลิขสิทธิ์ หรือกระทำการใด ๆ ที่อาจก่อให้เกิดความเสียหายต่อระบบหรือผู้ใช้งานรายอื่น
            </p>

            <h3 className="text-lg font-bold text-slate-800 mt-6">2. บัญชีผู้ใช้</h3>
            <p>
             ท่านมีหน้าที่รับผิดชอบในการรักษาความลับของข้อมูลบัญชีและรหัสผ่าน
การกระทำใด ๆ ที่เกิดขึ้นภายใต้บัญชีของท่าน จะถือว่าเป็นการกระทำของท่านเองทั้งหมด
            </p>

            <h3 className="text-lg font-bold text-slate-800 mt-6">3. ทรัพย์สินทางปัญญา</h3>
            <p>
              ซอร์สโค้ด การออกแบบ ระบบ และเนื้อหาทั้งหมดภายในเว็บไซต์ (ยกเว้นข้อมูลที่ผู้ใช้เป็นผู้อัปโหลดเอง)
เป็นทรัพย์สินทางปัญญาของ <strong>QuickOrder</strong>
ห้ามคัดลอก ทำซ้ำ ดัดแปลง หรือเผยแพร่ โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
            </p>

            <h3 className="text-lg font-bold text-slate-800 mt-6">4. การยกเลิกบริการ</h3>
            <p>
              QuickOrder ขอสงวนสิทธิ์ในการระงับหรือยกเลิกการให้บริการบัญชีผู้ใช้
หากพบว่ามีการละเมิดเงื่อนไขการให้บริการ โดยไม่จำเป็นต้องแจ้งให้ทราบล่วงหน้า
            </p>

            <h3 className="text-lg font-bold text-slate-800 mt-6">5. การจำกัดความรับผิด</h3>
            <p>
              บริการของ QuickOrder ให้บริการในลักษณะ “ตามสภาพ” (As is)
เราไม่รับประกันว่าระบบจะทำงานได้อย่างต่อเนื่อง ปราศจากข้อผิดพลาด หรือไม่มีการหยุดชะงัก
และไม่รับผิดชอบต่อความเสียหายทางธุรกิจ ข้อมูล หรือผลกำไรที่อาจเกิดขึ้นจากการใช้งานระบบ
            </p>
            <h3 className="text-lg font-bold text-slate-800 mt-6">6. ความรับผิดชอบ</h3>
            <p>
             QuickOrder ไม่มีนโยบายคืนเงิน เว้นแต่ในกรณีที่เกิดความผิดพลาดจากระบบโดยตรง
การพิจารณาคืนเงินขึ้นอยู่กับดุลยพินิจของทีมงานเป็นกรณีไป
            </p>

            <div className="mt-8 pt-8 border-t border-slate-100 text-xs text-slate-400">
              แก้ไขล่าสุด: 10 กุมภาพันธ์ 2024
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
            ← กลับหน้าหลัก
          </Link>
        </div>

      </div>
    </div>
  );
}