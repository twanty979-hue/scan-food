// app/dashboard/profile/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { useState, useEffect, Suspense } from 'react'; 
import Cropper from 'react-easy-crop'; 

// --- 🎨 Custom Icons ---
const IconUser = ({ size = 24 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconCamera = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IconPhone = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconSave = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconMail = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconLock = ({ size = 24 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconX = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

// ✅ 1. สร้าง Component ย่อย สำหรับเนื้อหาที่ใช้ useSearchParams
function ProfileContent() {
  const {
    loading, submitting, email,
    formData, setFormData,
    fileInputRef, getImageUrl, 
    handleSave, onFileChange, // เปลี่ยนจาก handleUpload เป็น onFileChange ตาม Hook ใหม่
    // ฟังก์ชันและ State สำหรับรูปภาพ
    imageToCrop, isCropModalOpen, setIsCropModalOpen,
    setCroppedAreaPixels, handleCropComplete, previewUrl
  } = useProfile();

  const searchParams = useSearchParams();
  const router = useRouter();
  const [showError, setShowError] = useState(false);

  // 🌟 เพิ่ม State สำหรับระบบ ครอปรูป
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (searchParams.get('error') === 'premium_required') {
      setShowError(true);
      router.replace('/dashboard/profile', { scroll: false });
    }
  }, [searchParams, router]);

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

        {/* 🚨 Alert Module */}
        {showError && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl shadow-sm relative animate-in slide-in-from-top-2 duration-300">
                <button 
                    onClick={() => setShowError(false)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                >
                    <IconX size={20} />
                </button>
                <div className="flex gap-4">
                    <div className="p-3 bg-red-100 rounded-full h-fit text-red-600">
                        <IconLock size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-red-700 mb-1">เข้าถึงไม่ได้</h3>
                        <p className="text-sm font-medium text-red-600/80 leading-relaxed">
                            คุณไม่สามารถเข้าใช้งานหน้านั้นได้ เนื่องจาก <strong>แพ็กเกจของร้านค้าปัจจุบัน (Free/Basic)</strong> ไม่รองรับการใช้งานฟีเจอร์นี้สำหรับพนักงาน
                        </p>
                        <div className="mt-3 inline-block px-3 py-1 bg-white rounded-lg text-xs font-bold text-red-500 border border-red-100">
                            โปรดติดต่อเจ้าของร้านเพื่ออัปเกรด
                        </div>
                    </div>
                </div>
            </div>
        )}

        {loading ? (
          <div className="text-center py-20 animate-pulse text-slate-400 font-black">LOADING PROFILE...</div>
        ) : (
          <div className="grid gap-6">
            
            {/* Card 1: Avatar & Identity */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-50 to-indigo-50"></div>
                
                <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                        {/* 🌟 เช็ครูปพรีวิวจากการครอปก่อน ถ้าไม่มีให้แสดงรูปจาก DB */}
                        {previewUrl || formData.avatar_url ? (
                            <img src={previewUrl || getImageUrl(formData.avatar_url) || ''} className="w-full h-full object-cover" />
                        ) : (
                            <IconUser size={64} className="text-slate-300" />
                        )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconCamera className="text-white" size={32} />
                    </div>
                    {/* 🌟 เปลี่ยน onChange เป็น onFileChange */}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
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

      {/* --- 🖼️ MODAL สำหรับ CROP รูปภาพ (แก้ให้ลอยตรงกลางจอ) --- */}
      {isCropModalOpen && imageToCrop && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          
          {/* 🌟 จุดที่แก้: กำหนดความสูง h-[50vh] เพื่อไม่ให้มันขยายจนล้นจอไปติดขอบบน */}
          <div className="relative w-full max-w-md h-[50vh] min-h-[300px] max-h-[500px] bg-white rounded-3xl overflow-hidden shadow-2xl mb-6">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1} 
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
            />
          </div>
          
          <div className="flex gap-4 w-full max-w-md">
             <button 
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all"
             >
                ยกเลิก
             </button>
             <button 
                type="button"
                onClick={handleCropComplete}
                className="flex-[2] py-4 bg-blue-500 text-white rounded-2xl font-black shadow-lg shadow-blue-500/40 hover:bg-blue-600 transition-all"
             >
                ตัดรูปภาพนี้
             </button>
          </div>
        </div>
      )}

    </div>
  );
}

// ✅ 2. Component หลัก ห่อด้วย Suspense
export default function ProfileSettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}