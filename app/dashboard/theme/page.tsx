'use client';

import { useThemes } from '@/hooks/useThemes';
import { useMemo, useState } from 'react';
import ThemeHeader from './components/ThemeHeader';
import ActiveView from './components/ActiveView';
import HistoryView from './components/HistoryView';
// ✅ Import Modal เข้ามา
import ThemeConfirmationModal from './components/ThemeConfirmationModal';

export default function ThemePage() {
  const {
    themes, loading, currentConfig, isOwner,
    applyingId, currentThemes, currentPage, totalPages,
    changePage, handleApplyTheme, getImageUrl,
    categories, selectedCategory, handleCategoryChange,
    filterLifetime, toggleLifetimeFilter
  } = useThemes();

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // ✅ เพิ่ม State สำหรับ Modal
  const [themeToApply, setThemeToApply] = useState<any | null>(null);

  const { activeThemesDisplay, expiredThemesList, lifetimeCount } = useMemo(() => {
     const active = currentThemes.filter((t: any) => !t.is_expired);
     const expired = themes.filter((t: any) => t.is_expired);
     const lifetime = themes.filter((t: any) => t.purchase_type === 'lifetime').length;
     return { activeThemesDisplay: active, expiredThemesList: expired, lifetimeCount: lifetime };
  }, [currentThemes, themes]);

  // ✅ ฟังก์ชันเมื่อกดปุ่ม Apply ใน Card (ยังไม่ยิง API แค่เปิด Modal)
  const onApplyClick = (theme: any) => {
    setThemeToApply(theme);
  };

  // ✅ ฟังก์ชันเมื่อกดยืนยันใน Modal (ค่อยยิง API)
  const onConfirmApply = async () => {
    if (themeToApply) {
      await handleApplyTheme(themeToApply);
      setThemeToApply(null); // ปิด Modal เมื่อเสร็จ
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-24">
      {/* ... Header Code เดิม ... */}
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
          /* ... Loading Code เดิม ... */
          <div className="flex justify-center py-40">Loading...</div>
        ) : (
          <>
            {activeTab === 'active' && (
                <ActiveView 
                    themes={activeThemesDisplay}
                    currentConfig={currentConfig}
                    applyingId={applyingId}
                    isOwner={isOwner}
                    // ❌ เปลี่ยนจาก handleApplyTheme เป็น onApplyClick
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

      {/* ✅ วาง Modal ไว้ตรงนี้ (นอกสุด) */}
      <ThemeConfirmationModal 
        isOpen={!!themeToApply}
        theme={themeToApply}
        onClose={() => setThemeToApply(null)}
        onConfirm={onConfirmApply}
        isApplying={!!applyingId}
        
        // ⭐ สำคัญมาก: ต้องเพิ่มบรรทัดนี้ครับ ⭐
        getImageUrl={getImageUrl} 
      />
    </div>
  );
}