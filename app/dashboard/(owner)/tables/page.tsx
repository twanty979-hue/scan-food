// app/dashboard/tables/page.tsx
'use client';

import { useState } from 'react';
import { useTables } from '@/hooks/useTables';
import TableQrModal from './TableQrModal';

// --- ✨ Custom Icons ---
const IconLayoutGrid = ({ size = 24, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>;
const IconPlus = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconSearch = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconQrCode = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>;
const IconRefresh = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>;
const IconTrash = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const IconX = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconCheck = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

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

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32">
            
            {/* --- Sticky Glass Header --- */}
            <div className="sticky top-0 z-30 bg-[#F8FAFC]/80 backdrop-blur-md border-b border-slate-200/50 pt-6 pb-4 px-6 md:px-10 transition-all">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <span className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30 text-white">
                                <IconLayoutGrid size={24} />
                            </span>
                            จัดการโต๊ะอาหาร
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-1 ml-14 hidden md:block">
                            สร้างโต๊ะ พิมพ์ QR Code และตรวจสอบสถานะ
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {/* Search Input */}
                        <div className="relative group w-full md:w-64">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                <IconSearch />
                            </div>
                            <input 
                                type="text" 
                                placeholder="ค้นหาเบอร์โต๊ะ..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-600 placeholder:text-slate-400 shadow-sm"
                            />
                        </div>

                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="hidden md:flex bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 items-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                        >
                            <IconPlus size={18} /> เพิ่มโต๊ะ
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="max-w-7xl mx-auto p-6 md:px-10">
                
                {loading ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                      {[...Array(8)].map((_, i) => <div key={i} className="bg-slate-200 h-48 rounded-[32px]"></div>)}
                   </div>
                ) : filteredTables.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-300 mb-6">
                            <IconLayoutGrid size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-700">ยังไม่มีโต๊ะในร้าน</h3>
                        <p className="text-slate-400 mt-2 mb-6">สร้างโต๊ะแรกเพื่อเริ่มรับออเดอร์ผ่าน QR Code</p>
                        <button onClick={() => setIsAddModalOpen(true)} className="text-emerald-600 font-bold hover:underline">
                            + เพิ่มโต๊ะใหม่
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTables.map((table) => (
                            <div 
                                key={table.id} 
                                className="group relative bg-white p-6 rounded-[32px] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1"
                            >
                                
                                {/* Header Card */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-slate-900/20">
                                            {table.label}
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-0.5">Status</span>
                                            <div className={`flex items-center gap-1.5 text-xs font-bold ${table.status === 'available' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                <div className={`w-2 h-2 rounded-full ${table.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                                {table.status === 'available' ? 'ว่าง' : 'ไม่ว่าง'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Delete Button (Hidden by default) */}
                                    <button 
                                        onClick={() => deleteTable(table.id)}
                                        className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                        title="ลบโต๊ะ"
                                    >
                                        <IconTrash size={14}/>
                                    </button>
                                </div>

                                {/* Passcode Area */}
                                <div className="bg-slate-50/80 rounded-2xl p-4 text-center border border-slate-100 mb-6 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-colors">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Passcode</span>
                                    <div className="text-3xl font-black font-mono tracking-widest text-slate-800 select-all cursor-pointer hover:text-indigo-600 transition-colors">
                                        {table.access_token}
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="grid grid-cols-5 gap-2 mt-auto">
                                    <button 
                                        onClick={() => setSelectedTable(table)} 
                                        className="col-span-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase shadow-md hover:bg-slate-800 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <IconQrCode size={16} /> QR Code
                                    </button>
                                    <button 
                                        onClick={() => refreshToken(table)} 
                                        className="col-span-1 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-50 hover:text-slate-600 hover:border-slate-300 transition-all"
                                        title="รีเซ็ต Passcode"
                                    >
                                        <IconRefresh size={16} />
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

                {/* Mobile Floating Add Button */}
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl shadow-slate-900/40 flex items-center justify-center hover:scale-110 transition-transform active:scale-90 z-40"
                >
                    <IconPlus size={24} />
                </button>

                {/* --- Add Table Modal --- */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div 
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                            onClick={() => setIsAddModalOpen(false)}
                        ></div>
                        
                        <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                            
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">เพิ่มโต๊ะใหม่</h3>
                                    <p className="text-xs text-slate-400">สร้าง QR Code สำหรับโต๊ะใหม่</p>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors">
                                    <IconX size={18} />
                                </button>
                            </div>

                            <form onSubmit={onAddSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">ชื่อโต๊ะ / หมายเลข</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                            <IconLayoutGrid size={18} />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={newTableLabel}
                                            onChange={(e) => setNewTableLabel(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-emerald-500 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:font-normal placeholder:text-slate-400 text-lg"
                                            placeholder="เช่น A1, VIP2"
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 ml-1">ระบบจะสร้าง Passcode ให้อัตโนมัติ</p>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3.5 rounded-2xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all">ยกเลิก</button>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || !newTableLabel.trim()}
                                        className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <span className="animate-pulse">...</span> : <><IconCheck size={18}/> บันทึก</>}
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                )}

                {/* --- QR Code Modal --- */}
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
        </div>
    );
}