// app/dashboard/settings/page.tsx
'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link'; // [เพิ่ม] import Link
import { useSettings } from '@/hooks/useSettings';

// --- Icons ---
const IconShop = ({ size=24, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 21h18"/><path d="M5 21v-7"/><path d="M19 21v-7"/><path d="M2 10l20 0"/><path d="M2 10l2-4h16l2 4"/></svg>;
const IconSave = ({ size=20, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconUpload = ({ size=24, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconDiamond = ({ size=24, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 3h12l4 6-10 13L2 9z"/></svg>;
const IconCheck = ({ size=16, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>;
const IconQr = ({ size=24, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><path d="M3 14h7v7H3z"/></svg>;
const IconClose = ({ size=24, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconImage = ({ size=24, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IconCreditCard = ({ size=24, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IconCrown = ({ size=24, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>;
const IconPhone = ({ size=24, className="" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;

const PLANS = {
  free: { name: 'Starter', price: 'ฟรี', period: 'ตลอดชีพ', themes: '3 ธีม', orders: '10 ออเดอร์/เดือน', features: ['ใช้งานฟรีตลอดชีพ', 'สร้าง QR Code รับเงิน', 'เมนูอาหารพื้นฐาน'], color: 'border-slate-200', btnColor: 'bg-slate-100 text-slate-600 hover:bg-slate-200' },
  basic: { name: 'Basic', price: '399', period: 'บาท/เดือน', themes: '10 ธีม', orders: 'ไม่จำกัด', features: ['ออเดอร์ไม่จำกัด', 'เลือกธีมสวยๆ ได้มากขึ้น', 'รายงานยอดขาย'], color: 'border-blue-200', btnColor: 'bg-blue-600 text-white hover:bg-blue-700' },
  pro: { name: 'Pro', price: '1,299', period: 'บาท/เดือน', themes: '30 ธีม', orders: 'ไม่จำกัด', features: ['ธีมพรีเมียม 30 แบบ', 'ระบบจัดการครัว (KDS)', 'รายงานเชิงลึก'], color: 'border-indigo-200', btnColor: 'bg-indigo-600 text-white hover:bg-indigo-700' },
  ultimate: { name: 'ULTIMATE', price: '1,999', period: 'บาท/เดือน', themes: 'ทุกธีม (All Access)', orders: 'ไม่จำกัด', features: ['ปลดล็อกทุกฟีเจอร์', 'ดูแลพิเศษ 24/7', 'ปรับแต่งแบรนด์ 100%'], color: 'border-purple-500 shadow-purple-200', btnColor: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30', isPopular: true }
};

export default function SettingsPage() {
  const {
    loading, submitting, isOwner, formData, setFormData,
    qrInputRef, getImageUrl, handleUpload, handleSave, 
    handleUpgradePlan, paymentModal, closePaymentModal,
    period, setPeriod
  } = useSettings();

  const [showUpgradePanel, setShowUpgradePanel] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'promptpay'>('promptpay');
  const currentPlanKey = formData.plan || 'free'; 
  const currentPlan = PLANS[currentPlanKey as keyof typeof PLANS] || PLANS.free;

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
      กำลังโหลดข้อมูล...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Script src="https://cdn.omise.co/omise.js" strategy="lazyOnload" />

      {/* --- Header --- */}
      <header className=" px-6 lg:px-10 h-20 flex items-center justify-between">
          {/* [แก้ไข] ใช้ Link ครอบเพื่อให้กดกลับ Dashboard ได้ */}
          <Link href="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/10">
                  <IconShop size={20} />
              </div>
              <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">ตั้งค่าร้านค้า</h1>
                  <p className="text-slate-500 text-xs font-medium">จัดการข้อมูลและแพ็กเกจ</p>
              </div>
          </Link>

          {isOwner && (
              <button 
                onClick={handleSave} 
                disabled={submitting} 
                className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-slate-200 hover:shadow-indigo-500/20"
              >
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <IconSave size={18} />}
                <span>บันทึก</span>
              </button>
          )}
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* === LEFT: Settings Panel (8/12) === */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                        ข้อมูลร้านค้าและการเงิน
                    </h3>

                    <div className="flex flex-col gap-10">
                        {/* 1. Shop Info Inputs (Grid Layout) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block group-focus-within:text-indigo-600 transition-colors">ชื่อร้านค้า <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"><IconShop size={20}/></div>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={e => setFormData({...formData, name: e.target.value})} 
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-transparent hover:border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl font-bold text-lg text-slate-800 outline-none transition-all placeholder:text-slate-300" 
                                        placeholder="ระบุชื่อร้านค้า" 
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block group-focus-within:text-indigo-600 transition-colors">เบอร์โทรศัพท์</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"><IconPhone size={20}/></div>
                                    <input 
                                        type="tel" 
                                        value={formData.phone} 
                                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-transparent hover:border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl font-medium text-lg text-slate-800 outline-none transition-all placeholder:text-slate-300 font-mono" 
                                        placeholder="08x-xxx-xxxx" 
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* 2. Payment Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xs font-bold text-slate-500 ml-1">รับชำระเงิน (PromptPay)</label>
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                    <IconCheck size={10} strokeWidth={4}/> เปิดใช้งาน
                                </span>
                            </div>

                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-6 border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 p-4 opacity-5"><IconQr size={120}/></div>

                                <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">
                                    {/* QR Icon Upload */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div 
                                            className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center cursor-pointer overflow-hidden relative hover:scale-105 transition-transform"
                                            onClick={() => isOwner && qrInputRef.current?.click()}
                                        >
                                            {formData.qr_image_url ? (
                                                <img src={getImageUrl(formData.qr_image_url) ?? ''} className="w-full h-full object-cover" alt="QR Icon" />
                                            ) : (
                                                <IconImage size={24} className="text-slate-300"/>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <IconUpload className="text-white" size={16}/>
                                            </div>
                                            <input type="file" ref={qrInputRef} className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'qr_image_url')} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">QR Icon</span>
                                    </div>

                                    {/* PromptPay Input */}
                                    <div className="flex-1 w-full">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">PromptPay ID (เบอร์โทร / เลขบัตร)</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={formData.promptpay_number} 
                                                onChange={e => setFormData({...formData, promptpay_number: e.target.value})} 
                                                className="w-full h-16 pl-4 pr-4 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-2xl font-bold font-mono text-slate-800 placeholder-slate-200 outline-none transition-all shadow-sm tracking-wider" 
                                                placeholder="000-000-0000" 
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"><IconQr size={24}/></div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-2 ml-1">
                                            ระบบจะนำเลขนี้ไปสร้าง QR Code มาตรฐานให้ลูกค้าสแกนอัตโนมัติ
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
              </div>
            </div>

            {/* === RIGHT: Plan Card (4/12) - Sticky & Dynamic Styles === */}
            <div className="lg:col-span-4 h-full">
                {/* ใส่ Style Animation ไว้ตรงนี้เพื่อให้ทำงานทันที */}
                <style jsx global>{`
                    @keyframes rainbow-flow {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    @keyframes shimmer {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                    .animate-rainbow-fast {
                        animation: rainbow-flow 3s ease infinite;
                        background-size: 300% 300%;
                    }
                    .text-gold-gradient {
                        background: linear-gradient(to bottom, #cfc09f 22%, #ffecb3 24%, #b58d3d 26%, #b58d3d 27%, #ffecb3 40%, #b38728 78%); 
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        color: #b38728;
                    }
                    .border-gold-gradient {
                        border: 2px solid transparent;
                        background: linear-gradient(#0f172a, #0f172a) padding-box,
                                    linear-gradient(to bottom, #cfc09f 0%, #ffecb3 40%, #b38728 100%) border-box;
                    }
                `}</style>

                {/* 1. FREE & BASIC : พื้นขาว ขอบฟ้า (Clean Blue) + ตัวหนังสือสีเข้ม */}
                {['free', 'basic'].includes(currentPlanKey) && (
                    <div className="sticky top-28 bg-white border-2 border-slate-100 rounded-[32px] p-8 text-slate-900 overflow-hidden shadow-xl shadow-slate-200/50 relative">
                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[400px]">
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">Current Plan</span>
                                    <IconShop className="text-blue-500" size={28} />
                                </div>
                                <h2 className="text-4xl lg:text-5xl font-black mb-2 tracking-tight text-slate-900">{currentPlan.name}</h2>
                                <p className="text-slate-500 text-base font-medium mb-10 flex items-center gap-2">
                                    {currentPlan.price === 'ฟรี' ? 'Free Forever' : `${currentPlan.price} ${currentPlan.period}`}
                                </p>
                                <div className="space-y-5 mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><IconDiamond size={18} /></div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Themes</p>
                                            <p className="font-bold text-lg text-slate-700">{currentPlan.themes}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><IconCheck size={18} /></div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Orders</p>
                                            <p className="font-bold text-lg text-slate-700">{currentPlan.orders}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowUpgradePanel(true)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 group">
                                <span>อัปเกรดแพ็กเกจ</span>
                                <IconCrown size={16} className="text-yellow-400 group-hover:rotate-12 transition-transform"/>
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. PRO : ขอบรุ้งวิ่ง (Running Rainbow Border) */}
                {currentPlanKey === 'pro' && (
                    <div className="sticky top-28 relative group z-0">
                        {/* Layer 1: Running Gradient Background (ทำหน้าที่เป็นขอบ) */}
                        <div className="absolute -inset-[4px] rounded-[36px] bg-gradient-to-r from-rose-500 via-amber-500 via-emerald-500 via-sky-500 to-indigo-500 animate-rainbow-fast opacity-100 blur-[2px]"></div>
                        
                        {/* Layer 2: White Card Content */}
                        <div className="bg-white rounded-[32px] p-8 text-purple-900 h-full relative z-10 overflow-hidden min-h-[400px] flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-purple-200">Current Plan</span>
                                    <IconCrown className="text-purple-500 drop-shadow-sm" size={28} />
                                </div>
                                <h2 className="text-4xl lg:text-5xl font-black mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-indigo-600">{currentPlan.name}</h2>
                                <p className="text-purple-700/80 text-base font-medium mb-10 flex items-center gap-2">
                                    {currentPlan.price} {currentPlan.period}
                                </p>
                                <div className="space-y-5 mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><IconDiamond size={18} /></div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">Themes</p>
                                            <p className="font-bold text-lg text-purple-800">{currentPlan.themes}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><IconCheck size={18} /></div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">Orders</p>
                                            <p className="font-bold text-lg text-purple-800">{currentPlan.orders}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowUpgradePanel(true)} className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 group">
                                <span>จัดการแพ็กเกจ</span>
                                <IconCrown size={16} className="text-white group-hover:rotate-12 transition-transform"/>
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. ULTIMATE : ทองคำหรูหรา (Luxury Gold) */}
                {currentPlanKey === 'ultimate' && (
                    <div className="sticky top-28 border-gold-gradient rounded-[32px] p-8 text-white overflow-hidden shadow-[0_10px_40px_-10px_rgba(179,135,40,0.5)] relative z-0 bg-slate-900">
                        {/* Metallic Texture */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 mix-blend-overlay"></div>
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-200%] animate-[shimmer_3s_infinite_linear]"></div>
                        
                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[400px]">
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="px-3 py-1 bg-gradient-to-r from-[#cfc09f] to-[#b38728] rounded-full p-[1px]">
                                        <span className="block px-3 py-0.5 bg-slate-900 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#cfc09f]">Exclusive</span>
                                    </div>
                                    <IconCrown className="text-[#ffecb3] drop-shadow-[0_0_10px_rgba(255,236,179,0.5)]" size={32} />
                                </div>
                                <h2 className="text-4xl lg:text-5xl font-black mb-2 tracking-tight text-gold-gradient drop-shadow-sm">{currentPlan.name}</h2>
                                <p className="text-[#cfc09f] text-base font-bold mb-10 flex items-center gap-2 opacity-90">
                                    {currentPlan.price} {currentPlan.period}
                                </p>
                                <div className="space-y-6 mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#cfc09f] to-[#b38728] p-[1px]">
                                            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                                                <IconDiamond size={20} className="text-[#ffecb3]" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-[#cfc09f]/60 font-bold">Themes</p>
                                            <p className="font-bold text-xl text-[#ffecb3]">{currentPlan.themes}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#cfc09f] to-[#b38728] p-[1px]">
                                            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                                                <IconCheck size={20} className="text-[#ffecb3]" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-[#cfc09f]/60 font-bold">Orders</p>
                                            <p className="font-bold text-xl text-[#ffecb3]">{currentPlan.orders}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowUpgradePanel(true)} className="relative w-full py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-xl group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#cfc09f] via-[#ffecb3] to-[#b38728]"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                <span className="relative flex items-center justify-center gap-2 text-slate-900">
                                    จัดการแพ็กเกจ
                                    <IconCrown size={16} className="text-slate-900 group-hover:rotate-12 transition-transform"/>
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
      </main>

      {/* --- Upgrade Modal (Pricing) --- */}
      {showUpgradePanel && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowUpgradePanel(false)}></div>
             
             <div className="bg-[#F8FAFC] w-full md:max-w-6xl h-[92vh] md:h-auto md:max-h-[90vh] rounded-t-[32px] md:rounded-[40px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                
                {/* Modal Header */}
                <div className="px-6 py-5 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><IconCrown size={20}/></div>
                       <h2 className="text-xl font-bold text-slate-900">เลือกแพ็กเกจของคุณ</h2>
                   </div>
                   <button onClick={() => setShowUpgradePanel(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"><IconClose size={18} /></button>
                </div>
                
                {/* Period & Payment Switchers */}
                <div className="px-6 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white shadow-sm z-20">
                    <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                        <button onClick={() => setPeriod('monthly')} className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all ${period === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>รายเดือน</button>
                        <button onClick={() => setPeriod('yearly')} className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${period === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>รายปี <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-md">-20%</span></button>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        {['promptpay', 'credit_card'].map((method) => (
                            <button key={method} onClick={() => setPaymentMethod(method as any)} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl border-2 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${paymentMethod === method ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-transparent bg-slate-100 text-slate-400'}`}>
                               {method === 'promptpay' ? <IconQr size={14}/> : <IconCreditCard size={14}/>} {method.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-10">
                       {(['free', 'basic', 'pro', 'ultimate'] as const).map((planKey) => {
                          const plan = PLANS[planKey];
                          const isCurrent = currentPlanKey === planKey;
                          const basePrice = planKey === 'free' ? 0 : parseInt(plan.price.replace(/,/g, ''));
                          const fullPricePerYear = basePrice * 12;
                          const discountedPricePerYear = fullPricePerYear * 0.8;
                          const monthlyAverage = Math.floor(discountedPricePerYear / 12);

                          return (
                             <div key={planKey} className={`relative flex flex-col p-6 rounded-[28px] bg-white border transition-all ${(plan as any).isPopular ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500' : 'border-slate-200'}`}>
                               {(plan as any).isPopular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-md">Best Value</span>}
                                
                                <div className="text-center mb-6 pt-2">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{plan.name}</h3>
                                    
                                    {period === 'yearly' && planKey !== 'free' ? (
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-baseline gap-1 text-slate-900">
                                                <span className="text-3xl font-black">{monthlyAverage.toLocaleString()}</span>
                                                <span className="text-xs font-bold text-slate-400">บ./เดือน</span>
                                            </div>
                                            <div className="mt-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                                ประหยัด {(fullPricePerYear - discountedPricePerYear).toLocaleString()} บาท/ปี
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-baseline justify-center gap-1 text-slate-900">
                                            <span className="text-3xl font-black">{plan.price}</span>
                                            {planKey !== 'free' && <span className="text-xs font-bold text-slate-400">บ./เดือน</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-3 mb-8">
                                    {plan.features.map((feat, i) => (
                                        <div key={i} className="flex items-start gap-2.5">
                                            <div className="mt-0.5 w-4 h-4 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                                                <IconCheck size={10} strokeWidth={4}/>
                                            </div>
                                            <span className="text-xs font-medium text-slate-600 leading-tight">{feat}</span>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                  disabled={isCurrent || submitting} 
                                  onClick={() => { setShowUpgradePanel(false); handleUpgradePlan(planKey, paymentMethod); }} 
                                  className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${isCurrent ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : plan.btnColor + ' shadow-md'}`}
                                >
                                  {isCurrent ? 'ใช้งานอยู่' : 'เลือกแพ็กเกจนี้'}
                                </button>
                             </div>
                          );
                       })}
                   </div>
                </div>
             </div>
          </div>
      )}

      {/* --- QR Payment Modal --- */}
      {paymentModal.isOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closePaymentModal}></div>
             <div className="bg-white rounded-[32px] w-full max-w-[340px] relative z-10 p-8 text-center shadow-2xl animate-in zoom-in-95">
                 <h3 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-tight">ชำระเงิน</h3>
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-inner mb-6 flex justify-center">
                    {paymentModal.qrImage ? (
                        <img src={paymentModal.qrImage} alt="QR" className="w-44 h-44 object-contain" />
                    ) : (
                        <div className="w-44 h-44 flex items-center justify-center text-slate-300 animate-pulse">สร้าง QR...</div>
                    )}
                 </div>
                 <button onClick={closePaymentModal} className="w-full h-12 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors">ยกเลิก</button>
             </div>
          </div>
      )}
    </div>
  );
}