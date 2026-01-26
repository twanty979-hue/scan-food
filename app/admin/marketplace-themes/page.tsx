'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

// --- Icons ---
const IconLayout = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;
const IconUpload = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"/></svg>;
const IconImage = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

const BUCKET_NAME = 'theme-images';

// --- IPhone Component ---
const IPhone15Pro = ({ src }: { src: string | null }) => {
    return (
        <div className="relative mx-auto h-[400px] w-[190px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] transition-all hover:scale-[1.02] duration-300 group">
            <div className="absolute inset-0 border-[4px] border-slate-800 rounded-[2.5rem] z-20 pointer-events-none ring-1 ring-white/10"></div>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[30%] h-[24px] bg-black rounded-full z-30"></div>
            <div className="absolute inset-[4px] bg-slate-100 rounded-[2.2rem] overflow-hidden z-10">
                {src ? (
                    <img 
                        src={src} 
                        className="h-full w-full object-cover" 
                        alt="Preview" 
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/400x800?text=No+Image";
                        }} 
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                        <IconImage />
                        <span className="text-[9px] font-black uppercase tracking-widest mt-2">No Cover</span>
                    </div>
                )}
            </div>
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-40 opacity-50"></div>
        </div>
    );
};

export default function AdminThemesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [themes, setThemes] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [uploadingState, setUploadingState] = useState<'cover' | 'mobile' | 'ipad' | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    // ✅ แก้ไข State เริ่มต้น: ลบ price, เพิ่ม price_monthly, price_lifetime
    const initialFormState = { 
        name: '', 
        slug: 'shop', 
        theme_mode: 'standard', 
        category_id: '', 
        price_monthly: 0,   // ใหม่
        price_lifetime: 0,  // ใหม่
        description: '',
        long_description: '', 
        image_url: '', 
        gallery: { mobile: [], ipad: [] } as { mobile: string[], ipad: string[] }
    };
    const [formData, setFormData] = useState(initialFormState);

    const loadData = async () => {
        const [c, t] = await Promise.all([
            supabase.from('marketplace_categories').select('*').order('name'),
            supabase.from('marketplace_themes').select('*, marketplace_categories(name)').order('created_at', { ascending: false })
        ]);
        setCategories(c.data || []);
        setThemes(t.data || []);
    };

    useEffect(() => { loadData(); }, []);

    const getImageUrl = (fileName: string | null) => {
        if (!fileName || fileName === '') return null;
        if (fileName.startsWith('http')) return fileName;
        const filePath = fileName.startsWith('themes/') ? fileName : `themes/${fileName}`;
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        return data.publicUrl;
    };

    // --- Upload Functions (เหมือนเดิม) ---
    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadingState('cover');
            const file = e.target.files?.[0];
            if (!file) return;
            const fileExt = file.name.split('.').pop();
            const fileName = `cover_${Date.now()}.${fileExt}`;
            const filePath = `themes/${fileName}`;
            const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
            if (error) throw error;
            setFormData(prev => ({ ...prev, image_url: fileName }));
        } catch (error: any) {
            alert('Cover upload failed: ' + error.message);
        } finally {
            setUploadingState(null);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'mobile' | 'ipad') => {
        try {
            setUploadingState(type);
            const files = e.target.files;
            if (!files || files.length === 0) return;
            const newFileNames: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${type}_${Date.now()}_${i}.${fileExt}`;
                const filePath = `themes/${fileName}`;
                const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
                if (error) throw error;
                newFileNames.push(fileName);
            }
            setFormData(prev => ({
                ...prev,
                gallery: { ...prev.gallery, [type]: [...(prev.gallery[type] || []), ...newFileNames] }
            }));
        } catch (error: any) {
            alert('Gallery upload failed: ' + error.message);
        } finally {
            setUploadingState(null);
        }
    };

    const removeImage = (type: 'mobile' | 'ipad', indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            gallery: { ...prev.gallery, [type]: prev.gallery[type].filter((_, index) => index !== indexToRemove) }
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { marketplace_categories, id, ...payload } = formData as any;
        
        // ✅ Payload จะมี price_monthly และ price_lifetime ส่งไปเองตาม State
        const finalPayload = { ...payload, gallery: payload.gallery };

        let result;
        if (editingId) {
            result = await supabase.from('marketplace_themes').update(finalPayload).eq('id', editingId);
        } else {
            result = await supabase.from('marketplace_themes').insert(finalPayload);
        }

        if (!result.error) {
            setFormData(initialFormState);
            setEditingId(null);
            loadData();
            alert('บันทึกสำเร็จ!');
        } else { 
            alert('Error: ' + result.error.message); 
        }
        setIsSubmitting(false);
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto font-sans text-slate-900 bg-slate-50/50 min-h-screen">
            <header className="mb-10 flex items-center gap-4 border-b border-slate-200 pb-6">
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
                    <IconLayout />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic text-slate-900">Theme Master</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage Cover & Gallery</p>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                
                {/* --- Form Section (Left) --- */}
                <div className="xl:col-span-5 sticky top-8">
                    <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        
                        <h2 className="text-lg font-black mb-6 text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            {editingId ? <span className="text-amber-500">Edit Mode</span> : <span className="text-blue-600">Create New</span>}
                        </h2>
                        
                        <form onSubmit={handleSave} className="space-y-6">
                            
                            <div className="flex flex-col items-center mb-8 bg-slate-50 p-6 rounded-[30px] border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors">
                                <label className="input-label mb-4 !text-center !text-blue-600">Main Cover Image (Required)</label>
                                <div className="relative mb-6">
                                    <IPhone15Pro src={getImageUrl(formData.image_url)} />
                                </div>
                                <label className="cursor-pointer bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2">
                                    <IconImage /> {formData.image_url ? 'Change Cover' : 'Upload Cover'}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingState !== null} />
                                </label>
                                {uploadingState === 'cover' && <span className="text-[10px] text-blue-500 font-bold mt-2 animate-pulse">Uploading Cover...</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="input-label">Category</label>
                                    <select className="input-field" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                                        <option value="">Select...</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">Theme Name</label>
                                    <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="input-label">Slug</label>
                                    <input type="text" className="input-field" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="input-label">Mode</label>
                                    <input type="text" className="input-field uppercase" value={formData.theme_mode} onChange={e => setFormData({...formData, theme_mode: e.target.value})} placeholder="STD" required />
                                </div>
                            </div>

                            {/* แก้ไขส่วนนี้ครับ */}
<div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
    <label className="input-label !ml-0 mb-3 text-slate-500">Pricing Strategy</label>
    <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="input-label text-blue-500">Monthly Price</label>
            <input 
                type="number" 
                className="input-field !bg-white" 
                // ✅ แก้ตรงนี้: ใส่ ?? 0 กันค่า null
                value={formData.price_monthly ?? 0} 
                onChange={e => setFormData({...formData, price_monthly: Number(e.target.value)})} 
            />
        </div>
        <div>
            <label className="input-label text-green-500">Lifetime Price</label>
            <input 
                type="number" 
                className="input-field !bg-white" 
                // ✅ แก้ตรงนี้: ใส่ ?? 0 กันค่า null
                value={formData.price_lifetime ?? 0} 
                onChange={e => setFormData({...formData, price_lifetime: Number(e.target.value)})} 
            />
        </div>
    </div>
</div>

                            {/* --- GALLERY UPLOAD SECTION --- */}
                            <div className="space-y-6 border-t border-slate-100 pt-6">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Additional Gallery (Optional)</h3>
                                
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="input-label text-blue-500">Mobile Screens ({formData.gallery.mobile.length})</label>
                                        <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors flex items-center gap-1">
                                            <IconUpload /> Add
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleGalleryUpload(e, 'mobile')} disabled={uploadingState !== null} />
                                        </label>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-2 min-h-[60px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                                        {formData.gallery.mobile.map((img, idx) => (
                                            <div key={idx} className="relative flex-shrink-0 w-12 h-24 group">
                                                <img src={getImageUrl(img)!} className="w-full h-full object-cover rounded-lg border border-slate-200" />
                                                <button type="button" onClick={() => removeImage('mobile', idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><IconTrash /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="input-label text-purple-500">iPad Screens ({formData.gallery.ipad.length})</label>
                                        <label className="cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors flex items-center gap-1">
                                            <IconUpload /> Add
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleGalleryUpload(e, 'ipad')} disabled={uploadingState !== null} />
                                        </label>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-2 min-h-[60px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                                        {formData.gallery.ipad.map((img, idx) => (
                                            <div key={idx} className="relative flex-shrink-0 w-16 h-20 group">
                                                <img src={getImageUrl(img)!} className="w-full h-full object-cover rounded-lg border border-slate-200" />
                                                <button type="button" onClick={() => removeImage('ipad', idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><IconTrash /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Description</label>
                                <textarea value={formData.description} className="input-field min-h-[80px]" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>

                            <button type="submit" disabled={isSubmitting || uploadingState !== null} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all uppercase tracking-widest disabled:opacity-50 text-xs">
                                {uploadingState ? 'Uploading Images...' : (editingId ? 'Save Changes' : 'Publish Theme')}
                            </button>
                            
                            {editingId && (
                                <button type="button" onClick={() => { setEditingId(null); setFormData(initialFormState); }} className="w-full py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors">
                                    Cancel Edit
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* --- List Section (Right) --- */}
                <div className="xl:col-span-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {themes.map(t => (
                            <div key={t.id} className="bg-white p-5 rounded-[30px] shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-black text-slate-800 uppercase text-sm truncate pr-2">{t.name}</h3>
                                    <div className="flex flex-col items-end">
                                        <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-1 rounded-full uppercase mb-1">{t.theme_mode}</span>
                                    </div>
                                </div>
                                
                                {/* ✅ แสดงป้ายราคาแบบใหม่ */}
                                <div className="flex gap-2 mb-4">
                                    <div className="bg-blue-50 px-2 py-1 rounded-lg">
                                        <span className="text-[9px] text-blue-400 font-bold block">MONTHLY</span>
                                        <span className="text-xs font-black text-blue-600">฿{t.price_monthly?.toLocaleString() || 0}</span>
                                    </div>
                                    <div className="bg-green-50 px-2 py-1 rounded-lg">
                                        <span className="text-[9px] text-green-400 font-bold block">LIFETIME</span>
                                        <span className="text-xs font-black text-green-600">฿{t.price_lifetime?.toLocaleString() || 0}</span>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-[25px] p-6 mb-4 group-hover:bg-blue-50/50 transition-colors">
                                    <div className="w-full flex justify-center">
                                        <IPhone15Pro src={getImageUrl(t.image_url)} />
                                    </div>
                                </div>

                                <div className="mt-auto flex justify-between items-center border-t border-slate-50 pt-3">
                                    <div className="flex gap-1">
                                        <span className="text-[9px] font-bold text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded">M: {t.gallery?.mobile?.length || 0}</span>
                                        <span className="text-[9px] font-bold text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded">P: {t.gallery?.ipad?.length || 0}</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setEditingId(t.id);
                                            setFormData({
                                                ...initialFormState, 
                                                ...t,
                                                gallery: t.gallery || { mobile: [], ipad: [] }
                                            }); 
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-wider flex items-center gap-1"
                                    >
                                        <IconEdit /> Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .input-label { @apply text-[10px] font-black text-slate-400 uppercase block mb-1.5 ml-1 tracking-wider; }
                .input-field { @apply w-full p-3 bg-slate-50 border-2 border-slate-50 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all text-xs; }
            `}</style>
        </div>
    );
}