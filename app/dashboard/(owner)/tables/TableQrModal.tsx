'use client';

import React, { useEffect, useState } from 'react';
import { generateTableQrTokensAction } from '@/app/actions/tableActions';

const IconX = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconPrinter = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const IconExternalLink = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1-2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
const IconAlertTriangle = ({ size = 48 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

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
    qrMode?: 'rotating' | 'static';
    onClose: () => void;
    limitStatus?: { isLocked: boolean; usage: number; limit: number; plan: string } | null;
}

export default function TableQrModal({ table, brandId, brandSlug, qrLogoUrl, qrMode = 'rotating', onClose, limitStatus }: TableQrModalProps) {
    const readActiveTokens = () => (
        Array.isArray(table?.access_tokens) && table.access_tokens.length > 0 ? table.access_tokens : [table?.access_token]
    ).filter(Boolean).map(String);

    const [printCount, setPrintCount] = useState(1);
    const [activeTokens, setActiveTokens] = useState<string[]>(readActiveTokens);
    const [mainToken, setMainToken] = useState<string>(readActiveTokens()[0] || '');
    const [viewMode, setViewMode] = useState<'main' | 'multi'>('main');
    const [isGenerating, setIsGenerating] = useState(false);

    const isLocked = limitStatus?.isLocked;
    const isStaticQr = qrMode === 'static';
    const previewToken = mainToken || activeTokens[0] || table?.access_token || '';

    useEffect(() => {
        const tokens = readActiveTokens();
        setActiveTokens(tokens);
        setMainToken(current => current && tokens.includes(current) ? current : (tokens[0] || ''));
    }, [table?.id, table?.access_token, JSON.stringify(table?.access_tokens || [])]);

    if (!table) return null;

    const getOrderUrl = (token = previewToken) => {
        if (typeof window === 'undefined' || !brandId) return '';
        const prefix = brandSlug || 'shop';
        const tablePath = isStaticQr ? table.id : `${table.id}${token}`;
        return `${window.location.origin}/${prefix}/${brandId}/table/${tablePath}`;
    };

    const getQRUrl = (token = previewToken) => {
        const encodedData = encodeURIComponent(getOrderUrl(token));
        return `https://quickchart.io/qr?text=${encodedData}&size=400&ecLevel=H&margin=1`;
    };

    const printViaBrowser = (tokens: string[]) => {
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            window.print();
            return;
        }

        const cards = tokens.map((token, index) => `
            <div class="card">
                <h2>Table ${table.label}</h2>
                <img src="${getQRUrl(token)}" />
                <div class="token">${token}</div>
                <p>${index + 1}/${tokens.length}</p>
            </div>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Table QR</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 16px; }
                        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
                        .card { border: 1px solid #ddd; border-radius: 16px; padding: 16px; text-align: center; break-inside: avoid; }
                        img { width: 220px; height: 220px; object-fit: contain; }
                        h2 { margin: 0 0 8px; font-size: 24px; }
                        .token { font-size: 22px; font-weight: 800; letter-spacing: 6px; margin-top: 8px; }
                        p { color: #777; margin: 6px 0 0; }
                    </style>
                </head>
                <body><div class="grid">${cards}</div></body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    };

    const handleGenerateTokens = async () => {
        if (isStaticQr) return;
        setIsGenerating(true);
        const res = await generateTableQrTokensAction(table.id, printCount);
        setIsGenerating(false);

        if (!res.success || !res.tokens) {
            alert(res.error || 'Generate QR failed');
            return;
        }

        setActiveTokens(res.tokens);
        setMainToken(res.tokens[0] || '');
    };

    const openTokenOnMain = (token: string) => {
        setMainToken(token);
        setViewMode('main');
    };

    const printTokens = (tokens: string[]) => {
        const safeTokens = tokens.filter(Boolean);
        if (safeTokens.length === 0) return;

        if (!isStaticQr) {
            const qrCodes = safeTokens.map((token, index) => ({
                brandName: (brandSlug || 'FOODSCAN').toUpperCase(),
                tableLabel: table.label,
                passcode: token,
                orderUrl: getOrderUrl(token),
                index: index + 1,
                total: safeTokens.length
            }));

            if (typeof window !== 'undefined' && (window as any).AndroidBridge) {
                qrCodes.forEach((qrData, index) => {
                    setTimeout(() => {
                        (window as any).AndroidBridge.printTableQr(JSON.stringify(qrData));
                    }, index * 300);
                });
            } else {
                printViaBrowser(safeTokens);
            }
            return;
        }

        const printData = {
            brandName: (brandSlug || 'FOODSCAN').toUpperCase(),
            tableLabel: table.label,
            passcode: '',
            orderUrl: getOrderUrl()
        };

        if (typeof window !== 'undefined' && (window as any).AndroidBridge) {
            (window as any).AndroidBridge.printTableQr(JSON.stringify(printData));
        } else {
            window.print();
        }
    };

    const renderMainView = () => (
        <>
            <div className="bg-white p-4 rounded-[3rem] border-[10px] border-white shadow-2xl mb-6 relative z-20 -mt-8 animate-in zoom-in duration-300 delay-75">
                <QrCodeWithLogo url={getQRUrl()} logo={qrLogoUrl} />
            </div>

            <div className="bg-slate-50 p-5 rounded-3xl mb-4 border border-slate-100 w-full text-center">
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">
                    {isStaticQr ? 'QR Mode' : 'Table Passcode'}
                </label>
                <p className={`font-black text-slate-900 font-mono leading-none select-all ${isStaticQr ? 'text-xl tracking-wider' : 'text-4xl tracking-[0.28em]'}`}>
                    {isStaticQr ? 'STATIC TABLE QR' : previewToken}
                </p>
            </div>

            {!isStaticQr && (
                <button
                    onClick={() => setViewMode('multi')}
                    className="w-full mb-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 text-[11px] font-black uppercase tracking-wider hover:bg-slate-50 active:scale-95 transition-all"
                >
                    พิมพ์หลายใบ ({activeTokens.length})
                </button>
            )}

            <div className="grid grid-cols-2 gap-3 w-full">
                <a href={getOrderUrl()} target="_blank" rel="noopener noreferrer" className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-wider hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                    <IconExternalLink size={14} /> ทดสอบ
                </a>
                <button
                    onClick={() => printTokens(isStaticQr ? [previewToken] : [previewToken])}
                    disabled={!isStaticQr && !previewToken}
                    className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-lg hover:bg-blue-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <IconPrinter size={14} /> พิมพ์ใบนี้
                </button>
            </div>
        </>
    );

    const renderMultiView = () => (
        <div className="w-full pt-2 pb-1 space-y-4 animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between gap-3">
                <button
                    onClick={() => setViewMode('main')}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-black hover:bg-slate-200"
                >
                    กลับ
                </button>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    QR ทั้งหมด ({activeTokens.length})
                </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    ต้องการสร้างกี่ใบ
                </label>
                <div className="grid grid-cols-5 gap-2 mb-3">
                    {[1, 4, 5, 10].map(count => (
                        <button
                            key={count}
                            onClick={() => setPrintCount(count)}
                            className={`py-2 rounded-xl text-xs font-black transition-all ${printCount === count ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            {count}
                        </button>
                    ))}
                    <input
                        type="number"
                        min={1}
                        max={50}
                        value={printCount}
                        onChange={(e) => setPrintCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                        className="w-full py-2 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs font-black outline-none"
                    />
                </div>
                <button
                    onClick={handleGenerateTokens}
                    disabled={isGenerating}
                    className="w-full py-3 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg hover:bg-blue-700 disabled:opacity-60 active:scale-95 transition-all"
                >
                    {isGenerating ? 'กำลังสร้าง...' : `สร้างชุดใหม่ ${printCount} ใบ`}
                </button>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                    {activeTokens.map((token) => {
                        const active = token === previewToken;
                        return (
                            <button
                                key={token}
                                onClick={() => openTokenOnMain(token)}
                                className={`py-3 rounded-xl border text-xs font-black font-mono tracking-[0.2em] transition-all ${active ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                            >
                                {token}
                            </button>
                        );
                    })}
                </div>
            </div>

            <button
                onClick={() => printTokens(activeTokens)}
                disabled={isGenerating || activeTokens.length === 0}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-lg hover:bg-emerald-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
                <IconPrinter size={14} /> พิมพ์ทั้งหมด ({activeTokens.length})
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[400] grid place-items-center p-4">
            <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm cursor-pointer animate-in fade-in duration-200" onClick={onClose}></div>

            <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-200 border border-white/10">
                <div className={`p-8 pb-14 text-center relative ${isLocked ? 'bg-red-500' : 'bg-slate-900'}`}>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-50 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95"
                    >
                        <IconX size={20} />
                    </button>
                    <h3 className="text-4xl font-black text-white uppercase mb-1 drop-shadow-sm">โต๊ะ {table.label}</h3>
                    <p className={`${isLocked ? 'text-red-200' : 'text-blue-400'} text-[10px] font-black uppercase tracking-[0.2em]`}>
                        {isLocked ? 'SERVICE UNAVAILABLE' : (viewMode === 'multi' ? 'Print Multiple QR' : 'Scan to Order')}
                    </p>
                </div>

                <div className="relative -mt-10 px-8 pb-8 flex flex-col items-center bg-white rounded-t-[40px]">
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
                        viewMode === 'multi' && !isStaticQr ? renderMultiView() : renderMainView()
                    )}
                </div>
            </div>
        </div>
    );
}