import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Adapted for Pink Theme) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />, 
    menu: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    basket: <path d="M5 8h14l-2 13H7L5 8zm7-6v6" />,
    clock: <circle cx="12" cy="12" r="10" strokeWidth="3" />,
    chef: <path d="M12 2C7 2 2 7 2 12s5 10 10 10 10-5 10-10S17 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    flame: <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />, 
    shield: <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z" />,
    paw: <path d="M12 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1 3-3m5.5 3a2.5 2.5 0 0 1 2.5 2.5 2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1-2.5-2.5m-11 0a2.5 2.5 0 0 1 2.5 2.5 2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1-2.5-2.5" />,
    bolt: <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z" />
  };

  const content = (icons as any)[name] || icons.home;
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {content}
      {name === 'search' && <path d="m21 21-4.3-4.3" />}
      {name === 'basket' && <path d="M12 2v6" />}
      {name === 'clock' && <circle cx="12" cy="12" r="3" />}
    </svg>
  );
};

export default function App({ state, actions, helpers }: any) {
  const {
    loading, isVerified, activeTab, brand, tableLabel,
    banners, currentBannerIndex, categories, selectedCategoryId,
    products, filteredProducts, selectedProduct,
    cart, cartTotal, ordersList
  } = state || {}; 

  const {
    setActiveTab, setSelectedCategoryId, setSelectedProduct,
    handleAddToCart, updateQuantity, handleCheckout
  } = actions || {};

  const {
    calculatePrice, getMenuUrl, getBannerUrl
  } = helpers || {};

  // Local state
  const [variant, setVariant] = useState('normal'); 
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCookNow, setPendingCookNow] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setVariant('normal');
      setQty(1);
      setNote("");
    }
  }, [selectedProduct]);

  // --- 🔥 AUTO-CHECKOUT LOGIC ---
  const prevCartLength = useRef(cart?.length || 0);

  useEffect(() => {
    if (pendingCookNow) {
        if (cart?.length > prevCartLength.current) {
             handleCheckout();
             setPendingCookNow(false);
        }
        const timer = setTimeout(() => {
             if(pendingCookNow) {
                 handleCheckout(); 
                 setPendingCookNow(false);
             }
        }, 1000);
        return () => clearTimeout(timer);
    }
    prevCartLength.current = cart?.length || 0;
  }, [cart, pendingCookNow, handleCheckout]);


  if (loading && !isVerified) return <div className="min-h-screen bg-[#fff1f2] flex items-center justify-center text-[#f472b6] font-black text-2xl animate-pulse pink-font">STARTING UP...</div>;

  const currentPriceObj = selectedProduct 
    ? calculatePrice(selectedProduct, variant) 
    : { final: 0 };

  const handleAdd = (addToCartOnly = true) => {
    if (!selectedProduct) return;
    if (addToCartOnly) {
        for(let i=0; i<qty; i++) handleAddToCart(selectedProduct, variant, note);
        setSelectedProduct(null);
    } else {
        if (cart && cart.length > 0) setShowConfirm(true); 
        else performCookNow();
    }
  };

  const performCookNow = () => {
    for(let i=0; i<qty; i++) handleAddToCart(selectedProduct, variant, note);
    setPendingCookNow(true);
    setSelectedProduct(null);
  };

  return (
    // Theme: Pink Panther / Elegant
    <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-slate-700 bg-transparent">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Mali:wght@400;600;700&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                /* Pink Panther Palette */
                --pink-primary: #f472b6; /* Classic Pink */
                --pink-dark: #be185d;
                --pink-light: #fbcfe8;
                --bg-elegant: #fff1f2;
                --text-charcoal: #334155;
                --gold-accent: #facc15;
            }

            body {
                font-family: 'Inter', 'Sarabun', sans-serif;
                background-color: var(--bg-elegant);
                /* ✅ 1. Simple Polka Dot Background */
                background-image: radial-gradient(#f9a8d4 2.5px, transparent 2.5px);
                background-size: 24px 24px;
                background-attachment: fixed;
                -webkit-tap-highlight-color: transparent;
                color: var(--text-charcoal);
            }

            h1, h2, h3, .pink-font {
                font-family: 'Mali', cursive;
                font-weight: 700;
            }

            /* --- ✨ 3. NEW ANIMATIONS --- */
            
            /* Slide & Fade */
            @keyframes pink-slide {
                0% { transform: translateY(20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            .animate-pink-smooth {
                animation: pink-slide 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            /* Float (for header icon) */
            @keyframes float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-10px) rotate(5deg); }
            }
            .animate-float {
                animation: float 4s ease-in-out infinite;
            }

            /* Wiggle (for cart & clock) */
            @keyframes wiggle {
                0%, 100% { transform: rotate(-8deg); }
                50% { transform: rotate(8deg); }
            }
            .animate-wiggle {
                animation: wiggle 0.5s ease-in-out infinite;
            }

            /* Pulse Glow (for table badge) */
            @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
            }
            .animate-pulse-glow {
                animation: pulse-glow 2s infinite;
            }

            @keyframes pop-image {
                0% { opacity: 0; transform: scale(0.8) translateY(10px); }
                70% { transform: scale(1.05); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-image-pop { animation: pop-image 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }

            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.6s ease-out; }

            /* Item Card - Sophisticated Minimalist Style */
            .item-card {
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                position: relative;
                background: white;
                border-radius: 2rem;
                border: 2px solid white;
                box-shadow: 0 10px 25px -5px rgba(244, 114, 182, 0.15);
                overflow: hidden;
            }
            
            .item-card:hover, .item-card:active {
                transform: translateY(-8px) scale(1.02);
                border-color: var(--pink-primary);
                box-shadow: 0 20px 40px -10px rgba(244, 114, 182, 0.4);
            }

            .btn-pink {
                background: linear-gradient(135deg, var(--pink-primary) 0%, var(--pink-dark) 100%);
                color: white;
                border-radius: 9999px; /* Pill shape */
                font-weight: 600;
                box-shadow: 0 8px 20px rgba(244, 114, 182, 0.3);
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                border: 2px solid white;
            }
            
            .btn-pink:active {
                transform: scale(0.9);
                box-shadow: 0 2px 5px rgba(244, 114, 182, 0.5);
            }

            .tab-active {
                background: var(--pink-primary) !important;
                color: white !important;
                box-shadow: 0 8px 15px rgba(244, 114, 182, 0.3);
                transform: translateY(-2px);
                border-radius: 1.5rem;
                border-color: transparent;
            }
            
            .tab-btn {
                transition: all 0.4s;
                background: white;
                color: var(--pink-primary);
                border: 1px solid var(--pink-light);
                border-radius: 1.5rem;
            }
            .tab-btn:active { transform: scale(0.9); }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header --- */}
        <header className="bg-pink-600 text-white pt-10 pb-16 px-6 md:px-10 rounded-b-[3rem] relative overflow-hidden shadow-2xl z-10 border-b-4 border-white">
             {/* Decorative Circles */}
             <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
             <div className="absolute top-20 -left-10 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div className="animate-pink-smooth">
                     {/* 🔴 CHANGE 1: Removed 'animate-wiggle' from Table label */}
                     <div className="flex items-center gap-2 mb-2 bg-black/20 w-fit px-4 py-1 rounded-full border border-white/40 backdrop-blur-sm shadow-sm">
                         <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse-glow"></span>
                         <p className="text-white text-[10px] font-bold tracking-widest pink-font uppercase">Table: {tableLabel}</p>
                     </div>
                     <h1 className="text-2xl md:text-4xl pink-font font-bold tracking-tight leading-none mt-2 text-white drop-shadow-md">
                         {brand?.name || "The Pink Kitchen"}
                     </h1>
                 </div>
                 {/* Icon Badge - Animated Float */}
                 <div className="w-16 h-16 bg-white rounded-full border-4 border-white/50 flex items-center justify-center relative shadow-lg animate-float">
                     <Icon name="chef" size={32} className="text-pink-500" />
                 </div>
             </div>
        </header>

        <main className="px-5 md:px-8 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade-in">
                    {/* Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-52 md:h-72 lg:h-80 bg-white rounded-3xl overflow-hidden shadow-xl mb-10 border-4 border-white p-1 group animate-image-pop">
                             <div className="h-full w-full rounded-2xl overflow-hidden relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" 
                                 />
                                 <div className="absolute inset-0 bg-gradient-to-t from-pink-900/40 to-transparent"></div>
                             </div>
                             <div className="absolute bottom-4 left-4 bg-white/95 text-pink-600 px-6 py-2 rounded-full shadow-lg border border-pink-100 animate-pink-smooth" style={{animationDelay: '0.2s'}}>
                                 <span className="pink-font text-xs font-bold uppercase tracking-widest flex items-center gap-2">Delicious Picks! <Icon name="flame" size={12} /></span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-1 animate-pink-smooth" style={{animationDelay: '0.1s'}}>
                         <div className="bg-white/60 p-2 px-4 rounded-xl backdrop-blur-sm">
                             <h2 className="text-2xl pink-font text-slate-800">Recommended</h2>
                             <p className="text-xs text-slate-400 font-medium ml-1">Chef's special selection</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-white text-pink-500 px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-pink-50 transition-all border border-pink-100 shadow-sm active:scale-95 group">
                             See Menu <Icon name="menu" size={14} className="group-hover:rotate-12 transition-transform"/>
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-pink-50">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md pink-font animate-pulse">
                                                 SALE
                                             </div>
                                         )}
                                     </div>
                                     <div className="p-5 bg-white">
                                         <h3 className="font-bold text-slate-700 text-sm line-clamp-2 mb-2 leading-snug pink-font">{p.name}</h3>
                                         <div className="flex justify-between items-end">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-slate-400 line-through decoration-pink-300 decoration-2">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-pink-600 font-black text-lg pink-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all shadow-sm active:scale-90">
                                                 <Icon name="plus" size={14} strokeWidth={3} />
                                             </button>
                                         </div>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- MENU PAGE --- */}
            {activeTab === 'menu' && (
                <section className="animate-fade-in pt-4">
                    <div className="relative mb-8 group animate-image-pop">
                         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                             <Icon name="search" className="text-pink-300 group-focus-within:text-pink-500 transition-colors" />
                         </div>
                         <input type="text" placeholder="Search for something yummy..." className="w-full pl-14 pr-8 py-4 rounded-full bg-white border-2 border-pink-100 text-slate-700 placeholder:text-pink-200 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50 transition-all text-lg font-medium shadow-sm" />
                    </div>

                    <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar py-2 px-1 animate-pink-smooth" style={{animationDelay: '0.1s'}}>
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-2 text-sm font-bold pink-font ${selectedCategoryId === c.id ? 'tab-active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-pink-50">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-slate-700 text-sm line-clamp-2 mb-2 leading-snug pink-font">{p.name}</h3>
                                         <div className="flex justify-between items-end">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-slate-400 line-through decoration-pink-300 decoration-2">{pricing.original}</span>}
                                                 <span className="text-pink-600 font-black text-lg pink-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all shadow-sm active:scale-90">
                                                 <Icon name="plus" size={14} strokeWidth={3} />
                                             </button>
                                         </div>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- STATUS PAGE --- */}
            {activeTab === 'status' && (
                <section className="animate-fade-in pt-4 pb-24 max-w-3xl mx-auto">
                    <div className="mb-8 flex items-center justify-between bg-white p-6 border border-pink-100 rounded-3xl shadow-lg relative overflow-hidden animate-image-pop">
                         <div className="absolute -right-6 -bottom-6 text-9xl opacity-25 text-pink-300 animate-wiggle">
                            <Icon name="clock" size={120} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-2xl font-bold pink-font text-slate-800">Order History</h2>
                             <p className="text-xs text-pink-400 font-medium mt-1">Tracking your delicious meals</p>
                         </div>
                         {/* 🔴 CHANGE 2: Changed animate-pulse to animate-bounce (ดึ๋งๆ) */}
                         <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 shadow-inner animate-bounce">
                             <Icon name="clock" size={28} />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o: any, idx: any) => (
                            <div key={o.id} className="bg-white p-6 border border-pink-50 rounded-3xl shadow-sm relative overflow-hidden transition-all hover:shadow-md animate-pink-smooth" style={{animationDelay: `${idx * 0.1}s`}}>
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4 border-b border-dashed border-pink-100 pb-3">
                                     <span className="text-sm text-slate-500 font-bold pink-font flex items-center gap-1">
                                         Order #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full flex items-center gap-1.5 shadow-sm
                                         ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>
                                         {o.status === 'pending' ? 'COOKING...' : 'COMPLETED'}
                                     </span>
                                </div>

                                {/* Items */}
                                <div className="mb-4 space-y-3">
                                    {o.order_items.map((i: any, idx: any) => {
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        const hasDiscount = (i.original_price && i.original_price > i.price) || (i.discount > 0);
                                        const originalPriceTotal = hasDiscount 
                                            ? (i.original_price ? i.original_price * i.quantity : (i.price + (i.discount || 0)) * i.quantity) 
                                            : finalPriceTotal;
                                        const discountAmount = originalPriceTotal - finalPriceTotal;

                                        return (
                                            <div key={idx} className="flex justify-between items-start text-sm text-slate-600">
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-snug font-medium">
                                                        <span className="text-pink-500 font-bold">{quantity}x</span> {i.product_name}
                                                    </span>
                                                    {i.variant !== 'normal' && (
                                                        <span className="text-[10px] bg-pink-50 text-pink-600 px-2 py-0.5 rounded-md font-bold mt-1 uppercase">
                                                            {i.variant}
                                                        </span>
                                                    )}
                                                    {i.note && <span className="text-[10px] text-slate-400 italic mt-0.5">"{i.note}"</span>}
                                                </div>
                                                <div className="text-right flex flex-col items-end min-w-[80px]">
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className="text-[10px] bg-red-100 text-red-500 px-1.5 rounded-full font-bold mb-0.5">
                                                                -{discountAmount}
                                                            </span>
                                                            <span className="text-slate-900 font-bold">
                                                                {finalPriceTotal}.-
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-900 font-bold">{finalPriceTotal}.-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-pink-50">
                                     <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">TOTAL</span>
                                     <span className="font-black text-2xl pink-font text-pink-600">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-20 text-pink-300 font-bold text-xl pink-font opacity-60 animate-pulse">
                                No orders yet... <br/> Time to eat!
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Pink Capsule) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] h-[70px] bg-white/95 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(244,114,182,0.4)] flex justify-around items-center px-6 z-[100] rounded-full border border-pink-100 animate-pink-smooth" style={{animationDelay: '0.3s'}}>
             <button onClick={() => setActiveTab('home')} className={`group transition-all duration-300 ${activeTab === 'home' ? 'transform -translate-y-2' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTab === 'home' ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'text-slate-400 hover:text-pink-400'}`}>
                     <Icon name="home" size={20} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`group transition-all duration-300 ${activeTab === 'menu' ? 'transform -translate-y-2' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTab === 'menu' ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'text-slate-400 hover:text-pink-400'}`}>
                     <Icon name="menu" size={20} />
                 </div>
             </button>

             {/* Center Cart Button with Wiggle Animation */}
             <div className="relative w-14 h-14 flex items-center justify-center -mt-8">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-16 h-16 bg-gradient-to-tr from-pink-500 to-pink-400 rounded-full shadow-[0_8px_25px_rgba(244,114,182,0.5)] flex items-center justify-center text-white border-4 border-white transition-transform active:scale-95 z-20 animate-wiggle">
                     <Icon name="basket" size={24} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-yellow-400 text-pink-900 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`group transition-all duration-300 ${activeTab === 'status' ? 'transform -translate-y-2' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTab === 'status' ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'text-slate-400 hover:text-pink-400'}`}>
                     <Icon name="clock" size={20} className="animate-wiggle" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-pink-900/30 backdrop-blur-sm animate-fade-in p-0 md:items-center">
                <div className="w-full max-w-md md:max-w-lg bg-white h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] relative animate-image-pop border-t-4 border-pink-100">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-5 right-5 z-30 w-10 h-10 bg-white/80 backdrop-blur text-slate-500 rounded-full flex items-center justify-center hover:bg-pink-50 hover:text-pink-500 transition-colors shadow-sm active:scale-90">
                            <Icon name="x" size={20} strokeWidth={2.5} />
                        </button>
                        <div className="relative w-full h-80 overflow-hidden rounded-b-[2.5rem] bg-pink-50">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent pt-20">
                                <div className="flex items-end justify-between text-white animate-pink-smooth">
                                     <h2 className="text-3xl pink-font leading-tight drop-shadow-md">{selectedProduct.name}</h2>
                                     <div className="bg-white text-pink-600 px-4 py-2 rounded-2xl font-black text-xl shadow-lg pink-font min-w-fit text-center">
                                         {currentPriceObj.discount > 0 && (
                                            <div className="text-[10px] text-slate-400 line-through font-normal leading-none">{currentPriceObj.original}</div>
                                         )}
                                         {currentPriceObj.final}.-
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32 relative">
                        <div className="space-y-6 animate-pink-smooth" style={{animationDelay: '0.1s'}}>
                            
                            {/* Variants - Modern Pills */}
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-3 ml-1 tracking-wide uppercase">Select Portion</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { key: 'normal', label: 'Regular', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'Special', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'Jumbo', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-3 border transition-all flex flex-col items-center justify-center gap-1 rounded-2xl active:scale-95
                                                ${variant === v.key 
                                                    ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-md ring-1 ring-pink-500' 
                                                    : 'bg-white border-slate-100 text-slate-500 hover:border-pink-200'}`}
                                        >
                                            <span className="text-xs font-bold uppercase">{v.label}</span>
                                            <span className="text-lg font-black pink-font">{v.final}.-</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty & Total */}
                            <div className="bg-pink-50/50 p-4 rounded-3xl border border-pink-100 flex items-center justify-between">
                                <div className="flex items-center gap-3 bg-white p-1.5 rounded-full shadow-sm border border-pink-100">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center hover:bg-pink-100 hover:text-pink-600 transition-colors active:scale-90">
                                        <Icon name="minus" size={16} />
                                    </button>
                                    <span className="text-xl font-bold w-8 text-center pink-font text-slate-700">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center hover:bg-pink-600 shadow-md transition-colors active:scale-90">
                                        <Icon name="plus" size={16} />
                                    </button>
                                </div>
                                <div className="text-right pr-2">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total</p>
                                    <p className="text-3xl font-black text-pink-600 pink-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* Note */}
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2 ml-1 tracking-wide uppercase">Special Request</label>
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Less sweet, no spicy, etc..." 
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-pink-400 focus:bg-white focus:outline-none h-24 resize-none text-base font-medium text-slate-700 transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 animate-pink-smooth" style={{animationDelay: '0.2s'}}>
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border-2 border-pink-100 text-pink-500 font-bold text-lg rounded-full active:scale-95 transition-all hover:bg-pink-50">
                                Add to Cart
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-pink text-lg active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-200">
                                Order Now <Icon name="check" size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET --- */}
        {activeTab === 'cart' && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-pink-900/20 backdrop-blur-sm animate-fade-in md:items-center">
                <div className="w-full max-w-md md:max-w-lg bg-white border-t-8 border-pink-200 flex flex-col shadow-2xl h-[90vh] md:h-auto md:max-h-[90vh] animate-image-pop rounded-t-[2.5rem] md:rounded-[2.5rem] relative">
                    
                    <button 
                        onClick={() => setActiveTab('menu')}
                        className="absolute top-5 right-5 z-50 w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-pink-50 hover:text-pink-500 transition-colors shadow-sm"
                    >
                        <Icon name="x" size={20} />
                    </button>

                    <div className="w-full py-4 cursor-pointer hover:bg-pink-50/50 rounded-t-[2.5rem] border-b border-pink-50" onClick={() => setActiveTab('menu')}>
                        <div className="w-16 h-1.5 bg-pink-100 rounded-full mx-auto" />
                    </div>

                    <div className="flex justify-between items-center mb-4 px-8 pt-4">
                        <h2 className="text-3xl font-black pink-font text-slate-800">My Order</h2>
                        <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center font-bold text-xl animate-pulse">
                            {cart.reduce((a: any, b: any) => a + b.quantity, 0)}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                        {cart.map((item: any, idx: any) => (
                            <div key={idx} className="flex items-center gap-4 bg-white p-3 border border-pink-50 rounded-2xl shadow-sm relative overflow-hidden group animate-pink-smooth" style={{animationDelay: `${idx * 0.05}s`}}>
                                <img src={item.image_url} className="w-20 h-20 object-cover rounded-xl bg-pink-50" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-slate-800 text-lg leading-tight pink-font truncate">
                                        {item.name}
                                    </div>
                                    <div className="text-sm font-medium mt-1 text-slate-500 flex flex-wrap gap-2">
                                        <span className="text-pink-500 font-bold">{item.quantity}x</span>
                                        {item.variant !== 'normal' && <span className="bg-pink-50 px-2 py-0.5 rounded text-xs text-pink-600 uppercase font-bold">{item.variant}</span>}
                                    </div>
                                    {item.note && <div className="text-xs text-slate-400 italic mt-1 truncate">"{item.note}"</div>}
                                </div>
                                <div className="flex flex-col items-end gap-2 pl-2">
                                     <span className="font-black text-slate-800 text-lg pink-font">{item.price * item.quantity}.-</span>
                                     <button onClick={() => updateQuantity(idx, -1)} className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors active:scale-90">
                                         <Icon name="trash" size={16} />
                                     </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-300 space-y-4 animate-pulse">
                                <Icon name="basket" size={64} className="opacity-20" />
                                <span className="text-xl font-bold pink-font">Basket is empty</span>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-pink-50 border-t border-pink-100 relative z-30 md:rounded-b-[2.5rem]">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-slate-500 font-bold">Total Amount</span>
                            <span className="text-4xl font-black text-pink-600 pink-font">{cartTotal}.-</span>
                        </div>
                        <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-pink text-xl active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-pink-200">
                            Confirm Order <Icon name="check" size={24} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-pink-900/40 z-[250] flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-sm bg-white p-8 text-center shadow-2xl relative overflow-hidden rounded-[2.5rem] animate-image-pop">
                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10 animate-image-pop">
                        <Icon name="check" size={48} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-2xl pink-font text-slate-800 mb-2">Add to Cart?</h3>
                            <p className="text-slate-500 mb-8 font-medium">Add "{selectedProduct.name}" to your basket?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 btn-pink text-lg shadow-lg">Yes, Order Now</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-full hover:bg-slate-50">Just Add to Cart</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-2xl pink-font text-slate-800 mb-2">Confirm Order</h3>
                            <p className="text-slate-500 mb-8 font-medium">Send this order to the kitchen?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 btn-pink text-lg shadow-lg">Yes, Confirm!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-full hover:bg-slate-50">Cancel</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}