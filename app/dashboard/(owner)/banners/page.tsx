// app/dashboard/banners/page.tsx
'use client';

import { useBanners } from '@/hooks/useBanners';
import Cropper from 'react-easy-crop';
import { useState, useCallback } from 'react';

// --- ✨ Custom Icons ---
const IconPlus = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconTrash = ({ size = 18, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconEdit = ({ size = 18, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const IconImage = ({ size = 24 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const IconLink = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
const IconSort = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>;
const IconX = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconBanner = ({ size = 24, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><path d="M9 21V9"/></svg>;
const IconEyeOff = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>;
const IconZoom = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;

export default function BannersPage() {
  const {
    banners, loading, isModalOpen, isSubmitting, editingId,
    formData, updateFormData,
    previewUrl, handleImageUpload, fileInputRef,
    openEdit, closeModal, handleSubmit, handleDelete, setIsModalOpen,
    getImageUrl,
    imageToCrop, setIsCropModalOpen, isCropModalOpen,
    setCroppedAreaPixels, handleCropComplete
  } = useBanners();

  // ✂️ Local State สำหรับควบคุมกรอบ Crop
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, [setCroppedAreaPixels]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      
      {/* --- Sticky Glass Header --- */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-200/60 pt-4 pb-2 px-4 md:px-10 shadow-sm md:shadow-none transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-1.5 md:p-2 bg-rose-600 rounded-xl shadow-lg shadow-rose-500/30 text-white">
                <IconBanner size={20} className="md:w-6 md:h-6" />
              </span>
              จัดการแบนเนอร์
            </h1>
            <button onClick={() => setIsModalOpen(true)} className="md:hidden p-2 bg-slate-900 text-white rounded-lg active:scale-95 transition-transform">
               <IconPlus size={20} />
            </button>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 items-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
          >
            <IconPlus size={18} /> เพิ่มแบนเนอร์
          </button>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 md:px-10">
        
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-pulse">
                {[...Array(2)].map((_, i) => <div key={i} className="bg-slate-200 aspect-[21/9] rounded-3xl"></div>)}
            </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm mx-4">
             <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-300 mb-6">
                <IconImage size={32} />
             </div>
             <h3 className="text-lg font-black text-slate-700">ยังไม่มีแบนเนอร์</h3>
             <p className="text-slate-400 mt-2 mb-6 text-sm">เพิ่มรูปภาพเพื่อโปรโมทร้านของคุณ</p>
             <button onClick={() => setIsModalOpen(true)} className="text-rose-600 font-bold hover:underline text-sm">
                 + เพิ่มแบนเนอร์ใหม่
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {banners.map((b) => (
              <div 
                key={b.id} 
                className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Image Area */}
                <div className="aspect-[21/9] bg-slate-100 relative overflow-hidden">
                  <img 
                    src={getImageUrl(b.image_name) || ''} 
                    className={`w-full h-full object-cover transition-transform duration-700 ${b.is_active ? 'group-hover:scale-105' : 'grayscale opacity-60'}`} 
                    alt="Banner" 
                  />
                  
                  {/* Rank Badge */}
                  <div className="absolute top-3 left-3 z-10">
                      <div className="h-8 min-w-[2rem] px-2 rounded-lg bg-white/90 backdrop-blur-sm text-slate-600 border border-white/50 flex items-center justify-center font-black text-xs shadow-sm">
                          #{b.sort_order}
                      </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-2 z-20">
                      <button 
                        onClick={() => openEdit(b)} 
                        className="w-8 h-8 rounded-full bg-white/90 text-slate-600 hover:text-rose-600 hover:bg-white flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors"
                      >
                          <IconEdit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(b.id)} 
                        className="w-8 h-8 rounded-full bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors"
                      >
                          <IconTrash size={14} />
                      </button>
                  </div>
                </div>

                {/* Info Area */}
                <div className="px-4 py-3 md:px-6 md:py-4 bg-white flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-black text-slate-800 text-base md:text-lg truncate mb-1">
                            {b.title || <span className="text-slate-300 italic">ไม่ได้ระบุชื่อ</span>}
                        </h3>
                        {b.link_url ? (
                              <a href={b.link_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-rose-500 flex items-center gap-1.5 hover:underline truncate w-full">
                                  <IconLink size={12}/> {b.link_url.replace(/^https?:\/\//, '')}
                              </a>
                        ) : (
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 opacity-60">
                                <IconLink size={12}/> No Link
                            </span>
                        )}
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <div className="pt-2 border-t border-dashed border-slate-100">
                     <button 
                        onClick={() => updateFormData('isActive', !b.is_active)}
                        className={`
                            w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors
                            ${b.is_active 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-slate-50 text-slate-400'}
                        `}
                     >
                        {b.is_active ? (
                            <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> แสดงผล (Active)</>
                        ) : (
                            <><IconEyeOff size={14} /> ซ่อนอยู่ (Inactive)</>
                        )}
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={() => setIsModalOpen(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl shadow-slate-900/40 flex items-center justify-center hover:scale-110 transition-transform active:scale-90 z-40"
        >
          <IconPlus size={24} />
        </button>

        {/* =========================================
            MODAL 1: สร้าง/แก้ไขแบนเนอร์ (ตัวหลัก)
        ============================================= */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>

            <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                <div>
                   <h2 className="text-lg font-black text-slate-800">
                      {editingId ? 'แก้ไขแบนเนอร์' : 'เพิ่มแบนเนอร์ใหม่'}
                   </h2>
                   <p className="text-xs text-slate-400">ขนาดแนะนำ 21:9 (ความละเอียดสูงชัดตาแตก)</p>
                </div>
                <button onClick={closeModal} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <IconX size={18}/>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                
                {/* Image Upload Area */}
                <div className="space-y-2 flex justify-center">
                  <div className="relative group cursor-pointer w-full" onClick={() => fileInputRef.current?.click()}>
                    <div 
                        className={`w-full aspect-[21/9] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden relative
                        ${previewUrl ? 'border-transparent bg-slate-900' : 'border-slate-200 bg-slate-50 hover:border-rose-300 hover:bg-rose-50/30'}`}
                    >
                      {previewUrl ? (
                          <>
                            <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                <span className="text-white font-bold text-sm flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/50">
                                    <IconEdit size={16}/> เปลี่ยนรูปภาพ
                                </span>
                            </div>
                          </>
                      ) : (
                          <div className="text-slate-400 flex flex-col items-center gap-2 group-hover:text-rose-400 transition-colors">
                              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                                 <IconImage size={24} />
                              </div>
                              <span className="text-xs font-bold uppercase tracking-wider">คลิกเพื่ออัปโหลด</span>
                          </div>
                      )}
                      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ชื่อแบนเนอร์</label>
                        <input 
                            type="text" 
                            value={formData.title} 
                            onChange={(e) => updateFormData('title', e.target.value)} 
                            className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white border focus:border-rose-500 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all placeholder:font-normal placeholder:text-slate-400" 
                            placeholder="เช่น โปรโมชั่นหน้าร้อน" 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1"><IconSort size={12}/> ลำดับ</label>
                        <input 
                            type="number" 
                            value={formData.sortOrder} 
                            onChange={(e) => updateFormData('sortOrder', Number(e.target.value))} 
                            className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white border focus:border-rose-500 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all text-center" 
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ลิงก์ปลายทาง (Optional)</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors"><IconLink size={16}/></div>
                    <input 
                        type="text" 
                        value={formData.linkUrl} 
                        onChange={(e) => updateFormData('linkUrl', e.target.value)} 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white border focus:border-rose-500 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all placeholder:font-normal placeholder:text-slate-400 font-mono text-sm" 
                        placeholder="https://..." 
                    />
                  </div>
                </div>

                <label className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors group">
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${formData.isActive ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'}`}>
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.isActive} onChange={() => updateFormData('isActive', !formData.isActive)} />
                  <div className="flex-1">
                      <span className="text-sm font-bold text-slate-700 block group-hover:text-slate-900 transition-colors">
                          {formData.isActive ? 'แสดงผลหน้าเว็บ' : 'ซ่อนไว้ก่อน'}
                      </span>
                  </div>
                </label>

                <div className="grid grid-cols-3 gap-3 pt-2 pb-safe">
                  <button type="button" onClick={closeModal} className="py-3.5 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all">ยกเลิก</button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="col-span-2 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <span className="animate-pulse">กำลังบันทึก...</span> : 'บันทึกแบนเนอร์'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================
            MODAL 2: ระบบ Crop รูปภาพ (ซ้อนทับ Modal หลัก) Theme สี Rose
        ============================================= */}
        {isCropModalOpen && imageToCrop && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setIsCropModalOpen(false)}></div>
            
            <div className="bg-white w-full max-w-xl rounded-[28px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
              
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <IconImage size={16} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">จัดตำแหน่งแบนเนอร์</h3>
                </div>
                <button onClick={() => setIsCropModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <IconX size={18} />
                </button>
              </div>

              <div className="relative w-full h-[40vh] sm:h-[350px] bg-slate-50">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={21 / 9} // 🌟 บังคับสัดส่วนแนวยาว Cinematic
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  showGrid={true}
                  style={{
                    containerStyle: { background: '#f8fafc' }, 
                    cropAreaStyle: { border: '2px solid #e11d48', borderRadius: '0.75rem', boxShadow: '0 0 0 9999em rgba(15, 23, 42, 0.5)' } // สไตล์กรอบสี Rose
                  }}
                />
              </div>

              <div className="p-6 bg-white space-y-6">
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
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600 hover:accent-rose-700"
                  />
                  <div className="text-slate-600"><IconZoom size={20} /></div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsCropModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                    ยกเลิก
                  </button>
                  <button onClick={handleCropComplete} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-rose-600 shadow-lg shadow-rose-500/30 hover:bg-rose-700 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    ยืนยันการตัดรูป
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