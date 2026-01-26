'use client';
import { IconStore, IconX, IconUser, IconFileText, IconTag } from './Icons';

// Helper function (ก๊อปมาเพื่อให้ไฟล์นี้ทำงานได้ หรือจะแยกไฟล์ utils ก็ได้)
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { 
        style: 'currency', currency: 'THB', minimumFractionDigits: 2, maximumFractionDigits: 2 
    }).format(amount || 0);
};

export default function ReceiptModal({ receipt, onClose }: { receipt: any; onClose: () => void }) {
    if (!receipt) return null;

    const calculateTotalSaved = (items: any[]) => {
        return items.reduce((sum, item) => {
            const promo = item.promotion_snapshot;
            return sum + (promo ? (promo.savedAmount || 0) * item.quantity : 0);
        }, 0);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
                
                {/* Header */}
                <div className="bg-slate-900 text-white p-8 shrink-0 relative">
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">ชำระเงินสำเร็จ!</h2>
                            <p className="text-orange-400 text-sm font-bold mt-1 flex items-center gap-2">
                                <IconStore size={16}/> {receipt.brand?.name || 'ร้านค้า'}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><IconX size={24}/></button>
                    </div>
                    
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                        <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700">
                            <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Cashier</p>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center text-[10px]"><IconUser /></div>
                                <p className="text-xs font-bold text-white truncate">{receipt.cashier?.full_name || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700">
                            <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Receipt ID</p>
                            <p className="text-xs font-bold text-white font-mono">#{receipt.id.slice(0, 8)}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-end relative z-10">
                        <div><p className="text-xs font-black text-slate-500 uppercase">วันที่ชำระ</p><p className="text-xs font-bold text-slate-300">{new Date(receipt.created_at).toLocaleString('th-TH')}</p></div>
                        <div className="text-right"><p className="text-xs font-black text-slate-500 uppercase">โต๊ะ</p><p className="text-xl font-black text-white uppercase">{receipt.table_label}</p></div>
                    </div>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-slate-50">
                    <div className="space-y-3">
                        {receipt.items.map((item: any, idx: number) => {
                            const promo = item.promotion_snapshot;
                            const saved = promo ? (promo.savedAmount || 0) : 0;
                            const originalPrice = promo ? (item.price + saved) : item.price;
                            return (
                                <div key={idx} className="flex justify-between items-start border-b border-dashed border-slate-200 pb-3 last:border-0">
                                    <div className="flex gap-3">
                                        <span className="font-black text-slate-400">{item.quantity}x</span>
                                        <div>
                                            <p className="text-sm font-black text-slate-700 leading-tight">{item.product_name || item.name}</p>
                                            {item.variant !== 'normal' && <p className="text-[10px] font-bold text-orange-400 uppercase italic">{item.variant}</p>}
                                            {promo && <div className="flex items-center gap-1 mt-1 text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded w-fit"><IconTag /> SAVE {formatCurrency(saved * item.quantity)} ({promo.name})</div>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {promo && <p className="text-[10px] text-slate-400 line-through font-bold">{formatCurrency(originalPrice * item.quantity)}</p>}
                                        <p className={`font-black ${promo ? 'text-red-500' : 'text-slate-900'}`}>{formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-t-2 border-slate-900 pt-4 mt-4 space-y-2">
                        {calculateTotalSaved(receipt.items) > 0 && (
                            <div className="flex justify-between text-sm text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
                                <span className="font-bold uppercase flex items-center gap-1"><IconTag /> ประหยัดไป</span>
                                <span className="font-black">- {formatCurrency(calculateTotalSaved(receipt.items))}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm"><span className="font-bold text-slate-400 uppercase">ยอดรวมสุทธิ</span><span className="font-black text-slate-900 text-xl">{formatCurrency(receipt.total_amount)}</span></div>
                        <div className="flex justify-between text-sm"><span className="font-bold text-slate-400 uppercase">วิธีชำระเงิน</span><span className="font-black text-slate-900 uppercase">{receipt.payment_method}</span></div>
                        {receipt.payment_method === 'cash' && (
                            <>
                                <div className="flex justify-between text-sm"><span className="font-bold text-slate-400 uppercase">รับเงินมา</span><span className="font-black text-slate-900">{formatCurrency(receipt.received_amount)}</span></div>
                                <div className="flex justify-between text-sm"><span className="font-bold text-orange-400 uppercase tracking-widest text-xs">เงินทอน</span><span className="font-black text-green-600">{formatCurrency(receipt.change_amount)}</span></div>
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="p-8 bg-white border-t shrink-0 grid grid-cols-2 gap-4">
                    <button onClick={onClose} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase">ปิด</button>
                    <button onClick={() => window.print()} className="py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 shadow-xl"><IconFileText size={18}/> พิมพ์ใบเสร็จ</button>
                </div>
            </div>
        </div>
    );
}