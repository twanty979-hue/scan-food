// app/dashboard/inventory/loading.tsx
import React from 'react';

export default function InventoryLoading() {
  return (
    <div className="fixed inset-0 z-[99999] bg-[#F8FAFC]/90 backdrop-blur-xs flex flex-col items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white px-8 py-6 rounded-[24px] shadow-2xl border border-slate-100/80 flex flex-col items-center gap-4">
        
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
          {/* ✅ จุดที่แก้: เติม animate-spin ลงไปตรงท้ายคลาสนี้เพื่อให้มันหมุนครับนาย! */}
          <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div className="text-center space-y-1">
          <p className="text-base font-black text-slate-800 tracking-tight">กำลังโหลดข้อมูลคลัง...</p>
          <p className="text-xs font-bold text-slate-400">กรุณารอสักครู่ครับนาย</p>
        </div>
        
      </div>
    </div>
  );
}