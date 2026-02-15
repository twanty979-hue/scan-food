// components/DiscountModal.tsx
'use client';

import React, { useState } from 'react';

// --- Icons (SVG Clean Style) ---
const IconTag = ({ size = 24, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IconX = ({ size = 24, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconSearch = ({ size = 20, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconCheck = ({ size = 16, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconChevronRight = ({ size = 20, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconSave = ({ size = 20, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconStore = ({ size = 48, className = "" }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18v-8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8z"/><path d="M3 11V3l18-2v10"/><path d="M3 11h18"/></svg>;

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  // Form State
  name: string; setName: (v: string) => void;
  type: string; setType: (v: any) => void;
  value: number; setValue: (v: number) => void;
  startDate: string; setStartDate: (v: string) => void;
  endDate: string; setEndDate: (v: string) => void;
  // Checkboxes
  applyPriceNormal: boolean; setApplyPriceNormal: (v: boolean) => void;
  applyPriceSpecial: boolean; setApplyPriceSpecial: (v: boolean) => void;
  applyPriceJumbo: boolean; setApplyPriceJumbo: (v: boolean) => void;
  // Product Selection
  applyTo: string; setApplyTo: (v: string) => void;
  modalSearch: string; setModalSearch: (v: string) => void;
  modalCategory: string; setModalCategory: (v: string) => void;
  categories: any[];
  filteredProductsForModal: any[];
  selectedProductIds: any[]; setSelectedProductIds: (v: any[]) => void;
}

export default function DiscountModal({
  isOpen, onClose, handleSubmit, isSubmitting,
  name, setName, type, setType, value, setValue,
  startDate, setStartDate, endDate, setEndDate,
  applyPriceNormal, setApplyPriceNormal,
  applyPriceSpecial, setApplyPriceSpecial,
  applyPriceJumbo, setApplyPriceJumbo,
  applyTo, setApplyTo,
  modalSearch, setModalSearch, modalCategory, setModalCategory,
  categories, filteredProductsForModal, selectedProductIds, setSelectedProductIds
}: DiscountModalProps) {
  
  const [activeTab, setActiveTab] = useState<'details' | 'products'>('details');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="bg-white w-full h-[95vh] md:h-[85vh] md:max-w-5xl md:rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row rounded-t-3xl md:rounded-b-3xl">
          
          {/* --- 📱 Mobile Header & Segmented Control (Fixed Top) --- */}
          <div className="md:hidden flex flex-col bg-white border-b border-slate-100 flex-shrink-0 z-20">
             {/* Title Bar */}
             <div className="flex justify-between items-center px-5 py-4">
                <h2 className="text-lg font-bold text-slate-800">สร้างโปรโมชัน</h2>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-full text-slate-500 hover:bg-slate-100">
                  <IconX size={20}/>
                </button>
             </div>
             
             {/* iOS Style Segmented Control */}
             <div className="px-5 pb-4">
                <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 relative">
                  {/* Active Indicator Animation (CSS Only simple logic) */}
                  <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${activeTab === 'details' ? 'left-1' : 'left-[calc(50%+2px)]'}`}></div>

                  <button 
                    onClick={() => setActiveTab('details')}
                    className={`relative z-10 py-2.5 text-sm font-bold text-center transition-colors ${activeTab === 'details' ? 'text-slate-900' : 'text-slate-500'}`}
                  >
                    รายละเอียด
                  </button>
                  <button 
                    onClick={() => setActiveTab('products')}
                    className={`relative z-10 py-2.5 text-sm font-bold text-center transition-colors ${activeTab === 'products' ? 'text-slate-900' : 'text-slate-500'}`}
                  >
                    สินค้า {selectedProductIds.length > 0 && <span className="ml-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{selectedProductIds.length}</span>}
                  </button>
                </div>
             </div>
          </div>

          {/* ================= LEFT SIDE: SETTINGS (Form) ================= */}
          <div className={`${activeTab === 'details' ? 'flex' : 'hidden'} md:flex w-full md:w-5/12 bg-white flex-col md:border-r border-slate-100 h-full overflow-hidden`}>
              
              {/* Desktop Header */}
              <div className="hidden md:flex p-6 border-b border-slate-50 justify-between items-center bg-white sticky top-0 z-20">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">รายละเอียดแคมเปญ</h2>
                  <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-slate-600"><IconX size={18}/></button>
              </div>
              
              {/* Scrollable Content */}
              <div className="p-5 md:p-6 overflow-y-auto custom-scrollbar flex-1 pb-24 md:pb-6">
                  <form id="discount-form" onSubmit={handleSubmit} className="space-y-5">
                      <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">ชื่อโปรโมชัน</label>
                          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800 placeholder:text-slate-300 transition-all" placeholder="เช่น ลดล้างสต็อก, Happy Hour" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">ประเภท</label>
                              <div className="relative">
                                <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-500 appearance-none">
                                    <option value="percentage">เปอร์เซ็นต์ (%)</option>
                                    <option value="fixed">บาท (฿)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                                </div>
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">มูลค่า</label>
                              <input type="number" required value={value} onChange={(e) => setValue(Number(e.target.value))} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-500" placeholder="0" />
                          </div>
                      </div>

                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                          <label className="block text-sm font-semibold text-slate-700">ระยะเวลา (ไม่บังคับ)</label>
                          <div className="grid grid-cols-2 gap-3">
                              <div>
                                  <span className="text-xs text-slate-500 mb-1.5 block">เริ่มต้น</span>
                                  <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 outline-none focus:border-blue-500" />
                              </div>
                              <div>
                                  <span className="text-xs text-slate-500 mb-1.5 block">สิ้นสุด</span>
                                  <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 outline-none focus:border-blue-500" />
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-3">เงื่อนไขราคา</label>
                          <div className="flex flex-col gap-3">
                              {[
                                { label: 'ราคาปกติ (Normal)', checked: applyPriceNormal, setter: setApplyPriceNormal, color: 'blue' },
                                { label: 'ราคาพิเศษ (Special)', checked: applyPriceSpecial, setter: setApplyPriceSpecial, color: 'indigo' },
                                { label: 'ราคาจัมโบ้ (Jumbo)', checked: applyPriceJumbo, setter: setApplyPriceJumbo, color: 'purple' }
                              ].map((item, idx) => (
                                <label key={idx} className={`flex items-center gap-3 p-3.5 bg-white border rounded-xl cursor-pointer transition-all ${item.checked ? `border-${item.color}-500 ring-1 ring-${item.color}-500/20` : 'border-slate-200 hover:border-slate-300'}`}>
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${item.checked ? `bg-${item.color}-600 border-${item.color}-600` : 'bg-slate-100 border-slate-300'}`}>
                                        {item.checked && <IconCheck size={14} className="text-white" />}
                                    </div>
                                    <input type="checkbox" checked={item.checked} onChange={e => item.setter(e.target.checked)} className="hidden" />
                                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                </label>
                              ))}
                          </div>
                      </div>
                  </form>
              </div>

              {/* Desktop Submit Button */}
              <div className="hidden md:block p-6 border-t border-slate-100 bg-white mt-auto">
                  <button form="discount-form" type="submit" disabled={isSubmitting} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                      <IconSave size={20}/>
                      <span>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
                  </button>
              </div>
          </div>

        {/* ================= RIGHT SIDE: PRODUCTS (ปรับปรุงใหม่) ================= */}
<div className={`${activeTab === 'products' ? 'flex' : 'hidden'} md:flex w-full md:w-7/12 bg-white flex-col h-full overflow-hidden`}>
    
    {/* Desktop Header: ปรับให้ดูเป็น Toolbar มากขึ้น */}
    <div className="hidden md:flex p-6 border-b border-slate-100 justify-between items-center bg-white">
        <div>
            <h2 className="text-xl font-bold text-slate-800">เลือกสินค้า</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">เลือกแล้ว {selectedProductIds.length} รายการ</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors">
            <IconX size={20}/>
        </button>
    </div>

    {/* Search & Filter Bar: ปรับให้ดู "จม" และเป็นระเบียบ (Sticky) */}
    <div className="sticky top-0 md:static z-20 bg-white border-b md:border-b-0 border-slate-100 px-4 py-3 md:px-6 md:pb-4">
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
            <button onClick={() => setApplyTo('all')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${applyTo === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>ทั้งร้าน</button>
            <button onClick={() => setApplyTo('specific')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${applyTo === 'specific' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>เลือกเฉพาะบางเมนู</button>
        </div>

        {applyTo === 'specific' && (
            <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <IconSearch size={18}/>
                    </div>
                    <input 
                        type="text" 
                        placeholder="ค้นหาชื่อเมนู..." 
                        value={modalSearch} 
                        onChange={e => setModalSearch(e.target.value)} 
                        className="w-full h-12 pl-11 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all" 
                    />
                </div>
                <div className="relative">
                    <select 
                        value={modalCategory} 
                        onChange={e => setModalCategory(e.target.value)} 
                        className="h-12 px-5 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer appearance-none w-full md:w-40"
                    >
                        <option value="ALL">ทุกหมวดหมู่</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                </div>
            </div>
        )}
    </div>

    {/* Product List: ปรับพื้นหลังให้อ่อนลงเพื่อให้ Card สินค้าดูเด่นขึ้น */}
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-slate-50/50 pb-28 md:pb-6">
        {applyTo === 'all' ? (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        {/* กล่องยืนยันสถานะที่ดูเป็นทางการ */}
        <div className="max-w-sm w-full bg-blue-50 border border-blue-100 rounded-[32px] p-8 shadow-sm">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-600/20">
                <IconStore size={40} className="text-white"/>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                Active: ทั้งร้าน
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">ยืนยันใช้ส่วนลดทั้งร้าน</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
                ระบบจะคำนวณส่วนลด {name || "นี้"} ให้กับเมนูอาหาร <span className="font-bold text-slate-700">ทุกรายการ</span> ในฐานข้อมูลของคุณโดยอัตโนมัติ
            </p>

            {/* ส่วนสรุปเล็กๆ ให้ดูมีรายละเอียด */}
            <div className="bg-white rounded-2xl p-4 border border-blue-100 text-left space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">ขอบเขต:</span>
                    <span className="text-blue-600 font-bold">ทุกเมนู (Global)</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">มูลค่าที่จะลด:</span>
                    <span className="text-slate-800 font-bold">{value || 0} {type === 'percentage' ? '%' : '฿'}</span>
                </div>
            </div>
        </div>
        
        {/* ข้อความกำกับด้านล่าง */}
        <p className="mt-8 text-xs text-slate-400 font-medium max-w-[280px]">
            คุณสามารถเปลี่ยนกลับมา "เลือกเฉพาะบางเมนู" ได้ทุกเมื่อ หากต้องการจำกัดขอบเขตของโปรโมชัน
        </p>
    </div>
        ) : (
            <div className="grid grid-cols-1 gap-3 animate-in fade-in duration-300">
                {filteredProductsForModal.map(p => (
                    <label key={p.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedProductIds.includes(p.id) ? 'bg-blue-50 border-blue-500' : 'bg-white border-transparent hover:border-slate-100 shadow-sm'}`}>
                        <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center border-2 transition-colors ${selectedProductIds.includes(p.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-200 bg-white'}`}>
                            {selectedProductIds.includes(p.id) && <IconCheck size={14} className="text-white"/>}
                        </div>
                        <input type="checkbox" className="hidden" checked={selectedProductIds.includes(p.id)} onChange={(e) => {
                            if(e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                            else setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                        }} />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">{p.name}</p>
                            <div className="flex gap-2 mt-1.5">
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">฿{p.price}</span>
                                {p.price_special && <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded font-bold uppercase">S: ฿{p.price_special}</span>}
                            </div>
                        </div>
                    </label>
                ))}
            </div>
        )}
    </div>
          </div>

          {/* ================= FIXED BOTTOM BAR (Mobile Only) ================= */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
             {activeTab === 'details' ? (
                <button 
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <span>ถัดไป: เลือกสินค้า</span>
                  <IconChevronRight size={20}/>
                </button>
             ) : (
                <button 
                  onClick={handleSubmit} // เรียกฟังก์ชัน Submit โดยตรง หรือจะใช้ form="discount-form" ถ้าอยู่ภายใต้ form เดียวกัน
                  disabled={isSubmitting}
                  className="w-full h-12 bg-blue-600 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-transform disabled:opacity-50"
                >
                  <IconSave size={20}/>
                  <span>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกโปรโมชัน'}</span>
                </button>
             )}
          </div>

      </div>

       <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}