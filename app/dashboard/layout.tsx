'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// ✅ Config: Base URL
const CDN_AVATAR_URL = "https://xvhibjejvbriotfpunvv.supabase.co/storage/v1/object/public/avatars/";
const CDN_BRAND_URL = "https://xvhibjejvbriotfpunvv.supabase.co/storage/v1/object/public/brands/";

// --- 🎨 Custom Icons (Same as before) ---
const IconMenu = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>;
const IconX = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconChef = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.8a4.41 4.41 0 1 1 2.5-7.6 5 5 0 1 1 7 0 4.41 4.41 0 1 1 2.5 7.6 4.4 4.4 0 0 1-12 0Z"/><path d="M6 17h12"/><path d="M6.5 21h11"/></svg>;
const IconGrid = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>;
const IconTable = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 21v-7"/><path d="M17.5 21v-7"/><path d="M2 14h20"/><path d="M4 10h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2z"/></svg>;
const IconList = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconUtensils = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>;
const IconImage = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IconHistory = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>;
const IconTag = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IconLogOut = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconUser = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconSettings = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconShoppingBag = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IconPalette = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [brand, setBrand] = useState<any>(null);

  // ✅ Check if it's the Marketplace Detail page (to hide everything if needed)
  const isMarketplaceDetail = /^\/dashboard\/marketplace\/[^/]+$/.test(pathname);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      const { data } = await supabase.from('profiles').select('*, brands(*)').eq('id', user.id).single();
      if (data) { setProfile(data); setBrand(data.brands); }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const getAvatarUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${CDN_AVATAR_URL}${path}`;
  };

  const getBrandLogoUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${CDN_BRAND_URL}${brand?.id}/${path}`;
  };

  const isOwner = profile?.role === 'owner';

  const navItems = [
    { name: 'คิดเงิน (POS)', href: '/dashboard/pai_order', icon: IconGrid },
    { name: 'ออเดอร์ (ครัว)', href: '/dashboard/orders', icon: IconChef },
    { name: 'จัดการโต๊ะ', href: '/dashboard/tables', icon: IconTable, ownerOnly: true},
    { name: 'ประวัติการขาย', href: '/dashboard/receipts', icon: IconHistory },
    
    { name: '--- จัดการร้าน ---', href: '#', icon: null, separator: true, ownerOnly: true },
    { name: 'ส่วนลด/โปรฯ', href: '/dashboard/discounts', icon: IconTag, ownerOnly: true },
    { name: 'เมนูอาหาร', href: '/dashboard/products', icon: IconUtensils, ownerOnly: true },
    { name: 'หมวดหมู่', href: '/dashboard/categories', icon: IconList, ownerOnly: true },
    { name: 'แบนเนอร์', href: '/dashboard/banners', icon: IconImage, ownerOnly: true },
    { name: 'ตั้งค่าร้าน', href: '/dashboard/settings', icon: IconSettings, ownerOnly: true },

    { name: '--- ธีมร้านค้า ---', href: '#', icon: null, separator: true },
    { name: 'เลือกธีมร้าน', href: '/dashboard/theme', icon: IconPalette, isMagic: true }, 
    { name: 'Marketplace', href: '/dashboard/marketplace', icon: IconShoppingBag, isGold: true },
    
    { name: '--- ส่วนตัว ---', href: '#', icon: null, separator: true },
    { name: 'โปรไฟล์', href: '/dashboard/profile', icon: IconUser },
  ];

  // ✅ If on the detail page, render children directly (full screen)
  if (isMarketplaceDetail) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. Backdrop (Visible when sidebar is open on any screen size) */}
      <div 
        className={`fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* 2. Sidebar (Hidden by default, slides in when toggled) */}
      <aside className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transition-transform duration-300 ease-out shadow-2xl border-r border-slate-100 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-200 overflow-hidden">
                {brand?.logo_url ? <img src={getBrandLogoUrl(brand.logo_url) ?? ''} className="w-full h-full object-cover" /> : (brand?.name ? brand.name.charAt(0).toUpperCase() : 'B')}
            </div>
            <div className="overflow-hidden">
              <h1 className="font-black text-xl truncate w-36 text-slate-800">{brand?.name || 'Loading...'}</h1>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Management System</p>
            </div>
          </div>
          {/* Close Button */}
          <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-xl">
            <IconX size={28} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {navItems.map((item: any, idx) => {
            if (item.ownerOnly && !isOwner) return null;

            return item.separator ? (
              <div key={idx} className="my-6 flex items-center gap-4 mx-4">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.name.replace(/---/g, '')}</span>
                  <div className="h-px bg-slate-100 flex-1"></div>
              </div>
            ) : (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group font-bold text-base relative overflow-hidden shrink-0
                  ${
                    item.isMagic 
                    ? 'bg-gradient-to-br from-[#4a00e0] to-[#8e2de2] text-white shadow-lg shadow-purple-500/30 hover:scale-105 border border-purple-400/20'
                    : item.isGold 
                    ? 'bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-700 shadow-md shadow-amber-100 border border-amber-200 hover:scale-105' 
                    : pathname === item.href 
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                  }`}
              >
                {item.isMagic && (
                    <>
                        <div className="absolute top-1 right-2 text-[10px] opacity-70 animate-pulse">✨</div>
                        <div className="absolute bottom-2 left-2 text-[8px] opacity-50 animate-pulse delay-75">★</div>
                    </>
                )}
                <div className={`transition-transform duration-200 ${pathname === item.href ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon && <item.icon size={24} />}
                </div>
                <span className={item.isGold || item.isMagic ? 'font-black tracking-wide' : ''}>{item.name}</span>
                {item.isGold && <span className="ml-auto bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">NEW</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-6 border-t border-slate-50 bg-white shrink-0">
          <div className="flex items-center gap-4 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-400 overflow-hidden border border-slate-200 shadow-sm">
              {profile?.avatar_url ? <img src={getAvatarUrl(profile.avatar_url) ?? ''} className="w-full h-full object-cover" /> : <IconUser size={24} />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black text-slate-800 truncate">{profile?.full_name || 'User'}</p>
              <p className="text-[10px] text-blue-500 uppercase font-bold tracking-wider truncate">{profile?.role || 'Staff'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full py-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
            <IconLogOut size={18} /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* 3. Main Content */}
      {/* ✅ Remove pl-80 so content is full width by default */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 w-full"> 
        <header className="bg-white border-b border-slate-100 p-5 sticky top-0 z-30 flex items-center justify-between shadow-sm/30 backdrop-blur-md bg-white/80">
          <div className="flex items-center gap-4">
            {/* Toggle Button: Always visible now */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-3 rounded-2xl bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm border border-slate-200 active:scale-95"
            >
              <IconMenu size={28} />
            </button>
            <div className="flex flex-col">
               <h1 className="font-black text-slate-800 text-xl leading-none tracking-tight">{brand?.name || 'Store Dashboard'}</h1>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Management Panel</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
             <div className="text-right">
                <p className="text-sm font-bold text-slate-700">{profile?.full_name}</p>
                <p className="text-[10px] text-green-500 uppercase font-black bg-green-50 px-2 py-0.5 rounded-full inline-block mt-0.5">Online</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                {profile?.avatar_url ? <img src={getAvatarUrl(profile.avatar_url) ?? ''} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><IconUser size={20}/></div>}
             </div>
          </div>
        </header>
        <main className="flex-1 w-full bg-slate-50/50">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}