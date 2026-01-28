import React, { useState, useEffect, useRef } from "react";

// --- ⚽ Stadium Icons Wrapper ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Stadium / Home Ground
    home: <path d="M2 22 L12 2 L22 22 L18 22 L18 14 L6 14 L6 22 Z M10 14 L10 10 L14 10 L14 14" />, 
    // Menu -> Tactic Board
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Kit Bag / Shopping Cart
    basket: <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />,
    // Clock -> Stopwatch / Match Time
    clock: <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm0-18C7.59 4 4 7.59 4 12s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm1 4h-2v5l4.25 2.5.75-1.23-3-1.77V8z" />,
    // Chef -> Whistle / Referee
    chef: <path d="M6 2h7c1.7 0 3 1.3 3 3v2c0 1.7-1.3 3-3 3H6C4.3 10 3 8.7 3 7V5c0-1.7 1.3-3 3-3zm9 3c0-.6-.4-1-1-1H6c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h8c.6 0 1-.4 1-1V5zM8 12h2v4H8v-4zm6 6c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2v-4h8v4z" />, 
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6L6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Soccer Ball / Kick Off
    flame: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />,
    // Stats -> Clipboard / List
    stats: <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
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
      {name === 'stats' && <path d="M12 2v20" opacity="0.0"/>}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#f0fdf4]" />;

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
    // Theme: Stadium Eats (Soccer)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-slate-900 border-x-2 border-slate-200 bg-white">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,300;0,400;0,600;0,800;1,600&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --primary: #15803d; /* Green 700 */
                --primary-light: #22c55e;
                --primary-dark: #14532d;
                --accent: #facc15; /* Yellow Card */
                --bg: #f0fdf4;
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg);
                /* Grass Pattern */
                background-image: radial-gradient(#dcfce7 15%, transparent 16%), radial-gradient(#dcfce7 15%, transparent 16%);
                background-size: 20px 20px;
                background-position: 0 0, 10px 10px;
            }

            .sport-font {
                font-family: 'Kanit', sans-serif;
                text-transform: uppercase;
                font-style: italic;
            }

            /* Animations */
            @keyframes kickIn {
                0% { transform: translateX(-50px) rotate(-10deg); opacity: 0; }
                70% { transform: translateX(5px) rotate(2deg); opacity: 1; }
                100% { transform: translateX(0) rotate(0); opacity: 1; }
            }
            .animate-kick-in { animation: kickIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

            .item-card {
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .item-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; height: 4px;
                background: linear-gradient(90deg, var(--primary), var(--accent));
                z-index: 10;
            }
            .item-card:active {
                transform: scale(0.95);
            }

            .btn-pitch {
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                border-bottom: 4px solid #064e3b;
            }
            .btn-pitch:active {
                transform: translateY(2px);
                border-bottom-width: 0px;
            }

            .tab-active {
                background: var(--primary) !important;
                color: white !important;
                box-shadow: 0 4px 15px rgba(21, 128, 61, 0.4);
                transform: skewX(-10deg);
            }
            .tab-btn { transform: skewX(-10deg); }
            .tab-btn span { display: block; transform: skewX(10deg); }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            
            /* Jersey Pattern */
            .jersey-pattern {
                background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px);
            }
        `}</style>

        {/* --- Premium Header (Stadium Style) --- */}
        <header className="bg-green-700 text-white pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-xl z-10 border-b-4 border-white">
             {/* Decorative Pitch Lines */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-full border-[3px] border-white/20 rounded-[50%] -mt-32 pointer-events-none"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[3px] border-white/10 rounded-full pointer-events-none"></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-green-800/50 w-fit px-3 py-1 rounded-full border border-green-500/30 backdrop-blur-sm">
                         <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.8)]"></span>
                         <p className="text-green-100 text-[10px] uppercase font-black tracking-widest font-kanit">Live Match Day</p>
                     </div>
                     <h1 className="text-3xl font-black tracking-tighter leading-none italic drop-shadow-md">
                         {brand?.name || "KICK OFF..."}
                     </h1>
                 </div>
                 <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center border-2 border-white/30 shadow-lg backdrop-blur-sm transform rotate-3">
                     <Icon name="basket" className="text-white w-8 h-8 drop-shadow-sm" />
                 </div>
             </div>
        </header>
        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-kick-in">
                    {/* Hero Banner (Scoreboard Style) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-52 bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl mb-8 border-[6px] border-slate-800 ring-2 ring-slate-200">
                            <div className="h-full opacity-90">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute top-4 right-4 py-1 px-3 bg-red-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg transform skew-x-[-10deg]">
                                <span className="block skew-x-[10deg]">Hot Deal</span>
                            </div>
                            {/* Scanlines effect */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] z-[5] bg-[length:100%_2px] pointer-events-none"></div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-1">
                         <div className="border-l-4 border-green-600 pl-3">
                             <h2 className="text-2xl font-black text-slate-800 italic uppercase">Highlights</h2>
                             <p className="text-xs text-slate-500 font-medium">Top Scorers</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="text-green-700 text-sm font-bold flex items-center gap-1 hover:underline decoration-2 underline-offset-4 font-kanit italic uppercase">
                             VIEW ALL <Icon name="search" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card bg-white rounded-lg shadow-sm cursor-pointer group">
                                     <div className="w-full h-32 overflow-hidden relative">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded skew-x-[-10deg] border border-yellow-500 shadow-sm">
                                                ON SALE
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-3">
                                         <h3 className="font-black text-slate-800 text-sm line-clamp-2 mb-1 leading-tight uppercase sport-font h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-slate-400 line-through decoration-red-500 decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-green-700 font-black text-lg sport-font leading-none italic">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-7 h-7 bg-slate-900 text-white flex items-center justify-center rounded hover:bg-green-600 transition-all shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
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
                <section className="animate-kick-in pt-4">
                    <div className="relative mb-6 group mt-4">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                             <Icon name="search" className="text-green-600" />
                         </div>
                         <input type="text" placeholder="Scout for food..." className="w-full pl-12 pr-6 py-4 rounded-xl bg-white border-2 border-slate-200 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm font-bold placeholder:text-slate-300 font-kanit" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-2 rounded-lg border text-sm font-black uppercase tracking-wide flex items-center gap-2 ${selectedCategoryId === c.id ? 'tab-active' : 'bg-white border-slate-200 text-slate-500'}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-24">
                        {filteredProducts?.map((p: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card bg-white rounded-lg shadow-sm cursor-pointer group">
                                     <div className="w-full h-32 overflow-hidden relative">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                     </div>
                                     <div className="p-3">
                                         <h3 className="font-black text-slate-800 text-sm line-clamp-2 mb-1 leading-tight uppercase sport-font h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-slate-400 line-through decoration-red-500 decoration-2 font-bold">{pricing.original}</span>}
                                                 <span className="text-green-700 font-black text-lg sport-font leading-none italic">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-7 h-7 bg-slate-900 text-white flex items-center justify-center rounded hover:bg-green-600 transition-all shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
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
                <section className="animate-kick-in pt-8 pb-24">
                    {/* Header: Scoreboard */}
                    <div className="mb-8 flex items-center gap-4 bg-slate-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black italic text-yellow-400 sport-font">MATCH STATS</h2>
                             <p className="text-xs text-slate-300 mt-1 font-medium">Live Order Updates</p>
                         </div>
                         <div className="w-16 h-16 border-4 border-green-500 rounded-full flex items-center justify-center animate-pulse ml-auto">
                             <Icon name="stats" size={32} className="text-white" />
                         </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-white p-5 border-l-8 border-green-600 rounded shadow-md relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-slate-500 font-black uppercase tracking-widest flex items-center gap-1 font-bold sport-font">
                                         <Icon name="menu" size={12} /> TICKET #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wide border flex items-center gap-1.5 sport-font shadow-sm rounded
                                         ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                         {o.status === 'pending' ? '1st HALF' : 'FULL TIME'}
                                     </span>
                                </div>
                                <div className="mb-3 space-y-1 bg-slate-50 p-4 border border-slate-200 rounded">
                                    {o.order_items.map((i: any, idx: any) => {
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        return (
                                            <div key={idx} className="flex justify-between items-start text-sm text-slate-800 font-bold mb-2 border-b border-dashed border-slate-300 pb-2 last:border-0 sport-font">
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-sm uppercase">{quantity}x {i.product_name}</span>
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[9px] bg-slate-800 text-white px-1.5 py-0.5 rounded-sm font-black mt-1 uppercase tracking-wider`}>
                                                            {i.variant}
                                                        </span>
                                                    )}
                                                    {i.note && <span className="text-[10px] text-green-600 italic mt-0.5">Note: {i.note}</span>}
                                                </div>
                                                <span className="text-slate-900 font-black">{finalPriceTotal}.-</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900">
                                     <span className="font-bold text-slate-400 text-xs uppercase tracking-widest">TOTAL SCORE</span>
                                     <span className="font-black text-green-700 text-2xl sport-font italic">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>

        {/* --- FLOATING NAV (Tactic Board) --- */}
        <nav className="fixed bottom-0 left-0 w-full h-[88px] bg-slate-900 text-slate-400 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex justify-around items-start pt-4 px-2 z-[100] rounded-t-[2rem]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'text-white' : ''}`}>
                 <div className={`p-1.5 rounded-full transition-all duration-300 ${activeTab === 'home' ? 'bg-green-600 text-white' : ''}`}>
                     <Icon name="home" size={24} />
                 </div>
                 <span className={`text-[9px] font-black uppercase tracking-wider sport-font ${activeTab === 'home' ? 'text-white' : ''}`}>Home</span>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'text-white' : ''}`}>
                 <div className={`p-1.5 rounded-full transition-all duration-300 ${activeTab === 'menu' ? 'bg-green-600 text-white' : ''}`}>
                     <Icon name="menu" size={24} />
                 </div>
                 <span className={`text-[9px] font-black uppercase tracking-wider sport-font ${activeTab === 'menu' ? 'text-white' : ''}`}>Menu</span>
             </button>

             {/* Center Cart Button */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-18 h-18 bg-white rounded-full shadow-[0_0_0_8px_#0f172a] flex items-center justify-center text-slate-900 border-4 border-green-500 active:scale-90 transition-all duration-300 z-20 overflow-hidden group">
                     {/* Pattern on button */}
                     <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                     <Icon name="basket" size={28} className="group-hover:scale-110 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-2 right-3 bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center border border-white font-bold animate-pulse shadow-sm">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'text-white' : ''}`}>
                 <div className={`p-1.5 rounded-full transition-all duration-300 ${activeTab === 'status' ? 'bg-green-600 text-white' : ''}`}>
                     <Icon name="stats" size={24} />
                 </div>
                 <span className={`text-[9px] font-black uppercase tracking-wider sport-font ${activeTab === 'status' ? 'text-white' : ''}`}>Status</span>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Locker Room) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/80 backdrop-blur-sm animate-kick-in">
                <div className="w-full max-w-md bg-slate-50 rounded-t-[2rem] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl border-t-8 border-green-600">
                    <div className="relative">
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-slate-300 rounded-full z-30 opacity-50"></div>
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/30 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/50 transition-colors">
                            <Icon name="x" size={20} />
                        </button>
                        <div className="relative w-full h-72 rounded-b-[2rem] overflow-hidden shadow-md bg-slate-200">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end p-8">
                                <span className="text-yellow-400 font-black text-4xl italic drop-shadow-md sport-font">{currentPriceObj.final}.-</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pt-6 pb-24">
                        <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight italic sport-font uppercase">{selectedProduct.name}</h2>
                        
                        <div className="space-y-4">
                            {/* --- 🏷️ VARIANT SELECTOR --- */}
                            <div className="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 shadow-sm jersey-pattern">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-yellow-400 text-yellow-900 rounded flex items-center justify-center transform -rotate-3 shadow-sm">
                                        <Icon name="star" size={12} />
                                    </div>
                                    <span className="font-bold text-slate-700 text-sm tracking-wide uppercase sport-font">Special Request?</span>
                                </div>
                                {/* Simplified variant toggle for now as per previous logic structure, effectively just a visual toggle for 'special' logic if implemented, or just the Size selector below */}
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-900 mb-2 sport-font uppercase tracking-wider">SELECT KIT:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'ROOKIE', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'PRO', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'LEGEND', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded border-b-4 transition-all flex flex-col items-center justify-between h-20 sport-font
                                                ${variant === v.key 
                                                    ? `bg-green-600 border-green-800 text-white transform translate-y-[1px] border-b-0` 
                                                    : 'bg-white border-slate-200 text-slate-400 hover:border-green-300'}`}
                                        >
                                            <span className="text-[10px] font-black tracking-widest">{v.label}</span>
                                            <span className="text-lg font-bold">{v.final}.-</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Tactical notes (e.g., No spicy)..." 
                                    className="w-full pl-4 pr-5 py-4 bg-white rounded-xl border-2 border-slate-100 focus:border-green-500 focus:ring-0 h-24 resize-none text-sm font-medium placeholder:text-slate-300 transition-colors font-kanit"
                                />
                            </div>
                            
                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 border-t border-dashed border-slate-300 mt-4">
                                <div className="flex items-center gap-2 bg-slate-200 p-1.5 rounded-full">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 rounded-full bg-white text-slate-600 flex items-center justify-center shadow-sm hover:bg-slate-50"><Icon name="minus" size={12} /></button>
                                    <span className="text-xl font-black w-12 text-center bg-transparent border-none text-slate-800 sport-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shadow-md hover:bg-green-700"><Icon name="plus" size={12} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Score</p>
                                    <p className="text-3xl font-black text-green-700 italic sport-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <button onClick={() => handleAdd(true)} className="py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-black text-sm uppercase tracking-wide active:scale-95 transition-all shadow-sm sport-font">
                                Add to Bench
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 rounded-xl btn-pitch text-white font-black text-sm uppercase tracking-wide shadow-lg shadow-green-200 active:scale-95 transition-all sport-font flex items-center justify-center gap-2">
                                Shoot & Order <Icon name="flame" size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (Locker Room) --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/80 backdrop-blur-sm animate-kick-in">
                 <div className="w-full max-w-md bg-slate-50 rounded-t-[2rem] border-t-4 border-yellow-400 flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.5)] h-[85vh]">
                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-14 h-1.5 bg-slate-300 rounded-full mx-auto" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-6 pt-4">
                         <h2 className="text-3xl font-black text-slate-900 italic sport-font uppercase">Kit Bag</h2>
                         <div className="w-10 h-10 bg-black text-white rounded flex items-center justify-center border-2 border-yellow-400 shadow-sm">
                             <span className="font-black text-lg sport-font">{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item: any, idx: any) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-l-4 border-green-600 rounded shadow-sm relative overflow-hidden">
                                 <img src={item.image_url} className="w-16 h-16 object-cover border border-slate-200 rounded" />
                                 <div className="flex-1">
                                     <div className="font-black text-slate-900 text-base leading-tight uppercase sport-font">
                                         {item.name} <span className="text-green-600">x{item.quantity}</span>
                                     </div>
                                     <div className="text-xs text-slate-500 mt-1 font-bold">
                                         {item.variant !== 'normal' && <span className="text-white bg-slate-900 px-1 rounded uppercase mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-green-700 italic mt-1">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-slate-900 text-lg sport-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-8 h-8 bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 border border-red-100 rounded transition-colors active:scale-90">
                                     <Icon name="trash" size={14} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-slate-400 font-bold sport-font text-lg">BENCH IS EMPTY</div>
                         )}
                     </div>

                     <div className="p-6 bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-30 border-t border-slate-100">
                         <div className="flex justify-between items-center mb-6 border-b-2 border-dashed border-slate-100 pb-6">
                             <div>
                                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Net Payable</p>
                                 <p className="text-4xl font-black text-green-700 italic sport-font">{cartTotal}.-</p>
                             </div>
                             <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center text-slate-400 border border-slate-200">
                                 <Icon name="check" size={24} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 rounded-xl btn-pitch text-white font-black text-xl active:scale-95 transition-all uppercase italic sport-font flex items-center justify-center gap-3">
                             <span>Final Whistle</span> <Icon name="chef" size={20} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-slate-900/90 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-kick-in">
                <div className="w-full max-w-sm bg-white rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden border-t-8 border-yellow-400">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white">
                        <Icon name="chef" size={40} className="transform -rotate-12" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight italic sport-font uppercase">Substitution?</h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-bold sport-font">Add {selectedProduct.name} to the match squad?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-green-600 text-white rounded-xl font-black shadow-lg active:scale-95 transition-all uppercase tracking-wider text-sm sport-font border-b-4 border-green-800 hover:border-b-0 hover:translate-y-1">YES, SUB IN!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-2 border-slate-200 text-slate-400 rounded-xl font-black text-xs active:scale-95 transition-transform uppercase tracking-wider hover:bg-slate-50 sport-font">WARM UP ONLY</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight italic sport-font uppercase">Extra Time?</h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-bold sport-font">Ready to blow the whistle on these orders?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-green-600 text-white rounded-xl font-black shadow-lg active:scale-95 transition-all uppercase tracking-wider text-sm sport-font border-b-4 border-green-800 hover:border-b-0 hover:translate-y-1">GOAL! ORDER NOW</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-2 border-slate-200 text-slate-400 rounded-xl font-black text-xs active:scale-95 transition-transform uppercase tracking-wider hover:bg-slate-50 sport-font">VAR CHECK (CANCEL)</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}