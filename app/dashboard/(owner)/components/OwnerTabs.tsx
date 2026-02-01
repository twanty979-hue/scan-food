'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// --- ✨ Custom Icons (ชุด Minimal Plus +) ---

// 1. เมนูอาหาร (สี่เหลี่ยม + บวก) **อันที่คุณชอบ**
const IconFood = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/>
    <path d="M12 8v8"/>
    <path d="M8 12h8"/>
  </svg>
);

// 2. หมวดหมู่ (โฟลเดอร์ + บวก) ✅ แก้ใหม่: ดูเป็นหมวดหมู่ชัดเจน
const IconCategory = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* ตัวโฟลเดอร์ */}
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z"/>
    {/* เครื่องหมายบวกตรงกลาง */}
    <path d="M12 10v6"/>
    <path d="M9 13h6"/>
  </svg>
);

// 3. จัดการโต๊ะ (โต๊ะขาคู่ + บวก) ✅ แก้ใหม่: ดูเป็นโต๊ะมากขึ้น
const IconTable = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* หน้าโต๊ะ (สี่เหลี่ยมผืนผ้าแนวนอน) */}
    <rect x="2" y="13" width="20" height="2" rx="1" />
    {/* ขาโต๊ะ 2 ข้าง */}
    <path d="M5 15v6" />
    <path d="M19 15v6" />
    {/* เครื่องหมายบวก ลอยอยู่บนโต๊ะ */}
    <path d="M12 4v6" />
    <path d="M9 7h6" />
  </svg>
);

// 4. แบนเนอร์ (กรอบรูป + บวก)
const IconBanner = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* กรอบนอก */}
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    {/* ภูเขา/รูปภาพ */}
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
    {/* เครื่องหมายบวก มุมขวาบน */}
    <path d="M18 6h3" />
    <path d="M19.5 4.5v3" />
  </svg>
);

export default function OwnerTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: 'เมนูอาหาร', href: '/dashboard/products', icon: IconFood },
    { name: 'หมวดหมู่', href: '/dashboard/categories', icon: IconCategory },
    { name: 'จัดการโต๊ะ', href: '/dashboard/tables', icon: IconTable },
    { name: 'แบนเนอร์', href: '/dashboard/banners', icon: IconBanner },
  ];

  return (
    // ... ส่วนนี้เหมือนเดิมครับ ...
    <div className="w-full bg-white">
      <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar pb-0 max-w-7xl mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link 
              key={tab.href} 
              href={tab.href}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-t-2xl font-bold text-sm transition-all border-b-[3px] whitespace-nowrap
                ${isActive 
                  ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50' 
                  : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                }
              `}
            >
              <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                <tab.icon size={20} /> 
              </span>
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}