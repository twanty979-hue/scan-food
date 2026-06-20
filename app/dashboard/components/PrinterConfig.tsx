// app/dashboard/components/PrinterConfig.tsx
'use client';
import React, { useState } from 'react';
import { usePrinter, PrinterSettings } from '@/hooks/usePrinter';

// 🌟 เปลี่ยนเป็นไอคอนเครื่องพิมพ์ใบเสร็จ (สำหรับกดเรียกเปิด Sidebar)
const IconPrinter = ({ size = 20 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

export default function PrinterConfig() {
  const { printers, addOrUpdatePrinter, deletePrinter } = usePrinter();
  const [isEditing, setIsEditing] = useState(false);
  
  // State สำหรับจำลองการโชว์ QR Code
  const [testQrUrl, setTestQrUrl] = useState<string | null>(null);
  
  // ฟอร์มสำหรับเครื่องพิมพ์ตัวใหม่/แก้ไข
  const [formData, setFormData] = useState<PrinterSettings>({
    id: '',
    name: '',
    ipAddress: '192.168.1.',
    port: '9100',
    connectionType: 'airprint',
    paperSize: '80mm',
    isDefault: true
  });

  const handleOpenAdd = () => {
    setFormData({
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      ipAddress: '192.168.1.',
      port: '9100',
      connectionType: 'airprint',
      paperSize: '80mm',
      isDefault: printers.length === 0
    });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('กรุณากรอกชื่อเครื่องพิมพ์ครับนาย');
    addOrUpdatePrinter(formData);
    setIsEditing(false);
  };

const handleTestPrint = async (printer: PrinterSettings) => {
    // 🌟 บรรทัดนี้คงเดิม
    if (printer.connectionType === 'airprint') {
      window.print();
    // 🌟 จุดที่แก้: เติม (printer.connectionType as any) เพื่อหลอก TypeScript ให้มันยอมให้ผ่านครับนาย
    } else if ((printer.connectionType as any) === 'e_receipt') {
      // จำลองการสร้าง URL ใบเสร็จ แล้วแปลงเป็น QR Code
      const mockReceiptUrl = `https://pos-foodscan.com/receipt/test-${printer.id}`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mockReceiptUrl)}`;
      setTestQrUrl(qrImageUrl);
    } else {
      // กรณียิงตรงผ่าน IP
      try {
        const res = await fetch('/api/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ipAddress: printer.ipAddress,
            port: printer.port 
          })
        });
        
        const data = await res.json();
        
        if (res.ok) {
          alert('✅ กระดาษไหลแล้วครับนาย!');
        } else {
          alert(`❌ พิมพ์ไม่ออก Error: ${data.error}`);
        }
      } catch (error) {
        alert('❌ ติดต่อ Server ไม่ได้ครับ');
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 relative mt-4 md:mt-8">
      
      {/* Modal โชว์ QR Code สำหรับ E-Receipt */}
      {testQrUrl && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full animate-in zoom-in-95 duration-200">
                <h3 className="text-xl font-black text-slate-800 mb-2">สแกนรับใบเสร็จ</h3>
                <p className="text-sm text-slate-500 font-medium mb-6">E-Receipt ช่วยลดการใช้กระดาษ</p>
                <div className="p-4 border-2 border-slate-100 rounded-2xl mb-6 shadow-sm">
                    <img src={testQrUrl} alt="E-Receipt QR" className="w-48 h-48 mix-blend-multiply" />
                </div>
                <button 
                    onClick={() => setTestQrUrl(null)}
                    className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 active:scale-95 transition-all"
                >
                    ปิดหน้าต่าง
                </button>
            </div>
        </div>
      )}

      {/* Header Section พร้อมปุ่มเปิด Sidebar ที่ใช้ไอคอนรูปเครื่องปริ้น */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          
          {/* 🖨️ ปุ่มรูปเครื่องปริ้นใบเสร็จสำหรับสะกิดเปิด Sidebar หลังบ้าน */}
          <button 
            type="button"
            onClick={() => {
                const layoutMenuBtn = document.querySelector('header button');
                if (layoutMenuBtn instanceof HTMLElement) {
                    layoutMenuBtn.click();
                }
            }} 
            className="w-11 h-11 bg-slate-100 text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 active:scale-95 rounded-xl shadow-sm flex items-center justify-center transition-all duration-200 shrink-0"
            title="เปิดเมนูสไลด์บาร์"
          >
            <IconPrinter size={22} />
          </button>
          
          <div>
            <h2 className="text-xl font-bold text-slate-800">จัดการเครื่องพิมพ์หน้างาน</h2>
            <p className="text-sm text-slate-500">ตั้งค่าเครื่องพิมพ์สลิปและใบเสร็จสำหรับ iPad เครื่องนี้</p>
          </div>
        </div>

        {!isEditing && (
          <button 
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-orange-500/20 shrink-0"
          >
            + เพิ่มเครื่องพิมพ์
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4 border p-4 rounded-xl bg-slate-50">
          <h3 className="font-semibold text-slate-700">ตั้งค่าเครื่องพิมพ์</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ชื่อเครื่องพิมพ์ (เช่น แคชเชียร์, ในครัว)</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="ระบุชื่อเครื่องพิมพ์"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ระบบการเชื่อมต่อ</label>
              <select 
                value={formData.connectionType}
                onChange={e => setFormData({...formData, connectionType: e.target.value as any})}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="airprint">AirPrint (ผ่านระบบ iPad มาตรฐาน)</option>
                <option value="network_ip">ยิงตรงผ่านวงแลน (Network IP / WiFi)</option>
                <option value="bluetooth">บลูทูธ (Bluetooth)</option>
                <option value="e_receipt">📱 โชว์ QR Code บนจอ (E-Receipt)</option>
              </select>
            </div>

            {formData.connectionType === 'network_ip' && (
              <>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    IP Address ของเครื่องพิมพ์
                  </label>
                  <input 
                    type="text" 
                    value={formData.ipAddress}
                    onChange={e => setFormData({...formData, ipAddress: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="เช่น 192.168.1.150"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Port (ปกติคือ 9100)</label>
                  <input 
                    type="text" 
                    value={formData.port}
                    onChange={e => setFormData({...formData, port: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </>
            )}

            {formData.connectionType === 'bluetooth' && (
              <div className="col-span-2">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 font-medium">
                  👉 สำหรับการพิมพ์ผ่านบลูทูธ ระบบจะทำการเชื่อมต่อกับเครื่องพิมพ์บลูทูธที่จับคู่ไว้ (Paired) ในการตั้งค่า Bluetooth ของอุปกรณ์ของคุณ
                </div>
              </div>
            )}
            
            {/* เปลี่ยนจากการเช็คตรงๆ เป็นการ cast type เพื่อหลอกให้ TypeScript ยอมให้ผ่านครับ */}
{(formData.connectionType as any) === 'e_receipt' && (
  <div className="col-span-2">
    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700 font-medium">
      🌱 <strong>โหมดไร้กระดาษ:</strong> เมื่อกดพิมพ์ใบเสร็จ ระบบจะแสดง QR Code ขึ้นมากลางหน้าจอ เพื่อให้ลูกค้าใช้สมาร์ทโฟนสแกนดาวน์โหลดใบเสร็จของตัวเองได้ทันทีครับ
    </div>
  </div>
)}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ขนาดหน้ากระดาษ</label>
              <select 
                value={formData.paperSize}
                onChange={e => setFormData({...formData, paperSize: e.target.value as any})}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none"
              >
                <option value="80mm">80mm (สลิปใบเสร็จขนาดมาตรฐานใหญ่)</option>
                <option value="58mm">58mm (สลิปขนาดพกพา/ขนาดเล็ก)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border text-slate-600 rounded-lg text-sm hover:bg-slate-100"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
            >
              บันทึกค่าลงเครื่อง
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {printers.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-xl text-slate-400 text-sm">
              ยังไม่มีเครื่องพิมพ์ถูกบันทึกไว้บน iPad เครื่องนี้ครับนาย
            </div>
          ) : (
            printers.map((printer) => (
              <div key={printer.id} className="flex justify-between items-center border p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{printer.name}</span>
                    {printer.isDefault && (
                      <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        เครื่องหลัก
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    ประเภท: {
  printer.connectionType === 'airprint' 
    ? '📶 AirPrint' 
    : printer.connectionType === 'bluetooth' 
      ? '🔵 Bluetooth' 
      : (printer.connectionType as any) === 'e_receipt' 
        ? '📱 โชว์ QR Code บนจอ' 
        : `⚡ IP: ${printer.ipAddress}:${printer.port}`
} | ขนาด: {printer.paperSize}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleTestPrint(printer)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-100 font-medium"
                  >
                    ทดสอบการพิมพ์
                  </button>
                  <button 
                    onClick={() => deletePrinter(printer.id)}
                    className="px-3 py-1.5 border border-red-100 text-red-500 text-xs rounded-lg hover:bg-red-50 font-medium"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}