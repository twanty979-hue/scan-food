// app/dashboard/settings/page.tsx
'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSettings } from '@/hooks/useSettings';
import Cropper from 'react-easy-crop'; 

import { IconShop, IconSave, IconUsers, IconLock, IconCrown, IconHistory, IconPrinter } from './components/Icons'; 
import ShopSettingsForm from './components/ShopSettingsForm';
import CurrentPlanCard from './components/CurrentPlanCard';
import UpgradePlanModal from './components/UpgradePlanModal';

function SettingsPageContent() {
  const {
    loading, submitting, isOwner, formData, setFormData,
    qrInputRef, logoInputRef, getImageUrl, handleUpload, handleSave, 
    handleUpgradePlan, paymentModal, closePaymentModal, 
    period, setPeriod,
    imageToCrop, isCropModalOpen, setIsCropModalOpen,
    setCroppedAreaPixels, handleCropComplete, croppingField,
    dbPlans, isFirstTimeBuyer 
  } = useSettings();

  const [activeTab, setActiveTab] = useState<'shop' | 'plan'>('shop'); 
  const [showUpgradePanel, setShowUpgradePanel] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const currentPlan = formData.plan || 'free';
  const canManageStaff = ['pro', 'ultimate'].includes(currentPlan);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400">
      <div className="flex flex-col items-center gap-2 md:gap-3">
        <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-slate-800"></div>
        <span className="text-xs md:text-sm font-bold animate-pulse">กำลังโหลด...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-10 relative">

      {/* --- Header --- */}
      <header className="sticky top-0 z-30 bg-[#F8FAFC]/90 backdrop-blur-md px-3 md:px-10 py-3 md:py-4 flex justify-between items-center border-b border-slate-200/60 transition-all">
         <div className="flex items-center gap-2 md:gap-3">
            
            <button
              type="button"
              onClick={() => {
                const layoutMenuBtn = document.querySelector('header button');
                if (layoutMenuBtn instanceof HTMLElement) {
                  layoutMenuBtn.click();
                }
              }}
              className="flex items-center text-left group active:scale-95 transition-transform duration-200"
              title="เปิดเมนูสไลด์บาร์"
            >
              <h1 className="text-base md:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 md:gap-3 group-hover:text-indigo-600 transition-colors">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 text-white rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-indigo-600">
                    <IconShop size={18} className="md:w-5 md:h-5" />
                </div>
                <div className="flex flex-col leading-tight">
                    <span>ตั้งค่าร้านค้า</span>
                    <span className="hidden md:block text-[10px] md:text-xs text-slate-500 font-medium group-hover:text-indigo-400 transition-colors mt-0.5">จัดการข้อมูลและสถานะร้านค้า</span>
                </div>
              </h1>
            </button>

         </div>
         
         <button 
            onClick={handleSave} 
            disabled={submitting} 
            className={`
                bg-slate-900 hover:bg-indigo-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-1.5 md:gap-2
                ${activeTab === 'shop' ? 'flex' : 'hidden lg:flex'} 
            `}
         >
            {submitting ? <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <IconSave size={16} className="md:w-4.5 md:h-4.5" />}
            <span>บันทึก</span>
         </button>
      </header>

      <main className="max-w-7xl mx-auto p-3 md:p-6 lg:p-10">
        
        {/* --- Tab Switcher (Mobile) --- */}
        <div className="lg:hidden bg-slate-100 p-1 md:p-1.5 rounded-xl md:rounded-2xl flex relative mb-4 md:mb-6">
            <button onClick={() => setActiveTab('shop')} className={`flex-1 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-1.5 md:gap-2 ${activeTab === 'shop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <IconShop size={16} /> ข้อมูลร้าน
            </button>
            <button onClick={() => setActiveTab('plan')} className={`flex-1 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-1.5 md:gap-2 ${activeTab === 'plan' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <IconCrown size={16} /> แพ็กเกจ
            </button>
        </div>

        {/* --- Layout Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
            
            {/* --- Left Column: Shop Form --- */}
            <div className={`lg:col-span-8 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 ${activeTab === 'shop' ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white p-1 rounded-3xl md:rounded-[2rem] border border-slate-100 shadow-sm h-full">
                    <ShopSettingsForm 
                        formData={formData} setFormData={setFormData} isOwner={isOwner} 
                        qrInputRef={qrInputRef} getImageUrl={getImageUrl} handleUpload={handleUpload as any}
                    />
                </div>
            </div>

            {/* --- Right Column: Buttons & Plan --- */}
            <div className={`lg:col-span-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 ${activeTab === 'plan' ? 'block' : 'hidden lg:block'}`}>
                <div className="lg:sticky lg:top-24 space-y-3 md:space-y-4">
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <Link href="/dashboard/settings/billing" className="bg-white p-2 md:p-3 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1 md:gap-1.5 hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer h-20 md:h-24">
                            <div className="w-7 h-7 md:w-8 md:h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><IconHistory size={14} className="md:w-4 md:h-4" /></div>
                            <div className="text-center">
                                <span className="font-bold text-slate-700 text-[11px] md:text-xs block">ประวัติชำระเงิน</span>
                                <span className="text-[9px] md:text-[10px] text-slate-400 leading-tight block">ดูบิลย้อนหลัง</span>
                            </div>
                        </Link>

                        <Link href="/dashboard/settings/pos" className="bg-white p-2 md:p-3 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1 md:gap-1.5 hover:border-orange-200 hover:shadow-md transition-all group cursor-pointer h-20 md:h-24">
                            <div className="w-7 h-7 md:w-8 md:h-8 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform text-sm md:text-base">▣</div>
                            <div className="text-center">
                                <span className="font-bold text-slate-700 text-[11px] md:text-xs block">ตั้งค่าหน้าคิดเงิน</span>
                                <span className="text-[9px] md:text-[10px] text-slate-400 leading-tight block">หน้าจอ พิมพ์ และ QR โต๊ะ</span>
                            </div>
                        </Link>
                        
                        <Link href="/dashboard/settings/printer" className="bg-white p-2 md:p-3 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1 md:gap-1.5 hover:border-orange-200 hover:shadow-md transition-all group cursor-pointer h-20 md:h-24">
                            <div className="w-7 h-7 md:w-8 md:h-8 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><IconPrinter size={14} className="md:w-4 md:h-4" /></div>
                            <div className="text-center">
                                <span className="font-bold text-slate-700 text-[11px] md:text-xs block">ตั้งค่าเครื่องพิมพ์</span>
                                <span className="text-[9px] md:text-[10px] text-slate-400 leading-tight block">สลิปและใบเสร็จ</span>
                            </div>
                        </Link>

                        {canManageStaff ? (
                            <Link href="/dashboard/settingss" className="col-span-2 bg-white p-2 md:p-3 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1 md:gap-1.5 hover:border-emerald-200 hover:shadow-md transition-all group cursor-pointer h-16 md:h-20">
                                <div className="w-7 h-7 md:w-8 md:h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><IconUsers size={14} className="md:w-4 md:h-4" /></div>
                                <div className="text-center flex flex-row md:flex-col items-center gap-1.5 md:gap-0">
                                    <span className="font-bold text-slate-700 text-[11px] md:text-xs block">จัดการพนักงาน</span>
                                    <span className="hidden md:block text-[9px] md:text-[10px] text-slate-400 leading-tight">เพิ่ม/ลบ สิทธิ์การเข้าร้าน</span>
                                </div>
                            </Link>
                        ) : (
                            <button onClick={() => setShowUpgradePanel(true)} className="col-span-2 bg-white p-2 md:p-3 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1 md:gap-1.5 hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden h-16 md:h-20">
                                <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2"><IconLock size={10} className="md:w-3 md:h-3 text-slate-300"/></div>
                                <div className="w-7 h-7 md:w-8 md:h-8 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><IconUsers size={14} className="md:w-4 md:h-4" /></div>
                                <div className="text-center flex flex-row md:flex-col items-center gap-1.5 md:gap-0">
                                    <span className="font-bold text-slate-400 text-[11px] md:text-xs block">จัดการพนักงาน</span>
                                    <span className="text-[8px] md:text-[9px] font-black text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-1.5 py-0.5 rounded-full inline-block md:mt-0.5">PRO Only</span>
                                </div>
                            </button>
                        )}
                    </div>
                    <CurrentPlanCard currentPlanKey={formData.plan || 'free'} setShowUpgradePanel={setShowUpgradePanel} expiryDate={formData.expiry} />
                </div>
            </div>
        </div>
      </main>

      {/* --- 🖼️ MODAL CROP (CENTERED) --- */}
      {isCropModalOpen && imageToCrop && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[90vw] md:max-w-sm rounded-3xl md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            
            <div className="px-4 py-3 md:px-5 md:py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="font-black text-slate-800 text-sm md:text-base">ตัดรูป {croppingField === 'logo_url' ? 'โลโก้ร้าน' : 'QR Code'}</h3>
            </div>

            <div className="relative w-full aspect-square bg-slate-200">
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
            
            <div className="p-3 md:p-4 flex gap-2 md:gap-3 bg-white">
               <button type="button" onClick={() => setIsCropModalOpen(false)} className="flex-1 py-2.5 md:py-3 bg-slate-100 text-slate-600 rounded-lg md:rounded-xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95">
                 ยกเลิก
               </button>
               <button type="button" onClick={handleCropComplete} className="flex-1 py-2.5 md:py-3 bg-slate-900 text-white rounded-lg md:rounded-xl font-black text-sm shadow-lg hover:bg-indigo-600 transition-all active:scale-95">
                 ตกลง
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Other Modals */}
      <UpgradePlanModal 
        show={showUpgradePanel} 
        onClose={() => setShowUpgradePanel(false)} 
        period={period} 
        setPeriod={setPeriod as any} 
        currentPlanKey={formData.plan || 'free'} 
        submitting={submitting} 
        handleUpgradePlan={handleUpgradePlan as any} 
        dbPlans={dbPlans} 
        isFirstTimeBuyer={isFirstTimeBuyer} 
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-sm md:text-base">กำลังโหลด...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}