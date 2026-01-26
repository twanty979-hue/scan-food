// app/dashboard/categories/page.tsx
'use client';

import { useCategories } from '@/hooks/useCategories';

// --- Icons (Keep in file for convenience) ---
const IconLayer = ({ size = 24 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
const IconPlus = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconSearch = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconEdit = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconEye = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEyeOff = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
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
    <div className="min-h-screen bg-slate-50 p-6 font-sans pb-32">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <IconLayer /> จัดการหมวดหมู่
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-bold">จัดระเบียบเมนูอาหารของคุณ</p>
          </div>
          
          <button 
            onClick={openAddModal}
            className="hidden md:flex bg-slate-900 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:bg-slate-800 items-center gap-2 transition-all active:scale-95"
          >
            <IconPlus /> เพิ่มหมวดหมู่
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-200 mb-8 flex items-center gap-3 sticky top-4 z-10">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <IconSearch />
            </div>
            <input 
              type="text" 
              placeholder="ค้นหาหมวดหมู่..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all font-bold text-slate-700"
            />
          </div>
          <div className="text-slate-400 text-xs font-black whitespace-nowrap bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
            {categories.length} รายการ
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-pulse">
            <p className="font-bold tracking-widest uppercase">LOADING...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-[28px] border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
              <IconLayer />
            </div>
            <h3 className="text-lg font-black text-slate-700">ยังไม่มีหมวดหมู่</h3>
            <button onClick={openAddModal} className="text-slate-900 font-bold hover:underline text-sm mt-2">สร้างเลย +</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden">
                
                {/* Header Card */}
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner">
                        #{cat.sort_order}
                    </div>
                    
                    {/* Toggle Status */}
                    <button 
                      onClick={() => handleToggle(cat.id, cat.is_active)}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors border ${cat.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                    >
                        {cat.is_active ? <IconEye size={14} /> : <IconEyeOff size={14} />}
                        {cat.is_active ? 'แสดง' : 'ซ่อน'}
                    </button>
                </div>

                {/* Content */}
                <div>
                    <h3 className="font-black text-slate-900 text-xl mb-1">{cat.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase">Category ID: {cat.id.slice(0, 6)}</p>
                </div>

                {/* Actions Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                    <button onClick={() => openEditModal(cat)} className="flex-1 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-sm">
                        <IconEdit size={16} /> แก้ไข
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="w-12 py-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                        <IconTrash size={16} />
                    </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Mobile Floating Add Button */}
        <button 
          onClick={openAddModal}
          className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40 border-4 border-white"
        >
          <IconPlus size={28} />
        </button>

        {/* --- Modal (Add / Edit) --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-200">
              
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-black flex items-center gap-2">
                  {editId ? <><IconEdit /> แก้ไขหมวดหมู่</> : <><IconPlus /> เพิ่มหมวดหมู่</>}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <IconX size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">ชื่อหมวดหมู่</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><IconLayer size={18} /></div>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-800"
                      placeholder="เช่น ของหวาน, เครื่องดื่ม"
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">ลำดับการแสดงผล</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">#</div>
                    <input 
                      type="number" 
                      value={formData.sort_order}
                      onChange={(e) => updateFormData('sort_order', parseInt(e.target.value) || 0)}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-800"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-bold ml-1">*เลขน้อยจะแสดงก่อน (เช่น 1, 2, 3)</p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">ยกเลิก</button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !formData.name.trim()}
                    className="flex-1 py-4 rounded-2xl font-black text-white bg-slate-900 hover:bg-slate-800 shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'กำลังบันทึก...' : <><IconSave size={18} /> บันทึก</>}
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