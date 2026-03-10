'use client';

import React from 'react';

const IconPrinter = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;
const IconClose = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function KitchenTicketModal({ order, onClose }: { order: any, onClose: () => void }) {
    if (!order) return null;

    // ฟังก์ชันช่วยแยกชื่อตัวเลือกออกมาให้สะอาดที่สุด
    const parseNote = (fullNote: string) => {
        if (!fullNote) return { noodle: '', comment: '' };
        
        const match = fullNote.match(/\[(.*?)\]/); 
        if (match) {
            const inside = match[1];
            // ตัดคำว่า "เลือก...:" หรือ "เส้นที่เลือก:" ออก
            const cleanOption = inside.includes(':') ? inside.split(':')[1].trim() : inside;
            
            return {
                noodle: cleanOption, 
                comment: fullNote.replace(match[0], '').trim()
            };
        }
        return { noodle: '', comment: fullNote };
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:bg-white print:p-0 font-sans">
            
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { margin: 0; }
                    body * { visibility: hidden; }
                    .print-section, .print-section * { visibility: visible; }
                    .print-section { 
                        position: absolute; left: 0; top: 0; width: 80mm; padding: 4mm; margin: 0;
                        font-family: sans-serif;
                    }
                    .no-print { display: none !important; }
                }
            `}} />

            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl print:shadow-none print:rounded-none">
                
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white no-print">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                            <IconPrinter size={16} />
                        </div>
                        <h3 className="font-bold text-slate-800 tracking-tight">พิมพ์ใบสั่งครัว</h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                        <IconClose size={18} /> 
                    </button>
                </div>

                {/* 📄 เนื้อหาใบสั่งอาหาร (Standard Minimal) */}
                <div className="print-section bg-white text-slate-900 p-8 overflow-y-auto">
                    <div className="text-center border-b border-slate-900 pb-6 mb-6">
                        <h2 className="text-lg font-medium tracking-widest uppercase opacity-60 mb-1">Kitchen Ticket</h2>
                        <p className="text-6xl font-bold">โต๊ะ {order.table_label}</p>
                    </div>

                    <div className="space-y-6">
                        {order.order_items?.map((item: any) => {
                            const { noodle, comment } = parseNote(item.note);
                            const variantTh = item.variant === 'special' ? 'พิเศษ' : item.variant === 'jumbo' ? 'จัมโบ้' : '';

                            return (
                                <div key={item.id} className={`relative pb-4 border-b border-slate-100 last:border-0 ${item.status === 'cancelled' ? 'opacity-30' : ''}`}>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            {/* ชื่อเมนู + ไซส์ (ถ้ามี) */}
                                            <p className="text-xl font-bold leading-snug">
                                                {item.product_name}
                                                {variantTh && (
                                                    <span className="ml-2 text-2xl font-black underline decoration-2">
                                                        ({variantTh})
                                                    </span>
                                                )}
                                            </p>
                                            
                                            {/* ตัวเลือกเสริม/เส้น */}
                                            {noodle && (
                                                <p className="text-lg font-semibold text-slate-600 mt-1">
                                                    - {noodle}
                                                </p>
                                            )}

                                            {/* หมายเหตุพิเศษ */}
                                            {comment && (
                                                <div className="mt-2 pl-3 border-l-2 border-slate-900">
                                                    <p className="text-lg font-medium italic">
                                                        {comment}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* จำนวน */}
                                        <div className="text-3xl font-bold shrink-0">
                                            x{item.quantity}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-10 pt-4 border-t border-slate-900 border-dashed text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">End of Order</p>
                    </div>
                </div>

                {/* ปุ่มกดสั่งการ (No-Print) */}
                <div className="p-4 bg-white border-t border-slate-50 flex gap-3 no-print">
                    <button onClick={onClose} className="flex-1 py-3.5 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all">
                        ยกเลิก
                    </button>
                    <button onClick={() => window.print()} className="flex-[2] py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <IconPrinter size={18} /> พิมพ์ใบสั่งครัว
                    </button>
                </div>
            </div>
        </div>
    );
}