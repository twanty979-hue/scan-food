// app/dashboard/products/page.tsx
'use client';

import { useProducts } from '@/hooks/useProducts';

// --- 🎨 Custom SVG Icons ---
const IconUtensils = ({ size = 24 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>;
const IconPlus = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconSearch = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconEdit = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = ({ size = 18 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconImage = ({ size = 32 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IconStar = ({ size = 14, className }: any) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconX = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconSave = ({ size = 16 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconBurger = ({ size = 32 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4a9 9 0 0 0-9 9v1a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1a9 9 0 0 0-9-9z"/><path d="M4 16h16"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>;

export default function ProductsPage() {
  const {
    categories, loading, 
    selectedCategoryId, setSelectedCategoryId,
    searchTerm, setSearchTerm,
    isModalOpen, setIsModalOpen, isSubmitting, editId, uploading,
    formData, setFormData, fileInputRef,
    filteredProducts,
    getImageUrl, handleImageUpload, handleSave, handleDelete, handleToggle, openModal
  } = useProducts();

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans pb-32">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <IconUtensils /> จัดการเมนูอาหาร
            </h1>
            <p className="text-slate-500 font-bold text-sm mt-1">เพิ่มเมนูอร่อยๆ ให้ลูกค้าเลือกชิม</p>
          </div>
          
          <button 
            onClick={() => openModal()}
            className="hidden md:flex bg-slate-900 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:bg-slate-800 items-center gap-2 transition-all active:scale-95"
          >
            <IconPlus /> เพิ่มเมนูใหม่
          </button>
        </div>

        {/* Search Bar & Category Tabs */}
        <div className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-200 mb-6 flex items-center gap-3 sticky top-4 z-20">
             <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><IconSearch /></div>
                <input type="text" placeholder="ค้นหาเมนู..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all font-bold text-slate-700"/>
             </div>
             <div className="text-slate-400 text-xs font-black whitespace-nowrap bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                {filteredProducts.length} รายการ
             </div>
        </div>
        <div className="mb-8 overflow-x-auto no-scrollbar pb-2">
            <div className="flex gap-3">
                <button onClick={() => setSelectedCategoryId('ALL')} className={`px-5 py-2.5 rounded-2xl text-sm font-black transition-all border-2 ${selectedCategoryId === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-transparent'}`}>ทั้งหมด</button>
                {categories.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)} className={`px-5 py-2.5 rounded-2xl text-sm font-black transition-all border-2 ${selectedCategoryId === cat.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-transparent'}`}>{cat.name}</button>
                ))}
            </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-pulse"><p>LOADING...</p></div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[28px] border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4"><IconBurger /></div>
            <h3 className="text-lg font-black text-slate-700">ไม่พบเมนู</h3>
            <button onClick={() => openModal()} className="text-slate-900 font-bold hover:underline text-sm mt-4">เพิ่มเมนู +</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p: any) => (
              <div key={p.id} className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-xl transition-all group relative overflow-hidden animate-in fade-in zoom-in duration-300">
                
                {/* Image Display */}
                <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100">
                  {p.image_name ? (
                    <img src={getImageUrl(p.image_name) ?? ''} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><IconImage /></div>
                  )}
                  {p.is_recommended && <div className="absolute top-2 right-2 bg-yellow-400 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm flex items-center gap-1"><IconStar /> แนะนำ</div>}
                  {!p.is_available && <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center backdrop-blur-sm"><span className="text-white font-black text-lg uppercase tracking-widest border-2 border-white px-4 py-1 rounded-lg">SOLD OUT</span></div>}
                </div>
                
                {/* Product Info */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-black text-slate-800 text-lg line-clamp-1">{p.name}</h3>
                    <p className="text-xs font-bold text-slate-400">{categories.find(c => c.id === p.category_id)?.name || 'ไม่ระบุหมวด'}</p>
                  </div>
                  <div className="text-right"><span className="block font-black text-slate-900 text-xl">฿{p.price}</span></div>
                </div>

                {/* Variants */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {p.price_special && <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100 text-[10px] font-bold text-slate-500">พิเศษ +{p.price_special}</span>}
                  {p.price_jumbo && <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100 text-[10px] font-bold text-slate-500">จัมโบ้ +{p.price_jumbo}</span>}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                    <button onClick={() => handleToggle(p.id, p.is_available)} className={`text-xs font-black flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${p.is_available ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${p.is_available ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>{p.is_available ? 'พร้อมขาย' : 'ของหมด'}
                    </button>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(p)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-colors"><IconEdit size={14}/></button>
                        <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"><IconTrash size={14}/></button>
                    </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Mobile Add Button */}
        <button onClick={() => openModal()} className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center z-40 border-4 border-white"><IconPlus size={28}/></button>

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
              
              <div className="bg-slate-900 p-6 flex justify-between items-center text-white shrink-0">
                <h3 className="text-xl font-black flex items-center gap-2">{editId ? <><IconEdit /> แก้ไขเมนู</> : <><IconPlus /> เพิ่มเมนูใหม่</>}</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"><IconX size={18}/></button>
              </div>
              
              <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
                <div className="flex justify-center">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden hover:border-slate-400 transition-colors">
                      {formData.image_name ? (
                        <img src={getImageUrl(formData.image_name) ?? ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-slate-300 flex flex-col items-center gap-1"><IconImage size={28} /><span className="text-[10px] font-black uppercase">เพิ่มรูป</span></div>
                      )}
                    </div>
                    {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-3xl"><div className="animate-spin text-slate-900"><IconPlus /></div></div>}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อเมนู</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">หมวดหมู่</label>
                    <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700" required>
                      <option value="">-- เลือกหมวดหมู่ --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">ตั้งราคาขาย (บาท)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 block text-center">ธรรมดา</span><input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-center font-black" required /></div>
                    <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 block text-center">พิเศษ</span><input type="number" value={formData.price_special} onChange={e => setFormData({...formData, price_special: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-center font-black" /></div>
                    <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 block text-center">จัมโบ้</span><input type="number" value={formData.price_jumbo} onChange={e => setFormData({...formData, price_jumbo: e.target.value})} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-center font-black" /></div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-yellow-50 p-4 rounded-2xl border border-yellow-100 cursor-pointer transition-colors hover:bg-yellow-100" onClick={() => setFormData({...formData, is_recommended: !formData.is_recommended})}>
                  <div className={`w-5 h-5 rounded-md border-2 border-yellow-500 flex items-center justify-center ${formData.is_recommended ? 'bg-yellow-500' : 'bg-transparent'}`}>
                      {formData.is_recommended && <IconStar size={10} className="text-white" />}
                  </div>
                  <span className="text-sm font-bold text-yellow-700 uppercase tracking-wide">เมนูแนะนำ (Recommended)</span>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black text-slate-500 bg-slate-100 uppercase text-xs tracking-widest">ยกเลิก</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-4 rounded-2xl font-black text-white bg-slate-900 shadow-xl uppercase text-xs tracking-widest flex items-center justify-center gap-2">{isSubmitting ? '...' : <><IconSave size={16}/> บันทึก</>}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}