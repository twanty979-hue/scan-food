// app/dashboard/inventory/overview/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getInventoryOverviewAction } from '@/app/actions/stockActions';
import { usePayment } from '@/hooks/usePayment';

// --- Icons ---
const IconArrowLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconBox = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const IconAlert = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const IconXCircle = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const IconActivity = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const IconRefresh = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>;
const IconWallet = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>;
const IconTrendingDown = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>;

export default function InventoryOverviewPage() {
    const router = useRouter();
    const { currentBrand } = usePayment();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        stats: { totalSKUs: 0, totalItems: 0, lowStockCount: 0, outOfStockCount: 0, totalValue: 0, lostValue: 0, lostItemsCount: 0 },
        recentTransactions: [] as any[]
    });

    useEffect(() => { setMounted(true); }, []);

    const fetchOverview = async () => {
        if (!currentBrand?.id) return;
        setLoading(true);
        const res = await getInventoryOverviewAction(currentBrand.id);
        if (res.success) {
            setData(res as any);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (mounted && currentBrand?.id) {
            fetchOverview();
        }
    }, [currentBrand, mounted]);

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) + ' ' + 
               date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    };

    // ฟังก์ชันแปลงตัวเลขเป็นเงิน (เช่น 19 -> ฿19.00)
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount);
    };

    if (!mounted) return null;

    // คำนวณเปอร์เซ็นต์สำหรับหลอดพลังคลังสินค้า
    const totalStatus = data.stats.totalSKUs || 1; 
    const outPercent = (data.stats.outOfStockCount / totalStatus) * 100;
    const lowPercent = (data.stats.lowStockCount / totalStatus) * 100;
    const goodPercent = 100 - outPercent - lowPercent;

    return (
        <div className="fixed inset-0 z-[9999] bg-[#F8FAFC] font-sans overflow-hidden flex flex-col" suppressHydrationWarning>
            
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-slate-200 shadow-sm relative z-20 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/inventory')} className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-all active:scale-90"><IconArrowLeft /></button>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 leading-tight">ภาพรวมคลังสินค้า</h1>
                        <p className="text-[11px] font-medium text-slate-500">Dashboard Analytics</p>
                    </div>
                </div>
                <button onClick={fetchOverview} className={`w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-50 rounded-full active:scale-90 transition-all ${loading ? 'animate-spin' : ''}`}>
                    <IconRefresh />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* 🌟 1. การ์ดแสดงมูลค่าเงิน (Financial Stats) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* มูลค่าพร้อมขาย */}
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-[28px] shadow-lg shadow-emerald-500/20 text-white relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10"><IconWallet /></div>
                            <div className="flex items-center gap-2 mb-2 opacity-90">
                                <IconBox />
                                <h2 className="text-sm font-bold uppercase tracking-wider">มูลค่าสินค้าพร้อมขาย</h2>
                            </div>
                            <p className="text-4xl md:text-5xl font-black tracking-tighter mb-1">
                                {loading ? '...' : formatCurrency(data.stats.totalValue)}
                            </p>
                            <p className="text-xs font-medium text-emerald-100">
                                จากจำนวนทั้งหมด {data.stats.totalItems} ชิ้น ({data.stats.totalSKUs} SKU)
                            </p>
                        </div>

                        {/* มูลค่าที่หายไป */}
                        <div className="bg-gradient-to-br from-rose-500 to-red-600 p-6 rounded-[28px] shadow-lg shadow-rose-500/20 text-white relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10"><IconTrendingDown /></div>
                            <div className="flex items-center gap-2 mb-2 opacity-90">
                                <IconAlert />
                                <h2 className="text-sm font-bold uppercase tracking-wider">มูลค่าที่สูญหาย / ชำรุด</h2>
                            </div>
                            <p className="text-4xl md:text-5xl font-black tracking-tighter mb-1">
                                {loading ? '...' : formatCurrency(data.stats.lostValue)}
                            </p>
                            <p className="text-xs font-medium text-rose-100">
                                รวมจำนวนของที่ถูกตัดทิ้ง {data.stats.lostItemsCount} ชิ้น
                            </p>
                        </div>
                    </div>

                    {/* 🌟 2. แจ้งเตือนสถานะสินค้า */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 relative hover:border-orange-300 transition-colors">
                            <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-3"><IconAlert /></div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">สินค้าใกล้หมด</p>
                            <p className="text-3xl font-black text-slate-800">{loading ? '-' : data.stats.lowStockCount}</p>
                        </div>
                        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 relative hover:border-rose-300 transition-colors">
                            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-3"><IconXCircle /></div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">หมดสต็อก</p>
                            <p className="text-3xl font-black text-slate-800">{loading ? '-' : data.stats.outOfStockCount}</p>
                        </div>
                    </div>

                    {/* 🌟 3. Health Bar (สถานะสุขภาพคลัง) */}
                    <div className="bg-white p-5 md:p-6 rounded-[24px] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-end mb-4">
                            <h2 className="font-bold text-slate-800">สุขภาพคลังสินค้า (Stock Health)</h2>
                        </div>
                        {loading ? (
                            <div className="h-4 bg-slate-100 rounded-full animate-pulse"></div>
                        ) : (
                            <>
                                {/* หลอดพลัง */}
                                <div className="h-5 flex rounded-full overflow-hidden mb-4 bg-slate-100">
                                    <div style={{ width: `${goodPercent}%` }} className="bg-emerald-500 transition-all duration-1000"></div>
                                    <div style={{ width: `${lowPercent}%` }} className="bg-orange-400 transition-all duration-1000 delay-300"></div>
                                    <div style={{ width: `${outPercent}%` }} className="bg-rose-500 transition-all duration-1000 delay-500"></div>
                                </div>
                                {/* คำอธิบายหลอดพลัง */}
                                <div className="flex gap-5 text-xs font-bold">
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-slate-600">ปกติ ({goodPercent.toFixed(0)}%)</span></div>
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-400"></span><span className="text-slate-600">ใกล้หมด ({lowPercent.toFixed(0)}%)</span></div>
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span><span className="text-slate-600">หมด ({outPercent.toFixed(0)}%)</span></div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* 🌟 4. ความเคลื่อนไหวล่าสุด */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 px-1 mt-2">
                            <div className="text-blue-600"><IconActivity /></div>
                            <h2 className="font-black text-slate-800 text-lg">รายการรับเข้าล่าสุด</h2>
                        </div>

                        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="p-8 space-y-4">
                                    {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse"></div>)}
                                </div>
                            ) : data.recentTransactions.length === 0 ? (
                                <div className="p-10 text-center text-slate-400 font-bold text-sm">ยังไม่มีความเคลื่อนไหว</div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {data.recentTransactions.map((tx, index) => (
                                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors animate-in fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{tx.ref_no || 'ไม่มีเลขที่อ้างอิง'}</p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">{tx.note || 'รับสินค้าเข้าสต็อก'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-400">{formatTime(tx.created_at)}</p>
                                                <span className="inline-block mt-1 bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded font-bold uppercase">นำเข้า (IN)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}