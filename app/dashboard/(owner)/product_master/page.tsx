// app/dashboard/(owner)/product_master/page.tsx
'use client';

import { useProductMaster } from '@/hooks/useProductMaster'; 
import Cropper from 'react-easy-crop';
import { useCallback } from 'react';

// --- ✨ Custom Icons ---
const IconBox = ({ size = 24, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconBarcode = ({ size = 20, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>;
const IconPlus = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconSearch = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconEdit = ({ size = 18, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const IconTrash = ({ size = 18, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconImage = ({ size = 32, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IconX = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconZoom = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;
const IconLayer = ({ size = 24, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;

export default function ProductMasterPage() {
  const {
    filteredProducts, categories, loading, searchTerm, setSearchTerm, selectedCategoryId, setSelectedCategoryId,
    isModalOpen, setIsModalOpen, isSubmitting, editId, uploading, formData, setFormData, initialStock, setInitialStock,
    fileInputRef, getImageUrl, handleImageUpload, handleSave, handleDelete, handleToggle, openModal,
    imageToCrop, isCropModalOpen, setIsCropModalOpen, crop, setCrop, zoom, setZoom, setCroppedAreaPixels, handleCropComplete,
    isCatModalOpen, setIsCatModalOpen, isCatSubmitting, catFormData, setCatFormData, handleCatSave
  } = useProductMaster();

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
              <span className="p-1.5 md:p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30 text-white">
                <IconBox size={20} className="md:w-6 md:h-6" />
              </span>
              จัดการสินค้ามาสเตอร์
            </h1>
            <button onClick={() => openModal()} className="md:hidden p-2 bg-slate-900 text-white rounded-lg active:scale-95 transition-transform">
                <IconPlus size={20} />
            </button>
          </div>

          <div className="flex gap-3">
            <div className="relative group w-full md:w-64">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <IconSearch />
              </div>
              <input 
                type="text" 
                placeholder="ค้นหาชื่อ, บาร์โค้ด, SKU..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-600 placeholder:text-slate-400 text-sm md:text-base shadow-sm"
              />
            </div>
            <button 
              onClick={() => openModal()}
              className="hidden md:flex bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 items-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
            >
              <IconPlus size={18} /> เพิ่มสินค้า
            </button>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="max-w-7xl mx-auto mt-4 overflow-x-auto no-scrollbar pb-2">
          <div className="flex gap-2 items-center">
            <button 
                onClick={() => setSelectedCategoryId('ALL')} 
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all border shrink-0 ${selectedCategoryId === 'ALL' ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
            >
                ทั้งหมด
            </button>
            {categories.map((cat: any) => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategoryId(cat.id)} 
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all border shrink-0 whitespace-nowrap ${selectedCategoryId === cat.id ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
              >
                {cat.name}
              </button>
            ))}
            <button 
                onClick={() => setIsCatModalOpen(true)} 
                className="px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all border shrink-0 flex items-center gap-1.5 border-dashed border-emerald-400 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100 ml-2"
            >
                <IconPlus size={14} /> สร้างหมวดหมู่
            </button>
          </div>
        </div>
      </div>

      {/* --- Main Content (Grid) --- */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 md:px-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-pulse">
             {[...Array(8)].map((_, i) => <div key={i} className="bg-slate-200 aspect-square rounded-2xl"></div>)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm mx-4">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-300 mb-4">
                <IconBox size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-700">ไม่มีสินค้าในหมวดหมู่นี้</h3>
            <p className="text-slate-500 text-sm mt-1">เริ่มเพิ่มสินค้าของคุณที่นี่เลย</p>
            <button onClick={() => openModal()} className="mt-4 px-6 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-colors">
                + เพิ่มสินค้าใหม่
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
            {filteredProducts.map((p: any) => {
              return (
              <div 
                key={p.id} 
                className={`
                    group relative bg-white rounded-2xl p-2 md:p-3 
                    shadow-sm border border-slate-100
                    hover:shadow-md transition-all duration-300 flex flex-col
                    ${!p.is_active ? 'opacity-60 grayscale-[0.5]' : ''}
                `}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100/50">
                  {p.image_url ? (
                    <img src={getImageUrl(p.image_url) ?? ''} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><IconImage size={24} /></div>
                  )}

                  {/* ❌ ไม่มีการเอาป้ายสต็อกกลับมาใส่ตรงนี้นะครับ หน้าจอจะคลีนๆ เลย */}

                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 md:opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button onClick={() => openModal(p)} className="w-7 h-7 rounded-full bg-white/90 text-slate-600 hover:text-emerald-600 shadow-sm backdrop-blur-sm flex items-center justify-center">
                        <IconEdit size={14}/>
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="w-7 h-7 rounded-full bg-white/90 text-slate-400 hover:text-red-500 shadow-sm backdrop-blur-sm flex items-center justify-center">
                        <IconTrash size={14}/>
                    </button>
                  </div>
                </div>
                
                <div className="pt-3 px-1 flex-1 flex flex-col">
                  <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <IconBarcode size={12} />
                      <span className="text-[9px] font-mono tracking-wider truncate">{p.barcode || p.sku || 'No Barcode'}</span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-2">{p.name}</h3>
                  
                  <div className="mt-auto pt-2 border-t border-slate-50 flex items-end justify-between">
                    <div>
                         <span className="text-[10px] text-slate-400 block mb-0.5">ราคาขาย</span>
                         <p className="font-black text-emerald-600 text-base leading-none">฿{p.price}</p>
                    </div>
                    <button 
                        onClick={() => handleToggle(p.id, p.is_active)}
                        className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${p.is_active ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'}`}
                    >
                        <div className="w-3 h-3 rounded-full bg-white shadow-sm"></div>
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}

        <button onClick={() => openModal()} className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl shadow-slate-900/40 flex items-center justify-center z-40 hover:scale-110 transition-transform active:scale-90">
            <IconPlus size={24}/>
        </button>

        {/* =========================================
            MODAL 1: สร้าง/แก้ไขสินค้ามาสเตอร์
        ============================================= */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white w-full max-w-2xl rounded-[28px] shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
              
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 rounded-t-[28px]">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <IconBox size={20} className="text-emerald-500"/>
                    {editId ? 'แก้ไขข้อมูลสินค้า' : 'สร้างสินค้าใหม่'}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-200 flex items-center justify-center">
                    <IconX size={18}/>
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 shrink-0">
                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">รูปภาพสินค้า</label>
                        <div className="relative group cursor-pointer w-full aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:border-emerald-400 hover:bg-emerald-50/30 transition-all" onClick={() => fileInputRef.current?.click()}>
                            {formData.image_url ? (
                                <>
                                    <img src={getImageUrl(formData.image_url) ?? ''} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white font-bold text-xs flex items-center gap-1"><IconEdit size={14}/> เปลี่ยนรูป</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-slate-400 flex flex-col items-center gap-2">
                                    <IconImage size={24} className="text-slate-300" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">อัพโหลดรูปภาพ</span>
                                </div>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>
                    </div>

                    <div className="w-full flex-1 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">ชื่อสินค้า <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl font-bold text-slate-800 focus:outline-none transition-all" placeholder="เช่น น้ำดื่มตราสิงห์ 600มล." required />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-bold text-slate-500 block">หมวดหมู่</label>
                                <button type="button" onClick={() => setIsCatModalOpen(true)} className="text-[10px] md:text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors">
                                    <IconPlus size={12}/> สร้างหมวดหมู่ใหม่
                                </button>
                            </div>
                            <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl font-bold text-slate-700 focus:outline-none transition-all">
                                <option value="">-- เลือกหมวดหมู่ --</option>
                                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><IconBarcode size={14}/> รหัสบาร์โค้ด (Barcode)</label>
                        <input type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl font-mono text-slate-800 focus:outline-none transition-all" placeholder="สแกน หรือ พิมพ์บาร์โค้ด" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">รหัส SKU (ถ้ามี)</label>
                        <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl font-mono text-slate-800 focus:outline-none transition-all" placeholder="เช่น DRINK-001" />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ราคาขาย (Price) <span className="text-red-500">*</span></label>
                        <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-emerald-500 rounded-lg font-black text-emerald-600 focus:outline-none transition-all" placeholder="0" required />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">ต้นทุน (Cost)</label>
                        <input type="number" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-emerald-500 rounded-lg font-bold text-slate-700 focus:outline-none transition-all" placeholder="0" />
                    </div>
                    
                    {/* ✅ ช่องสต็อกเริ่มต้น ใส่ไว้เหมือนเดิมตามที่พี่สั่งเลยครับ */}
                    {!editId && (
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">สต็อกเริ่มต้น</label>
                            <input type="number" value={initialStock} onChange={e => setInitialStock(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-blue-200 focus:border-blue-500 rounded-lg font-black text-blue-600 focus:outline-none transition-all" placeholder="0" min="0" />
                        </div>
                    )}
                </div>

                <div className="pt-2 flex gap-3 pb-safe mt-auto">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">ยกเลิก</button>
                  <button type="submit" disabled={isSubmitting || isCropModalOpen} className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-slate-900 shadow-lg shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                      {isSubmitting ? <span className="animate-pulse">กำลังบันทึก...</span> : 'บันทึกข้อมูลสินค้า'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================
            ✅ MODAL 2: สร้างหมวดหมู่ (ซ้อนทับ Modal หลักได้)
        ============================================= */}
        {isCatModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={() => setIsCatModalOpen(false)}></div>
            <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
              
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                <div>
                  <h3 className="text-lg font-black text-slate-800">สร้างหมวดหมู่ใหม่</h3>
                </div>
                <button onClick={() => setIsCatModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <IconX size={18} />
                </button>
              </div>

              <form onSubmit={handleCatSave} className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">ชื่อหมวดหมู่</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                        <IconLayer size={18} />
                    </div>
                    <input 
                      type="text" 
                      value={catFormData.name}
                      onChange={(e) => setCatFormData({...catFormData, name: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white border focus:border-emerald-500 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:font-normal placeholder:text-slate-400"
                      placeholder="เช่น เครื่องดื่ม, ของใช้"
                      autoFocus
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">ลำดับการแสดงผล</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors font-black text-sm">#</div>
                    <input 
                      type="number" 
                      value={catFormData.sort_order}
                      onChange={(e) => setCatFormData({...catFormData, sort_order: Number(e.target.value) || 0})}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white border focus:border-emerald-500 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3 pb-safe">
                  <button type="button" onClick={() => setIsCatModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all">ยกเลิก</button>
                  <button 
                    type="submit" 
                    disabled={isCatSubmitting || !catFormData.name.trim()}
                    className="flex-1 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-emerald-600 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCatSubmitting ? <span className="animate-pulse">...</span> : 'บันทึก'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* =========================================
            MODAL 3: ระบบ Crop รูปภาพ
        ============================================= */}
        {isCropModalOpen && imageToCrop && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsCropModalOpen(false)}></div>
            <div className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
              
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <IconImage size={16} className="text-emerald-500" /> ตัดรูปภาพ
                </h3>
                <button onClick={() => setIsCropModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-200 flex items-center justify-center"><IconX size={18}/></button>
              </div>

              <div className="relative w-full h-[50vh] sm:h-[400px] bg-slate-50">
                <Cropper
                  image={imageToCrop} crop={crop} zoom={zoom} aspect={1}
                  onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} showGrid={true}
                  style={{ containerStyle: { background: '#f8fafc' }, cropAreaStyle: { border: '2px solid #10b981', borderRadius: '1rem', boxShadow: '0 0 0 9999em rgba(15, 23, 42, 0.5)' } }}
                />
              </div>

              <div className="p-6 bg-white space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <IconImage size={20} className="text-slate-400" />
                  <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                  <IconZoom size={20} className="text-slate-600" />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsCropModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50">ยกเลิก</button>
                  <button onClick={handleCropComplete} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-emerald-500 shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all">ยืนยันรูปภาพ</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}