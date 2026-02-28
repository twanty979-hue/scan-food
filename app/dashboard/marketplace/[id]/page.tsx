'use client';

import { useState, useRef } from 'react';
import Script from 'next/script';
import { useThemeDetail } from '@/hooks/useThemeDetail';
import { createCreditCardCharge } from '@/app/actions/omiseActions';
import { installThemeAction } from '@/app/actions/marketplaceDetailActions';

// --- Icons ---
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IconMobile = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>;
const IconTablet = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconShare = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IconX = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconClock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconQr = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const IconCreditCard = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IconInfo = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;

declare global { interface Window { Omise: any; } }

type PlanType = 'weekly' | 'monthly' | 'yearly';

export default function ThemeDetailPage() {
    const {
        theme, loading, ownership, processing, userRole,
        viewMode, setViewMode, activeImage, setActiveImage, displayImages,
        getImageUrl, handleGetTheme, handleShare, router,
        showPaymentModal, qrCode, paymentStatus, closePaymentModal,
        alertModal, closeAlertModal
    } = useThemeDetail();

    const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
    const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'credit_card'>('promptpay');
    const [ccLoading, setCcLoading] = useState(false);
    
    const cardNumberRef = useRef<HTMLInputElement>(null);
    const cardNameRef = useRef<HTMLInputElement>(null);
    const cardExpiryRef = useRef<HTMLInputElement>(null);
    const cardCvcRef = useRef<HTMLInputElement>(null);

    const getCurrentPrice = () => {
        if (!theme) return 0;
        switch (selectedPlan) {
            case 'weekly': return theme.price_weekly ?? 0;
            case 'monthly': return theme.price_monthly ?? 0;
            case 'yearly': return theme.price_yearly ?? 0;
            default: return 0;
        }
    };

    const currentPrice = getCurrentPrice();

    const handlePurchaseClick = () => {
        handleGetTheme(selectedPlan);
    };

    const handleCreditCardPaymentInternal = async (e: React.FormEvent) => {
        e.preventDefault();
        setCcLoading(true);
        try {
            window.Omise.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY);
            const cardData = {
                name: cardNameRef.current?.value,
                number: cardNumberRef.current?.value?.replace(/\s/g, ''),
                expiration_month: cardExpiryRef.current?.value?.split('/')[0].trim(),
                expiration_year: cardExpiryRef.current?.value?.split('/')[1].trim(),
                security_code: cardCvcRef.current?.value,
            };

            window.Omise.createToken('card', cardData, async (status: number, resp: any) => {
                if (status === 200) {
                    const res = await createCreditCardCharge(currentPrice, resp.id, theme.id, selectedPlan);
                    if (res.success) {
                        await installThemeAction(theme.id, res.chargeId ?? null, selectedPlan);
                        window.location.reload();
                    } else {
                        alert(res.error || "Payment failed");
                    }
                } else {
                    alert(resp.message || "Card validation failed");
                }
                setCcLoading(false);
            });
        } catch (err) {
            setCcLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-medium tracking-wide">Loading...</div>;
    if (!theme) return <div className="min-h-screen flex items-center justify-center text-red-500 font-medium">Theme not found</div>;

    const isActive = ownership.isOwned && !ownership.isExpired;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
            <Script src="https://cdn.omise.co/omise.js" strategy="lazyOnload" />
            
            {/* Navbar */}
            <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    <button onClick={() => router.push('/dashboard/marketplace')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-xs md:text-sm font-bold bg-slate-100/50 px-3 py-1.5 rounded-lg active:scale-95">
                        <IconArrowLeft /> Back
                    </button>
                    <button onClick={handleShare} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all active:scale-95">
                        <IconShare />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">
                
                {/* --- Left: Preview Gallery --- */}
                <div className="lg:col-span-7 flex flex-col gap-6 items-center lg:sticky lg:top-24">
                     {/* View Mode Switcher */}
                     <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm w-full max-w-[300px]">
                        <button onClick={() => setViewMode('mobile')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'mobile' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <IconMobile /> Mobile
                        </button>
                        <button onClick={() => setViewMode('ipad')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'ipad' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <IconTablet /> Tablet
                        </button>
                    </div>

                    {/* ✅ Mockup Container ปรับสัดส่วนให้ iPad เป็น 3:4 (แนวตั้ง) ให้ตรงกับตอน Crop */}
                    <div className="relative w-full flex justify-center items-start min-h-[450px] md:min-h-[600px]"> 
                        <div className={`transition-all duration-500 ease-in-out relative flex justify-center w-full ${viewMode === 'mobile' ? 'max-w-[260px] md:max-w-[320px]' : 'max-w-[340px] md:max-w-[480px]'}`}>
                             
                             {/* --- Mobile View (9:19.5) --- */}
                             {viewMode === 'mobile' ? (
                                <div className="relative w-full aspect-[9/19.5]">
                                    <div className="relative h-full w-full rounded-[3.5rem] p-[3px] shadow-[0_0_2px_rgba(0,0,0,0.5),0_20px_40px_-10px_rgba(0,0,0,0.6)] border ring-1 ring-[#111] z-10 overflow-hidden bg-[#363535] border-[#555]">
                                        <div className="absolute inset-0 rounded-[3.5rem] border-[1px] border-white/20 pointer-events-none z-20"></div>
                                        <div className="relative w-full h-full bg-black rounded-[3.2rem] overflow-hidden border-[4px] border-black">
                                            {/* Notch */}
                                            <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[32%] h-[26px] bg-black rounded-full z-50 flex items-center justify-between px-2 shadow-sm pointer-events-none">
                                                <div className="w-[30%] h-[60%] bg-[#1a1a1a]/80 rounded-full blur-[0.5px]"></div>
                                                <div className="w-[20%] h-[60%] bg-[#252525]/80 rounded-full blur-[0.5px]"></div>
                                            </div>
                                            {/* Screen Content */}
                                            {activeImage ? (
                                                <img src={getImageUrl(activeImage)!} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 bg-slate-100"><div className="w-8 h-8 border-2 border-slate-700 rounded-full"></div><span className="text-xs font-medium">No Preview</span></div>
                                            )}
                                            {/* Home Bar */}
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[35%] h-1 bg-white/40 rounded-full backdrop-blur-md z-40"></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* --- Tablet View (3:4 แนวตั้งตามที่ Crop มา) --- */
                                <div className="relative w-full aspect-[3/4]">
                                    <div className="relative h-full w-full rounded-[2rem] p-[6px] shadow-2xl shadow-slate-300/50 border ring-1 ring-[#111] z-10 overflow-hidden bg-[#363535] border-[#555]">
                                        <div className="absolute inset-0 rounded-[2rem] border-[1px] border-white/20 pointer-events-none z-20"></div>
                                        <div className="relative w-full h-full bg-black rounded-[1.6rem] overflow-hidden border-[4px] border-black flex items-center justify-center">
                                            {activeImage ? (<img src={getImageUrl(activeImage)!} className="w-full h-full object-cover" alt="Preview" />) : (<span className="text-slate-600 text-xs font-medium">No Preview</span>)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ✅ Thumbnails (ปรับความสูงให้เท่ากันทั้ง 2 โหมด) */}
                    {displayImages.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-4 w-full px-4 no-scrollbar justify-start md:justify-center">
                            {displayImages.map((img, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => setActiveImage(img)} 
                                    className={`relative rounded-lg overflow-hidden transition-all duration-200 border-2 shrink-0 ${activeImage === img ? 'border-blue-600 ring-2 ring-blue-100 scale-105 shadow-md' : 'border-transparent hover:border-slate-300 opacity-80'} ${viewMode === 'mobile' ? 'w-10 md:w-12 aspect-[9/19.5]' : 'w-14 md:w-[60px] aspect-[3/4]'}`}
                                >
                                    <img src={getImageUrl(img)!} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- Right: Details & Action --- */}
                <div className="lg:col-span-5 flex flex-col space-y-6 md:space-y-8 pb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider border border-blue-100">{theme.marketplace_categories?.name}</span>
                            <span className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">{theme.theme_mode} MODE</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">{theme.name}</h1>
                        
                        {/* Price Display */}
                        <div className="mt-4">
                            {isActive ? (
                                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
                                    <div className="p-1 bg-emerald-100 rounded-full"><IconCheck /></div>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-wide">Active Subscription</p>
                                        <p className="text-xs opacity-80">Expires in {ownership.daysLeft} days</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-baseline gap-2 animate-in fade-in duration-300" key={currentPrice}>
                                    {currentPrice > 0 ? (
                                        <>
                                            <span className="text-3xl md:text-5xl font-black text-slate-900">฿{currentPrice.toLocaleString()}</span>
                                            <span className="text-slate-500 text-sm font-medium">
                                                / {selectedPlan === 'weekly' ? 'week' : selectedPlan === 'monthly' ? 'month' : 'year'}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-3xl md:text-4xl font-bold text-emerald-600">FREE</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-slate-600 leading-relaxed text-sm md:text-base">
                        {theme.description || 'Experience a modern, responsive design tailored for high conversion.'}
                    </div>

                    {/* Plan Selection */}
                    {!isActive && (
                        <div className="flex flex-col gap-3">
                            {/* 1. Weekly */}
                            {theme.price_weekly !== null && (
                                <button onClick={() => setSelectedPlan('weekly')} disabled={!userRole.isOwner} className={`relative p-4 rounded-xl border-2 text-left transition-all active:scale-95 flex justify-between items-center group ${selectedPlan === 'weekly' ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/20' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Weekly</span>
                                        <div className="text-lg font-bold text-slate-900">฿{(theme.price_weekly ?? 0).toLocaleString()} <span className="text-sm font-normal text-slate-400">/ 7 days</span></div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'weekly' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-transparent'}`}><IconCheck /></div>
                                </button>
                            )}

                            {/* 2. Monthly */}
                            {theme.price_monthly !== null && (
                                <button onClick={() => setSelectedPlan('monthly')} disabled={!userRole.isOwner} className={`relative p-4 rounded-xl border-2 text-left transition-all active:scale-95 flex justify-between items-center group ${selectedPlan === 'monthly' ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/20' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Monthly</span>
                                        <div className="text-lg font-bold text-slate-900">฿{(theme.price_monthly ?? 0).toLocaleString()} <span className="text-sm font-normal text-slate-400">/ 30 days</span></div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'monthly' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-transparent'}`}><IconCheck /></div>
                                </button>
                            )}

                            {/* 3. Yearly */}
                            {theme.price_yearly !== null && (
                                <button onClick={() => setSelectedPlan('yearly')} disabled={!userRole.isOwner} className={`relative p-4 rounded-xl border-2 text-left transition-all active:scale-95 flex justify-between items-center group ${selectedPlan === 'yearly' ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600/20' : 'border-slate-200 bg-white hover:border-emerald-300'}`}>
                                    <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">BEST VALUE</div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Yearly</span>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 rounded-sm">SAVE BIG</span>
                                        </div>
                                        <div className="text-lg font-bold text-slate-900">฿{(theme.price_yearly ?? 0).toLocaleString()} <span className="text-sm font-normal text-slate-400">/ 365 days</span></div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'yearly' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 text-transparent'}`}><IconCheck /></div>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Features List */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Included Features</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-3 text-xs md:text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 scale-90"><IconCheck /></div> Instant Installation</li>
                            <li className="flex items-center gap-3 text-xs md:text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 scale-90"><IconMobile /></div> Fully Responsive Layout</li>
                        </ul>
                    </div>

                    {/* Checkout Button */}
                    <div className="pt-2 sticky bottom-4 z-40 lg:static">
                        {isActive ? (
                            <button onClick={() => router.push('/dashboard/theme')} className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-sm uppercase tracking-widest hover:bg-slate-800 shadow-lg active:scale-95 transition-all">Go to My Themes</button>
                        ) : (
                            <button onClick={handlePurchaseClick} disabled={processing || !userRole.isOwner} className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl transition-all flex justify-center items-center gap-2 active:scale-95 ${!userRole.isOwner ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600'}`}>
                                {processing ? <span className="animate-pulse">Processing...</span> : <span>Proceed to Checkout</span>}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-t-[28px] md:rounded-[24px] shadow-2xl w-full max-w-[400px] relative animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 overflow-hidden max-h-[90vh] overflow-y-auto">
                        <button onClick={closePaymentModal} disabled={paymentStatus === 'successful'} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-0 z-20">
                            <IconX />
                        </button>
                        
                        <div className="p-6 md:p-8 flex flex-col items-center text-center gap-6">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner mb-2">
                                <IconCreditCard size={32} />
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-slate-900">Checkout</h3>
                                <p className="text-sm text-slate-500 mt-1 capitalize">{selectedPlan} Plan</p>
                                <p className="text-3xl font-black text-slate-900 mt-2">฿{currentPrice.toLocaleString()}</p>
                            </div>

                            {/* Method Switcher */}
                            <div className="grid grid-cols-2 gap-2 w-full p-1.5 bg-slate-100 rounded-xl">
                                <button onClick={() => setPaymentMethod('promptpay')} className={`py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${paymentMethod === 'promptpay' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>
                                    <IconQr size={16}/> PromptPay
                                </button>
                                <button onClick={() => setPaymentMethod('credit_card')} className={`py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${paymentMethod === 'credit_card' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>
                                    <IconCreditCard size={16}/> Card
                                </button>
                            </div>

                            <div className="w-full">
                                {paymentMethod === 'promptpay' ? (
                                    <div className="flex flex-col items-center gap-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                                            {qrCode ? (
                                                <img src={qrCode} alt="Payment QR" className="w-full aspect-square object-contain rounded-lg" />
                                            ) : (
                                                <div className="w-48 h-48 flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg animate-pulse text-xs font-bold">GENERATING QR...</div>
                                            )}
                                        </div>
                                        {paymentStatus === 'successful' ? (
                                            <div className="w-full py-3 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2"><IconCheck /> Payment Successful!</div>
                                        ) : (
                                            <div className="text-slate-400 text-xs font-bold animate-pulse uppercase tracking-wider">Waiting for scan...</div>
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={handleCreditCardPaymentInternal} className="flex flex-col gap-4 text-left w-full">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Card Number</label>
                                            <input ref={cardNumberRef} type="text" placeholder="0000 0000 0000 0000" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300" required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Cardholder Name</label>
                                            <input ref={cardNameRef} type="text" placeholder="JOHN DOE" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 uppercase transition-all placeholder:text-slate-300" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Expiry</label>
                                                <input ref={cardExpiryRef} type="text" placeholder="MM/YY" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300" required />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">CVC</label>
                                                <input ref={cardCvcRef} type="tel" placeholder="123" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300" required />
                                            </div>
                                        </div>
                                        <button type="submit" disabled={ccLoading} className="mt-4 w-full py-4 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-slate-200">
                                            {ccLoading ? 'Processing Payment...' : `Pay ฿${currentPrice.toLocaleString()}`}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}