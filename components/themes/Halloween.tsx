import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Halloween / Spooky Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Haunted House
    home: <path d="M2 22 12 2l10 20H2zM12 6v4M10 14h4" />, 
    // Menu -> Spell Book / Scroll
    menu: <path d="M12 2L2 22h20L12 2zm0 4l6 14H6l6-14z" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Pumpkin Basket
    basket: <path d="M4 8h16l-2 14H6L4 8zm8-6v6" />,
    // Clock -> Full Moon / Time
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Witch Hat / Pumpkin
    chef: <path d="M12 2L2 22h20L12 2zM12 18a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Ghost / Soul
    flame: <path d="M12 2C7 2 2 7 2 12s5 10 10 10 10-5 10-10S17 2 12 2zm0 15c-1 0-2-1-2-2s2-4 2-4 2 3 2 4-1 2-2 2z" />, 
    // Spooky specifics
    ghost: <path d="M12 2a9 9 0 0 0-9 9v11l3-3 3 3 3-3 3 3 3-3 3 3V11a9 9 0 0 0-9-9zM9 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />,
    pumpkin: <path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm-2 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm4 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />,
    skull: <path d="M12 2c-4.4 0-8 3.6-8 8 0 3 1.5 5.5 4 7v3h8v-3c2.5-1.5 4-4 4-7 0-4.4-3.6-8-8-8zm-2 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm4 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />,
    scroll: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />,
    spider: <path d="M12 2L9 6h6l-3-4zM4 12h16M12 12v10" />, // Simplified
    cloudMoon: <path d="M12 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16z" />
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
      {name === 'basket' && <path d="M12 2v3M4 10v2M20 10v2" strokeWidth="2"/>}
      {name === 'clock' && <path d="M12 6v6l4 2" />}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-[#f97316] font-black text-2xl animate-pulse">SUMMONING...</div>;

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
    // Theme: Halloween - Spooky Hollow System
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#f1f5f9] bg-[#0f172a] border-x-4 border-purple-900/50">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Creepster&family=Itim&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --hallow-orange: #f97316;
                --hallow-purple: #7e22ce;
                --hallow-black: #0f172a;
                --slime-green: #4ade80;
                --ghost-white: #f8fafc;
                --text-spooky: #f1f5f9;
            }

            body {
                font-family: 'Itim', 'Sarabun', sans-serif;
                background-color: var(--hallow-black);
                /* Spider Web & Bat Pattern */
                background-image: 
                    radial-gradient(circle at 10% 20%, rgba(126, 34, 206, 0.2) 10%, transparent 11%),
                    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 0 L32 28 L60 30 L32 32 L30 60 L28 32 L0 30 L28 28 Z' fill='%237e22ce' fill-opacity='0.05'/%3E%3C/svg%3E");
                background-attachment: fixed;
                color: var(--text-spooky);
            }

            .spooky-title {
                font-family: 'Creepster', cursive;
                letter-spacing: 2px;
            }

            @keyframes ghost-float {
                0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
                50% { transform: translateY(-15px) rotate(5deg); opacity: 1; }
            }
            .animate-ghost { animation: ghost-float 3s infinite ease-in-out; }

            @keyframes flicker {
                0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
                20%, 22%, 24%, 55% { opacity: 0.5; }
            }
            .animate-flicker { animation: flicker 4s infinite; }

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
                background: #1e293b;
                border: 2px solid var(--hallow-purple);
                border-radius: 1rem 1rem 0.5rem 0.5rem;
                box-shadow: 0 10px 20px -5px rgba(126, 34, 206, 0.4);
                overflow: hidden;
            }
            .item-card:hover, .item-card:active {
                transform: scale(1.05);
                border-color: var(--hallow-orange);
                box-shadow: 0 0 20px var(--hallow-orange);
            }

            .btn-spooky {
                background: linear-gradient(135deg, var(--hallow-orange) 0%, #ea580c 100%);
                color: white;
                border-radius: 0.5rem;
                font-weight: 700;
                box-shadow: 0 4px 15px rgba(249, 115, 22, 0.5);
                transition: all 0.2s;
                border: 2px solid white;
            }
            .btn-spooky:active { transform: scale(0.95); filter: brightness(1.2); }

            .tab-btn {
                transition: all 0.3s;
                background: #334155;
                color: var(--text-spooky);
                border: 1px solid var(--hallow-purple);
                border-radius: 0.5rem;
                font-weight: 700;
            }
            .tab-btn.active {
                background: var(--hallow-purple) !important;
                color: white !important;
                box-shadow: 0 0 15px var(--hallow-purple);
                transform: translateY(-2px);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (Haunted Mansion HUD) --- */}
        <header className="bg-gradient-to-b from-purple-900 to-black text-white pt-10 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-2xl border-b-4 border-orange-500">
             <div className="absolute top-4 right-10 text-orange-500/20 text-5xl animate-flicker"><Icon name="cloudMoon" size={48} /></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-orange-600/40 w-fit px-4 py-1.5 rounded-full border border-orange-400 transform -rotate-1">
                         <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse border border-white"></span>
                         <p className="text-orange-100 text-[10px] font-bold tracking-widest uppercase">The Spooky Hollow: {tableLabel}</p>
                     </div>
                     <h1 className="text-4xl spooky-title font-black tracking-tighter leading-none mt-2 text-orange-500 drop-shadow-[0_2px_10px_rgba(249,115,22,0.5)]">
                         {brand?.name || "เทศกาลผีหลอก"}
                     </h1>
                 </div>
                 {/* Pumpkin Badge */}
                 <div className="w-20 h-20 bg-black rounded-full border-4 border-orange-500 flex items-center justify-center relative shadow-lg animate-ghost">
                     <Icon name="pumpkin" size={40} className="text-orange-500" />
                     <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-600 rounded-full border border-white flex items-center justify-center text-white text-[10px]">
                        <Icon name="chef" size={14} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade-in">
                    {/* Hero Banner (Cemetery View) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl mb-10 border-4 border-purple-800 p-2 group animate-image-pop">
                             <div className="h-full w-full rounded-[2.5rem] overflow-hidden bg-black opacity-80 relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover group-hover:opacity-100 transition-opacity" 
                                 />
                             </div>
                             <div className="absolute bottom-4 left-6 bg-purple-700 text-white px-5 py-2 rounded-full border-2 border-orange-400 shadow-lg transform rotate-[-2deg]">
                                 <span className="spooky-title text-sm font-bold uppercase tracking-widest">Monster's Choice!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2 animate-image-pop">
                         <div>
                             <h2 className="text-3xl spooky-title text-orange-500 drop-shadow-sm">Spooky Bites</h2>
                             <p className="text-xs text-purple-400 font-bold uppercase tracking-widest ml-1">Deadly Delicious</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-slate-800 text-orange-400 px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 hover:bg-slate-700 transition-all border-2 border-purple-900 shadow-md active:scale-95">
                             ALL POTIONS <Icon name="flame" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-black/50 border-b-2 border-purple-900/50">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-2 right-2 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white shadow-sm spooky-title">
                                                 CURSED!
                                             </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-slate-900">
                                         <h3 className="font-bold text-orange-100 text-sm line-clamp-2 mb-1 leading-tight spooky-title">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-purple-400 line-through font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-orange-500 font-black text-xl spooky-title leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-purple-900 text-orange-400 border-2 border-orange-500 flex items-center justify-center rounded-full hover:bg-purple-800 transition-all shadow-sm active:scale-90">
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
                             <Icon name="search" className="text-purple-400" />
                         </div>
                         <input type="text" placeholder="Sniffing for bodies?..." className="w-full pl-16 pr-8 py-5 rounded-full bg-slate-900 border-4 border-purple-900 text-orange-400 placeholder:text-purple-300 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-900/50 transition-all text-lg font-bold" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1 animate-image-pop">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-lg font-bold spooky-title ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-black/50 border-b-2 border-purple-900/50">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500" />
                                     </div>
                                     <div className="p-4 bg-slate-900">
                                         <h3 className="font-bold text-orange-100 text-sm line-clamp-2 mb-1 leading-tight spooky-title">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-purple-400 line-through font-bold">{pricing.original}</span>}
                                                 <span className="text-orange-500 font-black text-xl spooky-title leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-purple-900 text-orange-400 border-2 border-orange-500 flex items-center justify-center rounded-full hover:bg-purple-800 transition-all shadow-sm active:scale-90">
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

            {/* --- STATUS PAGE (Halloween Theme - FIXED LOGIC) --- */}
            {activeTab === 'status' && (
                <section className="animate-fade-in pt-4 pb-24">
                    <div className="mb-8 flex items-center justify-between bg-slate-900 p-8 border-4 border-purple-900 rounded-[3rem] shadow-xl relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12 text-orange-500">
                            <Icon name="spider" size={100} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black spooky-title text-orange-500">Graveyard Log</h2>
                             <p className="text-sm text-purple-400 font-bold mt-1 uppercase tracking-widest">Resurrecting your feast...</p>
                         </div>
                         <div className="w-16 h-16 bg-black border-4 border-orange-500 rounded-full flex items-center justify-center animate-ghost shadow-md text-orange-500">
                             <Icon name="scroll" size={32} />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-slate-900 p-6 border-2 border-purple-900 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-orange-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                         <Icon name="skull" size={14} /> Grave #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-wide border rounded-full flex items-center gap-1.5 shadow-sm
                                        ${o.status === 'pending' ? 'bg-purple-900 text-orange-300 border-orange-500' : 'bg-green-900 text-green-300 border-green-500'}`}>
                                        {o.status === 'pending' ? 'HAUNTING...' : 'ALIVE!'}
                                     </span>
                                </div>

                                {/* Items */}
                                <div className="mb-4 space-y-2 bg-black/30 p-5 rounded-2xl border border-purple-900/50">
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
                                            <div key={idx} className="flex justify-between items-start text-sm text-purple-200 font-bold border-b border-dashed border-purple-800 pb-2 last:border-0 spooky-title">
                                                
                                                {/* Left Info */}
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-base text-orange-100">{quantity}x {i.product_name}</span>
                                                    
                                                    {/* Variant Badge (Halloween Style) */}
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] bg-purple-700 text-white px-2 py-0.5 rounded-sm border border-orange-500 font-sans font-bold mt-1 shadow-sm uppercase tracking-wider transform -rotate-1`}>
                                                            {i.variant === 'special' ? '👻 BOO' : i.variant === 'jumbo' ? '🧛 DRACULA' : i.variant}
                                                        </span>
                                                    )}

                                                    {/* Note */}
                                                    {i.note && <span className="text-[10px] text-green-400 italic mt-0.5">Note: {i.note}</span>}
                                                </div>

                                                {/* Right Price */}
                                                <div className="text-right flex flex-col items-end min-w-[80px]">
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className="text-[10px] text-white bg-red-600 px-1.5 py-0.5 rounded-full font-sans font-bold mb-1 shadow-sm border border-white transform rotate-2">
                                                                SAVE -{discountAmount}
                                                            </span>
                                                            <span className="text-xs text-slate-500 line-through decoration-orange-500 decoration-2 sans-serif opacity-80 mb-0.5 font-bold">
                                                                {originalPriceTotal}
                                                            </span>
                                                            <span className="text-orange-500 text-lg leading-none">
                                                                {finalPriceTotal}.-
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-orange-500 text-lg">{finalPriceTotal}.-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                     <span className="font-bold text-slate-500 text-xs uppercase tracking-widest">SOULS</span>
                                     <span className="font-black text-green-400 text-3xl spooky-title">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-20 text-purple-700 font-bold text-2xl spooky-title opacity-50">
                                The graveyard is silent...
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Ghostly Capsule) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[85px] bg-black/90 backdrop-blur-md shadow-2xl flex justify-around items-center px-4 z-[100] rounded-[3rem] border-4 border-purple-900">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-purple-900/50' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-orange-500' : 'text-slate-600'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-purple-900/50' : ''}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-orange-500' : 'text-slate-600'}`} />
                 </div>
             </button>

             {/* Big Cart Button (Pumpkin Basket) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-orange-600 rounded-full shadow-lg flex items-center justify-center text-white border-4 border-white active:scale-90 transition-all duration-100 z-20 group hover:bg-orange-700 animate-ghost">
                     <Icon name="basket" size={32} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-purple-700 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-purple-900/50' : ''}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-orange-500' : 'text-slate-600'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Coffin Panel - FIXED 3 PRICES) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-md animate-fade-in">
                <div className="w-full max-w-md bg-slate-900 border-t-8 border-orange-500 h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[4rem] relative animate-image-pop">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-slate-800 text-orange-500 rounded-full border-2 border-orange-900 flex items-center justify-center hover:bg-red-900 transition-colors shadow-md active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-85 overflow-hidden border-b-4 border-purple-900 rounded-b-[3.5rem] bg-black">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover opacity-80" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-orange-600 text-white font-black text-3xl spooky-title rounded-full border-4 border-white shadow-xl transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-slate-300 decoration-purple-900 decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32 relative">
                        <h2 className="text-4xl spooky-title text-orange-500 mb-6 leading-tight drop-shadow-sm uppercase tracking-wider">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            
                            {/* ✅ FIXED: 3 Variants Grid (GOBLIN/WITCH/MONSTER) */}
                            <div>
                                <label className="block text-lg font-bold text-purple-300 mb-3 spooky-title ml-1 tracking-wide">CHOOSE FATE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'GOBLIN', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'WITCH', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'MONSTER', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center justify-between h-24 spooky-title
                                                ${variant === v.key 
                                                    ? 'bg-purple-900 border-orange-500 shadow-[3px_3px_0_#c2410c] -translate-y-1 text-orange-400' 
                                                    : 'bg-slate-800 border-purple-900 text-purple-500 hover:border-purple-600 hover:text-purple-300'}`}
                                        >
                                            <span className="text-[10px] font-black tracking-widest uppercase">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[9px] line-through decoration-red-600 decoration-2 opacity-70 mb-1">{v.original}</span>
                                                )}
                                                <span className="text-lg font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-4 bg-black p-3 rounded-full border-4 border-purple-900 shadow-md">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-slate-800 text-orange-500 rounded-full flex items-center justify-center hover:bg-slate-700 active:scale-90 transition-all font-black text-2xl border border-white/20"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-orange-500 spooky-title">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 active:scale-90 transition-all font-black text-2xl border border-white/20"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-purple-400 font-black uppercase tracking-widest mb-1">Soul Points</p>
                                    <p className="text-4xl font-black text-orange-500 spooky-title">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Scribble for the grim reaper..." 
                                    className="w-full p-6 bg-slate-800 border-4 border-purple-900 rounded-[2.5rem] focus:border-orange-500 focus:outline-none h-36 resize-none text-xl font-bold text-orange-100 placeholder:text-purple-400 transition-colors shadow-inner spooky-title"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-slate-800 border-4 border-purple-900 text-purple-300 font-black text-xl rounded-full active:scale-95 transition-all shadow-md spooky-title">
                                STASH SOUL
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-spooky text-2xl active:scale-95 transition-all flex items-center justify-center gap-2 spooky-title">
                                KABOOM! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ORDER SUMMARY MODAL --- */}
        <div id="orderSummaryOverlay" className={`fixed inset-0 bg-black/90 z-[130] backdrop-blur-sm animate-fade-in ${activeTab === 'cart' ? 'block' : 'hidden'}`} onClick={() => setActiveTab('menu')}></div>
        <div id="orderSummary" className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900 border-t-[10px] border-orange-500 z-[140] flex flex-col shadow-2xl h-[92vh] rounded-t-[4rem] transition-transform duration-300 ${activeTab === 'cart' ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="sticky top-0 bg-slate-900 z-20 rounded-t-[4rem] border-b-4 border-purple-950 p-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                <div className="w-24 h-1.5 bg-purple-900 rounded-full mx-auto mt-2 opacity-50"></div>
            </div>
            
            <div className="flex justify-between items-center mb-6 px-10 pt-8">
                <h2 className="text-4xl spooky-title text-orange-500 transform -rotate-1 tracking-widest">Cursed Basket</h2>
                <div className="w-14 h-14 bg-purple-900 text-white border-4 border-orange-500 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">
                    <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 px-8 pb-10 no-scrollbar">
                {cart.map((item: any, idx: any) => (
                    <div key={idx} className="flex items-center gap-4 bg-black p-4 border-3 border-purple-900 rounded-[2rem] shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                        <div className="w-20 h-20 bg-slate-900 rounded-2xl overflow-hidden border-2 border-orange-500 shrink-0">
                            <img src={item.image_url} className="w-full h-full object-cover opacity-80" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-orange-100 text-xl leading-tight spooky-title tracking-wide">
                                {item.name} <span className="text-purple-500">x{item.quantity}</span>
                            </div>
                            <div className="text-sm font-bold mt-1 text-green-400">
                                {item.variant !== 'normal' && <span className="bg-purple-900 px-2 py-0.5 rounded-full text-xs mr-2 border border-purple-700 text-orange-300">{item.variant}</span>}
                                {item.note && <span className="block text-green-500 italic mt-1 text-xs font-normal">"{item.note}"</span>}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className="font-black text-orange-500 text-2xl spooky-title">{item.price * item.quantity}.-</span>
                             <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-red-900/50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-900 transition-colors border border-red-800 shadow-sm active:scale-90">
                                 <Icon name="trash" size={18} />
                             </button>
                        </div>
                    </div>
                ))}
                {cart.length === 0 && (
                    <div className="text-center py-20 text-purple-800 font-bold text-2xl spooky-title opacity-50">
                        The basket is empty...
                    </div>
                )}
            </div>

            <div className="p-10 bg-black border-t-4 border-orange-500 relative z-30 rounded-t-[4rem]">
                <div className="flex justify-between items-center mb-8 pb-6 border-b-4 border-dashed border-purple-900">
                    <div>
                        <p className="text-xs text-purple-400 font-black uppercase tracking-widest">Grand Total</p>
                        <p className="text-5xl font-black text-orange-500 drop-shadow-md">{cartTotal}.-</p>
                    </div>
                    <div className="w-20 h-20 bg-slate-800 border-4 border-purple-900 rounded-full flex items-center justify-center text-orange-500 transform rotate-6 shadow-lg">
                        <Icon name="basket" size={40} />
                    </div>
                </div>
                <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-6 btn-spooky text-3xl active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.1em] spooky-title">
                    <span>REANIMATE!</span> <Icon name="flame" size={24} />
                </button>
            </div>
        </div>

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-black/95 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-image-pop">
                <div className="w-full max-w-sm bg-slate-900 border-8 border-purple-900 p-10 text-center shadow-2xl relative overflow-hidden rounded-[3rem]">
                    <div className="w-28 h-28 bg-black text-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-orange-500 shadow-lg relative z-10 animate-ghost">
                        <Icon name="flame" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-3xl spooky-title text-orange-500 mb-4 leading-tight relative z-10 uppercase tracking-widest">Added to Grave?</h3>
                            <p className="text-lg text-purple-400 mb-10 font-bold spooky-title relative z-10">Add "{selectedProduct.name}" and summon?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-orange-600 text-white font-black border-4 border-white shadow-xl active:scale-95 transition-all text-xl spooky-title uppercase tracking-widest rounded-2xl">YES! SUMMON!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-transparent border-4 border-purple-900 text-purple-600 font-black text-lg active:scale-95 transition-transform hover:bg-black spooky-title rounded-full uppercase">Just Stash</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl spooky-title text-orange-500 mb-4 leading-tight relative z-10 uppercase tracking-widest">Unfinished Business?</h3>
                            <p className="text-lg text-purple-400 mb-10 font-bold spooky-title relative z-10">Bring all stashed souls into this grand feast?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-5 bg-orange-600 text-white font-black border-4 border-white shadow-xl active:scale-95 transition-all text-xl spooky-title uppercase tracking-widest rounded-2xl">YES! RESURRECT!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-transparent border-4 border-purple-900 text-purple-600 font-black text-lg active:scale-95 transition-transform hover:bg-black spooky-title rounded-full uppercase">Abort</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}