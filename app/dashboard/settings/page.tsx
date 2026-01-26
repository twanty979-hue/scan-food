// app/dashboard/settings/page.tsx
'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useSettings } from '@/hooks/useSettings';

// --- Icons ---
const IconShop = ({ size=24, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 21h18"/><path d="M5 21v-7"/><path d="M19 21v-7"/><path d="M2 10l20 0"/><path d="M2 10l2-4h16l2 4"/></svg>;
const IconSave = ({ size=20, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconUpload = ({ size=24, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconDiamond = ({ size=20, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 3h12l4 6-10 13L2 9z"/></svg>;
const IconCheck = ({ size=16, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>;
const IconQr = ({ size=20, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><path d="M3 14h7v7H3z"/></svg>;
const IconCopy = ({ size=16, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconStar = ({ size=16, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconCard = ({ size=20, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
// Toggle Icons
const IconToggleOn = () => <svg className="w-10 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor"><rect x="0" y="4" width="24" height="16" rx="8" fill="currentColor" opacity="0.2"/><circle cx="16" cy="12" r="6" fill="currentColor"/></svg>;
const IconToggleOff = () => <svg className="w-10 h-6 text-slate-300" viewBox="0 0 24 24" fill="currentColor"><rect x="0" y="4" width="24" height="16" rx="8" fill="currentColor"/><circle cx="8" cy="12" r="6" fill="white"/></svg>;

// --- Styles & Plans ---
const PLANS = {
  free: { name: 'Free Starter', price: 'ฟรี', period: 'ตลอดชีพ', themes: '3 ธีม', orders: '10 ออเดอร์/วัน', features: ['ใช้งานฟรีตลอดชีพ', 'สร้าง QR Code รับเงิน'], color: 'bg-white border-slate-200', btnColor: 'bg-slate-100 text-slate-600' },
  basic: { name: 'Basic', price: '399', period: 'บาท/เดือน', themes: '10 ธีม', orders: 'ไม่จำกัด', features: ['ปลดล็อกจำนวนออเดอร์', 'เลือกธีมสวยๆ ได้มากขึ้น'], color: 'bg-blue-50 border-blue-200', btnColor: 'bg-blue-600 text-white hover:bg-blue-700' },
  pro: { name: 'Pro', price: '1,299', period: 'บาท/เดือน', themes: '30 ธีม', orders: 'ไม่จำกัด', features: ['เข้าถึงธีมพรีเมียม 30 แบบ', 'ระบบจัดการร้านเต็มรูปแบบ'], color: 'bg-indigo-50 border-indigo-200', btnColor: 'bg-indigo-600 text-white hover:bg-indigo-700' },
  ultimate: { name: 'ULTIMATE', price: '1,999', period: 'บาท/เดือน', themes: 'ทุกธีม (All Access)', orders: 'ไม่จำกัด', features: ['ปลดล็อกทุกธีมในระบบ', 'อัปเดตฟีเจอร์ใหม่ฟรี', 'สิทธิพิเศษสูงสุด'], color: 'bg-gradient-to-b from-slate-900 to-slate-800 text-white border-slate-700 shadow-2xl shadow-blue-900/20 scale-105 z-10', btnColor: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:from-blue-400 hover:to-cyan-300', isPopular: true }
};

const inputClasses = "w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-lg font-medium text-slate-700 placeholder-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm hover:border-blue-200";
const labelClasses = "block text-xs font-bold text-blue-900/60 uppercase mb-2 ml-1 tracking-wider";
const cardBase = "bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white h-full relative overflow-hidden transition-all";

export default function SettingsPage() {
  const {
    loading, submitting, isOwner, brandId, formData, setFormData,
    logoInputRef, qrInputRef, getImageUrl, copyBrandId, handleUpload, handleSave, 
    handleUpgradePlan, paymentModal, closePaymentModal,
    isAutoRenew, setIsAutoRenew // ✅ เรียกใช้
  } = useSettings();

  const [showUpgradePanel, setShowUpgradePanel] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'promptpay'>('promptpay');
  const currentPlanKey = formData.plan || 'free'; 
  const currentPlan = PLANS[currentPlanKey as keyof typeof PLANS] || PLANS.free;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8]"><div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6 md:p-10 font-sans text-slate-800 selection:bg-blue-100 relative">
      <Script src="https://cdn.omise.co/omise.js" strategy="lazyOnload" />

      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div><div className="flex items-center gap-4 mb-2"><div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm border border-blue-50"><IconShop size={32} /></div><h1 className="text-4xl font-black text-slate-800 tracking-tight">ตั้งค่าร้านค้า</h1></div><p className="text-slate-500 font-medium pl-[4.5rem] text-lg">จัดการข้อมูลร้านค้า, การชำระเงิน และแพ็กเกจของคุณ</p></div>
           {isOwner && (<button onClick={handleSave} disabled={submitting} className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70">{submitting ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"/> : <IconSave />}<span>บันทึกการเปลี่ยนแปลง</span></button>)}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
           {/* Left Col */}
           <div className="xl:col-span-2 space-y-8">
              <div className={cardBase}>
                 <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100"><h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><span className="w-3 h-8 rounded-full bg-blue-500"></span> ข้อมูลทั่วไป</h3><span className="px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100 tracking-wide">Public View</span></div>
                 <div className="flex flex-col lg:flex-row gap-12">
                    <div className="shrink-0 flex flex-col items-center lg:items-start gap-5">
                       <div className="w-56 h-56 rounded-[2.5rem] bg-slate-50 border-4 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 relative group cursor-pointer overflow-hidden transition-all shadow-inner" onClick={() => isOwner && logoInputRef.current?.click()}>
                          {formData.logo_url ? <img src={getImageUrl(formData.logo_url) ?? ''} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3"><IconUpload size={48} /><span className="font-bold text-sm uppercase tracking-wide">Upload Logo</span></div>}
                          <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'logo_url')} disabled={!isOwner} />
                       </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="md:col-span-2"><label className={labelClasses}>ชื่อร้านค้า</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClasses} placeholder="ชื่อร้าน..." disabled={!isOwner} /></div>
                       <div><label className={labelClasses}>เบอร์โทรศัพท์</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClasses} placeholder="08x..." disabled={!isOwner} /></div>
                       <div><label className={labelClasses}>จังหวัด</label><input type="text" className={inputClasses} placeholder="จังหวัด..." disabled={!isOwner} /></div>
                       <div className="md:col-span-2"><label className={labelClasses}>ที่อยู่</label><textarea rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={`${inputClasses} resize-none leading-relaxed py-4`} placeholder="ที่อยู่..." disabled={!isOwner} /></div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Col */}
           <div className="space-y-8">
              {/* Plan Card */}
              <div className={`${cardBase} bg-gradient-to-br from-white to-blue-50/50 border-blue-100`}>
                 <div className="flex justify-between items-start mb-6">
                    <div><p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">CURRENT PLAN</p><h3 className={`text-3xl font-black ${currentPlanKey === 'ultimate' ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500' : 'text-slate-800'}`}>{currentPlan.name}</h3></div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${currentPlanKey === 'ultimate' ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white' : 'bg-white text-blue-500'}`}><IconDiamond size={28} /></div>
                 </div>
                 <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100"><span className="text-sm font-bold text-slate-500">Themes</span><span className="text-lg font-black text-blue-600">{currentPlanKey === 'ultimate' ? 'ไม่จำกัด' : currentPlan.themes}</span></div>
                    <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100"><span className="text-sm font-bold text-slate-500">Orders</span><span className="text-lg font-black text-blue-600">{currentPlan.orders}</span></div>
                 </div>
                 <button onClick={() => setShowUpgradePanel(true)} className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2"><IconDiamond size={20}/> อัปเกรดแพ็กเกจ</span>
                 </button>
              </div>
              
              {/* PromptPay Info */}
              <div className={cardBase}>
                 <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> รับชำระเงิน</h3>
                 <div className="space-y-6">
                    <div><label className={labelClasses}>พร้อมเพย์</label><input type="text" value={formData.promptpay_number} onChange={e => setFormData({...formData, promptpay_number: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-b-2 border-slate-200 focus:border-emerald-500 text-3xl font-mono font-bold text-slate-800 placeholder-slate-300 outline-none transition-colors" placeholder="000-000-0000" disabled={!isOwner} /></div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div><p className="text-sm font-bold text-slate-700">QR Logo</p><p className="text-xs text-slate-400">รูปตรงกลาง QR</p></div>
                       <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center cursor-pointer hover:border-emerald-400 overflow-hidden shadow-sm transition-all" onClick={() => isOwner && qrInputRef.current?.click()}>
                          {formData.qr_image_url ? <img src={getImageUrl(formData.qr_image_url) ?? ''} className="w-full h-full object-cover" /> : <IconQr className="text-slate-300" />}
                          <input type="file" ref={qrInputRef} className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'qr_image_url')} disabled={!isOwner} />
                       </div>
                    </div>
                 </div>
              </div>
              {brandId && (<div className="bg-white rounded-[32px] p-6 shadow-xl shadow-blue-900/5 border border-white flex items-center gap-6"><div className="bg-slate-900 p-2 rounded-2xl shrink-0"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${brandId}`} className="w-20 h-20 object-contain rounded-xl bg-white"/></div><div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">STAFF ACCESS</p><div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl p-2 pl-4"><code className="flex-1 font-mono font-bold text-slate-800 truncate text-lg">{brandId}</code><button onClick={copyBrandId} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-colors shadow-sm"><IconCopy size={20}/></button></div></div></div>)}
           </div>
        </div>
      </div>

      {/* --- Upgrade Modal --- */}
      {showUpgradePanel && (
         <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowUpgradePanel(false)}></div>
            <div className="bg-[#F8FAFC] rounded-[40px] shadow-2xl w-full max-w-7xl relative z-50 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
               <div className="p-8 md:p-10 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-20">
                  <div><h2 className="text-3xl font-black text-slate-800 tracking-tight">เลือกแพ็กเกจของคุณ</h2><p className="text-slate-500 text-lg mt-1">ปลดล็อกขีดจำกัด เพิ่มยอดขาย ด้วยฟีเจอร์ระดับมืออาชีพ</p></div>
                  <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-4">
                          <div className="flex bg-slate-100 p-1 rounded-xl">
                              <button onClick={() => setPaymentMethod('promptpay')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${paymentMethod === 'promptpay' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}><div className="flex items-center gap-2"><IconQr size={16}/> PromptPay</div></button>
                              <button onClick={() => setPaymentMethod('credit_card')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${paymentMethod === 'credit_card' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}><div className="flex items-center gap-2"><IconCard size={16}/> Credit Card</div></button>
                          </div>
                          <button onClick={() => setShowUpgradePanel(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 font-bold">✕</button>
                      </div>
                      
                      {/* ✅ Auto Renew Toggle (Visible only for Credit Card) */}
                      {paymentMethod === 'credit_card' && (
                          <div 
                             className="flex items-center gap-2 cursor-pointer group hover:opacity-80 transition-opacity"
                             onClick={() => setIsAutoRenew(!isAutoRenew)}
                          >
                             <div className="transition-all duration-300 scale-90">
                                {isAutoRenew ? <IconToggleOn /> : <IconToggleOff />}
                             </div>
                             <span className={`text-xs font-bold uppercase tracking-wider ${isAutoRenew ? 'text-green-600' : 'text-slate-400'}`}>
                                {isAutoRenew ? 'Auto Renew: ON' : 'Auto Renew: OFF'}
                             </span>
                          </div>
                      )}
                  </div>
               </div>
               <div className="p-8 md:p-10 overflow-y-auto bg-[#F8FAFC]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {(['free', 'basic', 'pro', 'ultimate'] as const).map((planKey) => {
                        const plan = PLANS[planKey];
                        const isCurrent = currentPlanKey === planKey;
                        // @ts-ignore
                        const isPopular = plan.isPopular;
                        return (
                           <div key={planKey} className={`relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-300 ${isCurrent ? 'bg-white ring-4 ring-blue-500/20 shadow-xl' : plan.color} ${!isCurrent && !isPopular ? 'bg-white border-2 border-slate-100 hover:border-blue-200 hover:shadow-lg hover:-translate-y-2' : ''}`}>
                              {isCurrent && <div className="absolute top-6 right-6 bg-blue-100 text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">Current</div>}
                              <div className="mb-6"><h3 className={`text-xl font-bold mb-2 uppercase tracking-wide ${isPopular ? 'text-blue-200' : 'text-slate-500'}`}>{plan.name}</h3><div className="flex items-baseline gap-1"><span className={`text-4xl font-black ${isPopular ? 'text-white' : 'text-slate-800'}`}>{plan.price}</span><span className={`text-sm font-bold ${isPopular ? 'text-slate-400' : 'text-slate-400'}`}>{plan.period}</span></div></div>
                              <div className={`h-px w-full mb-6 ${isPopular ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                              <ul className="space-y-4 mb-10 flex-1">
                                 {/* @ts-ignore */}
                                 {plan.features.map((feat, i) => (<li key={i} className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isPopular ? 'bg-white/10 text-cyan-400' : 'bg-green-50 text-green-600'}`}><IconCheck size={14}/></div><span className={`font-medium text-sm ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>{feat}</span></li>))}
                              </ul>
                              <button disabled={isCurrent || submitting} onClick={() => { setShowUpgradePanel(false); handleUpgradePlan(planKey, paymentMethod); }} className={`w-full py-4 rounded-2xl font-bold text-base transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${plan.btnColor}`}>{isCurrent ? 'ใช้งานอยู่' : `เลือก (จ่ายด้วย ${paymentMethod === 'promptpay' ? 'พร้อมเพย์' : 'บัตร'})`}</button>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* --- PromptPay Modal --- */}
      {paymentModal.isOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300"></div>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border-4 border-white p-8 text-center">
                <div className="flex flex-col items-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/PromptPay-logo.png" alt="PromptPay" className="h-8 mb-6" />
                    <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-100 mb-6">
                        {paymentModal.qrImage && <img src={paymentModal.qrImage} alt="Scan to Pay" className="w-64 h-64 object-contain" />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">สแกนเพื่อชำระเงิน</h3>
                    <p className="text-slate-500 text-sm mb-6">ระบบจะตรวจสอบยอดเงินอัตโนมัติ...</p>
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <button onClick={closePaymentModal} className="mt-8 text-slate-400 text-xs font-bold hover:text-red-500 underline">ยกเลิกรายการ</button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
}