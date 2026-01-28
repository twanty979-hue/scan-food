import React, { useState, useEffect, useRef } from "react";

// --- 🦁 Icons Wrapper (Adapted for Lion King Theme) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    home: <path d="M2 20h20 M12 3l10 17H2L12 3z" />, // Tent/Hut style
    menu: <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />, // Hamburger/List
    search: <circle cx="11" cy="11" r="8" />, 
    basket: <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />, // Bag/Basket
    clock: <circle cx="12" cy="12" r="10" />,
    chef: <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6v-7.13z" />, 
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    sun: <g><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></g>,
    crown: <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />,
    leaf: <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />,
    paw: <path d="M12 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3m5.5 3a2.5 2.5 0 0 1 2.5 2.5 2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1-2.5 2.5m-11 0a2.5 2.5 0 0 1 2.5 2.5 2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1-2.5-2.5" />,
    scroll: <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2zM15 2v4M15 18v4" />,
    wand: <path d="m8 16 13.85-13.85a.5.5 0 0 0-.7-.7L7.29 15.29a.5.5 0 0 0 .16.83.5.5 0 0 0 .55-.12zM2.5 6A2.5 2.5 0 1 0 5 3.5 2.5 2.5 0 0 0 2.5 6zm-2 12A2.5 2.5 0 1 0 3 15.5 2.5 2.5 0 0 0 .5 18z" />
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
      {name === 'clock' && <polyline points="12 6 12 12 16 14" />}
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


  if (loading && !isVerified) return (
    <div className="min-h-screen bg-[#fffbeb] flex items-center justify-center">
        <div className="text-[#f97316] font-black text-4xl animate-pulse savanna-font tracking-widest drop-shadow-md">
            THE SUN IS RISING...
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
    // Theme: Lion King / Pride Lands (No Grayscale!)
    <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#451a03] bg-[#fffbeb] border-x border-amber-200">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Itim&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                /* Lion King Palette */
                --lion-orange: #f97316; /* Sunset */
                --savanna-yellow: #fbbf24; /* Golden grass */
                --pride-brown: #78350f; /* Mane/Rock */
                --sunset-red: #ef4444;
                --bg-savanna: #fffbeb; /* Creamy yellow */
                --text-main: #451a03;
            }

            body {
                font-family: 'Itim', 'Sarabun', sans-serif;
                background-color: var(--bg-savanna);
                /* Savanna Pattern */
                background-image: 
                    radial-gradient(circle at 10% 20%, rgba(249, 115, 22, 0.05) 15%, transparent 16%),
                    radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.05) 10%, transparent 11%),
                    linear-gradient(rgba(120, 53, 15, 0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(120, 53, 15, 0.02) 1px, transparent 1px);
                background-size: 100px 100px, 150px 150px, 40px 40px, 40px 40px;
                background-attachment: fixed;
                -webkit-tap-highlight-color: transparent;
                color: var(--text-main);
            }

            h1, h2, h3, .savanna-font {
                font-family: 'Itim', cursive;
                text-transform: uppercase;
            }

            /* Sunset Pulse Animation */
            @keyframes sunset-glow {
                0%, 100% { filter: drop-shadow(0 0 5px var(--lion-orange)); }
                50% { filter: drop-shadow(0 0 20px var(--savanna-yellow)); }
            }

            .animate-sunset {
                animation: sunset-glow 4s infinite ease-in-out;
            }

            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in { animation: fadeIn 0.5s ease-out; }

            /* Item Card - Natural Frame Style */
            .item-card {
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                background: white;
                border-radius: 1.5rem;
                border: 2px solid #fde68a;
                box-shadow: 0 10px 20px -5px rgba(120, 53, 15, 0.1);
                overflow: hidden;
            }
            
            .item-card:hover, .item-card:active {
                transform: translateY(-5px) rotate(1deg);
                border-color: var(--lion-orange);
                box-shadow: 0 15px 30px -10px rgba(249, 115, 22, 0.3);
            }

            .btn-lion {
                background: linear-gradient(135deg, var(--lion-orange) 0%, var(--sunset-red) 100%);
                color: white;
                border: 2px solid white;
                border-radius: 1rem;
                font-weight: 700;
                box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
                transition: all 0.2s;
            }
            
            .btn-lion:active {
                transform: scale(0.95);
                box-shadow: 0 2px 5px rgba(249, 115, 22, 0.6);
            }

            .tab-active {
                background: var(--pride-brown) !important;
                color: var(--savanna-yellow) !important;
                border: 2px solid var(--savanna-yellow);
                box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
                transform: translateY(-2px);
            }
            
            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: var(--pride-brown);
                border: 1px solid #fde68a;
                border-radius: 1rem;
                font-weight: 600;
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (Pride Rock Style) --- */}
        <header className="bg-gradient-to-b from-[#78350f] to-[#451a03] text-white pt-10 pb-16 px-6 rounded-b-[4rem] relative overflow-hidden shadow-xl z-10 border-b-4 border-orange-500">
             {/* Savanna Silhouette Overlay */}
             <div className="absolute bottom-0 left-0 w-full h-20 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
             <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-orange-600/20 rounded-full blur-3xl"></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-orange-600/40 w-fit px-4 py-1.5 rounded-full border border-orange-400/50 backdrop-blur-sm transform rotate-1">
                         <span className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse border border-white"></span>
                         <p className="text-yellow-200 text-[10px] font-bold tracking-[0.2em] savanna-font uppercase">TABLE: {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl savanna-font font-extrabold tracking-tighter leading-none mt-2 text-white drop-shadow-[0_2px_10px_rgba(249,115,22,0.5)]">
                         {brand?.name || "Pride Lands Grill"}
                     </h1>
                 </div>
                 
                 {/* Lion Badge Icon */}
                 <div className="w-18 h-18 bg-white/10 rounded-full border-2 border-yellow-500 flex items-center justify-center relative shadow-glow animate-sunset">
                     <div className="text-yellow-400"><Icon name="sun" size={40} /></div>
                     <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-600 rounded-full border border-white flex items-center justify-center text-white text-[10px]">
                        <Icon name="crown" size={14} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade-in">
                    {/* Hero Banner (Savanna Landscape) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-52 bg-amber-900 rounded-3xl overflow-hidden shadow-2xl mb-10 border-2 border-orange-500/50 p-1 group">
                             <div className="h-full w-full rounded-2xl overflow-hidden relative">
                                 {/* 🔴 Full Color Images (No Grayscale) */}
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                 />
                             </div>
                             
                             {/* Natural Borders */}
                             <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-yellow-400 opacity-50"></div>
                             <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-yellow-400 opacity-50"></div>
                             
                             <div className="absolute bottom-4 left-4 bg-orange-600/90 text-white px-5 py-2 rounded-full border border-white shadow-lg">
                                 <span className="savanna-font text-xs font-bold uppercase tracking-widest">HAKUNA MATATA!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-1">
                         <div>
                             <h2 className="text-2xl savanna-font text-orange-900 drop-shadow-sm transform -rotate-1">King's Feast</h2>
                             <p className="text-xs text-amber-700 font-bold uppercase tracking-widest ml-1">Savanna Specialties</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-white text-orange-600 px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 hover:bg-orange-50 transition-all savanna-font border border-orange-200 shadow-md active:scale-95">
                             View All <Icon name="leaf" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     {/* 🔴 Full Color Images */}
                                     <div className="w-full h-40 overflow-hidden relative bg-orange-50">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
                                                 SALE
                                             </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white relative">
                                         <h3 className="font-bold text-orange-950 text-sm line-clamp-2 mb-2 leading-tight font-sans">{p.name}</h3>
                                         <div className="flex justify-between items-end pt-1">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-amber-400 line-through font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-orange-700 font-black text-lg leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm active:scale-90">
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
                    <div className="relative mb-8 group mt-2">
                         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                             <div className="text-orange-400"><Icon name="paw" size={20} /></div>
                         </div>
                         <input type="text" placeholder="Scanning for prey (food)..." className="w-full pl-16 pr-8 py-4 rounded-full bg-white border border-amber-200 text-amber-900 placeholder:text-amber-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all text-lg font-bold shadow-inner" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-1 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-sm font-bold uppercase tracking-widest ${selectedCategoryId === c.id ? 'tab-active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.05}s`}}>
                                     {/* 🔴 Full Color Images */}
                                     <div className="w-full h-40 overflow-hidden relative bg-orange-50">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-orange-950 text-sm line-clamp-2 mb-2 leading-tight font-sans">{p.name}</h3>
                                         <div className="flex justify-between items-end pt-1">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-amber-400 line-through font-bold">{pricing.original}</span>}
                                                 <span className="text-orange-700 font-black text-lg leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm active:scale-90">
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
                    <div className="mb-8 flex items-center justify-between bg-white p-7 border-l-8 border-orange-600 rounded-xl shadow-xl relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-5 rotate-12 text-orange-900">
                            <Icon name="sun" size={120} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black savanna-font text-orange-950 italic">The Pride Log</h2>
                             <p className="text-xs text-amber-600 font-bold mt-1 uppercase tracking-widest">Wait for the Roar...</p>
                         </div>
                         <div className="w-16 h-16 bg-orange-50 border-2 border-orange-400 rounded-full flex items-center justify-center animate-bounce shadow-sm">
                             <div className="text-orange-600"><Icon name="scroll" size={32} /></div>
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o: any, idx: any) => (
                            <div key={o.id} className="bg-white p-6 border-l-4 border-amber-500 rounded-r-xl shadow-md relative overflow-hidden" style={{animationDelay: `${idx * 0.1}s`}}>
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4 border-b border-orange-100 pb-3">
                                     <span className="text-sm text-amber-900 font-bold savanna-font flex items-center gap-1">
                                         ORDER #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full flex items-center gap-1.5 shadow-sm
                                         ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>
                                         {o.status === 'pending' ? 'COOKING...' : 'COMPLETED'}
                                     </span>
                                </div>

                                {/* Items */}
                                <div className="mb-4 space-y-3 font-sans">
                                    {o.order_items.map((i: any, idx: any) => {
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        return (
                                            <div key={idx} className="flex justify-between items-start text-sm text-orange-950">
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-snug font-medium">
                                                        <span className="text-orange-600 font-bold">{quantity}x</span> {i.product_name}
                                                    </span>
                                                    {i.variant !== 'normal' && (
                                                        <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md font-bold mt-1 uppercase">
                                                            {i.variant}
                                                        </span>
                                                    )}
                                                    {i.note && <span className="text-[10px] text-amber-400 italic mt-0.5">"{i.note}"</span>}
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-orange-900 font-bold">{finalPriceTotal}.-</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-dashed border-orange-200">
                                     <span className="font-bold text-amber-400 text-xs uppercase tracking-wider">TOTAL LOOT</span>
                                     <span className="font-black text-xl text-orange-800">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Tribal Art Style) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[75px] bg-[#451a03]/95 backdrop-blur-md shadow-2xl flex justify-around items-center px-4 z-[100] rounded-full border border-white/10">
             
             <button onClick={() => setActiveTab('home')} className={`group transition-all duration-300 w-16 flex flex-col items-center gap-1 ${activeTab === 'home' ? 'transform -translate-y-2' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-orange-500/20 text-orange-400 drop-shadow-[0_0_5px_#f97316]' : 'text-amber-200/50'}`}>
                     <Icon name="home" size={20} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`group transition-all duration-300 w-16 flex flex-col items-center gap-1 ${activeTab === 'menu' ? 'transform -translate-y-2' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-orange-500/20 text-orange-400 drop-shadow-[0_0_5px_#f97316]' : 'text-amber-200/50'}`}>
                     <Icon name="menu" size={20} />
                 </div>
             </button>

             {/* Cart Button (The Great Sun) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-18 h-18 bg-gradient-to-tr from-orange-600 to-yellow-400 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.5)] flex items-center justify-center text-white border-4 border-white/80 active:scale-90 transition-all duration-300 z-20 group">
                     <div className="group-hover:rotate-12 transition-transform">
                        <Icon name="basket" size={28} />
                     </div>
                     {cart?.length > 0 && (
                         <span className="absolute top-[-5px] right-[-5px] bg-red-600 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black border border-white animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`group transition-all duration-300 w-16 flex flex-col items-center gap-1 ${activeTab === 'status' ? 'transform -translate-y-2' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-orange-500/20 text-orange-400 drop-shadow-[0_0_5px_#f97316]' : 'text-amber-200/50'}`}>
                     <Icon name="check" size={20} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[110] flex items-end justify-center bg-[#451a03]/80 backdrop-blur-sm animate-fade-in p-0 md:items-center">
                <div className="w-full max-w-md md:max-w-lg bg-white h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl border-t-8 border-orange-500 rounded-t-[3rem] relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-orange-600 rounded-full border-2 border-orange-100 flex items-center justify-center hover:bg-orange-50 transition-colors shadow-md active:scale-90">
                            <Icon name="x" size={24} />
                        </button>
                        {/* 🔴 Full Color Images */}
                        <div className="relative w-full h-85 overflow-hidden border-b-4 border-orange-100 rounded-b-[2.5rem] bg-orange-50">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-orange-600 text-white font-black text-2xl savanna-font rounded-xl border-4 border-white shadow-xl transform -rotate-1">
                                     {currentPriceObj.discount > 0 && (
                                        <div className="text-xs text-yellow-200 line-through font-sans font-bold leading-none absolute -top-4 left-0 bg-orange-800 px-2 py-0.5 rounded-md">{currentPriceObj.original}</div>
                                     )}
                                     {currentPriceObj.final}.-
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32">
                        <h2 className="text-3xl savanna-font text-orange-950 mb-6 leading-tight drop-shadow-sm uppercase tracking-widest">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            
                            {/* Variants - Hakuna Matata Style */}
                            <div>
                                <label className="block text-sm font-bold text-orange-900 mb-3 ml-1 tracking-wide uppercase">Select Portion</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { key: 'normal', label: 'Regular', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'Special', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'Jumbo', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-3 border-2 transition-all flex flex-col items-center justify-center gap-1 rounded-xl active:scale-95
                                                ${variant === v.key 
                                                    ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-md' 
                                                    : 'bg-white border-orange-100 text-amber-900 hover:border-orange-300'}`}
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wider">{v.label}</span>
                                            <span className="text-lg font-black savanna-font">{v.final}.-</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty & Total - Tribal Box */}
                            <div className="flex items-center justify-between py-4 mt-2 bg-orange-950 p-4 rounded-2xl shadow-lg border border-white/10">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white/10 text-white rounded-lg flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all font-black text-2xl border border-white/20">
                                        <Icon name="minus" size={20} />
                                    </button>
                                    <span className="text-3xl font-black w-14 text-center savanna-font text-yellow-400">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-orange-500 text-white rounded-lg flex items-center justify-center hover:bg-orange-400 active:scale-90 transition-all font-black text-2xl border border-white/20">
                                        <Icon name="plus" size={20} />
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-orange-400 font-black uppercase tracking-[0.2em] mb-1">Feast Value</p>
                                    <p className="text-4xl font-black text-white savanna-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* Note - Papyrus Box */}
                            <div>
                                <label className="block text-sm font-bold text-orange-900 mb-2 ml-1 tracking-wide uppercase">Notes for the Pride</label>
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Extra juicy, no bones..." 
                                    className="w-full p-4 bg-orange-50 border border-orange-200 text-orange-900 focus:border-orange-500 focus:outline-none h-24 resize-none text-lg font-bold rounded-2xl shadow-inner placeholder:text-orange-300"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border-2 border-orange-200 text-orange-600 font-black text-xl rounded-2xl active:scale-95 transition-all shadow-sm savanna-font uppercase">
                                Add to Pack
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-lion active:scale-95 transition-all flex items-center justify-center gap-2 text-2xl">
                                HUNT! <Icon name="paw" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (Pride Pack) --- */}
        {activeTab === 'cart' && (
            <div className="fixed inset-0 z-[130] flex items-end justify-center bg-amber-950/80 backdrop-blur-sm animate-fade-in md:items-center">
                <div className="w-full max-w-md md:max-w-lg bg-white border-t-[10px] border-orange-500 flex flex-col shadow-2xl h-[92vh] md:h-auto md:max-h-[90vh] relative rounded-t-[4rem]">
                    
                    <button 
                        onClick={() => setActiveTab('menu')}
                        className="absolute top-6 right-6 z-50 w-12 h-12 bg-orange-100 text-orange-500 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors rounded-full shadow-sm"
                    >
                        <Icon name="x" size={24} />
                    </button>

                    <div className="w-full py-4 cursor-pointer hover:bg-orange-50 rounded-t-[4rem] border-b border-orange-100" onClick={() => setActiveTab('menu')}>
                        <div className="w-24 h-2 bg-orange-200 rounded-full mx-auto mt-2 opacity-50"></div>
                    </div>

                    <div className="flex justify-between items-center mb-6 px-10 pt-8">
                        <h2 className="text-4xl savanna-font text-orange-900 transform -rotate-1 tracking-widest">Pride Pack</h2>
                        <div className="w-14 h-14 bg-orange-600 text-white border-2 border-white rounded-2xl flex items-center justify-center font-black text-2xl savanna-font shadow-lg">
                            {cart.reduce((a: any, b: any) => a + b.quantity, 0)}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                        {cart.map((item: any, idx: any) => (
                            <div key={idx} className="flex items-center gap-4 bg-white p-3 border-2 border-orange-100 rounded-2xl shadow-sm relative group">
                                {/* 🔴 Full Color Images */}
                                <img src={item.image_url} className="w-20 h-20 object-cover rounded-xl border border-orange-200" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-orange-950 text-lg leading-tight truncate font-sans">
                                        {item.name}
                                    </div>
                                    <div className="text-sm font-bold mt-1 text-orange-700 flex flex-wrap gap-2">
                                        <span className="text-orange-500 font-black">{item.quantity}x</span>
                                        {item.variant !== 'normal' && <span className="bg-orange-100 text-orange-800 px-2 py-0.5 text-xs uppercase font-bold tracking-wider rounded-md">{item.variant}</span>}
                                    </div>
                                    {item.note && <div className="text-xs text-amber-500 italic mt-1 truncate pl-1">"{item.note}"</div>}
                                </div>
                                <div className="flex flex-col items-end gap-2 pl-2">
                                     <span className="font-black text-orange-900 text-xl savanna-font">{item.price * item.quantity}.-</span>
                                     <button onClick={() => updateQuantity(idx, -1)} className="w-8 h-8 bg-orange-50 text-orange-300 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors active:scale-90">
                                         <Icon name="trash" size={16} />
                                     </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-orange-300 space-y-4 opacity-70">
                                <Icon name="basket" size={64} />
                                <span className="text-2xl font-black savanna-font uppercase">Empty Pack</span>
                            </div>
                        )}
                    </div>

                    <div className="p-10 bg-amber-950 border-t-4 border-orange-500 relative z-30 rounded-t-[3rem]">
                        <div className="flex justify-between items-center mb-8 pb-6 border-b border-dashed border-white/20">
                            <div>
                                <p className="text-[10px] text-orange-300 font-black uppercase tracking-widest savanna-font">Total Loot</p>
                                <p className="text-5xl font-black text-white savanna-font drop-shadow-md">{cartTotal}.-</p>
                            </div>
                             <div className="w-20 h-20 bg-white/5 border-2 border-orange-500/50 rounded-full flex items-center justify-center text-yellow-400 transform rotate-6 shadow-2xl">
                                <Icon name="basket" size={40} />
                            </div>
                        </div>
                        <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-6 btn-lion text-3xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-wider rounded-2xl">
                            ROAR! GO! <Icon name="check" size={24} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CONFIRMATION MODAL (Circle of Life) --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#451a03]/95 z-[250] flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-sm bg-white border-4 border-orange-500 p-10 text-center shadow-2xl relative overflow-hidden rounded-3xl animate-fade-in">
                    
                    <div className="w-24 h-24 bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-6 border-2 border-orange-500 shadow-glow relative z-10 rounded-full animate-pulse">
                        <Icon name="crown" size={48} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-2xl savanna-font text-orange-950 mb-2 uppercase tracking-wide">Seal the Feast?</h3>
                            <p className="text-amber-700 mb-8 font-bold tracking-wide">Add "{selectedProduct.name}" to the pack?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 btn-lion text-xl shadow-lg rounded-xl">YES! HUNT NOW</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-transparent border-2 border-orange-200 text-orange-400 font-black hover:bg-orange-50 rounded-xl uppercase">Just Add to Pack</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-2xl savanna-font text-orange-950 mb-2 uppercase tracking-widest">Circle of Life?</h3>
                            <p className="text-amber-700 mb-8 font-bold tracking-wide">Bring all the Pride's treasures together for the final hunt?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 btn-lion text-2xl shadow-lg rounded-xl">YES! FOR THE KING!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-transparent border-2 border-orange-200 text-orange-400 font-black hover:bg-orange-50 rounded-xl uppercase">Retreat</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}