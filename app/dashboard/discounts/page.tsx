// app/dashboard/discounts/page.tsx
'use client';

import { useDiscounts } from '@/hooks/useDiscounts';

// --- 🎨 Custom Icons ---
const IconTag = ({ size = 24 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IconPlus = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconSearch = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconCalendar = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconTrash = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconX = ({ size = 24 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconCheck = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

export default function DiscountsPage() {
  const {
    discounts, categories, loading, brandId,
    isModalOpen, setIsModalOpen, isSubmitting,
    name, setName, type, setType, value, setValue,
    applyTo, setApplyTo, selectedProductIds, setSelectedProductIds,
    startDate, setStartDate, endDate, setEndDate,
    applyPriceNormal, setApplyPriceNormal,
    applyPriceSpecial, setApplyPriceSpecial,
    applyPriceJumbo, setApplyPriceJumbo,
    modalSearch, setModalSearch, modalCategory, setModalCategory,
    filteredProductsForModal,
    handleSubmit, closeModal, handleDelete
  } = useDiscounts();

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

        {/* Content */}
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
          /* ✅ แก้ไข 1: เปลี่ยนเป็น grid-cols-2 และลด gap ในมือถือ */
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {discounts.map(d => (
              /* ✅ แก้ไข 2: ลด padding ในมือถือ (p-4 -> md:p-6) */
              <div key={d.id} className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-200 flex flex-col relative overflow-hidden group hover:shadow-xl transition-all hover:border-orange-200">
                 
                 {/* Decorative Circle (ซ่อนในมือถือเพื่อให้ไม่รก) */}
                 <div className="hidden md:block absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full opacity-50 group-hover:bg-orange-100 transition-colors"></div>

                 <div className="flex flex-col md:flex-row justify-between items-start mb-2 md:mb-4 relative z-10 gap-2">
                    <div className="w-full md:w-auto">
                        {/* Badge ขนาดเล็กในมือถือ */}
                        <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest ${d.apply_to === 'all' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                            {d.apply_to === 'all' ? 'ทั้งร้าน' : 'บางเมนู'}
                        </span>
                        {/* ชื่อแคมเปญ ปรับขนาดฟอนต์ */}
                        <h3 className="text-sm md:text-xl font-black text-slate-800 mt-1 md:mt-2 line-clamp-1">{d.name}</h3>
                    </div>
                    
                    {/* มูลค่าส่วนลด ใหญ่สะใจแต่ปรับตามจอ */}
                    <div className="text-left md:text-right w-full md:w-auto">
                        <span className="text-2xl md:text-4xl font-black text-orange-500 tracking-tight block md:inline">
                            {d.value}<span className="text-sm md:text-xl align-top ml-0.5">{d.type === 'percentage' ? '%' : '฿'}</span>
                        </span>
                        {/* <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase hidden md:block">OFF</p> */}
                    </div>
                 </div>

                 {/* ส่วนวันที่ (ย่อในมือถือ แสดงแค่ Expire หรือวันที่เหลือน้อย) */}
                 <div className="bg-slate-50 p-2 md:p-4 rounded-xl md:rounded-2xl mb-3 md:mb-6 space-y-1 md:space-y-2 border border-slate-100">
                    <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-600">
                        <IconCalendar size={14} className="text-slate-400"/>
                        <span>เริ่ม: {d.start_date ? new Date(d.start_date).toLocaleDateString('th-TH') : 'ทันที'}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs font-bold text-slate-600">
                        <IconCalendar size={12} className="md:w-[14px] md:h-[14px] text-slate-400"/>
                        <span className="truncate">สิ้นสุด: {d.end_date ? new Date(d.end_date).toLocaleDateString('th-TH') : 'ตลอดไป'}</span>
                    </div>
                 </div>

                 <button 
                    onClick={() => handleDelete(d.id)} 
                    className="mt-auto w-full py-2 md:py-3 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1 md:gap-2"
                 >
                    <IconTrash size={14} className="md:w-[16px] md:h-[16px]"/> <span className="md:inline">ลบ</span>
                 </button>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Floating Add Button */}
        <button onClick={() => setIsModalOpen(true)} className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40 border-4 border-white"><IconPlus size={28}/></button>

        {/* --- Modal --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={closeModal}></div>
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300 flex flex-col md:flex-row">
                
                {/* Left Side: Settings */}
                <div className="w-full md:w-5/12 bg-white flex flex-col border-r border-slate-100">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-20">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><IconTag className="text-orange-500"/> รายละเอียด</h2>
                        <button onClick={closeModal} className="md:hidden p-2 bg-slate-100 rounded-full"><IconX size={20}/></button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                        <form id="discount-form" onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ชื่อแคมเปญ</label>
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-orange-500 font-bold text-slate-800" placeholder="เช่น Flash Sale 9.9" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ประเภท</label>
                                    <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-orange-500">
                                        <option value="percentage">เปอร์เซ็นต์ (%)</option>
                                        <option value="fixed">บาท (฿)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">มูลค่าส่วนลด</label>
                                    <input type="number" required value={value} onChange={(e) => setValue(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-orange-500" />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">ระยะเวลา (Option)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 mb-1 block">เริ่มต้น</span>
                                        <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-orange-400" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 mb-1 block">สิ้นสุด</span>
                                        <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-orange-400" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">ใช้กับราคาใดบ้าง</label>
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-orange-300 transition-all">
                                        <input type="checkbox" checked={applyPriceNormal} onChange={e => setApplyPriceNormal(e.target.checked)} className="w-5 h-5 accent-orange-500 rounded-lg" />
                                        <span className="text-sm font-bold text-slate-700">ราคาปกติ (Normal)</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-300 transition-all">
                                        <input type="checkbox" checked={applyPriceSpecial} onChange={e => setApplyPriceSpecial(e.target.checked)} className="w-5 h-5 accent-blue-500 rounded-lg" />
                                        <span className="text-sm font-bold text-slate-700">ราคาพิเศษ (Special)</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-red-300 transition-all">
                                        <input type="checkbox" checked={applyPriceJumbo} onChange={e => setApplyPriceJumbo(e.target.checked)} className="w-5 h-5 accent-red-500 rounded-lg" />
                                        <span className="text-sm font-bold text-slate-700">ราคาจัมโบ้ (Jumbo)</span>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-white">
                        <button form="discount-form" type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-orange-600 hover:shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50">
                            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกโปรโมชัน'}
                        </button>
                    </div>
                </div>

                {/* Right Side: Scope Selector */}
                <div className="w-full md:w-7/12 bg-slate-50 flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white md:bg-slate-50">
                        <h2 className="text-xl font-black text-slate-800">เลือกสินค้า</h2>
                        <button onClick={closeModal} className="hidden md:flex w-10 h-10 bg-white rounded-full items-center justify-center text-slate-400 hover:text-red-500 shadow-sm transition-colors"><IconX/></button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 mb-6">
                            <button onClick={() => setApplyTo('all')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${applyTo === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>ทั้งร้าน</button>
                            <button onClick={() => setApplyTo('specific')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${applyTo === 'specific' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>เลือกเอง</button>
                        </div>

                        {applyTo === 'all' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-4xl">🏷️</div>
                                <h3 className="text-lg font-black text-slate-800">ลดทั้งร้าน</h3>
                                <p className="text-sm text-slate-500">ส่วนลดจะถูกนำไปใช้กับทุกเมนูในร้าน</p>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="flex gap-3 mb-2 sticky top-0 z-10 bg-slate-50 pb-2">
                                    <div className="flex-1 relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><IconSearch size={16}/></div>
                                        <input type="text" placeholder="ค้นหาเมนู..." value={modalSearch} onChange={e => setModalSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-100" />
                                    </div>
                                    <select value={modalCategory} onChange={e => setModalCategory(e.target.value)} className="px-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-100">
                                        <option value="ALL">ทุกหมวด</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {filteredProductsForModal.map(p => (
                                        <label key={p.id} className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${selectedProductIds.includes(p.id) ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-slate-100 hover:border-orange-100'}`}>
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors ${selectedProductIds.includes(p.id) ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                {selectedProductIds.includes(p.id) && <IconCheck size={14}/>}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={selectedProductIds.includes(p.id)} onChange={(e) => {
                                                if(e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                                                else setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                                            }} />
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">฿{p.price}</span>
                                                    {p.price_special && <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded font-bold">S: ฿{p.price_special}</span>}
                                                    {p.price_jumbo && <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded font-bold">J: ฿{p.price_jumbo}</span>}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
          </div>
        )}

      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}