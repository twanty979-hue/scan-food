// app/dashboard/profile/page.tsx
'use client';

import { useProfile } from '@/hooks/useProfile';

// --- 🎨 Custom Icons ---
const IconUser = ({ size = 24 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconCamera = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IconPhone = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconSave = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconMail = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;

export default function ProfileSettingsPage() {
  const {
    loading, submitting, email,
    formData, setFormData,
    fileInputRef,
    getImageUrl, handleUpload, handleSave
  } = useProfile();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans pb-32">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
              <IconUser size={28} />
            </span>
            โปรไฟล์ของฉัน
          </h1>
          <p className="text-slate-500 font-bold text-sm mt-2 ml-1">จัดการข้อมูลส่วนตัว</p>
        </div>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-slate-400 font-black">LOADING PROFILE...</div>
        ) : (
          <div className="grid gap-6">
            
            {/* Card 1: Avatar & Identity */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-50 to-indigo-50"></div>
                
                <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                        {formData.avatar_url ? (
                            <img src={getImageUrl(formData.avatar_url) ?? ''} className="w-full h-full object-cover" />
                        ) : (
                            <IconUser size={64} className="text-slate-300" />
                        )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconCamera className="text-white" size={32} />
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
                </div>

                <h2 className="text-2xl font-black text-slate-800">{formData.full_name || 'ไม่ระบุชื่อ'}</h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-200">
                        {formData.role}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-sm font-bold">
                        <IconMail size={14}/> {email}
                    </span>
                </div>
            </div>

            {/* Card 2: Edit Form */}
            <form onSubmit={handleSave} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 space-y-6">
                
                {/* Full Name */}
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ชื่อ-นามสกุล</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><IconUser size={18}/></div>
                        <input 
                            type="text" 
                            value={formData.full_name} 
                            onChange={e => setFormData({...formData, full_name: e.target.value})} 
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700"
                            placeholder="สมชาย ใจดี"
                        />
                    </div>
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">เบอร์โทรศัพท์</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><IconPhone size={18}/></div>
                        <input 
                            type="tel" 
                            value={formData.phone} 
                            onChange={e => setFormData({...formData, phone: e.target.value})} 
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700"
                            placeholder="08x-xxx-xxxx"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-600 hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {submitting ? 'กำลังบันทึก...' : <><IconSave size={20}/> บันทึกการเปลี่ยนแปลง</>}
                </button>

            </form>

          </div>
        )}
      </div>
    </div>
  );
}