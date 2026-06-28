import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // เมนูตามโครงสร้างในโฟลเดอร์ admin
  const menuItems = [
    { name: 'adphoto', href: '/admin/adphoto' },
    { name: 'brands', href: '/admin/brands' },
    { name: 'marketplace-categories', href: '/admin/marketplace-categories' },
    { name: 'marketplace-themes', href: '/admin/marketplace-themes' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F4F7F4] text-[#1E3A27] font-sans">
      {/* Sidebar - โทนสีเขียวอ่อนนวลๆ (Soft Sage Green) */}
      <aside className="w-64 bg-[#E2ECE2] border-r border-[#D0DDD0] flex flex-col justify-between">
        <div className="p-6">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-[#5F8565] flex items-center justify-center text-white font-bold">
              🌿
            </div>
            <span className="text-xl font-bold tracking-wide text-[#2C4A34]">
              Admin Portal
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#7A9A80] mb-3 px-3">
              admin
            </div>
            
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-[#3B5E44] hover:bg-[#D5E4D5] hover:text-[#1E3A27] font-medium text-sm group"
                  >
                    {/* Folder Icon จำลอง */}
                    <svg
                      className="w-5 h-5 text-[#8FAF96] group-hover:text-[#5F8565] transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Sidebar Footer / User Profile สวยๆ */}
        <div className="p-4 border-t border-[#D0DDD0] bg-[#DBE6DB]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5F8565] flex items-center justify-center text-white font-semibold">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#2C4A34] truncate">Admin Dashboard</p>
              <p className="text-[10px] text-[#608367] truncate">admin@foodscan.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - พื้นหลังสีครีม (Warm Cream/Ivory) */}
      <div className="flex-1 flex flex-col bg-[#FAF9F5]">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#EFECE6] bg-white flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-lg font-semibold text-[#2C4A34]">
            Product Management
          </h1>
          <div className="flex items-center gap-4">
            {/* Status Bar / Search Box หรือปุ่มอื่นๆ */}
            <span className="text-xs bg-[#E2ECE2] text-[#3B5E44] px-3 py-1 rounded-full font-medium">
              Environment: Local
            </span>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-sm min-h-[calc(100vh-8rem)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}