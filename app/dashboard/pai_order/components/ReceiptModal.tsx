'use client';

import React, { useRef } from 'react';

// --- Icons ---
const IconPrinter = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const IconX = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconStore = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21v-7"/><path d="M19 21v-7"/><path d="M2 10l20 0"/><path d="M2 10l2-4h16l2 4"/></svg>;
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconTag = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IconFileText = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;

// --- Helpers ---
const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(amount || 0);

const formatDateReceipt = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
};

interface ReceiptModalProps {
    receipt: any;
    items?: any[];
    onClose: () => void;
}

export default function ReceiptModal({ receipt, items, onClose }: ReceiptModalProps) {
    const printRef = useRef<HTMLDivElement>(null);

    // 1. เตรียมข้อมูล items
    const displayItems = items || receipt?.items || [];

    // 2. ฟังก์ชันช่วยดึงค่ายอดลด (รองรับทั้ง key เก่าและใหม่)
    const getDiscountValue = (promo: any) => {
        if (!promo) return 0;
        // ✅ เช็คทั้ง savedAmount (POS) และ discount_amount (Database)
        return Number(promo.savedAmount || promo.discount_amount || 0);
    };

    // 3. คำนวณยอดประหยัดรวม (Total Saved)
    const totalSaved = displayItems.reduce((sum: number, item: any) => {
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

    if (!receipt) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh]">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-700">รายละเอียดใบเสร็จ</h3>
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

                        {/* 2. รายการสินค้า */}
                        <div className="space-y-3 mb-4">
                            {displayItems.length > 0 ? (
                                displayItems.map((item: any, index: number) => {
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
                                                            {promo.name ? ` (${promo.name})` : ''}
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