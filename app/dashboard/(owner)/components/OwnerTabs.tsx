'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// --- Icons ชุดเดิม ---
const IconFood = ({ size = 20 }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>);
const IconCategory = ({ size = 20 }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z"/><path d="M12 10v6"/><path d="M9 13h6"/></svg>);
const IconTable = ({ size = 20 }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="13" width="20" height="2" rx="1" /><path d="M5 15v6" /><path d="M19 15v6" /><path d="M12 4v6" /><path d="M9 7h6" /></svg>);
const IconBanner = ({ size = 20 }: any) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/><path d="M18 6h3" /><path d="M19.5 4.5v3" /></svg>);

export default function OwnerTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: 'เมนูอาหาร', href: '/dashboard/products', icon: IconFood },
    { name: 'หมวดหมู่', href: '/dashboard/categories', icon: IconCategory },
    { name: 'จัดการโต๊ะ', href: '/dashboard/tables', icon: IconTable },
    { name: 'แบนเนอร์', href: '/dashboard/banners', icon: IconBanner },
  ];

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-2 md:px-6">
        
        {/* ใช้ Grid เพื่อแบ่งพื้นที่เท่าๆ กันในมือถือ */}
        <div className="grid grid-cols-4 md:flex md:justify-center gap-1 md:gap-4 py-2">
          
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link 
                key={tab.href} 
                href={tab.href}
                className={`
                  flex items-center justify-center gap-2 px-2 py-3 md:px-5 md:py-2.5 rounded-xl transition-all
                  ${isActive 
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' 
                    : 'bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }
                `}
                title={tab.name} // เพิ่ม Tooltip เวลาเอาเมาส์ชี้
              >
                {/* ไอคอนแสดงตลอด */}
                <tab.icon size={22} className={isActive ? 'text-white' : 'text-current'} />
                
                {/* ✅ ข้อความ: ซ่อนในมือถือ (hidden), แสดงในจอคอม (md:block) */}
                <span className="hidden md:block font-bold text-sm">
                   {tab.name}
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}