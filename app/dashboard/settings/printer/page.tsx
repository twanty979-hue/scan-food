// app/dashboard/settings/page.tsx
import React from 'react';
import PrinterConfig from '../../components/PrinterConfig';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">ตั้งค่าระบบ (Settings)</h1>
        
        {/* แสดงส่วนตั้งค่าเครื่องพิมพ์ */}
        <PrinterConfig />
        
        {/* ในอนาคตนายสามารถเพิ่ม Component ตั้งค่าอื่นๆ ต่อตรงนี้ได้เลยครับ */}
      </div>
    </div>
  );
}