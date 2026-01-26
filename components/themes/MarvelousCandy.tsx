import React, { useState, useEffect, useRef } from "react";

// --- 🍬 Flapjack Icons Wrapper ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Barrel / Dock
    home: <path d="M4 10v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10M2 6h20v4H2z M12 2v4" />, 
    // Menu -> Fork & Knife (Grub)
    menu: <path d="M18 4v16M14 4v16M6 4c0 4 0 7 3 8v8M10 4c0 4 0 7-3 8" />,
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Candy Sack
    basket: <path d="M12 2C7 2 4 6 4 10c0 3 2 6 6 9v3h4v-3c4-3 6-6 6-9 0-4-3-8-8-8z M8 10h8" />,
    // Clock -> Compass / Map
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Skull / Captain
    chef: <path d="M12 2a5 5 0 0 0-5 5v3h10V7a5 5 0 0 0-5-5z M8 16h8 M9 13h1 M14 13h1" />, 
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6L6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Ship / Anchor / Adventure
    flame: <path d="M12 2v16M5 12h14M12 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />, // Simple anchor shape
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
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
      {name === 'clock' && <path d="M12 6v6l4 2" />}
      {name === 'basket' && <path d="M12 6v4" opacity="0.5"/>}
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

  // --- 🔥 AUTO-CHECKOUT LOGIC (Original) ---
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


  if (loading && !isVerified) return <div className="min-h-screen bg-transparent" />; // Changed to transparent

  const currentPriceObj = selectedProduct 
    ? calculatePrice(selectedProduct, variant) 
    : { final: 0 };

  const handleAdd = (addToCartOnly = true) => {
    if (!selectedProduct) return;

    if (addToCartOnly) {
        for(let i=0; i<qty; i++) {
            handleAddToCart(selectedProduct, variant, note);
        }
        setSelectedProduct(null);
    } else {
        if (cart && cart.length > 0) {
            setShowConfirm(true); 
        } else {
            performCookNow();
        }
    }
  };

  const performCookNow = () => {
    for(let i=0; i<qty; i++) {
        handleAddToCart(selectedProduct, variant, note);
    }
    setPendingCookNow(true);
    setSelectedProduct(null);
  };

  return (
    // Theme: The Marvelous Candy Barrel (Flapjack)
    // Removed bg-[#fef3c7] to show background pattern
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#451a03] border-x-4 border-[#b45309]">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Mali:ital,wght@0,300;0,400;0,600;0,700;1,600&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --sea-teal: #2dd4bf;
                --deep-sea: #0f766e;
                --wood: #92400e;
                --wood-light: #b45309;
                --candy-red: #ef4444;
                --bg-paper: #fef3c7;
                --text-color: #451a03;
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg-paper);
                /* Wavy Sea Pattern */
                background-image: 
                    radial-gradient(circle at 50% 0, var(--sea-teal) 10%, transparent 11%),
                    radial-gradient(circle at 50% 100%, var(--sea-teal) 10%, transparent 11%);
                background-size: 40px 40px;
                background-position: 0 0, 20px 20px;
            }

            .adventure-font {
                font-family: 'Mali', cursive;
            }

            /* --- Animations --- */
            @keyframes float {
                0% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-5px) rotate(1deg); }
                100% { transform: translateY(0px) rotate(0deg); }
            }
            .animate-float { animation: float 3s ease-in-out infinite; }

            @keyframes rubberBand {
                0% { transform: scale3d(1, 1, 1); }
                30% { transform: scale3d(1.25, 0.75, 1); }
                40% { transform: scale3d(0.75, 1.25, 1); }
                50% { transform: scale3d(1.15, 0.85, 1); }
                65% { transform: scale3d(0.95, 1.05, 1); }
                75% { transform: scale3d(1.05, 0.95, 1); }
                100% { transform: scale3d(1, 1, 1); }
            }
            .animate-rubber { animation: rubberBand 0.8s; }

            /* --- Components --- */
            .btn-adventure {
                background: var(--candy-red);
                color: white;
                border: 3px solid #7f1d1d;
                border-radius: 1rem;
                font-family: 'Mali', cursive;
                font-weight: 700;
                box-shadow: 0 4px 0 #7f1d1d;
                transition: all 0.1s;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .btn-adventure:active {
                transform: translateY(4px);
                box-shadow: 0 0 0 #7f1d1d;
            }

            .item-card {
                background: #fff;
                border-radius: 1rem;
                border: 4px solid var(--wood);
                box-shadow: 4px 4px 0px var(--wood-light);
                background-image: repeating-linear-gradient(0deg, transparent, transparent 19px, #fef3c7 20px);
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            }
            .item-card:hover, .item-card:active {
                transform: rotate(-1deg) scale(0.98);
                box-shadow: 2px 2px 0px var(--wood-light);
                border-color: var(--candy-red);
            }

            .tab-btn {
                background: #fff;
                color: var(--wood);
                border: 3px dashed var(--wood);
                border-radius: 0.5rem;
                transition: all 0.3s;
            }
            .tab-btn.active {
                background: var(--sea-teal);
                color: #fff;
                border: 3px solid var(--deep-sea);
                box-shadow: 0 4px 0 var(--deep-sea);
                transform: skewX(-5deg);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* --- Header (Bubbie's Mouth Style) --- */}
        <header className="bg-[#2dd4bf] text-white pt-8 pb-16 px-6 rounded-b-[4rem] relative overflow-hidden shadow-xl z-10 border-b-8 border-[#0f766e]">
             {/* Bubbie's Teeth/Waves - Set bg to transparent or matching gradient if needed, but transparent shows body bg */}
             <div className="absolute bottom-0 left-0 w-full h-8 bg-transparent" style={{clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)'}}></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#fde047] w-fit px-4 py-1 rounded-sm border-2 border-[#451a03] shadow-[2px_2px_0_rgba(0,0,0,0.2)] transform rotate-2">
                         <span className="w-3 h-3 rounded-full bg-[#ef4444] animate-ping"></span>
                         <p className="text-[#451a03] text-xs font-black tracking-wide adventure-font">CANDY ISLAND?</p>
                     </div>
                     <h1 className="text-3xl adventure-font tracking-wide leading-none mt-2 text-[#0f766e] drop-shadow-sm">
                         {brand?.name || "The Candy Barrel"}
                     </h1>
                 </div>
                 
                 {/* Candy/Anchor Icon */}
                 <div className="w-16 h-16 bg-[#ef4444] rounded-full border-4 border-white flex items-center justify-center relative shadow-[4px_4px_0_#451a03] animate-float">
                     <Icon name="basket" className="text-white w-8 h-8 transform rotate-6" />
                     <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-[#2dd4bf] rounded-full border-2 border-[#0f766e] flex items-center justify-center text-[#0f766e] text-xs font-bold">
                         <Icon name="flame" size={14} /> {/* Anchor */}
                     </div>
                 </div>
             </div>
        </header>
        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-rubber">
                    {/* Hero Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-[#92400e] rounded-xl overflow-hidden shadow-[6px_6px_0_#451a03] mb-8 border-4 border-[#b45309] p-2">
                            <div className="h-full w-full rounded-lg overflow-hidden border-2 border-[#fef3c7] bg-[#2dd4bf]">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover sepia-[.3]" />
                            </div>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#ef4444] text-white px-6 py-2 rounded-b-xl border-x-4 border-b-4 border-[#7f1d1d] shadow-md">
                                <span className="adventure-font text-lg uppercase">Captain's Pick!</span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                         <div>
                             <h2 className="text-3xl adventure-font text-[#92400e] drop-shadow-sm transform -rotate-1">Loot & Grub</h2>
                             <p className="text-sm text-[#0f766e] font-bold adventure-font ml-1">Approved by K'nuckles!</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#2dd4bf] text-[#0f766e] px-5 py-3 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#5eead4] transition-colors adventure-font border-2 border-[#0f766e] shadow-[4px_4px_0_#0f766e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                             Set Sail <Icon name="flame" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#fef3c7] border-b-4 border-[#92400e]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 sepia-[.2]" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#ef4444] text-white text-xs font-black px-2 py-1 rounded border-2 border-[#451a03] transform -rotate-6 shadow-sm">
                                                LOOT!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white/90">
                                         <h3 className="font-bold text-[#451a03] text-sm line-clamp-2 mb-2 leading-tight adventure-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-xs text-gray-400 line-through decoration-[#ef4444] decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#ef4444] font-black text-xl adventure-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#fef3c7] text-[#92400e] border-2 border-[#92400e] flex items-center justify-center rounded-md hover:bg-[#fde68a] transition-all shadow-sm active:scale-90">
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
                <section className="animate-rubber pt-4">
                    <div className="relative mb-8 group mt-4">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#92400e]" />
                         </div>
                         <input type="text" placeholder="Search for Candy..." className="w-full pl-14 pr-6 py-4 rounded-xl bg-white border-4 border-[#92400e] text-[#451a03] placeholder:text-[#b45309] focus:outline-none focus:border-[#ef4444] focus:rotate-1 transition-all text-lg font-bold adventure-font shadow-[4px_4px_0_rgba(0,0,0,0.1)]" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-3 text-lg font-bold adventure-font flex items-center gap-2 ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-24">
                        {filteredProducts?.map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#fef3c7] border-b-4 border-[#92400e]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 sepia-[.2]" />
                                     </div>
                                     <div className="p-4 bg-white/90">
                                         <h3 className="font-bold text-[#451a03] text-sm line-clamp-2 mb-2 leading-tight adventure-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-xs text-gray-400 line-through decoration-[#ef4444] decoration-2 font-bold">{pricing.original}</span>}
                                                 <span className="text-[#ef4444] font-black text-xl adventure-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#fef3c7] text-[#92400e] border-2 border-[#92400e] flex items-center justify-center rounded-md hover:bg-[#fde68a] transition-all shadow-sm active:scale-90">
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
                <section className="animate-rubber pt-4 pb-24">
                    {/* Header: Map */}
                    <div className="mb-8 flex items-center justify-between bg-white p-6 border-4 border-[#2dd4bf] rounded-xl shadow-[8px_8px_0_#0f766e] relative overflow-hidden transform rotate-1">
                         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]"></div>
                         <div className="relative z-10">
                             <h2 className="text-3xl adventure-font text-[#0f766e]">Map to Food</h2>
                             <p className="text-sm text-[#92400e] font-bold mt-1 adventure-font">X marks the spot!</p>
                         </div>
                         <div className="w-16 h-16 bg-[#fde047] border-4 border-[#451a03] rounded-full flex items-center justify-center animate-bounce shadow-sm">
                             <Icon name="clock" size={32} className="text-[#ef4444]" />
                         </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="bg-white p-5 border-4 border-[#92400e] rounded-xl relative overflow-hidden shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-[#ef4444] font-black uppercase tracking-widest flex items-center gap-1 font-bold">
                                         Order #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-3 py-1 text-xs font-black uppercase tracking-wide border-2 flex items-center gap-1.5 adventure-font shadow-sm rounded-lg transform -rotate-1
                                         ${o.status === 'pending' ? 'bg-[#fef3c7] text-[#92400e] border-[#b45309]' : 'bg-[#dcfce7] text-[#15803d] border-[#22c55e]'}`}>
                                         {o.status === 'pending' ? 'Brewing...' : 'Ready!'}
                                     </span>
                                </div>
                                <div className="mb-3 space-y-1 bg-[#fef3c7] p-4 border-2 border-[#b45309] rounded-lg border-dashed">
                                    {o.order_items.map((i, idx) => {
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        return (
                                            <div key={idx} className="flex justify-between items-start text-sm text-[#451a03] font-bold mb-2 border-b-2 border-dashed border-[#b45309] pb-2 last:border-0 adventure-font">
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-base">{quantity}x {i.product_name}</span>
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] bg-[#2dd4bf] text-[#0f766e] px-2 py-0.5 rounded-sm font-sans font-bold mt-1 shadow-sm uppercase tracking-wider border border-[#0f766e]`}>
                                                            {i.variant}
                                                        </span>
                                                    )}
                                                    {i.note && <span className="text-xs text-[#92400e] italic mt-0.5">Note: {i.note}</span>}
                                                </div>
                                                <span className="text-[#ef4444] text-lg">{finalPriceTotal}.-</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t-2 border-[#92400e]">
                                     <span className="font-bold text-[#451a03] text-xs uppercase tracking-widest">TOTAL</span>
                                     <span className="font-black text-[#ef4444] text-2xl adventure-font">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                         {(!ordersList || ordersList.length === 0) && (
                             <div className="text-center py-12 opacity-50">
                                <div className="w-16 h-16 bg-[#fef3c7] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#92400e] animate-pulse">
                                    <Icon name="search" size={32} className="text-[#92400e]" />
                                </div>
                                <p className="adventure-font text-xl text-[#92400e]">The barrel is empty...</p>
                             </div>
                         )}
                    </div>
                </section>
            )}
        </main>

        {/* --- FLOATING NAV (Wooden Dock) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[80px] bg-[#92400e] shadow-[0_10px_0_#451a03] flex justify-around items-center px-4 z-[90] rounded-xl border-4 border-[#b45309]">
             {/* Nails */}
             <div className="absolute top-2 left-2 w-2 h-2 bg-[#451a03] rounded-full opacity-50"></div>
             <div className="absolute top-2 right-2 w-2 h-2 bg-[#451a03] rounded-full opacity-50"></div>
             
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'text-white' : 'text-[#fde047]'}`}>
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors border-2 border-transparent ${activeTab === 'home' ? 'bg-[#b45309] border-[#fde047]' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'text-white' : 'text-[#fde047]'}`}>
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors border-2 border-transparent ${activeTab === 'menu' ? 'bg-[#b45309] border-[#fde047]' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* Cart Button (Candy) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#ef4444] rounded-full shadow-[0_6px_0_#7f1d1d] flex items-center justify-center text-white border-4 border-white active:shadow-none active:translate-y-[6px] transition-all duration-100 z-20 group">
                     <Icon name="basket" size={32} className="group-hover:rotate-12 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#2dd4bf] text-[#0f766e] text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-[#0f766e] animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'text-white' : 'text-[#fde047]'}`}>
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors border-2 border-transparent ${activeTab === 'status' ? 'bg-[#b45309] border-[#fde047]' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0f766e]/80 backdrop-blur-sm animate-rubber">
                <div className="w-full max-w-md bg-white border-t-[6px] border-x-[6px] border-[#92400e] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[2rem]">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#ef4444] text-white rounded-lg border-2 border-[#7f1d1d] flex items-center justify-center hover:bg-[#dc2626] transition-colors shadow-md active:scale-90">
                            <Icon name="x" />
                        </button>
                        <div className="relative w-full h-80 overflow-hidden border-b-[6px] border-[#92400e] rounded-b-[1.5rem] bg-[#2dd4bf]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover sepia-[.3]" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#fde047] text-[#451a03] font-black text-2xl adventure-font rounded-lg border-4 border-[#451a03] shadow-[4px_4px_0_rgba(0,0,0,0.2)] transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-[#7f1d1d] decoration-[#ef4444] decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32">
                        <h2 className="text-4xl adventure-font text-[#451a03] mb-6 leading-tight drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5">
                            {/* --- 🏷️ VARIANT SELECTOR (Wooden Planks Style) --- */}
                            <div>
                                <label className="block text-lg font-bold text-[#92400e] mb-3 adventure-font ml-1 tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'NORMAL', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'CAPTAIN', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'BUBBIE', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center justify-between h-24 adventure-font
                                                ${variant === v.key 
                                                    ? 'bg-[#2dd4bf] border-[#0f766e] shadow-[2px_2px_0_#0f766e] -translate-y-1 text-[#0f766e]' 
                                                    : 'bg-[#fef3c7] border-[#b45309] text-[#92400e] hover:border-[#92400e]'}`}
                                        >
                                            <span className="text-xs font-black tracking-widest">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && <span className="text-[10px] line-through decoration-[#ef4444] opacity-70">{v.original}</span>}
                                                <span className="text-xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-3 bg-[#fef3c7] p-3 rounded-xl border-4 border-[#92400e] shadow-sm">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white text-[#92400e] rounded-lg flex items-center justify-center hover:bg-[#fff7ed] active:scale-90 transition-all font-black text-2xl border-2 border-[#92400e]"><Icon name="minus" /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-[#451a03] adventure-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#92400e] text-white rounded-lg flex items-center justify-center hover:bg-[#78350f] active:scale-90 transition-all font-black text-2xl border-2 border-[#451a03]"><Icon name="plus" /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-[#ef4444] font-black uppercase tracking-widest mb-1 adventure-font">BOUNTY</p>
                                    <p className="text-4xl font-black text-[#451a03] adventure-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Tell Peppermint Larry..." 
                                    className="w-full p-6 bg-white border-4 border-[#2dd4bf] rounded-xl focus:border-[#ef4444] focus:outline-none h-32 resize-none text-lg font-bold text-[#0f766e] placeholder:text-[#99f6e4] transition-colors shadow-inner adventure-font"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border-4 border-[#451a03] text-[#451a03] font-black text-lg rounded-xl active:scale-95 transition-all shadow-[4px_4px_0_#92400e] adventure-font">
                                Stow Away
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-adventure text-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                ADVENTURE! <Icon name="flame" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#451a03]/80 backdrop-blur-sm animate-rubber">
                 <div className="w-full max-w-md bg-[#fef3c7] border-t-[6px] border-[#92400e] flex flex-col shadow-[0_-20px_60px_rgba(146,64,14,0.4)] h-[85vh] rounded-t-[3rem]">
                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-2 bg-[#92400e] rounded-full mx-auto opacity-50" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-3xl font-black text-[#92400e] adventure-font transform -rotate-1">Bubbie's Tummy</h2>
                         <div className="w-12 h-12 bg-[#2dd4bf] text-white border-4 border-[#0f766e] rounded-full flex items-center justify-center font-black text-xl adventure-font shadow-md">
                             <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-[#92400e] rounded-xl relative overflow-hidden shadow-sm">
                                 <img src={item.image_url} className="w-16 h-16 object-cover border-2 border-[#b45309] rounded-lg ml-2 bg-[#fef3c7] sepia-[.2]" />
                                 <div className="flex-1">
                                     <div className="font-bold text-[#451a03] text-lg leading-tight adventure-font tracking-wide">
                                         {item.name} <span className="text-[#ef4444]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-xs text-[#0f766e] mt-1 font-bold">
                                         {item.variant !== 'normal' && <span className="text-[#0f766e] font-black uppercase mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-[#92400e] italic mt-1 bg-[#fef3c7] p-1 rounded">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#ef4444] text-xl adventure-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#fef2f2] hover:bg-[#fee2e2] flex items-center justify-center text-[#ef4444] border-2 border-[#fee2e2] rounded-lg transition-colors active:scale-90">
                                     <Icon name="trash" size={16} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-[#b45309] font-bold adventure-font text-xl">The barrel is empty...</div>
                         )}
                     </div>

                     <div className="p-8 bg-white border-t-4 border-[#92400e] relative z-30 rounded-t-[2rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-[#b45309]">
                             <div>
                                 <p className="text-xs text-[#92400e] font-black uppercase tracking-widest adventure-font">Total Loot</p>
                                 <p className="text-5xl font-black text-[#451a03] adventure-font">{cartTotal}.-</p>
                             </div>
                             <div className="w-16 h-16 bg-[#fde047] border-4 border-[#451a03] rounded-full flex items-center justify-center text-[#451a03] transform rotate-6 shadow-lg">
                                 <Icon name="check" size={32} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-adventure text-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                             <span>FULL AHEAD!</span> <Icon name="flame" size={28} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#451a03]/80 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-rubber">
                <div className="w-full max-w-sm bg-[#fef3c7] border-4 border-[#2dd4bf] p-8 text-center shadow-[0_0_0_8px_#0f766e] animate-bounce-slow relative overflow-hidden rounded-[2rem]">
                    <div className="w-24 h-24 bg-[#2dd4bf] text-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#0f766e] shadow-lg relative z-10">
                        <Icon name="chef" size={48} className="animate-spin-slow" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-3xl font-black text-[#451a03] mb-2 leading-tight adventure-font">Not Empty!</h3>
                            <p className="text-lg text-[#0f766e] mb-8 font-bold adventure-font">Stow {selectedProduct.name} with the rest?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#ef4444] text-white font-black border-4 border-[#7f1d1d] shadow-[4px_4px_0_#7f1d1d] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-xl adventure-font rounded-xl">AYE AYE CAPTAIN!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-[#92400e] text-[#92400e] font-black text-sm active:scale-95 transition-transform hover:bg-[#fff7ed] adventure-font rounded-xl">NO, JUST STOW IT</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl font-black text-[#451a03] mb-2 leading-tight adventure-font">Hold Your Horses!</h3>
                            <p className="text-lg text-[#0f766e] mb-8 font-bold adventure-font">Ready to set sail with this loot?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-[#ef4444] text-white font-black border-4 border-[#7f1d1d] shadow-[4px_4px_0_#7f1d1d] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-xl adventure-font rounded-xl">ADVENTURE!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-[#92400e] text-[#92400e] font-black text-sm active:scale-95 transition-transform hover:bg-[#fff7ed] adventure-font rounded-xl">Nope, West!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}