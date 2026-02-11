'use client';

import { useState, useEffect } from 'react';
import { useReceipts } from '@/hooks/useReceipts';
import ReceiptModal from './components/ReceiptModal';

// --- Icons ---
const IconHistory = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>;
const IconFileText = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconStore = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21v-7"/><path d="M19 21v-7"/><path d="M2 10l20 0"/><path d="M2 10l2-4h16l2 4"/></svg>;
const IconUser = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconAlert = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconChevronLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconRefresh = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;

const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(amount);

const formatDateDisplay = (date: Date, mode: 'day' | 'month' | 'year') => {
    const thMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    if (mode === 'day') return `${date.getDate()} ${thMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
    if (mode === 'month') return `${thMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
    return `${date.getFullYear() + 543}`;
};

export default function ReceiptsPage() {
    const { 
        receipts, loading, errorMsg, selectedReceipt, 
        setSelectedReceipt, fetchReceipts, getFlattenedItems, hasMore 
    } = useReceipts();

    const [isClient, setIsClient] = useState(false);
    const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('day');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        setIsClient(true);
    }, []);

    const getDateRange = (date: Date, mode: 'day' | 'month' | 'year') => {
        const start = new Date(date);
        const end = new Date(date);

        if (mode === 'day') {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (mode === 'month') {
            start.setDate(1); start.setHours(0, 0, 0, 0);
            end.setMonth(end.getMonth() + 1); end.setDate(0); end.setHours(23, 59, 59, 999);
        } else { // year
            start.setMonth(0, 1); start.setHours(0, 0, 0, 0);
            end.setMonth(11, 31); end.setHours(23, 59, 59, 999);
        }
        return { start: start.toISOString(), end: end.toISOString() };
    };

    useEffect(() => {
        if (!isClient) return;
        const { start, end } = getDateRange(currentDate, viewMode);
        fetchReceipts(start, end, false);
    }, [currentDate, viewMode, isClient]);

    const handleLoadMore = () => {
        const { start, end } = getDateRange(currentDate, viewMode);
        fetchReceipts(start, end, true);
    };

    const shiftDate = (amount: number) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'day') newDate.setDate(newDate.getDate() + amount);
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + amount);
        if (viewMode === 'year') newDate.setFullYear(newDate.getFullYear() + amount);
        setCurrentDate(newDate);
    };

    const displayedReceipts = receipts.filter((rpt: any) => {
        const isCancelled = rpt.status === 'cancelled' || 
                            rpt.payment_method === 'CANCELLED' ||
                            (rpt.orders && Array.isArray(rpt.orders) && rpt.orders[0]?.status === 'cancelled') ||
                            (rpt.orders && !Array.isArray(rpt.orders) && rpt.orders.status === 'cancelled');

        let tableName = rpt.table_label || '';
        if (!tableName && rpt.orders) {
            tableName = Array.isArray(rpt.orders) 
                ? rpt.orders[0]?.table_label 
                : rpt.orders.table_label;
        }
        tableName = tableName || 'Walk-in';

        const brandName = rpt.brand?.name || '';

        let statusMatch = true;
        if (statusFilter === 'completed') statusMatch = !isCancelled;
        if (statusFilter === 'cancelled') statusMatch = isCancelled;

        const searchLower = searchText.toLowerCase();
        const searchMatch = !searchText || 
                            tableName.toLowerCase().includes(searchLower) ||
                            brandName.toLowerCase().includes(searchLower);

        return statusMatch && searchMatch;
    });

    const summaryTotal = displayedReceipts.reduce((sum, r) => {
        const isCancelled = r.status === 'cancelled' || 
                            r.payment_method === 'CANCELLED' ||
                            (r.orders && Array.isArray(r.orders) && r.orders[0]?.status === 'cancelled') ||
                            (r.orders && !Array.isArray(r.orders) && r.orders.status === 'cancelled');
        
        return isCancelled ? sum : sum + (r.total_amount || 0);
    }, 0);

    if (!isClient) return null; // Prevent hydration error

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-6 font-sans text-slate-800">
            <div className="max-w-5xl mx-auto md:p-6 p-4 space-y-4 md:space-y-6">
                
                {/* --- Header (Mobile Optimized) --- */}
                <div className="flex justify-between items-center sticky top-0 z-20 bg-[#F8FAFC]/90 backdrop-blur-md py-2 md:static md:bg-transparent">
                    <h1 className="text-xl md:text-3xl font-black text-slate-800 flex items-center gap-2 md:gap-3">
                        <span className="p-1.5 md:p-2 bg-slate-900 text-white rounded-lg md:rounded-xl shadow-lg shadow-slate-900/20">
                           <IconHistory />
                        </span>
                        ประวัติการขาย
                    </h1>
                    <button 
                        onClick={() => {
                            const { start, end } = getDateRange(currentDate, viewMode);
                            fetchReceipts(start, end, false);
                        }} 
                        className="bg-white border border-slate-200 p-2 md:px-4 md:py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                        title="รีเฟรช"
                    >
                        <IconRefresh /> <span className="hidden md:inline ml-2">รีเฟรช</span>
                    </button>
                </div>

                {/* --- Control Bar (Mobile Optimized) --- */}
                <div className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 space-y-4">
                    
                    {/* 1. Time Controls */}
                    <div className="flex flex-col md:flex-row gap-3 justify-between">
                        <div className="bg-slate-50 p-1.5 rounded-xl flex items-center justify-between md:justify-start gap-2 w-full md:w-auto">
                            <div className="flex gap-1 bg-white rounded-lg shadow-sm p-0.5">
                                {(['day', 'month', 'year'] as const).map((m) => (
                                    <button 
                                        key={m}
                                        onClick={() => { setViewMode(m); setCurrentDate(new Date()); }}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === m ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {m === 'day' ? 'วัน' : m === 'month' ? 'เดือน' : 'ปี'}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-1 flex-1 justify-center md:justify-start min-w-[140px]">
                                <button onClick={() => shiftDate(-1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-500 hover:bg-slate-100 shadow-sm transition-colors active:scale-90"><IconChevronLeft /></button>
                                <span className="font-black text-slate-700 text-sm flex-1 text-center truncate px-2">
                                    {formatDateDisplay(currentDate, viewMode)}
                                </span>
                                <button onClick={() => shiftDate(1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-500 hover:bg-slate-100 shadow-sm transition-colors active:scale-90"><IconChevronRight /></button>
                            </div>
                        </div>

                         {/* Search */}
                        <div className="relative flex-1 w-full md:w-auto md:max-w-xs">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <IconSearch />
                            </div>
                            <input 
                                type="text" 
                                placeholder="ค้นหาเบอร์โต๊ะ..." 
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white border focus:border-slate-300 rounded-xl text-slate-800 font-bold focus:ring-0 placeholder:text-slate-400 text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full"></div>

                    {/* 2. Filters & Summary */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 no-scrollbar">
                             {/* Mobile Scrollable Filter */}
                            {[
                                { id: 'all', label: 'ทั้งหมด', activeClass: 'bg-slate-900 text-white', inactiveClass: 'bg-slate-100 text-slate-500' },
                                { id: 'completed', label: 'สำเร็จ (Paid)', activeClass: 'bg-emerald-500 text-white', inactiveClass: 'bg-emerald-50 text-emerald-600' },
                                { id: 'cancelled', label: 'ยกเลิก (Void)', activeClass: 'bg-rose-500 text-white', inactiveClass: 'bg-rose-50 text-rose-600' }
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStatusFilter(s.id as any)}
                                    className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border border-transparent
                                        ${statusFilter === s.id ? s.activeClass + ' shadow-md' : s.inactiveClass + ' hover:brightness-95'}
                                    `}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ยอดรวม</p>
                            <p className="text-xl md:text-2xl font-black text-slate-800">{formatCurrency(summaryTotal)}</p>
                        </div>
                    </div>
                </div>

                {errorMsg && <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold text-sm text-center">{errorMsg}</div>}

                {/* --- List Section --- */}
                {displayedReceipts.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4"><IconHistory /></div>
                        <p className="text-slate-400 font-bold">ไม่พบข้อมูลในวันนี้</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {displayedReceipts.map((rpt: any) => (
                            <ReceiptCard key={rpt.id} rpt={rpt} onClick={() => setSelectedReceipt(rpt)} />
                        ))}
                    </div>
                )}

                {/* Load More */}
                {loading ? (
                    <div className="flex justify-center py-8">
                         <div className="flex gap-2 items-center text-slate-400 font-bold text-sm animate-pulse">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            กำลังโหลด...
                         </div>
                    </div>
                ) : hasMore && (
                    <button 
                        onClick={handleLoadMore}
                        className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-700 active:scale-95 transition-all text-sm shadow-sm"
                    >
                        โหลดเพิ่มเติม...
                    </button>
                )}
            </div>

            {selectedReceipt && (
                <ReceiptModal 
                    receipt={selectedReceipt} 
                    items={getFlattenedItems(selectedReceipt)} 
                    onClose={() => setSelectedReceipt(null)} 
                />
            )}
        </div>
    );
}

// --- ReceiptCard (Mobile Optimized) ---
function ReceiptCard({ rpt, onClick }: { rpt: any, onClick: () => void }) {
    const isCancelled = rpt.status === 'cancelled' || 
                        rpt.payment_method === 'CANCELLED' ||
                        (rpt.orders && Array.isArray(rpt.orders) && rpt.orders[0]?.status === 'cancelled') ||
                        (rpt.orders && !Array.isArray(rpt.orders) && rpt.orders.status === 'cancelled');

    return (
        <div onClick={onClick} className={`relative p-4 md:p-5 rounded-2xl md:rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border flex flex-col md:flex-row md:items-center justify-between cursor-pointer transition-all active:scale-[0.98] md:hover:-translate-y-1
            ${isCancelled 
                ? 'bg-rose-50 border-rose-100' 
                : 'bg-white border-slate-100 md:hover:border-slate-300 md:hover:shadow-md'}
        `}>
            {/* Top Row (Mobile: Info / Desktop: Left Side) */}
            <div className="flex gap-4 items-start md:items-center">
                
                {/* Icon Box */}
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-sm
                    ${isCancelled 
                        ? 'bg-white text-rose-500' 
                        : (rpt.payment_method === 'promptpay' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600')}
                `}>
                    {isCancelled ? <IconAlert /> : <IconFileText />}
                </div>

                {/* Text Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className={`font-black text-base md:text-lg truncate ${isCancelled ? 'text-rose-800' : 'text-slate-800'}`}>
                            {rpt.table_label || (Array.isArray(rpt.orders) ? rpt.orders[0]?.table_label : rpt.orders?.table_label) || 'Walk-in'}
                        </p>
                        {/* Brand Badge (Mobile: Hidden if too long) */}
                        <span className={`hidden xs:flex text-[10px] font-bold px-2 py-0.5 rounded-full items-center gap-1 truncate max-w-[100px]
                            ${isCancelled ? 'bg-white/50 text-rose-600' : 'bg-slate-100 text-slate-500'}
                        `}>
                            <IconStore size={12}/> {rpt.brand?.name}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <span>{new Date(rpt.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                         {/* Cashier Name */}
                         <span className="flex items-center gap-1 truncate max-w-[120px]">
                            <IconUser size={12} /> {rpt.cashier?.full_name || 'System'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Row (Mobile: Price / Desktop: Right Side) */}
            <div className="mt-3 md:mt-0 pt-3 md:pt-0 border-t border-dashed border-slate-200 md:border-none flex justify-between md:flex-col md:items-end md:justify-center items-center">
                
                {/* Payment Method Badge */}
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md
                    ${isCancelled 
                        ? 'bg-rose-100 text-rose-600' 
                        : 'bg-slate-100 text-slate-500'}
                `}>
                    {isCancelled ? 'VOIDED' : rpt.payment_method}
                </span>

                {/* Price */}
                <p className={`text-xl md:text-2xl font-black tracking-tight
                    ${isCancelled ? 'text-rose-400 line-through decoration-2' : 'text-slate-900'}
                `}>
                    {formatCurrency(rpt.total_amount)}
                </p>
            </div>
            
            {/* Watermark for Cancelled (Desktop only to avoid clutter on mobile) */}
             {isCancelled && (
                <div className="hidden md:block absolute right-20 top-1/2 -translate-y-1/2 text-6xl font-black text-rose-200/20 -rotate-12 pointer-events-none select-none">
                    VOID
                </div>
            )}
        </div>
    );
}