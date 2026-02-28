// app/dashboard/products/page.tsx
'use client';

import { useProducts } from '@/hooks/useProducts';
import Cropper from 'react-easy-crop';
import { useState, useCallback } from 'react';

// --- ✨ Custom Icons ---
const IconUtensils = ({ size = 24, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>;
const IconPlus = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconSearch = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconEdit = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const IconTrash = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconImage = ({ size = 32 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IconStar = ({ size = 14, className }: any) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconX = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconChevronDown = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>;

// Icon สำหรับ Crop (ซูม)
const IconZoom = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;

export default function ProductsPage() {
  const {
    categories, loading, 
    selectedCategoryId, setSelectedCategoryId,
    searchTerm, setSearchTerm,
    isModalOpen, setIsModalOpen, isSubmitting, editId, uploading,
    formData, setFormData, fileInputRef,
    filteredProducts,
    getImageUrl, handleImageUpload, handleSave, handleDelete, handleToggle, openModal,
    // ✂️ ดึง State ระบบ Crop ออกมาจาก Hook
    imageToCrop, setIsCropModalOpen, isCropModalOpen,
    setCroppedAreaPixels, handleCropComplete
  } = useProducts();

  // ✂️ Local State สำหรับควบคุมกรอบ Crop และ ซูม
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, [setCroppedAreaPixels]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      
      {/* --- Sticky Header --- */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-200/60 pt-4 pb-2 px-4 md:px-10 shadow-sm md:shadow-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-1.5 md:p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 text-white">
                <IconUtensils size={20} className="md:w-6 md:h-6" />
              </span>
              จัดการเมนู
            </h1>
            {/* Mobile Add Button (Small Top) */}
             <button onClick={() => openModal()} className="md:hidden p-2 bg-slate-900 text-white rounded-lg active:scale-95 transition-transform">
                <IconPlus size={20} />
             </button>
          </div>

          <div className="flex gap-3">
            <div className="relative group w-full md:w-64">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <IconSearch />
              </div>
              <input 
                type="text" 
                placeholder="ค้นหา..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-600 placeholder:text-slate-400 text-sm md:text-base shadow-sm"
              />
            </div>

            <button 
              onClick={() => openModal()}
              className="hidden md:flex bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 items-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
            >
              <IconPlus size={18} /> เพิ่มเมนู
            </button>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="max-w-7xl mx-auto mt-4 overflow-x-auto no-scrollbar pb-2">
          <div className="flex gap-2">
            <button 
                onClick={() => setSelectedCategoryId('ALL')} 
                className={`px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all border shrink-0 ${selectedCategoryId === 'ALL' ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
            >
                ทั้งหมด
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategoryId(cat.id)} 
                className={`px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all border shrink-0 whitespace-nowrap ${selectedCategoryId === cat.id ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 md:px-10">
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 animate-pulse">
             {[...Array(6)].map((_, i) => <div key={i} className="bg-slate-200 aspect-[4/5] rounded-2xl"></div>)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm mx-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-300 mb-4">
                <IconUtensils size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-700">ไม่มีเมนูในหมวดนี้</h3>
            <button onClick={() => openModal()} className="mt-4 text-blue-600 font-bold hover:underline text-sm">
                + เพิ่มเมนูใหม่
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {filteredProducts.map((p: any) => (
              <div 
                key={p.id} 
                className={`
                    group relative bg-white rounded-2xl md:rounded-3xl p-2 md:p-3 
                    shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border 
                    ${!p.is_available ? 'border-slate-100 opacity-80 grayscale-[0.5]' : 'border-slate-100'}
                    hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 flex flex-col
                `}
              >
                {/* Image Area */}
                <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-slate-100 border border-slate-100/50">
                  {p.image_name ? (
                    <img src={getImageUrl(p.image_name) ?? ''} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                        <IconImage size={24} />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
                     {p.is_recommended && (
                         <span className="bg-amber-400 text-white text-[9px] md:text-[10px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-md shadow-sm flex items-center gap-1 backdrop-blur-sm">
                             <IconStar size={9} /> <span className="hidden md:inline">แนะนำ</span>
                         </span>
                     )}
                  </div>
                  
                  {/* Status Toggle */}
                  <button 
                        onClick={(e) => { e.stopPropagation(); handleToggle(p.id, p.is_available); }}
                        className={`absolute bottom-1.5 right-1.5 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all active:scale-90 z-20 ${p.is_available ? 'bg-white/90 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-slate-800/80 text-white'}`}
                  >
                        <div className={`w-2.5 h-2.5 rounded-full ${p.is_available ? 'bg-emerald-500' : 'bg-rose-500'} ${p.is_available ? '' : 'animate-pulse'}`}></div>
                  </button>

                  {/* Actions */}
                  <div className="absolute top-1.5 right-1.5 flex flex-col gap-1.5 md:opacity-0 group-hover:opacity-100 transition-all duration-200 md:translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => openModal(p)} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/90 text-slate-600 hover:text-blue-600 hover:bg-white shadow-sm backdrop-blur-sm flex items-center justify-center transition-colors">
                        <IconEdit size={12} className="md:w-[14px] md:h-[14px]"/>
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white shadow-sm backdrop-blur-sm flex items-center justify-center transition-colors">
                        <IconTrash size={12} className="md:w-[14px] md:h-[14px]"/>
                    </button>
                  </div>

                   {/* Sold Out Overlay */}
                   {!p.is_available && (
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
                        <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">หมด</span>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="pt-2.5 px-1 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors h-[2.5em]">{p.name}</h3>
                  
                  <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-col">
                         <span className="text-[10px] text-slate-400 line-clamp-1">
                             {categories.find(c => c.id === p.category_id)?.name || 'General'}
                         </span>
                         <p className="font-black text-slate-900 text-base md:text-lg tracking-tight">฿{p.price}</p>
                    </div>
                  </div>

                  {/* Tags Compact */}
                  {(p.price_special || p.price_jumbo) && (
                      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-dashed border-slate-100">
                        {p.price_special && <span className="bg-slate-50 px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-500 border border-slate-100">+พ {p.price_special}</span>}
                        {p.price_jumbo && <span className="bg-slate-50 px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-500 border border-slate-100">+จ {p.price_jumbo}</span>}
                      </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Floating Button (Mobile Only) */}
        <button onClick={() => openModal()} className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl shadow-slate-900/40 flex items-center justify-center z-40 hover:scale-110 transition-transform active:scale-90">
            <IconPlus size={24}/>
        </button>

        {/* =========================================
            MODAL 1: สร้าง/แก้ไขเมนู (ตัวหลัก)
        ============================================= */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
              
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                <div>
                    <h3 className="text-lg font-black text-slate-800">{editId ? 'แก้ไขเมนู' : 'สร้างเมนูใหม่'}</h3>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <IconX size={18}/>
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                
                {/* Image Upload Area */}
                <div className="flex justify-center">
                  <div className="relative group cursor-pointer w-full" onClick={() => fileInputRef.current?.click()}>
                    <div className="aspect-[4/3] w-full rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                      {formData.image_name ? (
                        <>
                            <img src={getImageUrl(formData.image_name) ?? ''} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-bold text-sm flex items-center gap-2"><IconEdit size={16}/> เปลี่ยนรูปภาพ</span>
                            </div>
                        </>
                      ) : (
                        <div className="text-slate-400 flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                                <IconImage size={24} className="text-slate-300" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">คลิกเพื่ออัพโหลดรูป</span>
                        </div>
                      )}
                    </div>
                    {uploading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl border border-blue-100">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs font-bold text-blue-600">กำลังอัพโหลด...</span>
                            </div>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">ชื่อเมนูอาหาร</label>
                    <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:font-normal" 
                        placeholder="เช่น ข้าวกะเพราหมูสับ"
                        required 
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">หมวดหมู่</label>
                    <div className="relative">
                        <select 
                            value={formData.category_id} 
                            onChange={e => setFormData({...formData, category_id: e.target.value})} 
                            className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer" 
                            required
                        >
                        <option value="">-- เลือกหมวดหมู่ --</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <IconChevronDown />
                        </div>
                    </div>
                  </div>
                </div>

                {/* Price Section */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">กำหนดราคา</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 text-center block">ปกติ</label>
                        <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-center font-black text-slate-800 focus:outline-none transition-colors" placeholder="0" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 text-center block">พิเศษ (+)</label>
                        <input type="number" value={formData.price_special} onChange={e => setFormData({...formData, price_special: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-center font-black text-slate-800 focus:outline-none transition-colors" placeholder="0" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 text-center block">จัมโบ้ (+)</label>
                        <input type="number" value={formData.price_jumbo} onChange={e => setFormData({...formData, price_jumbo: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-center font-black text-slate-800 focus:outline-none transition-colors" placeholder="0" />
                    </div>
                  </div>
                </div>

                {/* Toggle Recommended */}
                <label className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors group">
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${formData.is_recommended ? 'bg-amber-400 justify-end' : 'bg-slate-200 justify-start'}`}>
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.is_recommended} onChange={() => setFormData({...formData, is_recommended: !formData.is_recommended})} />
                  <div>
                      <span className="text-sm font-bold text-slate-700 block group-hover:text-amber-600 transition-colors">เมนูแนะนำ (Recommended)</span>
                      <span className="text-xs text-slate-400 block">แสดงดาว ⭐ และดันขึ้นแสดงผลก่อน</span>
                  </div>
                </label>

                {/* Footer Buttons */}
                <div className="pt-2 flex gap-3 pb-safe">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">ยกเลิก</button>
                  <button type="submit" disabled={isSubmitting || isCropModalOpen} className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-slate-900 shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                      {isSubmitting ? <span className="animate-pulse">กำลังบันทึก...</span> : 'บันทึกเมนู'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* =========================================
            MODAL 2: ระบบ Crop รูปภาพ (ซ้อนทับ Modal หลัก)
        ============================================= */}
        {isCropModalOpen && imageToCrop && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop สีเข้มกว่าเดิมนิดหน่อยให้รู้ว่าซ้อนทับ */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setIsCropModalOpen(false)}></div>
            
            <div className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <IconImage size={16} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">จัดตำแหน่งรูปภาพ</h3>
                </div>
                <button onClick={() => setIsCropModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <IconX size={18} />
                </button>
              </div>

              {/* Cropper Area */}
              <div className="relative w-full h-[50vh] sm:h-[400px] bg-slate-50">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1} // บังคับสัดส่วน 1:1 สี่เหลี่ยมจัตุรัส
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  showGrid={true}
                  style={{
                    containerStyle: { background: '#f8fafc' }, // สีพื้นหลังตอน Crop
                    cropAreaStyle: { border: '2px solid #3b82f6', borderRadius: '1rem', boxShadow: '0 0 0 9999em rgba(15, 23, 42, 0.5)' } // สไตล์กรอบฟ้าๆ ดู Premium
                  }}
                />
              </div>

              {/* Controls & Buttons */}
              <div className="p-6 bg-white space-y-6">
                
                {/* Slider ซูมรูป */}
                <div className="flex items-center gap-4 px-2">
                  <div className="text-slate-400"><IconImage size={20} /></div>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700"
                  />
                  <div className="text-slate-600"><IconZoom size={20} /></div>
                </div>
                
                {/* Footer Buttons */}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsCropModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                    ยกเลิก
                  </button>
                  <button onClick={handleCropComplete} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-blue-600 shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    ยืนยันรูปภาพ
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}