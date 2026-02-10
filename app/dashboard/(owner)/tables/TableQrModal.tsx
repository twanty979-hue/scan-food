'use client';

import React from 'react';

// --- Icons ---
const IconX = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconPrinter = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const IconExternalLink = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1-2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
const IconAlertTriangle = ({ size = 48 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

// --- Component: QR Code ---
const QrCodeWithLogo = ({ url, logo }: { url: string, logo: string | null }) => (
    <div className="relative w-64 h-64 bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
        <img src={url} alt="QR Code" className="w-full h-full object-contain p-2" />
        {logo && (
            <div className="absolute inset-0 m-auto w-16 h-16 rounded-full border-[4px] border-white bg-white shadow-xl overflow-hidden flex items-center justify-center z-10">
                <img src={logo} alt="Brand Logo" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
        )}
    </div>
);

interface TableQrModalProps {
    table: any;
    brandId: string | null;
    brandSlug: string; 
    qrLogoUrl: string | null;
    onClose: () => void;
    limitStatus?: { isLocked: boolean; usage: number; limit: number; plan: string } | null;
}

export default function TableQrModal({ table, brandId, brandSlug, qrLogoUrl, onClose, limitStatus }: TableQrModalProps) {
    if (!table) return null;

    // 🔥 ด่านสุดท้าย: ถ้า Limit เกิน -> แสดงหน้า Error แทน QR Code
    const isLocked = limitStatus?.isLocked;

    const getOrderUrl = () => {
        if (typeof window === 'undefined' || !brandId) return '';
        const prefix = brandSlug || 'shop';
        return `${window.location.origin}/${prefix}/${brandId}/table/${table.id}${table.access_token}`;
    };

    const getQRUrl = () => {
        const orderUrl = getOrderUrl();
        const encodedData = encodeURIComponent(orderUrl);
        return `https://quickchart.io/qr?text=${encodedData}&size=400&ecLevel=H&margin=1`;
    };

    return (
        // ✅ ปรับ z-index เป็น 400 เพื่อให้แน่ใจว่าอยู่เหนือ Modal เลือกโต๊ะ (z-300) และ Floating Bar (z-150)
        <div className="fixed inset-0 z-[400] grid place-items-center p-4">
            <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm cursor-pointer animate-in fade-in duration-200" onClick={onClose}></div>

            <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-200 border border-white/10">
                
                {/* Header */}
                <div className={`p-8 pb-14 text-center relative ${isLocked ? 'bg-red-500' : 'bg-slate-900'}`}>
                    <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95">
                        <IconX size={20} />
                    </button>
                    <h3 className="text-4xl font-black text-white uppercase mb-1 drop-shadow-sm">โต๊ะ {table.label}</h3>
                    <p className={`${isLocked ? 'text-red-200' : 'text-blue-400'} text-[10px] font-black uppercase tracking-[0.2em]`}>
                        {isLocked ? 'SERVICE UNAVAILABLE' : 'Scan to Order'}
                    </p>
                </div>
                
                {/* Body */}
                <div className="relative -mt-10 px-8 pb-8 flex flex-col items-center bg-white rounded-t-[40px]">
                    
                    {/* ✅ CASE 1: ถ้าติด Limit -> โชว์ Error */}
                    {isLocked ? (
                        <div className="flex flex-col items-center pt-10 pb-6 w-full text-center animate-in slide-in-from-bottom-4 duration-300">
                            <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-red-100 shadow-lg">
                                <IconAlertTriangle size={48} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">ระงับการใช้งานชั่วคราว</h2>
                            <p className="text-slate-500 font-bold mb-6 text-sm">
                                แพ็กเกจฟรีจำกัด {limitStatus?.limit} ออเดอร์/เดือน <br/>
                                <span className="text-red-500 font-black">(ใช้ไปแล้ว {limitStatus?.usage})</span>
                            </p>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-full mb-4">
                                <p className="text-xs text-slate-400">กรุณาติดต่อเจ้าของร้านเพื่ออัปเกรดแพ็กเกจ หรือรอรอบบิลถัดไป</p>
                            </div>
                            <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 active:scale-95 transition-all">
                                เข้าใจแล้ว
                            </button>
                        </div>
                    ) : (
                    /* ✅ CASE 2: ปกติ -> โชว์ QR Code */
                        <>
                            <div className="bg-white p-4 rounded-[3rem] border-[10px] border-white shadow-2xl mb-8 relative z-20 -mt-8 animate-in zoom-in duration-300 delay-75">
                                <QrCodeWithLogo url={getQRUrl()} logo={qrLogoUrl} />
                            </div>

                            <div className="bg-slate-50 p-5 rounded-3xl mb-6 border border-slate-100 w-full text-center">
                                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Table Passcode</label>
                                <p className="text-4xl font-black text-slate-900 tracking-[0.4em] font-mono leading-none select-all">{table.access_token}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <a href={getOrderUrl()} target="_blank" rel="noopener noreferrer" className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                                    <IconExternalLink size={14} /> ทดสอบลิงก์
                                </a>
                                <button onClick={() => window.print()} className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95">
                                    <IconPrinter size={14} /> พิมพ์ QR Code
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}