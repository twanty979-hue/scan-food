'use client';

import { useState, useEffect } from 'react';
import { useReceipts } from '@/hooks/useReceipts';
// ✅ Import Component ที่แยกไว้
import ReceiptModal from './components/ReceiptModal';

// --- Icons (เหลือเฉพาะที่ใช้ในหน้านี้) ---
const IconHistory = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>;
const IconFileText = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconStore = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21v-7"/><path d="M19 21v-7"/><path d="M2 10l20 0"/><path d="M2 10l2-4h16l2 4"/></svg>;
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconAlert = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconChevronLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

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

    if (!isClient) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center">
                <div className="text-slate-400 font-bold animate-pulse">กำลังโหลดระบบ...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <IconHistory /> ประวัติการขาย
                    </h1>
                    <button 
                        onClick={() => {
                            const { start, end } = getDateRange(currentDate, viewMode);
                            fetchReceipts(start, end, false);
                        }} 
                        className="bg-white border-2 border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 active:scale-95 transition-all text-sm"
                    >
                        รีเฟรชข้อมูล
                    </button>
                </div>

                {/* Control Bar */}
                <div className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-200 space-y-4">
                    
                    {/* Time & Search */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl w-fit">
                            <div className="flex gap-1">
                                {(['day', 'month', 'year'] as const).map((m) => (
                                    <button 
                                        key={m}
                                        onClick={() => { setViewMode(m); setCurrentDate(new Date()); }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {m === 'day' ? 'รายวัน' : m === 'month' ? 'รายเดือน' : 'รายปี'}
                                    </button>
                                ))}
                            </div>
                            <div className="w-px h-6 bg-slate-300 mx-1"></div>
                            <div className="flex items-center gap-2 px-2">
                                <button onClick={() => shiftDate(-1)} className="p-1 hover:bg-white rounded-full transition-colors"><IconChevronLeft /></button>
                                <span className="font-black text-slate-700 min-w-[100px] text-center text-sm">
                                    {formatDateDisplay(currentDate, viewMode)}
                                </span>
                                <button onClick={() => shiftDate(1)} className="p-1 hover:bg-white rounded-full transition-colors"><IconChevronRight /></button>
                            </div>
                        </div>

                        <div className="relative flex-1 max-w-md">
                            <IconSearch />
                            <input 
                                type="text" 
                                placeholder="ค้นหาเบอร์โต๊ะในหน้านี้..." 
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400 text-sm"
                            />
                        </div>
                    </div>

                    {/* Filter & Summary */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center pt-2 md:pt-0">
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            {[
                                { id: 'all', label: 'ทั้งหมด', color: 'bg-slate-900 text-white' },
                                { id: 'completed', label: 'สำเร็จ (Paid)', color: 'bg-green-100 text-green-700' },
                                { id: 'cancelled', label: 'ยกเลิก (Void)', color: 'bg-red-100 text-red-700' }
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStatusFilter(s.id as any)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border-2 transition-all
                                        ${statusFilter === s.id 
                                            ? `${s.id === 'all' ? 'bg-slate-900 text-white border-slate-900' : ''} 
                                               ${s.id === 'completed' ? 'bg-green-50 text-white border-green-500' : ''}
                                               ${s.id === 'cancelled' ? 'bg-red-500 text-white border-red-500' : ''}`
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                        }
                                    `}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400">ยอดขายรวม (เฉพาะที่แสดง)</p>
                            <p className="text-2xl font-black text-slate-900">{formatCurrency(summaryTotal)}</p>
                        </div>
                    </div>
                </div>

                {errorMsg && <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold">{errorMsg}</div>}

                {/* List Section */}
                {displayedReceipts.length === 0 && !loading ? (
                    <div className="text-center py-20 bg-white rounded-[28px] border border-dashed border-slate-300">
                        <div className="text-slate-300 mb-2 mx-auto w-fit"><IconHistory /></div>
                        <p className="text-slate-400 font-bold">ไม่พบข้อมูลในวันที่เลือก</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {displayedReceipts.map((rpt: any) => (
                            <ReceiptCard key={rpt.id} rpt={rpt} onClick={() => setSelectedReceipt(rpt)} />
                        ))}
                    </div>
                )}

                {/* Load More Button */}
                {loading ? (
                    <div className="text-center py-10 text-slate-400 font-bold animate-pulse">กำลังโหลดข้อมูล...</div>
                ) : hasMore && (
                    <button 
                        onClick={handleLoadMore}
                        className="w-full py-4 rounded-2xl bg-white border-2 border-slate-200 text-slate-500 font-bold hover:bg-slate-50 active:scale-95 transition-all"
                    >
                        โหลดเพิ่มเติม...
                    </button>
                )}
            </div>

            {/* ✅ เรียกใช้ Modal Component ใหม่ */}
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

// ReceiptCard (การ์ดรายการเล็ก)
function ReceiptCard({ rpt, onClick }: { rpt: any, onClick: () => void }) {
    const isCancelled = rpt.status === 'cancelled' || 
                        rpt.payment_method === 'CANCELLED' ||
                        (rpt.orders && Array.isArray(rpt.orders) && rpt.orders[0]?.status === 'cancelled') ||
                        (rpt.orders && !Array.isArray(rpt.orders) && rpt.orders.status === 'cancelled');

    return (
        <div onClick={onClick} className={`relative p-6 rounded-[28px] shadow-sm border flex justify-between items-center hover:shadow-md cursor-pointer transition-all overflow-hidden group
            ${isCancelled ? 'bg-red-50 border-red-100 opacity-80 hover:opacity-100' : 'bg-white border-slate-200'}
        `}>
            {isCancelled && (
                <div className="absolute -right-4 -top-4 text-6xl font-black text-red-100 -rotate-12 pointer-events-none select-none">VOID</div>
            )}

            <div className="flex gap-4 items-center relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center 
                    ${isCancelled ? 'bg-red-100 text-red-500' : (rpt.payment_method === 'promptpay' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600')}
                `}>
                    {isCancelled ? <IconAlert /> : <IconFileText />}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className={`font-black text-lg ${isCancelled ? 'text-red-800' : 'text-slate-900'}`}>
                            {rpt.table_label || (Array.isArray(rpt.orders) ? rpt.orders[0]?.table_label : rpt.orders?.table_label) || 'Walk-in'}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1
                            ${isCancelled ? 'bg-red-100 text-red-600' : 'text-slate-500 bg-slate-100'}
                        `}>
                            <IconStore /> {rpt.brand?.name}
                        </span>
                    </div>
                    <p className={`text-xs font-bold uppercase mt-1 ${isCancelled ? 'text-red-400' : 'text-slate-400'}`}>
                        {new Date(rpt.created_at).toLocaleString('th-TH')} • <IconUser /> {rpt.cashier?.full_name || 'System'}
                    </p>
                </div>
            </div>
            <div className="text-right relative z-10">
                <p className={`text-2xl font-black ${isCancelled ? 'text-red-600 line-through decoration-2 decoration-red-300' : 'text-slate-900'}`}>
                    {formatCurrency(rpt.total_amount)}
                </p>
                <p className={`text-[10px] font-black uppercase ${isCancelled ? 'text-red-400' : 'text-slate-400'}`}>
                    {isCancelled ? 'CANCELLED' : rpt.payment_method}
                </p>
            </div>
        </div>
    );
}