import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Moana / Motunui Style) ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Hut
    home: <path d="M2 22 12 2l10 20H2zM12 6v4M10 14h4" />, 
    // Menu -> Leaf / Nature
    menu: <path d="M12 2L2 22h20L12 2zm0 4l6 14H6l6-14z" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Net / Trap
    basket: <path d="M4 8h16l-2 14H6L4 8zm8-6v6" />,
    // Clock -> Sun / Time
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Fish Hook
    chef: <path d="M18 6c-2-2-5-2-7 0L8 9c-1 1-1 3 0 4l3 3c1 1 3 1 4 0l1-1" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Volcano / Fire
    flame: <path d="M12 2c0 0-8 6-8 14 0 4.4 3.6 8 8 8s8-3.6 8-8c0-8-8-14-8-14z" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    // Heart -> Heart of Te Fiti
    heart: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />,
    leaf: <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>,
    compass: <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm-1-11v5l4.25 2.5.75-1.23-3.5-2.05V11h-1.5z"/>,
    anchor: <path d="M12 22c4.97 0 9-4.03 9-9h-2c0 3.87-3.13 7-7 7s-7-3.13-7-7H3c0 4.97 4.03 9 9 9zM12 2a3 3 0 0 0-3 3v7h6V5a3 3 0 0 0-3-3z"/>
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#fef3c7] flex items-center justify-center text-[#06b6d4] font-black text-2xl animate-pulse">LOADING...</div>;

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
    // Theme: Moana - Motunui Voyager System
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#164e63]">
        
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Itim&family=Mali:wght@400;600;700&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --ocean-teal: #06b6d4;
                --coral-orange: #f97316;
                --hibiscus-pink: #db2777;
                --sand-beige: #fef3c7;
                --tapa-brown: #451a03;
                --text-main: #164e63;
            }

            body {
                font-family: 'Itim', 'Sarabun', sans-serif;
                background-color: var(--sand-beige);
                /* Polynesian Tapa Pattern and Waves */
                background-image: 
                    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M0 40 Q 20 20 40 40 T 80 40' fill='none' stroke='%2306b6d4' stroke-opacity='0.05' stroke-width='2'/%3E%3Cpath d='M0 50 Q 20 30 40 50 T 80 50' fill='none' stroke='%23f97316' stroke-opacity='0.05' stroke-width='1'/%3E%3C/svg%3E"),
                    radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.05) 10%, transparent 11%);
                background-attachment: fixed;
            }

            .ocean-font {
                font-family: 'Mali', cursive;
            }

            /* --- ANIMATIONS --- */
            @keyframes wave-float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-8px) rotate(1deg); }
            }
            .animate-wave {
                animation: wave-float 4s infinite ease-in-out;
            }

            /* Pop Up Animation */
            @keyframes pop-up {
                0% { opacity: 0; transform: scale(0.8) translateY(20px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-pop-up {
                animation: pop-up 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                opacity: 0; 
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in { animation: fadeIn 0.8s ease-out; }

            .item-card {
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                background: white;
                border: 3px solid var(--tapa-brown);
                border-radius: 1.5rem;
                box-shadow: 6px 6px 0px var(--ocean-teal);
                overflow: hidden;
            }
            
            .item-card:hover, .item-card:active {
                transform: translateY(-5px) rotate(-1deg);
                box-shadow: 10px 10px 0px var(--coral-orange);
                border-color: var(--coral-orange);
            }

            .btn-voyager {
                background: linear-gradient(135deg, var(--ocean-teal) 0%, var(--text-main) 100%);
                color: white;
                border-radius: 1rem;
                font-weight: 700;
                box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
                transition: all 0.2s;
                border: 2px solid white;
            }
            
            .btn-voyager:active {
                transform: scale(0.95);
            }

            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: var(--tapa-brown);
                border: 2px solid var(--tapa-brown);
                border-radius: 1rem;
                font-weight: 700;
            }

            .tab-btn.active {
                background: var(--coral-orange) !important;
                color: white !important;
                box-shadow: 0 8px 15px rgba(249, 115, 22, 0.3);
                transform: translateY(-2px);
                border-color: var(--coral-orange);
            }
            
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (Motunui Village HUD) --- */}
        <header className="bg-white text-[#0e7490] pt-10 pb-16 px-6 rounded-b-[4rem] relative overflow-hidden shadow-sm border-b-4 border-[#fb923c]">
             {/* Palm leaf overlay */}
             <div className="absolute top-[-30px] right-[-30px] p-4 opacity-10 text-9xl rotate-45 text-[#06b6d4]">
                <Icon name="leaf" size={120} />
             </div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#cffafe] w-fit px-4 py-1.5 rounded-full border border-[#a5f3fc] transform -rotate-1">
                         <span className="w-3 h-3 rounded-full bg-[#f97316] animate-pulse border border-white"></span>
                         <p className="text-[#155e75] text-[10px] font-bold tracking-widest ocean-font uppercase">Beyond the Reef: {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl ocean-font font-black tracking-tighter leading-none mt-2 text-[#164e63]">
                         {brand?.name || "Motunui Village"}
                     </h1>
                 </div>
                 {/* Voyager Compass Badge */}
                 <div className="w-20 h-20 bg-white rounded-full border-4 border-[#22d3ee] flex items-center justify-center relative shadow-lg animate-wave">
                     <Icon name="compass" size={40} className="text-[#fb923c]" />
                     <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#0891b2] rounded-full border border-white flex items-center justify-center text-white text-[10px]">
                        <Icon name="chef" size={14} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade-in">
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[3rem] overflow-hidden shadow-xl mb-10 border-4 border-white p-2 group animate-pop-up" style={{animationDelay: '0s'}}>
                             <div className="h-full w-full rounded-[2.5rem] overflow-hidden bg-[#ecfeff] relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover" 
                                    style={{animation: 'wave-float 10s infinite alternate ease-in-out'}}
                                 />
                             </div>
                             <div className="absolute bottom-4 left-6 bg-[#f97316] text-white px-5 py-2 rounded-full border-2 border-white shadow-lg transform -rotate-2">
                                 <span className="ocean-font text-xs font-bold uppercase tracking-widest">Wayfinder's Pick!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2 animate-pop-up" style={{animationDelay: '0.1s'}}>
                         <div>
                             <h2 className="text-2xl ocean-font text-[#164e63] drop-shadow-sm font-bold">Recommended</h2>
                             <p className="text-xs text-[#ea580c] font-bold uppercase tracking-widest ml-1">Island Harvest</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-white text-[#0891b2] px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 hover:bg-[#ecfeff] transition-all ocean-font border-2 border-[#cffafe] shadow-md active:scale-95">
                             FULL MENU <Icon name="anchor" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-pop-up" style={{animationDelay: `${(idx * 0.1) + 0.2}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#ecfeff] border-b-2 border-[#451a03]/10">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-2 left-2 bg-[#db2777] text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white shadow-sm ocean-font">
                                                 GIFT!
                                             </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#164e63] text-sm line-clamp-2 mb-1 leading-tight ocean-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-gray-400 line-through font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#0891b2] font-black text-xl ocean-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#fef3c7] text-[#451a03] border-2 border-[#451a03] flex items-center justify-center rounded-full hover:bg-[#fde68a] transition-all shadow-[2px_2px_0_#451a03] active:scale-90">
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
                    <div className="relative mb-8 group animate-pop-up" style={{animationDelay: '0s'}}>
                         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#67e8f9]" />
                         </div>
                         <input type="text" placeholder="Sniffing for snacks?..." className="w-full pl-16 pr-8 py-5 rounded-full bg-white border-4 border-[#ecfeff] text-[#164e63] placeholder:text-[#a5f3fc] focus:outline-none focus:border-[#22d3ee] focus:ring-4 focus:ring-[#ecfeff] transition-all text-lg font-bold" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1 animate-pop-up" style={{animationDelay: '0.1s'}}>
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-lg font-bold ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-pop-up" style={{animationDelay: `${(idx * 0.1) + 0.2}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#ecfeff] border-b-2 border-[#451a03]/10">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#164e63] text-sm line-clamp-2 mb-1 leading-tight ocean-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-gray-400 line-through font-bold">{pricing.original}</span>}
                                                 <span className="text-[#0891b2] font-black text-xl ocean-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#fef3c7] text-[#451a03] border-2 border-[#451a03] flex items-center justify-center rounded-full hover:bg-[#fde68a] transition-all shadow-[2px_2px_0_#451a03] active:scale-90">
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

            {/* --- STATUS PAGE (Moana / Voyage Log - FIXED LOGIC) --- */}
            {activeTab === 'status' && (
                <section className="animate-fade-in pt-4 pb-24">
                    <div className="mb-8 flex items-center justify-between bg-white p-8 border-4 border-[#cffafe] rounded-[3rem] shadow-xl relative overflow-hidden transform rotate-1">
                         <div className="absolute bottom-[-20px] right-[-20px] text-[#cffafe] opacity-30 transform rotate-[-15deg]">
                            <Icon name="anchor" size={100} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black ocean-font text-[#0e7490]">Voyage Log</h2>
                             <p className="text-sm text-[#f97316] font-bold mt-1 uppercase tracking-widest">Sailing towards you...</p>
                         </div>
                         <div className="w-16 h-16 bg-[#ecfeff] border-4 border-white rounded-full flex items-center justify-center animate-bounce shadow-md">
                             <Icon name="clock" className="text-[#0891b2]" size={32} />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="bg-white p-6 border-2 border-[#cffafe] rounded-[2.5rem] shadow-sm relative overflow-hidden">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-[#0891b2] font-bold uppercase tracking-widest flex items-center gap-1">
                                         Voyage #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-wide border rounded-full flex items-center gap-1.5 shadow-sm
                                        ${o.status === 'pending' ? 'bg-[#fef3c7] text-[#b45309] border-[#fcd34d]' : 'bg-[#ccfbf1] text-[#0f766e] border-[#5eead4]'}`}>
                                        {o.status === 'pending' ? 'SAILING...' : 'ARRIVED!'}
                                     </span>
                                </div>

                                {/* Items */}
                                <div className="mb-4 space-y-2 bg-[#f0f9ff] p-5 rounded-2xl border border-[#e0f2fe]">
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
                                            <div key={idx} className="flex justify-between items-start text-sm text-[#164e63] font-bold border-b border-dashed border-[#bae6fd] pb-2 last:border-0 ocean-font">
                                                
                                                {/* Left Info */}
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-base">{quantity}x {i.product_name}</span>
                                                    
                                                    {/* Variant Badge (Moana Style) */}
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] bg-[#06b6d4] text-white px-2 py-0.5 rounded-sm border border-[#164e63] font-sans font-bold mt-1 shadow-sm uppercase tracking-wider transform -rotate-1`}>
                                                            {i.variant === 'special' ? '🌊 SPECIAL' : i.variant === 'jumbo' ? '🗿 MAUI' : i.variant}
                                                        </span>
                                                    )}

                                                    {/* Note */}
                                                    {i.note && <span className="text-[10px] text-[#0891b2] italic mt-0.5">Note: {i.note}</span>}
                                                </div>

                                                {/* Right Price */}
                                                <div className="text-right flex flex-col items-end min-w-[80px]">
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className="text-[10px] text-white bg-[#f97316] px-1.5 py-0.5 rounded-full font-sans font-bold mb-1 shadow-sm border border-[#164e63] transform rotate-2">
                                                                SAVE -{discountAmount}
                                                            </span>
                                                            <span className="text-xs text-[#94a3b8] line-through decoration-[#06b6d4] decoration-2 sans-serif opacity-80 mb-0.5 font-bold">
                                                                {originalPriceTotal}
                                                            </span>
                                                            <span className="text-[#155e75] text-lg leading-none">
                                                                {finalPriceTotal}.-
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[#155e75] text-lg">{finalPriceTotal}.-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                     <span className="font-bold text-[#94a3b8] text-xs uppercase tracking-widest">TREASURE</span>
                                     <span className="font-black text-[#155e75] text-3xl ocean-font">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-20 text-[#a5f3fc] font-bold text-2xl ocean-font opacity-50">
                                The ocean is empty...
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Wayfinder Capsule) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[85px] bg-white/95 backdrop-blur-md shadow-2xl flex justify-around items-center px-4 z-[90] rounded-[3rem] border-4 border-[#ecfeff]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#ecfeff]' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-[#06b6d4]' : 'text-[#a5f3fc]'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#ecfeff]' : ''}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-[#06b6d4]' : 'text-[#a5f3fc]'}`} />
                 </div>
             </button>

             {/* Big Cart Button (Satchel) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#f97316] rounded-full shadow-lg flex items-center justify-center text-white border-4 border-white active:scale-90 transition-all duration-100 z-20 group hover:bg-[#ea580c] animate-wave">
                     <Icon name="basket" size={32} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#0e7490] text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#ecfeff]' : ''}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-[#06b6d4]' : 'text-[#a5f3fc]'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Tropical Leaf Panel - FIXED 3 PRICES) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#083344]/60 backdrop-blur-md animate-fade-in">
                <div className="w-full max-w-md bg-white border-t-8 border-[#22d3ee] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[4rem] relative animate-pop-up" style={{animationDelay: '0s'}}>
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-[#06b6d4] rounded-full border-2 border-[#cffafe] flex items-center justify-center hover:bg-[#ecfeff] transition-colors shadow-md active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-4 border-[#ecfeff] rounded-b-[3.5rem] bg-[#ecfeff]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-white text-[#0891b2] font-black text-3xl ocean-font rounded-full border-4 border-[#ffedd5] shadow-xl transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-[#9ca3af] decoration-[#f97316] decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32 relative">
                        <h2 className="text-4xl ocean-font text-[#083344] mb-6 leading-tight drop-shadow-sm uppercase tracking-wider">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            
                            {/* ✅ FIXED: 3 Variants Grid (Normal/Special/Jumbo) */}
                            <div>
                                <label className="block text-lg font-bold text-[#164e63] mb-3 ocean-font ml-1 tracking-wide">CHOOSE YOUR HOOK:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'NORMAL', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'SPECIAL', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'JUMBO', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center justify-between h-24 ocean-font
                                                ${variant === v.key 
                                                    ? 'bg-[#ecfeff] border-[#06b6d4] shadow-[3px_3px_0_#155e75] -translate-y-1 text-[#0891b2]' 
                                                    : 'bg-white border-[#e0f2fe] text-[#94a3b8] hover:border-[#bae6fd] hover:text-[#0ea5e9]'}`}
                                        >
                                            <span className="text-[10px] font-black tracking-widest uppercase">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[9px] line-through decoration-[#f97316] decoration-2 opacity-70 mb-1">{v.original}</span>
                                                )}
                                                <span className="text-lg font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-4 bg-white p-3 rounded-full border-4 border-[#ecfeff] shadow-md">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-[#ecfeff] text-[#06b6d4] rounded-full flex items-center justify-center hover:bg-[#cffafe] active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-[#155e75] ocean-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#06b6d4] text-white rounded-full flex items-center justify-center hover:bg-[#0891b2] active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-[#22d3ee] font-black uppercase tracking-widest mb-1">Aura Consumption</p>
                                    <p className="text-4xl font-black text-[#0891b2] ocean-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="A message for the Chief or Moana..." 
                                    className="w-full p-6 bg-[#fff7ed] border-4 border-white rounded-[2.5rem] focus:border-[#fdba74] focus:outline-none h-36 resize-none text-xl font-bold text-[#164e63] placeholder:text-[#fed7aa] transition-colors shadow-inner ocean-font"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-white border-4 border-[#ecfeff] text-[#06b6d4] font-black text-xl rounded-full active:scale-95 transition-all shadow-md ocean-font">
                                Pack Loot
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-voyager text-2xl active:scale-95 transition-all flex items-center justify-center gap-2 ocean-font tracking-widest">
                                SAIL! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (Voyager Stash) --- */}
        {activeTab === 'cart' && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#083344]/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-full max-w-md bg-white border-t-[10px] border-[#cffafe] flex flex-col shadow-[0_-20px_60px_rgba(6,182,212,0.3)] h-[85vh] rounded-t-[4rem] animate-in slide-in-from-bottom duration-300">
                    <div className="w-full py-6 cursor-pointer rounded-t-[4rem] hover:bg-gray-50" onClick={() => setActiveTab('menu')}>
                        <div className="w-20 h-2 bg-[#cffafe] rounded-full mx-auto" />
                    </div>

                    <div className="flex justify-between items-center mb-6 px-10">
                        <h2 className="text-4xl font-black text-[#164e63] ocean-font transform -rotate-2">Voyager Stash</h2>
                        <div className="w-14 h-14 bg-[#cffafe] text-[#06b6d4] border-4 border-white rounded-2xl flex items-center justify-center font-black text-2xl ocean-font shadow-lg">
                            <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 px-8 pb-6 no-scrollbar">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-[#ecfeff] p-4 border-2 border-white rounded-[2rem] relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <img src={item.image_url} className="w-16 h-16 object-cover border-2 border-white rounded-2xl ml-2" />
                                <div className="flex-1">
                                    <div className="font-bold text-[#164e63] text-lg leading-tight ocean-font tracking-wide">
                                        {item.name} <span className="text-[#06b6d4] text-sm">x{item.quantity}</span>
                                    </div>
                                    <div className="text-xs text-[#f97316] mt-1 font-bold">
                                        {item.variant !== 'normal' && <span className="bg-white px-2 py-0.5 rounded-full mr-2 shadow-sm">{item.variant}</span>}
                                        {item.note && <span className="block text-[#0891b2] italic mt-1 font-normal">"{item.note}"</span>}
                                    </div>
                                </div>
                                <div className="font-black text-[#0891b2] text-xl ocean-font">{item.price * item.quantity}.-</div>
                                <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#fff7ed] hover:bg-[#ffedd5] flex items-center justify-center text-[#f97316] border-2 border-white rounded-full transition-colors active:scale-90 shadow-sm">
                                    <Icon name="trash" size={16} />
                                </button>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="text-center py-10 text-[#a5f3fc] font-bold ocean-font text-xl">Stash is empty...</div>
                        )}
                    </div>

                    <div className="p-8 bg-[#ecfeff] border-t-4 border-white relative z-30 rounded-t-[3rem]">
                        <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-white">
                            <div>
                                <p className="text-xs text-[#22d3ee] font-black uppercase tracking-widest">Total Bounty</p>
                                <p className="text-5xl font-black text-[#164e63] ocean-font">{cartTotal}.-</p>
                            </div>
                            <div className="w-16 h-16 bg-white border-4 border-[#cffafe] rounded-full flex items-center justify-center text-[#f97316] transform rotate-6 shadow-sm">
                                <Icon name="basket" size={32} />
                            </div>
                        </div>
                        <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-voyager text-2xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest ocean-font">
                            <span>WAYFIND!</span> <Icon name="check" size={28} strokeWidth={4} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#083344]/95 z-[250] flex items-center justify-center p-8 backdrop-blur-md animate-pop-up" style={{animationDelay: '0s'}}>
                <div className="w-full max-w-sm bg-white border-8 border-[#cffafe] p-10 text-center shadow-2xl relative overflow-hidden rounded-[3rem]">
                    <div className="w-28 h-28 bg-[#ecfeff] text-[#06b6d4] rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-lg relative z-10 animate-wave">
                        <Icon name="chef" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-3xl ocean-font text-[#164e63] mb-4 leading-tight relative z-10 uppercase tracking-widest">Added to Boat?</h3>
                            <p className="text-lg text-[#06b6d4] mb-10 font-bold ocean-font relative z-10">Add "{selectedProduct.name}" and sail?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-[#0891b2] text-white font-black border-4 border-white shadow-xl active:scale-95 transition-all text-xl ocean-font uppercase tracking-widest rounded-2xl">YES! WE SAIL!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-white border-4 border-[#cffafe] text-[#0e7490] font-black text-lg active:scale-95 transition-transform hover:bg-[#ecfeff] ocean-font rounded-full uppercase">Just Add</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl ocean-font text-[#164e63] mb-4 leading-tight relative z-10 uppercase tracking-widest">Ready to Sail?</h3>
                            <p className="text-lg text-[#06b6d4] mb-10 font-bold ocean-font relative z-10">Bring all your stashed goods into one grand voyage?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-5 bg-[#0891b2] text-white font-black border-4 border-white shadow-xl active:scale-95 transition-all text-xl ocean-font uppercase tracking-widest rounded-2xl">YES! WE SAIL!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white border-4 border-[#cffafe] text-[#0e7490] font-black text-lg active:scale-95 transition-transform hover:bg-[#ecfeff] ocean-font rounded-full uppercase">Wait!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}