import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Adapted for Punk Theme) ---
// ปรับ SVG ให้เส้นหนาขึ้นและดูดุดันเข้ากับธีม Punk
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />, 
    menu: <path d="M9 18V5l12-2v13M9 9l12-2M6 18H3c-1.1 0-2 .9-2 2v3h12v-3c0-1.1-.9-2-2-2h-3z" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    basket: <circle cx="12" cy="12" r="10" />, 
    clock: <circle cx="12" cy="12" r="10" />,
    chef: <path d="M12 2C7 2 2 7 2 12s5 10 10 10 10-5 10-10S17 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.5-3.3a9 9 0 0 0 3 3.3z" />, 
    bolt: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />, 
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
      strokeWidth="3" 
      strokeLinecap="square" 
      strokeLinejoin="miter" 
      className={className}
    >
      {content}
      {name === 'search' && <path d="m21 21-4.3-4.3" />}
      {name === 'basket' && <circle cx="12" cy="12" r="3" fill="currentColor" />} 
      {name === 'clock' && <polyline points="12 6 12 12 16 14" />}
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


  if (loading && !isVerified) return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-[#facc15] font-black text-4xl animate-pulse punk-font tracking-widest border-4 border-white p-4 bg-black transform -rotate-2">
            LOADING GIG...
        </div>
    </div>
  );

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
    // Theme: Bröxstônia Punk (Yellow/Black/Red/Blue)
    <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-zinc-900 bg-zinc-100 border-x-8 border-zinc-900">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Chakra+Petch:wght@400;600;700&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                /* Bröxstônia Palette */
                --brox-yellow: #facc15;
                --brox-red: #ef4444;
                --brox-blue: #2563eb;
                --brox-dark: #18181b;
                --bg-paper: #e5e7eb;
            }

            body {
                font-family: 'Chakra Petch', 'Sarabun', sans-serif;
                background-color: var(--bg-paper);
                background-image: url("https://www.transparenttextures.com/patterns/asfalt-dark.png");
                background-attachment: fixed;
                -webkit-tap-highlight-color: transparent;
            }

            h1, h2, h3, .punk-font {
                font-family: 'Bangers', cursive;
                letter-spacing: 1.5px;
            }

            /* Glitchy/Rough Animation */
            @keyframes punk-shake {
                0% { transform: translate(0, 0) rotate(0deg); }
                25% { transform: translate(-2px, 2px) rotate(-1deg); }
                50% { transform: translate(2px, -2px) rotate(1deg); }
                75% { transform: translate(-1px, -1px) rotate(-0.5deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
            }

            .animate-punk {
                animation: punk-shake 0.3s infinite;
            }

            @keyframes bounceIn {
                0% { opacity: 0; transform: scale(0.9); }
                50% { opacity: 1; transform: scale(1.02); }
                100% { transform: scale(1); }
            }
            .animate-bounce-in { animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

            /* Item Card - Cut-out/Poster Style */
            .item-card {
                transition: all 0.2s step-end;
                position: relative;
                background: white;
                border: 4px solid var(--brox-dark);
                box-shadow: 6px 6px 0px var(--brox-dark);
                overflow: hidden;
                transform: rotate(-1deg);
            }
            
            .item-card:hover, .item-card:active {
                transform: translate(2px, 2px) rotate(0deg);
                box-shadow: 2px 2px 0px var(--brox-dark);
                border-color: var(--brox-red);
            }

            .btn-punk {
                background: var(--brox-red);
                color: white;
                border: 4px solid var(--brox-dark);
                font-family: 'Bangers', cursive;
                text-transform: uppercase;
                box-shadow: 4px 4px 0px var(--brox-dark);
                transition: all 0.1s;
            }
            
            .btn-punk:active {
                transform: translate(4px, 4px);
                box-shadow: 0px 0px 0px var(--brox-dark);
            }

            .tab-active {
                background: var(--brox-yellow) !important;
                color: var(--brox-dark) !important;
                border: 4px solid var(--brox-dark) !important;
                box-shadow: 4px 4px 0px var(--brox-dark);
                transform: skewX(-10deg) scale(1.05);
            }
            
            .tab-btn {
                transition: all 0.2s;
                background: white;
                color: var(--brox-dark);
                border: 3px solid var(--brox-dark);
                font-weight: 800;
                font-family: 'Bangers', cursive;
                letter-spacing: 1px;
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (High Voltage Style) --- */}
        <header className="bg-[#facc15] text-black pt-10 pb-16 px-6 md:px-10 relative overflow-hidden shadow-xl z-10 border-b-8 border-zinc-900">
             {/* Grunge Texture Overlay */}
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/grunge-wall.png')]"></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     {/* Table Badge */}
                     <div className="flex items-center gap-2 mb-2 bg-black w-fit px-4 py-1.5 border-2 border-white shadow-[4px_4px_0_#ef4444] transform -rotate-2">
                         <span className="w-3 h-3 bg-red-500 animate-pulse border border-white"></span>
                         <p className="text-white text-xs font-bold tracking-widest punk-font uppercase">TABLE: {tableLabel}</p>
                     </div>
                     {/* Title */}
                     <h1 className="text-4xl md:text-5xl punk-font tracking-tighter leading-none mt-2 text-black drop-shadow-[3px_3px_0_#fff]">
                         {brand?.name || "INVALID LINK"}
                     </h1>
                 </div>
                 
                 {/* Header Icon (Drum/Chef) */}
                 <div className="w-20 h-20 bg-black border-4 border-white flex items-center justify-center relative shadow-[6px_6px_0_#2563eb] transform rotate-3 hover:-rotate-3 transition-transform">
                     <div className="text-[#facc15] animate-punk">
                        <Icon name="chef" size={40} />
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#ef4444] border-2 border-white flex items-center justify-center text-white text-xs">
                        <Icon name="bolt" size={16} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 md:px-8 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-bounce-in">
                    {/* Banner (Concert Poster Style) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 md:h-72 bg-zinc-900 overflow-hidden shadow-[10px_10px_0_#2563eb] mb-10 border-4 border-black p-2 group">
                             <div className="h-full w-full bg-zinc-800 relative overflow-hidden">
                                 {/* 🔴 EDITED: Removed grayscale and opacity classes */}
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" 
                                 />
                                 {/* Scanlines effect (Optional, kept for texture but less intrusive) */}
                                 <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] z-10 bg-[length:100%_4px] pointer-events-none"></div>
                             </div>
                             
                             {/* Sticker */}
                             <div className="absolute top-4 right-4 bg-[#ef4444] text-white px-5 py-2 border-4 border-black shadow-lg transform rotate-6 z-20">
                                 <span className="punk-font text-2xl tracking-wide">ROCKIN' DEALS!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-1">
                         <div>
                             <h2 className="text-3xl punk-font text-black transform -rotate-1">Tour Rations</h2>
                             <p className="text-sm text-zinc-600 font-bold ml-1 uppercase tracking-tighter">Approved by Barj & Larj</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-black text-white px-6 py-3 border-4 border-white shadow-[4px_4px_0_#facc15] text-sm font-black flex items-center gap-2 hover:bg-zinc-800 transition-all punk-font active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                             SET LIST <Icon name="menu" size={16} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     {/* 🔴 EDITED: Removed grayscale here */}
                                     <div className="w-full h-40 overflow-hidden relative bg-white border-b-4 border-black">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-0 left-0 bg-[#facc15] text-black text-xs font-black px-3 py-1 border-r-2 border-b-2 border-black">
                                                 SALE!
                                             </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white relative">
                                         <h3 className="font-bold text-black text-sm line-clamp-2 mb-2 leading-none uppercase tracking-wide font-sans">{p.name}</h3>
                                         <div className="flex justify-between items-end border-t-2 border-dashed border-zinc-300 pt-2 mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-red-500 line-through font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-black font-black text-xl punk-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#ef4444] text-white border-2 border-black flex items-center justify-center hover:bg-black transition-colors shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                                                 <Icon name="plus" size={12} strokeWidth={4} />
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
                <section className="animate-bounce-in pt-4">
                    <div className="relative mb-8 group mt-2">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                             <Icon name="search" className="text-black" />
                         </div>
                         <input type="text" placeholder="Scout for snacks?..." className="w-full pl-12 pr-4 py-4 bg-white border-4 border-black text-black placeholder:text-zinc-400 focus:outline-none focus:bg-[#fffde7] transition-all text-lg font-bold punk-font shadow-[6px_6px_0_#18181b]" />
                    </div>

                    <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar py-4 px-1">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-2 text-lg uppercase ${selectedCategoryId === c.id ? 'tab-active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-24">
                        {filteredProducts?.map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.05}s`}}>
                                     {/* 🔴 EDITED: Removed grayscale here */}
                                     <div className="w-full h-40 overflow-hidden relative bg-white border-b-4 border-black">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-black text-sm line-clamp-2 mb-2 leading-none uppercase tracking-wide font-sans">{p.name}</h3>
                                         <div className="flex justify-between items-end border-t-2 border-dashed border-zinc-300 pt-2 mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-red-500 line-through font-bold">{pricing.original}</span>}
                                                 <span className="text-black font-black text-xl punk-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#ef4444] text-white border-2 border-black flex items-center justify-center hover:bg-black transition-colors shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                                                 <Icon name="plus" size={12} strokeWidth={4} />
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
                <section className="animate-bounce-in pt-4 pb-24 max-w-3xl mx-auto">
                    <div className="mb-8 flex items-center justify-between bg-black p-6 border-4 border-white shadow-[10px_10px_0_#ef4444] relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-20 rotate-12 text-zinc-600">
                            <Icon name="clock" size={120} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black punk-font text-white tracking-widest">MISSION LOG</h2>
                             <p className="text-sm text-[#facc15] font-bold mt-1 uppercase">Ready to rock?</p>
                         </div>
                         {/* 🔴 Animation: Bounce (ดึ๋งๆ) */}
                         <div className="w-16 h-16 bg-[#ef4444] border-4 border-white flex items-center justify-center shadow-md animate-bounce">
                             <div className="text-white"><Icon name="clock" size={32} /></div>
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o, idx) => (
                            <div key={o.id} className="bg-white p-6 border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,0.1)] relative overflow-hidden" style={{animationDelay: `${idx * 0.1}s`}}>
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4 border-b-4 border-zinc-900 pb-3">
                                     <span className="text-lg text-black font-black punk-font flex items-center gap-1">
                                         ORDER #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-3 py-1 text-xs font-black uppercase tracking-wide border-2 border-black shadow-[2px_2px_0_#000]
                                         ${o.status === 'pending' ? 'bg-[#facc15] text-black animate-pulse' : 'bg-[#2563eb] text-white'}`}>
                                         {o.status === 'pending' ? 'COOKING...' : 'COMPLETED'}
                                     </span>
                                </div>

                                {/* Items */}
                                <div className="mb-4 space-y-3 font-sans">
                                    {o.order_items.map((i, idx) => {
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        return (
                                            <div key={idx} className="flex justify-between items-start text-sm text-zinc-800 font-bold">
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-snug">
                                                        <span className="text-[#ef4444] font-black">{quantity}x</span> {i.product_name}
                                                    </span>
                                                    {i.variant !== 'normal' && (
                                                        <span className="text-[10px] bg-black text-white px-2 py-0.5 mt-1 uppercase tracking-widest">
                                                            {i.variant}
                                                        </span>
                                                    )}
                                                    {i.note && <span className="text-[10px] text-zinc-500 italic mt-0.5 border-l-2 border-zinc-400 pl-2">"{i.note}"</span>}
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-black font-black">{finalPriceTotal}.-</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-zinc-400">
                                     <span className="font-black text-zinc-500 text-xs uppercase tracking-wider">TOTAL DAMAGE</span>
                                     <span className="font-black text-3xl punk-font text-black">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Punk Badge Style) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] h-[85px] bg-zinc-900 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex justify-around items-center px-4 z-[100] border-4 border-white">
             
             <button onClick={() => setActiveTab('home')} className={`group transition-all duration-300 w-16 flex flex-col items-center gap-1 ${activeTab === 'home' ? 'transform -translate-y-2' : ''}`}>
                 <div className={`w-12 h-12 border-2 border-transparent flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-white border-black shadow-[4px_4px_0_#ef4444]' : 'text-zinc-500'}`}>
                     <div className={activeTab === 'home' ? 'text-black transform scale-110' : ''}><Icon name="home" size={24} /></div>
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`group transition-all duration-300 w-16 flex flex-col items-center gap-1 ${activeTab === 'menu' ? 'transform -translate-y-2' : ''}`}>
                 <div className={`w-12 h-12 border-2 border-transparent flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-white border-black shadow-[4px_4px_0_#ef4444]' : 'text-zinc-500'}`}>
                     <div className={activeTab === 'menu' ? 'text-black transform scale-110' : ''}><Icon name="menu" size={24} /></div>
                 </div>
             </button>

             {/* Cart Button (Big Red Patch) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#ef4444] shadow-[0_8px_0_#000] flex items-center justify-center text-white border-4 border-white active:shadow-none active:translate-y-[8px] transition-all duration-100 z-20 group hover:brightness-110">
                     <div className="group-hover:rotate-12 transition-transform duration-200">
                        {/* Vinyl Record Icon for Cart */}
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 2v10" />
                        </svg>
                     </div>
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#facc15] text-black text-xs w-7 h-7 flex items-center justify-center font-black border-4 border-black animate-punk transform rotate-12">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`group transition-all duration-300 w-16 flex flex-col items-center gap-1 ${activeTab === 'status' ? 'transform -translate-y-2' : ''}`}>
                 <div className={`w-12 h-12 border-2 border-transparent flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-white border-black shadow-[4px_4px_0_#ef4444]' : 'text-zinc-500'}`}>
                     <div className={activeTab === 'status' ? 'text-black transform scale-110' : ''}><Icon name="clock" size={24} /></div>
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Grunge Window) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/90 backdrop-blur-sm animate-bounce-in p-0 md:items-center">
                <div className="w-full max-w-md md:max-w-lg bg-white h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl border-t-8 border-x-4 border-black relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-black border-4 border-black flex items-center justify-center hover:bg-[#ef4444] hover:text-white transition-colors shadow-[4px_4px_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                            <Icon name="x" size={24} strokeWidth={4} />
                        </button>
                        {/* 🔴 EDITED: Removed grayscale and BG color logic to show full food color */}
                        <div className="relative w-full h-80 overflow-hidden border-b-8 border-black bg-white">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-6 py-2 bg-[#facc15] text-black font-black text-3xl punk-font border-4 border-black shadow-[6px_6px_0_#ef4444] transform -rotate-3">
                                     {currentPriceObj.discount > 0 && (
                                        <div className="text-xs text-red-600 line-through font-sans font-bold leading-none absolute -top-4 left-0 bg-white px-1 border-2 border-black">{currentPriceObj.original}</div>
                                     )}
                                     {currentPriceObj.final}.-
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32">
                        <h2 className="text-4xl punk-font text-black mb-6 leading-tight uppercase tracking-widest drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            
                            {/* Variants - Chunky Buttons */}
                            <div>
                                <label className="block text-sm font-black text-zinc-500 mb-3 ml-1 tracking-widest uppercase">Select Gear</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { key: 'normal', label: 'Regular', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'Special', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'Jumbo', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-3 border-4 transition-all flex flex-col items-center justify-center gap-1 active:translate-y-1
                                                ${variant === v.key 
                                                    ? 'bg-[#facc15] border-black text-black shadow-[4px_4px_0_#000]' 
                                                    : 'bg-white border-zinc-300 text-zinc-400 hover:border-black hover:text-black'}`}
                                        >
                                            <span className="text-xs font-black uppercase tracking-wider">{v.label}</span>
                                            <span className="text-lg font-black punk-font">{v.final}.-</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty & Total - High Contrast Box */}
                            <div className="flex items-center justify-between py-4 mt-2 border-y-4 border-black bg-zinc-100 p-4">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white text-black border-4 border-black flex items-center justify-center hover:bg-zinc-200 active:scale-90 transition-all shadow-[2px_2px_0_#000]">
                                        <Icon name="minus" size={20} strokeWidth={4} />
                                    </button>
                                    <span className="text-4xl font-black w-14 text-center punk-font text-black">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#facc15] text-black border-4 border-black flex items-center justify-center hover:brightness-110 active:scale-90 transition-all shadow-[2px_2px_0_#000]">
                                        <Icon name="plus" size={20} strokeWidth={4} />
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Energy Points</p>
                                    <p className="text-4xl font-black text-black punk-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* Note - Poster Box */}
                            <div>
                                <label className="block text-sm font-black text-zinc-500 mb-2 ml-1 tracking-widest uppercase">Sub-command (Note)</label>
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="No spicy, extra sauce..." 
                                    className="w-full p-4 bg-white border-4 border-black text-black focus:bg-[#fffde7] focus:outline-none h-24 resize-none text-lg font-bold shadow-inner placeholder:text-zinc-300"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border-4 border-black text-black font-black text-xl active:scale-95 transition-all shadow-[6px_6px_0_#2563eb] punk-font uppercase">
                                STASH GEAR
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-punk active:scale-95 transition-all flex items-center justify-center gap-2 text-2xl">
                                ROCK ON! <Icon name="bolt" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (Backstage Inventory) --- */}
        {activeTab === 'cart' && (
            <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/95 backdrop-blur-sm animate-bounce-in md:items-center">
                <div className="w-full max-w-md md:max-w-lg bg-white border-t-[10px] border-black flex flex-col shadow-2xl h-[92vh] md:h-auto md:max-h-[90vh] relative">
                    
                    <button 
                        onClick={() => setActiveTab('menu')}
                        className="absolute top-6 right-6 z-50 w-12 h-12 bg-zinc-200 text-zinc-500 flex items-center justify-center hover:bg-black hover:text-white transition-colors border-4 border-transparent hover:border-white"
                    >
                        <Icon name="x" size={24} />
                    </button>

                    <div className="w-full py-4 cursor-pointer hover:bg-zinc-100 border-b-4 border-black" onClick={() => setActiveTab('menu')}>
                        <div className="w-24 h-2 bg-zinc-300 mx-auto mt-2 opacity-50"></div>
                    </div>

                    <div className="flex justify-between items-center mb-6 px-8 pt-8">
                        <h2 className="text-4xl font-black punk-font text-black transform -rotate-1 tracking-widest">INVENTORY</h2>
                        <div className="w-14 h-14 bg-[#2563eb] text-white border-4 border-black flex items-center justify-center font-black text-2xl punk-font shadow-lg">
                            {cart.reduce((a, b) => a + b.quantity, 0)}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-white p-3 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,0.1)] relative group">
                                {/* 🔴 EDITED: Removed grayscale */}
                                <img src={item.image_url} className="w-20 h-20 object-cover border-2 border-black" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-black text-black text-lg leading-tight uppercase truncate font-sans">
                                        {item.name}
                                    </div>
                                    <div className="text-sm font-bold mt-1 text-zinc-600 flex flex-wrap gap-2">
                                        <span className="text-[#ef4444] font-black">{item.quantity}x</span>
                                        {item.variant !== 'normal' && <span className="bg-black text-white px-2 py-0.5 text-xs uppercase font-bold tracking-wider">{item.variant}</span>}
                                    </div>
                                    {item.note && <div className="text-xs text-zinc-400 italic mt-1 truncate border-l-2 border-zinc-300 pl-1">"{item.note}"</div>}
                                </div>
                                <div className="flex flex-col items-end gap-2 pl-2">
                                     <span className="font-black text-black text-xl punk-font">{item.price * item.quantity}.-</span>
                                     <button onClick={() => updateQuantity(idx, -1)} className="w-8 h-8 bg-zinc-100 text-zinc-400 border-2 border-zinc-300 flex items-center justify-center hover:bg-[#ef4444] hover:text-white hover:border-black transition-colors active:scale-90">
                                         <Icon name="trash" size={16} />
                                     </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-4 opacity-50">
                                <Icon name="basket" size={64} />
                                <span className="text-2xl font-black punk-font uppercase">Empty Stash</span>
                            </div>
                        )}
                    </div>

                    <div className="p-10 bg-zinc-900 border-t-4 border-white relative z-30">
                        <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-dashed border-zinc-700">
                            <div>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Tour Damage</p>
                                <p className="text-5xl font-black text-white punk-font drop-shadow-md">{cartTotal}.-</p>
                            </div>
                             <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center text-red-500 transform rotate-6 shadow-2xl">
                                <div className="animate-spin-slow"><Icon name="basket" size={40} /></div>
                            </div>
                        </div>
                        <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-punk text-3xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-wider">
                            LINK START! <Icon name="bolt" size={24} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CONFIRMATION MODAL (Encore?) --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-black/98 z-[250] flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-sm bg-white border-8 border-black p-10 text-center shadow-2xl relative overflow-hidden animate-bounce-in">
                    
                    <div className="w-24 h-24 bg-[#ef4444] text-white flex items-center justify-center mx-auto mb-6 border-4 border-black shadow-[8px_8px_0_#2563eb] relative z-10 animate-punk">
                        <Icon name="check" size={48} strokeWidth={5} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-3xl punk-font text-black mb-2 uppercase tracking-wide">Stash This?</h3>
                            <p className="text-zinc-600 mb-8 font-bold uppercase tracking-tighter">Add "{selectedProduct.name}" to inventory?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 btn-punk text-xl shadow-lg">YES! ORDER NOW</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-zinc-300 text-zinc-400 font-black hover:border-black hover:text-black uppercase">Just Stash It</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl punk-font text-black mb-2 uppercase tracking-widest">Encore?</h3>
                            <p className="text-zinc-600 mb-8 font-bold uppercase tracking-tight">Found items in the tour bus. Bring them on stage?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 btn-punk text-2xl shadow-lg">YES! LETS ROCK!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-zinc-300 text-zinc-400 font-black hover:border-black hover:text-black uppercase">ABORT</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}