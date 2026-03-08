// app/dashboard/inventory/adjustment/page.tsx
'use client';
import { Html5Qrcode } from 'html5-qrcode';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { recordStockAdjustmentAction } from '@/app/actions/stockActions';
import { usePayment } from '@/hooks/usePayment';
import { useGlobalAlert } from '@/components/providers/GlobalAlertProvider';

const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

// --- Icons ---
const IconArrowLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconTrash = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconSettings = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconCamera = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;

export default function AdjustmentPage() {
    const router = useRouter();
    const { currentBrand } = usePayment();
    const { showAlert } = useGlobalAlert();
    
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<'scan' | 'review'>('scan');
    const [searchInput, setSearchInput] = useState('');
    const [showCamera, setShowCamera] = useState(false); // 🌟 State เปิด/ปิดกล้อง
    const [drafts, setDrafts] = useState<any[]>([]);
    
    const [activeProduct, setActiveProduct] = useState<any>(null);
    const [adjustQty, setAdjustQty] = useState('1');
    const [adjustType, setAdjustType] = useState<'WASTE' | 'DAMAGED' | 'CORRECTION'>('WASTE');
    const [isSaving, setIsSaving] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setMounted(true); }, []);

    // 🌟 ระบบดึง Focus กลับช่องค้นหา ถ้าไม่ได้เปิดกล้อง
    useEffect(() => {
        if (mounted && viewMode === 'scan' && !showCamera && !activeProduct && window.innerWidth > 768) {
            inputRef.current?.focus();
        }
    }, [mounted, viewMode, showCamera, activeProduct]);

    // 🌟 ระบบกล้อง
    useEffect(() => {
        let html5QrCode: Html5Qrcode | null = null;
        if (showCamera && !activeProduct && mounted) {
            html5QrCode = new Html5Qrcode("reader-adjust");
            html5QrCode.start(
                { facingMode: "environment" },
                { fps: 15, qrbox: { width: 200, height: 200 } },
                async (code) => {
                    handleProductFound(code); // ถ้าสแกนเจอให้ส่งไปฟังก์ชันหลัก
                }, () => {}
            ).catch(console.error);
            return () => { if (html5QrCode?.isScanning) html5QrCode.stop(); };
        }
    }, [showCamera, activeProduct, mounted]);

    // 🌟 ฟังก์ชันค้นหาสินค้า (ใช้ร่วมกันทั้งกล้องและปืนยิง)
    const handleProductFound = async (code: string) => {
        const product = await db.products.where('barcode').equals(code).or('sku').equals(code).or('name').startsWithIgnoreCase(code).first();
        if (product) {
            setActiveProduct(product);
            setSearchInput('');
            setShowCamera(false); // ปิดกล้องตอนเด้ง Modal
        } else {
            showAlert('warning', 'ไม่พบสินค้า', `ไม่พบรหัสหรือชื่อ ${code}`);
            setSearchInput('');
            inputRef.current?.focus();
        }
    };

    // 🌟 เมื่อกด Enter หรือกดปืนยิงบาร์โค้ด
    const handleManualSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const code = searchInput.trim();
        if (!code) return;
        handleProductFound(code);
    };

    // เพิ่มเข้ารายการชั่วคราว
    const addToAdjustment = (e: React.FormEvent) => {
        e.preventDefault();
        const qty = parseInt(adjustQty);
        // ถ้าเป็นของเสียหรือชำรุด ให้กลับค่าเป็นลบโดยอัตโนมัติ
        const finalQty = (adjustType === 'WASTE' || adjustType === 'DAMAGED') ? -Math.abs(qty) : qty;

        setDrafts([...drafts, { ...activeProduct, qty: finalQty, type: adjustType }]);
        setActiveProduct(null);
        setAdjustQty('1');
        
        // 🌟 กลับไปรอรับปืนสแกนต่อทันที
        setTimeout(() => inputRef.current?.focus(), 150);
    };

   // 🌟 แก้ไขฟังก์ชัน submitToCloud ในไฟล์ adjustment/page.tsx
