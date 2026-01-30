// app/dashboard/theme/page.tsx
'use client';

import { useThemes } from '@/hooks/useThemes';
import { useMemo, useState } from 'react'; // ✅ เพิ่ม useState

// --- Icons ---
const IconCheck = ({ size = 16, className = "" }: any) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const IconArrowRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>;
const IconGrid = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconHistory = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

export default function ThemePage() {
  const {
    themes, loading, currentConfig, isOwner,
    applyingId, currentThemes, currentPage, totalPages,
    changePage, handleApplyTheme, getImageUrl
  } = useThemes();

  // ✅ State สำหรับสลับ Tab
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // แยกกองข้อมูล
  const { activeThemesDisplay, expiredThemesList } = useMemo(() => {
     // Active ใช้ currentThemes (ที่มี Pagination) มากรองเอาเฉพาะที่ไม่หมดอายุ
     const active = currentThemes.filter((t: any) => !t.is_expired);
     // Expired เอาจาก themes ทั้งหมดมาเลย (ไม่ Pagination หรือจะทำก็ได้)
     const expired = themes.filter((t: any) => t.is_expired);
     return { activeThemesDisplay: active, expiredThemesList: expired };
  }, [currentThemes, themes]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-24">
      
      {/* --- Page Header --- */}
      <div className="w-full bg-[#f8fafc] pt-8 pb-6 px-6 md:px-10 border-none">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">MY THEMES</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">MANAGED COLLECTION</p>
            </div>
            
            {/* ✅ TAB SWITCHER (พระเอกของเรา) */}
            <div className="flex bg-slate-200/50 p-1 rounded-full relative">
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <IconGrid /> Active
                </button>
                
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 relative ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <IconHistory /> History
                    {/* Badge แจ้งเตือนถ้ายศหมด */}
                    {expiredThemesList.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] text-white shadow-sm animate-bounce">
                            {expiredThemesList.length}
                        </span>
                    )}
                </button>
            </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 md:px-10 mt-8 min-h-[60vh]">
        
        {loading ? (
          <div className="flex justify-center py-40">
             <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Syncing Inventory...</span>
             </div>
          </div>
        ) : (
          <>
            {/* --------------------------------------------------------------------------- */}
            {/* 🟢 VIEW 1: ACTIVE THEMES (แสดงเมื่อเลือก Tab Active) */}
            {/* --------------------------------------------------------------------------- */}
            {activeTab === 'active' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 flex justify-between items-end border-b border-slate-200 pb-4">
                        <p className="text-sm font-bold text-slate-500">
                            AVAILABLE <span className="text-emerald-600">{activeThemesDisplay.length}</span> THEMES
                        </p>
                        <p className="text-xs font-bold text-slate-400">PAGE {currentPage} / {totalPages || 1}</p>
                    </div>

                    {activeThemesDisplay.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <IconGrid />
                            <p className="mt-4 text-sm font-bold text-slate-400">NO ACTIVE THEMES</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-8 gap-y-16">
                            {activeThemesDisplay.map((theme) => {
                                const mkt = theme.marketplace_themes;
                                const isActive = currentConfig?.slug === mkt.slug && currentConfig?.mode === mkt.theme_mode;
                                
                                return (
                                <div key={theme.id} className="group flex flex-col items-center">
                                    {/* ... (Code แสดง iPhone Frame เดิม เหมือนเป๊ะ) ... */}
                                    <div className="relative w-full max-w-[280px] aspect-[9/19.5] transition-all duration-500 group-hover:-translate-y-4">
                                        {isActive && (<div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full opacity-60 translate-y-10 scale-90 animate-pulse"></div>)}
                                        <div className={`relative h-full w-full rounded-[3.5rem] p-[3px] shadow-[0_0_2px_rgba(0,0,0,0.5),0_20px_40px_-10px_rgba(0,0,0,0.6)] border ring-1 ring-[#111] z-10 overflow-hidden transition-colors duration-500 ${isActive ? 'bg-[#1e293b] border-blue-500/50' : 'bg-[#363535] border-[#555]'}`}>
                                            <div className="absolute inset-0 rounded-[3.5rem] border-[1px] border-white/20 pointer-events-none z-20"></div>
                                            <div className="relative w-full h-full bg-black rounded-[3.2rem] overflow-hidden border-[4px] border-black">
                                                <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[32%] h-[26px] bg-black rounded-full z-50 flex items-center justify-between px-2 shadow-sm pointer-events-none">
                                                    <div className="w-[30%] h-[60%] bg-[#1a1a1a]/80 rounded-full blur-[0.5px]"></div>
                                                    <div className="w-[20%] h-[60%] bg-[#252525]/80 rounded-full blur-[0.5px]"></div>
                                                </div>
                                                <img src={getImageUrl(mkt.image_url) || ''} loading="lazy" className={`w-full h-full object-cover object-top transition-transform duration-[2s] ease-out group-hover:scale-110`} alt={mkt.name} />
                                                {isActive && (
                                                <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[2px] z-30 flex items-center justify-center">
                                                    <div className="bg-white/95 px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-blue-100 transform scale-110">
                                                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-400/50"><IconCheck size={12}/></div>
                                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Active</span>
                                                    </div>
                                                </div>
                                                )}
                                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[35%] h-1 bg-white/40 rounded-full backdrop-blur-md z-40"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info & Action */}
                                    <div className="mt-6 w-full max-w-[280px] text-center">
                                    <h3 className="text-sm font-black text-slate-800 leading-tight uppercase truncate">{mkt.name}</h3>
                                    <div className="flex justify-center items-center gap-2 my-2">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{mkt.marketplace_categories?.name}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span className="text-[9px] font-mono text-slate-400">{mkt.theme_mode}</span>
                                    </div>
                                    
                                    <button
                                        onClick={() => handleApplyTheme(theme)}
                                        disabled={isActive || applyingId !== null || !isOwner}
                                        className={`w-full py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] transition-all relative ${isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default opacity-100' : 'bg-slate-900 text-white border border-slate-900 hover:bg-blue-600 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-200 active:scale-95'}`}
                                    >
                                        {isActive ? ( <span className="flex items-center justify-center gap-2"><IconCheck size={14} className="stroke-emerald-600"/> Current Theme</span> ) : applyingId === theme.id ? ( <span className="animate-pulse">Applying...</span> ) : ( 'Apply Theme' )}
                                    </button>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}
                     {/* Pagination Controls (Show only in Active Tab) */}
                    {totalPages > 1 && (
                        <div className="mt-20 flex justify-center items-center gap-4">
                            <button onClick={() => changePage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"><IconArrowLeft /></button>
                            <div className="flex gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button key={page} onClick={() => changePage(page)} className={`w-10 h-10 rounded-full text-xs font-black transition-all flex items-center justify-center ${currentPage === page ? 'bg-slate-900 text-white shadow-lg shadow-slate-300 scale-110' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>{page}</button>
                                ))}
                            </div>
                            <button onClick={() => changePage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"><IconArrowRight /></button>
                        </div>
                    )}
                </div>
            )}

            {/* --------------------------------------------------------------------------- */}
            {/* 🔴 VIEW 2: HISTORY (แสดงเมื่อเลือก Tab History) */}
            {/* --------------------------------------------------------------------------- */}
            {activeTab === 'history' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 flex justify-between items-end border-b border-slate-200 pb-4">
                        <p className="text-sm font-bold text-slate-500">
                            EXPIRED HISTORY <span className="text-rose-500">{expiredThemesList.length}</span> THEMES
                        </p>
                    </div>

                    {expiredThemesList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                <IconHistory />
                            </div>
                            <p className="text-sm font-bold text-slate-400">NO HISTORY FOUND</p>
                            <p className="text-xs text-slate-300 mt-1">Your expired themes will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-8 gap-y-16 opacity-75 grayscale transition-all duration-500"> 
                            {expiredThemesList.map((theme: any) => {
                                const mkt = theme.marketplace_themes;
                                return (
                                <div key={theme.id} className="flex flex-col items-center pointer-events-none select-none">
                                    <div className="relative w-full max-w-[240px] aspect-[9/19.5] scale-90">
                                        <div className="relative h-full w-full rounded-[3.5rem] p-[3px] border border-slate-300 bg-slate-200">
                                            <div className="relative w-full h-full bg-slate-100 rounded-[3.2rem] overflow-hidden">
                                                <img src={getImageUrl(mkt.image_url) || ''} loading="lazy" className="w-full h-full object-cover object-top opacity-50" alt={mkt.name} />
                                                <div className="absolute inset-0 flex items-center justify-center bg-slate-200/40">
                                                    <span className="bg-slate-800 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">Expired</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase">{mkt.name}</h3>
                                        <p className="text-[10px] text-slate-400 mt-1">Please renew plan to use</p>
                                    </div>
                                </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

          </>
        )}
      </div>
    </div>
  );
}