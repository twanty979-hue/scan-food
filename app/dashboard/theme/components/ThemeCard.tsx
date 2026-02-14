import { IconCheck } from './ThemeIcons';

// ----------------------------------------------------------------------------
// 🎨 เพิ่มไอคอน SVG ใหม่ (สำหรับแทนที่ Emoji)
// ----------------------------------------------------------------------------
const IconHourglass = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 22h14" /><path d="M5 2h14" /><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" /><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
  </svg>
);

const IconCrown = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);

// ----------------------------------------------------------------------------
// 📱 ThemeCard.tsx
// ----------------------------------------------------------------------------
interface ThemeCardProps {
  theme: any;
  isActive: boolean;
  isExpired?: boolean;
  applyingId?: string | null;
  isOwner?: boolean;
  onApply?: (theme: any) => void;
  getImageUrl: (path: string) => string | null;
}

export default function ThemeCard({ 
  theme, isActive, isExpired = false, applyingId, isOwner, onApply, getImageUrl 
}: ThemeCardProps) {
  const mkt = theme.marketplace_themes;
  
  // ✅ 1. ดึงค่าวันหมดอายุ
  const daysLeft = theme.days_left;

  // 🔴 กรณี Expired (History Mode)
  if (isExpired) {
    return (
      <div className="flex flex-col items-center pointer-events-none select-none grayscale opacity-75">
        <div className="relative w-full aspect-[9/19.5] transition-all duration-500 group-hover:-translate-y-4 max-w-[200px] md:max-w-[220px] xl:max-w-[280px]">
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
          <p className="text-[10px] text-rose-500 font-bold mt-1">EXPIRED</p>
        </div>
      </div>
    );
  }

  // 🟢 กรณี Active (Normal Mode)
  return (
    <div className="group flex flex-col items-center">
      <div className="relative w-full aspect-[9/19.5] transition-all duration-500 group-hover:-translate-y-4 max-w-[200px] md:max-w-[220px] xl:max-w-[280px]">
        {isActive && (<div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full opacity-60 translate-y-10 scale-90 animate-pulse"></div>)}
        <div className={`relative h-full w-full rounded-[3.5rem] p-[3px] shadow-[0_0_2px_rgba(0,0,0,0.5),0_20px_40px_-10px_rgba(0,0,0,0.6)] border ring-1 ring-[#111] z-10 overflow-hidden transition-colors duration-500 ${isActive ? 'bg-[#1e293b] border-blue-500/50' : 'bg-[#363535] border-[#555]'}`}>
            <div className="absolute inset-0 rounded-[3.5rem] border-[1px] border-white/20 pointer-events-none z-20"></div>
            <div className="relative w-full h-full bg-black rounded-[3.2rem] overflow-hidden border-[4px] border-black">
                {/* Dynamic Island / Notch */}
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

      <div className="mt-6 w-full max-w-[280px] text-center">
        <h3 className="text-sm font-black text-slate-800 leading-tight uppercase truncate">{mkt.name}</h3>
        
        {/* ❌❌ ลบส่วน Category & Mode Badge ออกแล้วครับ ❌❌ */}

        {/* ✅ 2. แสดงสถานะวันหมดอายุ (เพิ่ม mt-2 เพื่อเว้นระยะจากชื่อให้สวยงาม) */}
        <div className="mt-2 mb-3 h-6 flex items-center justify-center">
            {daysLeft === 'Lifetime' ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-0.5 rounded-full border border-amber-100 shadow-sm">
                    <IconCrown size={12} className="stroke-amber-600" /> Lifetime
                </span>
            ) : (
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-0.5 rounded-full border shadow-sm transition-all ${
                    daysLeft <= 3 
                    ? 'text-rose-500 bg-rose-50 border-rose-100 animate-pulse' 
                    : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                }`}>
                    <IconHourglass size={12} className={daysLeft <= 3 ? "stroke-rose-500" : "stroke-emerald-600"} /> 
                    {daysLeft} Days Left
                </span>
            )}
        </div>
        
        <button
            onClick={() => onApply && onApply(theme)}
            disabled={isActive || applyingId !== null || !isOwner}
            className={`w-full py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] transition-all relative ${isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default opacity-100' : 'bg-slate-900 text-white border border-slate-900 hover:bg-blue-600 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-200 active:scale-95'}`}
        >
            {isActive ? ( <span className="flex items-center justify-center gap-2"><IconCheck size={14} className="stroke-emerald-600"/> Current Theme</span> ) : applyingId === theme.id ? ( <span className="animate-pulse">Applying...</span> ) : ( 'Apply Theme' )}
        </button>
      </div>
    </div>
  );
}