'use client';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="p-8 md:p-16">
          <h1 className="text-3xl font-black text-slate-900 mb-8 border-b pb-4">นโยบายความเป็นส่วนตัว</h1>
          
          <div className="space-y-6 text-slate-600 text-sm md:text-base leading-relaxed">
            <p>
              <strong>QuickOrder</strong> ("เรา") ให้ความสำคัญกับความเป็นส่วนตัวของข้อมูลผู้ใช้งานอย่างยิ่ง นโยบายนี้อธิบายถึงวิธีการที่เราเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของท่าน
            </p>

            <h3 className="text-lg font-bold text-slate-800 mt-6">1. ข้อมูลที่เราเก็บรวบรวม</h3>
            <p>
              เราอาจเก็บรวบรวมข้อมูลต่อไปนี้เมื่อท่านลงทะเบียนหรือใช้บริการ:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>ข้อมูลระบุตัวตน (เช่น ชื่อ, อีเมล)</li>
                <li>ข้อมูลร้านอาหาร (เช่น ชื่อร้าน, เมนูอาหาร, รูปภาพ)</li>
                <li>ข้อมูลการใช้งานระบบ (Log files, Cookies)</li>
              </ul>
            </p>

            <h3 className="text-lg font-bold text-slate-800 mt-6">2. การใช้ข้อมูล</h3>
            <p>
              เราใช้ข้อมูลของท่านเพื่อ:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>ให้บริการและปรับปรุงระบบ QuickOrder</li>
                <li>ติดต่อสื่อสารเกี่ยวกับบริการหรือการอัปเดต</li>
                <li>วิเคราะห์ข้อมูลเพื่อพัฒนาฟีเจอร์ใหม่ๆ</li>
              </ul>
            </p>

            <h3 className="text-lg font-bold text-slate-800 mt-6">3. การเปิดเผยข้อมูล</h3>
            <p>
              เราจะไม่ขายหรือให้เช่าข้อมูลส่วนบุคคลของท่านแก่บุคคลภายนอก ยกเว้นกรณีที่จำเป็นตามกฎหมาย หรือได้รับความยินยอมจากท่าน
            </p>

            <h3 className="text-lg font-bold text-slate-800 mt-6">4. ความปลอดภัย</h3>
            <p>
              เราใช้มาตรการรักษาความปลอดภัยที่ได้มาตรฐานเพื่อปกป้องข้อมูลของท่านจากการเข้าถึงโดยไม่ได้รับอนุญาต (เช่น การเข้ารหัส SSL, การใช้ Supabase Auth)
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