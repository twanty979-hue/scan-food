'use client';

import { useKitchen } from '@/hooks/useKitchen';

// --- Icons ---
const IconClock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconChef = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.8a4.41 4.41 0 1 1 2.5-7.6 5 5 0 1 1 7 0 4.41 4.41 0 1 1 2.5 7.6 4.4 4.4 0 0 1-12 0Z"/><path d="M6 17h12"/><path d="M6.5 21h11"/></svg>;

export default function KitchenPage() {
    const { 
        filteredOrders, orders, loading, activeTab, setActiveTab, 
        searchTerm, setSearchTerm, handleUpdateStatus 
    } = useKitchen();

    const statusConfig: any = {
        pending: { label: 'รอรับออเดอร์', badge: 'bg-amber-100 text-amber-700', next: 'preparing', btn: 'bg-slate-900', btnText: 'รับออเดอร์' },
        preparing: { label: 'กำลังทำ', badge: 'bg-blue-100 text-blue-700', next: 'done', btn: 'bg-green-600', btnText: 'เสร็จแล้ว' }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-32">
            <div className="max-w-[1600px] mx-auto">
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <h1 className="text-3xl font-black flex items-center gap-3"><IconChef /> ออเดอร์ในครัว</h1>
                    <input 
                        type="text" placeholder="ค้นหาโต๊ะ..." value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-80 px-5 py-3 bg-white border border-slate-200 rounded-2xl font-bold shadow-sm focus:ring-2 focus:ring-slate-900/10 outline-none"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-3 mb-8">
                    {['pending', 'preparing'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-2xl text-sm font-black transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500'}`}>
                            {statusConfig[tab].label} ({orders.filter(o => o.status === tab).length})
                        </button>
                    ))}
                </div>

                {/* Order Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-[28px] border border-slate-200 flex flex-col overflow-hidden shadow-sm hover:shadow-xl transition-all">
                            <div className="p-5 bg-slate-50/50 border-b flex justify-between items-center">
                                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xl">{order.table_label}</div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${statusConfig[order.status].badge}`}>{statusConfig[order.status].label}</span>
                            </div>
                            
                            <div className="p-6 flex-1 space-y-4">
                                {order.order_items?.map((item: any) => (
                                    <div key={item.id} className="flex gap-3 font-bold text-slate-700">
                                        <span className="text-slate-400">{item.quantity}x</span>
                                        <span>{item.product_name}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-5 bg-slate-50 border-t">
                                <button 
                                    onClick={() => handleUpdateStatus(order.id, statusConfig[order.status].next)}
                                    className={`w-full ${statusConfig[order.status].btn} text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all`}>
                                    {statusConfig[order.status].btnText}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
