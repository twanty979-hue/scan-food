'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getStockTransactionsAction } from '@/app/actions/stockActions';
import { usePayment } from '@/hooks/usePayment';

const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

// --- Icons ---
const IconArrowLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconHistory = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline><path d="M3.3 7a9 9 0 1 1 0 10"></path><polyline points="2 6 3.4 7 4.5 5.7"></polyline></svg>;
const IconPackage = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const IconChevronDown = ({ isOpen }: { isOpen: boolean }) => <svg className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconRefresh = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>;

export default function StockHistoryPage() {
    const router = useRouter();
    const { currentBrand } = usePayment();
    
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => { setMounted(true); }, []);

    const loadHistory = useCallback(async () => {
        if (!currentBrand?.id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getStockTransactionsAction(currentBrand.id);
            if (res && res.success) {
                setTransactions(res.data || []);
            } else {
                setError(res?.error || "ไม่สามารถโหลดข้อมูลได้");
            }
        } catch (err) {
            setError("การเชื่อมต่อล้มเหลว");
        } finally {
            setLoading(false);
        }
    }, [currentBrand]);

    useEffect(() => {
        if (mounted && currentBrand?.id) {
            loadHistory();
        }
    }, [currentBrand, mounted, loadHistory]);

    const getImageUrl = (imageName: string | null) => {
        if (!imageName) return null;
        if (imageName.startsWith('blob:') || imageName.startsWith('http')) return imageName;
        const cleanName = imageName.replace(/^\/+/, '');
        return currentBrand?.id && !cleanName.startsWith(currentBrand.id) 
            ? `${CDN_URL}/${currentBrand.id}/${cleanName}` 
            : `${CDN_URL}/${cleanName}`;
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return {
            date: date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
            time: date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        };
    };

    if (!mounted) return <div className="fixed inset-0 bg-[#F8FAFC]"></div>;

    return (
        <div className="fixed inset-0 z-[9999] bg-[#F8FAFC] font-sans flex flex-col overflow-hidden" suppressHydrationWarning>
            
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-slate-200 shadow-sm relative z-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/inventory')} className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-full active:scale-90 transition-all"><IconArrowLeft /></button>
                    <div>
                        <h1 className="text-lg font-black text-slate-800 leading-none">ประวัติการทำรายการ</h1>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Transaction History</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-500">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-[24px] border border-slate-100 shadow-sm animate-pulse"></div>)}
                        </div>
                    ) : error ? (
                        <div className="bg-white p-10 rounded-[32px] border border-rose-100 text-center shadow-sm">
                            <p className="text-rose-500 font-bold mb-4">{error}</p>
                            <button onClick={loadHistory} className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold flex items-center gap-2 mx-auto active:scale-95 transition-all">
                                <IconRefresh /> ลองใหม่อีกครั้ง
                            </button>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="bg-white p-12 rounded-[32px] border border-slate-100 text-center shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4"><IconHistory /></div>
                            <p className="font-bold text-slate-400">ยังไม่มีประวัติการทำรายการ</p>
                        </div>
                    ) : (
                        transactions.map((tx) => {
                            const { date, time } = formatDate(tx.created_at);
                            const isExpanded = expandedId === tx.id;
                            
                            const totalQty = tx.stock_logs?.reduce((sum: number, log: any) => sum + log.change_amount, 0) || 0;
                            const isPositive = totalQty >= 0;

                            return (
                                <div key={tx.id} className={`bg-white rounded-[24px] border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-blue-400 shadow-lg' : 'border-slate-100 shadow-sm'}`}>
                                    <button onClick={() => setExpandedId(isExpanded ? null : tx.id)} className="w-full p-4 flex items-center justify-between text-left active:bg-slate-50 transition-colors" suppressHydrationWarning>
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`w-14 h-14 rounded-[16px] flex flex-col items-center justify-center shrink-0 ${isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                <span className="text-[10px] font-bold uppercase mb-[-2px]">{date.split(' ')[1]}</span>
                                                <span className="text-xl font-black leading-none">{date.split(' ')[0]}</span>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                        {isPositive ? 'STOCK IN' : 'STOCK OUT'}
                                                    </span>
                                                    <span className="text-xs font-mono text-slate-400">{time}</span>
                                                </div>
                                                <h3 className="font-black text-slate-800 text-sm md:text-base leading-tight truncate">
                                                    {tx.note || 'ทำรายการสต็อก'}
                                                </h3>
                                                <p className="text-[10px] text-slate-400 mt-1 font-mono truncate">Ref: {tx.ref_no || '-'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] font-bold text-slate-400 mb-0.5">ยอดรวม</p>
                                                <p className={`text-sm font-black ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {isPositive ? '+' : ''}{totalQty} ชิ้น
                                                </p>
                                            </div>
                                            <div className="text-slate-400 bg-slate-50 p-1.5 rounded-full">
                                                <IconChevronDown isOpen={isExpanded} />
                                            </div>
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="p-4 pt-0 border-t border-slate-50 bg-slate-50/50 animate-in slide-in-from-top-2">
                                            <div className="space-y-2 mt-3">
                                                {/* แก้ไขตรงนี้: เพิ่ม (log: any, index: number) เพื่อเรียกใช้ index */}
                                                {tx.stock_logs?.map((log: any, index: number) => {
                                                    const isLogPositive = log.change_amount >= 0;
                                                    return (
                                                        <div key={`${tx.id}-${log.id || index}`} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                                                    {log.product_master?.image_url ? (
                                                                        <img src={getImageUrl(log.product_master.image_url) as string} className="w-full h-full object-cover" alt="" />
                                                                    ) : <IconPackage />}
                                                                </div>
                                                                <div className="min-w-0 pr-2">
                                                                    <p className="font-bold text-slate-800 text-xs truncate">{log.product_master?.name || 'สินค้าถูกลบ'}</p>
                                                                    <p className="text-[9px] font-mono text-slate-400">{log.product_master?.barcode || '-'}</p>
                                                                </div>
                                                            </div>
                                                            <div className={`px-3 py-1 rounded-lg border shrink-0 ${isLogPositive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                                                                <span className="font-black text-sm">
                                                                    {isLogPositive ? '+' : ''}{log.change_amount}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}