// app/dashboard/settings/page.tsx
'use client';

import React from 'react';
import PrinterConfig from '../../components/PrinterConfig';

export default function SettingsPage() {
  return (
    // คลีนมาก: เอา useEffect ตัวปัญหาออกไปเรียบร้อย หน้าจอจะเปิดขึ้นมาได้ทันทีไม่ค้างแล้วครับนาย
    <div className="p-1 md:p-4 font-sans animate-in fade-in duration-300">
      <div className="max-w-5xl mx-auto">
        
        {/* หัวข้อหลักของหน้าตั้งค่า */}
        <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-8 px-2">
          <button 
            type="button"
            onClick={() => {
                // สะกิดปุ่มล่องหนเปิด Sidebar บน Layout หลัก
                const layoutMenuBtn = document.querySelector('header button');
                if (layoutMenuBtn instanceof HTMLElement) {
                    layoutMenuBtn.click();
                }
            }} 
            className="w-11 h-11 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 active:scale-95 rounded-xl shadow-sm flex items-center justify-center transition-all duration-200 shrink-0"
            title="เปิดเมนูสไลด์บาร์"
          >
            {/* ไอคอนเครื่องปริ้นหลัก */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
          </button>

          <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">
            ตั้งค่าระบบ (Settings)
          </h1>
        </div>
        
        {/* ส่วนตั้งค่าเครื่องพิมพ์ */}
        <PrinterConfig />
        
      </div>
    </div>
  );
}