'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
// ✅ เปลี่ยน Import เป็นตัวใหม่
import { Scanner } from '@yudiel/react-qr-scanner';

// --- 🎨 Icons ---
const IconStore = ({ size = 48 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21v-7"/><path d="M19 21v-7"/><path d="M2 10l20 0"/><path d="M2 10l2-4h16l2 4"/></svg>;
const IconUserPlus = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
const IconSearch = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconCheck = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconArrowRight = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconQr = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><path d="M3 14h7v7H3z"/></svg>;
const IconX = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export default function BrandSetupPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Join State
  const [brandIdInput, setBrandIdInput] = useState('');
  const [foundBrand, setFoundBrand] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Create State
  const [shopName, setShopName] = useState('');
  const [shopPhone, setShopPhone] = useState('');

  // 1. Init User
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      setUserId(user.id);
      const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
      if (profile?.brand_id) router.replace('/dashboard');
    };
    init();
  }, [router]);

  // 2. Auto Check Brand ID
  useEffect(() => {
    const checkBrand = async () => {
      if (brandIdInput.length < 30) { setFoundBrand(null); return; }
      setChecking(true);
      try {
        const { data } = await supabase.from('brands').select('id, name, logo_url').eq('id', brandIdInput).single();
        setFoundBrand(data);
      } catch (err) { setFoundBrand(null); } 
      finally { setChecking(false); }
    };
    const timer = setTimeout(checkBrand, 500); 
    return () => clearTimeout(timer);
  }, [brandIdInput]);

  // --- Handlers ---
  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !userId) return;
    setLoading(true);
    try {
      const { data: brand, error: brandErr } = await supabase.from('brands').insert({
        name: shopName, phone: shopPhone, plan: 'free', status: 'trial'
      }).select().single();
      if (brandErr) throw brandErr;

      const { error: profileErr } = await supabase.from('profiles').update({
        brand_id: brand.id, role: 'owner', updated_at: new Date().toISOString()
      }).eq('id', userId);
      if (profileErr) throw profileErr;

      router.push('/setup/tutorial'); 

    } catch (err: any) { alert(err.message); } 
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!foundBrand || !userId) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({
        brand_id: foundBrand.id, role: 'cashier', updated_at: new Date().toISOString()
      }).eq('id', userId);
      
      if (error) {
          if (error.message.includes('unique_owner')) alert('ร้านนี้มีเจ้าของแล้ว คุณจะเป็นพนักงานแทน');
          else throw error;
      }
      router.push('/dashboard');
    } catch (err: any) { alert(err.message); } 
    finally { setLoading(false); }
  };

  // ✅ ฟังก์ชันรับค่าจาก Scanner ตัวใหม่
  const handleScan = (result: any) => {
    if (result && result.length > 0) {
      // result จาก library นี้จะเป็น Array objects
      const text = result[0].rawValue; 
      setBrandIdInput(text);
      setIsScanning(false);
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
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">ร้านค้าของคุณ</h1>
            <p className="text-slate-500 font-bold mt-2">เลือกวิธีการเริ่มต้นใช้งานระบบ</p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 mb-6 flex relative">
            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-slate-900 rounded-xl transition-all duration-300 ease-out shadow-md ${activeTab === 'create' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}></div>
            <button onClick={() => setActiveTab('create')} className={`flex-1 py-3 rounded-xl text-sm font-black relative z-10 transition-colors ${activeTab === 'create' ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}>เปิดร้านใหม่ 🏪</button>
            <button onClick={() => setActiveTab('join')} className={`flex-1 py-3 rounded-xl text-sm font-black relative z-10 transition-colors ${activeTab === 'join' ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}>เข้าร่วมร้าน 🔗</button>
        </div>

        {/* Content Card */}
        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden transition-all duration-500">
            
            {/* Create Mode */}
            {activeTab === 'create' && (
                <form onSubmit={handleCreate} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อร้านของคุณ <span className="text-red-500">*</span></label>
                        <input type="text" required value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-lg text-slate-800 placeholder-slate-300 mt-1" placeholder="เช่น ร้านกาแฟใจดี" autoFocus />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">เบอร์โทรศัพท์ร้าน</label>
                        <input type="tel" value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-lg text-slate-800 placeholder-slate-300 mt-1" placeholder="08x-xxx-xxxx" />
                    </div>
                    <button type="submit" disabled={loading || !shopName} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-600 hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6 group">
                        {loading ? 'กำลังสร้าง...' : <>สร้างร้านเลย <IconArrowRight className="group-hover:translate-x-1 transition-transform"/></>}
                    </button>
                </form>
            )}

            {/* Join Mode */}
            {activeTab === 'join' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Brand ID (รหัสร้านค้า)</label>
                        <div className="relative mt-1">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                {checking ? <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin block"></span> : <IconSearch />}
                            </div>
                            <input 
                                type="text" 
                                value={brandIdInput} 
                                onChange={(e) => setBrandIdInput(e.target.value.trim())} 
                                className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono font-bold text-sm text-slate-700 placeholder-slate-300 text-center" 
                                placeholder="สแกนหรือวางรหัส..." 
                            />
                            
                            <button 
                                onClick={() => setIsScanning(true)} 
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white bg-slate-900 hover:bg-blue-600 rounded-xl transition-all shadow-md" 
                                title="สแกน QR"
                            >
                                <IconQr size={18} />
                            </button>
                        </div>
                    </div>

                    <div className={`transition-all duration-500 ease-in-out ${foundBrand ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                        {foundBrand && (
                            <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 flex items-center gap-4 mt-2">
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm overflow-hidden shrink-0 border-2 border-white">
                                    {foundBrand.logo_url ? <img src={foundBrand.logo_url} className="w-full h-full object-cover"/> : <span className="text-2xl font-black text-blue-200">{foundBrand.name.charAt(0)}</span>}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">ค้นพบร้านค้า!</p>
                                    <h3 className="text-lg font-black text-slate-800 truncate">{foundBrand.name}</h3>
                                </div>
                                <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg shadow-green-500/30"><IconCheck size={16} /></div>
                            </div>
                        )}
                    </div>

                    <button onClick={handleJoin} disabled={loading || !foundBrand} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-green-600 hover:shadow-green-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6 group">
                        {loading ? 'กำลังเข้าร่วม...' : <>ยืนยันเข้าร่วม <IconUserPlus size={20}/></>}
                    </button>
                </div>
            )}

        </div>
        
        {/* --- QR Scanner Modal (ใช้ตัวใหม่) --- */}
        {isScanning && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6">
                <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden relative">
                    <button 
                        onClick={() => setIsScanning(false)} 
                        className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                        <IconX />
                    </button>
                    <div className="p-4 bg-black text-white text-center font-bold">สแกน QR Code เพื่อเข้าร่วม</div>
                    
                    <div className="w-full aspect-square bg-black relative">
                        {/* ✅ เรียกใช้ Scanner ตัวใหม่ */}
                        <Scanner 
                            onScan={handleScan}
                            styles={{ container: { width: '100%', height: '100%' } }}
                        />
                    </div>
                    <p className="p-4 text-center text-xs text-slate-500 font-bold">นำกล้องไปส่องที่ QR Code ของร้านค้า</p>
                </div>
            </div>
        )}

        <p className="text-center text-slate-400 text-xs font-bold mt-8">
            {activeTab === 'create' ? 'สร้างร้านใหม่เพื่อเป็นเจ้าของกิจการ (Owner)' : 'สแกน QR หรือใส่รหัสเพื่อเข้าร่วมเป็นพนักงาน'}
        </p>

      </div>
    </div>
  );
}