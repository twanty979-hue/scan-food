// components/ThemeConfirmationModal.tsx
import React from 'react';

interface Props {
  isOpen: boolean;
  theme: any | null;
  onClose: () => void;
  onConfirm: () => void;
  isApplying: boolean;
  getImageUrl: (path: string | null) => string | null;
}

export default function ThemeConfirmationModal({ 
  isOpen, 
  theme, 
  onClose, 
  onConfirm, 
  isApplying,
  getImageUrl 
}: Props) {
  
  if (!isOpen || !theme) return null;

  const mkt = theme.marketplace_themes;
  const imageUrl = getImageUrl(mkt.image_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={!isApplying ? onClose : undefined} 
      />

      {/* Modal Box */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[500px] overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 flex justify-between items-center relative z-10">
          <h3 className="text-lg font-bold text-slate-800">ยืนยันการเปลี่ยนธีม</h3>
          {!isApplying && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <div className="flex items-center gap-8">
            
            {/* 📱 Mobile Mockup (ปรับสัดส่วนใหม่) */}
            <div className="flex-shrink-0 select-none">
                {/* ✅ ปรับแก้:
                   1. ขยาย w-[80px] -> w-[100px] ให้ดูเต็มตาขึ้น
                   2. ลด Border เหลือ 2px ให้ดูบางลง
                   3. ใส่ Shadow ให้ดูลอยมีมิติ
                */}
                <div className="relative w-[100px] aspect-[9/19.5] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)] rounded-[1.5rem] bg-gray-800 border-[2px] border-gray-600/50 p-[1px]">
                    
                    {/* Screen Container */}
                    <div className="relative w-full h-full bg-black rounded-[1.3rem] overflow-hidden ring-1 ring-black/50">
                        
                        {/* Dynamic Island (ปรับให้เล็กลงสมส่วน) */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[30%] h-[10px] bg-black rounded-full z-20 flex items-center justify-center pointer-events-none">
                            <div className="w-[30%] h-[30%] bg-[#222] rounded-full"></div>
                        </div>

                        {/* Image Layer */}
                        {imageUrl ? (
                            <img 
                                src={imageUrl} 
                                alt={mkt.name} 
                                className="w-full h-full object-cover object-top" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 font-bold text-2xl">
                                {mkt.name.charAt(0)}
                            </div>
                        )}

                        {/* Glass Reflection Effect (เงาหน้าจอ) */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none opacity-50 rounded-[1.3rem]"></div>
                        
                        {/* Home Indicator */}
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[35%] h-[2px] bg-white/40 rounded-full z-20 backdrop-blur-sm"></div>
                    </div>
                </div>
            </div>

           {/* Text Details */}
            <div className="flex-1 min-w-0">
              <p className="text-slate-500 text-xs mb-1.5 font-medium">คุณต้องการเปิดใช้งานธีมนี้ใช่หรือไม่?</p>
              
              {/* ชื่อธีม */}
              <h4 className="text-2xl font-black text-slate-800 leading-tight truncate mb-2">{mkt.name}</h4>
              
              {/* ✅ แสดง Description จากฐานข้อมูลตรงนี้เลยครับ */}
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                 {mkt.description || '-'}
              </p>
            
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            disabled={isApplying}
            className="px-5 py-2.5 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button 
            onClick={onConfirm}
            disabled={isApplying}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/40 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isApplying ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังบันทึก...
              </>
            ) : (
              'ยืนยันการใช้ธีม'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}