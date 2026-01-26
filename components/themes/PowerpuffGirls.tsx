import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Powerpuff Style) ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Townsville Skyline
    home: <path d="M2 22 L12 2 L22 22 H2 Z M12 8 V16 M8 16 H16" strokeWidth="3" strokeLinejoin="round" />, 
    // Menu -> Flask / Chemical X
    menu: <path d="M9 3h6v4l3 5v9H6v-9l3-5z M9 12h6" strokeWidth="3" strokeLinejoin="round" />,
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Heart
    basket: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />,
    // Clock -> Hotline Phone
    clock: <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />,
    // Chef -> Mojo Jojo Hat / Villain
    chef: <path d="M2 12h20M4 12V6a8 8 0 0 1 16 0v6" />, 
    // Star -> Sparkle
    star: <path d="M12 2l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9z" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Lightning Bolt / Action
    flame: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    wand: <path d="M20 4L4 20 M20 4l-2 2 M20 4l-2-2 M4 20l2-2 M4 20l2 2" strokeWidth="3" />,
    shield: <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />,
    receipt: <path d="M4 2v20l4-2 4 2 4-2 4 2V2H4z" />
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
      {name === 'clock' && <circle cx="12" cy="12" r="10" strokeWidth="2" />}
      {name === 'basket' && <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" stroke="none" />}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#fdf2f8] flex items-center justify-center text-[#f472b6] font-black text-2xl">LOADING...</div>;

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
    // Theme: Powerpuff Girls - Townsville Diner
    <div className="w-full max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden border-x-4 border-zinc-900 bg-white font-sans text-[#1e1b4b]">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Itim&family=Mali:wght@400;600;700&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                /* Powerpuff Palette */
                --blossom-pink: #f472b6; 
                --bubbles-blue: #38bdf8;
                --buttercup-green: #4ade80;
                --chemical-x-black: #18181b;
                --bg-townsville: #fdf2f8;
                --text-hero: #1e1b4b;
            }

            body {
                font-family: 'Itim', 'Sarabun', sans-serif;
                background-color: var(--bg-townsville);
                /* Heart & Star Pattern */
                background-image: 
                    radial-gradient(circle at 10% 20%, rgba(244, 114, 182, 0.1) 20%, transparent 21%),
                    radial-gradient(circle at 80% 80%, rgba(56, 189, 248, 0.1) 15%, transparent 16%),
                    radial-gradient(circle at 50% 50%, rgba(74, 222, 128, 0.1) 25%, transparent 26%);
                background-size: 150px 150px;
                background-attachment: fixed;
                -webkit-tap-highlight-color: transparent;
                color: var(--text-hero);
                margin: 0;
                padding: 0;
            }

            .hero-font {
                font-family: 'Itim', cursive;
                text-transform: uppercase;
                font-weight: 700;
            }

            /* Powerpuff Action Animation */
            @keyframes action-zoom {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1) rotate(2deg); }
            }

            .animate-hero {
                animation: action-zoom 3s infinite ease-in-out;
            }

            @keyframes bounceIn {
                from,
                20%,
                40%,
                60%,
                80%,
                to {
                    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
                }

                0% {
                    opacity: 0;
                    transform: scale3d(0.3, 0.3, 0.3);
                }

                20% {
                    transform: scale3d(1.1, 1.1, 1.1);
                }

                40% {
                    transform: scale3d(0.9, 0.9, 0.9);
                }

                60% {
                    opacity: 1;
                    transform: scale3d(1.03, 1.03, 1.03);
                }

                80% {
                    transform: scale3d(0.97, 0.97, 0.97);
                }

                to {
                    opacity: 1;
                    transform: scale3d(1, 1, 1);
                }
            }

            .page-transition {
                animation: bounceIn 0.8s;
            }
            
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

            /* Item Card - Sticker / Comic Style */
            .item-card {
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                background: white;
                border-radius: 2rem;
                border: 4px solid var(--chemical-x-black);
                box-shadow: 8px 8px 0px var(--blossom-pink);
                overflow: hidden;
            }
            
            .item-card:hover, .item-card:active {
                transform: translate(-4px, -4px);
                box-shadow: 12px 12px 0px var(--bubbles-blue);
                border-color: var(--buttercup-green);
            }

            .ordering-locked {
                filter: grayscale(1) brightness(0.8);
                pointer-events: none;
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            .btn-power {
                background: var(--chemical-x-black);
                color: white;
                border: 3px solid white;
                border-radius: 1.5rem;
                font-weight: 900;
                box-shadow: 4px 4px 0px var(--blossom-pink);
                transition: all 0.2s;
            }
            
            .btn-power:active {
                transform: translate(4px, 4px);
                box-shadow: 0px 0px 0px var(--blossom-pink);
            }

            .tab-active {
                background: var(--chemical-x-black) !important;
                color: white !important;
                border: 3px solid var(--buttercup-green);
                box-shadow: 0 0 15px var(--buttercup-green);
                transform: scale(1.05) rotate(-1deg);
            }
            
            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: var(--chemical-x-black);
                border: 2px solid var(--chemical-x-black);
                border-radius: 1rem;
                font-weight: 800;
            }

            .modal-handle-area {
                cursor: pointer;
                padding: 12px 0 20px 0;
                width: 100%;
            }

            /* Powerpuff Trails Background */
            .trail-pink { background: var(--blossom-pink); height: 4px; width: 100%; }
            .trail-blue { background: var(--bubbles-blue); height: 4px; width: 100%; }
            .trail-green { background: var(--buttercup-green); height: 4px; width: 100%; }
        `}} />

        {/* --- Header (Townsville City Style) --- */}
        <header className="bg-zinc-900 text-white pt-10 pb-16 px-6 rounded-b-[4rem] relative overflow-hidden shadow-xl z-10 border-b-8 border-pink-500">
             {/* City Skyline Silhouette Overlay */}
             <div className="absolute bottom-0 left-0 w-full h-24 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/city.png')]"></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-pink-500 w-fit px-4 py-1.5 rounded-full border-2 border-white shadow-sm transform -rotate-1">
                         <span className="w-3 h-3 rounded-full bg-white animate-pulse"></span>
                         <p className="text-white text-xs font-bold tracking-wider hero-font uppercase">Sugar, Spice & Everything Nice</p>
                     </div>
                     <h1 className="text-3xl hero-font tracking-tight leading-none mt-2 text-white drop-shadow-[0_4px_0_#db2777]">
                         {brand?.name || "Townsville Diner"}
                     </h1>
                 </div>
                 {/* Powerpuff Badge Icon */}
                 <div className="w-20 h-20 bg-white rounded-full border-4 border-zinc-900 flex items-center justify-center relative shadow-lg animate-hero">
                     <Icon name="flame" size={40} className="text-yellow-400" />
                     <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-sky-400 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                        <Icon name="star" size={14} />
                     </div>
                 </div>
             </div>
             {/* Trails */}
             <div className="flex flex-col absolute bottom-0 left-0 w-full">
                <div className="trail-pink"></div>
                <div className="trail-blue"></div>
                <div className="trail-green"></div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="page-transition">
                    {/* Hero Banner (Comic Panel Style) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[3rem] overflow-hidden shadow-2xl mb-10 border-4 border-zinc-900 p-2 group animate-hero">
                             <div className="h-full w-full rounded-[2.5rem] overflow-hidden bg-sky-100 relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover opacity-100 group-hover:opacity-100 transition-opacity" 
                                 />
                             </div>
                             <div className="absolute top-4 right-4 bg-yellow-400 text-zinc-900 px-6 py-2 rounded-xl border-4 border-zinc-900 shadow-lg transform rotate-6">
                                 <span className="hero-font text-lg font-bold">POW! HOT DEALS</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2">
                         <div>
                             <h2 className="text-3xl hero-font text-zinc-900 drop-shadow-sm transform -rotate-1">Hero Rations</h2>
                             <p className="text-sm text-pink-500 font-bold ml-1 hero-font">Fight crime with a full belly!</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-zinc-900 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-zinc-800 transition-all hero-font border-2 border-white shadow-[4px_4px_0_#f472b6] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                             Mission Gear <Icon name="shield" size={16} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#fdf2f8] border-b-4 border-zinc-900 mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-[#f472b6] text-white text-[10px] font-black px-3 py-1 rounded-full border-2 border-white shadow-sm hero-font transform rotate-3">
                                                SALE!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-black text-lg line-clamp-2 mb-1 leading-tight hero-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-gray-500 line-through font-bold decoration-2 decoration-pink-500">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#f472b6] font-black text-2xl hero-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#facc15] text-black border-2 border-black flex items-center justify-center rounded-full hover:bg-[#fbbf24] transition-all shadow-sm active:scale-90">
                                                 <Icon name="plus" size={14} strokeWidth={4} />
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
                         <input type="text" placeholder="Locating snacks?..." className="w-full pl-16 pr-8 py-5 rounded-3xl bg-white border-4 border-zinc-900 text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all text-lg font-bold hero-font" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-lg font-bold hero-font ${selectedCategoryId === c.id ? 'tab-active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#fdf2f8] border-b-4 border-zinc-900 mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-black text-lg line-clamp-2 mb-1 leading-tight hero-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-[10px] text-gray-500 line-through font-bold decoration-2 decoration-pink-500">{pricing.original}</span>}
                                                <span className="text-[#f472b6] font-black text-2xl hero-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#facc15] text-black border-2 border-black flex items-center justify-center rounded-full hover:bg-[#fbbf24] transition-all shadow-sm active:scale-90">
                                                 <Icon name="plus" size={14} strokeWidth={4} />
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
                    <div className="mb-8 flex items-center justify-between bg-white p-8 border-4 border-zinc-900 rounded-[3rem] shadow-[8px_8px_0_#4ade80] relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12 text-pink-400">
                            <Icon name="basket" size={100} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black hero-font text-zinc-900">Battle Log</h2>
                             <p className="text-sm text-sky-500 font-bold mt-1 hero-font uppercase">Is the Mayor happy?</p>
                         </div>
                         <div className="w-16 h-16 bg-pink-100 border-4 border-zinc-900 rounded-full flex items-center justify-center animate-bounce shadow-md">
                             <Icon name="clock" size={32} className="text-red-500" />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="bg-white p-6 border-4 border-zinc-900 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-[#f472b6] font-bold uppercase tracking-widest flex items-center gap-1">
                                         <Icon name="menu" size={14} /> Order #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-wide border-2 border-zinc-900 rounded-full flex items-center gap-1.5 shadow-sm hero-font transform -rotate-1
                                        ${o.status === 'pending' ? 'bg-[#fef3c7] text-[#b45309]' : 'bg-[#dcfce7] text-[#166534]'}`}>
                                         {o.status === 'pending' ? 'COOKING...' : 'DONE!'}
                                     </span>
                                </div>
                                <div className="mb-4 space-y-2 bg-[#f4f4f5] p-5 rounded-2xl border-2 border-zinc-900">
                                    {o.order_items.map((i, idx) => (
                                        <div key={idx} className="flex justify-between text-sm text-black font-bold border-b-2 border-dashed border-gray-300 pb-2 last:border-0 hero-font">
                                            <div className="flex flex-col">
                                                <span>{i.quantity}x {i.product_name}</span>
                                                {/* Variant */}
                                                {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-white bg-zinc-900 px-1.5 rounded w-fit border border-white uppercase font-bold">{i.variant}</span>}
                                                {/* Note */}
                                                {i.note && <span className="text-[10px] text-gray-500 italic bg-white px-2 py-0.5 rounded border border-zinc-900 mt-1 block w-fit shadow-sm"><Icon name="pencil" size={8} /> "{i.note}"</span>}
                                            </div>
                                            <span className="text-[#f472b6]">{i.price * i.quantity}.-</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t-4 border-zinc-900">
                                     <span className="font-bold text-gray-500 text-xs uppercase tracking-widest">TOTAL</span>
                                     <span className="font-black text-black text-3xl hero-font">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Townsville HUD Style) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[85px] bg-white shadow-2xl flex justify-around items-center px-4 z-[100] rounded-[2.5rem] border-4 border-zinc-900">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-pink-100' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-pink-500' : 'text-slate-300'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-sky-100' : ''}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-sky-500' : 'text-slate-300'}`} />
                 </div>
             </button>

             {/* Big Cart Button (Big Action Button) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-zinc-900 rounded-full shadow-lg flex items-center justify-center text-white border-4 border-white active:scale-90 transition-all duration-100 z-20 group hover:bg-zinc-800">
                     <Icon name="basket" size={32} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white animate-hero">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-green-100' : ''}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-green-500' : 'text-slate-300'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-indigo-950/70 backdrop-blur-sm animate-hero">
                <div className="w-full max-w-md bg-white border-t-8 border-pink-500 h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[4rem] relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-zinc-900 rounded-full border-4 border-zinc-900 flex items-center justify-center hover:bg-red-50 transition-colors shadow-md active:scale-90">
                            <Icon name="x" strokeWidth={4} />
                        </button>
                        <div className="relative w-full h-85 overflow-hidden border-b-8 border-zinc-900 rounded-b-[3.5rem] bg-pink-50">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-yellow-400 text-zinc-900 font-black text-3xl hero-font rounded-2xl border-4 border-zinc-900 shadow-xl transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-zinc-600 decoration-red-500 decoration-4 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32 relative">
                        <h2 className="text-4xl hero-font text-zinc-900 mb-6 leading-tight drop-shadow-sm uppercase tracking-widest">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            {/* --- 3 PRICES VARIANT SELECTOR --- */}
                            <div>
                                <label className="block text-xl font-bold text-zinc-900 mb-3 hero-font uppercase tracking-wider">PICK SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'MINI', icon: 'star', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'SUPER', icon: 'star', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'ULTRA', icon: 'star', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center justify-between h-28 hero-font
                                                ${variant === v.key 
                                                    ? 'bg-zinc-900 border-zinc-900 shadow-lg -translate-y-1 text-white' 
                                                    : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900'}`}
                                        >
                                            <span className="text-sm font-black tracking-widest">{v.label}</span>
                                            <Icon name={v.icon || "star"} size={24} className={variant === v.key ? "text-[#facc15]" : "text-gray-300"} />
                                            
                                            <div className="flex flex-col items-center leading-none mt-1">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-white decoration-2">{v.original}</span>
                                                )}
                                                <span className="text-2xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-4 bg-white p-3 rounded-full border-4 border-zinc-900 shadow-md">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-zinc-100 text-zinc-900 rounded-full flex items-center justify-center hover:bg-red-50 active:scale-90 transition-all font-black text-2xl border-2 border-zinc-900"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-zinc-900 hero-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-zinc-800 active:scale-90 transition-all font-black text-2xl border-2 border-white"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1 hero-font">Power Cost</p>
                                    <p className="text-4xl font-black text-zinc-900 hero-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Item Note Input */}
                            <div className="relative">
                                <label className="block text-xl font-bold text-zinc-900 mb-2 hero-font uppercase tracking-wider">MESSAGE:</label>
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Instructions for the Professor..." 
                                    className="w-full p-6 bg-zinc-50 border-4 border-zinc-900 rounded-[2.5rem] focus:border-pink-500 focus:outline-none h-36 resize-none text-xl font-bold text-zinc-800 placeholder:text-zinc-300 transition-colors shadow-inner hero-font"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-white border-4 border-zinc-900 text-zinc-900 font-black text-xl rounded-2xl active:scale-95 transition-all shadow-[6px_6px_0_#38bdf8] hero-font">
                                Stash It
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-power text-2xl active:scale-95 transition-all flex items-center justify-center gap-2 hero-font">
                                ACTION! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ORDER SUMMARY MODAL --- */}
        <div id="orderSummaryOverlay" className={`fixed inset-0 bg-indigo-950/80 z-[130] hidden backdrop-blur-sm animate__animated animate__fadeIn ${activeTab === 'cart' ? 'block' : 'hidden'}`} onClick={() => setActiveTab('menu')}></div>
        <div id="orderSummary" className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-[10px] border-zinc-900 z-[140] flex flex-col shadow-2xl h-[92vh] rounded-t-[4rem] transition-transform duration-300 ${activeTab === 'cart' ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="sticky top-0 bg-white z-20 rounded-t-[4rem] border-b-4 border-zinc-50 p-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                <div className="w-24 h-2 bg-zinc-200 rounded-full mx-auto mt-2 opacity-30"></div>
            </div>
            
            <div className="flex justify-between items-center mb-6 px-10 pt-8">
                <h2 className="text-4xl hero-font text-zinc-900 transform -rotate-1 tracking-widest">Inventory</h2>
                <div className="w-14 h-14 bg-pink-100 text-pink-500 border-4 border-zinc-900 rounded-2xl flex items-center justify-center font-black text-2xl hero-font shadow-lg">
                    <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 px-8 pb-4 no-scrollbar">
                {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-zinc-900 rounded-[2rem] shadow-sm relative overflow-hidden hover:shadow-md hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                        <div className="w-20 h-20 bg-[#fdf2f8] rounded-2xl overflow-hidden border-2 border-zinc-900 shrink-0">
                            <img src={item.image_url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-zinc-900 text-xl leading-tight hero-font tracking-wide">
                                {item.name} <span className="text-[#f472b6]">x{item.quantity}</span>
                            </div>
                            <div className="text-sm font-bold mt-1 text-[#4b5563]">
                                {item.variant !== 'normal' && <span className="bg-zinc-900 text-white px-2 py-0.5 rounded border-2 border-white text-xs mr-2 font-sans uppercase font-bold">{item.variant}</span>}
                                {/* 🔥 VISIBLE ITEM NOTE IN CART */}
                                {item.note && (
                                    <span className="block mt-1 bg-[#fdf2f8] text-zinc-900 text-[12px] px-2 py-1 rounded border border-zinc-900 italic font-sans">
                                        <Icon name="pencil" size={10} /> "{item.note}"
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className="font-black text-zinc-900 text-2xl hero-font">{item.price * item.quantity}.-</span>
                             <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#fee2e2] text-[#ef4444] rounded-full flex items-center justify-center hover:bg-red-200 transition-colors border-2 border-zinc-900 shadow-sm active:scale-90">
                                 <Icon name="trash" size={18} />
                             </button>
                        </div>
                    </div>
                ))}
                {cart.length === 0 && (
                    <div className="text-center py-20 text-gray-400 font-bold text-2xl hero-font opacity-50">
                        Nothing here, Citizen!
                    </div>
                )}
            </div>

            <div className="p-10 bg-zinc-900 border-t-4 border-white relative z-30 rounded-t-[4rem]">
                <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-dashed border-zinc-700">
                    <div>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest hero-font">Total Points</p>
                        <p className="text-5xl font-black text-white drop-shadow-md">{cartTotal}.-</p>
                    </div>
                    <div className="w-20 h-20 bg-white border-4 border-zinc-900 flex items-center justify-center text-pink-500 transform rotate-6 shadow-2xl">
                        <Icon name="receipt" size={40} />
                    </div>
                </div>
                <button onClick={() => { onCheckoutClick(); }} className="w-full py-6 btn-power text-3xl active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.1em] hero-font">
                    <span>SO THE DAY IS SAVED!</span> <Icon name="check" size={32} strokeWidth={4} />
                </button>
            </div>
        </div>

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-indigo-950/90 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-hero">
                <div className="w-full max-w-sm bg-white border-8 border-zinc-900 p-10 text-center shadow-2xl relative overflow-hidden rounded-[3rem]">
                    <div className="w-28 h-28 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-zinc-900 shadow-lg relative z-10 animate-hero">
                        <Icon name="shield" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-3xl hero-font text-zinc-900 mb-4 leading-tight relative z-10 uppercase tracking-widest">Backup Arrived!</h3>
                            <p className="text-lg text-zinc-500 mb-10 font-bold hero-font relative z-10">Add "{selectedProduct.name}" to your stash?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-zinc-900 text-white font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl hero-font uppercase">YES! GO TEAM!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-white border-4 border-zinc-200 text-zinc-300 font-black text-lg active:scale-95 transition-transform hover:bg-zinc-50 hero-font uppercase">Just Add</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl hero-font text-zinc-900 mb-4 leading-tight relative z-10 uppercase tracking-widest">Backup Arrived!</h3>
                            <p className="text-lg text-zinc-500 mb-10 font-bold hero-font relative z-10">You have items in the stash. Merge them for the final fight?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { onCheckoutClick(); }} className="w-full py-5 bg-zinc-900 text-white font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl hero-font uppercase">YES! GO TEAM!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white border-4 border-zinc-200 text-zinc-300 font-black text-lg active:scale-95 transition-transform hover:bg-zinc-50 hero-font uppercase">Wait!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}