// app/dashboard/settings/components/ShopSettingsForm.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { IconShop, IconPhone, IconCheck, IconQr, IconImage, IconUpload, IconLock, IconUnlock, IconEye, IconEyeOff } from './Icons';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  isOwner: boolean;
  qrInputRef: any;
  getImageUrl: (path: string) => string | null;
  handleUpload: (e: any, field: string) => void;
}

export default function ShopSettingsForm({ formData, setFormData, isOwner, qrInputRef, getImageUrl, handleUpload }: Props) {
  
  // State สำหรับระบบความปลอดภัย
  const [isLocked, setIsLocked] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ฟังก์ชันตรวจสอบรหัสผ่าน
  const handleVerifyPassword = async () => {
    setVerifying(true);
    setErrorMsg('');
    
    try {
        // 1. ดึง Email ของ User ปัจจุบัน
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) throw new Error('ไม่พบข้อมูลผู้ใช้');

        // 2. ลอง Sign-in เพื่อเช็ครหัสผ่าน
        const { error } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: passwordInput
        });

        if (error) throw new Error('รหัสผ่านไม่ถูกต้อง');

        // 3. ถ้ารหัสถูก -> ปลดล็อก
        setIsLocked(false);
        setShowPasswordModal(false);
        setPasswordInput('');
        
    } catch (err: any) {
        setErrorMsg(err.message);
    } finally {
        setVerifying(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
        
        {/* --- ส่วนที่ 1: ข้อมูลทั่วไป (Card แบบ Clean) --- */}
        <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 scale-150">
                <IconShop size={200}/>
             </div>

             <div className="relative z-10">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <IconShop size={20} />
                    </div>
                    ข้อมูลร้านค้า
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block">ชื่อร้านค้า <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300" 
                            placeholder="ระบุชื่อร้านค้า" 
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block">เบอร์โทรศัพท์ติดต่อ</label>
                        <div className="relative">
                            <input 
                                type="tel" 
                                value={formData.phone} 
                                onChange={e => setFormData({...formData, phone: e.target.value})} 
                                className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-medium text-slate-800 outline-none transition-all placeholder:text-slate-300 font-mono" 
                                placeholder="08x-xxx-xxxx" 
                            />
                             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><IconPhone size={18}/></div>
                        </div>
                    </div>
                </div>
             </div>
        </div>

        {/* --- ส่วนที่ 2: ระบบการเงิน (Card แบบ Secure) --- */}
        <div className="bg-white rounded-[24px] p-8 shadow-md border border-slate-100 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                     <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <IconQr size={20} />
                        </div>
                        รับชำระเงิน (PromptPay)
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${isLocked ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                        {isLocked ? <><IconLock size={12}/> Locked (ปลอดภัย)</> : <><IconUnlock size={12}/> Unlocked (แก้ไขได้)</>}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* PromptPay Input Area */}
                    <div className="flex-1 order-2 md:order-1">
                        <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block">PromptPay ID (เบอร์โทร / เลขบัตร)</label>
                        
                        <div className="relative group">
                            <input 
                                type="text" 
                                value={formData.promptpay_number} 
                                onChange={e => !isLocked && setFormData({...formData, promptpay_number: e.target.value})} 
                                disabled={isLocked}
                                className={`w-full h-14 pl-12 pr-28 border-2 rounded-2xl font-mono text-xl tracking-wider outline-none transition-all 
                                    ${isLocked 
                                        ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed select-none' 
                                        : 'bg-white border-emerald-500/30 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-800'
                                    }`}
                                placeholder="000-000-0000" 
                            />
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLocked ? 'text-slate-300' : 'text-emerald-500'}`}>
                                <IconQr size={24}/>
                            </div>

                            {/* ปุ่มปลดล็อก */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                {isLocked ? (
                                    <button 
                                        onClick={() => setShowPasswordModal(true)}
                                        className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <IconLock size={14}/> แก้ไข
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setIsLocked(true)}
                                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <IconCheck size={14}/> เสร็จสิ้น
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <p className="text-[11px] text-slate-400 mt-3 flex items-start gap-1.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-blue-500 mt-0.5">ℹ️</span> 
                            ระบบจะนำเลขนี้ไปสร้าง QR Code มาตรฐานให้ลูกค้าสแกนจ่ายเงิน หากต้องการเปลี่ยนเลข กรุณากดปุ่ม "แก้ไข" และยืนยันรหัสผ่านเพื่อความปลอดภัย
                        </p>
                    </div>

                    {/* QR Image Upload */}
                    <div className="order-1 md:order-2 flex flex-col items-center justify-center gap-3">
                         <div 
                            className={`w-24 h-24 rounded-2xl shadow-sm border-2 flex items-center justify-center cursor-pointer overflow-hidden relative transition-all 
                                ${isLocked ? 'bg-slate-50 border-slate-100 grayscale opacity-70 cursor-not-allowed' : 'bg-white border-slate-200 hover:border-emerald-400 hover:scale-105'}`}
                            onClick={() => !isLocked && isOwner && qrInputRef.current?.click()}
                        >
                            {formData.qr_image_url ? (
                                <img src={getImageUrl(formData.qr_image_url) ?? ''} className="w-full h-full object-cover" alt="QR Icon" />
                            ) : (
                                <IconImage size={28} className="text-slate-300"/>
                            )}
                            
                            {!isLocked && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <IconUpload className="text-white" size={20}/>
                                </div>
                            )}
                            <input type="file" ref={qrInputRef} className="hidden" accept="image/*" disabled={isLocked} onChange={(e) => handleUpload(e, 'qr_image_url')} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">QR Logo</span>
                    </div>
                </div>
            </div>
        </div>

        {/* --- Password Verification Modal --- */}
        {showPasswordModal && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)}></div>
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative z-10 shadow-2xl animate-in zoom-in-95">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-600">
                            <IconLock size={24}/>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">ยืนยันตัวตน</h3>
                        <p className="text-sm text-slate-500">กรุณากรอกรหัสผ่านเพื่อแก้ไขข้อมูลการเงิน</p>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800"
                                placeholder="รหัสผ่านของคุณ"
                                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                            />
                            <button 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <IconEyeOff size={18}/> : <IconEye size={18}/>}
                            </button>
                        </div>
                        
                        {errorMsg && <p className="text-xs text-red-500 font-bold text-center bg-red-50 p-2 rounded-lg">{errorMsg}</p>}

                        <div className="flex gap-2">
                            <button onClick={() => { setShowPasswordModal(false); setErrorMsg(''); setPasswordInput(''); }} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">ยกเลิก</button>
                            <button 
                                onClick={handleVerifyPassword} 
                                disabled={verifying || !passwordInput}
                                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {verifying ? 'กำลังตรวจสอบ...' : 'ยืนยัน'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}