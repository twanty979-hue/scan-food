// components/ThemeShowcase.tsx
'use client';

import { useRef } from 'react';
// ⚠️ เช็ค path นี้ให้ถูกนะครับ (ว่า MarketplaceCard อยู่ที่ไหนแน่)
import MarketplaceCard from '@/app/dashboard/marketplace/components/MarketplaceCard'; 
import Link from 'next/link';

// ✅ แก้ไขฟังก์ชันดึงรูปภาพให้ตรงกับที่คุณเก็บจริง
const getImageUrl = (path: string) => {
  if (!path) return 'https://placehold.co/400x800/png?text=No+Image';
  if (path.startsWith('http')) return path;

  // 1. เช็คว่าชื่อ Bucket ของคุณชื่ออะไร? (ผมอิงจากโค้ด useMarketplace ที่คุณเคยส่งมา)
  // ถ้าชื่อ 'marketplace_assets' ให้แก้ตรงนี้
  const bucketName = 'theme-images'; 

  // 2. ปกติในโค้ดเก่ามีการเติม prefix 'themes/' ไหม? 
  // ถ้าไฟล์เก็บในโฟลเดอร์ themes ให้คงบรรทัดนี้ไว้
  // แต่ถ้าเก็บที่ root (ข้างนอกสุด) ให้แก้เป็น: const cleanPath = path;
  const cleanPath = path.startsWith('themes/') ? path : `themes/${path}`;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${cleanPath}`;
};

export default function ThemeShowcase({ themes }: { themes: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const scrollAmount = 320;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="relative group/slider">
      
      {/* ปุ่มเลื่อนซ้าย */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 z-20 bg-white hover:bg-blue-50 text-slate-700 p-3 rounded-full shadow-xl border border-slate-100 transition-all opacity-0 group-hover/slider:opacity-100 hidden md:block"
      >
        <i className="fa-solid fa-chevron-left text-lg"></i>
      </button>

      {/* Scrollable Area */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto py-10 px-4 snap-x snap-mandatory items-stretch"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
      >
        {themes.map((theme, index) => (
          <div 
            key={theme.id || theme.marketplace_theme_id || index} 
            className="flex-shrink-0 w-[260px] md:w-[280px] snap-center flex justify-center transform transition-transform hover:-translate-y-2 duration-300"
          >
            <MarketplaceCard
              theme={theme}
              isOwned={false}
              getImageUrl={getImageUrl} // ส่งฟังก์ชันที่แก้แล้วเข้าไป
              onClick={() => { window.location.href = '/register'; }}
            />
          </div>
        ))}

        {/* Card เชิญชวนใบสุดท้าย */}
        <div className="flex-shrink-0 w-[260px] md:w-[280px] snap-center flex flex-col justify-center items-center bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-blue-200 min-h-[500px] p-6 text-center hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer group/more">
          <Link href="/register" className="flex flex-col items-center w-full h-full justify-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover/more:scale-110 transition-transform shadow-inner">
               <i className="fa-solid fa-plus text-3xl"></i>
            </div>
            <h3 className="text-xl font-black text-slate-700">ดูธีมอีกเพียบ</h3>
            <p className="text-sm text-slate-500 mt-2">ในระบบสมาชิก</p>
          </Link>
        </div>
      </div>

      {/* ปุ่มเลื่อนขวา */}
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 z-20 bg-white hover:bg-blue-50 text-slate-700 p-3 rounded-full shadow-xl border border-slate-100 transition-all opacity-0 group-hover/slider:opacity-100 hidden md:block"
      >
        <i className="fa-solid fa-chevron-right text-lg"></i>
      </button>

    </div>
  );
}