'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // ตรวจสอบ path import ให้ตรงกับโปรเจคของคุณ
import { useRouter } from 'next/navigation';

// --- 🎨 Icons (เหลือเท่าที่ใช้) ---
const IconStore = ({ size = 48 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21v-7"/><path d="M19 21v-7"/><path d="M2 10l20 0"/><path d="M2 10l2-4h16l2 4"/></svg>;
const IconArrowRight = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

export default function BrandSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Create State
  const [shopName, setShopName] = useState('');
  const [shopPhone, setShopPhone] = useState('');

  // 1. Init User & Check if already has brand
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      
      setUserId(user.id);
      
      // เช็คว่า User มีร้านอยู่แล้วหรือยัง ถ้ามีให้ไป Dashboard เลย
      const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
      if (profile?.brand_id) router.replace('/dashboard');
    };
    init();
  }, [router]);

  // --- Handler: Create Brand ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !userId) return;
    setLoading(true);
    
    try {
      // 1. สร้าง Brand ใหม่
      const { data: brand, error: brandErr } = await supabase.from('brands').insert({
        name: shopName, 
        phone: shopPhone, 
        plan: 'free', 
        status: 'trial'
      }).select().single();
      
      if (brandErr) throw brandErr;

      // 2. อัปเดต Profile ให้เป็น Owner ของ Brand นั้น
      const { error: profileErr } = await supabase.from('profiles').update({
        brand_id: brand.id, 
        role: 'owner', 
        updated_at: new Date().toISOString()
      }).eq('id', userId);
      
      if (profileErr) throw profileErr;

      // 3. ไปหน้า Tutorial หรือ Dashboard
      router.push('/setup/tutorial'); 

    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-blue-200 mx-auto mb-4">
                <IconStore size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">สร้างร้านค้าใหม่</h1>
            <p className="text-slate-500 font-bold mt-2">เริ่มต้นธุรกิจของคุณได้ง่ายๆ ที่นี่</p>
        </div>

        {/* Content Card */}
        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden">
            
            <form onSubmit={handleCreate} className="space-y-5">
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อร้านของคุณ <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        required 
                        value={shopName} 
                        onChange={(e) => setShopName(e.target.value)} 
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-lg text-slate-800 placeholder-slate-300 mt-1" 
                        placeholder="เช่น ร้านกาแฟใจดี" 
                        autoFocus 
                    />
                </div>
                <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">เบอร์โทรศัพท์ร้าน</label>
                    <input 
                        type="tel" 
                        value={shopPhone} 
                        onChange={(e) => setShopPhone(e.target.value)} 
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-lg text-slate-800 placeholder-slate-300 mt-1" 
                        placeholder="08x-xxx-xxxx" 
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading || !shopName} 
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-600 hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6 group"
                >
                    {loading ? 'กำลังสร้าง...' : (
                        <>
                           สร้างร้านเลย 
                           <span className="group-hover:translate-x-1 transition-transform">
                             <IconArrowRight />
                           </span>
                        </>
                    )}
                </button>
            </form>

        </div>
        
        <p className="text-center text-slate-400 text-xs font-bold mt-8">
           เมื่อกดสร้างร้าน คุณจะกลายเป็นเจ้าของ (Owner) ทันที
        </p>

      </div>
    </div>
  );
}