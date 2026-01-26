'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const IconPlus = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);

const IconTrash = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
);

const IconLayers = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
    </svg>
);

export default function MarketplaceCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('marketplace_categories')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setCategories(data);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        
        setIsLoading(true);
        // ✅ ส่งแค่ name เข้าไปอย่างเดียว
        const { error } = await supabase
            .from('marketplace_categories')
            .insert({ name });
            
        if (!error) {
            setName('');
            fetchCategories();
        } else {
            alert(error.message);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Confirm deletion?')) return;
        const { error } = await supabase
            .from('marketplace_categories')
            .delete()
            .eq('id', id);
        if (!error) fetchCategories();
    };

    return (
        <div className="p-8 max-w-4xl mx-auto font-sans text-slate-900">
            <header className="mb-12 flex items-center gap-4">
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
                    <IconLayers />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Marketplace Categories</h1>
                    <p className="text-slate-500 font-medium">Manage theme categories for the store</p>
                </div>
            </header>
            
            {/* Form ปรับให้เหลือแค่ Input เดียว สวยๆ */}
            <form onSubmit={handleAdd} className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 flex gap-4 mb-12 items-end">
                <div className="flex-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-3 ml-1">Category Name</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Minimal, Modern, Vintage" 
                        className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-700" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-95 transition-all shadow-xl shadow-blue-900/10 disabled:opacity-50 h-[58px]"
                >
                    <IconPlus /> 
                    <span>{isLoading ? 'Processing' : 'Create'}</span>
                </button>
            </form>

            <div className="grid gap-4">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Active Categories ({categories.length})</h2>
                
                {categories.map(cat => (
                    <div key={cat.id} className="bg-white p-6 rounded-[24px] border border-slate-100 flex justify-between items-center group hover:border-blue-200 hover:shadow-md transition-all">
                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 font-bold text-sm">
                                ID
                            </div>
                            <p className="font-black text-xl text-slate-800 tracking-tight">{cat.name}</p>
                        </div>
                        <button 
                            onClick={() => handleDelete(cat.id)} 
                            className="w-11 h-11 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        >
                            <IconTrash />
                        </button>
                    </div>
                ))}

                {categories.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm text-center">No categories found</p>
                    </div>
                )}
            </div>
        </div>
    );
}