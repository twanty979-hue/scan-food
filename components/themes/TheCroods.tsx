import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (The Croods / Stone Age Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Cave Entrance
    home: <path d="M2 22 12 2l10 20H2zM12 6v4M10 14h4" />, 
    // Menu -> Stone Tablet / Bone List
    menu: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Woven Net / Sack
    basket: <path d="M5 8h14l-2 13H7L5 8zm7-6v6" />,
    // Clock -> Sun / Stone Wheel
    clock: <circle cx="12" cy="12" r="10" strokeWidth="4" />,
    // Chef -> Bone / Club
    chef: <path d="M18.36 2.64l1.42 1.42-2.83 2.83-1.42-1.42zM5.64 15.36L2.81 12.53 4.23 11.11l2.83 2.83zM12 2C7 2 2 7 2 12s5 10 10 10 10-5 10-10S17 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />, 
    plus: <path d="M5 12h14M12 5v14" strokeWidth="4" />,
    minus: <path d="M5 12h14" strokeWidth="4" />,
    x: <path d="M18 6 6 18M6 6l12 12" strokeWidth="4" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" strokeWidth="4" />,
    // Flame -> Fire / Torch
    flame: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, 
    // Specifics
    bone: <path d="M17 2c-1.66 0-3 1.34-3 3 0 .31.06.6.15.88l-6.26 3.76c-.53-.41-1.21-.64-1.89-.64-1.66 0-3 1.34-3 3s1.34 3 3 3c.68 0 1.36-.23 1.89-.64l6.26 3.76c-.09.28-.15.57-.15.88 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3c-.68 0-1.36.23-1.89.64l-6.26-3.76c.09-.28.15-.57.15-.88 0-1.66 1.34-3 3-3s3 1.34 3 3z" />,
    paw: <path d="M12 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3m5.5 3a2.5 2.5 0 0 1 2.5 2.5 2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1 2.5-2.5m-11 0a2.5 2.5 0 0 1 2.5 2.5 2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1-2.5-2.5 2.5 2.5 0 0 1-2.5-2.5" />
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#d6d3d1] flex items-center justify-center text-[#78350f] font-black text-2xl animate-rumble">HUNTING...</div>;

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
    // Theme: The Croods - Stone Age System (Full Color)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#262626]">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Itim&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --cave-gray: #4b5563;
                --cave-brown: #78350f;
                --fire-orange: #f97316;
                --bone-white: #f8fafc;
                --jungle-green: #15803d;
                --bg-stone: #d6d3d1;
                --text-dark: #262626;
            }

            body {
                font-family: 'Itim', 'Sarabun', sans-serif;
                background-color: var(--bg-stone);
                background-image: 
                    url("https://www.transparenttextures.com/patterns/padded-little-squares.png"),
                    radial-gradient(circle at 10% 20%, rgba(120, 53, 15, 0.05) 10%, transparent 11%),
                    radial-gradient(circle at 80% 80%, rgba(75, 85, 99, 0.05) 15%, transparent 16%);
                background-size: auto, 150px 150px, 200px 200px;
                background-attachment: fixed;
                color: var(--text-dark);
            }

            .cave-font {
                font-family: 'Bangers', cursive;
                letter-spacing: 1.5px;
                text-transform: uppercase;
            }

            @keyframes rumble {
                0%, 100% { transform: translate(0, 0); }
                25% { transform: translate(-1px, 1px); }
                50% { transform: translate(1px, -1px); }
                75% { transform: translate(-1px, -1px); }
            }
            .animate-rumble { animation: rumble 0.3s infinite; }

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
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                background: #fff;
                border: 5px solid var(--cave-brown);
                border-radius: 10% 25% 15% 10% / 15% 10% 20% 15%;
                box-shadow: 8px 8px 0px rgba(69, 26, 3, 0.4);
                overflow: hidden;
            }
            .item-card:hover, .item-card:active {
                transform: translate(4px, 4px) rotate(-1deg);
                box-shadow: 2px 2px 0px rgba(69, 26, 3, 0.4);
                border-color: var(--fire-orange);
            }

            .btn-hunt {
                background: linear-gradient(135deg, var(--fire-orange) 0%, #ea580c 100%);
                color: white;
                border-radius: 0.5rem;
                font-weight: 700;
                font-family: 'Bangers', cursive;
                font-size: 1.25rem;
                box-shadow: 0 6px 0 #9a3412;
                transition: all 0.1s;
                border: 2px solid white;
            }
            .btn-hunt:active {
                transform: translateY(6px);
                box-shadow: 0 0 0 #9a3412;
            }

            .tab-btn {
                transition: all 0.3s;
                background: #e7e5e4;
                color: var(--cave-brown);
                border: 3px solid var(--cave-brown);
                border-radius: 1rem 0.5rem 1rem 0.5rem;
                font-weight: 800;
            }
            .tab-btn.active {
                background: var(--cave-brown) !important;
                color: white !important;
                border-color: var(--fire-orange);
                transform: skewX(-10deg);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (Cave Painting HUD) --- */}
        <header className="bg-[#57534e] text-white pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-2xl border-b-8 border-[#78350f]">
             <div className="absolute top-4 right-6 text-white/10 text-6xl animate-pulse">
                <Icon name="paw" size={60} />
             </div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#78350f] w-fit px-4 py-1.5 rounded-sm border-2 border-[#a8a29e] transform -rotate-2 shadow-md">
                         <span className="w-3 h-3 rounded-full bg-[#f97316] animate-pulse border border-white"></span>
                         <p className="text-[#f5f5f4] text-[12px] font-bold tracking-widest uppercase cave-font">Cave: {tableLabel}</p>
                     </div>
                     <h1 className="text-4xl cave-font tracking-wider leading-none mt-2 text-[#fca5a5] drop-shadow-[2px_2px_0_#000]">
                         {brand?.name || "ยุคหินถิ่นอร่อย"}
                     </h1>
                 </div>
                 {/* Bone Badge */}
                 <div className="w-20 h-20 bg-[#e7e5e4] rounded-full border-4 border-[#78350f] flex items-center justify-center relative shadow-xl animate-rumble">
                     <Icon name="bone" size={40} className="text-[#57534e]" />
                     <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#f97316] rounded-full border-2 border-white flex items-center justify-center text-white text-[12px]">
                        <Icon name="flame" size={16} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade-in">
                    {/* Hero Banner (Full Color) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-[#e7e5e4] rounded-[2rem] overflow-hidden shadow-2xl mb-10 border-4 border-[#57534e] p-2 group animate-image-pop">
                             <div className="h-full w-full rounded-[1.5rem] overflow-hidden bg-stone-300 relative">
                                 {/* 🎨 Removed grayscale */}
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover" 
                                 />
                             </div>
                             <div className="absolute bottom-4 right-4 bg-[#78350f] text-[#fca5a5] px-6 py-2 rounded-sm border-2 border-[#fca5a5] shadow-lg transform rotate-2">
                                 <span className="cave-font text-lg">Grug Approves!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2 animate-image-pop">
                         <div>
                             <h2 className="text-4xl cave-font text-[#78350f] drop-shadow-sm">Big Eats</h2>
                             <p className="text-sm text-[#57534e] font-bold uppercase tracking-widest ml-1">No Veggies Allowed!</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#e7e5e4] text-[#78350f] px-6 py-3 rounded-sm text-sm font-black flex items-center gap-2 hover:bg-[#d6d3d1] transition-all border-4 border-[#78350f] shadow-[4px_4px_0_#44403c] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cave-font">
                             SEE FOOD <Icon name="bone" size={16} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#d6d3d1] border-b-4 border-[#78350f]">
                                         {/* 🎨 Removed grayscale */}
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-0 right-0 bg-[#f97316] text-white text-[12px] font-bold px-3 py-1 rounded-bl-xl border-l-2 border-b-2 border-white shadow-sm cave-font">
                                                 HOT!
                                             </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-[#f5f5f4]">
                                         <h3 className="font-bold text-[#292524] text-lg line-clamp-2 mb-1 leading-tight cave-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[12px] text-[#78716c] line-through decoration-[#ef4444] decoration-4 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#ea580c] font-black text-2xl cave-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#78350f] text-[#fca5a5] border-2 border-[#fca5a5] flex items-center justify-center rounded-sm hover:bg-[#57534e] transition-all shadow-[2px_2px_0_#292524] active:scale-90">
                                                 <Icon name="plus" size={20} strokeWidth={4} />
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
                             <Icon name="search" className="text-[#a8a29e]" />
                         </div>
                         <input type="text" placeholder="Hunt for food..." className="w-full pl-16 pr-8 py-5 rounded-sm bg-[#e7e5e4] border-4 border-[#78350f] text-[#292524] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#ea580c] focus:shadow-[4px_4px_0_#ea580c] transition-all text-xl font-bold cave-font" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1 animate-image-pop">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-xl font-bold cave-font ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#d6d3d1] border-b-4 border-[#78350f]">
                                         {/* 🎨 Removed grayscale */}
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="p-4 bg-[#f5f5f4]">
                                         <h3 className="font-bold text-[#292524] text-lg line-clamp-2 mb-1 leading-tight cave-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[12px] text-[#78716c] line-through decoration-[#ef4444] decoration-4 font-bold">{pricing.original}</span>}
                                                 <span className="text-[#ea580c] font-black text-2xl cave-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#78350f] text-[#fca5a5] border-2 border-[#fca5a5] flex items-center justify-center rounded-sm hover:bg-[#57534e] transition-all shadow-[2px_2px_0_#292524] active:scale-90">
                                                 <Icon name="plus" size={20} strokeWidth={4} />
                                             </button>
                                         </div>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- STATUS PAGE (Cave Theme - FIXED LOGIC) --- */}
            {activeTab === 'status' && (
                <section className="animate-fade-in pt-4 pb-24">
                    <div className="mb-8 flex items-center justify-between bg-[#57534e] p-8 border-4 border-[#292524] rounded-[2rem] shadow-[8px_8px_0_#1c1917] relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-6 -bottom-6 text-9xl opacity-20 rotate-12 text-[#fca5a5]">
                            <Icon name="bone" size={120} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-4xl font-black cave-font text-[#fca5a5]">Cave Log</h2>
                             <p className="text-sm text-[#e7e5e4] font-bold mt-1 uppercase tracking-widest">Tracking the hunt...</p>
                         </div>
                         <div className="w-20 h-20 bg-[#292524] border-4 border-[#78350f] rounded-full flex items-center justify-center animate-rumble shadow-md text-[#ea580c]">
                             <Icon name="clock" size={40} />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-[#e7e5e4] p-6 border-4 border-[#78350f] rounded-xl shadow-[6px_6px_0_#292524] relative overflow-hidden">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4 border-b-2 border-[#a8a29e] pb-2">
                                     <span className="text-sm text-[#78350f] font-bold uppercase tracking-widest flex items-center gap-1 cave-font">
                                         Hunt #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-1 text-[12px] font-black uppercase tracking-wide border-2 rounded-sm flex items-center gap-1.5 shadow-sm cave-font transform -rotate-2
                                        ${o.status === 'pending' ? 'bg-[#fef3c7] text-[#b45309] border-[#fcd34d]' : 'bg-[#ccfbf1] text-[#0f766e] border-[#5eead4]'}`}>
                                        {o.status === 'pending' ? 'COOKING...' : 'CAUGHT!'}
                                     </span>
                                </div>

                                {/* Items */}
                                <div className="mb-4 space-y-3">
                                    {o.order_items.map((i: any, idx: any) => {
                                        // ✅ FIXED LOGIC FOR STATUS PAGE
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        const hasDiscount = (i.original_price && i.original_price > i.price) || (i.discount > 0);
                                        const originalPriceTotal = hasDiscount 
                                            ? (i.original_price ? i.original_price * i.quantity : (i.price + (i.discount || 0)) * i.quantity) 
                                            : finalPriceTotal;
                                        const discountAmount = originalPriceTotal - finalPriceTotal;

                                        return (
                                            <div key={idx} className="flex justify-between items-start text-lg text-[#292524] font-bold border-b border-dashed border-[#a8a29e] pb-2 last:border-0 cave-font">
                                                
                                                {/* Left Info */}
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight">
                                                        <span className="text-[#ea580c]">{quantity}x</span> {i.product_name}
                                                    </span>
                                                    
                                                    {/* Variant Badge (Cave Style) */}
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] bg-[#292524] text-[#fca5a5] px-2 py-0.5 border border-[#78350f] font-sans font-bold mt-1 uppercase tracking-wider transform -rotate-1`}>
                                                            {i.variant === 'special' ? '🦴 BIG' : i.variant === 'jumbo' ? '🦖 MAMMOTH' : i.variant}
                                                        </span>
                                                    )}

                                                    {/* Note */}
                                                    {i.note && <span className="text-[12px] text-[#57534e] italic mt-0.5 sans-serif">"{i.note}"</span>}
                                                </div>

                                                {/* Right Price */}
                                                <div className="text-right flex flex-col items-end min-w-[80px]">
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className="text-[10px] text-white bg-[#ef4444] px-1.5 py-0.5 transform rotate-2 font-sans">
                                                                SAVE -{discountAmount}
                                                            </span>
                                                            <span className="text-xs text-[#a8a29e] line-through decoration-[#292524] decoration-2 font-sans opacity-80 mb-0.5 font-bold">
                                                                {originalPriceTotal}
                                                            </span>
                                                            <span className="text-[#ea580c] text-xl leading-none">
                                                                {finalPriceTotal}.-
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[#ea580c] text-xl">{finalPriceTotal}.-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t-4 border-[#78350f]">
                                     <span className="font-bold text-[#57534e] text-xs uppercase tracking-widest">TOTAL ROCKS</span>
                                     <span className="font-black text-[#292524] text-4xl cave-font">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-20 text-[#a8a29e] font-bold text-2xl cave-font opacity-50">
                                Cave is empty...
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Stone Tablet) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-[380px] h-[85px] bg-[#e7e5e4] shadow-[0_10px_0_#292524] flex justify-around items-center px-4 z-[100] rounded-xl border-4 border-[#78350f] transform rotate-1">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-14 h-14 rounded-sm flex items-center justify-center transition-colors border-2 ${activeTab === 'home' ? 'bg-[#d6d3d1] border-[#78350f] text-[#ea580c]' : 'border-transparent text-[#78716c]'}`}>
                     <Icon name="home" size={28} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-14 h-14 rounded-sm flex items-center justify-center transition-colors border-2 ${activeTab === 'menu' ? 'bg-[#d6d3d1] border-[#78350f] text-[#ea580c]' : 'border-transparent text-[#78716c]'}`}>
                     <Icon name="menu" size={28} />
                 </div>
             </button>

             {/* Big Cart Button (Woven Net) */}
             <div className="relative w-20 h-20 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#ea580c] rounded-lg shadow-[4px_4px_0_#7c2d12] flex items-center justify-center text-white border-4 border-[#78350f] active:translate-y-2 active:shadow-none transition-all duration-100 z-20 group transform -rotate-3 hover:bg-[#c2410c] animate-rumble">
                     <Icon name="basket" size={36} />
                     {cart?.length > 0 && (
                         <span className="absolute -top-2 -right-2 bg-[#fef3c7] text-[#78350f] text-[12px] font-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#78350f] animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-14 h-14 rounded-sm flex items-center justify-center transition-colors border-2 ${activeTab === 'status' ? 'bg-[#d6d3d1] border-[#78350f] text-[#ea580c]' : 'border-transparent text-[#78716c]'}`}>
                     <Icon name="clock" size={28} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Stone Slab - FIXED 3 PRICES) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#292524]/80 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-[#e7e5e4] border-t-8 border-[#78350f] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-[0_-20px_0_#292524] rounded-t-[3rem] relative animate-image-pop">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#78350f] text-[#fca5a5] rounded-sm border-2 border-[#fca5a5] flex items-center justify-center hover:bg-[#57534e] transition-colors shadow-[4px_4px_0_#292524] active:scale-90">
                            <Icon name="x" strokeWidth={4} />
                        </button>
                        <div className="relative w-full h-85 overflow-hidden border-b-8 border-[#78350f] rounded-b-[2rem] bg-[#a8a29e]">
                            {/* 🎨 Removed grayscale */}
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-[#ea580c] text-white font-black text-3xl cave-font rounded-sm border-4 border-[#78350f] shadow-[6px_6px_0_#292524] transform -rotate-2 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-[#fed7aa] decoration-[#78350f] decoration-4 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32 relative">
                        <h2 className="text-4xl cave-font text-[#292524] mb-6 leading-tight drop-shadow-[2px_2px_0_#a8a29e] uppercase tracking-wider">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            
                            {/* ✅ FIXED: 3 Variants Grid (SMALL/BIG/MAMMOTH) */}
                            <div>
                                <label className="block text-xl font-bold text-[#78350f] mb-3 cave-font ml-1 tracking-wide">HOW HUNGRY?</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'SMALL', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'BIG', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'MAMMOTH', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-sm border-4 transition-all flex flex-col items-center justify-between h-24 cave-font
                                                ${variant === v.key 
                                                    ? 'bg-[#fca5a5] border-[#78350f] shadow-[4px_4px_0_#292524] -translate-y-1 text-[#78350f]' 
                                                    : 'bg-[#d6d3d1] border-[#a8a29e] text-[#78716c] hover:border-[#78350f] hover:text-[#78350f]'}`}
                                        >
                                            <span className="text-[12px] font-black tracking-widest uppercase">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-[#ea580c] decoration-2 opacity-70 mb-1">{v.original}</span>
                                                )}
                                                <span className="text-2xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-4 bg-[#d6d3d1] p-3 rounded-sm border-4 border-[#78350f] shadow-[4px_4px_0_#a8a29e]">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-[#78350f] text-[#fca5a5] rounded-sm flex items-center justify-center hover:bg-[#57534e] active:scale-90 transition-all font-black text-2xl border-2 border-[#fca5a5]"><Icon name="minus" strokeWidth={4} /></button>
                                    <span className="text-4xl font-black w-14 text-center bg-transparent border-none text-[#292524] cave-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#ea580c] text-white rounded-sm flex items-center justify-center hover:bg-[#c2410c] active:scale-90 transition-all font-black text-2xl border-2 border-white"><Icon name="plus" strokeWidth={4} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-[#78350f] font-black uppercase tracking-widest mb-1">Total Rocks</p>
                                    <p className="text-5xl font-black text-[#ea580c] cave-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Carve a message on the wall..." 
                                    className="w-full p-6 bg-[#d6d3d1] border-4 border-[#78350f] rounded-xl focus:border-[#ea580c] focus:outline-none h-36 resize-none text-xl font-bold text-[#292524] placeholder:text-[#78716c] transition-colors shadow-inner cave-font"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-[#d6d3d1] border-4 border-[#78350f] text-[#78350f] font-black text-xl rounded-sm active:scale-95 transition-all shadow-[4px_4px_0_#57534e] cave-font">
                                Save for Later
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-hunt text-2xl active:scale-95 transition-all flex items-center justify-center gap-2 cave-font tracking-widest">
                                EAT NOW! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (Gathering Sack) --- */}
        {activeTab === 'cart' && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#292524]/80 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-[#e7e5e4] border-t-[8px] border-[#78350f] flex flex-col shadow-[0_-20px_0_rgba(41,37,36,0.5)] h-[85vh] rounded-t-[3rem] animate-in slide-in-from-bottom duration-300">
                    <div className="w-full py-6 cursor-pointer rounded-t-[3rem] hover:bg-[#d6d3d1]" onClick={() => setActiveTab('menu')}>
                        <div className="w-24 h-2 bg-[#78350f] rounded-full mx-auto" />
                    </div>

                    <div className="flex justify-between items-center mb-6 px-10 pt-4">
                        <h2 className="text-4xl cave-font text-[#78350f] transform -rotate-1 tracking-widest uppercase">My Loot</h2>
                        <div className="w-16 h-16 bg-[#292524] text-[#ea580c] border-4 border-[#78350f] rounded-full flex items-center justify-center font-black text-3xl cave-font shadow-lg">
                            <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 px-8 pb-6 no-scrollbar">
                        {cart.map((item: any, idx: any) => (
                            <div key={idx} className="flex items-center gap-4 bg-[#f5f5f4] p-4 border-4 border-[#a8a29e] rounded-xl shadow-sm relative overflow-hidden hover:border-[#78350f] transition-colors">
                                {/* 🎨 Removed grayscale */}
                                <img src={item.image_url} className="w-20 h-20 object-cover border-4 border-[#78350f] rounded-md shrink-0" />
                                <div className="flex-1">
                                    <div className="font-bold text-[#292524] text-xl leading-tight cave-font tracking-wide">
                                        {item.name} <span className="text-[#ea580c] text-lg">x{item.quantity}</span>
                                    </div>
                                    <div className="text-sm font-bold mt-1 text-[#78350f]">
                                        {item.variant !== 'normal' && <span className="bg-[#e7e5e4] px-2 py-0.5 rounded-sm mr-2 border border-[#a8a29e] text-[10px] uppercase">{item.variant}</span>}
                                        {item.note && <span className="block text-[#57534e] italic mt-1 text-xs font-normal">"{item.note}"</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                     <span className="font-black text-[#ea580c] text-2xl cave-font">{item.price * item.quantity}.-</span>
                                     <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#78350f] hover:bg-[#57534e] flex items-center justify-center text-[#fca5a5] border-2 border-[#fca5a5] rounded-sm transition-colors active:scale-90 shadow-sm">
                                         <Icon name="trash" size={18} />
                                     </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="text-center py-20 text-[#a8a29e] font-bold cave-font text-2xl opacity-50">
                                Sack is empty...
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-[#d6d3d1] border-t-4 border-[#78350f] relative z-30 rounded-t-[2rem]">
                        <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-[#a8a29e]">
                            <div>
                                <p className="text-xs text-[#78350f] font-black uppercase tracking-widest">Total Loot</p>
                                <p className="text-5xl font-black text-[#292524] cave-font drop-shadow-sm">{cartTotal}.-</p>
                            </div>
                            <div className="w-20 h-20 bg-[#78350f] border-4 border-[#292524] rounded-full flex items-center justify-center text-[#fca5a5] transform rotate-6 shadow-lg">
                                <Icon name="basket" size={40} />
                            </div>
                        </div>
                        <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-6 btn-hunt text-3xl active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.1em] cave-font">
                            <span>FEAST!</span> <Icon name="check" size={32} strokeWidth={4} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#292524]/90 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-image-pop">
                <div className="w-full max-w-sm bg-[#e7e5e4] border-8 border-[#78350f] p-10 text-center shadow-[10px_10px_0_#000] relative overflow-hidden rounded-[2rem]">
                    <div className="w-28 h-28 bg-[#292524] text-[#ea580c] rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-[#ea580c] shadow-lg relative z-10 animate-rumble">
                        <Icon name="chef" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-3xl cave-font text-[#78350f] mb-4 leading-tight relative z-10 uppercase tracking-widest">Add to Sack?</h3>
                            <p className="text-lg text-[#57534e] mb-10 font-bold cave-font relative z-10">Throw "{selectedProduct.name}" in?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-[#ea580c] text-white font-black border-2 border-white shadow-[4px_4px_0_#78350f] active:scale-95 transition-all text-2xl cave-font uppercase tracking-widest rounded-sm">YES! EAT IT!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-[#d6d3d1] border-4 border-[#78350f] text-[#292524] font-black text-xl active:scale-95 transition-transform hover:bg-[#a8a29e] cave-font rounded-sm uppercase">Save for Later</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl cave-font text-[#78350f] mb-4 leading-tight relative z-10 uppercase tracking-widest">Start the Feast?</h3>
                            <p className="text-lg text-[#57534e] mb-10 font-bold cave-font relative z-10">Cook all the loot in your sack?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-5 bg-[#ea580c] text-white font-black border-2 border-white shadow-[4px_4px_0_#78350f] active:scale-95 transition-all text-2xl cave-font uppercase tracking-widest rounded-sm">YES! COOK!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-[#d6d3d1] border-4 border-[#78350f] text-[#292524] font-black text-xl active:scale-95 transition-transform hover:bg-[#a8a29e] cave-font rounded-sm uppercase">Wait!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}