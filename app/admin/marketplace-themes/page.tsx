'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase'; // เช็ค path ให้ถูกต้อง

// --- Icons (แก้ไขให้รับ Props size และ className ได้) ---
interface IconProps {
    size?: number;
    className?: string;
}

const IconLayout = ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;
const IconUpload = ({ size = 20, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconEdit = ({ size = 14, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = ({ size = 14, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"/></svg>;
const IconImage = ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IconPlus = ({ size = 20, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconX = ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconFilter = ({ size = 16, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;

const BUCKET_NAME = 'theme-images';

// --- IPhone Component (Updated Size) ---
const IPhone15Pro = ({ src }: { src: string | null }) => {
    return (
        <div className="relative mx-auto h-[380px] w-[180px] shadow-xl transition-all hover:scale-[1.02] duration-300 group bg-white rounded-[2.5rem]">
            <div className="absolute inset-0 border-[4px] border-slate-800 rounded-[2.5rem] z-20 pointer-events-none ring-1 ring-white/10"></div>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[30%] h-[20px] bg-black rounded-full z-30"></div>
            <div className="absolute inset-[4px] bg-slate-100 rounded-[2.2rem] overflow-hidden z-10">
                {src ? (
                    <img 
                        src={src} 
                        className="h-full w-full object-cover" 
                        alt="Preview" 
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x800?text=No+Image"; }} 
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                        <IconImage />
                        <span className="text-[10px] font-black uppercase tracking-widest mt-2">No Cover</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function AdminThemesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [themes, setThemes] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    // Filters
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterPlan, setFilterPlan] = useState<string>('all');

    const [uploadingState, setUploadingState] = useState<'cover' | 'mobile' | 'ipad' | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const initialFormState = { 
        name: '', 
        slug: 'shop', 
        theme_mode: 'standard', 
        category_id: '', 
        price_monthly: 0, 
        price_lifetime: 0,
        min_plan: 'ultimate',
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

    // --- Filter Logic ---
    const filteredThemes = themes.filter(theme => {
        const matchesCategory = filterCategory === 'all' || theme.category_id === filterCategory;
        const matchesPlan = filterPlan === 'all' || (theme.min_plan || 'ultimate') === filterPlan;
        return matchesCategory && matchesPlan;
    });

    const getImageUrl = (fileName: string | null) => {
        if (!fileName || fileName === '') return null;
        if (fileName.startsWith('http')) return fileName;
        const filePath = fileName.startsWith('themes/') ? fileName : `themes/${fileName}`;
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        return data.publicUrl;
    };

    // --- Upload Handlers ---
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

    // --- Modal Logic ---
    const openCreateModal = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setShowModal(true);
    };

    const openEditModal = (theme: any) => {
        setEditingId(theme.id);
        setFormData({
            ...initialFormState,
            ...theme,
            gallery: theme.gallery || { mobile: [], ipad: [] },
            min_plan: theme.min_plan || 'ultimate'
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData(initialFormState);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { marketplace_categories, id, ...payload } = formData as any;
        const finalPayload = { ...payload, gallery: payload.gallery };

        let result;
        if (editingId) {
            result = await supabase.from('marketplace_themes').update(finalPayload).eq('id', editingId);
        } else {
            result = await supabase.from('marketplace_themes').insert(finalPayload);
        }

        if (!result.error) {
            loadData();
            closeModal();
            alert('บันทึกสำเร็จ!');
        } else { 
            alert('Error: ' + result.error.message); 
        }
        setIsSubmitting(false);
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto font-sans text-slate-900 bg-slate-50/50 min-h-screen">
            {/* --- Header --- */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
                        <IconLayout />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight uppercase italic text-slate-900">Theme Master</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage Cover & Gallery</p>
                    </div>
                </div>
                <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2">
                    <IconPlus /> Create New Theme
                </button>
            </header>

            {/* --- Filter Bar --- */}
            <div className="mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-wider">
                    <IconFilter /> Filters:
                </div>
                
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Categories</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>

                <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

                <div className="flex gap-2">
                    {['all', 'free', 'basic', 'pro', 'ultimate'].map(plan => (
                        <button key={plan} onClick={() => setFilterPlan(plan)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${filterPlan === plan ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                            {plan}
                        </button>
                    ))}
                </div>

                <div className="ml-auto text-xs font-bold text-slate-400">Showing {filteredThemes.length} themes</div>
            </div>

            {/* --- Themes Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredThemes.map(t => (
                    <div key={t.id} className="bg-white p-5 rounded-[30px] shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex flex-col relative overflow-hidden">
                        <div className="absolute top-4 right-4 z-10">
                             <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase mb-1 shadow-sm ${t.min_plan === 'free' ? 'bg-green-100 text-green-600' : t.min_plan === 'ultimate' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                {t.min_plan || 'Ultimate'}
                            </span>
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-black text-slate-800 uppercase text-sm truncate pr-2" title={t.name}>{t.name}</h3>
                        </div>
                        <div className="bg-slate-50 rounded-[25px] p-6 mb-4 group-hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => openEditModal(t)}>
                            <div className="w-full flex justify-center pointer-events-none transform scale-90">
                                <IPhone15Pro src={getImageUrl(t.image_url)} />
                            </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center border-t border-slate-50 pt-3">
                            <button onClick={() => openEditModal(t)} className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-wider flex items-center gap-1 w-full justify-center py-2">
                                <IconEdit /> Edit Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- SINGLE PAGE MODAL FORM --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                    
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden relative z-10 flex flex-col animate-in fade-in zoom-in duration-200">
                        
                        {/* Header */}
                        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                {editingId ? <span className="text-amber-500 flex items-center gap-2"><IconEdit/> Edit Theme</span> : <span className="text-blue-600 flex items-center gap-2"><IconPlus/> Create New</span>}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"><IconX /></button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                
                                {/* LEFT COL: IMAGES (30%) */}
                                <div className="lg:col-span-4 space-y-6">
                                    {/* Cover Upload */}
                                    <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col items-center sticky top-0">
                                        <label className="text-sm font-black text-slate-800 mb-4 uppercase tracking-widest">Cover Image</label>
                                        <div className="relative mb-6 transform scale-95">
                                            <IPhone15Pro src={getImageUrl(formData.image_url)} />
                                        </div>
                                        <label className="w-full cursor-pointer bg-slate-900 text-white px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                                            <IconImage /> {formData.image_url ? 'Change Cover' : 'Upload Cover'}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingState !== null} />
                                        </label>
                                    </div>

                                    {/* Mobile Gallery */}
                                    <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-xs font-black text-slate-500 uppercase">Mobile Gallery</label>
                                            <label className="cursor-pointer text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-blue-100 transition-colors">
                                                + Add
                                                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleGalleryUpload(e, 'mobile')} />
                                            </label>
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {formData.gallery.mobile.map((img, idx) => (
                                                <div key={idx} className="relative flex-shrink-0 w-14 h-24 group">
                                                    <img src={getImageUrl(img) || ""} className="w-full h-full object-cover rounded-lg border border-slate-200" />
                                                    <button type="button" onClick={() => removeImage('mobile', idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><IconTrash size={10}/></button>
                                                </div>
                                            ))}
                                            {formData.gallery.mobile.length === 0 && <span className="text-[10px] text-slate-300">No images</span>}
                                        </div>
                                    </div>

                                    {/* iPad Gallery */}
                                    <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-xs font-black text-slate-500 uppercase">iPad Gallery</label>
                                            <label className="cursor-pointer text-purple-600 bg-purple-50 px-3 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-purple-100 transition-colors">
                                                + Add
                                                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleGalleryUpload(e, 'ipad')} />
                                            </label>
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {formData.gallery.ipad.map((img, idx) => (
                                                <div key={idx} className="relative flex-shrink-0 w-16 h-20 group">
                                                    <img src={getImageUrl(img) || ""} className="w-full h-full object-cover rounded-lg border border-slate-200" />
                                                    <button type="button" onClick={() => removeImage('ipad', idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><IconTrash size={10}/></button>
                                                </div>
                                            ))}
                                            {formData.gallery.ipad.length === 0 && <span className="text-[10px] text-slate-300">No images</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COL: INFO FORM (70%) */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="bg-white p-8 rounded-[30px] border border-slate-200 shadow-sm space-y-6">
                                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Theme Information</h3>
                                        
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
                                                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                                                    <option value="">Select Category...</option>
                                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Theme Name</label>
                                                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ex. Dark Cafe" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Slug (Unique ID)</label>
                                                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mode</label>
                                                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase" value={formData.theme_mode} onChange={e => setFormData({...formData, theme_mode: e.target.value})} placeholder="STD" required />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</label>
                                            <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe your theme..."></textarea>
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-[30px] border border-slate-200 shadow-sm space-y-6">
                                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Pricing & Plan</h3>
                                        
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-blue-500 uppercase tracking-wide">Monthly Price</label>
                                                <input type="number" className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center text-lg" value={formData.price_monthly} onChange={e => setFormData({...formData, price_monthly: Number(e.target.value)})} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-green-500 uppercase tracking-wide">Lifetime Price</label>
                                                <input type="number" className="w-full p-3 bg-green-50 border border-green-100 rounded-xl font-bold text-green-900 outline-none focus:ring-2 focus:ring-green-500 transition-all text-center text-lg" value={formData.price_lifetime} onChange={e => setFormData({...formData, price_lifetime: Number(e.target.value)})} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-amber-500 uppercase tracking-wide">Min Plan Req.</label>
                                                <select className="w-full p-3 bg-amber-50 border border-amber-100 rounded-xl font-bold text-amber-900 outline-none focus:ring-2 focus:ring-amber-500 transition-all text-center h-[52px]" value={formData.min_plan || 'ultimate'} onChange={e => setFormData({...formData, min_plan: e.target.value})}>
                                                    <option value="free">Free</option>
                                                    <option value="basic">Basic</option>
                                                    <option value="pro">Pro</option>
                                                    <option value="ultimate">Ultimate</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3 sticky bottom-0 z-20">
                            <button onClick={closeModal} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors text-xs uppercase tracking-wider">Cancel</button>
                            <button onClick={handleSave} disabled={isSubmitting || uploadingState !== null} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all uppercase tracking-widest disabled:opacity-50 text-xs flex items-center gap-2">
                                {isSubmitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Publish Theme')}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}