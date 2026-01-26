'use client';

import { useThemeDetail } from '@/hooks/useThemeDetail';

// --- Professional Icons ---
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IconMobile = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>;
const IconTablet = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconShare = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IconX = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconLock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconShield = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconClock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconInfinity = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c-2.828-2.828-5.657-2.828-8.485 0-2.829 2.829-2.829 5.657 0 8.485 2.828 2.828 5.657 2.828 8.485 0M12 12c2.828 2.828 5.657 2.828 8.485 0 2.829-2.829 2.829-5.657 0-8.485-2.828-2.828-5.657-2.828-8.485 0"/></svg>;
const IconCreditCard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;

export default function ThemeDetailPage() {
    const {
        theme, loading, ownership, processing, userRole,
        viewMode, setViewMode, activeImage, setActiveImage, displayImages,
        getImageUrl, handleGetTheme, handleShare, router,
        showPaymentModal, qrCode, paymentStatus, closePaymentModal,
        selectedPlan, setSelectedPlan
    } = useThemeDetail();

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-medium tracking-wide">Loading resources...</div>;
    if (!theme) return <div className="min-h-screen flex items-center justify-center text-red-500 font-medium">Theme not found</div>;

    const currentPrice = selectedPlan === 'monthly' ? (theme.price_monthly ?? 0) : (theme.price_lifetime ?? 0);
    const isLifetimeOwner = ownership.isOwned && ownership.type === 'lifetime';
    const isActiveMonthly = ownership.isOwned && ownership.type === 'monthly' && !ownership.isExpired;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
            
            {/* Navbar */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => router.push('/dashboard/marketplace')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
                        <IconArrowLeft /> Back to Marketplace
                    </button>
                    <button onClick={handleShare} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all">
                        <IconShare />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                
                {/* --- Left: Preview Gallery --- */}
                <div className="lg:col-span-7 flex flex-col gap-8 items-center sticky top-28">
                    
                    {/* View Toggle */}
                    <div className="bg-white p-1 rounded-lg border border-slate-200 flex shadow-sm">
                        <button onClick={() => setViewMode('mobile')} className={`px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${viewMode === 'mobile' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <IconMobile /> Mobile View
                        </button>
                        <button onClick={() => setViewMode('ipad')} className={`px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${viewMode === 'ipad' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <IconTablet /> Tablet View
                        </button>
                    </div>

                    {/* Device Frame */}
                    <div className="relative w-full flex justify-center items-center h-[600px]"> 
                        <div className={`transition-all duration-500 ease-in-out relative ${viewMode === 'mobile' ? 'w-[300px] h-[600px]' : 'w-[800px] h-[600px]'}`}>
                            {viewMode === 'mobile' ? (
                                <div className="relative w-full h-full bg-slate-900 rounded-[3.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-[6px] border-slate-900 overflow-hidden ring-1 ring-slate-900/50">
                                    <div className="absolute inset-0 bg-black rounded-[3.2rem] overflow-hidden">
                                        {activeImage ? (
                                            <img src={getImageUrl(activeImage)!} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Preview" />
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2"><div className="w-8 h-8 border-2 border-slate-700 rounded-full"></div><span className="text-xs font-medium">No Preview</span></div>
                                        )}
                                    </div>
                                    {/* Dynamic Island */}
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[30%] h-[24px] bg-black rounded-full z-20"></div>
                                </div>
                            ) : (
                                <div className="relative w-full h-full bg-slate-900 rounded-[2rem] shadow-2xl border-[8px] border-slate-900 overflow-hidden">
                                    <div className="h-full w-full bg-black flex items-center justify-center relative">
                                        {activeImage ? (<img src={getImageUrl(activeImage)!} className="w-full h-full object-contain" alt="Preview" />) : (<span className="text-slate-600 text-xs font-medium">No Preview</span>)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {displayImages.length > 0 && (
                        <div className="flex flex-wrap gap-3 justify-center mt-2">
                            {displayImages.map((img, idx) => (
                                <button key={idx} onClick={() => setActiveImage(img)} className={`relative rounded-xl overflow-hidden transition-all duration-200 border-2 ${activeImage === img ? 'border-blue-600 ring-2 ring-blue-100 scale-105' : 'border-transparent hover:border-slate-300 opacity-70 hover:opacity-100'} ${viewMode === 'mobile' ? 'w-12 h-20' : 'w-20 h-16'}`}>
                                    <img src={getImageUrl(img)!} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- Right: Details & Action --- */}
                <div className="lg:col-span-5 flex flex-col justify-center space-y-8 py-4">
                    
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">{theme.marketplace_categories?.name}</span>
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{theme.theme_mode} MODE</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">{theme.name}</h1>
                        
                        {/* Status / Price Display */}
                        <div className="mt-4">
                            {isLifetimeOwner ? (
                                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
                                    <div className="p-1 bg-emerald-100 rounded-full"><IconCheck /></div>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-wide">Lifetime License Owned</p>
                                        <p className="text-xs opacity-80">You have full access to this theme forever.</p>
                                    </div>
                                </div>
                            ) : isActiveMonthly ? (
                                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl">
                                    <div className="p-1 bg-blue-100 rounded-full"><IconClock /></div>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-wide">Monthly Plan Active</p>
                                        <p className="text-xs opacity-80">Expires in {ownership.daysLeft} days. Renew to continue.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-baseline gap-2">
                                    {currentPrice > 0 ? (
                                        <>
                                            <span className="text-4xl font-bold text-slate-900">฿{currentPrice.toLocaleString()}</span>
                                            <span className="text-slate-500 text-sm font-medium">/ {selectedPlan === 'monthly' ? 'month' : 'lifetime'}</span>
                                        </>
                                    ) : (
                                        <span className="text-4xl font-bold text-emerald-600">FREE</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-slate-600 leading-relaxed text-base">
                        {theme.description || 'Experience a modern, responsive design tailored for high conversion. Perfect for restaurants and retail stores.'}
                    </div>

                    {/* Plan Selection Grid */}
                    {!isLifetimeOwner && (
                        <div className="grid grid-cols-2 gap-4">
                            {/* Monthly Option */}
                            <button 
                                onClick={() => setSelectedPlan('monthly')}
                                disabled={!userRole.isOwner}
                                className={`relative p-5 rounded-xl border-2 text-left transition-all group ${selectedPlan === 'monthly' ? 'border-blue-600 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-slate-300'} ${!userRole.isOwner && 'opacity-60 cursor-not-allowed'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly</span>
                                    {selectedPlan === 'monthly' && <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center"><IconCheck /></div>}
                                </div>
                                <div className="text-lg font-bold text-slate-900">฿{(theme.price_monthly ?? 0).toLocaleString()}</div>
                                <div className="text-xs text-slate-500 mt-1">Billed every 30 days</div>
                                {isActiveMonthly && <div className="mt-2 text-[10px] font-bold text-blue-600 bg-blue-100 inline-block px-2 py-0.5 rounded">Extend Plan</div>}
                            </button>

                            {/* Lifetime Option */}
                            <button 
                                onClick={() => setSelectedPlan('lifetime')}
                                disabled={!userRole.isOwner}
                                className={`relative p-5 rounded-xl border-2 text-left transition-all group ${selectedPlan === 'lifetime' ? 'border-emerald-600 bg-emerald-50/30' : 'border-slate-200 bg-white hover:border-slate-300'} ${!userRole.isOwner && 'opacity-60 cursor-not-allowed'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lifetime</span>
                                    {selectedPlan === 'lifetime' && <div className="w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center text-white"><IconCheck /></div>}
                                </div>
                                <div className="text-lg font-bold text-slate-900">฿{(theme.price_lifetime ?? 0).toLocaleString()}</div>
                                <div className="text-xs text-slate-500 mt-1">One-time payment</div>
                                {isActiveMonthly && <div className="mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-100 inline-block px-2 py-0.5 rounded">Upgrade & Save</div>}
                            </button>
                        </div>
                    )}

                    {/* Features List */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Included Features</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><IconCheck /></div>
                                Instant Installation & Activation
                            </li>
                            <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><IconMobile /></div>
                                Fully Responsive (Mobile & Tablet Optimized)
                            </li>
                            <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><IconShield /></div>
                                Regular Updates & Security Patches
                            </li>
                        </ul>
                    </div>

                    {/* Primary Action Button */}
                    <div className="pt-2">
                        {isLifetimeOwner ? (
                            <button 
                                onClick={() => router.push('/dashboard/theme')}
                                className="w-full py-4 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm uppercase tracking-widest border border-slate-200 hover:bg-slate-200 hover:text-slate-800 transition-all flex justify-center items-center gap-2"
                            >
                                Go to My Themes
                            </button>
                        ) : (
                            <button 
                                onClick={handleGetTheme}
                                disabled={processing || !userRole.isOwner}
                                className={`
                                    w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg transition-all flex justify-center items-center gap-3
                                    ${!userRole.isOwner 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200' 
                                        : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-blue-300 hover:-translate-y-1 active:scale-95 active:translate-y-0'
                                    }
                                `}
                            >
                                {processing ? (
                                    <span className="animate-pulse">Processing Payment...</span>
                                ) : (
                                    !userRole.isOwner ? (
                                        <span className="flex items-center gap-2"><IconLock /> Owner Access Required</span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            {isActiveMonthly && selectedPlan === 'monthly' ? 'Extend Subscription' : 'Proceed to Checkout'} 
                                            <IconArrowLeft />
                                        </span>
                                    )
                                )}
                            </button>
                        )}
                        
                        {!userRole.isOwner && !isLifetimeOwner && (
                            <p className="text-center text-[10px] font-medium text-slate-400 mt-4 bg-slate-100 py-2 rounded-lg">
                                * Only the store owner can perform purchases.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* 💰 Payment Modal (Cleaned Up) */}
            {showPaymentModal && qrCode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-[24px] shadow-2xl max-w-sm w-full mx-4 relative animate-in zoom-in-95 duration-300">
                        <button onClick={closePaymentModal} disabled={paymentStatus === 'successful'} className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-0"><IconX /></button>
                        
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="bg-blue-50 text-blue-600 p-4 rounded-full mb-1">
                                <IconCreditCard />
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Scan to Pay</h3>
                                <p className="text-sm text-slate-500 mt-1">Use your banking app to scan the QR code.</p>
                            </div>

                            <div className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase">{selectedPlan} Plan</span>
                                <span className="text-lg font-bold text-slate-900">฿{currentPrice.toLocaleString()}</span>
                            </div>

                            <div className="p-3 border border-slate-100 rounded-2xl bg-white shadow-sm">
                                <img src={qrCode} alt="Payment QR" className="w-60 h-60 object-contain rounded-xl" />
                            </div>

                            <div className="mt-2 w-full">
                                {paymentStatus === 'successful' ? (
                                    <div className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                                        <IconCheck /> Payment Successful!
                                    </div>
                                ) : (
                                    <div className="w-full py-3 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div> Waiting for payment...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}