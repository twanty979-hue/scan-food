'use client';

import { useReceipts } from '@/hooks/useReceipts';

// --- Icons & Formatters ---
const IconHistory = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>;
const IconFileText = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconX = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconStore = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21v-7"/><path d="M19 21v-7"/><path d="M2 10l20 0"/><path d="M2 10l2-4h16l2 4"/></svg>;
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(amount);

export default function ReceiptsPage() {
    // ดึง Logic มาใช้งาน
    const { 
        receipts, loading, errorMsg, selectedReceipt, 
        setSelectedReceipt, fetchReceipts, getFlattenedItems 
    } = useReceipts();

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <IconHistory /> ประวัติการขาย
                    </h1>
                    <button onClick={fetchReceipts} className="bg-white border-2 border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100">
                        รีเฟรช
                    </button>
                </div>

                {errorMsg && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold">{errorMsg}</div>}

                {/* List Section */}
                {loading ? (
                    <div className="text-center py-20 text-slate-400 font-bold animate-pulse">กำลังดึงข้อมูล...</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {receipts.map((rpt) => (
                            <ReceiptCard key={rpt.id} rpt={rpt} onClick={() => setSelectedReceipt(rpt)} />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Section */}
            {selectedReceipt && (
                <ReceiptModal 
                    receipt={selectedReceipt} 
                    items={getFlattenedItems(selectedReceipt)}
                    onClose={() => setSelectedReceipt(null)} 
                />
            )}
        </div>
    );
}

// --- Sub Components (เพื่อความสะอาดขึ้นไปอีก) ---

function ReceiptCard({ rpt, onClick }: { rpt: any, onClick: () => void }) {
    return (
        <div onClick={onClick} className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-200 flex justify-between items-center hover:shadow-md cursor-pointer transition-all">
            <div className="flex gap-4 items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${rpt.payment_method === 'promptpay' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                    <IconFileText />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900 text-lg">
                            {Array.isArray(rpt.orders) ? (rpt.orders[0]?.table_label || 'Walk-in') : (rpt.orders?.table_label || 'Walk-in')}
                        </p>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <IconStore /> {rpt.brand?.name}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                        {new Date(rpt.created_at).toLocaleString('th-TH')} • <IconUser /> {rpt.cashier?.full_name || 'System'}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-2xl font-black text-slate-900">{formatCurrency(rpt.total_amount)}</p>
                <p className="text-[10px] font-black uppercase text-slate-400">{rpt.payment_method}</p>
            </div>
        </div>
    );
}

function ReceiptModal({ receipt, items, onClose }: { receipt: any, items: any[], onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-slate-900 text-white p-8 shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black uppercase">ใบเสร็จรับเงิน</h2>
                            <p className="text-orange-400 text-sm font-bold flex items-center gap-2 mt-1"><IconStore /> {receipt.brand?.name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><IconX /></button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-slate-50">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between border-b border-dashed border-slate-200 pb-3">
                            <p className="text-sm font-black text-slate-700">{item.quantity}x {item.product_name}</p>
                            <p className="font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                    ))}
                    <div className="pt-4 border-t-2 border-slate-900 space-y-2">
                        <div className="flex justify-between font-black text-xl">
                            <span>ยอดสุทธิ</span>
                            <span>{formatCurrency(receipt.total_amount)}</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-white border-t">
                    <button onClick={() => window.print()} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xl">
                        พิมพ์ใบเสร็จ
                    </button>
                </div>
            </div>
        </div>
    );
}