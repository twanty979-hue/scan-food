'use client';

import React, { useRef } from 'react';

// --- Icons (เฉพาะปุ่มด้านนอก ไม่ปริ้นลงบิล) ---
const IconPrinter = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const IconX = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

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

    // 2. ฟังก์ชันดึงค่ายอดลด (รองรับทั้ง Walk-in และ โต๊ะ)
    const getDiscountValue = (item: any) => {
        if (item.discount && Number(item.discount) > 0) return Number(item.discount);
        const promo = item.promotion_snapshot;
        if (promo) return Number(promo.savedAmount || promo.discount_amount || promo.discount || 0);
        return 0;
    };

    // 3. คำนวณยอดแบบละเอียดเพื่อโชว์ท้ายบิล
    let subTotal = 0;
    let totalDiscount = 0;

    displayItems.forEach((item: any) => {
        if (item.status === 'cancelled') return;
        const savedPerUnit = getDiscountValue(item);
        // ราคาเต็ม = ราคาที่ขาย + ส่วนลดที่ลดไปแล้ว
        const originalPricePerUnit = Number(item.price) + savedPerUnit;
        
        subTotal += (originalPricePerUnit * item.quantity);
        totalDiscount += (savedPerUnit * item.quantity);
    });

    const netTotal = receipt.total_amount;

    const handlePrint = () => {
        const printData = {
            brandName: receipt.brand?.name || "ร้านค้า",
            tableName: receipt.table_label || "Walk-in",
            orderId: receipt.id.slice(0, 8),
            date: formatDateReceipt(receipt.created_at),
            items: displayItems.map((item: any) => {
                const saved = getDiscountValue(item);
                let variantTh = item.variant === 'special' ? 'พิเศษ' : item.variant === 'jumbo' ? 'จัมโบ้' : '';
                return {
                    name: item.product_name || item.name,
                    qty: item.quantity,
                    price: item.price,
                    variant: variantTh,
                    note: item.note || '',
                    discount: saved * item.quantity,
                    isCancelled: item.status === 'cancelled'
                }
            }),
            subTotal: subTotal,
            totalDiscount: totalDiscount,
            totalAmount: netTotal,
            receivedAmount: receipt.received_amount || netTotal,
            changeAmount: receipt.change_amount || 0,
            paymentMethod: receipt.payment_method,
            cashier: receipt.cashier?.full_name || 'System'
        };

        if (typeof window !== 'undefined' && (window as any).AndroidBridge) {
            (window as any).AndroidBridge.printReceipt(JSON.stringify(printData));
        } else {
            const content = printRef.current?.innerHTML;
            const printWindow = window.open('', '', 'width=400,height=600');
            if (printWindow && content) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Print Receipt</title>
                            <style>
                                body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; color: #000; }
                                .text-center { text-align: center; }
                                .text-right { text-align: right; }
                                .font-bold { font-weight: bold; }
                                .flex { display: flex; justify-content: space-between; }
                                .border-b { border-bottom: 1px dashed #000; margin: 10px 0; }
                                .text-red-500 { color: #000 !important; }
                                .line-through { text-decoration: line-through; }
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
        }
    };

    if (!receipt) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
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
                        <div className="space-y-4 mb-4">
                            {displayItems.map((item: any, index: number) => {
                                const isCancelled = item.status === 'cancelled';
                                const savedPerUnit = getDiscountValue(item);
                                const isDiscounted = !isCancelled && savedPerUnit > 0;
                                const originalPricePerUnit = Number(item.price) + savedPerUnit;

                                // แปลงไซส์เป็นไทย
                                const variantTh = item.variant === 'special' ? 'พิเศษ' : item.variant === 'jumbo' ? 'จัมโบ้' : '';

                                return (
                                    <div key={index} className={`flex justify-between items-start ${isCancelled ? 'text-slate-400' : ''}`}>
                                        <div className="flex-1 pr-2">
                                            <div className={isCancelled ? 'line-through' : 'font-bold'}>
                                                <span>{item.quantity}x</span> {item.product_name || item.name}
                                            </div>
                                            
                                            <div className="flex flex-col gap-0.5 mt-0.5 text-[11px] pl-4 text-slate-500">
                                                {variantTh && <span>- {variantTh}</span>}
                                                {item.note && <span>** {item.note}</span>}
                                                {isDiscounted && (
                                                    <span className="text-red-500 font-bold italic">
                                                        (ส่วนลด: -{formatCurrency(savedPerUnit * item.quantity)})
                                                    </span>
                                                )}
                                                {isCancelled && <span className="text-red-500 font-bold">(ยกเลิกแล้ว)</span>}
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            {isDiscounted && (
                                                <p className="text-[10px] text-slate-400 line-through">
                                                    {formatCurrency(originalPricePerUnit * item.quantity)}
                                                </p>
                                            )}
                                            <p className={`font-black ${isCancelled ? 'line-through' : (isDiscounted ? 'text-red-500' : 'text-slate-900')}`}>
                                                {formatCurrency(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border-b border-dashed border-slate-300 my-4"></div>

                        {/* 3. ยอดรวม & ส่วนลดแบบละเอียด */}
                        <div className="space-y-1 text-slate-600 text-[12px]">
                            <div className="flex justify-between items-center">
                                <span>ยอดรวม (Subtotal)</span>
                                <span>{formatCurrency(subTotal)}</span>
                            </div>
                            
                            {totalDiscount > 0 && (
                                <div className="flex justify-between items-center text-red-500 font-bold">
                                    <span>ส่วนลดรวม (Discount)</span>
                                    <span>-{formatCurrency(totalDiscount)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-lg font-black text-slate-900 pt-2 mt-2 border-t border-slate-200">
                                <span>ยอดรวมสุทธิ</span>
                                <span>{formatCurrency(netTotal)}</span>
                            </div>
                        </div>

                        <div className="border-b border-dashed border-slate-300 my-4"></div>

                        {/* 4. รายละเอียดการชำระเงิน */}
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="font-bold uppercase">ชำระโดย / {receipt.payment_method}</span>
                            </div>
                            
                            {(receipt.received_amount > 0 || receipt.change_amount > 0) && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span>รับเงิน (Received)</span>
                                        <span>{formatCurrency(receipt.received_amount || netTotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-900 font-bold">
                                        <span>เงินทอน (Change)</span>
                                        <span>{formatCurrency(receipt.change_amount || 0)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="border-b border-dashed border-slate-300 my-6"></div>

                        {/* 5. Footer */}
                        <div className="text-center space-y-1">
                            <div className="text-[10px] text-slate-400 uppercase">
                                Cashier: {receipt.cashier?.full_name || 'System'}
                            </div>
                            <p className="text-xs font-bold mt-4 uppercase">ขอบคุณที่ใช้บริการ / THANK YOU</p>
                        </div>

                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
                    <button 
                        onClick={handlePrint} 
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                        <IconPrinter /> พิมพ์ใบเสร็จ
                    </button>
                </div>
            </div>
        </div>
    );
}