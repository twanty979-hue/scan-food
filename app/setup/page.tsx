
//app/setup
'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

// --- 🎨 Icons ---
const IconUser = ({ size = 48 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconCamera = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IconArrowRight = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

export default function ProfileSetupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    avatarUrl: ''
  });

  // 1. Init User
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      setUserId(user.id);

      // เช็คว่ามี Profile อยู่แล้วไหม (เผื่อกลับมาแก้ไข)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setFormData({
          fullName: data.full_name || '',
          phone: data.phone || '',
          avatarUrl: data.avatar_url || ''
        });
        // ถ้ามีข้อมูลครบแล้ว อาจจะ redirect ไปหน้าถัดไปเลยก็ได้
        if (data.full_name && data.brand_id) router.replace('/dashboard');
        else if (data.full_name) router.replace('/setup/brand'); // ไปหน้าเลือกร้าน
      }
    };
    init();
  }, [router]);

  // 2. Upload Avatar
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !userId) return;
    const file = e.target.files[0];
    const fileName = `avatars/${userId}-${Date.now()}.png`;

    try {
      setLoading(true);
      // Upload to Storage (ต้องสร้าง Bucket 'avatars' ใน Supabase ก่อนนะ)
      const { error } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
      if (error) throw error;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, avatarUrl: data.publicUrl }));
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

// เปลี่ยนเฉพาะฟังก์ชัน handleSave ในไฟล์เดิมครับนาย
const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.fullName || !userId) return;

  setLoading(true);
  try {
    // ✅ ยิงไปที่ API กลางที่เราเพิ่งสร้าง
    const response = await fetch('/api/setup/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        fullName: formData.fullName,
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "บันทึกไม่สำเร็จ");
    }

    router.push('/setup/brand'); 

  } catch (err: any) {
    alert('Error: ' + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">ข้อมูลส่วนตัว 👤</h1>
            <p className="text-slate-500 font-bold mt-2">บอกให้เรารู้จักคุณมากขึ้นอีกนิด</p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-blue-900/5 border border-white">
            <form onSubmit={handleSave} className="space-y-6">
                
                {/* Avatar Upload */}
                <div className="flex flex-col items-center">
                    <div 
                        className="w-28 h-28 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center relative cursor-pointer group overflow-hidden"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {formData.avatarUrl ? (
                            <img src={formData.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                            // ✅ เอา div มาครอบแล้วใส่ class ที่ div แทน
<div className="text-slate-300">
    <IconUser size={48} />
</div>
                        )}
                        
                        {/* Overlay Icon */}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
    <IconCamera />
</div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-wide">รูปโปรไฟล์ (ถ้ามี)</span>
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            required 
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-lg text-slate-800 placeholder-slate-300 mt-1"
                            placeholder="เช่น สมชาย ใจดี"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">เบอร์โทรศัพท์</label>
                        <input 
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-lg text-slate-800 placeholder-slate-300 mt-1"
                            placeholder="08x-xxx-xxxx"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={loading || !formData.fullName}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-600 hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                >
                    {loading ? 'กำลังบันทึก...' : <>ถัดไป <IconArrowRight size={20}/></>}
                </button>

            </form>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center gap-2 mt-8">
            <div className="w-8 h-2 rounded-full bg-blue-600"></div>
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
        </div>

      </div>
    </div>
  );
}