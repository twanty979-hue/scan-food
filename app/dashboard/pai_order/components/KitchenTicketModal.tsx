'use client';

import React, { useRef, useEffect } from 'react';

// --- Icons ---
const IconPrinter = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const IconX = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconClock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

interface KitchenTicketModalProps {
    order: any;
    onClose: () => void;
    autoPrint?: boolean;
}

export default function KitchenTicketModal({ order, onClose, autoPrint = false }: KitchenTicketModalProps) {
    const printRef = useRef<HTMLDivElement>(null);

    // 🌟 ดึงรายการอาหารมาเตรียมไว้ (ดักจับทั้ง order_items และ items ป้องกันหาไม่เจอ)
    const itemsList = order?.order_items || order?.items || [];

    const formatTime = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    };

    const handlePrint = () => {
        // จัดรูปแบบข้อมูลแบบเป๊ะๆ เพื่อส่งให้ Android (แปลงเป็น String/Number ป้องกัน Error)
        const printData = {
            tableName: String(order?.table_label || "Walk-in"),
            orderId: String(order?.id?.slice(0, 8) || "00000000"),
            time: String(formatTime(order?.created_at)),
            items: itemsList.map((item: any) => ({
                name: String(item.product_name || item.name || "รายการอาหาร"),
                qty: Number(item.quantity || 1),
                
                // 🌟 จุดสำคัญ: เพิ่ม price เข้าไปหลอก Android (ใส่เป็น 0 ก็ได้) ป้องกัน Error Data Class ไม่ครบ
                price: Number(item.price || 0), 

                variant: item.variant !== 'normal' && item.variant ? String(item.variant) : '',
                isCancelled: Boolean(item.status === 'cancelled')
            }))
        };

        if (typeof window !== 'undefined' && (window as any).AndroidBridge) {
            // โยนข้อมูลให้ Android ทำงาน
            (window as any).AndroidBridge.printKitchenTicket(JSON.stringify(printData));
        } else {
            // ถ้าเปิดบนคอม ให้พิมพ์ผ่าน Browser
            window.print();
        }
    };

    useEffect(() => {
        // Auto Print จะทำงานก็ต่อเมื่อมีรายการอาหารเท่านั้น
        if (autoPrint && order && itemsList.length > 0) {
            handlePrint();
        }
    }, [autoPrint, order]);

    if (!order) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-slate-100">
                
                {/* Header: เปลี่ยนเป็นสีอ่อนลง เพื่อให้อ่านง่ายและดูสะอาดตา */}
                <div className="bg-orange-50 p-5 flex justify-between items-center border-b border-orange-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl font-black text-2xl flex items-center justify-center shadow-md">
                            {order.table_label || 'W'}
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-slate-800 tracking-tight">ใบสั่งอาหาร</h3>
                            <p className="text-sm font-bold text-orange-600">เข้าครัว (Kitchen)</p>
                        </div>
                    </div>
                </div>

                {/* Content: ส่วนแสดงรายการอาหาร */}
                <div className="p-6 overflow-y-auto bg-white text-slate-900 font-mono min-h-[200px] max-h-[50vh]">
                    <div ref={printRef}>
                        <div className="text-center border-b-2 border-dashed border-slate-200 pb-4 mb-4">
                            <h2 className="text-3xl font-black mb-2 text-slate-800">โต๊ะ {order.table_label}</h2>
                            <div className="flex justify-center items-center gap-3 text-sm font-bold text-slate-400">
                                <span className="flex items-center gap-1"><IconClock /> {formatTime(order.created_at)}</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded-md">#{order.id.slice(0, 8)}</span>
                            </div>
                        </div>

                        {/* List รายการอาหาร */}
                        <div className="space-y-4">
                            {itemsList.length === 0 ? (
                                <div className="text-center text-rose-500 font-bold py-8 bg-rose-50 rounded-2xl border border-rose-100">
                                    ⚠️ ไม่พบรายการอาหารในระบบ
                                </div>
                            ) : (
                                itemsList.map((item: any, idx: number) => (
                                    <div key={idx} className={`flex items-start gap-3 ${item.status === 'cancelled' ? 'opacity-40' : ''}`}>
                                        <div className="bg-slate-800 text-white font-black text-xl min-w-[40px] h-10 flex items-center justify-center rounded-xl shadow-sm">
                                            {item.quantity}
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <p className="text-lg font-bold leading-tight uppercase text-slate-800">
                                                {item.product_name || item.name}
                                            </p>
                                            {item.variant !== 'normal' && item.variant && (
                                                <p className="text-xs font-bold text-orange-600 mt-1 bg-orange-50 px-2 py-0.5 rounded-md inline-block border border-orange-100">
                                                    ★ {item.variant}
                                                </p>
                                            )}
                                            {item.status === 'cancelled' && (
                                                <p className="text-xs font-bold text-white bg-rose-500 px-2 py-0.5 rounded-md uppercase mt-1 inline-block">
                                                    ยกเลิก
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions: ปุ่มใหญ่สะใจ กดยังไงก็โดน! */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                    <button 
                        onClick={handlePrint}
                        disabled={itemsList.length === 0} // ถ้าไม่มีอาหาร ปิดปุ่มไปเลย
                        className={`w-full py-4 rounded-[20px] font-black text-xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all
                            ${itemsList.length > 0 
                                ? 'bg-orange-500 text-white shadow-orange-200 hover:bg-orange-600' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            }
                        `}
                    >
                        <IconPrinter size={28} /> สั่งพิมพ์ใบเข้าครัว
                    </button>
                    
                    <button 
                        onClick={onClose}
                        className="w-full py-3 rounded-[20px] font-bold text-slate-500 bg-white border-2 border-slate-200 hover:bg-slate-100 hover:text-slate-700 active:scale-95 transition-all"
                    >
                        ปิดหน้าต่าง
                    </button>
                </div>

            </div>
        </div>
    );
}