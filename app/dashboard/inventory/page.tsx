// app/dashboard/inventory/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- Icons ---
const IconArrowLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconBox = () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const IconDownload = () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IconHistory = () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline><path d="M3.3 7a9 9 0 1 1 0 10"></path><polyline points="2 6 3.4 7 4.5 5.7"></polyline></svg>;
const IconSettings = () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"></path><path d="M12 14V8"></path><path d="M12 18h.01"></path><path d="M4.93 4.93l.01.01"></path><path d="M19.07 4.93l.01.01"></path><path d="M14.83 14.83l.01.01"></path></svg>;
const IconChart = () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
const IconArrowRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;

export default function InventoryMenuPage() {
    const router = useRouter();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const menuItems = [
        {
            title: "สรุปภาพรวมคลัง",
            desc: "สถิติสินค้าขายดี และยอดสต็อกรวม",
            icon: <IconChart />,
            bgColor: "bg-emerald-50",
            iconColor: "text-emerald-500",
            path: "/dashboard/inventory/overview"
        },
        {
            title: "รายการสินค้าคงเหลือ",
            desc: "เช็คจำนวนปัจจุบันและสินค้าใกล้หมด",
            icon: <IconBox />,
            bgColor: "bg-blue-50",
            iconColor: "text-blue-500",
            path: "/dashboard/inventory/list"
        },
        {
            title: "ประวัติการนำเข้า",
            desc: "ตรวจสอบล็อตการรับของย้อนหลัง",
            icon: <IconHistory />,
            bgColor: "bg-purple-50",
            iconColor: "text-purple-500",
            path: "/dashboard/inventory/history"
        },
        {
            title: "ปรับปรุง/ของเสีย",
            desc: "ตัดสต็อกสินค้าเสียหาย หรือปรับยอด",
            icon: <IconSettings />,
            bgColor: "bg-slate-100",
            iconColor: "text-slate-600",
            path: "/dashboard/inventory/adjustment"
        }
    ];

    if (!hasMounted) return null;

    return (
        // 🌟 ใช้ fixed inset-0 z-[9999] เพื่อให้ทับ Layout เดิมทั้งหมด
        <div className="fixed inset-0 z-[9999] bg-[#F8FAFC] font-sans overflow-y-auto pb-10">
            
            {/* Header Hero Section */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-900 px-6 py-10 md:py-14 md:px-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"></div>
                
                <div className="max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-4 mb-4">
                        {/* 🌟 ปุ่ม Back สำหรับกลับหน้า Dashboard หลัก */}
                        <button 
                            onClick={() => router.push('/dashboard')} 
                            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all active:scale-90 border border-white/20"
                        >
                            <IconArrowLeft />
                        </button>
                        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                            จัดการคลังสินค้า
                        </h1>
                    </div>
                    <p className="text-blue-100 font-medium text-sm md:text-lg pl-14">
                        ระบบจัดการสต็อกแบบ Real-time แม่นยำทุกรายการ
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto p-4 md:p-8 -mt-6 md:-mt-8 relative z-20 space-y-4 md:space-y-6">
                
                {/* 🌟 ปุ่มยักษ์ รับสินค้าเข้า (Stock In) */}
                <button
                    onClick={() => router.push('/dashboard/inventory/stock-in')}
                    className="w-full bg-white p-6 md:p-8 rounded-[32px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border-2 border-transparent hover:border-blue-500 transition-all duration-300 group active:scale-[0.98] text-left flex items-center justify-between overflow-hidden relative animate-in fade-in zoom-in-95 duration-500"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-50"></div>
                    
                    <div className="flex items-center gap-5 md:gap-6 relative z-10">
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shrink-0 p-3.5 md:p-5">
                            <IconDownload />
                        </div>
                        <div>
                            <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest mb-1 animate-pulse">Scan Now</span>
                            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">รับสินค้าเข้าสต็อก</h2>
                            <p className="text-slate-500 text-xs md:text-base font-medium mt-0.5">ใช้ปืนสแกนเพิ่มสินค้าใหม่เข้าคลัง</p>
                        </div>
                    </div>
                    
                    
                </button>

                {/* 🌟 เมนูอื่นๆ Grid 2 คอลัมน์ */}
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => router.push(item.path)}
                            className="bg-white p-5 md:p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 text-left active:scale-[0.96] group flex flex-col h-full animate-in fade-in zoom-in-95"
                            style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-11 h-11 md:w-14 md:h-14 ${item.bgColor} ${item.iconColor} rounded-[16px] flex items-center justify-center p-2.5 md:p-3.5 group-hover:scale-110 transition-transform duration-300`}>
                                    {item.icon}
                                </div>
                                <div className="text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                                    <IconArrowRight />
                                </div>
                            </div>

                            <div className="mt-auto">
                                <h3 className="text-[13px] md:text-lg font-black text-slate-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-slate-400 text-[10px] md:text-xs font-medium line-clamp-2">
                                    {item.desc}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}