import ThemeCard from './ThemeCard';
import { IconHistory } from './ThemeIcons';

// ----------------------------------------------------------------------------
// 🕰️ HistoryView.tsx
// 📌 หน้าที่: แสดงเนื้อหาเมื่อเลือก Tab "History"
//    - วนลูปแสดงรายการ Theme ที่หมดอายุไปแล้ว
//    - แสดงผลแบบ Read-only (ดูได้อย่างเดียว แก้ไขไม่ได้)
// ----------------------------------------------------------------------------

export default function HistoryView({ themes, getImageUrl }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8 flex justify-between items-end border-b border-slate-200 pb-4">
            <p className="text-sm font-bold text-slate-500">
                EXPIRED HISTORY <span className="text-rose-500">{themes.length}</span> THEMES
            </p>
        </div>

        {themes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <IconHistory />
                </div>
                <p className="text-sm font-bold text-slate-400">NO HISTORY FOUND</p>
                <p className="text-xs text-slate-300 mt-1">Your expired themes will appear here.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-8 gap-y-16"> 
                {themes.map((theme: any) => (
                    <ThemeCard 
                        key={theme.id} 
                        theme={theme} 
                        isActive={false} 
                        isExpired={true}
                        getImageUrl={getImageUrl}
                    />
                ))}
            </div>
        )}
    </div>
  );
}