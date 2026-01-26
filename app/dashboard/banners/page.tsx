// app/dashboard/banners/page.tsx
'use client';

import { useBanners } from '@/hooks/useBanners';

// --- Icons (คุณแยกไปไฟล์ components/Icons.tsx ก็ได้นะ จะได้สะอาดกว่านี้) ---
const IconPlus = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconTrash = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconEdit = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconImage = ({ size = 24 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const IconLink = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
const IconSort = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>;
const IconX = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconSave = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const IconBanner = ({ size = 24 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M2 12l5-5"/><path d="M22 12l-5-5"/><path d="M2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6"/></svg>;

export default function BannersPage() {
  const {
    banners, loading, isModalOpen, isSubmitting, editingId,
    formData, updateFormData,
    previewUrl, handleFileChange,
    openEdit, closeModal, handleSubmit, handleDelete, setIsModalOpen,
    getImageUrl
  } = useBanners();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900 pb-32">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <IconBanner /> จัดการแบนเนอร์
          </h1>
          <p className="text-slate-500 font-bold text-sm mt-1">ภาพสไลด์โชว์หน้าร้าน</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
        >
          <IconPlus /> เพิ่มแบนเนอร์
        </button>
      </div>

      {/* Banner Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-pulse">
            <p className="font-bold tracking-widest uppercase">LOADING...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="max-w-6xl mx-auto bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
              <IconImage />
            </div>
            <h3 className="text-lg font-black text-slate-700">ยังไม่มีแบนเนอร์</h3>
            <button onClick={() => setIsModalOpen(true)} className="text-slate-900 font-bold hover:underline text-sm mt-2">เพิ่มเลย +</button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div key={b.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-200 group hover:shadow-xl transition-all duration-300 relative">
              
              {/* Image Area */}
              <div className="aspect-[21/9] bg-slate-100 relative overflow-hidden">
                <img src={getImageUrl(b.image_name) || ''} className={`w-full h-full object-cover transition-all duration-700 ${b.is_active ? 'group-hover:scale-105' : 'grayscale opacity-60'}`} alt="" />
                
                <div className="absolute top-4 left-4">
                    {b.is_active ? (
                        <span className="bg-green-500/90 backdrop-blur text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Active
                        </span>
                    ) : (
                        <span className="bg-slate-900/90 backdrop-blur text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide shadow-sm">
                            Inactive
                        </span>
                    )}
                </div>

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => openEdit(b)} className="w-9 h-9 rounded-full bg-white/90 backdrop-blur text-slate-900 flex items-center justify-center shadow-md hover:bg-white transition-colors"><IconEdit size={16}/></button>
                    <button onClick={() => handleDelete(b.id)} className="w-9 h-9 rounded-full bg-red-500/90 backdrop-blur text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"><IconTrash size={16}/></button>
                </div>
              </div>

              {/* Info Area */}
              <div className="p-5 flex justify-between items-center">
                <div className="overflow-hidden">
                  <h3 className="font-black text-slate-900 text-lg truncate">{b.title || 'ไม่มีชื่อ'}</h3>
                  <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Order: {b.sort_order}</span>
                      {b.link_url && (
                          <a href={b.link_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:underline truncate max-w-[150px]">
                              <IconLink size={12}/> {b.link_url}
                          </a>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Modal Form --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
            
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                <h2 className="text-xl font-black flex items-center gap-2">
                    {editingId ? <><IconEdit /> แก้ไขแบนเนอร์</> : <><IconPlus /> เพิ่มแบนเนอร์ใหม่</>}
                </h2>
                <button onClick={closeModal} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"><IconX size={18}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-5">
                
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">รูปภาพ (21:9)</label>
                  <div className="relative group">
                    <div className={`w-full aspect-[21/9] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-slate-50 group-hover:border-slate-400 cursor-pointer ${previewUrl ? 'border-transparent' : 'border-slate-200'}`}>
                      {previewUrl ? (
                          <>
                            <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-bold text-sm flex items-center gap-2"><IconEdit size={16}/> เปลี่ยนรูป</span>
                            </div>
                          </>
                      ) : (
                          <div className="text-slate-300 flex flex-col items-center gap-2">
                              <IconImage size={32} />
                              <span className="text-xs font-bold uppercase tracking-wider">คลิกเพื่ออัปโหลด</span>
                          </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อแบนเนอร์</label>
                    <input type="text" value={formData.title} onChange={(e) => updateFormData('title', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold text-sm text-slate-800" placeholder="โปรโมชั่น..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">ลำดับ</label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><IconSort size={14}/></div>
                        <input type="number" value={formData.sortOrder} onChange={(e) => updateFormData('sortOrder', Number(e.target.value))} className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold text-sm text-slate-800" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">ลิงก์ (ไม่บังคับ)</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><IconLink size={14}/></div>
                    <input type="text" value={formData.linkUrl} onChange={(e) => updateFormData('linkUrl', e.target.value)} className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold text-sm text-slate-800 font-mono" placeholder="https://..." />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer" onClick={() => updateFormData('isActive', !formData.isActive)}>
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${formData.isActive ? 'bg-green-500' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${formData.isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-wider select-none">{formData.isActive ? 'แสดงผล' : 'ซ่อนไว้'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <button type="button" onClick={closeModal} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">ยกเลิก</button>
                <button type="submit" disabled={isSubmitting} className="py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {isSubmitting ? 'กำลังบันทึก...' : <><IconSave size={16}/> บันทึก</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}