import ThemeCard from './ThemeCard';
import { IconGrid, IconArrowLeft, IconArrowRight } from './ThemeIcons';

export default function ActiveView({ 
  themes, currentConfig, applyingId, isOwner, onApply, getImageUrl, 
  currentPage, totalPages, changePage,
  categories, selectedCategory, handleCategoryChange 
}: any) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* ส่วนหัว + ปุ่มหมวดหมู่ */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-4 gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-1">
                <button 
                    onClick={() => handleCategoryChange('ALL')}
                    className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${selectedCategory === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                >
                    All Themes
                </button>
                {categories?.map((cat: any) => (
                    <button 
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
            <p className="text-xs font-bold text-slate-400 shrink-0 hidden md:block">PAGE {currentPage} / {totalPages || 1}</p>
        </div>

        {/* --- Grid แสดงผล --- */}
        {themes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <IconGrid />
                <p className="mt-4 text-sm font-bold text-slate-400">NO THEMES FOUND</p>
                {selectedCategory !== 'ALL' && <p className="text-xs text-slate-300 mt-1">Try selecting another category</p>}
            </div>
        ) : (
            // ✅ แก้ไขตรงนี้: grid-cols-2 (มือถือ) / gap-3 (ลดช่องว่างในมือถือ)
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-x-8 md:gap-y-16 justify-items-center">
                {themes.map((theme: any) => {
                    const mkt = theme.marketplace_themes;
                    const isActive = currentConfig?.slug === mkt.slug && currentConfig?.mode === mkt.theme_mode;
                    return (
                        <ThemeCard 
                            key={theme.id} 
                            theme={theme} 
                            isActive={isActive} 
                            applyingId={applyingId}
                            isOwner={isOwner}
                            onApply={onApply}
                            getImageUrl={getImageUrl}
                        />
                    );
                })}
            </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="mt-12 md:mt-20 flex justify-center items-center gap-3 md:gap-4 pb-10">
                <button onClick={() => changePage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"><IconArrowLeft /></button>
                <div className="flex gap-1 md:gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => changePage(page)} className={`w-8 h-8 md:w-10 md:h-10 rounded-full text-xs font-black transition-all flex items-center justify-center ${currentPage === page ? 'bg-slate-900 text-white shadow-lg shadow-slate-300 scale-110' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>{page}</button>
                    ))}
                </div>
                <button onClick={() => changePage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"><IconArrowRight /></button>
            </div>
        )}
    </div>
  );
}