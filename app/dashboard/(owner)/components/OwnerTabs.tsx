'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

// --- Icons (คงเดิม) ---
const IconFood = ({ size = 20 }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>);
const IconCategory = ({ size = 20 }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z"/><path d="M12 10v6"/><path d="M9 13h6"/></svg>);
const IconTable = ({ size = 20 }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="13" width="20" height="2" rx="1" /><path d="M5 15v6" /><path d="M19 15v6" /><path d="M12 4v6" /><path d="M9 7h6" /></svg>);
const IconBanner = ({ size = 20 }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/><path d="M18 6h3" /><path d="M19.5 4.5v3" /></svg>);

export default function OwnerTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: 'เมนูอาหาร', href: '/dashboard/products', icon: IconFood },
    { name: 'สินค้าหลัก', href: '/dashboard/product_master', icon: IconCategory },
    { name: 'จัดการโต๊ะ', href: '/dashboard/tables', icon: IconTable },
    { name: 'แบนเนอร์', href: '/dashboard/banners', icon: IconBanner },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* ใช้ grid grid-cols-3 เพื่อแบ่งสัดส่วนหน้าจอคอมให้สมมาตร (ซ้าย ปุ่มเมนู / กลาง แผงแท็บ / ขวา กล่องเปล่าบาลานซ์) */}
        <div className="flex flex-col md:grid md:grid-cols-3 items-center py-2 relative gap-3 md:gap-0">
          
          {/* 🍔 1. ฝั่งซ้าย: ปุ่มแฮมเบอร์เกอร์ 3 ขีด */}
          <div className="flex items-center w-full md:w-auto justify-start shrink-0">
            <button 
              type="button"
              onClick={() => {
                const layoutMenuBtn = document.querySelector('header button');
                if (layoutMenuBtn instanceof HTMLElement) {
                  layoutMenuBtn.click();
                }
              }} 
              className="h-11 aspect-square bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300 active:scale-95 rounded-xl shadow-sm flex items-center justify-center transition-all duration-200"
              title="เปิดเมนูสไลด์บาร์"
            >
              <span className="w-5 h-5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </span>
            </button>
          </div>

          {/* 📑 2. ฝั่งตรงกลาง: แผงปุ่มสไลด์แท็บรายการ (จัดเซ็นเตอร์สวยงาม ไม่ติดซ้ายแล้วครับนาย) */}
          <div className="w-full md:w-auto flex justify-center items-center">
            <div className="grid grid-cols-4 md:flex gap-1 md:gap-2 h-11 items-center w-full md:w-max">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                
                return (
                  <Link 
                    key={tab.href} 
                    href={tab.href}
                    onClick={() => {
                      // ⚡ สะกิดเรียกใช้สัญญาณเปิดหน้า Loading ในหน้า Layout หลักครับนาย
                      if (pathname !== tab.href) {
                        // ค้นหาฟังก์ชันหรือสร้าง Event สั่งงานล่องหน
                        window.dispatchEvent(new CustomEvent('nav-start'));
                        // หากมีปุ่มเมนูหลักใน layout คอยรับ State สามารถใช้คลาสหลอกเพื่อความชัวร์ได้ครับ
                        const layoutMenu = document.querySelector('nav');
                        if (layoutMenu) {
                           // สั่งจำลองการเริ่มดาวน์โหลดหน้าเว็บ
                           document.documentElement.dispatchEvent(new Event('change-page-loading'));
                        }
                      }
                    }}
                    className={`
                      relative flex items-center justify-center gap-2 h-full px-2 py-3 md:px-6 rounded-xl transition-colors duration-300 flex-1 md:flex-none whitespace-nowrap
                      ${isActive ? 'text-white font-black' : 'text-slate-500 hover:text-blue-600 font-bold'}
                    `}
                  >
                    {/* ✅ ตัวสไลด์ (Active Indicator) */}
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-blue-600 shadow-md shadow-blue-600/10"
                        style={{ borderRadius: '12px' }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 400, 
                          damping: 30 
                        }}
                      />
                    )}

                    {/* เนื้อหาด้านในใส่ relative z-10 เพื่อให้อยู่เหนือตัวสไลด์สีน้ำเงิน */}
                    <span className="relative z-10 flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm">
                      <tab.icon size={18} />
                      <span className="hidden md:block">
                        {tab.name}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 📦 3. ฝั่งขวา: กล่องเปล่าสำหรับบาลานซ์ Grid (ทำให้แผงแท็บอยู่ตรงกลางเป๊ะ) */}
          <div className="hidden md:block"></div>

        </div>

      </div>
    </div>
  );
}