const submitToCloud = async () => {
    if (drafts.length === 0) return;
    setIsSaving(true);
    
    // สร้างเลขที่อ้างอิงแบบสุ่มสั้นๆ เช่น ADJ-123456
    const generatedRef = `ADJ-${new Date().getTime().toString().slice(-6)}`;

    const res = await recordStockAdjustmentAction({
        brandId: currentBrand.id,
        refNo: generatedRef, // ✅ เพิ่มบรรทัดนี้เข้าไป
        note: 'ปรับปรุงสต็อกหน้าร้าน',
        items: drafts
    });

    if (res.success) {
        showAlert('success', 'บันทึกสำเร็จ', 'อัปเดตยอดสต็อกเรียบร้อยแล้ว');
        setDrafts([]);
        setViewMode('scan');
    } else {
        showAlert('error', 'ล้มเหลว', res.error);
    }
    setIsSaving(false);
};

    const getImageUrl = (imageName: string | null) => {
        if (!imageName) return null;
        const cleanName = imageName.replace(/^\/+/, '');
        return currentBrand?.id && !cleanName.startsWith(currentBrand.id) 
            ? `${CDN_URL}/${currentBrand.id}/${cleanName}` 
            : `${CDN_URL}/${cleanName}`;
    };

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-[#F8FAFC] font-sans flex flex-col overflow-hidden" suppressHydrationWarning>
            
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-slate-200 shadow-sm relative z-20 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/inventory')} className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-full active:scale-90"><IconArrowLeft /></button>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 leading-tight">ปรับปรุงสต็อก / ของเสีย</h1>
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Adjustment & Waste</p>
                    </div>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => { setViewMode('scan'); setActiveProduct(null); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'scan' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>เลือกสินค้า</button>
                    <button onClick={() => setViewMode('review')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'review' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
                        ตรวจสอบ ({drafts.length})
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-28">
                <div className="max-w-3xl mx-auto space-y-6">
                    
                    {viewMode === 'scan' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            
                            {/* 🌟 Search Form + ปุ่มกล้อง */}
                            <div className="bg-white p-2 rounded-[24px] shadow-sm border border-slate-200 relative group transition-all duration-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 mb-6">
                                <form onSubmit={handleManualSearch} className="relative flex items-center">
                                    <div className="pl-4 pr-2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300">
                                        <IconSearch />
                                    </div>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        inputMode="none"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="รหัสสินค้า / SKU หรือชื่อ..."
                                        className="w-full py-4 text-sm font-bold bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                                        autoComplete="off"
                                    />
                                    <div className="pr-1.5">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowCamera(!showCamera)} 
                                            className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90 ${showCamera ? 'bg-rose-100 text-rose-600' : 'bg-slate-800 text-white hover:bg-blue-600 shadow-sm'}`}
                                        >
                                            <IconCamera />
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* 🌟 กล่องแสดงกล้องมือถือ */}
                            {showCamera && (
                                <div className="bg-white p-3 rounded-3xl shadow-sm border border-slate-200 animate-in zoom-in-95 duration-300 mb-6">
                                    <div id="reader-adjust" className="w-full rounded-[20px] overflow-hidden bg-slate-900 shadow-inner aspect-square object-cover"></div>
                                    <div className="flex justify-center mt-4 mb-2">
                                        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 border border-blue-100">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                            กำลังรอสแกน...
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Info Box */}
                            {!showCamera && drafts.length === 0 && (
                                <div className="bg-blue-50 p-6 rounded-[28px] border border-blue-100 text-center">
                                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200"><IconSettings /></div>
                                    <h2 className="font-black text-blue-900">วิธีการใช้งาน</h2>
                                    <p className="text-xs text-blue-600/70 mt-1 leading-relaxed">สแกนสินค้าที่ต้องการปรับปรุงยอด <br/>ระบุจำนวน และเลือกเหตุผล (เสีย/นับพลาด) แล้วจึงบันทึก</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in duration-300">
                            {drafts.length === 0 ? (
                                <div className="p-20 text-center text-slate-400 font-bold">ยังไม่มีรายการที่เลือก</div>
                            ) : (
                                drafts.map((item, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
                                                {item.image_url ? <img src={getImageUrl(item.image_url) as string} className="w-full h-full object-cover" /> : <IconSettings />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${item.qty < 0 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                    {item.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className={`font-black text-lg ${item.qty < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {item.qty > 0 ? '+' : ''}{item.qty}
                                            </p>
                                            <button onClick={() => setDrafts(drafts.filter((_, i) => i !== idx))} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><IconTrash /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 🌟 Modal ใส่รายละเอียดสินค้า */}
            {activeProduct && (
                <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-6 md:p-8 rounded-[32px] w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-8 md:zoom-in-95">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-black text-slate-800">{activeProduct.name}</h2>
                            <p className="text-xs text-slate-400 font-mono mt-1">{activeProduct.barcode || '-'}</p>
                        </div>

                        <form onSubmit={addToAdjustment} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ประเภทการปรับปรุง</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['WASTE', 'DAMAGED', 'CORRECTION'] as const).map((t) => (
                                        <button 
                                            key={t} type="button" onClick={() => setAdjustType(t)}
                                            className={`py-2 rounded-xl text-[10px] font-bold border-2 transition-all ${adjustType === t ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'border-slate-100 text-slate-500'}`}
                                        >
                                            {t === 'WASTE' ? 'เสีย/หมดอายุ' : t === 'DAMAGED' ? 'ชำรุด' : 'แก้ไขยอด'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">จำนวนชิ้น</label>
                                <input 
                                    autoFocus type="number" inputMode="numeric" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} onFocus={(e) => e.target.select()}
                                    className="w-full p-4 text-4xl font-black text-center bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button type="button" onClick={() => { setActiveProduct(null); inputRef.current?.focus(); }} className="py-4 bg-slate-50 text-slate-500 rounded-xl font-bold hover:bg-slate-100">ยกเลิก</button>
                                <button type="submit" className="py-4 bg-slate-900 text-white rounded-xl font-black shadow-lg active:scale-95 transition-all">ตกลง</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bottom Button */}
            {viewMode === 'review' && drafts.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-30 pb-safe animate-in slide-in-from-bottom-4">
                    <button 
                        onClick={submitToCloud} disabled={isSaving}
                        className="w-full py-4 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 transition-all"
                    >
                        {isSaving ? 'กำลังบันทึก...' : `ยืนยันการปรับปรุง (${drafts.length})`}
                    </button>
                </div>
            )}
        </div>
    );
}