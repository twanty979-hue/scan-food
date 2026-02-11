'use client';

import { useMarketplace } from '@/hooks/useMarketplace';
import MarketplaceCard from './components/MarketplaceCard';
import { IconGrid, IconArrowLeft, IconArrowRight } from './components/ThemeIcons'; 

// 🛍️ Icon ถุงช้อปปิ้ง
const IconShoppingBag = ({ size = 24, className="" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
        <path d="M3 6h18"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
);

export default function MarketplacePage() {
    const {
        categories, currentThemes, ownedThemeIds, loading,
        currentPage, totalPages, changePage,
        selectedCategory, setSelectedCategory,
        getImageUrl, goToDetails,
        tierFilter, setTierFilter, tierCounts
    } = useMarketplace();

    const TierButton = ({ tier, label, colorClass, count }: any) => {
        const isActive = tierFilter === tier;
        return (
            <button
                onClick={() => setTierFilter(tier)}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border whitespace-nowrap flex-shrink-0
                    ${isActive 
                        ? `${colorClass} text-white shadow-md border-transparent transform scale-105` 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                    }
                `}
            >
                {label}
                {count > 0 && (
                    <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded text-[9px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {count}
                    </span>
                )}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-24">
            
            {/* Header */}
            <div className="w-full bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
                <div className="max-w-[1920px] mx-auto px-4 md:px-10 py-4 md:py-5"> 
                    <div className="flex items-center gap-4"> 
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200 shrink-0">
                             <IconShoppingBag size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
                                MARKETPLACE
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    Official Theme Store
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1920px] mx-auto px-4 md:px-10 mt-6 md:mt-8 min-h-[60vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* 🛒 Filter Toolbar (แก้ตรงนี้: เพิ่ม Fade Gradient) */}
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-1 mb-6 border border-slate-200/60 shadow-sm">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 md:gap-6 p-4">
                        
                        {/* 1. Filter by Plan (มี Fade ขวา) */}
                        <div className="flex flex-col gap-3 overflow-hidden w-full xl:w-auto">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-4 h-[1px] bg-slate-300"></span> Filter by Plan
                            </span>
                            
                            {/* ✅ Wrapper สำหรับ Scroll + Fade Effect */}
                            <div className="relative w-full">
                                {/* เงาฟุ้งด้านขวา บอกว่ามีต่อ */}
                                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none rounded-r-xl"></div>
                                
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 w-full pr-12">
                                    <TierButton tier="ALL" label="All" count={tierCounts.ALL} colorClass="bg-slate-800" />
                                    <TierButton tier="free" label="Free" count={tierCounts.FREE} colorClass="bg-emerald-500" />
                                    <TierButton tier="basic" label="Basic" count={tierCounts.BASIC} colorClass="bg-blue-500" />
                                    <TierButton tier="pro" label="Pro" count={tierCounts.PRO} colorClass="bg-indigo-500" />
                                    <TierButton tier="ultimate" label="Ultimate" count={tierCounts.ULTIMATE} colorClass="bg-rose-500" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Categories (มี Fade ขวา) */}
                        <div className="flex flex-col gap-3 xl:items-end overflow-hidden w-full xl:w-auto">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 xl:flex-row-reverse">
                                <span className="w-4 h-[1px] bg-slate-300"></span> Categories
                            </span>
                            
                            {/* ✅ Wrapper สำหรับ Scroll + Fade Effect */}
                            <div className="relative w-full xl:w-auto">
                                {/* เงาฟุ้งด้านขวา */}
                                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none rounded-r-xl"></div>

                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 w-full xl:justify-end pr-12">
                                    <button 
                                        onClick={() => setSelectedCategory('ALL')}
                                        className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border flex-shrink-0 ${selectedCategory === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                    >
                                        All Items
                                    </button>
                                    {categories.map((cat: any) => (
                                        <button 
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border flex-shrink-0 ${selectedCategory === cat.id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="mb-4 md:mb-6 flex justify-between md:justify-end items-center px-1">
                    <p className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        SHOWING {currentThemes.length} RESULTS (PAGE {currentPage}/{totalPages || 1})
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-40">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Loading Store...</span>
                        </div>
                    </div>
                ) : currentThemes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 md:py-32 opacity-50 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 mx-4 md:mx-0">
                        <IconGrid />
                        <p className="mt-4 text-sm font-bold text-slate-400">NO ITEMS FOUND</p>
                        <p className="text-xs text-slate-300 mt-1">Try changing the filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-x-8 md:gap-y-12 justify-items-center pb-24 md:pb-20">
                        {currentThemes.map((theme: any) => (
                            <MarketplaceCard 
                                key={theme.id}
                                theme={theme}
                                isOwned={ownedThemeIds.includes(theme.id)}
                                getImageUrl={getImageUrl}
                                onClick={() => goToDetails(theme.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 bg-white/90 backdrop-blur-md p-2 pl-4 md:pl-6 pr-2 rounded-full shadow-2xl border border-slate-200 z-50 animate-in slide-in-from-bottom-10 fade-in duration-700 max-w-[90vw]">
                         <span className="text-[9px] md:text-[10px] font-black text-slate-400 mr-1 md:mr-2 whitespace-nowrap hidden sm:inline">PAGE NAVIGATION</span>
                        <div className="flex items-center gap-1 md:gap-2">
                             <button onClick={() => changePage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><IconArrowLeft /></button>
                             <div className="flex gap-1 px-1 md:px-2 overflow-x-auto no-scrollbar max-w-[150px] md:max-w-none">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button key={page} onClick={() => changePage(page)} className={`w-8 h-8 rounded-full text-[10px] font-black transition-all flex items-center justify-center shrink-0 ${currentPage === page ? 'bg-slate-900 text-white scale-110 shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>{page}</button>
                                ))}
                            </div>
                            <button onClick={() => changePage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><IconArrowRight /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}