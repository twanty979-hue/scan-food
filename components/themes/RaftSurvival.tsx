import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Raft Survival Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Raft / Ship
    home: <path d="M2 20h20 M4 20v-4c0-2 2-4 4-4h8c2 0 4 2 4 4v4 M12 2v10 M12 2l-3 3 M12 2l3 3" />, 
    // Menu -> Compass
    menu: <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm-1-11v5l4.25 2.5.75-1.23-3.5-2.05V11h-1.5z" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Open Box / Crate
    basket: <path d="M3 6h18l-2 16H5L3 6zm7-4h4v4h-4z" />,
    // Clock -> Binoculars / Logbook
    clock: <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />,
    // Chef -> Hook
    chef: <path d="M18 6c-2-2-5-2-7 0L8 9c-1 1-1 3 0 4l3 3c1 1 3 1 4 0l1-1" />, 
    // Star -> Water Drop
    star: <path d="M12 2L2 22h20L12 2zm0 4l3 7h-6l3-7z" />, // Simplified drop shape
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Anchor
    flame: <path d="M12 22c4.97 0 9-4.03 9-9h-2c0 3.87-3.13 7-7 7s-7-3.13-7-7H3c0 4.97 4.03 9 9 9zM12 2a3 3 0 0 0-3 3v7h6V5a3 3 0 0 0-3-3z" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    water: <path d="M12 2c-5 7-8 10-8 15a8 8 0 1 0 16 0c0-5-3-8-8-15z" />,
    fish: <path d="M20 12l-4-4v3H6v2h10v3l4-4z" />,
    lifeRing: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c3.87 0 7 3.13 7 7s-3.13 7-7 7-7-3.13-7-7 3.13-7 7-7zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />
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
      {name === 'basket' && <path d="M7 10h10" strokeWidth="2" />}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#075985] flex items-center justify-center text-[#0ea5e9] font-black text-2xl">LOADING...</div>;

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
    // Theme: Raft Survival (Ocean, Wood, Scrap)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-white">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Itim&family=Mali:wght@400;600;700&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                /* Raft Palette */
                --ocean-blue: #0ea5e9; /* Light Ocean */
                --deep-sea: #075985; /* Dark Ocean */
                --raft-wood: #a16207; /* Plank Brown */
                --raft-light: #ca8a04; /* Dry Wood */
                --plastic-white: #f8fafc; /* Plastic scrap */
                --text-main: #0c4a6e;
            }

            body {
                font-family: 'Itim', 'Sarabun', sans-serif;
                background-color: var(--deep-sea);
                /* Sea Wave Pattern */
                background-image: 
                    radial-gradient(circle at 100% 150%, var(--deep-sea) 24%, var(--ocean-blue) 25%, var(--ocean-blue) 28%, var(--deep-sea) 29%, var(--deep-sea) 36%, var(--ocean-blue) 36%, var(--ocean-blue) 40%, transparent 40%),
                    radial-gradient(circle at 0 150%, var(--deep-sea) 24%, var(--ocean-blue) 25%, var(--ocean-blue) 28%, var(--deep-sea) 29%, var(--deep-sea) 36%, var(--ocean-blue) 36%, var(--ocean-blue) 40%, transparent 40%),
                    radial-gradient(circle at 50% 100%, var(--ocean-blue) 10%, var(--deep-sea) 11%, var(--deep-sea) 23%, var(--ocean-blue) 24%, var(--ocean-blue) 30%, var(--deep-sea) 31%, var(--deep-sea) 43%, var(--ocean-blue) 44%, var(--ocean-blue) 50%, transparent 50%),
                    radial-gradient(circle at 100% 50%, var(--ocean-blue) 5%, var(--deep-sea) 6%, var(--deep-sea) 15%, var(--ocean-blue) 16%, var(--ocean-blue) 20%, var(--deep-sea) 21%, var(--deep-sea) 30%, var(--ocean-blue) 31%, var(--ocean-blue) 35%, transparent 35%),
                    radial-gradient(circle at 0 50%, var(--ocean-blue) 5%, var(--deep-sea) 6%, var(--deep-sea) 15%, var(--ocean-blue) 16%, var(--ocean-blue) 20%, var(--deep-sea) 21%, var(--deep-sea) 30%, var(--ocean-blue) 31%, var(--ocean-blue) 35%, transparent 35%);
                background-size: 100px 50px;
                background-attachment: fixed;
                -webkit-tap-highlight-color: transparent;
                color: white;
            }

            .survival-font {
                font-family: 'Itim', cursive;
            }

            /* Raft Plank Style */
            .plank-style {
                background-color: #92400e;
                background-image: repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 42px);
                border: 3px solid #451a03;
                box-shadow: 0 4px 0 #451a03;
            }

            /* Hooking Animation */
            @keyframes hook-swing {
                0%, 100% { transform: rotate(-5deg); }
                50% { transform: rotate(5deg); }
            }

            .animate-hook {
                display: inline-block;
                transform-origin: top center;
                animation: hook-swing 2s infinite ease-in-out;
            }

            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .page-transition { animation: fadeIn 0.5s ease-out; }

            /* Item Card - Floating Crate Look */
            .item-card {
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                background: #d6d3d1; /* Plastic/Scrap color */
                border-radius: 1rem;
                border: 4px solid #451a03;
                box-shadow: 0 6px 0 #451a03;
                overflow: hidden;
            }
            
            .item-card:hover, .item-card:active {
                transform: translateY(2px);
                box-shadow: 0 2px 0 #451a03;
                border-color: var(--ocean-blue);
            }

            .item-card h3 {
                color: #451a03;
            }

            .ordering-locked {
                filter: grayscale(1) brightness(0.7);
                pointer-events: none;
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            .btn-raft {
                background: #b45309;
                color: white;
                border: 3px solid #451a03;
                border-radius: 0.5rem;
                font-weight: 700;
                box-shadow: 0 4px 0 #451a03;
                transition: all 0.1s;
            }
            
            .btn-raft:active {
                transform: translateY(4px);
                box-shadow: 0 0 0 #451a03;
            }

            .tab-active {
                background: var(--ocean-blue) !important;
                color: white !important;
                border: 3px solid #fff;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                transform: translateY(-2px);
            }
            
            .tab-btn {
                transition: all 0.3s;
                background: #78350f;
                color: #fef3c7;
                border: 2px solid #451a03;
                border-radius: 0.5rem;
            }

            .modal-handle-area {
                cursor: pointer;
                padding: 12px 0 20px 0;
                width: 100%;
            }
        `}} />

        {/* --- Header (Raft Deck Style) --- */}
        <header className="bg-[#78350f] text-white pt-10 pb-16 px-6 rounded-b-none relative overflow-hidden shadow-xl z-10 border-b-8 border-[#451a03]">
             {/* Wood Plank texture */}
             <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_20px,rgba(0,0,0,0.5)_20px,rgba(0,0,0,0.5)_22px)]"></div>
             <div className="absolute -top-5 -right-5 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-30"></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-sky-900/50 w-fit px-4 py-1.5 rounded-sm border border-sky-400/50 backdrop-blur-sm transform -rotate-1">
                         <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse border border-white"></span>
                         <p className="text-white text-xs font-bold tracking-wider survival-font uppercase">Raft is Floating: {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl survival-font tracking-tight leading-none mt-2 text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
                         {brand?.name || "GATHERING..."}
                     </h1>
                 </div>
                 {/* Hook Icon Badge */}
                 <div className="w-20 h-20 bg-[#fef3c7] rounded-xl border-4 border-[#451a03] flex items-center justify-center relative shadow-lg transform rotate-6 hover:rotate-12 transition-transform">
                     <Icon name="chef" size={40} className="text-[#78350f] animate-hook" />
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-sky-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                        <Icon name="star" size={14} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20 w-full">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="page-transition">
                    {/* Hero Banner (Lookout Style) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-sky-900 rounded-xl overflow-hidden shadow-xl mb-10 border-4 border-[#451a03] p-1 group">
                             <div className="h-full w-full rounded-lg overflow-hidden bg-sky-300 relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                 />
                             </div>
                             <div className="absolute bottom-4 left-4 bg-orange-600 text-white px-5 py-2 rounded-sm border-2 border-white transform rotate-[-2deg] shadow-lg">
                                 <span className="survival-font text-lg font-bold">FOUND IN BARREL!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2">
                         <div>
                             <h2 className="text-3xl survival-font text-white drop-shadow-[2px_2px_0_#451a03]">Loot Items</h2>
                             <p className="text-sm text-sky-200 font-bold survival-font ml-1">Survival Rations</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#b45309] text-white px-5 py-2.5 rounded-lg text-sm font-black flex items-center gap-2 hover:bg-[#92400e] transition-all survival-font border-2 border-[#451a03] shadow-[4px_4px_0_#451a03] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                             Inventory <Icon name="basket" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#fef3c7] border-b-4 border-[#451a03] mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-[#d32f2f] text-white text-[10px] font-bold px-3 py-1 rounded-sm border border-[#451a03] shadow-sm survival-font transform rotate-3">
                                                SCRAP!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-[#d6d3d1]">
                                         <h3 className="font-bold text-[#451a03] text-lg line-clamp-2 mb-1 leading-tight survival-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-gray-600 line-through font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#0369a1] font-black text-2xl survival-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#fcd34d] text-[#451a03] border-2 border-[#451a03] flex items-center justify-center rounded-sm hover:bg-[#fbbf24] transition-all shadow-[2px_2px_0_#451a03] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
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
                             <Icon name="search" className="text-sky-600 text-xl" />
                         </div>
                         <input type="text" placeholder="Scavenge for food..." className="w-full pl-16 pr-8 py-5 rounded-lg bg-white/90 border-4 border-[#78350f] text-[#451a03] placeholder:text-sky-300 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-200 transition-all text-lg font-bold survival-font" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-lg font-bold survival-font ${selectedCategoryId === c.id ? 'tab-active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#fef3c7] border-b-4 border-[#451a03] mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-[#d6d3d1]">
                                         <h3 className="font-bold text-[#451a03] text-lg line-clamp-2 mb-1 leading-tight survival-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-[10px] text-gray-600 line-through font-bold">{pricing.original}</span>}
                                                <span className="text-[#0369a1] font-black text-2xl survival-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#fcd34d] text-[#451a03] border-2 border-[#451a03] flex items-center justify-center rounded-sm hover:bg-[#fbbf24] transition-all shadow-[2px_2px_0_#451a03] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
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
                    <div className="mb-8 flex items-center justify-between plank-style p-8 rounded-xl relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12 text-white">
                            <Icon name="lifeRing" size={100} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black survival-font text-white">Logbook</h2>
                             <p className="text-sm text-sky-100 font-bold mt-1 survival-font">Tracking floaties...</p>
                         </div>
                         <div className="w-16 h-16 bg-sky-400 border-4 border-white rounded-full flex items-center justify-center animate-bounce shadow-md">
                             <Icon name="clock" size={32} className="text-white" />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-[#f8fafc] p-6 border-4 border-[#78350f] rounded-xl shadow-[4px_4px_0_#451a03] relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-[#0369a1] font-bold uppercase tracking-widest flex items-center gap-1">
                                         <Icon name="menu" size={14} /> Order #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-wide border-2 border-[#451a03] rounded-sm flex items-center gap-1.5 shadow-sm survival-font transform -rotate-1
                                        ${o.status === 'pending' ? 'bg-[#fef3c7] text-[#b45309]' : 'bg-[#dcfce7] text-[#166534]'}`}>
                                         {o.status === 'pending' ? 'COOKING...' : 'DONE!'}
                                     </span>
                                </div>
                                <div className="mb-4 space-y-2 bg-[#e0f2fe] p-5 rounded-lg border-2 border-[#7dd3fc]">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-[#0c4a6e] font-bold border-b-2 border-dashed border-sky-300 pb-2 last:border-0 survival-font">
                                            <div className="flex flex-col">
                                                <span>{i.quantity}x {i.product_name}</span>
                                                {/* Variant */}
                                                {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-white bg-[#0369a1] px-1.5 rounded-sm w-fit border border-[#0c4a6e] uppercase font-bold">{i.variant}</span>}
                                                {/* Note */}
                                                {i.note && <span className="text-[10px] text-[#075985] italic bg-white/50 px-2 py-0.5 rounded border border-sky-200 mt-1 block w-fit shadow-sm"><Icon name="pencil" size={8} /> "{i.note}"</span>}
                                            </div>
                                            <span className="text-[#b45309]">{i.price * i.quantity}.-</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t-4 border-[#78350f]">
                                     <span className="font-bold text-[#64748b] text-xs uppercase tracking-widest">TOTAL SCRAP</span>
                                     <span className="font-black text-[#451a03] text-3xl survival-font">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Floating Plank Style) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[85px] bg-[#78350f] shadow-2xl flex justify-around items-center px-4 z-[100] rounded-xl border-t-4 border-[#a16207] border-x-2 border-[#451a03]">
             {/* Wood texture overlay */}
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>

             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group z-10 ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors border-2 ${activeTab === 'home' ? 'bg-sky-500 border-white' : 'border-transparent'}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-white' : 'text-amber-100'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group z-10 ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors border-2 ${activeTab === 'menu' ? 'bg-sky-500 border-white' : 'border-transparent'}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-white' : 'text-amber-100'}`} />
                 </div>
             </button>

             {/* Big Cart Button (Big Hook) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12 z-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-sky-500 rounded-full shadow-[0_8px_0_#0369a1] flex items-center justify-center text-white border-4 border-white active:scale-90 active:translate-y-[8px] transition-all duration-100 group">
                     <Icon name="basket" size={32} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white animate-bounce survival-font">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group z-10 ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors border-2 ${activeTab === 'status' ? 'bg-sky-500 border-white' : 'border-transparent'}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-white' : 'text-amber-100'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Wooden Plank) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#3E2723]/80 backdrop-blur-sm animate-fadeIn">
                <div className="w-full max-w-md bg-[#FFF8E1] border-t-8 border-x-8 border-[#5D4037] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-[0_-10px_0_#3E2723] rounded-t-[3rem] relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#FFCC80] text-[#5D4037] rounded-full border-4 border-[#5D4037] flex items-center justify-center hover:bg-[#FFE0B2] transition-colors shadow-[2px_2px_0_#3E2723] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-8 border-[#5D4037] rounded-b-[2rem] bg-[#81D4FA]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#D32F2F] text-white font-normal text-3xl survival-font rounded-xl border-4 border-[#FFF] shadow-[4px_4px_0_#3E2723] transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-[#FFCDD2] decoration-white decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32 relative overflow-hidden bg-[#FFF3E0]">
                        <h2 className="text-4xl survival-font text-[#3E2723] mb-6 leading-tight transform rotate-1 drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5 relative z-10">
                            {/* --- 3 PRICES VARIANT SELECTOR --- */}
                            <div>
                                <label className="block text-lg font-bold text-[#5D4037] mb-3 survival-font ml-1 tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'FLAP', icon: 'fish', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'BUBBIE', icon: 'fish', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'CAPTAIN', icon: 'fish', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-xl border-4 transition-all flex flex-col items-center justify-between h-24 survival-font
                                                ${variant === v.key 
                                                    ? 'bg-[#FFCC80] border-[#E65100] shadow-[3px_3px_0_#3E2723] -translate-y-1 text-[#3E2723]' 
                                                    : 'bg-[#FFF8E1] border-[#D7CCC8] text-[#A1887F] hover:border-[#8D6E63] hover:text-[#5D4037]'}`}
                                        >
                                            <span className="text-xs font-bold tracking-widest">{v.label}</span>
                                            <Icon name={v.icon || "star"} size={20} className={variant === v.key ? "text-[#3E2723]" : "text-[#A1887F]"} />
                                            <div className="flex flex-col items-center leading-none mt-1">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-[#D32F2F] decoration-2 opacity-70">{v.original}</span>
                                                )}
                                                <span className="text-xl font-normal">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2 bg-[#FFF8E1] border-4 border-[#8D6E63] rounded-2xl p-4 shadow-[4px_4px_0_#5D4037]">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-[#D7CCC8] border-2 border-[#8D6E63] text-[#3E2723] rounded-full flex items-center justify-center hover:bg-[#BCAAA4] active:scale-90 transition-all font-black text-xl"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-4xl font-normal w-14 text-center text-[#3E2723] survival-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#FFCC80] border-2 border-[#E65100] text-[#3E2723] rounded-full flex items-center justify-center hover:bg-[#FFB74D] active:scale-90 transition-all font-black text-xl"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[#8D6E63] font-bold uppercase tracking-widest mb-1">CANDY COINS</p>
                                    <p className="text-5xl font-normal text-[#3E2723] survival-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Item Note Input */}
                            <div className="relative">
                                <label className="block text-lg font-bold text-[#5D4037] mb-2 survival-font ml-1 tracking-wide">MESSAGE IN A BOTTLE:</label>
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="E.g., Extra maple syrup..." 
                                    className="w-full p-6 pl-12 bg-[#FFF8E1] border-4 border-[#D7CCC8] rounded-2xl font-bold text-[#3E2723] placeholder:text-[#BCAAA4] focus:outline-none focus:border-[#FFCC80] focus:shadow-[4px_4px_0_#FFB74D] transition-all resize-none h-28 text-lg font-serif"
                                />
                                <div className="absolute top-12 left-4 text-[#8D6E63] pointer-events-none">
                                    <Icon name="pencil" size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-[#FFF] border-4 border-[#5D4037] text-[#5D4037] font-bold text-xl rounded-xl active:scale-95 transition-all shadow-[4px_4px_0_#3E2723] survival-font">
                                STOW IT
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-raft text-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                ADVENTURE! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ORDER SUMMARY MODAL (The Trap) --- */}
        <div id="orderSummaryOverlay" className={`fixed inset-0 bg-[#3E2723]/80 z-[130] backdrop-blur-sm animate-fadeIn ${activeTab === 'cart' ? 'block' : 'hidden'}`} onClick={() => setActiveTab('menu')}></div>
        <div id="orderSummary" className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#FFF8E1] border-t-8 border-[#5D4037] flex flex-col shadow-[0_-10px_0_#3E2723] h-[85vh] rounded-t-[3rem] transition-transform duration-300 ${activeTab === 'cart' ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="sticky top-0 bg-[#FFF8E1] z-20 rounded-t-[3rem] border-b-4 border-[#D7CCC8] p-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                <div className="w-24 h-2 bg-[#8D6E63] rounded-full mx-auto mt-2 opacity-50"></div>
            </div>
            
            <div className="flex justify-between items-center mb-6 px-8 pt-2">
                <h2 className="text-4xl survival-font text-[#3E2723] drop-shadow-sm transform -rotate-2">Your Loot</h2>
                <div className="w-14 h-14 bg-[#FFCC80] text-[#3E2723] border-4 border-[#E65100] rounded-xl flex items-center justify-center font-bold text-2xl survival-font shadow-[3px_3px_0_#3E2723]">
                    <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                {cart.map((item: any, idx: any) => (
                    <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-[#8D6E63] rounded-2xl relative overflow-hidden shadow-[4px_4px_0_#5D4037]">
                        <div className="w-20 h-20 bg-[#EFEBE9] rounded-xl overflow-hidden border-4 border-[#D7CCC8] shrink-0">
                            <img src={item.image_url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-[#3E2723] text-xl leading-tight survival-font tracking-wide">
                                {item.name} <span className="text-[#0288D1]">x{item.quantity}</span>
                            </div>
                            <div className="text-sm font-bold mt-1 text-[#451a03]">
                                {item.variant !== 'normal' && <span className="bg-[#FFCC80] text-[#3E2723] px-2 py-0.5 border border-[#E65100] rounded text-xs mr-2">{item.variant}</span>}
                                {/* 🔥 VISIBLE ITEM NOTE IN CART */}
                                {item.note && (
                                    <span className="block mt-1 bg-[#FFF8E1] text-[#3E2723] text-[12px] px-2 py-1 rounded border border-[#8D6E63] italic font-serif">
                                        <Icon name="pencil" size={10} /> "{item.note}"
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className="font-black text-[#0288D1] text-2xl survival-font">{item.price * item.quantity}.-</span>
                             <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#FFEBEE] hover:bg-[#FFCDD2] flex items-center justify-center text-[#D32F2F] border-2 border-[#FFCDD2] rounded-xl transition-colors active:scale-90 shadow-sm">
                                 <Icon name="trash" size={18} />
                             </button>
                        </div>
                    </div>
                ))}
                {cart.length === 0 && (
                    <div className="text-center py-20 text-[#A1887F] font-bold text-xl survival-font">Chest is empty...</div>
                )}
            </div>

            <div className="p-8 bg-[#81D4FA] border-t-4 border-[#0288D1] relative z-30 rounded-t-[2.5rem]">
                <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-[#B3E5FC]">
                    <div>
                        <p className="text-sm text-[#01579B] font-black uppercase tracking-widest">TOTAL BOUNTY</p>
                        <p className="text-6xl font-normal text-[#FFF] survival-font drop-shadow-md">{cartTotal}.-</p>
                    </div>
                    <div className="w-20 h-20 bg-[#FFCC80] border-4 border-[#E65100] rounded-full flex items-center justify-center text-[#3E2723] transform rotate-6 shadow-[4px_4px_0_#3E2723]">
                        <Icon name="basket" size={40} />
                    </div>
                </div>
                <button onClick={() => { onCheckoutClick(); }} className="w-full py-5 btn-raft text-3xl active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-[#5D4037]">
                    <span>SET SAIL!</span> <Icon name="check" size={32} strokeWidth={4} />
                </button>
            </div>
        </div>

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#3E2723]/90 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-fadeIn">
                <div className="w-full max-w-sm bg-[#FFF8E1] border-8 border-[#5D4037] p-8 text-center shadow-[10px_10px_0_#3E2723] relative overflow-hidden rounded-[2.5rem]">
                    <div className="w-28 h-28 bg-[#81D4FA] text-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#0288D1] shadow-[4px_4px_0_#1B5E20]">
                        <Icon name="flame" size={56} className="animate-hook" />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-4xl survival-font text-[#3E2723] mb-2 leading-tight">AHOY!</h3>
                            <p className="text-xl text-[#5D4037] mb-8 font-bold leading-tight">Add "{selectedProduct.name}" to your stash?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#FFCC80] text-[#3E2723] font-bold border-4 border-[#E65100] shadow-[4px_4px_0_#3E2723] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl survival-font rounded-xl">YES, TAKE IT ALL!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-[#8D6E63] text-[#5D4037] font-bold text-lg active:scale-95 transition-transform hover:bg-[#EFEBE9] rounded-xl">JUST STOW IT</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl survival-font text-[#3E2723] mb-2 leading-tight">ADVENTURE?</h3>
                            <p className="text-xl text-[#5D4037] mb-8 font-bold leading-tight">Ready to sail to Candy Island?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { onCheckoutClick(); }} className="w-full py-4 bg-[#b45309] text-white font-bold border-4 border-[#451a03] shadow-[4px_4px_0_#451a03] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl survival-font rounded-xl">YES, CAPTAIN!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-[#8D6E63] text-[#5D4037] font-bold text-lg active:scale-95 transition-transform hover:bg-[#EFEBE9] rounded-xl">NOT YET!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}