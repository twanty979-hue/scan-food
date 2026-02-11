'use client';

import { useState, useRef } from 'react';
import Script from 'next/script';
import { useThemeDetail } from '@/hooks/useThemeDetail';
// ✅ Import Actions (Path เดิม)
import { createCreditCardCharge } from '@/app/actions/omiseActions';
import { installThemeAction } from '@/app/actions/marketplaceDetailActions';

// --- Icons (คงเดิม) ---
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IconMobile = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>;
const IconTablet = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconShare = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IconX = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconLock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconShield = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconClock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconInfo = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const IconQr = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const IconCreditCard = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;

declare global { interface Window { Omise: any; } }

export default function ThemeDetailPage() {
    const {
        theme, loading, ownership, processing, userRole,
        viewMode, setViewMode, activeImage, setActiveImage, displayImages,
        getImageUrl, handleGetTheme, handleShare, router,
        showPaymentModal, qrCode, paymentStatus, closePaymentModal,
        selectedPlan, setSelectedPlan,
        alertModal, closeAlertModal
    } = useThemeDetail();

    const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'credit_card'>('promptpay');
    const [ccLoading, setCcLoading] = useState(false);
    
    const cardNumberRef = useRef<HTMLInputElement>(null);
    const cardNameRef = useRef<HTMLInputElement>(null);
    const cardExpiryRef = useRef<HTMLInputElement>(null);
    const cardCvcRef = useRef<HTMLInputElement>(null);

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

    const currentPrice = selectedPlan === 'monthly' ? (theme.price_monthly ?? 0) : (theme.price_lifetime ?? 0);
    const isLifetimeOwner = ownership.isOwned && ownership.type === 'lifetime';
    const isActiveMonthly = ownership.isOwned && ownership.type === 'monthly' && !ownership.isExpired;

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

                    {/* Mockup Container */}
                    <div className="relative w-full flex justify-center items-start min-h-[450px] md:min-h-[600px]"> 
                        <div className={`transition-all duration-500 ease-in-out relative ${viewMode === 'mobile' ? 'w-[260px] md:w-[340px]' : 'w-full max-w-[600px] lg:max-w-[800px]'}`}>
                            {viewMode === 'mobile' ? (
                                <div className="relative w-full aspect-[9/19.5]">
                                    <div className="relative h-full w-full rounded-[2.5rem] md:rounded-[3.5rem] p-[3px] md:p-[4px] shadow-2xl shadow-slate-300/50 border ring-1 ring-[#111] z-10 overflow-hidden bg-[#363535] border-[#555]">
                                        <div className="absolute inset-0 rounded-[2.5rem] md:rounded-[3.5rem] border-[1px] border-white/20 pointer-events-none z-20"></div>
                                        <div className="relative w-full h-full bg-black rounded-[2.3rem] md:rounded-[3.2rem] overflow-hidden border-[3px] md:border-[4px] border-black">
                                            <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[30%] h-[24px] bg-black rounded-full z-50 shadow-sm pointer-events-none"></div>
                                            {activeImage ? (
                                                <img src={getImageUrl(activeImage)!} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 bg-slate-100"><div className="w-8 h-8 border-2 border-slate-700 rounded-full"></div><span className="text-xs font-medium">No Preview</span></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-full aspect-[4/3]">
                                    <div className="relative h-full w-full rounded-[2rem] p-[4px] shadow-2xl shadow-slate-300/50 border ring-1 ring-[#111] z-10 overflow-hidden bg-[#363535] border-[#555]">
                                        <div className="relative w-full h-full bg-black rounded-[1.8rem] overflow-hidden border-[4px] border-black flex items-center justify-center">
                                            {activeImage ? (<img src={getImageUrl(activeImage)!} className="w-full h-full object-cover" alt="Preview" />) : (<span className="text-slate-600 text-xs font-medium">No Preview</span>)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {displayImages.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-4 w-full px-4 no-scrollbar justify-start md:justify-center">
                            {displayImages.map((img, idx) => (
                                <button key={idx} onClick={() => setActiveImage(img)} className={`relative rounded-lg overflow-hidden transition-all duration-200 border-2 shrink-0 ${activeImage === img ? 'border-blue-600 ring-2 ring-blue-100 scale-105' : 'border-transparent hover:border-slate-300 opacity-80'} ${viewMode === 'mobile' ? 'w-10 h-16' : 'w-16 h-12'}`}>
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
                        
                        <div className="mt-4">
                            {isLifetimeOwner ? (
                                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
                                    <div className="p-1 bg-emerald-100 rounded-full"><IconCheck /></div>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-wide">Lifetime License Owned</p>
                                    </div>
                                </div>
                            ) : isActiveMonthly ? (
                                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl">
                                    <div className="p-1 bg-blue-100 rounded-full"><IconClock /></div>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-wide">Monthly Active</p>
                                        <p className="text-xs opacity-80">Expires in {ownership.daysLeft} days</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-baseline gap-2">
                                    {currentPrice > 0 ? (
                                        <>
                                            <span className="text-3xl md:text-4xl font-bold text-slate-900">฿{currentPrice.toLocaleString()}</span>
                                            <span className="text-slate-500 text-xs md:text-sm font-medium">/ {selectedPlan === 'monthly' ? 'month' : 'lifetime'}</span>
                                        </>
                                    ) : (
                                        <span className="text-3xl md:text-4xl font-bold text-emerald-600">FREE</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-slate-600 leading-relaxed text-sm md:text-base">
                        {theme.description || 'Experience a modern, responsive design tailored for high conversion. Perfect for restaurants and retail stores.'}
                    </div>

                    {!isLifetimeOwner && (
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <button onClick={() => setSelectedPlan('monthly')} disabled={!userRole.isOwner} className={`relative p-3 md:p-5 rounded-xl border-2 text-left transition-all active:scale-95 ${selectedPlan === 'monthly' ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600/20' : 'border-slate-200 bg-white'} ${!userRole.isOwner && 'opacity-60 cursor-not-allowed'}`}>
                                <div className="flex justify-between items-start mb-1 md:mb-2">
                                    <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly</span>
                                    {selectedPlan === 'monthly' && <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white scale-75 md:scale-100"><IconCheck /></div>}
                                </div>
                                <div className="text-base md:text-lg font-bold text-slate-900">฿{(theme.price_monthly ?? 0).toLocaleString()}</div>
                            </button>

                            <button onClick={() => setSelectedPlan('lifetime')} disabled={!userRole.isOwner} className={`relative p-3 md:p-5 rounded-xl border-2 text-left transition-all active:scale-95 ${selectedPlan === 'lifetime' ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600/20' : 'border-slate-200 bg-white'} ${!userRole.isOwner && 'opacity-60 cursor-not-allowed'}`}>
                                <div className="flex justify-between items-start mb-1 md:mb-2">
                                    <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Lifetime</span>
                                    {selectedPlan === 'lifetime' && <div className="w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center text-white scale-75 md:scale-100"><IconCheck /></div>}
                                </div>
                                <div className="text-base md:text-lg font-bold text-slate-900">฿{(theme.price_lifetime ?? 0).toLocaleString()}</div>
                            </button>
                        </div>
                    )}

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Included Features</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-3 text-xs md:text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 scale-90"><IconCheck /></div> Instant Installation</li>
                            <li className="flex items-center gap-3 text-xs md:text-sm font-medium text-slate-700"><div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 scale-90"><IconMobile /></div> Fully Responsive</li>
                        </ul>
                    </div>

                    <div className="pt-2 sticky bottom-4 z-40 lg:static">
                        {isLifetimeOwner ? (
                            <button onClick={() => router.push('/dashboard/theme')} className="w-full py-3.5 md:py-4 rounded-xl bg-slate-900 text-white font-bold text-sm uppercase tracking-widest hover:bg-slate-800 shadow-lg active:scale-95 transition-all">Go to My Themes</button>
                        ) : (
                            <button onClick={handleGetTheme} disabled={processing || !userRole.isOwner} className={`w-full py-3.5 md:py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl transition-all flex justify-center items-center gap-2 active:scale-95 ${!userRole.isOwner ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600'}`}>
                                {processing ? <span className="animate-pulse">Processing...</span> : <span>Proceed to Checkout <IconArrowLeft /></span>}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ Payment Modal (ปรับปรุงใหม่ ให้สวยและเต็มจอในมือถือ) */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
                    {/* Modal Box */}
                    <div className="bg-white rounded-t-[28px] md:rounded-[24px] shadow-2xl w-full max-w-[400px] relative animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 overflow-hidden max-h-[90vh] overflow-y-auto">
                        
                        {/* Close Button */}
                        <button onClick={closePaymentModal} disabled={paymentStatus === 'successful'} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-0 z-20">
                            <IconX />
                        </button>
                        
                        <div className="p-6 md:p-8 flex flex-col items-center text-center gap-6">
                            
                            {/* Icon Header */}
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner mb-2">
                                <IconCreditCard size={32} />
                            </div>

                            {/* Title & Price */}
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Checkout</h3>
                                <p className="text-sm text-slate-500 mt-1">Total to pay</p>
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

                            {/* Content Area */}
                            <div className="w-full">
                                {paymentMethod === 'promptpay' ? (
                                    <div className="flex flex-col items-center gap-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                                            {qrCode ? (
                                                <img src={qrCode} alt="Payment QR" className="w-full aspect-square object-contain rounded-lg" />
                                            ) : (
                                                <div className="w-48 h-48 flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg animate-pulse text-xs font-bold">
                                                    GENERATING QR...
                                                </div>
                                            )}
                                        </div>
                                        {paymentStatus === 'successful' ? (
                                            <div className="w-full py-3 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                                                <IconCheck /> Payment Successful!
                                            </div>
                                        ) : (
                                            <div className="text-slate-400 text-xs font-bold animate-pulse uppercase tracking-wider">Waiting for scan...</div>
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={handleCreditCardPaymentInternal} className="flex flex-col gap-4 text-left w-full animate-in slide-in-from-bottom-2 duration-300">
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

            {/* Alert Modal */}
            {alertModal.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-6">
                    <div className="bg-white p-6 rounded-[24px] shadow-2xl max-w-sm w-full relative animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
                        <div className={`p-4 rounded-full mb-4 ${alertModal.type === 'success' ? 'bg-emerald-100 text-emerald-600' : alertModal.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                            {alertModal.type === 'success' ? <IconCheck /> : alertModal.type === 'error' ? <IconX /> : <IconInfo />}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">{alertModal.title}</h3>
                        <p className="text-sm text-slate-500 mb-8 px-2 leading-relaxed">{alertModal.message}</p>
                        
                        <div className="flex gap-3 w-full">
                            {alertModal.type === 'confirm' ? (
                                <>
                                    <button onClick={closeAlertModal} className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                                    <button onClick={alertModal.onConfirm} className="flex-1 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg">Confirm</button>
                                </>
                            ) : (
                                <button onClick={() => { if(alertModal.onConfirm) alertModal.onConfirm(); else closeAlertModal(); }} className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg active:scale-95">
                                    {alertModal.type === 'success' ? 'Continue' : 'Close'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}