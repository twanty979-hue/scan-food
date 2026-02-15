'use client';

import { useThemes } from '@/hooks/useThemes';
import { useMemo, useState } from 'react';
import ThemeHeader from './components/ThemeHeader';
import ActiveView from './components/ActiveView';
import HistoryView from './components/HistoryView';
import ThemeConfirmationModal from './components/ThemeConfirmationModal';

export default function ThemePage() {
  const {
    themes, loading, brandId, currentConfig, isOwner, 
    applyingId, currentThemes, currentPage, totalPages,
    changePage, handleApplyTheme, getImageUrl,
    categories, selectedCategory, handleCategoryChange,
    // (ถ้าใน useThemes ไม่มี 2 ตัวนี้ ให้ปล่อยคอมเมนต์ไว้ครับ)
    // filterLifetime, toggleLifetimeFilter 
  } = useThemes();

  // --- 💡 ประกาศค่า Mock ไว้ตรงนี้เพื่อให้ TypeScript ยอมให้ผ่าน ---
  const filterLifetime = false; 
  const toggleLifetimeFilter = () => { console.log('Filter functionality not implemented'); };

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // ✅ State สำหรับ Modal
  const [themeToApply, setThemeToApply] = useState<any | null>(null);

  const { activeThemesDisplay, expiredThemesList, lifetimeCount } = useMemo(() => {
      const active = currentThemes.filter((t: any) => !t.is_expired);
      const expired = themes.filter((t: any) => t.is_expired);
      const lifetime = themes.filter((t: any) => t.purchase_type === 'lifetime').length;
      return { activeThemesDisplay: active, expiredThemesList: expired, lifetimeCount: lifetime };
  }, [currentThemes, themes]);

  const onApplyClick = (theme: any) => {
    setThemeToApply(theme);
  };

  const onConfirmApply = async () => {
    if (themeToApply) {
      await handleApplyTheme(themeToApply);
      setThemeToApply(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-24">
      {/* --- ✅ ส่งค่า Mock เข้าไปเพื่อให้ Component ไม่ร้อง Error --- */}
      <ThemeHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        expiredCount={expiredThemesList.length}
        lifetimeCount={lifetimeCount}
        filterLifetime={filterLifetime}
        toggleLifetimeFilter={toggleLifetimeFilter}
      />

      <div className="max-w-[1920px] mx-auto px-6 md:px-10 mt-8 min-h-[60vh]">
        {loading ? (
          <div className="flex justify-center py-40 text-slate-400 font-bold tracking-widest">LOADING THEMES...</div>
        ) : (
          <>
            {activeTab === 'active' && (
                <ActiveView 
                    themes={activeThemesDisplay}
                    currentConfig={currentConfig}
                    applyingId={applyingId}
                    isOwner={isOwner}
                    onApply={onApplyClick} 
                    getImageUrl={getImageUrl}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    changePage={changePage}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    handleCategoryChange={handleCategoryChange}
                />
            )}

            {activeTab === 'history' && (
                <HistoryView 
                    themes={expiredThemesList}
                    getImageUrl={getImageUrl}
                />
            )}
          </>
        )}
      </div>

      <ThemeConfirmationModal 
        isOpen={!!themeToApply}
        theme={themeToApply}
        onClose={() => setThemeToApply(null)}
        onConfirm={onConfirmApply}
        isApplying={!!applyingId}
        getImageUrl={getImageUrl} 
      />
    </div>
  );
}