import React, { useState, useEffect, useRef } from "react";

// --- 🏀 Court Side Icons Wrapper ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Court / Stadium
    home: <path d="M2 22 L12 2 L22 22 L18 22 L18 14 L6 14 L6 22 Z M10 14 L10 10 L14 10 L14 14" />, 
    // Menu -> Tactics Board / Grid
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Basketball Hoop / Net
    basket: <path d="M4 8l2 12h12l2-12H4zm4 0v12m4-12v12m4-12v12 M2 8h20" />,
    // Clock -> Shot Clock
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Whistle / Referee
    chef: <path d="M12 2a5 5 0 0 0-5 5v3h10V7a5 5 0 0 0-5-5z M8 16h8 M12 16v6" />, 
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6L6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Fast Break / Fire
    flame: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    // Stats -> Clipboard
    stats: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z M14 8V3l5 5h-5z" />
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
      {name === 'stats' && <path d="M9 13h6 M9 17h6 M9 9h2" opacity="0.5"/>}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#fff7ed]" />;

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
    // Theme: Court Side Eats (Basketball)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-slate-900 border-x-2 border-slate-300 bg-orange-50">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,300;0,400;0,600;0,800;1,600&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --primary: #ea580c; /* Orange 600 */
                --primary-light: #f97316;
                --primary-dark: #c2410c;
                --accent: #1e293b; /* Slate 900 */
                --bg: #fff7ed;
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg);
                /* Parquet Floor Pattern */
                background-image: 
                    linear-gradient(45deg, #ffedd5 25%, transparent 25%, transparent 75%, #ffedd5 75%, #ffedd5), 
                    linear-gradient(45deg, #ffedd5 25%, transparent 25%, transparent 75%, #ffedd5 75%, #ffedd5);
                background-position: 0 0, 20px 20px;
                background-size: 40px 40px;
                background-attachment: fixed;
            }

            .sport-font {
                font-family: 'Kanit', sans-serif;
                text-transform: uppercase;
                font-style: italic;
            }

            /* Animations */
            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); opacity: 1; }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); }
            }
            .animate-bounce-in { animation: bounceIn 0.6s cubic-bezier(0.215, 0.610, 0.355, 1.000) forwards; }

            .item-card {
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                border-bottom: 4px solid var(--accent);
            }
            .item-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; height: 4px;
                background: var(--primary);
                z-index: 10;
            }
            .item-card:active {
                transform: scale(0.95);
            }

            .btn-court {
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                border: 2px solid #000;
                box-shadow: 4px 4px 0px #000;
                color: white;
            }
            .btn-court:active {
                transform: translate(2px, 2px);
                box-shadow: 0px 0px 0px #000;
            }

            .tab-active {
                background: var(--accent) !important;
                color: white !important;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                border: 2px solid var(--primary);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            
            /* Basketball Court Texture */
            .court-texture {
                background-color: #fce7cf;
                background-image: repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(234, 88, 12, 0.1) 40px, rgba(234, 88, 12, 0.1) 42px);
            }
        `}</style>

        {/* --- Premium Header (Court Style) --- */}
        <header className="bg-slate-900 text-white pt-8 pb-20 px-6 rounded-b-[2rem] relative overflow-hidden shadow-2xl z-10 border-b-4 border-orange-500">
             {/* Court Lines Decoration */}
             <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[140%] h-[200%] border-[4px] border-orange-600/30 rounded-full pointer-events-none"></div>
             <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-full h-32 border-t-[4px] border-orange-600/30 pointer-events-none"></div>
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-600/20 rounded-t-full pointer-events-none border-t-[4px] border-x-[4px] border-orange-600/30"></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-orange-600 w-fit px-3 py-1 rounded skew-x-[-10deg] border border-black shadow-[2px_2px_0_#000]">
                         <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                         <p className="text-white text-[10px] uppercase font-black tracking-widest sport-font skew-x-[10deg]">Game Time</p>
                     </div>
                     <h1 className="text-3xl font-black tracking-tighter leading-none italic drop-shadow-[2px_2px_0_#ea580c] sport-font">
                         {brand?.name || "TIP OFF..."}
                     </h1>
                 </div>
                 <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center border-4 border-black shadow-lg">
                     <Icon name="basket" className="text-black w-8 h-8" />
                 </div>
             </div>
        </header>
        <main className="px-5 -mt-10 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-bounce-in">
                    {/* Hero Banner (Jumbotron Style) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-52 bg-slate-900 rounded-xl overflow-hidden shadow-[6px_6px_0_rgba(0,0,0,0.2)] mb-8 border-4 border-slate-900">
                            <div className="h-full opacity-90">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute top-4 right-4 py-1 px-3 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg border-2 border-white transform rotate-3 sport-font">
                                MVP PICKS
                            </div>
                            {/* Dot matrix effect */}
                            <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.3)_1px,transparent_1px)] bg-[size:4px_4px] pointer-events-none z-[5]"></div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-1">
                         <div className="border-l-8 border-orange-500 pl-3">
                             <h2 className="text-2xl font-black text-slate-900 italic uppercase sport-font">Starting Lineup</h2>
                             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Top Tier Grub</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors sport-font uppercase">
                             Full Roster <Icon name="search" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card bg-white rounded-lg cursor-pointer group">
                                     <div className="w-full h-32 overflow-hidden relative">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded skew-x-[-10deg] border border-black shadow-sm">
                                                ON SALE
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-3">
                                         <h3 className="font-black text-slate-800 text-sm line-clamp-2 mb-1 leading-tight uppercase sport-font h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-slate-400 line-through decoration-orange-500 decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-orange-600 font-black text-lg sport-font leading-none italic">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-7 h-7 bg-slate-900 text-white flex items-center justify-center rounded hover:bg-orange-600 transition-all shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
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
                    <div className="relative mb-6 group mt-4">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                             <Icon name="search" className="text-orange-600" />
                         </div>
                         <input type="text" placeholder="Scout for food..." className="w-full pl-12 pr-6 py-4 rounded-none bg-white border-2 border-black shadow-[4px_4px_0_#ea580c] focus:outline-none focus:shadow-[2px_2px_0_#ea580c] focus:translate-x-[2px] focus:translate-y-[2px] transition-all text-sm font-bold placeholder:text-slate-300 sport-font" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-2 rounded-full border-2 border-slate-200 text-slate-500 font-black text-sm uppercase tracking-wide flex items-center gap-2 ${selectedCategoryId === c.id ? 'tab-active' : 'bg-white'}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-24">
                        {filteredProducts?.map((p: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card bg-white rounded-lg cursor-pointer group">
                                     <div className="w-full h-32 overflow-hidden relative">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                     </div>
                                     <div className="p-3">
                                         <h3 className="font-black text-slate-800 text-sm line-clamp-2 mb-1 leading-tight uppercase sport-font h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-slate-400 line-through decoration-orange-500 decoration-2 font-bold">{pricing.original}</span>}
                                                 <span className="text-orange-600 font-black text-lg sport-font leading-none italic">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-7 h-7 bg-slate-900 text-white flex items-center justify-center rounded hover:bg-orange-600 transition-all shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
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
                <section className="animate-bounce-in pt-8 pb-24">
                    {/* Header: Scoreboard */}
                    <div className="mb-8 flex items-center justify-between bg-black p-6 rounded-none text-white shadow-[6px_6px_0_#ea580c] relative overflow-hidden border-2 border-white">
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black italic text-orange-500 sport-font">SCOREBOARD</h2>
                             <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-widest">Live Order Stats</p>
                         </div>
                         <div className="w-16 h-16 border-4 border-orange-500 rounded-full flex items-center justify-center animate-pulse">
                             <Icon name="clock" size={32} className="text-white" />
                         </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-white p-5 border-l-8 border-slate-900 rounded shadow-md relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-orange-600 font-black uppercase tracking-widest flex items-center gap-1 font-bold sport-font">
                                         <Icon name="stats" size={12} /> TICKET #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wide border flex items-center gap-1.5 sport-font shadow-sm rounded
                                         ${o.status === 'pending' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                         {o.status === 'pending' ? '1st QUARTER' : 'FINAL'}
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
                                                    {i.note && <span className="text-[10px] text-orange-600 italic mt-0.5">Coach: {i.note}</span>}
                                                </div>
                                                <span className="text-slate-900 font-black">{finalPriceTotal}.-</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900">
                                     <span className="font-bold text-slate-400 text-xs uppercase tracking-widest">TOTAL SCORE</span>
                                     <span className="font-black text-orange-600 text-2xl sport-font italic">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>

        {/* --- FLOATING NAV (Court Side) --- */}
        <nav className="fixed bottom-0 left-0 w-full h-[80px] bg-black text-slate-400 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex justify-around items-center px-2 z-[100] border-t-4 border-orange-600">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'text-orange-500' : ''}`}>
                 <Icon name="home" size={24} className="group-[.active]:animate-bounce" />
                 <span className={`text-[9px] font-black uppercase tracking-wider sport-font ${activeTab === 'home' ? 'text-white' : ''}`}>Home</span>
                 {activeTab === 'home' && <span className="w-1 h-1 rounded-full bg-orange-500"></span>}
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'text-orange-500' : ''}`}>
                 <Icon name="menu" size={24} />
                 <span className={`text-[9px] font-black uppercase tracking-wider sport-font ${activeTab === 'menu' ? 'text-white' : ''}`}>Menu</span>
                 {activeTab === 'menu' && <span className="w-1 h-1 rounded-full bg-orange-500"></span>}
             </button>

             {/* Center Cart Button */}
             <div className="relative w-20 h-20 flex items-center justify-center -mt-8">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-16 h-16 bg-orange-600 rounded-full shadow-[0_0_0_6px_#000] flex items-center justify-center text-white border-4 border-white active:scale-95 transition-all duration-300 z-20 group">
                     {/* Basketball lines pattern */}
                     <div className="absolute inset-0 border-r border-black/20 rounded-full pointer-events-none"></div>
                     <div className="absolute inset-0 border-l border-black/20 rounded-full pointer-events-none"></div>
                     
                     <Icon name="basket" size={28} className="drop-shadow-md" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-white text-black text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-black font-black animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'text-orange-500' : ''}`}>
                 <Icon name="stats" size={24} />
                 <span className={`text-[9px] font-black uppercase tracking-wider sport-font ${activeTab === 'status' ? 'text-white' : ''}`}>Stats</span>
                 {activeTab === 'status' && <span className="w-1 h-1 rounded-full bg-orange-500"></span>}
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Locker Room) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/90 backdrop-blur-sm animate-bounce-in">
                <div className="w-full max-w-md bg-slate-50 rounded-t-[2rem] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl border-t-8 border-orange-600">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-30 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors border-2 border-white shadow-lg">
                            <Icon name="x" size={20} />
                        </button>
                        <div className="relative w-full h-72 rounded-b-[2rem] overflow-hidden shadow-md bg-slate-200">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4 bg-black/80 px-4 py-2 rounded-lg border-l-4 border-orange-500 backdrop-blur-md">
                                {currentPriceObj.discount > 0 && (
                                    <span className="text-xs line-through text-slate-400 block -mb-1">{currentPriceObj.original}</span>
                                )}
                                <span className="text-orange-500 font-black text-2xl italic sport-font">{currentPriceObj.final}.-</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pt-6 pb-24 court-texture">
                        <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight italic sport-font uppercase">{selectedProduct.name}</h2>
                        
                        <div className="space-y-4">
                            {/* --- 🏷️ VARIANT SELECTOR --- */}
                            <div>
                                <label className="block text-sm font-black text-slate-900 mb-2 sport-font uppercase tracking-wider">ROSTER SPOT:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'ROOKIE', color: 'bg-white', text: 'text-slate-900', border: 'border-slate-300', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'ALL-STAR', color: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'MVP', color: 'bg-slate-900', text: 'text-white', border: 'border-black', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded border-2 transition-all flex flex-col items-center justify-between h-20 sport-font
                                                ${variant === v.key 
                                                    ? `bg-orange-600 border-black text-white shadow-[2px_2px_0_#000] -translate-y-1` 
                                                    : 'bg-white border-slate-200 text-slate-400 hover:border-orange-500'}`}
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
                                    placeholder="Coach notes (e.g., No veggies)..." 
                                    className="w-full p-4 bg-white rounded border-2 border-slate-200 focus:border-orange-500 focus:ring-0 h-24 resize-none text-sm font-bold placeholder:text-slate-300 transition-colors sport-font"
                                />
                            </div>
                            
                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 border-t-2 border-black mt-4">
                                <div className="flex items-center gap-2 bg-black p-1.5 rounded-full">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-slate-200 transition-colors"><Icon name="minus" size={12} /></button>
                                    <span className="text-xl font-black w-12 text-center bg-transparent border-none text-white sport-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center hover:bg-orange-500 transition-colors"><Icon name="plus" size={12} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Score</p>
                                    <p className="text-3xl font-black text-slate-900 italic sport-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <button onClick={() => handleAdd(true)} className="py-4 rounded bg-white border-2 border-black text-black font-black text-sm uppercase tracking-wide active:scale-95 transition-all shadow-[4px_4px_0_#000] sport-font hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000]">
                                Draft Pick
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 rounded btn-court font-black text-sm uppercase tracking-wide active:scale-95 transition-all sport-font flex items-center justify-center gap-2">
                                Slam Dunk <Icon name="basket" size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (Locker Room) --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/90 backdrop-blur-md animate-bounce-in">
                 <div className="w-full max-w-md bg-slate-50 rounded-t-[2rem] border-t-4 border-orange-500 flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.5)] h-[85vh]">
                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-14 h-1.5 bg-slate-300 rounded-full mx-auto" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-6 pt-4">
                         <h2 className="text-3xl font-black text-slate-900 italic sport-font uppercase">Locker Room</h2>
                         <div className="w-10 h-10 bg-black text-white rounded flex items-center justify-center border-2 border-orange-500 shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
                             <span className="font-black text-lg sport-font">{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item: any, idx: any) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-2 border-black rounded shadow-[4px_4px_0_rgba(0,0,0,0.1)] relative overflow-hidden">
                                 <img src={item.image_url} className="w-16 h-16 object-cover border border-slate-200 rounded" />
                                 <div className="flex-1">
                                     <div className="font-black text-slate-900 text-base leading-tight uppercase sport-font">
                                         {item.name} <span className="text-orange-600">x{item.quantity}</span>
                                     </div>
                                     <div className="text-xs text-slate-500 mt-1 font-bold">
                                         {item.variant !== 'normal' && <span className="text-white bg-slate-900 px-1 rounded uppercase mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-orange-600 italic mt-1">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-slate-900 text-lg sport-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-8 h-8 bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 border border-red-200 rounded transition-colors active:scale-90">
                                     <Icon name="trash" size={14} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-slate-400 font-bold sport-font text-lg">BENCH IS EMPTY</div>
                         )}
                     </div>

                     <div className="p-6 bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-30 border-t-2 border-black">
                         <div className="flex justify-between items-center mb-6 border-b-2 border-dashed border-slate-200 pb-6">
                             <div>
                                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Net Payable</p>
                                 <p className="text-4xl font-black text-orange-600 italic sport-font">{cartTotal}.-</p>
                             </div>
                             <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center text-slate-400 border border-slate-200">
                                 <Icon name="check" size={24} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 rounded btn-court font-black text-xl active:scale-95 transition-all uppercase italic sport-font flex items-center justify-center gap-3">
                             <span>Buzzer Beater</span> <Icon name="flame" size={20} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-bounce-in">
                <div className="w-full max-w-sm bg-white rounded border-4 border-black p-8 text-center shadow-[8px_8px_0_#ea580c] relative overflow-hidden">
                    <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-black">
                        <Icon name="basket" size={40} className="animate-bounce" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight italic sport-font uppercase">Fast Break?</h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-bold sport-font">Add {selectedProduct.name} to the roster?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-orange-600 text-white rounded font-black border-2 border-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#000] transition-all uppercase tracking-wider text-sm sport-font">YES, TEAM PLAY!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-2 border-slate-300 text-slate-400 rounded font-black text-xs active:scale-95 transition-transform uppercase tracking-wider hover:bg-slate-50 sport-font">BENCH WARMER</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight italic sport-font uppercase">Game Time!</h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-bold sport-font">Ready to execute the play?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-orange-600 text-white rounded font-black border-2 border-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#000] transition-all uppercase tracking-wider text-sm sport-font">GO FOR WIN!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-2 border-slate-300 text-slate-400 rounded font-black text-xs active:scale-95 transition-transform uppercase tracking-wider hover:bg-slate-50 sport-font">TIMEOUT (CANCEL)</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}