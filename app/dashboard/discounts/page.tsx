'use client';

import { useDiscounts } from '@/hooks/useDiscounts';
import DiscountModal from './DiscountModal';

// --- 🎨 Custom Icons (เพิ่ม className เข้าไปให้แล้วครับ) ---
interface IconProps {
  size?: number;
  className?: string; // ✅ เพิ่มบรรทัดนี้
}

const IconTag = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
);
const IconPlus = ({ size = 20, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const IconCalendar = ({ size = 16, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
const IconTrash = ({ size = 18, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

export default function DiscountsPage() {
  const discountHook = useDiscounts();
  const { discounts, loading, setIsModalOpen, handleDelete } = discountHook;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 text-slate-900 font-sans pb-32">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-3 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl shadow-lg shadow-orange-500/30">
                <IconTag size={28} />
              </span>
              โปรโมชัน & ส่วนลด
            </h1>
            <p className="text-slate-500 font-bold text-sm mt-2 ml-1">จัดการแคมเปญลดราคาเพื่อกระตุ้นยอดขาย</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex bg-slate-900 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl hover:shadow-orange-600/30 items-center gap-3 transition-all active:scale-95 group"
          >
            <span className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors"><IconPlus size={18} /></span>
            <span>สร้างโปรโมชัน</span>
          </button>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-pulse">
            <p className="font-bold tracking-widest uppercase text-xl">LOADING PROMOTIONS...</p>
          </div>
        ) : discounts.length === 0 ? (
          <div className="bg-white rounded-[32px] border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center text-orange-300 mx-auto mb-6">
               <IconTag size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-700">ยังไม่มีโปรโมชัน</h3>
            <p className="text-slate-400 mb-6">สร้างส่วนลดแรกของคุณเพื่อดึงดูดลูกค้า</p>
            <button onClick={() => setIsModalOpen(true)} className="text-orange-600 font-bold hover:underline text-lg">สร้างเลย +</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {discounts.map((d: any) => (
              <div key={d.id} className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-200 flex flex-col relative overflow-hidden group hover:shadow-xl transition-all hover:border-orange-200">
                  <div className="hidden md:block absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full opacity-50 group-hover:bg-orange-100 transition-colors"></div>

                 <div className="flex flex-col md:flex-row justify-between items-start mb-2 md:mb-4 relative z-10 gap-2">
                    <div className="w-full md:w-auto">
                        <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest ${d.apply_to === 'all' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                            {d.apply_to === 'all' ? 'ทั้งร้าน' : 'บางเมนู'}
                        </span>
                        <h3 className="text-sm md:text-xl font-black text-slate-800 mt-1 md:mt-2 line-clamp-1">{d.name}</h3>
                    </div>
                    
                    <div className="text-left md:text-right w-full md:w-auto">
                        <span className="text-2xl md:text-4xl font-black text-orange-500 tracking-tight block md:inline">
                            {d.value}<span className="text-sm md:text-xl align-top ml-0.5">{d.type === 'percentage' ? '%' : '฿'}</span>
                        </span>
                    </div>
                 </div>

                 <div className="bg-slate-50 p-2 md:p-4 rounded-xl md:rounded-2xl mb-3 md:mb-6 space-y-1 md:space-y-2 border border-slate-100">
                    <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-600">
                        <IconCalendar size={14} className="text-slate-400"/>
                        <span>เริ่ม: {d.start_date ? new Date(d.start_date).toLocaleDateString('th-TH') : 'ทันที'}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs font-bold text-slate-600">
                        <IconCalendar size={12} className="text-slate-400"/>
                        <span className="truncate">สิ้นสุด: {d.end_date ? new Date(d.end_date).toLocaleDateString('th-TH') : 'ตลอดไป'}</span>
                    </div>
                 </div>

                 <button 
                    onClick={() => handleDelete(d.id)} 
                    className="mt-auto w-full py-2 md:py-3 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1 md:gap-2"
                 >
                    <IconTrash size={14} /> <span className="md:inline">ลบ</span>
                 </button>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Floating Add Button */}
        <button onClick={() => setIsModalOpen(true)} className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40 border-4 border-white"><IconPlus size={28}/></button>

        <DiscountModal
          {...discountHook} 
          isOpen={discountHook.isModalOpen}
          onClose={discountHook.closeModal}
          setApplyTo={discountHook.setApplyTo as any}
        />

      </div>
    </div>
  );
}