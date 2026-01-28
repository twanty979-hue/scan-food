import React, { useState, useEffect, useRef } from "react";

// --- 🐱 Oggy & Cockroaches Icons Wrapper ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> House
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />, 
    // Menu -> Fridge / Utensils
    menu: <path d="M3 2h18v20H3zm2 2v5h14V4zm0 7v9h6v-9zm8 0v9h6v-9z" />, // Fridge shape
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Shopping Cart
    basket: <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />,
    // Clock -> Bomb (Roach Trap)
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Roach Antennae / Fly Swatter
    chef: <path d="M2 2l20 20 M22 2l-20 20" />, // Swatter X
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6L6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Explosion / POW!
    flame: <path d="M12 2L14 8L20 8L15 13L17 20L12 16L7 20L9 13L4 8L10 8Z" />,
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
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
      {name === 'basket' && <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></>}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-transparent" />;

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
    // Theme: Oggy's Kitchen
    // Removed bg color to show Wacky Wallpaper
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#1e3a8a] border-x-4 border-white">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Mali:ital,wght@0,300;0,400;0,600;0,700;1,600&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --oggy-blue: #60a5fa;
                --oggy-light: #93c5fd;
                --nose-red: #f43f5e;
                --joey-purple: #a855f7;
                --marky-green: #84cc16;
                --deedee-orange: #fb923c;
                --bg-color: #e0f2fe;
                --text-color: #1e3a8a;
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg-color);
                /* --- Wacky Wallpaper Pattern --- */
                background-image: 
                    radial-gradient(var(--oggy-light) 15%, transparent 16%),
                    radial-gradient(var(--oggy-light) 15%, transparent 16%);
                background-position: 0 0, 25px 25px;
                background-size: 50px 50px;
                background-attachment: fixed;
            }

            .cartoon-font {
                font-family: 'Mali', cursive;
            }

            /* --- Animations --- */
            @keyframes boing {
                0%, 100% { transform: scale(1, 1) translateY(0); }
                10% { transform: scale(1.1, 0.9) translateY(0); }
                30% { transform: scale(0.9, 1.1) translateY(-10px); }
                50% { transform: scale(1.05, 0.95) translateY(0); }
                57% { transform: scale(1, 1) translateY(-2px); }
                64% { transform: scale(1, 1) translateY(0); }
            }
            .animate-boing { animation: boing 0.8s ease-in-out; }

            @keyframes scuttle {
                0% { transform: rotate(0deg) translateX(0); }
                25% { transform: rotate(5deg) translateX(2px); }
                50% { transform: rotate(0deg) translateX(0); }
                75% { transform: rotate(-5deg) translateX(-2px); }
                100% { transform: rotate(0deg) translateX(0); }
            }
            .animate-scuttle { animation: scuttle 0.2s infinite linear; }

            /* --- Components --- */
            .btn-oggy {
                background: var(--oggy-blue);
                color: white;
                border: 4px solid white;
                outline: 4px solid var(--oggy-blue);
                border-radius: 1.5rem;
                font-family: 'Mali', cursive;
                font-weight: 700;
                box-shadow: 0 6px 0 var(--text-color);
                transition: all 0.1s;
            }
            .btn-oggy:active {
                transform: translateY(6px);
                box-shadow: 0 0 0 var(--text-color);
            }

            .btn-roach {
                background: var(--joey-purple);
                color: white;
                border-radius: 1rem;
                font-family: 'Mali', cursive;
                font-weight: 700;
                box-shadow: 4px 4px 0 var(--text-color);
                border: 2px solid var(--text-color);
            }
            .btn-roach:active {
                transform: translate(4px, 4px);
                box-shadow: 0 0 0 var(--text-color);
            }

            .item-card {
                background: white;
                border-radius: 2rem;
                border: 4px solid var(--oggy-blue);
                box-shadow: 0 6px 0 var(--text-color);
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .item-card:hover, .item-card:active {
                transform: translateY(4px);
                box-shadow: 0 2px 0 var(--text-color);
                border-color: var(--nose-red);
            }

            .tab-btn {
                background: white;
                color: var(--text-color);
                border: 3px solid var(--oggy-blue);
                border-radius: 1.5rem;
                transition: all 0.3s;
            }
            .tab-btn.active {
                background: var(--nose-red);
                color: white;
                border: 3px solid white;
                box-shadow: 0 4px 10px rgba(244, 63, 94, 0.4);
                transform: rotate(-3deg) scale(1.05);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* --- Header (Oggy Style) --- */}
        <header className="bg-[#60a5fa] text-white pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-xl z-10 border-b-8 border-white">
             {/* Background Circles */}
             <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-[#93c5fd] rounded-full opacity-50"></div>
             <div className="absolute bottom-[-10px] right-[-10px] w-32 h-32 bg-[#3b82f6] rounded-full opacity-30"></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-white w-fit px-4 py-1.5 rounded-full border-2 border-[#1e3a8a] shadow-sm transform -rotate-2">
                         <span className="w-3 h-3 rounded-full bg-[#f43f5e] animate-ping"></span>
                         <p className="text-[#1e3a8a] text-xs font-black tracking-wide cartoon-font">NO ROACHES!</p>
                     </div>
                     <h1 className="text-4xl cartoon-font tracking-wide leading-none mt-2 text-white drop-shadow-[0_4px_0_rgba(30,58,138,0.5)]">
                         {brand?.name || "Oggy's Kitchen"}
                     </h1>
                 </div>
                 
                 {/* Fly Swatter Icon */}
                 <div className="w-16 h-16 bg-white rounded-2xl border-4 border-[#1e3a8a] flex items-center justify-center relative shadow-[4px_4px_0_rgba(0,0,0,0.2)] transform rotate-6 hover:rotate-12 transition-transform">
                     <Icon name="chef" className="text-[#a855f7] w-10 h-10 animate-scuttle" />
                     <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#f43f5e] rounded-full border-2 border-white flex items-center justify-center font-bold text-xs text-white">!</div>
                 </div>
             </div>
        </header>
        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-boing">
                    {/* Hero Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_0_#93c5fd] mb-8 border-4 border-white p-2">
                            <div className="h-full w-full rounded-[2rem] overflow-hidden border-2 border-[#e0f2fe]">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute top-4 right-4 bg-[#fb923c] text-white px-4 py-2 rounded-xl border-2 border-white transform rotate-3 shadow-md">
                                <span className="cartoon-font text-lg">Yummy!</span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                         <div>
                             <h2 className="text-3xl cartoon-font text-[#1e3a8a] drop-shadow-sm">Big Meals</h2>
                             <p className="text-sm text-[#60a5fa] font-bold cartoon-font ml-1">Before the roaches get it!</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#84cc16] text-white px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#65a30d] transition-colors cartoon-font border-2 border-[#1e3a8a] shadow-[4px_4px_0_#1e3a8a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                             Grab It! <Icon name="menu" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#e0f2fe] border-b-4 border-[#60a5fa]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#f43f5e] text-white text-xs font-black px-2 py-1 rounded-lg border-2 border-white transform -rotate-6 shadow-sm">
                                                SAVE!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white/90">
                                         <h3 className="font-bold text-[#1e3a8a] text-sm line-clamp-2 mb-2 leading-tight cartoon-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-xs text-gray-400 line-through decoration-[#f43f5e] decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#f43f5e] font-black text-xl cartoon-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#e0f2fe] text-[#1e3a8a] border-2 border-[#1e3a8a] flex items-center justify-center rounded-md hover:bg-white transition-all shadow-sm active:scale-90">
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
                <section className="animate-boing pt-4">
                    <div className="relative mb-8 group mt-4">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#60a5fa]" />
                         </div>
                         <input type="text" placeholder="Find chicken leg..." className="w-full pl-14 pr-6 py-4 rounded-[2rem] bg-white border-4 border-[#60a5fa] text-[#1e3a8a] placeholder:text-[#93c5fd] focus:outline-none focus:border-[#f43f5e] focus:shadow-[0_0_0_4px_#fecdd3] transition-all text-lg font-bold cartoon-font" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-3 text-lg font-bold cartoon-font flex items-center gap-2 ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-24">
                        {filteredProducts?.map((p: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#e0f2fe] border-b-4 border-[#60a5fa]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                     </div>
                                     <div className="p-4 bg-white/90">
                                         <h3 className="font-bold text-[#1e3a8a] text-sm line-clamp-2 mb-2 leading-tight cartoon-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-xs text-gray-400 line-through decoration-[#f43f5e] decoration-2 font-bold">{pricing.original}</span>}
                                                 <span className="text-[#f43f5e] font-black text-xl cartoon-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#e0f2fe] text-[#1e3a8a] border-2 border-[#1e3a8a] flex items-center justify-center rounded-md hover:bg-white transition-all shadow-sm active:scale-90">
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
                <section className="animate-boing pt-4 pb-24">
                    {/* Header: Trap Status */}
                    <div className="mb-8 flex items-center justify-between bg-white p-6 border-4 border-[#1e3a8a] rounded-[2.5rem] shadow-[8px_8px_0_#a855f7] relative overflow-hidden">
                         <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12">💣</div>
                         <div className="relative z-10">
                             <h2 className="text-3xl cartoon-font text-[#1e3a8a]">Trap Status</h2>
                             <p className="text-sm text-[#f43f5e] font-bold mt-1 cartoon-font">Waiting for explosion...</p>
                         </div>
                         <div className="w-16 h-16 bg-[#fb923c] border-4 border-[#1e3a8a] rounded-full flex items-center justify-center animate-bounce shadow-sm">
                             <Icon name="clock" size={32} className="text-white" />
                         </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-white p-5 border-4 border-[#1e3a8a] rounded-2xl relative overflow-hidden shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-[#f43f5e] font-black uppercase tracking-widest flex items-center gap-1 font-bold">
                                         Order #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-3 py-1 text-xs font-black uppercase tracking-wide border-2 flex items-center gap-1.5 cartoon-font shadow-sm rounded-lg transform -rotate-1
                                         ${o.status === 'pending' ? 'bg-[#fefce8] text-[#84cc16] border-[#84cc16]' : 'bg-[#e0f2fe] text-[#1e3a8a] border-[#60a5fa]'}`}>
                                         {o.status === 'pending' ? 'Setting Trap...' : 'BOOM! Ready!'}
                                     </span>
                                </div>
                                <div className="mb-3 space-y-1 bg-[#e0f2fe] p-4 border-2 border-[#60a5fa] rounded-xl border-dashed">
                                    {o.order_items.map((i: any, idx: any) => {
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        return (
                                            <div key={idx} className="flex justify-between items-start text-sm text-[#1e3a8a] font-bold mb-2 border-b-2 border-dashed border-[#60a5fa] pb-2 last:border-0 cartoon-font">
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-base">{quantity}x {i.product_name}</span>
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] bg-[#a855f7] text-white px-2 py-0.5 rounded-sm font-sans font-bold mt-1 shadow-sm uppercase tracking-wider`}>
                                                            {i.variant}
                                                        </span>
                                                    )}
                                                    {i.note && <span className="text-xs text-[#f43f5e] italic mt-0.5">Note: {i.note}</span>}
                                                </div>
                                                <span className="text-[#f43f5e] text-lg">{finalPriceTotal}.-</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t-2 border-[#1e3a8a]">
                                     <span className="font-bold text-[#1e3a8a] text-xs uppercase tracking-widest">TOTAL</span>
                                     <span className="font-black text-[#f43f5e] text-2xl cartoon-font">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                         {(!ordersList || ordersList.length === 0) && (
                             <div className="text-center py-12 opacity-50">
                                <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#1e3a8a] animate-pulse">
                                    <Icon name="search" size={32} className="text-[#1e3a8a]" />
                                </div>
                                <p className="cartoon-font text-xl text-[#1e3a8a]">Fridge is empty...</p>
                             </div>
                         )}
                    </div>
                </section>
            )}
        </main>

        {/* --- FLOATING NAV (Oggy's Colors) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[80px] bg-white shadow-[0_10px_25px_rgba(30,58,138,0.2)] flex justify-around items-center px-4 z-[100] rounded-full border-4 border-[#60a5fa]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'text-[#1e3a8a]' : 'text-[#93c5fd]'}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#e0f2fe]' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'text-[#1e3a8a]' : 'text-[#93c5fd]'}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#e0f2fe]' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* Cart Button (Nose Style) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#f43f5e] rounded-full shadow-[0_6px_0_#9f1239] flex items-center justify-center text-white border-4 border-white active:shadow-none active:translate-y-[6px] transition-all duration-100 z-20 group">
                     <Icon name="basket" size={32} className="group-hover:rotate-12 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#a855f7] text-white text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-white animate-boing">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'text-[#1e3a8a]' : 'text-[#93c5fd]'}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#e0f2fe]' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#1e3a8a]/80 backdrop-blur-sm animate-boing">
                <div className="w-full max-w-md bg-white border-t-[6px] border-x-[6px] border-[#60a5fa] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[3rem]">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#f43f5e] text-white rounded-full border-4 border-white flex items-center justify-center hover:bg-[#be123c] transition-colors shadow-md active:scale-90">
                            <Icon name="x" />
                        </button>
                        <div className="relative w-full h-80 overflow-hidden border-b-[6px] border-[#60a5fa] rounded-b-[2.5rem] bg-[#e0f2fe]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#84cc16] text-white font-black text-2xl cartoon-font rounded-2xl border-4 border-white shadow-[0_4px_0_#3f6212] transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-white/80 decoration-white decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32">
                        <h2 className="text-4xl cartoon-font text-[#1e3a8a] mb-6 leading-tight drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5">
                            {/* --- 🏷️ VARIANT SELECTOR (Replaces Special Checkbox) --- */}
                            <div>
                                <label className="block text-lg font-bold text-[#1e3a8a] mb-3 cartoon-font ml-1 tracking-wide">SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'NORMAL', color: 'bg-[#60a5fa]', text: 'text-[#1e3a8a]', border: 'border-[#1e3a8a]', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'JOEY', color: 'bg-[#a855f7]', text: 'text-[#6b21a8]', border: 'border-[#6b21a8]', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'DEE DEE', color: 'bg-[#fb923c]', text: 'text-[#c2410c]', border: 'border-[#c2410c]', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center justify-between h-24 cartoon-font
                                                ${variant === v.key 
                                                    ? `${v.color} border-white shadow-[0_4px_0_rgba(0,0,0,0.2)] -translate-y-1 text-white` 
                                                    : 'bg-white border-gray-200 text-gray-400 hover:border-[#60a5fa]'}`}
                                        >
                                            <span className="text-xs font-black tracking-widest">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && <span className="text-[10px] line-through decoration-white opacity-70">{v.original}</span>}
                                                <span className="text-xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Notes (No roaches allowed)..." 
                                    className="w-full p-6 bg-white border-4 border-[#a855f7] rounded-[2rem] focus:border-[#f43f5e] focus:outline-none h-32 resize-none text-lg font-bold text-[#1e3a8a] placeholder:text-[#93c5fd] transition-colors shadow-inner cartoon-font"
                                />
                            </div>
                            
                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-3 bg-[#e0f2fe] p-3 rounded-[2rem] border-4 border-white shadow-md">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white text-[#1e3a8a] rounded-full flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all font-black text-2xl border-2 border-[#1e3a8a]"><Icon name="minus" /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-[#1e3a8a] cartoon-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center hover:bg-[#172554] active:scale-90 transition-all font-black text-2xl border-2 border-[#1e3a8a]"><Icon name="plus" /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-[#a855f7] font-black uppercase tracking-widest mb-1 cartoon-font">TOTAL</p>
                                    <p className="text-4xl font-black text-[#1e3a8a] cartoon-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border-4 border-[#1e3a8a] text-[#1e3a8a] font-black text-lg rounded-2xl active:scale-95 transition-all shadow-[4px_4px_0_#93c5fd] cartoon-font">
                                Keep Safe
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-oggy text-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                EAT IT NOW! <Icon name="flame" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#1e3a8a]/80 backdrop-blur-sm animate-boing">
                 <div className="w-full max-w-md bg-[#ecfccb] border-t-[6px] border-[#84cc16] flex flex-col shadow-[0_-20px_60px_rgba(132,204,22,0.4)] h-[85vh] rounded-t-[3rem]">
                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-2 bg-[#84cc16] rounded-full mx-auto opacity-50" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-3xl font-black text-[#3f6212] cartoon-font transform -rotate-1">The Stash</h2>
                         <div className="w-12 h-12 bg-[#84cc16] text-white border-4 border-white rounded-full flex items-center justify-center font-black text-xl cartoon-font shadow-md">
                             <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item: any, idx: any) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-[#84cc16] rounded-2xl relative overflow-hidden shadow-sm">
                                 <img src={item.image_url} className="w-16 h-16 object-cover border-2 border-[#84cc16] rounded-xl ml-2 bg-[#ecfccb]" />
                                 <div className="flex-1">
                                     <div className="font-bold text-[#3f6212] text-lg leading-tight cartoon-font tracking-wide">
                                         {item.name} <span className="text-[#84cc16]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-xs text-[#a855f7] mt-1 font-bold">
                                         {item.variant !== 'normal' && <span className="text-[#a855f7] font-black uppercase mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-[#f43f5e] italic mt-1 bg-[#fefce8] p-1 rounded">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#f43f5e] text-xl cartoon-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#fef2f2] hover:bg-[#fee2e2] flex items-center justify-center text-[#f43f5e] border-2 border-[#fee2e2] rounded-xl transition-colors active:scale-90">
                                     <Icon name="trash" size={16} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-[#84cc16] font-bold cartoon-font text-xl">Stash is empty...</div>
                         )}
                     </div>

                     <div className="p-8 bg-white border-t-4 border-[#84cc16] relative z-30 rounded-t-[2rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-[#bef264]">
                             <div>
                                 <p className="text-xs text-[#84cc16] font-black uppercase tracking-widest cartoon-font">Total Damage</p>
                                 <p className="text-5xl font-black text-[#1e3a8a] cartoon-font">{cartTotal}.-</p>
                             </div>
                             <div className="w-16 h-16 bg-[#fb923c] border-4 border-[#1e3a8a] rounded-full flex items-center justify-center text-[#1e3a8a] transform rotate-6 shadow-lg">
                                 <Icon name="check" size={32} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-roach text-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                             <span>SEND IT!</span> <Icon name="flame" size={28} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#1e3a8a]/80 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-boing">
                <div className="w-full max-w-sm bg-white border-4 border-[#f43f5e] p-8 text-center shadow-[0_0_0_8px_#fecdd3] animate-boing relative overflow-hidden rounded-[3rem]">
                    <div className="w-24 h-24 bg-[#e0f2fe] text-[#60a5fa] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#60a5fa] shadow-lg relative z-10">
                        <Icon name="chef" size={48} className="animate-scuttle" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-3xl font-black text-[#1e3a8a] mb-2 leading-tight cartoon-font">Hold on Oggy!</h3>
                            <p className="text-lg text-[#60a5fa] mb-8 font-bold cartoon-font">Stash {selectedProduct.name} with the rest?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#f43f5e] text-white font-black border-4 border-[#1e3a8a] shadow-[4px_4px_0_#1e3a8a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-xl cartoon-font rounded-2xl">YEAH! MEOW!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-gray-300 text-gray-400 font-black text-sm active:scale-95 transition-transform hover:bg-gray-50 cartoon-font rounded-2xl">NO, JUST HIDE IT</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl font-black text-[#1e3a8a] mb-2 leading-tight cartoon-font">Are you sure?</h3>
                            <p className="text-lg text-[#60a5fa] mb-8 font-bold cartoon-font">Don't let the roaches steal it!</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-[#f43f5e] text-white font-black border-4 border-[#1e3a8a] shadow-[4px_4px_0_#1e3a8a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-xl cartoon-font rounded-2xl">YEAH! MEOW!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-gray-300 text-gray-400 font-black text-sm active:scale-95 transition-transform hover:bg-gray-50 cartoon-font rounded-2xl">Nah, later.</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}