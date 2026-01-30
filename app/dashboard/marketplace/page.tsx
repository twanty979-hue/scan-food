// app/dashboard/marketplace/page.tsx
'use client';

import { useMarketplace } from '@/hooks/useMarketplace';
import { useRouter } from 'next/navigation';

// --- Icons ---
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const IconArrowRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>;
const IconEye = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconFilter = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IconLock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconShoppingBag = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IconLayer = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
const IconCrown = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z"/></svg>;
// ✅ เพิ่มตัวนี้ครับ
const IconStar = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

// ✅ 1. กำหนดลำดับขั้น (Ultimate คือ 99 สูงสุด ชนะทุกอัน)
const PLAN_LEVELS: Record<string, number> = { free: 0, basic: 1, pro: 2, ultimate: 99 };

// ✅ 2. เพิ่มสีป้ายให้ครบ 4 ระดับ
const getBadgeColor = (plan: string) => {
    switch (plan) {
        case 'free': return 'bg-slate-100 text-slate-600 border-slate-200';
        case 'basic': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'pro': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'ultimate': return 'bg-slate-900 text-yellow-400 border-slate-700 shadow-md shadow-yellow-400/20'; // Ultimate สีดำทอง
        default: return 'bg-gray-100 text-gray-600';
    }
};

export default function MarketplacePage() {
    const router = useRouter();
    const {
        categories, currentThemes, ownedThemeIds, loading, currentPlan,
        currentPage, totalPages, totalItems,
        selectedCategory, setSelectedCategory,
        ownershipFilter, setOwnershipFilter,
        tierFilter, setTierFilter,
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
                    
                    {/* Ownership Filter */}
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                        <button onClick={() => setOwnershipFilter('ALL')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${ownershipFilter === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>ทั้งหมด</button>
                        <button onClick={() => setOwnershipFilter('NOT_OWNED')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${ownershipFilter === 'NOT_OWNED' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>ยังไม่มี</button>
                        <button onClick={() => setOwnershipFilter('OWNED')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${ownershipFilter === 'OWNED' ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>ของฉัน ({ownedThemeIds.length})</button>
                    </div>
                </div>

                {/* ✅ Filter Row 2: LEVEL FILTER (เพิ่ม Ultimate เข้ามา) */}
                <div className="max-w-[1600px] mx-auto px-6 py-2 flex items-center gap-3 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 mr-2 text-slate-400 shrink-0">
                        <IconLayer /> <span className="text-[10px] font-bold uppercase">Level:</span>
                    </div>
                    
                    <div className="flex gap-2">
                        {['ALL', 'free', 'basic', 'pro', 'ultimate'].map((tier) => {
                            const labels: Record<string, string> = { ALL: 'ALL', free: 'FREE', basic: 'BASIC', pro: 'PRO', ultimate: 'ULTIMATE' };
                            const isActive = tierFilter === tier;
                            
                            // Color logic
                            let activeClass = 'bg-slate-800 text-white shadow-lg';
                            if (tier === 'basic') activeClass = 'bg-blue-600 text-white shadow-lg shadow-blue-200';
                            if (tier === 'pro') activeClass = 'bg-purple-600 text-white shadow-lg shadow-purple-200';
                            if (tier === 'ultimate') activeClass = 'bg-black text-yellow-400 border border-yellow-500/50 shadow-lg shadow-yellow-500/20';

                            return (
                                <button 
                                    key={tier} 
                                    onClick={() => setTierFilter(tier)} 
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap
                                        ${isActive ? activeClass : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                                    `}
                                >
                                    {tier === 'ultimate' && <IconCrown />} {labels[tier]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filter Row 3: Categories */}
                <div className="max-w-[1600px] mx-auto px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar pb-4 border-b border-slate-200/50">
                    <div className="flex items-center gap-2 mr-2 text-slate-400 shrink-0">
                        <IconFilter /> <span className="text-[10px] font-bold uppercase">Style:</span>
                    </div>
                    <button onClick={() => setSelectedCategory('ALL')} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap border ${selectedCategory === 'ALL' ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-transparent text-slate-400 border-transparent hover:bg-white hover:border-slate-200'}`}>ALL STYLES</button>
                    {categories.map(cat => (
                        <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap border ${selectedCategory === cat.id ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-transparent text-slate-400 border-transparent hover:bg-white hover:border-slate-200'}`}>{cat.name}</button>
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
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Plan:</span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border flex items-center gap-1 ${getBadgeColor(currentPlan)}`}>
                                    {currentPlan === 'ultimate' && <IconCrown />} {currentPlan}
                                </span>
                            </div>
                        </div>

                        {currentThemes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                <p className="text-4xl mb-4">📂</p>
                                <p className="font-bold uppercase tracking-widest text-sm">No themes found in this level</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-8 gap-y-16">
                                {currentThemes.map(theme => {
                                    const isOwned = ownedThemeIds.includes(theme.id);
                                    
                                    // ✅ Logic เช็คสิทธิ์:
                                    // ถ้าเราเป็น Ultimate (Level 99) -> เราจะชนะทุก min_plan (free(0), basic(1), pro(2), ultimate(99))
                                    // ถ้าเราเป็น Free (Level 0) -> เราจะแพ้ Basic, Pro, Ultimate
                                    const minPlan = theme.min_plan || 'free';
                                    const canAccess = PLAN_LEVELS[currentPlan] >= PLAN_LEVELS[minPlan];
                                    
                                    // ถ้ายังไม่ซื้อ และ ยศไม่ถึง = ต้องซื้อ
                                    const mustBuy = !isOwned && !canAccess;

                                    return (
                                        <div key={theme.id} className="group flex flex-col items-center cursor-pointer relative" onClick={() => goToDetails(theme.id)}>
                                            
                                            {/* iPhone Preview */}
                                            <div className="relative w-full max-w-[280px] aspect-[9/19.5] transition-all duration-500 group-hover:-translate-y-4">
                                                
                                                {/* Glow Effect */}
                                                <div className={`absolute inset-0 blur-3xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 translate-y-10 scale-90 
                                                    ${isOwned ? 'bg-green-500/30' : (canAccess ? 'bg-blue-500/30' : 'bg-amber-500/30')}`}>
                                                </div>
                                                
                                                <div className={`relative h-full w-full bg-[#363535] rounded-[3.5rem] p-[3px] shadow-2xl border border-[#555] ring-1 ring-[#111] z-10 overflow-hidden 
                                                    ${isOwned ? 'ring-green-500/50' : ''}`}>
                                                    
                                                    <div className="relative w-full h-full bg-black rounded-[3.2rem] overflow-hidden border-[4px] border-black">
                                                        
                                                        {/* 🏷️ Badge: บอกระดับแพ็กเกจ (ถ้ายังไม่มีของ) */}
                                                        {!isOwned && (
                                                            <div className={`absolute top-4 left-4 z-30 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm backdrop-blur-md flex items-center gap-1
                                                                ${canAccess 
                                                                    ? 'bg-blue-500/90 text-white border-blue-400'  // ใช้ได้: สีฟ้า
                                                                    : 'bg-amber-400/90 text-amber-950 border-amber-300' // ต้องซื้อ: สีทอง
                                                                }`}>
                                                                {/* ถ้าเป็น Ultimate ให้โชว์มงกุฎ */}
                                                                {minPlan === 'ultimate' && <IconCrown />} 
                                                                {/* ข้อความในป้าย */}
                                                                {canAccess ? 'INCLUDED' : (minPlan === 'ultimate' ? 'ULTIMATE' : 'PREMIUM')}
                                                            </div>
                                                        )}

                                                        {/* Dynamic Island */}
                                                        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[32%] h-[26px] bg-black rounded-full z-20 flex items-center justify-between px-2 shadow-sm pointer-events-none">
                                                            <div className="w-[30%] h-[60%] bg-[#1a1a1a]/80 rounded-full blur-[0.5px]"></div>
                                                            <div className="w-[20%] h-[60%] bg-[#252525]/80 rounded-full blur-[0.5px]"></div>
                                                        </div>
                                                        
                                                        {/* Image */}
                                                        <img src={getImageUrl(theme.image_url)} loading="lazy" 
                                                            className={`w-full h-full object-cover object-top transition-transform duration-[2s] ease-out group-hover:scale-110 
                                                            ${isOwned ? 'opacity-80' : 'opacity-100'}`} 
                                                            alt={theme.name} 
                                                        />
                                                        
                                                        {/* Owned Overlay */}
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
                                                    {/* ถ้าต้องซื้อ ให้โชว์ป้าย PRO/ULTIMATE */}
                                                    {mustBuy && (
                                                        <span className={`text-[9px] font-bold flex items-center gap-1 ${minPlan === 'ultimate' ? 'text-yellow-600' : 'text-amber-500'}`}>
                                                            {minPlan === 'ultimate' ? <><IconCrown/> ULTIMATE ITEM</> : <><IconStar/> PRO ITEM</>}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {/* Button Logic */}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); isOwned ? router.push('/dashboard/theme') : goToDetails(theme.id); }} 
                                                    className={`
                                                        w-full rounded-xl py-3.5 border font-black text-[11px] uppercase tracking-[0.15em] flex justify-center items-center gap-2 transition-all shadow-sm
                                                        ${isOwned 
                                                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                                            : (canAccess 
                                                                ? 'bg-slate-900 text-white border-slate-900 hover:bg-blue-600 hover:border-blue-600' // ใช้ฟรี
                                                                : 'bg-white text-slate-900 border-slate-200 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700') // ต้องซื้อ
                                                        }
                                                    `}
                                                >
                                                    {isOwned ? (
                                                        'Manage Theme'
                                                    ) : (canAccess ? (
                                                        'Install Free'
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            <IconShoppingBag /> Buy ฿{(theme.price_lifetime || 1299).toLocaleString()}
                                                        </span>
                                                    ))}
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