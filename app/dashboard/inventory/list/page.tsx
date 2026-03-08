// app/dashboard/inventory/list/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStockListAction } from '@/app/actions/stockActions';
import { usePayment } from '@/hooks/usePayment';

const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

// --- Icons ---
const IconArrowLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconPackage = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;

export default function StockListPage() {
    const router = useRouter();
    const { currentBrand } = usePayment();
    
    const [stocks, setStocks] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    
    // 🌟 ตัวนี้สำคัญมาก ห้ามลบ! เอาไว้แก้ Error Hydration
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            if (!currentBrand?.id) return;
            setLoading(true);
            const res = await getStockListAction(currentBrand.id);
            if (res.success) setStocks(res.data || []);
            setLoading(false);
        };
        // โหลดข้อมูลเมื่อคอมโพเนนต์พร้อมและมี Brand ID
        if (mounted && currentBrand?.id) {
            loadData();
        }
    }, [currentBrand, mounted]);

    // 🌟 ดึงรูปภาพพร้อมแทรก Brand ID ให้โหลดรูปติด
    const getImageUrl = (imageName: string | null) => {
        if (!imageName) return null;
        if (imageName.startsWith('blob:')) return imageName; 
        if (imageName.startsWith('http')) return imageName;
        
        const cleanName = imageName.replace(/^\/+/, '');
        if (currentBrand?.id && !cleanName.startsWith(currentBrand.id)) {
            return `${CDN_URL}/${currentBrand.id}/${cleanName}`;
        }
        return `${CDN_URL}/${cleanName}`; 
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return '-';
        const date = new Date(isoString);
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) + ' ' + 
               date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    };

    const filteredStocks = stocks.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.barcode && s.barcode.includes(searchQuery))
    );

    const totalSKU = stocks.length;
    const totalGoodStock = stocks.reduce((sum, item) => sum + (item.quantity > 0 ? item.quantity : 0), 0);
    const totalLost = 0; 

    // ถ้ายังไม่ Mount ให้คืนค่าหน้าเปล่าๆ ไปก่อน กัน Error
    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-[#F8FAFC] font-sans overflow-hidden flex flex-col" suppressHydrationWarning>
            
            {/* Header */}
            <div className="bg-white px-4 py-3 shadow-sm relative z-20">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/dashboard/inventory')} 
                        className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-full transition-all active:scale-90"
                    >
                        <IconArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 leading-tight">รายการสินค้าคงเหลือ</h1>
                        <p className="text-[11px] font-medium text-slate-500">อัปเดตแบบ Real-time</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-300">
                    
                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-blue-600 text-white p-4 rounded-[20px] shadow-lg shadow-blue-200/50 flex flex-col justify-center">
                            <p className="text-[11px] font-bold mb-1 opacity-90">พร้อมขาย (ชิ้น)</p>
                            <p className="text-3xl font-black leading-none">{totalGoodStock}</p>
                        </div>
                        <div className="bg-white text-slate-800 p-4 rounded-[20px] border border-slate-100 shadow-sm flex flex-col justify-center">
                            <p className="text-[11px] font-bold text-slate-400 mb-1">ทั้งหมด (SKU)</p>
                            <p className="text-3xl font-black leading-none">{totalSKU}</p>
                        </div>
                        <div className="bg-white text-slate-800 p-4 rounded-[20px] border border-slate-100 shadow-sm flex flex-col justify-center">
                            <p className="text-[11px] font-bold text-slate-400 mb-1">ยอดหาย</p>
                            <p className="text-3xl font-black leading-none text-rose-500">{totalLost}</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <IconSearch />
                        </div>
                        <input 
                            type="text" 
                            placeholder="ค้นหาชื่อสินค้า หรือยิงสแกนบาร์โค้ด" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[20px] shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm text-slate-700 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Product List */}
                    <div className="space-y-3">
                        {loading ? (
                            <div className="p-10 text-center text-slate-400 font-bold animate-pulse">กำลังโหลดข้อมูล...</div>
                        ) : filteredStocks.length === 0 ? (
                            <div className="bg-white p-10 rounded-[24px] border border-slate-100 text-center shadow-sm">
                                <div className="text-slate-300 flex justify-center mb-3"><IconPackage /></div>
                                <p className="font-bold text-slate-600">ไม่พบรายการสินค้า</p>
                            </div>
                        ) : (
                            filteredStocks.map((item) => {
                                let statusColor = 'bg-emerald-100 text-emerald-700';
                                let statusText = 'ปกติ';
                                if (item.quantity <= 0) { 
                                    statusColor = 'bg-rose-100 text-rose-700'; 
                                    statusText = 'หมดสต็อก'; 
                                } else if (item.quantity <= 5) { 
                                    statusColor = 'bg-orange-100 text-orange-700'; 
                                    statusText = 'ใกล้หมด'; 
                                }

                                return (
                                    <div key={item.id} className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 transition-all">
                                        
                                        {/* Image Box */}
                                        <div className="w-[72px] h-[72px] bg-slate-50 rounded-[18px] border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                            {item.image_url ? (
                                                <img src={getImageUrl(item.image_url) as string} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-slate-300"><IconPackage /></div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0 py-1">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${statusColor}`}>
                                                    {statusText}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    อัปเดต: {formatTime(item.updated_at)}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-slate-800 text-sm md:text-base leading-tight truncate">{item.name}</h3>
                                            <p className="text-[11px] font-mono text-slate-400 mt-1">{item.barcode || item.sku || 'ไม่มีบาร์โค้ด'}</p>
                                        </div>

                                        {/* Quantity */}
                                        <div className="text-right shrink-0 px-2 flex flex-col justify-center">
                                            <p className="text-[10px] font-bold text-slate-400 mb-0.5">คงเหลือ</p>
                                            <p className={`text-2xl font-black leading-none ${item.quantity <= 0 ? 'text-rose-500' : 'text-slate-800'}`}>
                                                {item.quantity}
                                            </p>
                                        </div>

                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}