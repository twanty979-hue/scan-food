'use client';

import React from 'react';

// --- 🎨 Custom SVG Icons ---
const IconX = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconPrinter = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const IconExternalLink = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1-2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;

// --- 📱 Sub-Component: QR Code พร้อมโลโก้ตรงกลาง ---
const QrCodeWithLogo = ({ url, logo }: { url: string, logo: string | null }) => (
    <div className="relative w-64 h-64 bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
        {/* รูป QR Code หลัก */}
        <img src={url} alt="QR Code" className="w-full h-full object-contain p-2" />
        
        {/* โลโก้ตรงกลาง (ถ้ามี) */}
        {logo && (
            <div className="absolute inset-0 m-auto w-16 h-16 rounded-full border-[4px] border-white bg-white shadow-xl overflow-hidden flex items-center justify-center z-10">
                <img 
                    src={logo} 
                    alt="Brand Logo" 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')} // ถ้า URL รูปผิด ให้ซ่อนโลโก้ไปเลย QR จะได้ยังแสกนได้
                />
            </div>
        )}
    </div>
);

interface TableQrModalProps {
    table: any;
    brandId: string | null;
    brandSlug: string; 
    qrLogoUrl: string | null; // รับ URL ตัวเต็มจาก Backend มาโชว์
    onClose: () => void;
}

export default function TableQrModal({ table, brandId, brandSlug, qrLogoUrl, onClose }: TableQrModalProps) {
    if (!table) return null;

    // --- 🧠 Logic: สร้าง URL สำหรับให้ลูกค้าแสกน ---
    const getOrderUrl = () => {
        if (typeof window === 'undefined' || !brandId) return '';
        const prefix = brandSlug || 'shop';
        // รูปแบบลิงก์: domain.com/shop27/uuid-แบรนด์/table/uuid-โต๊ะ?token=1234
        return `${window.location.origin}/${prefix}/${brandId}/table/${table.id}${table.access_token}`;
    };

    // --- 🧠 Logic: ดึงรูป QR จาก API โดยตั้งค่า High Error Correction (ecLevel=H) ---
    const getQRUrl = () => {
        const orderUrl = getOrderUrl();
        const encodedData = encodeURIComponent(orderUrl);
        return `https://quickchart.io/qr?text=${encodedData}&size=400&ecLevel=H&margin=1`;
    };

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4">
            {/* Backdrop: กดปิดได้ */}
            <div 
                className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm cursor-pointer" 
                onClick={onClose}
            ></div>

            {/* Modal Box */}
            <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-200">
                
                {/* Header: ชื่อโต๊ะ */}
                <div className="bg-slate-900 p-8 pb-14 text-center">
                    <button 
                        onClick={onClose} 
                        className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                    >
                        <IconX size={20} />
                    </button>
                    <h3 className="text-4xl font-black text-white uppercase mb-1">โต๊ะ {table.label}</h3>
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Scan to Order</p>
                </div>
                
                {/* Body: QR Code & Passcode */}
                <div className="relative -mt-10 px-8 pb-8 flex flex-col items-center bg-white rounded-t-[40px]">
                    
                    {/* ส่วนของ QR Code */}
                    <div className="bg-white p-4 rounded-[3rem] border-[10px] border-white shadow-2xl mb-8 relative z-20">
                        <QrCodeWithLogo url={getQRUrl()} logo={qrLogoUrl} />
                    </div>

                    {/* Passcode: สำหรับกรอกมือ */}
                    <div className="bg-slate-50 p-5 rounded-3xl mb-8 border border-slate-100 w-full text-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Table Passcode</label>
                        <p className="text-4xl font-black text-slate-900 tracking-[0.4em] font-mono leading-none">
                            {table.access_token}
                        </p>
                    </div>

                    {/* ปุ่มกดต่างๆ */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <a 
                            href={getOrderUrl()} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                            <IconExternalLink size={14} /> ทดสอบลิงก์
                        </a>
                        <button 
                            onClick={() => window.print()} 
                            className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <IconPrinter size={14} /> พิมพ์ QR Code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}