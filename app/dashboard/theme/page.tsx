'use client';

import { useThemes } from '@/hooks/useThemes';
import { useMemo, useState } from 'react';
import ThemeHeader from './components/ThemeHeader';
import ActiveView from './components/ActiveView';
import HistoryView from './components/HistoryView';

export default function ThemePage() {
  const {
    themes, loading, currentConfig, isOwner,
    applyingId, currentThemes, currentPage, totalPages,
    changePage, handleApplyTheme, getImageUrl,
    categories, selectedCategory, handleCategoryChange,
    // ✅ 1. เพิ่ม: ดึงค่า Filter Lifetime มาจาก Hook
    filterLifetime, toggleLifetimeFilter
  } = useThemes();

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const { activeThemesDisplay, expiredThemesList, lifetimeCount } = useMemo(() => {
     // currentThemes ในที่นี้คือข้อมูลที่ผ่านการกรอง (Category + Lifetime) และตัดหน้า (Pagination) มาแล้วจาก Hook
     const active = currentThemes.filter((t: any) => !t.is_expired);
     const expired = themes.filter((t: any) => t.is_expired);
     
     // ✅ นับจำนวน Lifetime ทั้งหมดจากข้อมูลดิบ (themes) เพื่อโชว์ตัวเลขที่ปุ่ม (ไม่สนใจว่ากรองอยู่ไหม)
     const lifetime = themes.filter((t: any) => t.purchase_type === 'lifetime').length;

     return { activeThemesDisplay: active, expiredThemesList: expired, lifetimeCount: lifetime };
  }, [currentThemes, themes]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-24">
      {/* 1. Header & Tabs */}
      <ThemeHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        expiredCount={expiredThemesList.length}
        lifetimeCount={lifetimeCount}
        // ✅ 2. เพิ่ม: ส่ง Props ไปให้ Header ใช้ทำปุ่ม Toggle
        filterLifetime={filterLifetime}
        toggleLifetimeFilter={toggleLifetimeFilter}
      />

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
            {/* 2. Active Themes View */}
            {activeTab === 'active' && (
                <ActiveView 
                    themes={activeThemesDisplay}
                    currentConfig={currentConfig}
                    applyingId={applyingId}
                    isOwner={isOwner}
                    onApply={handleApplyTheme}
                    getImageUrl={getImageUrl}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    changePage={changePage}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    handleCategoryChange={handleCategoryChange}
                />
            )}

            {/* 3. History Themes View */}
            {activeTab === 'history' && (
                <HistoryView 
                    themes={expiredThemesList}
                    getImageUrl={getImageUrl}
                />
            )}
          </>
        )}
      </div>
    </div>
  );
}