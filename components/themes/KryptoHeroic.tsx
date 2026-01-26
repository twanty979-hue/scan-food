import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Krypto / Superdog Style) ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Metropolis
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />, 
    // Menu -> Daily Planet / News
    menu: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Cape / Bag
    basket: <path d="M5 8h14l-2 13H7L5 8zm7-6v6" />,
    // Clock -> Signal Watch
    clock: <circle cx="12" cy="12" r="10" strokeWidth="3" />,
    // Chef -> Cape
    chef: <path d="M12 2C7 2 2 7 2 12s5 10 10 10 10-5 10-10S17 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Laser Vision
    flame: <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />, 
    
    // Specifics
    shield: <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z" />,
    paw: <path d="M12 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3 3 3 3 0 0 1 3-3m5.5 3a2.5 2.5 0 0 1 2.5 2.5 2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1 2.5-2.5m-11 0a2.5 2.5 0 0 1 2.5 2.5 2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1-2.5-2.5" />,
    bolt: <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z" />
  };

  const content = icons[name] || icons.home;
  
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

export default function App({ state, actions, helpers }) {
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center text-[#ef4444] font-black text-2xl animate-hero-fly">POWERING UP...</div>;

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
    // Theme: Krypto the Superdog - Hero System
    // ✅ FIX: Responsive max-width (md:max-w-2xl lg:max-w-4xl) to support Tablet/Desktop better
    <div className="">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Inter:wght@400;600;800&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --hero-red: #ef4444;
                --hero-yellow: #facc15;
                --hero-blue: #0ea5e9;
                --hero-white: #ffffff;
                --hero-dark: #0f172a;
                --text-main: #1e293b;
            }

            body {
                font-family: 'Chakra Petch', 'Sarabun', sans-serif;
                background-color: #f1f5f9;
                /* Subtle Metropolis Grid Pattern */
                background-image: 
                    linear-gradient(rgba(14, 165, 233, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(14, 165, 233, 0.03) 1px, transparent 1px);
                background-size: 30px 30px;
                background-attachment: fixed;
                color: var(--text-main);
            }

            h1, h2, h3, .hero-font {
                font-family: 'Inter', sans-serif;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 800;
            }

            @keyframes hero-fly {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-10px) rotate(1deg); }
            }
            .animate-hero-fly { animation: hero-fly 3s infinite ease-in-out; }

            /* Image Pop Animation */
            @keyframes pop-image {
                0% { opacity: 0; transform: scale(0.8) translateY(10px); }
                60% { opacity: 1; transform: scale(1.05); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-image-pop { animation: pop-image 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }

            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.8s ease-out; }

            .item-card {
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                background: white;
                border-radius: 1rem;
                border: 2px solid #e2e8f0;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .item-card:hover, .item-card:active {
                transform: translateY(-8px);
                border-color: var(--hero-red);
                box-shadow: 0 20px 25px -5px rgba(239, 68, 68, 0.2);
            }

            .card-shield {
                position: absolute;
                top: 0; left: 0; width: 40px; height: 4px;
                background: var(--hero-yellow);
                box-shadow: 0 0 10px var(--hero-yellow);
            }

            .btn-hero {
                background: linear-gradient(135deg, var(--hero-red) 0%, #dc2626 100%);
                color: white;
                border-radius: 0.75rem;
                font-weight: 700;
                box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
                transition: all 0.2s;
                border: 1px solid rgba(255,255,255,0.2);
            }
            .btn-hero:active { transform: scale(0.95); box-shadow: 0 2px 10px rgba(239, 68, 68, 0.6); }

            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: var(--hero-dark);
                border: 1px solid #cbd5e1;
                border-radius: 0.5rem;
                font-weight: 600;
            }
            .tab-btn.active {
                background: var(--hero-dark) !important;
                color: var(--hero-yellow) !important;
                border: 2px solid var(--hero-yellow);
                box-shadow: 0 0 15px rgba(250, 204, 21, 0.3);
                transform: translateY(-2px);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (Metropolis Tech Style) --- */}
        <header className="bg-gradient-to-b from-slate-900 to-slate-800 text-white pt-10 pb-16 px-6 md:px-10 rounded-b-[3rem] relative overflow-hidden shadow-2xl z-10 border-b-4 border-red-500">
             {/* Lens Flare Overlay */}
             <div className="absolute -top-10 -right-10 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl"></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-red-600/30 w-fit px-4 py-1 rounded-sm border border-red-500/50 backdrop-blur-sm transform -rotate-1">
                         <span className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse border border-white"></span>
                         <p className="text-yellow-400 text-[9px] font-black tracking-[0.3em] hero-font uppercase">Super Patrol: {tableLabel}</p>
                     </div>
                     <h1 className="text-2xl md:text-4xl hero-font font-black tracking-tighter leading-none mt-2 text-white drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]">
                         {brand?.name || "Krypto's Hero Grill"}
                     </h1>
                 </div>
                 {/* Hero Icon Badge */}
                 <div className="w-20 h-20 bg-white rounded-full border-4 border-red-500 flex items-center justify-center relative shadow-lg animate-hero-fly">
                     <Icon name="shield" size={40} className="text-red-600" />
                     <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center text-red-600 text-[10px]">
                        <Icon name="bolt" size={14} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 md:px-8 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade-in">
                    {/* Hero Banner (Metropolis View) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-52 md:h-72 lg:h-80 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl mb-10 border-2 border-white/20 p-1 group animate-image-pop">
                             <div className="h-full w-full rounded-xl overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover" 
                                 />
                                 {/* HUD Corner Accents */}
                                 <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-yellow-400"></div>
                                 <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-yellow-400"></div>
                             </div>
                             <div className="absolute bottom-4 left-4 bg-red-600/90 text-white px-5 py-1.5 rounded-sm border-l-4 border-yellow-400 shadow-lg">
                                 <span className="hero-font text-[10px] font-bold uppercase tracking-widest">Bark for Justice!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-1 animate-image-pop">
                         <div>
                             <h2 className="text-2xl hero-font text-slate-900 drop-shadow-sm transform -rotate-1">Super Rations</h2>
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Daily Strength Boost</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-white text-red-600 px-5 py-2 rounded-lg text-xs font-black flex items-center gap-2 hover:bg-slate-50 transition-all hero-font border border-slate-200 shadow-sm active:scale-95">
                             ALL TOOLS <Icon name="menu" size={14} />
                         </button>
                    </div>

                    {/* ✅ FIX: Responsive Grid (grid-cols-2 md:grid-cols-3 lg:grid-cols-4) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="card-shield"></div>
                                     <div className="w-full h-40 overflow-hidden relative bg-slate-50">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm hero-font">
                                                 ALERT!
                                             </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1 leading-tight hero-font tracking-wide">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-slate-400 line-through decoration-red-500 decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-blue-600 font-black text-xl hero-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-yellow-400 text-slate-900 border border-yellow-500 flex items-center justify-center rounded-lg hover:bg-yellow-300 transition-all shadow-sm active:scale-90">
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
                             <Icon name="search" className="text-slate-400" />
                         </div>
                         <input type="text" placeholder="Scanning for supplies..." className="w-full pl-14 pr-8 py-4 rounded-xl bg-white border-2 border-slate-100 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all text-lg font-bold shadow-inner" />
                    </div>

                    <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar py-1 px-1 animate-image-pop">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-xs font-bold uppercase tracking-widest hero-font ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* ✅ FIX: Responsive Grid (grid-cols-2 md:grid-cols-3 lg:grid-cols-4) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-24">
                        {filteredProducts?.map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="card-shield"></div>
                                     <div className="w-full h-40 overflow-hidden relative bg-slate-50">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1 leading-tight hero-font tracking-wide">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-slate-400 line-through decoration-red-500 decoration-2 font-bold">{pricing.original}</span>}
                                                 <span className="text-blue-600 font-black text-xl hero-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-yellow-400 text-slate-900 border border-yellow-500 flex items-center justify-center rounded-lg hover:bg-yellow-300 transition-all shadow-sm active:scale-90">
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

            {/* --- STATUS PAGE (Hero Theme - FIXED LOGIC) --- */}
            {activeTab === 'status' && (
                <section className="animate-fade-in pt-4 pb-24 max-w-3xl mx-auto">
                    <div className="mb-8 flex items-center justify-between bg-white p-7 border-l-8 border-red-600 rounded-xl shadow-xl relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-5 rotate-12 text-red-900">
                            <Icon name="shield" size={100} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-2xl font-black hero-font text-slate-900 tracking-widest">HERO LOG</h2>
                             <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-widest">Monitoring Delivery...</p>
                         </div>
                         <div className="w-16 h-16 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-center animate-pulse shadow-sm text-blue-600">
                             <Icon name="clock" size={32} />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                                     <span className="text-xs text-slate-900 font-black uppercase tracking-widest flex items-center gap-1 hero-font">
                                          Mission #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wide border rounded-md flex items-center gap-1.5 shadow-sm
                                        ${o.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                        {o.status === 'pending' ? 'DISPATCHING...' : 'MISSION ACCOMPLISHED!'}
                                     </span>
                                </div>

                                {/* Items */}
                                <div className="mb-4 space-y-2">
                                    {o.order_items.map((i, idx) => {
                                        // ✅ FIXED LOGIC FOR STATUS PAGE
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        const hasDiscount = (i.original_price && i.original_price > i.price) || (i.discount > 0);
                                        const originalPriceTotal = hasDiscount 
                                            ? (i.original_price ? i.original_price * i.quantity : (i.price + (i.discount || 0)) * i.quantity) 
                                            : finalPriceTotal;
                                        const discountAmount = originalPriceTotal - finalPriceTotal;

                                        return (
                                            <div key={idx} className="flex justify-between items-start text-sm font-medium text-slate-700 border-b border-dashed border-slate-200 pb-2 last:border-0 hero-font tracking-wide">
                                                
                                                {/* Left Info */}
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-base">
                                                        <span className="text-red-500 font-bold">{quantity}x</span> {i.product_name}
                                                    </span>
                                                    
                                                    {/* Variant Badge (Hero Style) */}
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded border border-slate-600 font-sans font-bold mt-1 uppercase tracking-wider`}>
                                                            {i.variant === 'special' ? '⚡ SUPER' : i.variant === 'jumbo' ? '🦸 ULTRA' : i.variant}
                                                        </span>
                                                    )}

                                                    {/* Note */}
                                                    {i.note && <span className="text-[10px] text-blue-500 italic mt-0.5 sans-serif">"{i.note}"</span>}
                                                </div>

                                                {/* Right Price */}
                                                <div className="text-right flex flex-col items-end min-w-[80px]">
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded font-bold mb-0.5 transform rotate-2">
                                                                SAVE -{discountAmount}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 line-through font-bold">
                                                                {originalPriceTotal}
                                                            </span>
                                                            <span className="text-lg leading-none text-slate-900">
                                                                {finalPriceTotal}.-
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-lg text-slate-900">{finalPriceTotal}.-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                     <span className="font-bold text-slate-400 text-xs uppercase tracking-widest">POWER LEVEL</span>
                                     <span className="font-black text-3xl hero-font text-blue-600">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-20 text-slate-400 font-bold text-xl hero-font">
                                No signals detected...
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Hero HUD Capsule) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[75px] bg-[#0f172a]/95 backdrop-blur-md shadow-2xl flex justify-around items-center px-4 z-[100] rounded-2xl border border-white/10">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-red-500/20' : ''}`}>
                     <Icon name="home" size={20} className={`${activeTab === 'home' ? 'text-red-400 drop-shadow-[0_0_5px_#ef4444]' : 'text-slate-500'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-red-500/20' : ''}`}>
                     <Icon name="menu" size={20} className={`${activeTab === 'menu' ? 'text-red-400 drop-shadow-[0_0_5px_#ef4444]' : 'text-slate-500'}`} />
                 </div>
             </button>

             {/* Big Cart Button (Super Core) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-18 h-18 bg-gradient-to-tr from-red-600 to-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center text-white border-2 border-white/50 active:scale-90 transition-all duration-300 z-20 group">
                     <Icon name="basket" size={24} className="group-hover:rotate-12 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-[-5px] right-[-5px] bg-yellow-400 text-red-900 text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black border border-white animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-red-500/20' : ''}`}>
                     <Icon name="clock" size={20} className={`${activeTab === 'status' ? 'text-red-400 drop-shadow-[0_0_5px_#ef4444]' : 'text-slate-500'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Hero Screen - FIXED 3 PRICES) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0f172a]/80 backdrop-blur-md animate-fade-in p-0 md:items-center">
                {/* ✅ FIX: Modal Responsive Width */}
                <div className="w-full max-w-md md:max-w-lg bg-white border-t-8 border-red-500 h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[3rem] md:rounded-[2rem] relative animate-image-pop">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-slate-900 rounded-full border-2 border-slate-100 flex items-center justify-center hover:bg-red-50 transition-colors shadow-md active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-85 overflow-hidden border-b-4 border-red-50 rounded-b-[2.5rem] bg-slate-50">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-[#0f172a] text-yellow-400 font-black text-3xl hero-font rounded-xl border border-yellow-500/50 shadow-xl transform -rotate-1 leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-slate-500 decoration-red-500 decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32 relative">
                        <h2 className="text-2xl hero-font text-slate-950 mb-6 leading-tight drop-shadow-sm uppercase tracking-widest">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            
                            {/* ✅ FIXED: 3 Variants Grid (CIVILIAN/SIDEKICK/HERO) */}
                            <div>
                                <label className="block text-lg font-bold text-slate-800 mb-3 hero-font ml-1 tracking-wide">CHOOSE POWER:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'CIVILIAN', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'SIDEKICK', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'HERO', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 border-4 transition-all flex flex-col items-center justify-between h-24 hero-font rounded-xl
                                                ${variant === v.key 
                                                    ? 'bg-slate-900 border-slate-900 text-yellow-400 shadow-[4px_4px_0_#ef4444] -translate-y-1' 
                                                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600'}`}
                                        >
                                            <span className="text-[10px] font-black tracking-widest uppercase">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-red-500 decoration-2 opacity-70 mb-1">{v.original}</span>
                                                )}
                                                <span className="text-xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-4 bg-slate-900 p-2 border-2 border-white/20 rounded-xl shadow-lg">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white/10 text-white rounded-lg flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all font-black text-2xl border border-white/20"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-yellow-400 hero-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-500 active:scale-90 transition-all font-black text-2xl border border-white/20"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-red-400 font-black uppercase tracking-[0.2em] mb-1">Energy Cost</p>
                                    <p className="text-4xl font-black text-slate-950 hero-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Mission parameters for Krypto..." 
                                    className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-red-500 focus:outline-none h-36 resize-none text-xl font-bold text-slate-900 placeholder:text-slate-400 transition-colors shadow-inner hero-font"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-white border border-slate-200 text-slate-600 font-black text-xl rounded-xl active:scale-95 transition-all shadow-sm hero-font">
                                Stow Gear
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-hero text-2xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                FLY! <Icon name="shield" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (Super Core) --- */}
        {activeTab === 'cart' && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0f172a]/80 backdrop-blur-sm animate-fade-in md:items-center">
                {/* 🔴 FIX: Changed h-[92vh] to h-[90vh] and added relative to container */}
                <div className="w-full max-w-md md:max-w-lg bg-white border-t-[10px] border-red-500 flex flex-col shadow-2xl h-[90vh] md:h-auto md:max-h-[90vh] animate-image-pop rounded-t-[2rem] md:rounded-[2rem] relative">
                    
                    {/* 🔴 FIX: Added Explicit Close Button Top Right */}
                    <button 
                        onClick={() => setActiveTab('menu')}
                        className="absolute top-4 right-4 z-50 w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
                    >
                        <Icon name="x" size={24} />
                    </button>

                    <div className="w-full py-4 cursor-pointer hover:bg-slate-50 rounded-t-[2rem] border-b border-slate-100" onClick={() => setActiveTab('menu')}>
                        <div className="w-24 h-2 bg-slate-200 rounded-full mx-auto" />
                    </div>

                    <div className="flex justify-between items-center mb-6 px-10 pt-6">
                        <h2 className="text-3xl font-black hero-font text-slate-900 transform -rotate-1 tracking-widest">SUPER STASH</h2>
                        <div className="w-14 h-14 bg-yellow-400 text-black border-4 border-slate-900 flex items-center justify-center font-black text-2xl shadow-lg rounded-xl">
                            <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 px-8 pb-6 no-scrollbar">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl shadow-sm relative overflow-hidden">
                                <img src={item.image_url} className="w-16 h-16 object-cover border border-slate-300 rounded-lg" />
                                <div className="flex-1">
                                    <div className="font-bold text-slate-900 text-xl leading-tight hero-font tracking-wide">
                                        {item.name} <span className="text-red-500">x{item.quantity}</span>
                                    </div>
                                    <div className="text-sm font-bold mt-1 text-blue-500">
                                        {item.variant !== 'normal' && <span className="bg-white px-2 py-0.5 border border-slate-200 text-xs mr-2 rounded">{item.variant}</span>}
                                        {item.note && <span className="block text-slate-400 italic mt-1 text-xs font-normal">"{item.note}"</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                     <span className="font-black text-slate-900 text-2xl hero-font">{item.price * item.quantity}.-</span>
                                     <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-red-100 text-red-600 border border-red-200 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors active:scale-90">
                                         <Icon name="trash" size={18} />
                                     </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="text-center py-20 text-slate-300 font-bold hero-font text-2xl">
                                ZERO ENERGY...
                            </div>
                        )}
                    </div>

                    <div className="p-10 bg-slate-900 border-t-4 border-white relative z-30 md:rounded-b-[2rem]">
                        <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-700">
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Mission Total</p>
                                <p className="text-5xl font-black text-white drop-shadow-md hero-font">{cartTotal}.-</p>
                            </div>
                            <div className="w-20 h-20 bg-white border-4 border-slate-900 rounded-full flex items-center justify-center text-red-600 transform rotate-6 shadow-2xl">
                                <Icon name="basket" size={40} />
                            </div>
                        </div>
                        <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-6 btn-hero text-3xl active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.1em]">
                            <span>LAUNCH!</span> <Icon name="bolt" size={24} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-black/90 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-image-pop">
                <div className="w-full max-w-sm bg-white border-8 border-slate-900 p-10 text-center shadow-2xl relative overflow-hidden rounded-[2rem]">
                    <div className="w-28 h-28 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-slate-900 shadow-lg relative z-10 animate-hero-fly">
                        <Icon name="shield" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-3xl hero-font text-slate-900 mb-4 leading-tight relative z-10 uppercase tracking-widest">Mission Update?</h3>
                            <p className="text-lg text-slate-500 mb-10 font-bold relative z-10">Add "{selectedProduct.name}" to loadout?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-slate-900 text-yellow-400 font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl hero-font uppercase rounded-xl">YES! DEPLOY!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-white border-2 border-slate-200 text-slate-400 font-black text-lg active:scale-95 transition-transform hover:bg-slate-50 hero-font rounded-xl uppercase">Just Stash</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl hero-font text-slate-900 mb-4 leading-tight relative z-10 uppercase tracking-widest">Start Mission?</h3>
                            <p className="text-lg text-slate-500 mb-10 font-bold relative z-10">Launch all stashed items for delivery?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-5 bg-slate-900 text-yellow-400 font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl hero-font uppercase rounded-xl">YES! GO GO GO!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white border-2 border-slate-200 text-slate-400 font-black text-lg active:scale-95 transition-transform hover:bg-slate-50 hero-font rounded-xl uppercase">Abort</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}