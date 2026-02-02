'use client';
import Link from 'next/link';

export default function ManualPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-600 to-brand-400 opacity-20"></div>
          <h1 className="text-3xl font-black uppercase tracking-wider relative z-10">คู่มือการเริ่มต้นใช้งาน</h1>
          <p className="text-slate-300 mt-2 relative z-10">เริ่มต้นใช้งาน QuickOrder ง่ายๆ ใน 4 ขั้นตอน</p>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 space-y-12">
          
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black text-xl">1</div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">สมัครสมาชิกและสร้างร้าน</h3>
              <p className="text-slate-600 leading-relaxed">
                คลิกปุ่ม “สมัครใช้งานฟรี” จากนั้นกรอกอีเมลและรหัสผ่าน ระบบจะให้คุณตั้งชื่อร้านอาหาร และอัปโหลดโลโก้ร้าน เพื่อสร้างตัวตนของร้านคุณ
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-black text-xl">2</div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">การเลือก TimeZone</h3>
              <p className="text-slate-600 leading-relaxed">
                เลือก Time Zone ให้ตรงกับพื้นที่ของร้าน เพื่อให้การแสดงผลยอดขาย รายงาน และข้อมูลย้อนหลังมีความแม่นยำ
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-black text-xl">3</div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">เพิ่มเมนูอาหาร โต๊ะ และ แบนเนอร์ </h3>
              <p className="text-slate-600 leading-relaxed">
                ระบบจะตั้งค่าข้อมูลตัวอย่างพื้นฐานให้พร้อมใช้งานทันที คุณสามารถแก้ไข หรือลบข้อมูลเหล่านี้ภายหลังได้ตามต้องการ
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center font-black text-xl">4</div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">เริ่มรับออเดอร์ได้ทันที!</h3>
              <p className="text-slate-600 leading-relaxed">
                เมื่อลูกค้าสแกน QR Code เพื่อสั่งอาหาร ออเดอร์จะถูกส่งเข้าสู่หน้า “ครัว” แบบเรียลไทม์ พนักงานสามารถกดรับออเดอร์ และเปลี่ยนสถานะเป็น “เสิร์ฟแล้ว” เมื่อทำอาหารเสร็จ
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-8 border-t border-slate-100 text-center">
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
            ← กลับหน้าหลัก
          </Link>
        </div>

      </div>
    </div>
  );
}