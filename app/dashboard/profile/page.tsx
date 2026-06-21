// app/dashboard/profile/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { useState, useEffect, Suspense } from 'react'; 
import Cropper from 'react-easy-crop'; 

import InviteNotification from '../components/InviteNotification';
import { leaveStoreAction } from '@/app/actions/profileActions';

// --- 🎨 Custom Icons ---
const IconUser = ({ size = 24 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconCamera = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IconPhone = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconSave = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconMail = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconLock = ({ size = 24 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconX = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconBell = ({ size = 24 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconStore = ({ size = 24 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconLogOut = ({ size = 20 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

function ProfileContent() {
  const {
    loading, submitting, email,
    formData, setFormData,
    rawProfile, setRawProfile,
    fileInputRef, getImageUrl, 
    handleSave, onFileChange, 
    imageToCrop, isCropModalOpen, setIsCropModalOpen,
    setCroppedAreaPixels, handleCropComplete, previewUrl
  } = useProfile();

  const searchParams = useSearchParams();
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leavingStore, setLeavingStore] = useState(false);

  useEffect(() => {
    if (searchParams.get('error') === 'premium_required') {
      setShowError(true);
      router.replace('/dashboard/profile', { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (rawProfile?.invited_brand_id && !rawProfile?.is_joined && !hasAutoOpened) {
      setIsInviteModalOpen(true);
      setHasAutoOpened(true);
    }
  }, [rawProfile, hasAutoOpened]);

  const handleLeaveStore = async () => {
    setLeavingStore(true);
    const result = await leaveStoreAction();
    if (result.success) {
        window.location.replace('/login?reset=store_changed');
        return;
    } else {
        alert(result.error || "เกิดข้อผิดพลาดในการออกจากร้าน");
    }
    setLeavingStore(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans pb-32">
      <div className="max-w-3xl mx-auto">
        
        {/* Header แบบ Flexbox */}
        <div className="mb-6 md:mb-8 flex justify-between items-start gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2 md:gap-3">
              <button 
                type="button"
                onClick={() => {
                  const layoutMenuBtn = document.querySelector('header button'); 
                  if (layoutMenuBtn instanceof HTMLElement) {
                    layoutMenuBtn.click(); 
                  }
                }}
                className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <IconUser size={24} className="md:w-7 md:h-7" />
              </button>
              โปรไฟล์ของฉัน
            </h1>
            <p className="text-slate-500 font-bold text-xs md:text-sm mt-1.5 ml-1">จัดการข้อมูลส่วนตัว</p>
          </div>

          {/* 🔔 ปุ่มกระดิ่งเรียก Modal */}
          {!loading && rawProfile?.invited_brand_id && !rawProfile?.is_joined && (
             <button
                onClick={() => setIsInviteModalOpen(true)}
                className="relative p-2.5 md:p-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl md:rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all active:scale-95 cursor-pointer group"
             >
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-3.5 md:h-3.5 bg-red-500 border-2 border-white rounded-full animate-pulse shadow-sm shadow-red-500/50"></div>
                <IconBell size={20} className="md:w-6 md:h-6 group-hover:text-blue-500 transition-colors" />
             </button>
          )}
        </div>

        {/* 🚨 Alert Module สำหรับ Premium Error */}
        {showError && (
            <div className="mb-6 md:mb-8 bg-red-50 border-l-4 border-red-500 p-4 md:p-6 rounded-r-xl md:rounded-r-2xl shadow-sm relative animate-in slide-in-from-top-2 duration-300">
                <button 
                    onClick={() => setShowError(false)}
                    className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors"
                >
                    <IconX size={18} />
                </button>
                <div className="flex gap-3 md:gap-4">
                    <div className="p-2 md:p-3 bg-red-100 rounded-full h-fit text-red-600">
                        <IconLock size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h3 className="text-base md:text-lg font-black text-red-700 mb-1">เข้าถึงไม่ได้</h3>
                        <p className="text-xs md:text-sm font-medium text-red-600/80 leading-relaxed">
                            คุณไม่สามารถเข้าใช้งานหน้านั้นได้ เนื่องจาก <strong>แพ็กเกจของร้านค้าปัจจุบัน (Free/Basic)</strong> ไม่รองรับการใช้งานฟีเจอร์นี้สำหรับพนักงาน
                        </p>
                        <div className="mt-2 md:mt-3 inline-block px-2 py-1 md:px-3 bg-white rounded-lg text-[10px] md:text-xs font-bold text-red-500 border border-red-100">
                            โปรดติดต่อเจ้าของร้านเพื่ออัปเกรด
                        </div>
                    </div>
                </div>
            </div>
        )}

        {loading ? (
          <div className="text-center py-16 md:py-20 animate-pulse text-slate-400 font-black text-sm md:text-base">LOADING PROFILE...</div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            
            {/* Card 1: Avatar & Identity */}
            <div className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-20 md:h-24 bg-gradient-to-r from-blue-50 to-indigo-50"></div>
                
                <div className="relative mb-3 md:mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                        {previewUrl || formData.avatar_url ? (
                            <img src={previewUrl || getImageUrl(formData.avatar_url) || ''} className="w-full h-full object-cover" />
                        ) : (
                            <IconUser size={48} className="text-slate-300 md:w-16 md:h-16" />
                        )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconCamera className="text-white w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
                </div>

                <h2 className="text-xl md:text-2xl font-black text-slate-800">{formData.full_name || 'ไม่ระบุชื่อ'}</h2>
                <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 text-[10px] md:text-xs font-black uppercase tracking-widest border border-blue-200">
                        {formData.role}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-xs md:text-sm font-bold">
                        <IconMail size={12} className="md:w-3.5 md:h-3.5" /> {email}
                    </span>
                </div>
            </div>

            {/* Card 2: Edit Form */}
            <form onSubmit={handleSave} className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-200 space-y-4 md:space-y-6">
                <div>
                    <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">ชื่อ-นามสกุล</label>
                    <div className="relative">
                        <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400"><IconUser size={16} className="md:w-4.5 md:h-4.5" /></div>
                        <input 
                            type="text" 
                            value={formData.full_name} 
                            onChange={e => setFormData({...formData, full_name: e.target.value})} 
                            className="w-full pl-9 md:pl-11 pr-4 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700 text-sm md:text-base"
                            placeholder="สมชาย ใจดี"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">เบอร์โทรศัพท์</label>
                    <div className="relative">
                        <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400"><IconPhone size={16} className="md:w-4.5 md:h-4.5" /></div>
                        <input 
                            type="tel" 
                            value={formData.phone} 
                            onChange={e => setFormData({...formData, phone: e.target.value})} 
                            className="w-full pl-9 md:pl-11 pr-4 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700 text-sm md:text-base"
                            placeholder="08x-xxx-xxxx"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full py-3.5 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-lg shadow-xl hover:bg-blue-600 hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                    {submitting ? 'กำลังบันทึก...' : <><IconSave size={18} className="md:w-5 md:h-5"/> บันทึกการเปลี่ยนแปลง</>}
                </button>
            </form>

            {/* 🟢 Card 3: ข้อมูลร้านค้าปัจจุบัน & ปุ่มลาออก */}
            {rawProfile?.brand_id !== rawProfile?.own_brand_id && rawProfile?.is_joined && (
               <div className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                     <div className="p-2.5 md:p-3 bg-blue-50 text-blue-500 rounded-xl md:rounded-xl">
                        <IconStore size={20} className="md:w-6 md:h-6" />
                     </div>
                     <div>
                        <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wide mb-0.5">สถานะการทำงาน</h3>
                        <p className="text-base md:text-lg font-black text-slate-800">
                           {rawProfile.current_brand_name || 'ร้านค้าเครือข่าย'}
                        </p>
                     </div>
                  </div>

                  <button 
                     type="button"
                     onClick={() => setIsLeaveModalOpen(true)}
                     className="w-full py-3 md:py-4 border-2 border-rose-100 bg-rose-50/50 text-rose-500 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm hover:bg-rose-100 hover:border-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                     <IconLogOut size={16} className="md:w-4.5 md:h-4.5" /> ออกจากร้านค้านี้
                  </button>
               </div>
            )}

          </div>
        )}
      </div>

      {/* 📬 MODAL แจ้งเตือนคำเชิญเข้าทีมแบบ Pop-up */}
      {!loading && rawProfile && (
         <InviteNotification 
            profile={rawProfile} 
            isOpen={isInviteModalOpen} 
            onClose={() => setIsInviteModalOpen(false)} 
            onSuccess={() => {
                setRawProfile((prev: any) => ({ ...prev, invited_brand_id: null }));
                setIsInviteModalOpen(false);
            }}
         />
      )}

     {/* 🔴 MODAL ยืนยันการลาออกจากร้านค้า */}
      {isLeaveModalOpen && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => !leavingStore && setIsLeaveModalOpen(false)}></div>
            <div className="bg-white rounded-[24px] md:rounded-[32px] w-full max-w-sm relative z-10 p-5 md:p-8 animate-in zoom-in-95 shadow-2xl text-center overflow-hidden">
               
               <div className="absolute top-0 left-0 w-full h-24 md:h-32 bg-gradient-to-br from-rose-500/10 to-orange-500/5"></div>
               
               <div className="relative z-10 flex flex-col items-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30 mb-4 md:mb-5">
                    <IconLogOut size={24} className="md:w-8 md:h-8" />
                  </div>

                  <h3 className="text-lg md:text-xl font-black text-slate-900 mb-2">ยืนยันการออกจากร้าน?</h3>
                  
                  <div className="w-full bg-rose-50/50 border border-rose-100 rounded-xl md:rounded-2xl p-3 md:p-4 mb-5 md:mb-6 text-left">
                     <p className="text-xs md:text-sm font-medium text-rose-600/90 leading-relaxed text-center">
                        หากคุณยืนยัน คุณจะถูกตัดสิทธิ์จากร้าน <strong>{rawProfile?.current_brand_name || 'ร้านค้านี้'}</strong> ทันที
                     </p>
                     <div className="w-full h-px bg-rose-200/50 my-2 md:my-3"></div>
                     <p className="text-[10px] md:text-xs font-bold text-slate-500 text-center leading-relaxed">
                        ระบบจะพาคุณกลับไปยังร้านดั้งเดิมของคุณ:<br/>
                        <span className="text-blue-600 font-black text-xs md:text-sm block mt-1">✨ {rawProfile?.own_brand_name || 'ร้านค้าดั้งเดิมของคุณ'}</span>
                     </p>
                  </div>

                  <div className="flex w-full gap-2 md:gap-3">
                     <button 
                        disabled={leavingStore} 
                        onClick={() => setIsLeaveModalOpen(false)} 
                        className="flex-1 py-3 md:py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs md:text-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                     >
                        ยกเลิก
                     </button>
                     <button 
                        disabled={leavingStore} 
                        onClick={handleLeaveStore} 
                        className="flex-[1.5] py-3 md:py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 text-white rounded-xl font-bold text-xs md:text-sm shadow-md shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                     >
                        {leavingStore ? 'กำลังดำเนินการ...' : 'ยืนยันออกจากร้าน'}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
      
      {/* --- 🖼️ MODAL สำหรับ CROP รูปภาพ --- */}
      {isCropModalOpen && imageToCrop && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md h-[40vh] md:h-[50vh] min-h-[300px] max-h-[500px] bg-white rounded-[24px] md:rounded-3xl overflow-hidden shadow-2xl mb-4 md:mb-6">
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
          
          <div className="flex gap-3 md:gap-4 w-full max-w-md">
             <button 
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="flex-1 py-3 md:py-4 bg-white/10 text-white rounded-xl md:rounded-2xl font-bold text-sm hover:bg-white/20 transition-all"
             >
                ยกเลิก
             </button>
             <button 
                type="button"
                onClick={handleCropComplete}
                className="flex-[2] py-3 md:py-4 bg-blue-500 text-white rounded-xl md:rounded-2xl font-black text-sm shadow-lg shadow-blue-500/40 hover:bg-blue-600 transition-all"
             >
                ตัดรูปภาพนี้
             </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ProfileSettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-sm md:text-base">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}