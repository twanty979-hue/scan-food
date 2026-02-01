// app/dashboard/categories/page.tsx
'use client';

import { useCategories } from '@/hooks/useCategories';

// --- ✨ Custom Icons (Refined) ---
const IconLayer = ({ size = 24, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
const IconPlus = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconSearch = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconEdit = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const IconTrash = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
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
      
      {/* --- Sticky Glass Header --- */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC]/80 backdrop-blur-md border-b border-slate-200/50 pt-6 pb-4 px-6 md:px-10 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              {/* ใช้สี Indigo เพื่อแยกความแตกต่างจากหน้า Products (สีฟ้า) */}
              <span className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30 text-white">
                <IconLayer size={24} />
              </span>
              จัดการหมวดหมู่
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1 ml-14 hidden md:block">
              จัดระเบียบกลุ่มสินค้าและลำดับการแสดงผล
            </p>
          </div>

          <div className="flex gap-3">
             {/* Search Input */}
             <div className="relative group w-full md:w-64">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <IconSearch />
                </div>
                <input 
                  type="text" 
                  placeholder="ค้นหาหมวดหมู่..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-600 placeholder:text-slate-400 shadow-sm"
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
      <div className="max-w-7xl mx-auto p-6 md:px-10">
        
        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => <div key={i} className="bg-slate-200 h-40 rounded-3xl"></div>)}
           </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
             <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-300 mb-6">
                <IconLayer size={40} />
             </div>
             <h3 className="text-xl font-black text-slate-700">ยังไม่มีหมวดหมู่</h3>
             <p className="text-slate-400 mt-2 mb-6">สร้างหมวดหมู่แรกเพื่อจัดกลุ่มสินค้าของคุณ</p>
             <button onClick={openAddModal} className="text-indigo-600 font-bold hover:underline">
                 + สร้างหมวดหมู่ใหม่
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => (
              <div 
                key={cat.id} 
                className="group relative bg-white p-6 rounded-[28px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1"
              >
                
                {/* Header Card: Rank & Toggle */}
                <div className="flex justify-between items-center mb-6">
                    {/* Rank Badge */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-slate-50 text-slate-500 border border-slate-100 rounded-full flex items-center justify-center font-black text-sm shadow-inner group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                            {cat.sort_order}
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Order</span>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button 
                      onClick={() => handleToggle(cat.id, cat.is_active)}
                      className={`
                        text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all border
                        ${cat.is_active 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}
                      `}
                    >
                        {cat.is_active ? (
                            <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> แสดงผล</>
                        ) : (
                            <><IconEyeOff size={12} /> ซ่อนอยู่</>
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="mb-4">
                    <h3 className="font-black text-slate-800 text-xl mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {cat.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 font-mono tracking-tight opacity-60">
                        ID: {cat.id.split('-')[0]}...
                    </p>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-dashed border-slate-100 flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => openEditModal(cat)} 
                        className="flex-1 py-2.5 rounded-xl bg-slate-50 text-slate-600 border border-transparent hover:border-slate-200 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all flex items-center justify-center gap-2 font-bold text-xs"
                    >
                        <IconEdit size={14} /> แก้ไข
                    </button>
                    <button 
                        onClick={() => handleDelete(cat.id)} 
                        className="w-10 py-2.5 rounded-xl bg-slate-50 text-slate-400 border border-transparent hover:border-red-100 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                    >
                        <IconTrash size={14} />
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
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsModalOpen(false)}
            ></div>
            
            {/* Modal Content */}
            <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
              
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    {editId ? 'แก้ไขหมวดหมู่' : 'สร้างหมวดหมู่'}
                  </h3>
                  <p className="text-xs text-slate-400">กรอกข้อมูลให้ครบถ้วน</p>
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
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-indigo-500 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:font-normal placeholder:text-slate-400"
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
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white border focus:border-indigo-500 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded">Tips</span>
                      <p className="text-[10px] text-slate-400 font-medium">เลขน้อยจะแสดงก่อน (1, 2, 3...)</p>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-2xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all">ยกเลิก</button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !formData.name.trim()}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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