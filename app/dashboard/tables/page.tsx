'use client';

import { useState } from 'react';
import { useTables } from '@/hooks/useTables';
import TableQrModal from './TableQrModal';
// ... (Icon ต่างๆ เหมือนเดิมของพี่เลยครับ) ...

export default function TablesPage() {
    const { 
        filteredTables, loading, brandId, qrLogoUrl, brandSlug, 
        searchTerm, setSearchTerm, addTable, deleteTable, refreshToken 
    } = useTables();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<any>(null);
    const [newTableLabel, setNewTableLabel] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const res = await addTable(newTableLabel);
        if (res?.success) {
            setNewTableLabel('');
            setIsAddModalOpen(false);
        }
        setIsSubmitting(false);
    };

// ... imports และ logic ด้านบนเหมือนเดิม

return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 pb-32">
        {/* ✅ 1. ส่วน Header + Search + ปุ่มเพิ่มโต๊ะ (เอากลับมาใส่ตรงนี้) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">จัดการโต๊ะ</h1>
                <p className="text-slate-500 font-bold">จัดการ QR Code และสถานะโต๊ะทั้งหมด</p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
                {/* ช่องค้นหา */}
                <input 
                    type="text" 
                    placeholder="ค้นหาโต๊ะ..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 md:w-64 px-5 py-3 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900/10 shadow-sm"
                />
                
                {/* 🔥 ปุ่มเพิ่มโต๊ะ อยู่นี่ครับ */}
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                    <span className="text-xl">+</span> เพิ่มโต๊ะ
                </button>
            </div>
        </div>

        {/* 2. ส่วนแสดงรายการโต๊ะ (Grid) */}
        {loading ? (
            <div className="text-center py-20 animate-pulse font-black text-slate-300">LOADING...</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTables.map((table) => (
                    <div key={table.id} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative">
                        {/* ... (ไส้ใน Card โต๊ะ เหมือนโค้ดที่คุณมีแล้ว) ... */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl font-black">{table.label}</div>
                            <div className="text-right">
                                <span className="text-[10px] font-black block text-slate-400">STATUS</span>
                                <span className={table.status === 'available' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                                    {table.status === 'available' ? 'ว่าง' : 'ไม่ว่าง'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl text-center mb-6 border border-slate-100">
                            <span className="text-[10px] text-slate-400 block font-black mb-1 uppercase">Passcode</span>
                            <span className="text-3xl font-black font-mono tracking-widest text-slate-800">{table.access_token}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-auto">
                            <button onClick={() => setSelectedTable(table)} className="py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase hover:bg-blue-600 transition-all">QR Code</button>
                            <button onClick={() => refreshToken(table)} className="py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase hover:bg-slate-50">รีเซ็ต</button>
                        </div>
                        
                        <button onClick={() => deleteTable(table.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                             {/* Icon Trash */}
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </div>
                ))}
            </div>
        )}

        {/* ✅ 3. Modal เพิ่มโต๊ะ (ต้องมีส่วนนี้ด้วย ไม่งั้นกดปุ่มแล้วไม่มีอะไรเกิดขึ้น) */}
        {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <form onSubmit={onAddSubmit} className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                    <h2 className="text-2xl font-black mb-6">เพิ่มโต๊ะใหม่</h2>
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="ชื่อโต๊ะ (เช่น A1, VIP2)" 
                        value={newTableLabel}
                        onChange={(e) => setNewTableLabel(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-slate-900/10 mb-6"
                    />
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-colors">ยกเลิก</button>
                        <button disabled={isSubmitting || !newTableLabel.trim()} type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 disabled:opacity-50 transition-all">
                            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* 4. Modal QR Code (ของเดิม) */}
        {selectedTable && (
            <TableQrModal 
                table={selectedTable}
                brandId={brandId}
                brandSlug={brandSlug} 
                qrLogoUrl={qrLogoUrl}
                onClose={() => setSelectedTable(null)} 
            />
        )}
    </div>
);
}