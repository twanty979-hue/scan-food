import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Mickey Mouse / Clubhouse Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Clubhouse
    home: <path d="M2 20h20 M4 20v-6a8 8 0 0 1 16 0v6 M12 2v4 M12 2l-4 4 M12 2l4 4" />, 
    // Menu -> Shapes / Categories
    menu: <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="3" strokeLinecap="round" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Shopping Bag
    basket: <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M16 10a4 4 0 0 1-8 0" />,
    // Clock -> Toodles / Timer
    clock: <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10zm0-16v6l4 2" />,
    // Chef -> Mickey Ears
    chef: <path d="M12 7c-3 0-5 2-5 5s2 5 5 5 5-2 5-5-2-5-5-5zm-6 1c-1.5 0-3-1.5-3-3s1.5-3 3-3 3 1.5 3 3-1.5 3-3 3zm12 0c-1.5 0-3-1.5-3-3s1.5-3 3-3 3 1.5 3 3-1.5 3-3 3z" />, 
    // Star -> Sparkle
    star: <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Magic Wand / Burst
    flame: <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    // Mickey Glove (Hand Pointer)
    hand: <path d="M18 10h-2V7a2 2 0 0 0-4 0v3h-1V8a2 2 0 0 0-4 0v2H6a2 2 0 0 0-2 2v6c0 3 2.5 5 5 5h6c3 0 5-2.5 5-5v-6a2 2 0 0 0-2-2z" />,
    // Music Note
    music: <path d="M9 18V5l12-2v13" />,
    // Magic Wand
    wand: <path d="M20 4L4 20 M20 4l-2 2 M20 4l-2-2 M4 20l2-2 M4 20l2 2" strokeWidth="3" />,
    // Cookie
    cookie: <circle cx="12" cy="12" r="10" strokeWidth="2" />,
    // Mug
    mug: <path d="M6 6h10v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6z M16 8h3v4h-3" />,
    // Clipboard
    clipboard: <path d="M16 4h-2a2 2 0 0 0-4 0H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />,
    // Receipt
    receipt: <path d="M4 2v20l4-2 4 2 4-2 4 2V2H4z" />
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
      {name === 'chef' && <circle cx="12" cy="12" r="3" fill="currentColor"/>}
      {name === 'cookie' && <><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="14" cy="14" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></>}
      {name === 'receipt' && <path d="M8 6h8M8 10h8M8 14h6" strokeWidth="2" />}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#eeeeee] flex items-center justify-center text-[#ef4444] font-black text-2xl">LOADING...</div>;

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
    // Theme: Mickey Mouse - Clubhouse Diner
    <div className="w-full max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden border-x-4 border-zinc-900 bg-white font-sans text-[#18181b]">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Itim&family=Mali:wght@400;600;700&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                /* Mickey Palette */
                --mickey-red: #ef4444; 
                --mickey-yellow: #facc15;
                --mickey-black: #18181b;
                --mickey-white: #ffffff;
                --bg-clubhouse: #fee2e2;
                --text-disney: #18181b;
            }

            body {
                font-family: 'Itim', 'Sarabun', sans-serif;
                background-color: var(--bg-clubhouse);
                /* Mickey Shorts Pattern */
                background-image: 
                    radial-gradient(circle at 10% 20%, white 10%, transparent 11%),
                    radial-gradient(circle at 80% 80%, white 10%, transparent 11%);
                background-size: 80px 80px;
                background-attachment: fixed;
                color: var(--text-disney);
            }

            .mickey-font {
                font-family: 'Itim', cursive;
                font-weight: 600;
            }

            /* Mickey Ears Animation */
            @keyframes ear-wiggle {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(5deg); }
                75% { transform: rotate(-5deg); }
            }

            .animate-ears {
                animation: ear-wiggle 3s infinite ease-in-out;
            }

            /* Item Card - White Glove Style */
            .item-card {
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                background: white;
                border-radius: 2.5rem;
                border: 5px solid var(--mickey-black);
                box-shadow: 0 10px 0 var(--mickey-red);
                overflow: hidden;
            }
            
            .item-card:hover, .item-card:active {
                transform: translateY(5px);
                box-shadow: 0 2px 0 var(--mickey-red);
                border-color: var(--mickey-yellow);
            }

            .btn-disney {
                background: var(--mickey-red);
                color: white;
                border: 4px solid var(--mickey-black);
                border-radius: 1.5rem;
                font-weight: 900;
                box-shadow: 0 6px 0 var(--mickey-black);
                transition: all 0.1s;
            }
            
            .btn-disney:active {
                transform: translateY(6px);
                box-shadow: 0 0 0 var(--mickey-black);
            }

            .btn-yellow {
                background: var(--mickey-yellow);
                color: var(--mickey-black);
                border: 4px solid var(--mickey-black);
                border-radius: 1.5rem;
                font-weight: 900;
                box-shadow: 0 6px 0 var(--mickey-black);
                transition: all 0.1s;
            }
             .btn-yellow:active {
                transform: translateY(6px);
                box-shadow: 0 0 0 var(--mickey-black);
            }

            .tab-active {
                background: var(--mickey-black) !important;
                color: var(--mickey-yellow) !important;
                border: 4px solid var(--mickey-yellow);
                box-shadow: 0 0 15px var(--mickey-yellow);
                transform: scale(1.05);
            }
            
            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: var(--mickey-black);
                border: 3px solid var(--mickey-black);
                border-radius: 1.2rem;
                font-weight: 800;
            }
            
            .page-transition {
                animation: fadeIn 0.6s;
            }
            
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (Clubhouse Style) --- */}
        <header className="bg-zinc-900 text-white pt-10 pb-16 px-6 rounded-b-[4rem] relative overflow-hidden shadow-xl z-10 border-b-8 border-red-500">
             {/* Mickey Silhouette Overlay */}
             <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '10px 10px'}}></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-red-500 w-fit px-4 py-1.5 rounded-full border-2 border-white shadow-sm transform -rotate-1">
                         <span className="w-3 h-3 rounded-full bg-white animate-pulse"></span>
                         <p className="text-white text-xs font-bold tracking-wider mickey-font uppercase">M-I-C-K-E-Y: {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl mickey-font tracking-tight leading-none mt-2 text-white drop-shadow-md">
                         {brand?.name || "Clubhouse Diner"}
                     </h1>
                 </div>
                 {/* Mickey Icon Badge */}
                 <div className="w-20 h-20 bg-white rounded-full border-4 border-zinc-900 flex items-center justify-center relative shadow-lg animate-ears">
                     {/* Draw simple mickey head using CSS/Icons */}
                     <div className="relative">
                         <div className="absolute -top-6 -left-5 w-8 h-8 bg-zinc-900 rounded-full border-2 border-white"></div>
                         <div className="absolute -top-6 -right-5 w-8 h-8 bg-zinc-900 rounded-full border-2 border-white"></div>
                         <div className="w-12 h-12 bg-zinc-900 rounded-full border-2 border-white flex items-center justify-center text-white">
                             <Icon name="chef" size={24} />
                         </div>
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full border-2 border-zinc-900 flex items-center justify-center text-zinc-900">
                        <Icon name="music" size={14} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="page-transition">
                    {/* Hero Banner (Clubhouse View Style) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[3rem] overflow-hidden shadow-2xl mb-10 border-4 border-zinc-900 p-2 group animate-ears">
                             <div className="h-full w-full rounded-[2.5rem] overflow-hidden bg-[#bae6fd] relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover opacity-100 group-hover:opacity-100 transition-opacity" 
                                 />
                             </div>
                             <div className="absolute top-4 right-4 bg-yellow-400 text-zinc-900 px-6 py-2 rounded-xl border-4 border-zinc-900 shadow-lg transform rotate-6">
                                 <span className="mickey-font text-lg font-bold">HOT DOG DEALS!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2">
                         <div>
                             <h2 className="text-3xl mickey-font text-zinc-900 drop-shadow-sm transform -rotate-1">Mouseka-Meals</h2>
                             <p className="text-sm text-red-500 font-bold ml-1">Oh boy! Something yummy!</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-zinc-900 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-zinc-800 transition-all mickey-font border-2 border-white shadow-md active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                             Toodles! <Icon name="wand" size={16} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#fee2e2] border-b-4 border-zinc-900 mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-[#ef4444] text-white text-[10px] font-black px-3 py-1 rounded-full border-2 border-white shadow-sm mickey-font transform rotate-3">
                                                SALE!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-black text-lg line-clamp-2 mb-1 leading-tight mickey-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-gray-500 line-through font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#ef4444] font-black text-2xl mickey-font leading-none">
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
                             <Icon name="search" className="text-red-500" />
                         </div>
                         <input type="text" placeholder="Sniffing for snacks?..." className="w-full pl-16 pr-8 py-5 rounded-full bg-white border-4 border-zinc-900 text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all text-lg font-bold" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-lg font-bold mickey-font ${selectedCategoryId === c.id ? 'tab-active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#fee2e2] border-b-4 border-zinc-900 mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-black text-lg line-clamp-2 mb-1 leading-tight mickey-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-[10px] text-gray-500 line-through font-bold">{pricing.original}</span>}
                                                <span className="text-[#ef4444] font-black text-2xl mickey-font leading-none">{pricing.final}.-</span>
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
                    <div className="mb-8 flex items-center justify-between bg-white p-8 border-4 border-zinc-900 rounded-[3rem] shadow-[8px_8px_0_#facc15] relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12 text-red-400">
                            <Icon name="hand" size={100} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black mickey-font text-zinc-900">Mousketools</h2>
                             <p className="text-sm text-red-500 font-bold mt-1 uppercase">Is it ready, Toodles?</p>
                         </div>
                         <div className="w-16 h-16 bg-white border-4 border-zinc-900 rounded-full flex items-center justify-center animate-bounce shadow-md">
                             <Icon name="clock" size={32} className="text-red-500" />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-white p-6 border-4 border-zinc-900 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-[#ef4444] font-bold uppercase tracking-widest flex items-center gap-1">
                                         <Icon name="menu" size={14} /> Order #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-wide border-2 border-black rounded-full flex items-center gap-1.5 shadow-sm mickey-font transform -rotate-1
                                        ${o.status === 'pending' ? 'bg-[#fef3c7] text-[#b45309]' : 'bg-[#dcfce7] text-[#166534]'}`}>
                                         {o.status === 'pending' ? 'COOKING...' : 'DONE!'}
                                     </span>
                                </div>
                                <div className="mb-4 space-y-2 bg-[#f4f4f5] p-5 rounded-2xl border-2 border-black">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-black font-bold border-b-2 border-dashed border-gray-300 pb-2 last:border-0 mickey-font">
                                            <div className="flex flex-col">
                                                <span>{i.quantity}x {i.product_name}</span>
                                                {/* Variant */}
                                                {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-white bg-black px-1.5 rounded w-fit border border-white uppercase font-bold">{i.variant}</span>}
                                                {/* Note */}
                                                {i.note && <span className="text-[10px] text-gray-500 italic bg-white px-2 py-0.5 rounded border border-black mt-1 block w-fit shadow-sm"><Icon name="pencil" size={8} /> "{i.note}"</span>}
                                            </div>
                                            <span className="text-[#ef4444]">{i.price * i.quantity}.-</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t-4 border-black">
                                     <span className="font-bold text-gray-500 text-xs uppercase tracking-widest">TOTAL</span>
                                     <span className="font-black text-black text-3xl mickey-font">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Mickey Style) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[85px] bg-white shadow-2xl flex justify-around items-center px-4 z-[100] rounded-[2.5rem] border-4 border-zinc-900">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-red-50' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-[#ef4444]' : 'text-slate-300'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-red-50' : ''}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-[#ef4444]' : 'text-slate-300'}`} />
                 </div>
             </button>

             {/* Big Cart Button (Red Circle) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#ef4444] rounded-full shadow-lg flex items-center justify-center text-white border-4 border-white active:scale-90 transition-all duration-100 z-20 group hover:bg-red-600">
                     <Icon name="basket" size={32} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#facc15] text-black text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-black animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-red-50' : ''}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-[#ef4444]' : 'text-slate-300'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-zinc-900/80 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-white border-t-8 border-[#ef4444] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[4rem] relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-zinc-900 rounded-full border-4 border-zinc-900 flex items-center justify-center hover:bg-red-50 transition-colors shadow-md active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-85 overflow-hidden border-b-8 border-zinc-900 rounded-b-[3.5rem] bg-red-50">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-[#facc15] text-zinc-900 font-black text-3xl mickey-font rounded-2xl border-4 border-zinc-900 shadow-xl transform -rotate-3 flex flex-col items-center leading-none">
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
                        <h2 className="text-4xl mickey-font text-zinc-900 mb-6 leading-tight drop-shadow-sm uppercase tracking-widest">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            {/* --- 3 PRICES VARIANT SELECTOR --- */}
                            <div>
                                <label className="block text-xl font-bold text-zinc-900 mb-3 mickey-font uppercase tracking-wider">PICK SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'MINI', icon: 'star', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'SUPER', icon: 'star', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'ULTRA', icon: 'star', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center justify-between h-28 mickey-font
                                                ${variant === v.key 
                                                    ? 'bg-black border-black shadow-lg -translate-y-1 text-white' 
                                                    : 'bg-white border-gray-300 text-gray-400 hover:border-black hover:text-black'}`}
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
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-zinc-900 mickey-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-zinc-800 active:scale-90 transition-all font-black text-2xl border-2 border-white"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-1 mickey-font">Energy Cost</p>
                                    <p className="text-4xl font-black text-zinc-900 mickey-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Item Note Input */}
                            <div className="relative">
                                <label className="block text-xl font-bold text-zinc-900 mb-2 mickey-font uppercase tracking-wider">MESSAGE:</label>
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="A message for Goofy or Donald..." 
                                    className="w-full p-6 bg-zinc-50 border-4 border-zinc-900 rounded-[2.5rem] focus:border-red-500 focus:outline-none h-36 resize-none text-xl font-bold text-zinc-800 placeholder:text-zinc-300 transition-colors shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-white border-4 border-zinc-900 text-zinc-900 font-black text-xl rounded-2xl active:scale-95 transition-all shadow-[6px_6px_0_#facc15] mickey-font">
                                Keep It
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-disney text-2xl active:scale-95 transition-all flex items-center justify-center gap-2 mickey-font">
                                OH BOY! <Icon name="star" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ORDER SUMMARY MODAL --- */}
        <div id="orderSummaryOverlay" className={`fixed inset-0 bg-zinc-950/60 z-[130] backdrop-blur-sm animate-fade-in ${activeTab === 'cart' ? 'block' : 'hidden'}`} onClick={() => setActiveTab('menu')}></div>
        <div id="orderSummary" className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-[10px] border-zinc-900 z-[140] flex flex-col shadow-2xl h-[92vh] rounded-t-[4rem] transition-transform duration-300 ${activeTab === 'cart' ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="sticky top-0 bg-white z-20 rounded-t-[4rem] border-b-4 border-zinc-50 p-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                <div className="w-24 h-2 bg-zinc-200 rounded-full mx-auto mt-2 opacity-30"></div>
            </div>
            
            <div className="flex justify-between items-center mb-6 px-10 pt-8">
                <h2 className="text-4xl mickey-font text-zinc-900 transform -rotate-1 tracking-widest">Inventory</h2>
                <div className="w-14 h-14 bg-red-100 text-red-500 border-4 border-zinc-900 rounded-2xl flex items-center justify-center font-black text-2xl mickey-font shadow-lg">
                    <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 px-8 pb-4 no-scrollbar">
                {cart.map((item: any, idx: any) => (
                    <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-black rounded-[2rem] shadow-sm relative overflow-hidden hover:shadow-md hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                        <div className="w-20 h-20 bg-[#fee2e2] rounded-2xl overflow-hidden border-2 border-black shrink-0">
                            <img src={item.image_url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-black text-xl leading-tight mickey-font tracking-wide">
                                {item.name} <span className="text-[#ef4444]">x{item.quantity}</span>
                            </div>
                            <div className="text-sm font-bold mt-1 text-[#4b5563]">
                                {item.variant !== 'normal' && <span className="bg-black text-white px-2 py-0.5 rounded border-2 border-white text-xs mr-2 font-sans uppercase font-bold">{item.variant}</span>}
                                {/* 🔥 VISIBLE ITEM NOTE IN CART */}
                                {item.note && (
                                    <span className="block mt-1 bg-[#fee2e2] text-black text-[12px] px-2 py-1 rounded border border-black italic font-sans">
                                        <Icon name="pencil" size={10} /> "{item.note}"
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className="font-black text-black text-2xl mickey-font">{item.price * item.quantity}.-</span>
                             <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#fee2e2] text-[#ef4444] rounded-full flex items-center justify-center hover:bg-red-200 transition-colors border-2 border-black shadow-sm active:scale-90">
                                 <Icon name="trash" size={18} />
                             </button>
                        </div>
                    </div>
                ))}
                {cart.length === 0 && (
                    <div className="text-center py-20 text-gray-400 font-bold text-2xl mickey-font opacity-50">
                        Nothing here, Pal!
                    </div>
                )}
            </div>

            <div className="p-10 bg-zinc-900 border-t-4 border-white relative z-30 rounded-t-[4rem]">
                <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-dashed border-zinc-700">
                    <div>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mickey-font">Total Points</p>
                        <p className="text-5xl font-black text-white drop-shadow-md">{cartTotal}.-</p>
                    </div>
                    <div className="w-20 h-20 bg-white border-4 border-zinc-900 flex items-center justify-center text-red-500 transform rotate-6 shadow-2xl">
                        <Icon name="receipt" size={40} />
                    </div>
                </div>
                <button onClick={() => { onCheckoutClick(); }} className="w-full py-6 btn-disney text-3xl active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.1em]">
                    <span>HOT DOG! LET'S GO!</span> <Icon name="check" size={32} strokeWidth={4} />
                </button>
            </div>
        </div>

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-zinc-950/90 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-jello">
                <div className="w-full max-w-sm bg-white border-8 border-zinc-900 p-10 text-center shadow-2xl animate__animated animate__bounceIn relative overflow-hidden rounded-[3rem]">
                    <div className="w-28 h-28 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-zinc-900 shadow-lg relative z-10 animate-ears">
                        <Icon name="star" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-3xl mickey-font text-zinc-900 mb-4 leading-tight relative z-10 uppercase tracking-widest">See It? Order It!</h3>
                            <p className="text-lg text-zinc-500 mb-10 font-bold mickey-font relative z-10">Add "{selectedProduct.name}" to your bag?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-red-500 text-white font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl mickey-font uppercase">YAY! DO IT!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-white border-4 border-zinc-200 text-zinc-300 font-black text-lg active:scale-95 transition-transform hover:bg-zinc-50 mickey-font uppercase">Just Add</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl mickey-font text-zinc-900 mb-4 leading-tight relative z-10 uppercase tracking-widest">See It? Order It!</h3>
                            <p className="text-lg text-zinc-500 mb-10 font-bold mickey-font relative z-10">You have things in your bag! Order all the Mouska-treats?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { onCheckoutClick(); }} className="w-full py-5 bg-red-500 text-white font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl mickey-font uppercase">YAY! DO IT!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white border-4 border-zinc-200 text-zinc-300 font-black text-lg active:scale-95 transition-transform hover:bg-zinc-50 mickey-font uppercase">Wait!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}