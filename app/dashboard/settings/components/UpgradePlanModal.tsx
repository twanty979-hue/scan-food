import { PLANS } from '../constants';
import { IconCrown, IconClose, IconQr, IconCreditCard, IconCheck } from './Icons';

interface Props {
  show: boolean;
  onClose: () => void;
  period: string;
  setPeriod: (p: string) => void;
  paymentMethod: 'credit_card' | 'promptpay';
  setPaymentMethod: (m: 'credit_card' | 'promptpay') => void;
  currentPlanKey: string;
  submitting: boolean;
  handleUpgradePlan: (planKey: string, method: string) => void;
}

export default function UpgradePlanModal({ 
  show, onClose, period, setPeriod, paymentMethod, setPaymentMethod, 
  currentPlanKey, submitting, handleUpgradePlan 
}: Props) {
  
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-6">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        
        {/* Modal Content */}
        <div className="bg-[#F8FAFC] w-full md:max-w-6xl h-[95vh] md:h-auto md:max-h-[90vh] rounded-t-[32px] md:rounded-[40px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            
            {/* 1. Modal Header */}
            <div className="px-6 py-5 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><IconCrown size={20}/></div>
                   <h2 className="text-xl font-bold text-slate-900">เลือกแพ็กเกจ</h2>
               </div>
               <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"><IconClose size={18} /></button>
            </div>
            
            {/* 2. Controls (Sticky บนมือถือ) */}
            <div className="sticky top-0 z-20 px-4 py-3 bg-white shadow-sm border-b border-slate-100">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                    {/* Period Switcher */}
                    <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto h-10">
                        <button onClick={() => setPeriod('monthly')} className={`flex-1 sm:flex-none px-4 rounded-lg text-xs font-bold transition-all ${period === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>รายเดือน</button>
                        <button onClick={() => setPeriod('yearly')} className={`flex-1 sm:flex-none px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${period === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>รายปี <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-md">-20%</span></button>
                    </div>
                    {/* Payment Method */}
                    <div className="flex gap-2 w-full sm:w-auto h-10">
                        {['promptpay', 'credit_card'].map((method) => (
                            <button key={method} onClick={() => setPaymentMethod(method as any)} className={`flex-1 sm:flex-none px-3 rounded-xl border-2 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${paymentMethod === method ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-transparent bg-slate-100 text-slate-400'}`}>
                               {method === 'promptpay' ? <IconQr size={14}/> : <IconCreditCard size={14}/>} {method.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Plans Container (Vertical Stack) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
               
               {/* ✅ เปลี่ยนเป็น Grid ที่แสดง 1 แถวในมือถือ (เรียงลงมา) และ 4 แถวในจอคอม */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-12">
                   {(['free', 'basic', 'pro', 'ultimate'] as const).map((planKey) => {
                      const plan = PLANS[planKey];
                      const isCurrent = currentPlanKey === planKey;
                      const isFree = planKey === 'free';
                      const basePrice = isFree ? 0 : parseInt(plan.price.replace(/,/g, ''));
                      const fullPricePerYear = basePrice * 12;
                      const discountedPricePerYear = fullPricePerYear * 0.8;
                      const monthlyAverage = Math.floor(discountedPricePerYear / 12);

                      return (
                        <div key={planKey} className={`
                            relative flex flex-col p-5 rounded-[24px] bg-white border transition-all
                            ${(plan as any).isPopular ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500 z-10' : 'border-slate-200 shadow-sm'}
                        `}>
                           {(plan as any).isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">ขายดีที่สุด</div>}
                           
                           {/* Plan Header */}
                           <div className="text-center mb-4 pt-1">
                               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{plan.name}</h3>
                               
                               {period === 'yearly' && planKey !== 'free' ? (
                                   <div className="flex flex-col items-center">
                                        <div className="flex items-baseline gap-1 text-slate-900">
                                            <span className="text-3xl font-black">{monthlyAverage.toLocaleString()}</span>
                                            <span className="text-xs font-bold text-slate-400">บ./เดือน</span>
                                        </div>
                                        <div className="mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                            ประหยัด {(fullPricePerYear - discountedPricePerYear).toLocaleString()} บ./ปี
                                        </div>
                                   </div>
                               ) : (
                                   <div className="flex items-baseline justify-center gap-1 text-slate-900">
                                        <span className="text-3xl font-black">{plan.price}</span>
                                        {planKey !== 'free' && <span className="text-xs font-bold text-slate-400">บ./เดือน</span>}
                                   </div>
                               )}
                           </div>

                           <hr className="border-slate-100 mb-4" />

                           {/* Features List */}
                           <div className="flex-1 space-y-2.5 mb-6">
                               {plan.features.map((feat, i) => (
                                   <div key={i} className="flex items-start gap-3">
                                        <div className="mt-0.5 w-4 h-4 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                                            <IconCheck size={10} strokeWidth={4}/>
                                        </div>
                                        <span className="text-xs font-medium text-slate-600 leading-tight">{feat}</span>
                                   </div>
                               ))}
                           </div>

                           <button 
                             disabled={(isCurrent && isFree) || submitting} 
                             onClick={() => { onClose(); handleUpgradePlan(planKey, paymentMethod); }} 
                             className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm
                                ${(isCurrent && isFree) 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : plan.btnColor + ' text-white hover:opacity-90 active:scale-95'
                                }
                             `}
                           >
                             {isCurrent 
                                ? (isFree ? 'ใช้งานอยู่' : 'ต่ออายุแพ็กเกจ') 
                                : 'เลือกแพ็กเกจนี้'
                             }
                           </button>
                        </div>
                      );
                   })}
               </div>
            </div>
        </div>
    </div>
  );
}