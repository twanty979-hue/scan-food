import { IconGrid, IconHistory } from './ThemeIcons';

// ----------------------------------------------------------------------------
// 🟢 ThemeHeader.tsx
// ----------------------------------------------------------------------------
interface ThemeHeaderProps {
  activeTab: 'active' | 'history';
  setActiveTab: (tab: 'active' | 'history') => void;
  expiredCount: number;
  lifetimeCount: number;
  // ✅ รับค่าเพิ่ม
  filterLifetime: boolean;
  toggleLifetimeFilter: () => void;
}

// ไอคอนมงกุฎ
const IconCrown = ({ size = 12, className = "" }: any) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>
);

export default function ThemeHeader({ 
  activeTab, setActiveTab, expiredCount, lifetimeCount, 
  filterLifetime, toggleLifetimeFilter 
}: ThemeHeaderProps) {
  return (
    <div className="w-full bg-[#f8fafc] pt-8 pb-6 px-6 md:px-10 border-none">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">MY THEMES</h1>
              
              <div className="flex items-center gap-3 mt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">MANAGED COLLECTION</p>
                
                {/* ✅ เปลี่ยนเป็นปุ่มกดได้ (Toggle Button) */}
                {lifetimeCount > 0 && (
                    <button 
                        onClick={toggleLifetimeFilter}
                        className={`
                            inline-flex items-center gap-1.5 text-[9px] font-black uppercase px-3 py-1 rounded-full border transition-all duration-200 active:scale-95 outline-none
                            ${filterLifetime 
                                ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-200 ring-2 ring-amber-100'  // สถานะเปิด (Active)
                                : 'bg-white text-amber-600 border-amber-100 hover:border-amber-300 hover:bg-amber-50 shadow-sm' // สถานะปิด (Inactive)
                            }
                        `}
                    >
                        <IconCrown size={12} className={filterLifetime ? "stroke-white" : "stroke-amber-600"} />
                        {filterLifetime ? `SHOWING ${lifetimeCount} LIFETIME` : `${lifetimeCount} LIFETIME`}
                        {filterLifetime && <span className="ml-1 bg-white/20 px-1.5 rounded-full text-[8px]">×</span>}
                    </button>
                )}
              </div>
          </div>
          
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
                  {expiredCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] text-white shadow-sm animate-bounce">
                          {expiredCount}
                      </span>
                  )}
              </button>
          </div>
      </div>
    </div>
  );
}