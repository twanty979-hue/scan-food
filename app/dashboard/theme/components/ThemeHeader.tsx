'use client';

import { IconGrid, IconHistory } from './ThemeIcons';

interface ThemeHeaderProps {
  activeTab: 'active' | 'history';
  setActiveTab: (tab: 'active' | 'history') => void;
  expiredCount: number;
  lifetimeCount: number;
  filterLifetime: boolean;
  toggleLifetimeFilter: () => void;
}

const IconCrown = ({ size = 12, className = "" }: any) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>
);

export default function ThemeHeader({ 
  activeTab, setActiveTab, expiredCount, lifetimeCount, 
  filterLifetime, toggleLifetimeFilter 
}: ThemeHeaderProps) {
  return (
    /* ✅ ปรับ px-6 และ md:px-10 เพื่อให้ชิดขอบซ้าย-ขวาเท่าเดิม ไม่เบียดเข้ากลาง */
    <div className="w-full bg-[#f8fafc] pt-4 md:pt-10 pb-2 md:pb-6 px-6 md:px-10 border-none">
      
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
          
          {/* 🌟 ปรับตรงนี้: แปลงกลุ่มหัวข้อด้านซ้ายให้เป็นปุ่มกดสั่งกางสไลด์บาร์ผ่านระบบไร้สาย */}
          <button
            type="button"
            onClick={() => {
              // สัญญาณไร้สาย: วิ่งไปสะกิดสั่งคลิกปุ่มเปิดเมนูหลักของแผง Layout ให้กางแผง Sidebar ทันที
              const layoutMenuBtn = document.querySelector('header button');
              if (layoutMenuBtn instanceof HTMLElement) {
                layoutMenuBtn.click();
              }
            }}
            className="flex flex-col items-start w-full md:w-auto text-left group active:scale-[0.98] transition-transform duration-200 focus:outline-none"
            title="เปิดเมนูสไลด์บาร์"
          > 
              {/* ตัวอักษร MY THEMES ไฮไลท์เปลี่ยนเป็นสีน้ำเงินเวลาเอานิ้วไปจิ้มหรือเมาส์ Hover */}
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none group-hover:text-blue-600 transition-colors duration-200">
                MY THEMES
              </h1>
              
              <div className="flex items-center gap-3 mt-2 md:mt-3">
                <p className="text-[10px] md:text-[11px] font-bold text-slate-400 group-hover:text-blue-400 transition-colors duration-200 uppercase tracking-[0.2em]">
                  MANAGED COLLECTION
                </p>
                
                {/* 👑 ปุ่มกรองสิทธิ์ Lifetime ตัวเดิม (ครอบห้ามปุ่มซ้อนปุ่ม เพื่อไม่ให้ Logic พัง) */}
                {lifetimeCount > 0 && (
                    <span 
                        onClick={(e) => {
                          // หยุดสัญญาณการกดไม่ให้วิ่งไปเปิด Sidebar ซ้อนกัน
                          e.stopPropagation(); 
                          toggleLifetimeFilter();
                        }}
                        className={`inline-flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase px-3 py-1 rounded-full border transition-all duration-200 active:scale-95 cursor-pointer select-none ${filterLifetime ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-100' : 'bg-white text-amber-600 border-amber-100 hover:border-amber-300 hover:bg-amber-50 shadow-sm'}`}
                    >
                        <IconCrown size={12} className={filterLifetime ? "stroke-white" : "stroke-amber-600"} />
                        {filterLifetime ? `SHOWING ${lifetimeCount}` : `${lifetimeCount} LIFETIME`}
                    </span>
                )}
              </div>
          </button>
          
          {/* แถบสลับหน้าจอ Active / History ฝั่งขวาคงเดิมไว้ร้อยเปอร์เซ็นต์ครับ */}
          <div className="flex w-full md:w-auto bg-slate-200/50 p-1.5 rounded-full relative"> 
              <button 
                  type="button"
                  onClick={() => setActiveTab('active')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 md:px-8 py-2 md:py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <IconGrid size={16} /> Active
              </button>
              
              <button 
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 md:px-8 py-2 md:py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 relative ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <IconHistory size={16} /> History
                  {expiredCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white shadow-sm font-bold border-2 border-white animate-bounce">
                          {expiredCount}
                      </span>
                  )}
              </button>
          </div>
      </div>
    </div>
  );
}