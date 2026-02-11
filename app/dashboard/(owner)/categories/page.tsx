// app/dashboard/categories/page.tsx
'use client';

import { useCategories } from '@/hooks/useCategories';

// --- ✨ Custom Icons ---
const IconLayer = ({ size = 24, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
const IconPlus = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconSearch = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconEdit = ({ size = 18, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const IconTrash = ({ size = 18, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconEye = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEyeOff = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>;
const IconX = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconSave = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

export default function CategoriesPage() {
  const {
    categories, filteredCategories, loading, 
    searchTerm, setSearchTerm,
    isModalOpen, setIsModalOpen, isSubmitting, editId,
    formData, updateFormData,
    openAddModal, openEditModal, handleSave, handleDelete, handleToggle
  } = useCategories();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      
      {/* --- Sticky Header (Consistent Style) --- */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-200/60 pt-4 pb-2 px-4 md:px-10 shadow-sm md:shadow-none transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-1.5 md:p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30 text-white">
                <IconLayer size={20} className="md:w-6 md:h-6" />
              </span>
              จัดการหมวดหมู่
            </h1>
             {/* Mobile Add Button (Small Top) */}
             <button onClick={openAddModal} className="md:hidden p-2 bg-slate-900 text-white rounded-lg active:scale-95 transition-transform">
                <IconPlus size={20} />
             </button>
          </div>

          <div className="flex gap-3">
             <div className="relative group w-full md:w-64">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <IconSearch />
                </div>
                <input 
                  type="text" 
                  placeholder="ค้นหา..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-600 placeholder:text-slate-400 text-sm md:text-base shadow-sm"
                />
            </div>

            <button 
              onClick={openAddModal}
              className="hidden md:flex bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 items-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
            >
              <IconPlus size={18} /> สร้างหมวดหมู่
            </button>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 md:px-10">
        
        {loading ? (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => <div key={i} className="bg-slate-200 h-32 md:h-40 rounded-2xl"></div>)}
           </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm mx-4">
             <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-300 mb-4">
                <IconLayer size={32} />
             </div>
             <h3 className="text-lg font-black text-slate-700">ไม่มีหมวดหมู่</h3>
             <button onClick={openAddModal} className="mt-4 text-indigo-600 font-bold hover:underline text-sm">
                 + สร้างหมวดหมู่ใหม่
             </button>
          </div>
        ) : (
          // ✅✅✅ GRID SYSTEM ปรับปรุงใหม่: Mobile = 2 Columns
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredCategories.map((cat) => (
              <div 
                key={cat.id} 
                className="group relative bg-white p-3 md:p-6 rounded-2xl md:rounded-[28px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 min-h-[9rem] md:min-h-[11rem]"
              >
                
                {/* Header: Rank & Actions */}
                <div className="flex justify-between items-start mb-2 md:mb-4">
                    {/* Rank Badge */}
                    <div className="w-7 h-7 md:w-10 md:h-10 bg-slate-50 text-slate-500 border border-slate-100 rounded-full flex items-center justify-center font-black text-xs md:text-sm shadow-inner group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                        {cat.sort_order}
                    </div>

                    {/* Actions (Always visible on mobile, Hover on desktop) */}
                    <div className="flex gap-1 md:gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(cat)} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center transition-colors">
                            <IconEdit size={14} className="md:w-4 md:h-4"/>
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors">
                            <IconTrash size={14} className="md:w-4 md:h-4"/>
                        </button>
                    </div>
                </div>

                {/* Content: Name */}
                <div className="flex-1 flex items-center justify-center text-center px-1 mb-2">
                    <h3 className="font-black text-slate-800 text-sm md:text-lg line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                        {cat.name}
                    </h3>
                </div>

                {/* Footer: Toggle */}
                <div className="pt-2 md:pt-3 border-t border-dashed border-slate-100 flex justify-center">
                    <button 
                      onClick={() => handleToggle(cat.id, cat.is_active)}
                      className={`
                        w-full text-[10px] md:text-xs font-bold py-1.5 md:py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all
                        ${cat.is_active 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}
                      `}
                    >
                        {cat.is_active ? (
                            <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> แสดงผล</>
                        ) : (
                            <><IconEyeOff size={12} /> ซ่อนอยู่</>
                        )}
                    </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Mobile Floating Add Button */}
        <button 
          onClick={openAddModal}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl shadow-slate-900/40 flex items-center justify-center hover:scale-110 transition-transform active:scale-90 z-40"
        >
          <IconPlus size={24} />
        </button>

        {/* --- Modern Modal --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsModalOpen(false)}
            ></div>
            
            <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
              
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    {editId ? 'แก้ไขหมวดหมู่' : 'สร้างหมวดหมู่'}
                  </h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <IconX size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">ชื่อหมวดหมู่</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <IconLayer size={18} />
                    </div>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white border focus:border-indigo-500 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:font-normal placeholder:text-slate-400"
                      placeholder="เช่น ของทอด, เครื่องดื่ม"
                      autoFocus
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">ลำดับการแสดงผล</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors font-black text-sm">#</div>
                    <input 
                      type="number" 
                      value={formData.sort_order}
                      onChange={(e) => updateFormData('sort_order', parseInt(e.target.value) || 0)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white border focus:border-indigo-500 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded">Tips</span>
                      <p className="text-[10px] text-slate-400 font-medium">เลขน้อยจะแสดงก่อน (1, 2, 3...)</p>
                  </div>
                </div>

                <div className="pt-2 flex gap-3 pb-safe">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all">ยกเลิก</button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !formData.name.trim()}
                    className="flex-1 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <span className="animate-pulse">...</span> : 'บันทึก'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}