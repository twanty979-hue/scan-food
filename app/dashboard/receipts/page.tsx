'use client';

import { useState, useEffect, useRef } from 'react';
import { useReceipts } from '@/hooks/useReceipts';

// --- Icons ---
const IconHistory = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>;
const IconFileText = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconX = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconStore = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21v-7"/><path d="M19 21v-7"/><path d="M2 10l20 0"/><path d="M2 10l2-4h16l2 4"/></svg>;
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconAlert = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconChevronLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconPrinter = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const IconTag = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;

const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(amount);

const formatDateDisplay = (date: Date, mode: 'day' | 'month' | 'year') => {
    const thMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    if (mode === 'day') return `${date.getDate()} ${thMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
    if (mode === 'month') return `${thMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
    return `${date.getFullYear() + 543}`;
};

const formatDateReceipt = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
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

            {/* ✅ ใช้ Local Receipt Modal ที่อัปเกรดแล้ว */}
            {selectedReceipt && (
                <LocalReceiptModal 
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

// ✅ Local Receipt Modal (อัปเกรดให้เหมือน ReceiptModal.tsx เป๊ะๆ)
function LocalReceiptModal({ receipt, items, onClose }: { receipt: any, items: any[], onClose: () => void }) {
    const printRef = useRef<HTMLDivElement>(null);

    // 1. ฟังก์ชันช่วยดึงค่ายอดลด (รองรับทั้ง savedAmount และ discount_amount)
    const getDiscountValue = (promo: any) => {
        if (!promo) return 0;
        return Number(promo.savedAmount || promo.discount_amount || 0);
    };

    // 2. คำนวณยอดประหยัดรวม
    const totalSaved = items.reduce((sum, item) => {
        if (item.status === 'cancelled') return sum;
        const savedPerUnit = getDiscountValue(item.promotion_snapshot);
        return sum + (savedPerUnit * item.quantity);
    }, 0);

    const handlePrint = () => {
        const content = printRef.current?.innerHTML;
        const printWindow = window.open('', '', 'width=400,height=600');
        if (printWindow && content) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print Receipt</title>
                        <style>
                            body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; }
                            .text-center { text-align: center; }
                            .text-right { text-align: right; }
                            .font-bold { font-weight: bold; }
                            .flex { display: flex; justify-content: space-between; }
                            .border-b { border-bottom: 1px dashed #000; margin: 10px 0; }
                            .mb-2 { margin-bottom: 5px; }
                            .text-red { color: red; text-decoration: line-through; }
                            .text-xs { font-size: 10px; }
                        </style>
                    </head>
                    <body>
                        ${content}
                        <script>
                            window.onload = function() { window.print(); window.close(); }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh]">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        {/* ✅ เพิ่มหัวข้อตามที่ขอ */}
                        <h3 className="font-bold text-slate-700">ใบเสร็จย้อนหลัง</h3>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">History</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="p-2 hover:bg-slate-100 rounded-full text-slate-600" title="พิมพ์">
                            <IconPrinter />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500">
                            <IconX />
                        </button>
                    </div>
                </div>

                {/* Receipt Content */}
                <div className="overflow-y-auto p-6 bg-slate-50 flex-1">
                    <div ref={printRef} className="bg-white p-6 shadow-sm border border-slate-200 text-slate-800 font-mono text-sm leading-relaxed">
                        
                        {/* 1. หัวใบเสร็จ */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-black uppercase mb-1">{receipt.brand?.name}</h2>
                            <p className="text-xs text-slate-500">
                                {receipt.table_label ? `Table: ${receipt.table_label}` : 'Walk-in'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">{formatDateReceipt(receipt.created_at)}</p>
                            <p className="text-[10px] text-slate-400">Order ID: #{receipt.id.slice(0, 8)}</p>
                        </div>

                        <div className="border-b border-dashed border-slate-300 my-4"></div>

                        {/* ✅ 2. รายการสินค้า (ใช้ Logic ใหม่) */}
                        <div className="space-y-3 mb-4">
                            {items.length > 0 ? (
                                items.map((item: any, index: number) => {
                                    const isCancelled = item.status === 'cancelled';
                                    const promo = item.promotion_snapshot;
                                    
                                    // ✅ เรียกใช้ฟังก์ชันที่รองรับทั้ง 2 ชื่อ
                                    const savedPerUnit = getDiscountValue(promo);
                                    const isDiscounted = !isCancelled && savedPerUnit > 0;
                                    
                                    // คำนวณราคาเต็ม (เฉพาะเมื่อมีส่วนลดจริงๆ)
                                    const originalPrice = isDiscounted ? (item.price + savedPerUnit) : item.price;

                                    return (
                                        <div key={index} className={`flex justify-between items-start ${isCancelled ? 'text-red-400' : ''}`}>
                                            <div className="flex-1 pr-2">
                                                <div className={isCancelled ? 'line-through decoration-red-400' : ''}>
                                                    <span className="font-bold">{item.quantity}x</span> {item.product_name}
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-0.5">
                                                    {item.variant !== 'normal' && (
                                                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
                                                            {item.variant}
                                                        </span>
                                                    )}
                                                    
                                                    {/* ✅ แสดงป้าย SAVE (แก้เรื่องชื่อโปรโมชั่นหายด้วย) */}
                                                    {isDiscounted && (
                                                        <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded w-fit">
                                                            <IconTag /> SAVE {formatCurrency(savedPerUnit * item.quantity)}
                                                            {/* ถ้ามีชื่อโชว์ชื่อ ถ้าไม่มีไม่ต้องโชว์วงเล็บว่างๆ */}
                                                            {promo?.name ? ` (${promo.name})` : ''}
                                                        </div>
                                                    )}
                                                    
                                                    {isCancelled && (
                                                        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 rounded">
                                                            ยกเลิก
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {/* ✅ แสดงราคาเต็มขีดฆ่า */}
                                                {isDiscounted && (
                                                    <p className="text-[10px] text-slate-400 line-through font-bold">
                                                        {formatCurrency(originalPrice * item.quantity)}
                                                    </p>
                                                )}
                                                <p className={`font-black ${isCancelled ? 'line-through text-red-300' : (isDiscounted ? 'text-red-500' : 'text-slate-900')}`}>
                                                    {formatCurrency(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-slate-400 italic">ไม่พบรายการสินค้า</p>
                            )}
                        </div>

                        <div className="border-b border-dashed border-slate-300 my-4"></div>

                        {/* 3. ยอดรวม & ส่วนลด */}
                        <div className="space-y-1 text-slate-600">
                            {/* ✅ แสดงยอดรวมประหยัด (ถ้ามี) */}
                            {totalSaved > 0 && (
                                <div className="flex justify-between text-sm text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 mb-2">
                                    <span className="font-bold uppercase flex items-center gap-1"><IconTag /> ประหยัดไป</span>
                                    <span className="font-black">- {formatCurrency(totalSaved)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-lg font-black text-slate-900">
                                <span>ยอดรวมสุทธิ</span>
                                <span>{formatCurrency(receipt.total_amount)}</span>
                            </div>
                        </div>

                        <div className="border-b border-dashed border-slate-300 my-4"></div>

                        {/* 4. รายละเอียดการชำระเงิน */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="font-bold">ชำระโดย</span>
                                <span className="uppercase font-bold bg-slate-100 px-2 rounded text-xs py-0.5">
                                    {receipt.payment_method}
                                </span>
                            </div>
                            
                            {(receipt.received_amount > 0 || receipt.change_amount > 0) && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span>รับเงิน (Received)</span>
                                        <span>{formatCurrency(receipt.received_amount || receipt.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-900">
                                        <span>เงินทอน (Change)</span>
                                        <span className="font-bold">{formatCurrency(receipt.change_amount || 0)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="border-b border-dashed border-slate-300 my-6"></div>

                        {/* Footer */}
                        <div className="text-center space-y-1">
                            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase">
                                Cashier: {receipt.cashier?.full_name || 'System'}
                            </div>
                            <p className="text-xs font-bold mt-4">ขอบคุณที่ใช้บริการ</p>
                            <p className="text-[10px] text-slate-400">Thank you</p>
                        </div>

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
                    <button 
                        onClick={handlePrint} 
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                    >
                        <IconPrinter /> พิมพ์ใบเสร็จ
                    </button>
                </div>
            </div>
        </div>
    );
}