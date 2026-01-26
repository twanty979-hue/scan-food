// app/dashboard/marketplace/page.tsx
'use client';

import { useMarketplace } from '@/hooks/useMarketplace';
import { useRouter } from 'next/navigation'; // import เพิ่มเผื่อใช้ router direct ใน page (บางจุด)

// --- Icons ---
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const IconArrowRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>;
const IconEye = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconFilter = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;

export default function MarketplacePage() {
    const router = useRouter(); // เพิ่มตรงนี้เผื่อปุ่ม Manage Theme
    const {
        categories, currentThemes, ownedThemeIds, loading,
        currentPage, totalPages, totalItems,
        selectedCategory, setSelectedCategory,
        ownershipFilter, setOwnershipFilter,
        changePage, getImageUrl, goToDetails
    } = useMarketplace();

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-24">
            
            {/* Header */}
            <div className="w-full bg-[#f8fafc] pt-8 pb-2">
                <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">THEME MARKET</h1>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest italic mt-2">IPHONE 17 PRO EDITION</p>
                    </div>
                    
                    {/* Ownership Filter Buttons */}
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                        <button onClick={() => setOwnershipFilter('ALL')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${ownershipFilter === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>ทั้งหมด</button>
                        <button onClick={() => setOwnershipFilter('NOT_OWNED')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${ownershipFilter === 'NOT_OWNED' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>ยังไม่มี</button>
                        <button onClick={() => setOwnershipFilter('OWNED')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${ownershipFilter === 'OWNED' ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>ของฉัน ({ownedThemeIds.length})</button>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="max-w-[1600px] mx-auto px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar pb-4 border-b border-slate-200/50">
                    <div className="flex items-center gap-2 mr-2 text-slate-400">
                        <IconFilter /> <span className="text-[10px] font-bold uppercase">Filter:</span>
                    </div>
                    <button onClick={() => setSelectedCategory('ALL')} className={`px-6 py-2 rounded-full text-[11px] font-black transition-all whitespace-nowrap ${selectedCategory === 'ALL' ? 'bg-slate-800 text-white shadow-lg shadow-slate-200 transform scale-105' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>ALL</button>
                    {categories.map(cat => (
                        <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-6 py-2 rounded-full text-[11px] font-black transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-slate-800 text-white shadow-lg shadow-slate-200 transform scale-105' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>{cat.name}</button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-[1920px] mx-auto px-6 md:px-10 mt-8 min-h-[60vh]">
                {loading ? (
                    <div className="flex justify-center py-40">
                        <span className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Loading Themes...</span>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 flex justify-between items-end">
                            <p className="text-sm font-bold text-slate-500">SHOWING <span className="text-slate-900">{totalItems}</span> THEMES</p>
                            <p className="text-xs font-bold text-slate-400">PAGE {currentPage} / {totalPages || 1}</p>
                        </div>

                        {currentThemes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                <p className="text-4xl mb-4">📂</p>
                                <p className="font-bold uppercase tracking-widest text-sm">No themes found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-8 gap-y-16">
                                {currentThemes.map(theme => {
                                    const isOwned = ownedThemeIds.includes(theme.id);
                                    return (
                                        <div key={theme.id} className="group flex flex-col items-center cursor-pointer relative" onClick={() => goToDetails(theme.id)}>
                                            
                                            {/* iPhone Frame Preview */}
                                            <div className="relative w-full max-w-[280px] aspect-[9/19.5] transition-all duration-500 group-hover:-translate-y-4">
                                                <div className={`absolute inset-0 blur-3xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 translate-y-10 scale-90 ${isOwned ? 'bg-green-500/30' : 'bg-blue-900/20'}`}></div>
                                                
                                                <div className={`relative h-full w-full bg-[#363535] rounded-[3.5rem] p-[3px] shadow-2xl border border-[#555] ring-1 ring-[#111] z-10 overflow-hidden ${isOwned ? 'ring-green-500/50' : ''}`}>
                                                    <div className="relative w-full h-full bg-black rounded-[3.2rem] overflow-hidden border-[4px] border-black">
                                                        {/* Dynamic Island */}
                                                        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[32%] h-[26px] bg-black rounded-full z-50 flex items-center justify-between px-2 shadow-sm pointer-events-none">
                                                             <div className="w-[30%] h-[60%] bg-[#1a1a1a]/80 rounded-full blur-[0.5px]"></div>
                                                             <div className="w-[20%] h-[60%] bg-[#252525]/80 rounded-full blur-[0.5px]"></div>
                                                        </div>
                                                        
                                                        {/* Image */}
                                                        <img src={getImageUrl(theme.image_url)} loading="lazy" className={`w-full h-full object-cover object-top transition-transform duration-[2s] ease-out group-hover:scale-110 ${isOwned ? 'opacity-80' : ''}`} alt={theme.name} />
                                                        
                                                        {/* OWNED BADGE OVERLAY */}
                                                        {isOwned && (
                                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-40">
                                                                <div className="bg-green-500 text-white px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 border-2 border-white/20">
                                                                    <IconCheck /> OWNED
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[35%] h-1 bg-white/40 rounded-full backdrop-blur-md z-40"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Text Info */}
                                            <div className="mt-6 w-full max-w-[280px] text-center">
                                                <h3 className="text-sm font-black text-slate-800 leading-tight uppercase truncate">{theme.name}</h3>
                                                <div className="flex justify-center items-center gap-2 mt-1 mb-3">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{theme.marketplace_categories?.name}</span>
                                                    {isOwned && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                                                </div>
                                                
                                                {/* ปุ่มเปลี่ยนตามสถานะ */}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); isOwned ? router.push('/dashboard/theme') : goToDetails(theme.id); }} 
                                                    className={`
                                                        w-full rounded-xl py-3.5 border font-black text-[11px] uppercase tracking-[0.15em] flex justify-center items-center gap-2 transition-all shadow-sm
                                                        ${isOwned 
                                                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                                            : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900'
                                                        }
                                                    `}
                                                >
                                                    {isOwned ? (
                                                        <>Manage Theme</>
                                                    ) : (
                                                        <><IconEye /> ดูรายละเอียด</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-20 flex justify-center gap-4">
                                <button onClick={() => changePage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center disabled:opacity-50 transition-all hover:bg-slate-50"><IconArrowLeft /></button>
                                <span className="flex items-center text-xs font-black text-slate-400">Page {currentPage} of {totalPages}</span>
                                <button onClick={() => changePage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center disabled:opacity-50 transition-all hover:bg-slate-50"><IconArrowRight /></button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}