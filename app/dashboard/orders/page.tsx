'use client';

import { useState, useEffect } from 'react';
import { useKitchen } from '@/hooks/useKitchen';

// --- Icons ---
const IconChef = ({ size = 28 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M2 12h20" />
    <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
    <path d="m4 8 16-4" />
    <path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.55a2 2 0 0 1 2.43 1.46l.45 1.8" />
  </svg>
);const IconZap = ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const IconVolume2 = ({ size = 24 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>;
const IconTrash = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
// ✅ เพิ่มไอคอน Undo
const IconUndo = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>;
// ✅ เพิ่มไอคอน Note
const IconNote = ({ size = 16, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

export default function KitchenPage() {
    const { 
        filteredOrders, orders, activeTab, setActiveTab, 
        searchTerm, setSearchTerm, handleUpdateStatus,
        autoAccept, setAutoAccept,
        handleCancelOrder, 
        handleCancelItem,
        handleRestoreItem // ✅ รับฟังก์ชันกู้คืนมาด้วย (อย่าลืมแก้ใน hook นะครับ)
    } = useKitchen();

    // ==========================================
    // ✅ Logic Sound Guard
    // ==========================================
    const [showSoundGuard, setShowSoundGuard] = useState(false);
    const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

    useEffect(() => {
        if (autoAccept && !isAudioUnlocked) {
            setShowSoundGuard(true);
        } else {
            setShowSoundGuard(false);
        }
    }, [autoAccept, isAudioUnlocked]);

    const handleUnlockAudio = () => {
        const audio = new Audio('/sounds/alert.mp3');
        audio.volume = 0.0;
        audio.play().catch((e) => console.log("Unlock failed:", e));
        
        setIsAudioUnlocked(true);
        setShowSoundGuard(false);
    };

    const statusConfig: any = {
        pending: { label: 'รอรับออเดอร์', badge: 'bg-amber-100 text-amber-700', next: 'preparing', btn: 'bg-slate-900', btnText: 'รับออเดอร์' },
        preparing: { label: 'กำลังทำ', badge: 'bg-blue-100 text-blue-700', next: 'done', btn: 'bg-green-600', btnText: 'เสร็จแล้ว' }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-32">
            
            <style jsx>{`
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(249, 115, 22, 0); }
                    100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
                }
                .pulse-btn { animation: pulse-ring 2s infinite; }
            `}</style>

            {/* Modal Sound Guard */}
            {showSoundGuard && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="flex flex-col items-center justify-center p-8 max-w-md text-center">
                        <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white mb-8 shadow-2xl shadow-orange-500/50 pulse-btn">
                            <IconVolume2 size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">ระบบรับออเดอร์ Auto</h2>
                        <p className="text-slate-300 mb-8 text-lg font-medium">กรุณากดปุ่มด้านล่างเพื่อเปิดการแจ้งเตือนเสียง <br/> (เมื่อมีออเดอร์เข้าจะรับงานอัตโนมัติ)</p>
                        <button onClick={handleUnlockAudio} className="px-10 py-4 bg-white text-orange-600 rounded-[24px] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-900/20 flex items-center gap-3">
                            <IconZap className="fill-orange-600 w-6 h-6" /> เริ่มใช้งานครัว
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-[1600px] mx-auto">
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <h1 className="text-3xl font-black flex items-center gap-3 text-slate-800"><IconChef /> ออเดอร์ในครัว</h1>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button onClick={() => setAutoAccept(!autoAccept)} className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${autoAccept ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center ${autoAccept ? 'bg-amber-500' : 'bg-slate-300'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${autoAccept ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                            <span className="font-bold text-sm flex items-center gap-2"><IconZap className={autoAccept ? 'fill-current' : ''} /> รับออเดอร์ Auto</span>
                        </button>
                        <input type="text" placeholder="ค้นหาโต๊ะ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 md:w-64 px-5 py-3 bg-white border border-slate-200 rounded-2xl font-bold shadow-sm focus:ring-2 focus:ring-slate-900/10 outline-none" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-3 mb-8">
                    {['pending', 'preparing'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-2xl text-sm font-black transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500'}`}>
                            {statusConfig[tab].label} ({orders.filter(o => o.status === tab).length})
                        </button>
                    ))}
                </div>

                {/* Order Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredOrders.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-slate-400 font-bold">ไม่มีรายการในสถานะนี้</div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white rounded-[28px] border border-slate-200 flex flex-col overflow-hidden shadow-sm hover:shadow-xl transition-all relative group h-fit">
                                {/* Header ของการ์ด */}
                                <div className="p-5 bg-slate-50/50 border-b flex justify-between items-center">
                                    <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xl">{order.table_label}</div>
                                    <div className="flex gap-2 items-center">
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${statusConfig[order.status].badge}`}>{statusConfig[order.status].label}</span>
                                        {/* ปุ่มยกเลิกทั้งบิล */}
                                        <button onClick={() => handleCancelOrder(order.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors" title="ยกเลิกทั้งออเดอร์">
                                            <IconTrash size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* รายการอาหาร */}
                                <div className="p-6 flex-1 flex flex-col gap-3">
                                    {order.order_items?.length === 0 ? (
                                        <p className="text-slate-300 text-center text-sm">รายการถูกยกเลิกหมดแล้ว</p>
                                    ) : (
                                        order.order_items?.map((item: any) => (
                                            <div key={item.id} className={`flex justify-between items-start group/item border-b border-dashed border-slate-100 last:border-0 pb-3 last:pb-0 transition-all ${
                                                item.status === 'cancelled' ? 'opacity-60 bg-slate-50/80 -mx-6 px-6 py-2' : ''
                                            }`}>
                                                <div className="flex flex-col w-full pr-2">
                                                    
                                                    {/* บรรทัดชื่อเมนู */}
                                                    <div className="flex gap-2 font-bold text-slate-700 items-start">
                                                        <span className="text-slate-400 min-w-[24px] pt-0.5">{item.quantity}x</span>
                                                        <div className="flex flex-wrap gap-2 items-center">
                                                            {/* ✅ ชื่อเมนู (ขีดฆ่าถ้าถูกยกเลิก) */}
                                                            <span className={`leading-tight ${item.status === 'cancelled' ? 'line-through text-slate-400 decoration-2 decoration-rose-300' : ''}`}>
                                                                {item.product_name}
                                                            </span>
                                                            
                                                            {item.variant !== 'normal' && (
                                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded h-fit whitespace-nowrap border border-blue-100">
                                                                    {item.variant}
                                                                </span>
                                                            )}
                                                            
                                                            {/* ✅ ป้ายบอกสถานะยกเลิก */}
                                                            {item.status === 'cancelled' && (
                                                                <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold border border-rose-200">
                                                                    ยกเลิก
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* แสดง Note */}
                                                    {item.note && (
                                                        <div className={`mt-2 ml-8 text-sm font-medium p-2 rounded-lg flex items-start gap-2 ${
                                                            item.status === 'cancelled' ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'text-rose-700 bg-rose-50 border border-rose-100'
                                                        }`}>
                                                            <IconNote size={16} className="mt-0.5 shrink-0" />
                                                            <span className="break-all">{item.note}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* ✅ สลับปุ่ม Action ตามสถานะ */}
                                                {item.status === 'cancelled' ? (
                                                    // ปุ่มกู้คืน (Undo)
                                                    <button onClick={() => handleRestoreItem(order.id, item.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all shrink-0" title="กู้คืนรายการนี้">
                                                        <IconUndo size={18} />
                                                    </button>
                                                ) : (
                                                    // ปุ่มยกเลิก (Trash)
                                                    <button onClick={() => handleCancelItem(order.id, item.id)} className="opacity-100 md:opacity-0 md:group-hover/item:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all shrink-0" title="ของหมด / ยกเลิกเมนูนี้">
                                                        <IconTrash size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* ปุ่ม Action ด้านล่าง */}
                                <div className="p-5 bg-slate-50 border-t mt-auto">
                                    {order.order_items?.filter((i: any) => i.status !== 'cancelled').length > 0 ? (
                                        <button onClick={() => handleUpdateStatus(order.id, statusConfig[order.status].next)} className={`w-full ${statusConfig[order.status].btn} text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all`}>
                                            {statusConfig[order.status].btnText}
                                        </button>
                                    ) : (
                                        <button onClick={() => handleCancelOrder(order.id)} className="w-full bg-slate-200 text-slate-500 py-4 rounded-2xl font-bold hover:bg-rose-500 hover:text-white transition-all">
                                            ปิดบิล (ยกเลิก)
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}