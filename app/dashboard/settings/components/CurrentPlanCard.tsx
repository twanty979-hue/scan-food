// app/dashboard/settings/components/CurrentPlanCard.tsx
import { PLANS } from '../constants';
import { IconShop, IconDiamond, IconCheck, IconCrown, IconLock } from './Icons'; // เพิ่ม IconLock ถ้าจำเป็น

interface Props {
  currentPlanKey: string;
  setShowUpgradePanel: (show: boolean) => void;
  expiryDate?: string | null; // ✅ รับค่าวันที่เข้ามา (ใส่ ? เผื่อเป็น undefined)
}

// 🗓️ Helper: จัดรูปแบบวันที่ไทย (เช่น 12 ม.ค. 67)
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', { 
        day: 'numeric', month: 'short', year: '2-digit' 
    }).format(date);
};

// ⏳ Helper: คำนวณวันที่เหลือ
const getDaysRemaining = (dateString: string) => {
    if (!dateString) return 0;
    const now = new Date();
    const expiry = new Date(dateString);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

export default function CurrentPlanCard({ currentPlanKey, setShowUpgradePanel, expiryDate }: Props) {
  const currentPlan = PLANS[currentPlanKey as keyof typeof PLANS] || PLANS.free;
  const daysLeft = expiryDate ? getDaysRemaining(expiryDate) : 0;

  // ส่วนแสดงผล Badge วันหมดอายุ (Reusable UI)
  const ExpiryBadge = ({ theme = 'light' }: { theme?: 'light'|'dark' }) => {
      if (!expiryDate || currentPlanKey === 'free') return null;
      
      const isUrgent = daysLeft <= 3; // ถ้าเหลือ <= 3 วัน ให้เป็นสีแดงเตือน
      
      return (
          <div className={`mt-4 px-4 py-3 rounded-xl border flex justify-between items-center ${
              theme === 'dark' 
                ? 'bg-white/10 border-white/10 text-white' 
                : isUrgent ? 'bg-red-50 border-red-100 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-600'
          }`}>
              <div className="text-xs">
                  <p className="opacity-70">หมดอายุวันที่</p>
                  <p className="font-bold text-sm">{formatDate(expiryDate)}</p>
              </div>
              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  isUrgent 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : theme === 'dark' ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-700'
              }`}>
                  อีก {daysLeft} วัน
              </div>
          </div>
      );
  }

  return (
    <div className="h-full">
        {/* ... (Style เดิมคงไว้) ... */}

        {/* 1. FREE & BASIC */}
        {['free', 'basic'].includes(currentPlanKey) && (
             <div className="sticky top-28 bg-white border-2 border-slate-100 rounded-[32px] p-8 text-slate-900 overflow-hidden shadow-xl shadow-slate-200/50 relative">
                 <div className="relative z-10 flex flex-col h-full justify-between min-h-[400px]">
                    <div>
                        {/* ... (Header เดิม) ... */}
                        <div className="flex justify-between items-start mb-8">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">Current Plan</span>
                            <IconShop className="text-blue-500" size={28} />
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black mb-2 tracking-tight text-slate-900">{currentPlan.name}</h2>
                        
                        {/* ✅ แสดงวันหมดอายุ (ถ้าไม่ใช่ Free) */}
                        {currentPlanKey !== 'free' ? (
                            <ExpiryBadge theme="light" />
                        ) : (
                            <p className="text-slate-500 text-sm font-medium mt-2">ใช้งานได้ตลอดชีพ</p>
                        )}

                        <div className="space-y-5 mb-10 mt-6">
                             {/* ... (Features list เดิม) ... */}
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><IconDiamond size={18} /></div>
                                <div><p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Themes</p><p className="font-bold text-lg text-slate-700">{currentPlan.themes}</p></div>
                             </div>
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><IconCheck size={18} /></div>
                                <div><p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Orders</p><p className="font-bold text-lg text-slate-700">{currentPlan.orders}</p></div>
                             </div>
                        </div>
                    </div>
                    <button onClick={() => setShowUpgradePanel(true)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 group">
                        <span>อัปเกรดแพ็กเกจ</span>
                        <IconCrown size={16} className="text-yellow-400 group-hover:rotate-12 transition-transform"/>
                    </button>
                 </div>
             </div>
        )}

        {/* 2. PRO */}
        {currentPlanKey === 'pro' && (
             <div className="sticky top-28 relative group z-0">
                <div className="absolute -inset-[4px] rounded-[36px] bg-gradient-to-r from-rose-500 via-amber-500 via-emerald-500 via-sky-500 to-indigo-500 animate-rainbow-fast opacity-100 blur-[2px]"></div>
                <div className="bg-white rounded-[32px] p-8 text-purple-900 h-full relative z-10 overflow-hidden min-h-[400px] flex flex-col justify-between">
                      <div>
                        {/* ... (Header เดิม) ... */}
                        <div className="flex justify-between items-start mb-8">
                            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-purple-200">Current Plan</span>
                            <IconCrown className="text-purple-500 drop-shadow-sm" size={28} />
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-indigo-600">{currentPlan.name}</h2>
                        
                        {/* ✅ แสดงวันหมดอายุ */}
                        <ExpiryBadge theme="light" />

                        <div className="space-y-5 mb-10 mt-6">
                             {/* ... (Features list เดิม) ... */}
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><IconDiamond size={18} /></div>
                                <div><p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">Themes</p><p className="font-bold text-lg text-purple-800">{currentPlan.themes}</p></div>
                             </div>
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><IconCheck size={18} /></div>
                                <div><p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">Orders</p><p className="font-bold text-lg text-purple-800">{currentPlan.orders}</p></div>
                             </div>
                        </div>
                      </div>
                      <button onClick={() => setShowUpgradePanel(true)} className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 group">
                        <span>ต่ออายุแพ็กเกจ</span>
                        <IconCrown size={16} className="text-white group-hover:rotate-12 transition-transform"/>
                    </button>
                </div>
             </div>
        )}

        {/* 3. ULTIMATE */}
        {currentPlanKey === 'ultimate' && (
            <div className="sticky top-28 border-gold-gradient rounded-[32px] p-8 text-white overflow-hidden shadow-[0_10px_40px_-10px_rgba(179,135,40,0.5)] relative z-0 bg-slate-900">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 mix-blend-overlay"></div>
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-200%] animate-[shimmer_3s_infinite_linear]"></div>
                 
                 <div className="relative z-10 flex flex-col h-full justify-between min-h-[400px]">
                      <div>
                        {/* ... (Header เดิม) ... */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="px-3 py-1 bg-gradient-to-r from-[#cfc09f] to-[#b38728] rounded-full p-[1px]">
                                <span className="block px-3 py-0.5 bg-slate-900 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#cfc09f]">Exclusive</span>
                            </div>
                            <IconCrown className="text-[#ffecb3] drop-shadow-[0_0_10px_rgba(255,236,179,0.5)]" size={32} />
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black mb-2 tracking-tight text-gold-gradient drop-shadow-sm">{currentPlan.name}</h2>
                        
                        {/* ✅ แสดงวันหมดอายุ (Theme Dark) */}
                        <ExpiryBadge theme="dark" />
                        
                         <div className="space-y-6 mb-10 mt-6">
                            {/* ... (Features list เดิม) ... */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#cfc09f] to-[#b38728] p-[1px]"><div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center"><IconDiamond size={20} className="text-[#ffecb3]" /></div></div>
                                <div><p className="text-[10px] uppercase tracking-wider text-[#cfc09f]/60 font-bold">Themes</p><p className="font-bold text-xl text-[#ffecb3]">{currentPlan.themes}</p></div>
                            </div>
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#cfc09f] to-[#b38728] p-[1px]"><div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center"><IconCheck size={20} className="text-[#ffecb3]" /></div></div>
                                <div><p className="text-[10px] uppercase tracking-wider text-[#cfc09f]/60 font-bold">Orders</p><p className="font-bold text-xl text-[#ffecb3]">{currentPlan.orders}</p></div>
                            </div>
                        </div>
                      </div>
                      <button onClick={() => setShowUpgradePanel(true)} className="relative w-full py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-xl group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#cfc09f] via-[#ffecb3] to-[#b38728]"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <span className="relative flex items-center justify-center gap-2 text-slate-900">
                            ต่ออายุแพ็กเกจ
                            <IconCrown size={16} className="text-slate-900 group-hover:rotate-12 transition-transform"/>
                        </span>
                    </button>
                 </div>
            </div>
        )}
    </div>
  );
}