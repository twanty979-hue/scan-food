// app/dashboard/theme/page.tsx
'use client';

import { useThemes } from '@/hooks/useThemes';

// --- Icons ---
const IconCheck = ({ size = 16, className = "" }: any) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const IconArrowRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>;

export default function ThemePage() {
  const {
    themes, loading, currentConfig, isOwner,
    applyingId, currentThemes, currentPage, totalPages,
    changePage, handleApplyTheme, getImageUrl
  } = useThemes();

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-24">
      
      {/* --- Page Header (Static & Seamless) --- */}
      <div className="w-full bg-[#f8fafc] pt-8 pb-6 px-6 md:px-10 border-none">
        <div className="max-w-[1600px] mx-auto flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">MY THEMES</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">MANAGED COLLECTION</p>
            </div>
            
            {/* Status Indicator */}
            <div className="hidden md:flex gap-6 pb-1">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Active Slug</span>
                    <span className="text-xs font-mono font-black text-blue-600">/{currentConfig?.slug}</span>
                </div>
                
                <div className="w-px h-8 bg-slate-200"></div>

                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Mode</span>
                    <span className="text-xs font-mono font-black text-indigo-600 uppercase">{currentConfig?.mode}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 md:px-10 mt-4 min-h-[60vh]">
        
        {loading ? (
          <div className="flex justify-center py-40">
             <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Syncing Inventory...</span>
             </div>
          </div>
        ) : (
          <>
            {/* Info Bar */}
            <div className="mb-8 flex justify-between items-end border-b border-slate-200 pb-4">
                <p className="text-sm font-bold text-slate-500">
                    OWNED <span className="text-slate-900">{themes.length}</span> THEMES
                </p>
                <p className="text-xs font-bold text-slate-400">PAGE {currentPage} / {totalPages || 1}</p>
            </div>

            {/* --- Grid System --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-8 gap-y-16">
              {currentThemes.map((theme) => {
                const mkt = theme.marketplace_themes;
                const isActive = currentConfig?.slug === mkt.slug && currentConfig?.mode === mkt.theme_mode;
                
                return (
                  <div key={theme.id} className="group flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    
                    {/* --- iPhone 17 Pro Frame --- */}
                    <div className="relative w-full max-w-[280px] aspect-[9/19.5] transition-all duration-500 group-hover:-translate-y-4">
                        {/* Glow Effect */}
                        {isActive && (
                            <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full opacity-60 translate-y-10 scale-90 animate-pulse"></div>
                        )}
                        
                        {/* Titanium Body */}
                        <div className={`relative h-full w-full rounded-[3.5rem] p-[3px] shadow-[0_0_2px_rgba(0,0,0,0.5),0_20px_40px_-10px_rgba(0,0,0,0.6)] border ring-1 ring-[#111] z-10 overflow-hidden transition-colors duration-500 ${isActive ? 'bg-[#1e293b] border-blue-500/50' : 'bg-[#363535] border-[#555]'}`}>
                            
                            {/* Reflection */}
                            <div className="absolute inset-0 rounded-[3.5rem] border-[1px] border-white/20 pointer-events-none z-20"></div>

                            {/* Screen Container */}
                            <div className="relative w-full h-full bg-black rounded-[3.2rem] overflow-hidden border-[4px] border-black">
                                
                                {/* Dynamic Island */}
                                <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[32%] h-[26px] bg-black rounded-full z-50 flex items-center justify-between px-2 shadow-sm pointer-events-none">
                                     <div className="w-[30%] h-[60%] bg-[#1a1a1a]/80 rounded-full blur-[0.5px]"></div>
                                     <div className="w-[20%] h-[60%] bg-[#252525]/80 rounded-full blur-[0.5px]"></div>
                                </div>

                                {/* Image */}
                                <img 
                                  src={getImageUrl(mkt.image_url) || ''} 
                                  loading="lazy"
                                  className={`w-full h-full object-cover object-top transition-transform duration-[2s] ease-out group-hover:scale-110`}
                                  alt={mkt.name} 
                                />

                                {/* Active Overlay */}
                                {isActive && (
                                  <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[2px] z-30 flex items-center justify-center">
                                     <div className="bg-white/95 px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-blue-100 transform scale-110">
                                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-400/50"><IconCheck size={12}/></div>
                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Active</span>
                                     </div>
                                  </div>
                                )}
                                
                                {/* Bottom Bar */}
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
                        className={`
                          w-full py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] transition-all relative
                          ${isActive 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default opacity-100' 
                            : 'bg-slate-900 text-white border border-slate-900 hover:bg-blue-600 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-200 active:scale-95'
                          }
                        `}
                      >
                        {isActive ? (
                            <span className="flex items-center justify-center gap-2">
                                <IconCheck size={14} className="stroke-emerald-600"/> Current Theme
                            </span>
                        ) : applyingId === theme.id ? (
                            <span className="animate-pulse">Applying...</span>
                        ) : (
                            'Apply Theme'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- Pagination Controls --- */}
            {totalPages > 1 && (
                <div className="mt-20 flex justify-center items-center gap-4">
                    <button 
                        onClick={() => changePage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <IconArrowLeft />
                    </button>

                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => changePage(page)}
                                className={`
                                    w-10 h-10 rounded-full text-xs font-black transition-all flex items-center justify-center
                                    ${currentPage === page 
                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-300 scale-110' 
                                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                                    }
                                `}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <IconArrowRight />
                    </button>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}