import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Courage Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Windmill / Farmhouse
    home: <path d="M12 2L2 12h3v8h14v-8h3L12 2z M12 5l6 6V18H6v-7l6-6z" strokeWidth="3" strokeLinejoin="round" />, 
    // Menu -> Slab / Stone Tablet
    menu: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" />,
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Computer / Monitor
    basket: <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z M12 10h2v2h-2z" />,
    // Clock -> Moon / Pocket Watch
    clock: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />,
    // Chef -> Eustace's Hat / Mask
    chef: <path d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" />, 
    // Star -> Muriel's Rolling Pin / Sparkle
    star: <path d="M12 2l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9z" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Ghost / Spirit
    flame: <path d="M12 2C8 2 5 6 5 10c0 4 3 6 3 9 0 2-2 3-2 3h12s-2-1-2-3c0-3 3-5 3-9 0-4-3-8-7-8z" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    // Dog Bone
    bone: <path d="M17 4c-1.66 0-3 1.34-3 3 0 .2.02.38.06.56C13.56 7.22 12.82 7 12 7c-.82 0-1.56.22-2.06.56.04-.18.06-.36.06-.56 0-1.66-1.34-3-3-3s-3 1.34-3 3c0 1.28.8 2.37 1.94 2.8C5.28 10.4 5 11.16 5 12c0 1.66 1.34 3 3 3 1.66 0 3-1.34 3-3 0-.2-.02-.38-.06-.56.5-.34 1.24-.56 2.06-.56.82 0 1.56.22 2.06.56-.04.18-.06.36-.06.56 0 1.66 1.34 3 3 3s3-1.34 3-3c0-.84-.28-1.6-.74-2.2C21.2 12.37 22 11.28 22 10c0-1.66-1.34-3-3-3-.84 0-1.6.28-2.2.74C16.6 7.28 15.8 6.4 16 5.5 16.2 4.6 17 4 17 4z" />,
    // Mask
    mask: <path d="M2 6h20v12H2z M5 9h3v3H5z M16 9h3v3h-3z" />,
    // UFO
    ufo: <path d="M12 2C6 2 2 6 2 8c0 1.5 2 3 5 3.5V14h10v-2.5c3-.5 5-2 5-3.5 0-2-4-6-10-6z M12 4c2 0 4 1 4 2s-2 2-4 2-4-1-4-2 2-2 4-2z" />
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
      {name === 'clock' && <path d="M12 6v6l4 2" />}
      {name === 'chef' && <path d="M12 8v4" />}
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
  // Removed orderNote
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
             handleCheckout(""); 
             setPendingCookNow(false);
        }
        const timer = setTimeout(() => {
             if(pendingCookNow) {
                 handleCheckout(""); 
                 setPendingCookNow(false);
             }
        }, 1000);
        return () => clearTimeout(timer);
    }
    prevCartLength.current = cart?.length || 0;
  }, [cart, pendingCookNow, handleCheckout]);


  if (loading && !isVerified) return <div className="min-h-screen bg-[#1e1b4b] flex items-center justify-center text-[#f472b6] font-black text-2xl">LOADING...</div>;

  const currentPriceObj = selectedProduct 
    ? calculatePrice(selectedProduct, variant) 
    : { final: 0 };

  // --- 📝 Robust Data Passing ---
  const handleAdd = (addToCartOnly = true) => {
    if (!selectedProduct) return;
    const finalNote = note ? note.trim() : ""; 
    
    const productToAdd = { 
        ...selectedProduct, 
        variant: variant, 
        note: finalNote,
        specialRequest: finalNote, 
        comment: finalNote,
        remark: finalNote
    };

    if (addToCartOnly) {
        for(let i=0; i<qty; i++) {
            handleAddToCart(productToAdd, variant, finalNote);
        }
        setSelectedProduct(null);
    } else {
        if (cart && cart.length > 0) setShowConfirm(true); 
        else performCookNow();
    }
  };

  const performCookNow = () => {
    const finalNote = note ? note.trim() : "";
    const productToAdd = { 
        ...selectedProduct, 
        variant: variant, 
        note: finalNote,
        specialRequest: finalNote,
        comment: finalNote,
        remark: finalNote
    };
    
    for(let i=0; i<qty; i++) {
        handleAddToCart(productToAdd, variant, finalNote);
    }
    setPendingCookNow(true);
    setSelectedProduct(null);
  };

  const onCheckoutClick = () => {
      handleCheckout("");
      setShowConfirm(false);
  };

  return (
    // Theme: Courage the Cowardly Dog - The Middle of Nowhere
    <div className="w-full max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden border-x-4 border-slate-900 bg-[#1e1b4b] font-sans text-[#fefce8]">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Creepster&family=Mali:wght@400;600;700&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                /* Courage Palette */
                --courage-pink: #f472b6; 
                --nowhere-purple: #2e1065; 
                --muriel-yellow: #facc15; 
                --eustace-green: #365314; 
                --scary-red: #991b1b;
                --bg-creepy: #1e1b4b;
                --text-ghost: #fefce8;
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg-creepy);
                /* Windmill/Nowhere Pattern */
                background-image: 
                    radial-gradient(circle at 10% 20%, rgba(244, 114, 182, 0.05) 2px, transparent 3px),
                    radial-gradient(circle at 90% 80%, rgba(250, 204, 21, 0.05) 2px, transparent 3px);
                background-size: 100px 100px;
                background-attachment: fixed;
                color: var(--text-ghost);
                margin: 0;
                padding: 0;
            }

            .spooky-font {
                font-family: 'Creepster', cursive;
                letter-spacing: 2px;
            }

            .handwritten-font {
                font-family: 'Mali', cursive;
            }

            /* Scared Shaking Animation */
            @keyframes courage-shake {
                0% { transform: translate(1px, 1px) rotate(0deg); }
                10% { transform: translate(-1px, -2px) rotate(-1deg); }
                20% { transform: translate(-3px, 0px) rotate(1deg); }
                30% { transform: translate(3px, 2px) rotate(0deg); }
                40% { transform: translate(1px, -1px) rotate(1deg); }
                50% { transform: translate(-1px, 2px) rotate(-1deg); }
                100% { transform: translate(1px, 1px) rotate(0deg); }
            }

            .animate-shake {
                animation: courage-shake 0.5s infinite;
            }

            /* Item Card - Old TV / Picture Frame Look */
            .item-card {
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                position: relative;
                background: #262626; /* Dark Screen */
                border-radius: 1rem;
                border: 4px solid #444;
                box-shadow: 0 10px 20px rgba(0,0,0,0.5);
                overflow: hidden;
            }
            
            .item-card:hover, .item-card:active {
                transform: scale(0.98) translateY(2px);
                border-color: var(--courage-pink);
                box-shadow: 0 0 20px rgba(244, 114, 182, 0.3);
            }

            .ordering-locked {
                filter: grayscale(1) blur(3px);
                pointer-events: none;
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            .btn-courage {
                background: linear-gradient(135deg, var(--courage-pink) 0%, #db2777 100%);
                color: white;
                border: 3px solid white;
                border-radius: 1rem;
                font-weight: 700;
                box-shadow: 0 4px 15px rgba(244, 114, 182, 0.4);
                transition: all 0.2s;
            }
            
            .btn-courage:active {
                transform: scale(0.95);
                box-shadow: 0 0 5px rgba(244, 114, 182, 0.6);
            }

            .tab-active {
                background: var(--courage-pink) !important;
                color: white !important;
                border: 3px solid white;
                box-shadow: 0 0 15px var(--courage-pink);
                transform: rotate(-2deg) scale(1.05);
            }
            
            .tab-btn {
                transition: all 0.3s;
                background: #1e1b4b;
                color: #94a3b8;
                border: 2px solid #334155;
                border-radius: 0.5rem;
            }

            .modal-handle-area {
                cursor: pointer;
                padding: 12px 0 20px 0;
                width: 100%;
            }

            .page-transition {
                animation: fadeIn 0.6s ease-in-out;
            }
            
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

            /* Computer/Monitor scanline effect */
            .scanline {
                width: 100%;
                height: 2px;
                background: rgba(255,255,255,0.05);
                position: absolute;
                top: 0;
                animation: scan 4s linear infinite;
                z-index: 5;
                pointer-events: none;
            }

            @keyframes scan {
                from { top: 0; }
                to { top: 100%; }
            }
        `}} />

        {/* --- Header (The Farmhouse at Night Style) --- */}
        <header className="bg-gradient-to-b from-[#2e1065] to-[#1e1b4b] text-white pt-10 pb-16 px-6 rounded-b-[4rem] relative overflow-hidden shadow-xl z-10 border-b-4 border-slate-950">
             {/* Spooky Eyes */}
             <div className="absolute top-10 right-20 w-4 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
             <div className="absolute top-10 right-14 w-4 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-black/40 w-fit px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                         <span className="w-3 h-3 rounded-full bg-pink-400 animate-shake"></span>
                         <p className="text-pink-300 text-[10px] font-bold tracking-[0.2em] handwritten-font uppercase">The things I do for love...</p>
                     </div>
                     <h1 className="text-3xl spooky-font tracking-wider leading-none mt-2 text-white drop-shadow-[0_4px_0_#000]">
                         {brand?.name || "Nowhere Diner"}
                     </h1>
                 </div>
                 {/* Courage Badge */}
                 <div className="w-20 h-20 bg-white rounded-full border-4 border-pink-400 flex items-center justify-center relative shadow-lg animate-shake">
                     <Icon name="chef" size={40} className="text-pink-500" />
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full border-2 border-black flex items-center justify-center text-black">
                        <Icon name="mask" size={14} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="page-transition">
                    {/* Hero Banner (Old Computer Style) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-black rounded-2xl overflow-hidden shadow-2xl mb-10 border-4 border-slate-700 p-1 group">
                             <div className="scanline"></div>
                             <div className="h-full w-full rounded-xl overflow-hidden bg-slate-900 opacity-60 group-hover:opacity-100 transition-opacity relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover" 
                                 />
                             </div>
                             <div className="absolute top-4 right-4 bg-green-900 text-green-400 px-4 py-1 border border-green-500 shadow-md">
                                 <span className="font-mono text-[10px] uppercase">COMPUTER: ACTIVE</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2">
                         <div>
                             <h2 className="text-3xl spooky-font text-pink-400 drop-shadow-[2px_2px_0_#000]">Stranger Grub</h2>
                             <p className="text-sm text-slate-400 font-bold handwritten-font ml-1">"Stupid dog! You make me look bad!"</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-transparent text-pink-400 px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 hover:bg-pink-500/10 transition-all border-2 border-pink-400/50 shadow-md active:scale-95">
                             INVESTIGATE <Icon name="search" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-black border-b-2 border-slate-700 mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 opacity-80" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-[#991b1b] text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-sm spooky-font">
                                                SCARY GOOD!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-[#262626]">
                                         <h3 className="font-bold text-white text-lg line-clamp-2 mb-1 leading-tight handwritten-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-gray-500 line-through font-bold decoration-red-900">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#f472b6] font-black text-xl handwritten-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#365314] text-white border border-[#4d7c0f] flex items-center justify-center rounded-full hover:bg-[#4d7c0f] transition-all shadow-sm active:scale-90">
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
                <section className="page-transition pt-4">
                    <div className="relative mb-8 group">
                         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                             <Icon name="search" className="text-pink-400" />
                         </div>
                         <input type="text" placeholder="Scanning for threats?..." className="w-full pl-16 pr-8 py-5 rounded-none bg-slate-900 border-b-4 border-pink-600 text-pink-100 placeholder:text-slate-600 focus:outline-none focus:border-muriel-yellow transition-all text-lg font-bold handwritten-font" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-lg font-bold spooky-font uppercase ${selectedCategoryId === c.id ? 'tab-active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-black border-b-2 border-slate-700 mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 opacity-80" />
                                     </div>
                                     <div className="p-4 bg-[#262626]">
                                         <h3 className="font-bold text-white text-sm line-clamp-2 mb-1 leading-tight handwritten-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-[10px] text-gray-500 line-through font-bold">{pricing.original}</span>}
                                                <span className="text-[#f472b6] font-black text-xl handwritten-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#365314] text-white border border-[#4d7c0f] flex items-center justify-center rounded-full hover:bg-[#4d7c0f] transition-all shadow-sm active:scale-90">
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
                <section className="page-transition pt-4 pb-24">
                    <div className="mb-8 flex items-center justify-between bg-black p-8 border-4 border-slate-700 rounded-none shadow-[10px_10px_0_#991b1b] relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-5 rotate-12 text-white">
                            <Icon name="flame" size={100} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black spooky-font text-white tracking-widest">MISSION LOG</h2>
                             <p className="text-sm text-pink-400 font-bold mt-1 handwritten-font uppercase">Are they coming?!</p>
                         </div>
                         <div className="w-16 h-16 bg-slate-900 border-4 border-pink-500 rounded-full flex items-center justify-center animate-pulse shadow-md text-pink-500">
                             <Icon name="ufo" size={32} />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-[#262626] p-6 border border-slate-600 rounded-lg shadow-sm relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-pink-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                         <Icon name="menu" size={14} /> Mission #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-wide border rounded-full flex items-center gap-1.5 shadow-sm
                                        ${o.status === 'pending' ? 'bg-[#365314] text-white border-[#4d7c0f]' : 'bg-[#1e1b4b] text-white border-pink-500'}`}>
                                         {o.status === 'pending' ? 'ANALYZING...' : 'SAFE!'}
                                     </span>
                                </div>
                                <div className="mb-4 space-y-2 bg-[#171717] p-5 rounded-lg border border-slate-800">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-slate-300 font-bold border-b border-slate-700 pb-2 last:border-0 handwritten-font">
                                            <div className="flex flex-col">
                                                <span>{i.quantity}x {i.product_name}</span>
                                                {/* Variant */}
                                                {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-yellow-400 bg-yellow-900/30 px-1.5 rounded w-fit border border-yellow-800 uppercase font-bold">{i.variant}</span>}
                                                {/* Note */}
                                                {i.note && <span className="text-[10px] text-pink-400 italic bg-pink-900/20 px-2 py-0.5 rounded border border-pink-900 mt-1 block w-fit shadow-sm"><Icon name="pencil" size={8} /> "{i.note}"</span>}
                                            </div>
                                            <span className="text-[#f472b6]">{i.price * i.quantity}.-</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                     <span className="font-bold text-slate-500 text-xs uppercase tracking-widest">THREAT LEVEL</span>
                                     <span className="font-black text-white text-3xl spooky-font">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Nowhere Style) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[85px] bg-[#111]/90 backdrop-blur-md shadow-2xl flex justify-around items-center px-4 z-[100] border-t border-white/10 rounded-2xl">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-pink-500/20' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-pink-400' : 'text-slate-600'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-pink-500/20' : ''}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-pink-400' : 'text-slate-600'}`} />
                 </div>
             </button>

             {/* Big Cart Button (Computer Bag) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-18 h-18 bg-pink-500 rounded-none shadow-[0_0_20px_rgba(244,114,182,0.5)] flex items-center justify-center text-white border-4 border-white active:scale-90 transition-all duration-100 z-20 group hover:bg-pink-600">
                     <Icon name="basket" size={32} />
                     {cart?.length > 0 && (
                         <span className="absolute top-[-5px] right-[-5px] bg-[#991b1b] text-white text-[10px] font-black w-6 h-6 flex items-center justify-center border-2 border-white animate-shake">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-pink-500/20' : ''}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-pink-400' : 'text-slate-600'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/90 backdrop-blur-md animate-fade-in">
                <div className="w-full max-w-md bg-slate-900 border-t-4 border-pink-500 h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl relative animate-image-pop">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-black/50 text-white rounded-none border border-pink-500 flex items-center justify-center hover:bg-pink-900 transition-colors shadow-md active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-80 overflow-hidden border-b-2 border-pink-900/50 bg-black">
                            <div className="scanline"></div>
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover opacity-70" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-pink-500 text-white font-black text-3xl spooky-font border-2 border-white shadow-[0_0_15px_rgba(244,114,182,0.8)] transform -rotate-2">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-pink-200 decoration-black decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32 relative">
                        <h2 className="text-4xl spooky-font text-white mb-6 leading-tight drop-shadow-glow uppercase tracking-widest">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            {/* --- 3 PRICES VARIANT SELECTOR --- */}
                            <div>
                                <label className="block text-sm font-bold text-pink-400 mb-3 handwritten-font uppercase tracking-wider">CHOOSE FATE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'SCARED', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'BRAVE', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'MONSTER', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 border-2 transition-all flex flex-col items-center justify-between h-24 handwritten-font
                                                ${variant === v.key 
                                                    ? 'bg-pink-600 border-white shadow-md -translate-y-1 text-white' 
                                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-pink-500 hover:text-pink-500'}`}
                                        >
                                            <span className="text-xs font-black tracking-widest">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through text-gray-500 decoration-red-500 decoration-2">{v.original}</span>
                                                )}
                                                <span className="text-xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2 border-t border-b border-slate-800">
                                <div className="flex items-center gap-4 bg-black p-3 border-2 border-slate-800">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-slate-800 text-white rounded-none flex items-center justify-center hover:bg-slate-700 active:scale-90 transition-all font-black text-2xl border border-white/20"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-pink-400 handwritten-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-pink-600 text-white rounded-none flex items-center justify-center hover:bg-pink-500 active:scale-90 transition-all font-black text-2xl border border-white/20"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] mb-1 handwritten-font">Energy</p>
                                    <p className="text-4xl font-black text-white spooky-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Item Note Input */}
                            <div className="relative">
                                <label className="block text-sm font-bold text-pink-400 mb-2 handwritten-font uppercase tracking-wider">Warning Note:</label>
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Scribble a note for Muriel..." 
                                    className="w-full p-6 pl-10 bg-slate-800 border-2 border-slate-700 text-pink-100 placeholder:text-slate-600 focus:border-pink-500 focus:outline-none h-36 resize-none text-xl font-bold transition-colors shadow-inner handwritten-font"
                                />
                                <div className="absolute top-10 left-4 text-pink-600 pointer-events-none">
                                    <Icon name="pencil" size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-transparent border-2 border-pink-400 text-pink-400 font-black text-xl active:scale-95 transition-all shadow-md handwritten-font uppercase">
                                Hide Gear
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-courage text-2xl active:scale-95 transition-all flex items-center justify-center gap-2 spooky-font uppercase tracking-wider">
                                SURVIVE! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ORDER SUMMARY MODAL --- */}
        <div id="orderSummaryOverlay" className={`fixed inset-0 bg-black/95 z-[130] backdrop-blur-md animate-fade-in ${activeTab === 'cart' ? 'block' : 'hidden'}`} onClick={() => setActiveTab('menu')}></div>
        <div id="orderSummary" className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#1a1a1a] border-t-8 border-pink-950 z-[140] flex flex-col shadow-2xl h-[92vh] transition-transform duration-300 ${activeTab === 'cart' ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="sticky top-0 bg-[#1a1a1a] z-20 border-b border-white/5 p-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                <div className="w-24 h-1.5 bg-pink-900 rounded-full mx-auto mt-2 opacity-30"></div>
            </div>
            
            <div className="flex justify-between items-center mb-6 px-10 pt-8">
                <h2 className="text-4xl spooky-font text-white tracking-widest transform -rotate-1">Basement Gear</h2>
                <div className="w-14 h-14 bg-pink-900/40 text-pink-400 border-2 border-pink-500 rounded-none flex items-center justify-center font-black text-2xl shadow-lg">
                    <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 px-8 pb-4 no-scrollbar">
                {cart.map((item: any, idx: any) => (
                    <div key={idx} className="flex items-center gap-4 bg-black p-4 border border-slate-800 rounded-none shadow-sm relative overflow-hidden hover:border-pink-900 transition-all">
                        <div className="w-20 h-20 bg-slate-900 overflow-hidden border border-slate-700 shrink-0">
                            <img src={item.image_url} className="w-full h-full object-cover opacity-80" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-white text-xl leading-tight handwritten-font tracking-wide">
                                {item.name} <span className="text-pink-500">x{item.quantity}</span>
                            </div>
                            <div className="text-sm font-bold mt-1 text-slate-500">
                                {item.variant !== 'normal' && <span className="bg-pink-900 text-pink-200 px-2 py-0.5 rounded-none text-xs mr-2 border border-pink-700 uppercase">{item.variant}</span>}
                                {/* 🔥 VISIBLE ITEM NOTE IN CART */}
                                {item.note && (
                                    <span className="block mt-1 text-slate-400 text-[12px] italic handwritten-font">
                                        <Icon name="pencil" size={10} /> "{item.note}"
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className="font-black text-white text-2xl spooky-font">{item.price * item.quantity}.-</span>
                             <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center hover:bg-red-900/40 transition-colors border border-red-900/50 shadow-sm active:scale-90">
                                 <Icon name="trash" size={18} />
                             </button>
                        </div>
                    </div>
                ))}
                {cart.length === 0 && (
                    <div className="text-center py-20 text-slate-700 font-bold text-2xl spooky-font opacity-50">
                        Nothing but dust...
                    </div>
                )}
            </div>

            <div className="p-10 bg-black border-t-4 border-slate-900 relative z-30">
                <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-dashed border-slate-800">
                    <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest handwritten-font">Total Risk</p>
                        <p className="text-5xl font-black text-pink-400 spooky-font drop-shadow-glow">{cartTotal}.-</p>
                    </div>
                    <div className="w-20 h-20 bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-pink-500 transform rotate-6 shadow-2xl">
                        <Icon name="basket" size={40} />
                    </div>
                </div>
                <button onClick={() => { onCheckoutClick(); }} className="w-full py-6 btn-courage text-3xl active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] spooky-font">
                    <span>LINK START!</span> <Icon name="check" size={32} strokeWidth={4} />
                </button>
            </div>
        </div>

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-black/98 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-jello">
                <div className="w-full max-w-sm bg-slate-900 border-2 border-pink-500 p-10 text-center shadow-[0_0_40px_rgba(244,114,182,0.3)] relative overflow-hidden rounded-sm">
                    <div className="w-28 h-28 bg-pink-500/10 text-pink-500 rounded-none flex items-center justify-center mx-auto mb-8 border border-pink-500 shadow-lg relative z-10 animate-shake">
                        <Icon name="flame" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-3xl spooky-font text-white mb-4 leading-tight relative z-10 uppercase tracking-widest">Added to Stash?</h3>
                            <p className="text-lg text-slate-400 mb-10 font-bold handwritten-font relative z-10">Add "{selectedProduct.name}" and hide?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-pink-500 text-white font-black border border-white shadow-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl handwritten-font uppercase">YES! HIDE IT!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-transparent border border-slate-700 text-slate-500 font-black text-lg active:scale-95 transition-transform hover:bg-slate-800 handwritten-font uppercase">Just Stash</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl spooky-font text-white mb-4 leading-tight relative z-10 uppercase tracking-widest">Safety First?</h3>
                            <p className="text-lg text-slate-400 mb-10 font-bold handwritten-font relative z-10">Combine all rations before the monsters arrive?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                {/* Pass orderNote to handleCheckout */}
                                <button onClick={() => { onCheckoutClick(); }} className="w-full py-5 bg-pink-500 text-white font-black border border-white shadow-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl handwritten-font uppercase">YES! FOR MURIEL!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-transparent border border-slate-700 text-slate-500 font-black text-lg active:scale-95 transition-transform hover:bg-slate-800 handwritten-font uppercase">Retreat!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}