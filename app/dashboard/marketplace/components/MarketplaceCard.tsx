import { IconCheck } from './ThemeIcons';

interface MarketplaceCardProps {
    theme: any;
    isOwned: boolean;
    getImageUrl: (path: string) => string;
    onClick: () => void;
}

export default function MarketplaceCard({ theme, isOwned, getImageUrl, onClick }: MarketplaceCardProps) {
    
    // 🎨 ฟังก์ชันเลือกสีป้ายตาม Plan
    const renderTierBadge = () => {
        // ถ้าเป็นเจ้าของแล้ว ให้ขึ้นว่า OWNED สีเขียวเสมอ
        if (isOwned) {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                    <IconCheck size={12} strokeWidth={3} /> OWNED
                </span>
            );
        }

        const plan = theme.min_plan?.toLowerCase() || 'free';

        // แยกสีตามระดับ Plan
        switch (plan) {
            case 'ultimate':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 shadow-sm">
                        🔥 ULTIMATE
                    </span>
                );
            case 'pro':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
                        ✨ PRO PLAN
                    </span>
                );
            case 'basic':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm">
                        🔹 BASIC
                    </span>
                );
            default: // Free
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                        🎁 FREE
                    </span>
                );
        }
    };

    // แสดงราคาเสริม (ถ้ามีขายแยก)
    const renderPriceInfo = () => {
        if (isOwned) return null;

        const monthly = Number(theme.price_monthly || 0);
        const lifetime = Number(theme.price_lifetime || 0);

        if (monthly > 0 || lifetime > 0) {
            return (
                <div className="text-[9px] text-slate-400 font-bold mt-1">
                    OR BUY: {monthly > 0 && `$${monthly}/mo`} {lifetime > 0 && ` • $${lifetime} Life`}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="group flex flex-col items-center cursor-pointer" onClick={onClick}>
            {/* รูปทรงมือถือ */}
            <div className="relative w-full aspect-[9/19.5] transition-all duration-500 group-hover:-translate-y-4 max-w-[200px] md:max-w-[220px] xl:max-w-[280px]">
                
                {/* Glow Effect ถ้าเป็นเจ้าของ หรือ Ultimate */}
                {isOwned ? (
                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-10 scale-90"></div>
                ) : theme.min_plan === 'ultimate' ? (
                    <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-10 scale-90"></div>
                ) : null}

                <div className={`relative h-full w-full rounded-[3.5rem] p-[3px] shadow-[0_0_2px_rgba(0,0,0,0.5),0_20px_40px_-10px_rgba(0,0,0,0.6)] border ring-1 ring-[#111] z-10 overflow-hidden transition-colors duration-500 bg-[#363535] border-[#555] group-hover:border-slate-400`}>
                    <div className="absolute inset-0 rounded-[3.5rem] border-[1px] border-white/20 pointer-events-none z-20"></div>
                    <div className="relative w-full h-full bg-black rounded-[3.2rem] overflow-hidden border-[4px] border-black">
                        
                        {/* Notch */}
                        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[32%] h-[26px] bg-black rounded-full z-50 flex items-center justify-between px-2 shadow-sm pointer-events-none">
                            <div className="w-[30%] h-[60%] bg-[#1a1a1a]/80 rounded-full blur-[0.5px]"></div>
                            <div className="w-[20%] h-[60%] bg-[#252525]/80 rounded-full blur-[0.5px]"></div>
                        </div>
                        
                        {/* Image */}
                        <img src={getImageUrl(theme.image_url)} loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-[2s] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100" alt={theme.name} />
                        
                        {/* Overlay: View Details */}
                        {!isOwned && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] z-30">
                                <div className="bg-white px-4 py-2 rounded-full font-bold text-xs shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                    View Details
                                </div>
                            </div>
                        )}

                         {/* Icon Check ถ้าเป็นเจ้าของ */}
                         {isOwned && (
                             <div className="absolute top-4 right-4 z-30 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-[#363535]">
                                <IconCheck size={12} className="stroke-[4px]" />
                             </div>
                         )}

                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[35%] h-1 bg-white/40 rounded-full backdrop-blur-md z-40"></div>
                    </div>
                </div>
            </div>

            {/* Info ด้านล่าง */}
            <div className="mt-6 w-full max-w-[280px] text-center">
                <h3 className="text-sm font-black text-slate-800 leading-tight uppercase truncate">{theme.name}</h3>
                
                {/* Category & Mode Badge */}
                <div className="flex justify-center items-center gap-2 mt-2 mb-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{theme.marketplace_categories?.name || 'Theme'}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-[9px] font-mono text-slate-400">{theme.theme_mode}</span>
                </div>

                {/* ✅✅ ป้าย Plan Badge (มาแล้วครับ!) */}
                <div className="mb-2 h-6 flex items-center justify-center">
                    {renderTierBadge()}
                </div>
                
                {/* แสดงราคาตัวเล็กๆ ด้านล่าง (ถ้ามี) */}
                {renderPriceInfo()}
                
                {/* ปุ่มกด */}
                <button
                    className={`mt-3 w-full py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] transition-all relative
                        ${isOwned 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default' 
                            : 'bg-slate-900 text-white border border-slate-900 hover:bg-blue-600 hover:border-blue-600 hover:shadow-lg shadow-blue-200 active:scale-95'
                        }
                    `}
                >
                    {isOwned ? 'INSTALLED' : 'GET THEME'}
                </button>
            </div>
        </div>
    );
}