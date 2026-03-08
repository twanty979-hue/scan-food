// app/dashboard/inventory/stock-in/page.tsx
'use client';
import { Html5Qrcode } from 'html5-qrcode';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; 
import { db } from '@/lib/db';
import { useStockIn } from '@/hooks/useStockIn';
import { usePayment } from '@/hooks/usePayment'; 
import { useGlobalAlert } from '@/components/providers/GlobalAlertProvider';

// --- Icons ---
const IconArrowLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconCamera = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const IconBarcode = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>;
const IconList = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconPackage = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const IconCheck = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconScan = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path></svg>;
const IconChevronDown = ({ isOpen }: { isOpen: boolean }) => <svg className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;

export default function StockInPage() {
    const router = useRouter(); 
    const { currentBrand } = usePayment();
    const { drafts, addToDraft, removeDraftItem, submitToCloud, isSaving } = useStockIn(currentBrand?.id);
    const { showAlert } = useGlobalAlert();

    const [hasMounted, setHasMounted] = useState(false);
    const [viewMode, setViewMode] = useState<'scan' | 'review'>('scan');
    const [showCamera, setShowCamera] = useState(false);
    const [isListExpanded, setIsListExpanded] = useState(false);
    
    const [barcodeInput, setBarcodeInput] = useState('');
    const [activeProduct, setActiveProduct] = useState<any>(null);
    const [inputQty, setInputQty] = useState('1');
    const [refNo, setRefNo] = useState('');

    const barcodeInputRef = useRef<HTMLInputElement>(null);
    const qtyInputRef = useRef<HTMLInputElement>(null);

    const totalQty = drafts.reduce((sum, item) => sum + item.qty, 0);

    useEffect(() => { setHasMounted(true); }, []);

    useEffect(() => {
        if (hasMounted && viewMode === 'scan' && !showCamera && !activeProduct && window.innerWidth > 768) {
            barcodeInputRef.current?.focus();
        }
    }, [hasMounted, viewMode, showCamera, activeProduct]);

    useEffect(() => {
        let html5QrCode: Html5Qrcode | null = null;
        if (showCamera && !activeProduct && hasMounted) {
            html5QrCode = new Html5Qrcode("reader");
            html5QrCode.start(
                { facingMode: "environment" },
                { fps: 15, qrbox: { width: 200, height: 200 } },
                async (code) => {
                    handleProductFound(code);
                }, () => {}
            ).catch(console.error);
            return () => { if (html5QrCode?.isScanning) html5QrCode.stop(); };
        }
    }, [showCamera, activeProduct, hasMounted]);

    const handleProductFound = async (code: string) => {
        const product = await db.products.where('barcode').equals(code).or('sku').equals(code).first();
        if (product) {
            setActiveProduct(product);
            setShowCamera(false);
            setBarcodeInput('');
            setTimeout(() => qtyInputRef.current?.focus(), 150);
        } else {
            showAlert('warning', 'ไม่พบสินค้า', `ไม่มีรหัส ${code} ในระบบ`);
            setBarcodeInput('');
            barcodeInputRef.current?.focus();
        }
    };

    const handleManualScan = (e: React.FormEvent) => {
        e.preventDefault();
        const code = barcodeInput.trim();
        if (!code) return;
        handleProductFound(code);
    };

    const handleSaveQty = async (e: React.FormEvent) => {
        e.preventDefault();
        const qty = parseInt(inputQty);
        if (qty !== 0) {
            await addToDraft(activeProduct, qty);
        }
        setActiveProduct(null);
        setInputQty('1');
        setTimeout(() => barcodeInputRef.current?.focus(), 150);
    };

    if (!hasMounted) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-[#F8FAFC] font-sans pb-28 overflow-y-auto">
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes scale-in {
                    0% { opacity: 0; transform: scale(0.97); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
                .glass-header { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px); border-bottom: 1px solid rgba(226, 232, 240, 0.8); }
            `}} />

            <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none -z-10"></div>

            {/* --- Header --- */}
            <div className="glass-header sticky top-0 z-40 transition-all duration-300">
                <div className="max-w-4xl mx-auto px-4 py-2.5 flex justify-between items-center">
                    
                    <div className="flex items-center gap-3">
                        {/* 🌟 จุดที่แก้ไข: ปุ่ม Back เปลี่ยนจาก router.back() เป็น router.push ไปที่หน้า inventory */}
                        <button 
                            onClick={() => router.push('/dashboard/inventory')} 
                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-full shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
                        >
                            <IconArrowLeft />
                        </button>
                        
                        <div className="flex items-center gap-2 group">
                            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-1.5 rounded-lg text-white shadow-sm shadow-blue-500/30">
                                <IconPackage />
                            </div>
                            <h1 className="text-base md:text-lg font-black text-slate-800 tracking-tight hidden sm:block">รับสินค้าเข้า</h1>
                        </div>
                    </div>
                    
                    {/* Tab Switcher */}
                    <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/50">
                        <button 
                            onClick={() => { setViewMode('scan'); setActiveProduct(null); }} 
                            className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all duration-300 ${viewMode === 'scan' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <IconScan />
                            <span>สแกน</span>
                        </button>
                        <button 
                            onClick={() => setViewMode('review')} 
                            className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all duration-300 ${viewMode === 'review' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <IconList /> 
                            <span>ตรวจสอบ</span>
                            {drafts.length > 0 && (
                                <span className={`transition-all duration-300 ${viewMode === 'review' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-500 text-white'} text-[10px] px-1.5 py-0.5 rounded-full font-black shadow-sm`}>
                                    {drafts.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 max-w-4xl mx-auto mt-2">
                {viewMode === 'scan' ? (
                    <div className="space-y-4 animate-fade-in-up max-w-md mx-auto mt-4">
                        <div className="text-center mb-4">
                            <h2 className="text-xl md:text-2xl font-black text-slate-800">ยิงบาร์โค้ด</h2>
                            <p className="text-slate-500 text-xs md:text-sm mt-1">ใช้ปืนสแกนยิงหรือพิมพ์รหัสสินค้า</p>
                        </div>

                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 relative group transition-all duration-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                            <form onSubmit={handleManualScan} className="relative flex items-center">
                                <div className="pl-4 pr-2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300">
                                    <IconBarcode />
                                </div>
                                <input
                                    ref={barcodeInputRef}
                                    type="text"
                                    inputMode="none"
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    placeholder="รหัสสินค้า / SKU..."
                                    className="w-full py-3 text-lg font-bold font-mono tracking-wide bg-transparent outline-none text-slate-700 placeholder:text-slate-300 placeholder:font-sans placeholder:font-medium"
                                    autoComplete="off"
                                />
                                <div className="pr-1.5">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCamera(!showCamera)} 
                                        className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90 ${showCamera ? 'bg-rose-100 text-rose-600' : 'bg-slate-800 text-white hover:bg-blue-600 shadow-sm'}`}
                                    >
                                        <IconCamera />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {showCamera && (
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 animate-scale-in">
                                <div id="reader" className="w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner aspect-square object-cover"></div>
                                <div className="flex justify-center mt-3">
                                    <span className="bg-blue-50 text-blue-600 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 border border-blue-100">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                        กำลังรอสแกน...
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="bg-slate-900 p-4 rounded-2xl shadow-md text-white flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">จำนวนรายการ</p>
                                        <p className="text-2xl font-black">{drafts.length} <span className="text-xs font-medium text-slate-400">SKU</span></p>
                                    </div>
                                    <div className="text-right border-l border-white/10 pl-6">
                                        <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-1">ชิ้นรวมทั้งหมด</p>
                                        <p className="text-2xl font-black text-blue-400">{totalQty} <span className="text-xs font-medium text-blue-500/80">ชิ้น</span></p>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                                    <label className="block text-xs font-bold text-slate-600 mb-2">อ้างอิง / หมายเหตุ</label>
                                    <input 
                                        type="text" 
                                        placeholder="เลขที่เอกสาร, PO..." 
                                        value={refNo} 
                                        onChange={(e) => setRefNo(e.target.value)} 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 outline-none transition-all" 
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <button 
                                        onClick={() => setIsListExpanded(!isListExpanded)}
                                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors active:bg-slate-200"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="text-slate-400"><IconList /></div>
                                            <span className="font-bold text-sm text-slate-700">รายการสินค้า</span>
                                            {drafts.length > 0 && (
                                                <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-black">{drafts.length}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <span className="text-xs font-bold">{isListExpanded ? 'ซ่อน' : 'แสดงทั้งหมด'}</span>
                                            <IconChevronDown isOpen={isListExpanded} />
                                        </div>
                                    </button>

                                    {isListExpanded && (
                                        <div className="p-3 border-t border-slate-100 bg-white">
                                            <div className="space-y-2">
                                                {drafts.map((item, index) => (
                                                    <div 
                                                        key={item.id} 
                                                        className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3 animate-fade-in-up"
                                                        style={{ animationDelay: `${index * 0.03}s` }}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                                            <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-slate-400 font-bold text-[10px] shrink-0 border border-slate-100">
                                                                {index + 1}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                                                                <p className="text-[10px] font-mono text-slate-500 mt-0.5">{item.barcode}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <div className="bg-blue-100/50 px-2 py-1 rounded-lg border border-blue-200/50">
                                                                <span className="font-black text-sm text-blue-700">+{item.qty}</span>
                                                            </div>
                                                            <button onClick={() => removeDraftItem(item.id)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500 rounded-lg transition-colors">
                                                                <IconTrash />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {drafts.length === 0 && (
                                                    <div className="py-8 text-center text-slate-400">
                                                        <p className="text-sm font-bold">ไม่มีรายการรับเข้า</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- FAB ยืนยันการบันทึก --- */}
            {viewMode === 'review' && drafts.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-white border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] pb-safe">
                    <div className="max-w-2xl mx-auto">
                        <button 
                            onClick={() => submitToCloud(refNo, 'รับเข้าผ่านแอป')} 
                            disabled={isSaving} 
                            className="w-full py-3.5 bg-blue-600 text-white font-bold text-base rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                        >
                            {isSaving ? 'กำลังบันทึก...' : `ยืนยันรับเข้าสต็อก (${totalQty} ชิ้น)`}
                        </button>
                    </div>
                </div>
            )}

            {/* ================= Modal ใส่จำนวน ================= */}
            {activeProduct && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white p-5 md:p-6 rounded-3xl shadow-2xl w-full max-w-sm relative animate-scale-in">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white p-2.5 rounded-full shadow-lg border-4 border-white">
                            <IconCheck />
                        </div>
                        <div className="text-center mt-6 mb-5">
                            <h2 className="text-lg font-black text-slate-800 line-clamp-2 leading-tight mb-1">{activeProduct.name}</h2>
                            <span className="inline-block bg-slate-100 text-slate-500 font-mono text-xs px-2.5 py-1 rounded-lg">
                                {activeProduct.barcode || activeProduct.sku || '-'}
                            </span>
                        </div>
                        <form onSubmit={handleSaveQty} className="space-y-4">
                            <div>
                                <input 
                                    ref={qtyInputRef}
                                    type="number"
                                    inputMode="numeric"
                                    value={inputQty}
                                    onChange={(e) => setInputQty(e.target.value)}
                                    onFocus={(e) => e.target.select()} 
                                    className="w-full p-4 text-4xl font-black text-center bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                                />
                                <p className="text-[10px] text-center text-slate-400 mt-2">ใส่ - (ลบ) ด้านหน้าเพื่อลดยอด</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <button 
                                    type="button" 
                                    onClick={() => { setActiveProduct(null); setInputQty('1'); barcodeInputRef.current?.focus(); }} 
                                    className="py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button 
                                    type="submit" 
                                    className="py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-sm active:bg-blue-600 transition-colors"
                                >
                                    ตกลง
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}