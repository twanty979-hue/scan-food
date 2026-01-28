import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Adventure Time / Ooo Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Tree Fort
    home: <path d="M2 22 12 2l10 20H2zM12 6v4M10 14h4" />, 
    // Menu -> Enchiridion / Book
    menu: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="3" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Green Backpack
    basket: <path d="M5 8h14l-2 13H7L5 8zm7-6v6" />,
    // Clock -> BMO Face
    clock: <rect x="2" y="4" width="20" height="16" rx="4" />,
    // Chef -> Finn's Hat
    chef: <path d="M3 20l9-16 9 16H3z M12 4l6 4" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Fire Kingdom
    flame: <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />, 
    
    // Specifics
    sword: <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />,
    jake: <circle cx="12" cy="12" r="10" strokeWidth="4" />, // Simplified Jake face
    crown: <path d="M2 20h20V8l-5 4-5-8-5 8-5-4z" /> // Ice King Crown
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
      {name === 'clock' && <circle cx="12" cy="12" r="3" />}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#ecfeff] flex items-center justify-center text-[#3b82f6] font-black text-2xl animate-jake">MATHEMATICAL!</div>;

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
    // Theme: Adventure Time - Land of Ooo System
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#1e3a8a]">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Itim&family=Mali:wght@400;600;700&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --finn-blue: #3b82f6; 
                --jake-yellow: #facc15;
                --pb-pink: #f472b6;
                --bmo-teal: #2dd4bf;
                --marcy-red: #ef4444;
                --grass-green: #4ade80;
                --bg-ooo: #ecfeff;
                --text-ooo: #1e3a8a;
            }

            body {
                font-family: 'Itim', 'Sarabun', sans-serif;
                background-color: var(--bg-ooo);
                /* Cloud & Sword Pattern */
                background-image: 
                    radial-gradient(circle at 10% 20%, white 10%, transparent 11%),
                    radial-gradient(circle at 80% 80%, white 15%, transparent 16%);
                background-size: 200px 200px;
                background-attachment: fixed;
                color: var(--text-ooo);
            }

            .ooo-font {
                font-family: 'Itim', cursive;
                text-transform: uppercase;
            }

            @keyframes jake-stretch {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1) skewX(-2deg); }
            }
            .animate-jake { animation: jake-stretch 3s infinite ease-in-out; }

            /* Image Pop Animation */
            @keyframes pop-image {
                0% { opacity: 0; transform: scale(0.8) translateY(10px); }
                60% { opacity: 1; transform: scale(1.05); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-image-pop { animation: pop-image 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }

            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.8s ease-out; }

            .item-card {
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                background: white;
                border-radius: 2rem;
                border: 4px solid #fff;
                box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.2);
                overflow: hidden;
            }
            .item-card:hover, .item-card:active {
                transform: translateY(-8px) rotate(1deg);
                border-color: var(--jake-yellow);
                box-shadow: 0 20px 30px -10px rgba(250, 204, 21, 0.4);
            }

            .btn-algebraic {
                background: linear-gradient(135deg, var(--finn-blue) 0%, #1d4ed8 100%);
                color: white;
                border-radius: 1.5rem;
                font-weight: 700;
                box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
                transition: all 0.2s;
                border: 2px solid white;
            }
            .btn-algebraic:active { transform: scale(0.95); box-shadow: 0 2px 8px rgba(59, 130, 246, 0.6); }

            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: var(--finn-blue);
                border: 1px solid #bfdbfe;
                border-radius: 1.2rem;
                font-weight: 800;
            }
            .tab-btn.active {
                background: var(--jake-yellow) !important;
                color: #78350f !important;
                border: 3px solid white;
                box-shadow: 0 8px 15px rgba(250, 204, 21, 0.3);
                transform: scale(1.05);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (Candy Kingdom HUD) --- */}
        <header className="bg-gradient-to-b from-[#3b82f6] to-[#60a5fa] text-white pt-10 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-xl border-b-4 border-[#facc15]">
             {/* Cloud overlay */}
             <div className="absolute top-4 right-10 text-white/40 text-6xl animate-pulse">
                <Icon name="cloud" size={48} />
             </div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#facc15] w-fit px-4 py-1.5 rounded-full border border-white transform -rotate-1 shadow-md">
                         <span className="w-3 h-3 rounded-full bg-[#ef4444] animate-bounce border border-white"></span>
                         <p className="text-[#78350f] text-[10px] font-bold tracking-widest uppercase ooo-font">Candy Kingdom: {tableLabel}</p>
                     </div>
                     <h1 className="text-4xl ooo-font font-black tracking-tighter leading-none mt-2 text-white drop-shadow-[0_4px_0_#1e3a8a]">
                         {brand?.name || "Ooo's Best Eats"}
                     </h1>
                 </div>
                 {/* Finn Badge */}
                 <div className="w-20 h-20 bg-white rounded-full border-4 border-[#2dd4bf] flex items-center justify-center relative shadow-lg animate-jake">
                     <Icon name="chef" size={40} className="text-[#3b82f6]" />
                     <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#facc15] rounded-full border border-white flex items-center justify-center text-[#78350f] text-[10px]">
                        <Icon name="sword" size={14} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade-in">
                    {/* Hero Banner (Full Color) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[2rem] overflow-hidden shadow-2xl mb-10 border-4 border-[#facc15] p-2 group animate-image-pop">
                             <div className="h-full w-full rounded-[1.5rem] overflow-hidden bg-[#ecfeff] relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                 />
                             </div>
                             <div className="absolute bottom-4 left-6 bg-[#ef4444] text-white px-5 py-2 rounded-full border-2 border-white shadow-lg transform rotate-2">
                                 <span className="ooo-font text-xs font-bold uppercase tracking-widest">Mathematical!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2 animate-image-pop">
                         <div>
                             <h2 className="text-3xl ooo-font text-[#3b82f6] drop-shadow-sm">Yummy Stuff</h2>
                             <p className="text-xs text-[#f472b6] font-bold uppercase tracking-widest ml-1">Totally Rhombus!</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-white text-[#3b82f6] px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 hover:bg-[#ecfeff] transition-all border-2 border-[#2dd4bf] shadow-md active:scale-95">
                             ADVENTURE TIME <Icon name="menu" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="absolute top-2 right-2 w-8 h-8 bg-[#facc15] rounded-full z-10 opacity-50 blur-xl"></div>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#f0f9ff] border-b-2 border-[#bfdbfe]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-2 left-2 bg-[#ef4444] text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white shadow-sm ooo-font">
                                                 WOAH!
                                             </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#1e3a8a] text-sm line-clamp-2 mb-1 leading-tight ooo-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-[#2dd4bf] line-through font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#3b82f6] font-black text-xl ooo-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#facc15] text-[#78350f] border-2 border-white flex items-center justify-center rounded-full hover:bg-[#fbbf24] transition-all shadow-md active:scale-90">
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
                    <div className="relative mb-8 group animate-image-pop">
                         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#2dd4bf]" />
                         </div>
                         <input type="text" placeholder="Quest for snacks?..." className="w-full pl-16 pr-8 py-5 rounded-full bg-white border-4 border-[#ecfeff] text-[#1e3a8a] placeholder:text-[#2dd4bf] focus:outline-none focus:border-[#3b82f6] focus:ring-4 focus:ring-[#bfdbfe] transition-all text-lg font-bold" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1 animate-image-pop">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-lg font-bold ooo-font ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#f0f9ff] border-b-2 border-[#bfdbfe]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#1e3a8a] text-sm line-clamp-2 mb-1 leading-tight ooo-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-[#2dd4bf] line-through font-bold">{pricing.original}</span>}
                                                 <span className="text-[#3b82f6] font-black text-xl ooo-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#facc15] text-[#78350f] border-2 border-white flex items-center justify-center rounded-full hover:bg-[#fbbf24] transition-all shadow-md active:scale-90">
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

            {/* --- STATUS PAGE (Adventure Time Theme - FIXED LOGIC) --- */}
            {activeTab === 'status' && (
                <section className="animate-fade-in pt-4 pb-24">
                    <div className="mb-8 flex items-center justify-between bg-white p-8 border-4 border-[#3b82f6] rounded-[3rem] shadow-xl relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-20 rotate-12 text-[#facc15] animate-jake">
                            <Icon name="jake" size={100} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black ooo-font text-[#3b82f6]">BMO Log</h2>
                             <p className="text-sm text-[#f472b6] font-bold mt-1 uppercase tracking-widest">Cooking up magic...</p>
                         </div>
                         <div className="w-16 h-16 bg-[#2dd4bf] border-4 border-[#1e3a8a] rounded-xl flex items-center justify-center animate-bounce shadow-md text-[#1e3a8a]">
                             <Icon name="clock" size={32} />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-white p-6 border-2 border-[#2dd4bf] rounded-[2.5rem] shadow-sm relative overflow-hidden">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-[#3b82f6] font-bold uppercase tracking-widest flex items-center gap-1">
                                         <Icon name="scroll" size={14} /> Quest #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-wide border rounded-full flex items-center gap-1.5 shadow-sm
                                        ${o.status === 'pending' ? 'bg-[#fef9c3] text-[#b45309] border-[#fde047]' : 'bg-[#dcfce7] text-[#15803D] border-[#22c55e]'}`}>
                                        {o.status === 'pending' ? 'ADVENTURING...' : 'COMPLETE!'}
                                     </span>
                                </div>

                                {/* Items */}
                                <div className="mb-4 space-y-2 bg-[#ecfeff] p-5 rounded-2xl border border-[#cffafe]">
                                    {o.order_items.map((i: any, idx: any) => {
                                        // ✅ FIXED LOGIC FOR STATUS PAGE
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        const hasDiscount = (i.original_price && i.original_price > i.price) || (i.discount > 0);
                                        const originalPriceTotal = hasDiscount 
                                            ? (i.original_price ? i.original_price * i.quantity : (i.price + (i.discount || 0)) * i.quantity) 
                                            : finalPriceTotal;
                                        const discountAmount = originalPriceTotal - finalPriceTotal;

                                        return (
                                            <div key={idx} className="flex justify-between items-start text-sm text-[#1e3a8a] font-bold border-b border-dashed border-[#a5f3fc] pb-2 last:border-0 ooo-font">
                                                
                                                {/* Left Info */}
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-base">{quantity}x {i.product_name}</span>
                                                    
                                                    {/* Variant Badge (Ooo Style) */}
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] bg-[#facc15] text-[#78350f] px-2 py-0.5 rounded-full border border-[#f59e0b] font-sans font-bold mt-1 uppercase tracking-wider transform -rotate-1`}>
                                                            {i.variant === 'special' ? '⚔️ HERO' : i.variant === 'jumbo' ? '👑 KING' : i.variant}
                                                        </span>
                                                    )}

                                                    {/* Note */}
                                                    {i.note && <span className="text-[10px] text-[#f472b6] italic mt-0.5">Note: {i.note}</span>}
                                                </div>

                                                {/* Right Price */}
                                                <div className="text-right flex flex-col items-end min-w-[80px]">
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className="text-[10px] text-white bg-[#ef4444] px-1.5 py-0.5 rounded-full font-sans font-bold mb-1 shadow-sm border border-white transform rotate-2">
                                                                SAVE -{discountAmount}
                                                            </span>
                                                            <span className="text-xs text-[#2dd4bf] line-through decoration-[#3b82f6] decoration-2 sans-serif opacity-80 mb-0.5 font-bold">
                                                                {originalPriceTotal}
                                                            </span>
                                                            <span className="text-[#3b82f6] text-lg leading-none">
                                                                {finalPriceTotal}.-
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[#3b82f6] text-lg">{finalPriceTotal}.-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                     <span className="font-bold text-[#2dd4bf] text-xs uppercase tracking-widest">TREASURE</span>
                                     <span className="font-black text-[#1e3a8a] text-3xl ooo-font">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-20 text-[#2dd4bf] font-bold text-2xl ooo-font opacity-50">
                                BMO is empty...
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Jake Capsule) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[85px] bg-white/95 backdrop-blur-md shadow-2xl flex justify-around items-center px-4 z-[100] rounded-[3rem] border-4 border-[#facc15]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#fef9c3]' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-[#3b82f6]' : 'text-[#facc15]'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#fef9c3]' : ''}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-[#3b82f6]' : 'text-[#facc15]'}`} />
                 </div>
             </button>

             {/* Big Cart Button (Finn's Backpack) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#4ade80] rounded-full shadow-lg flex items-center justify-center text-white border-4 border-white active:scale-90 transition-all duration-100 z-20 group hover:bg-[#22c55e] animate-jake">
                     <Icon name="basket" size={32} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#ef4444] text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#fef9c3]' : ''}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-[#3b82f6]' : 'text-[#facc15]'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Treehouse Panel - FIXED 3 PRICES) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#1e3a8a]/60 backdrop-blur-md animate-fade-in">
                <div className="w-full max-w-md bg-white border-t-8 border-[#3b82f6] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[4rem] relative animate-image-pop">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-[#3b82f6] rounded-full border-2 border-[#bfdbfe] flex items-center justify-center hover:bg-[#ecfeff] transition-colors shadow-md active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-85 overflow-hidden border-b-4 border-[#ecfeff] rounded-b-[3.5rem] bg-[#ecfeff]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-[#facc15] text-[#78350f] font-black text-3xl ooo-font rounded-full border-4 border-white shadow-xl transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-[#b45309] decoration-white decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32 relative">
                        <h2 className="text-4xl ooo-font text-[#1e3a8a] mb-6 leading-tight drop-shadow-sm uppercase tracking-wider">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            
                            {/* ✅ FIXED: 3 Variants Grid (HUMAN/DOG/LUMP) */}
                            <div>
                                <label className="block text-lg font-bold text-[#3b82f6] mb-3 ooo-font ml-1 tracking-wide">WHAT TIME IS IT?</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'HUMAN', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'DOG', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'LUMP', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center justify-between h-24 ooo-font
                                                ${variant === v.key 
                                                    ? 'bg-[#ecfeff] border-[#3b82f6] shadow-[3px_3px_0_#1d4ed8] -translate-y-1 text-[#1e3a8a]' 
                                                    : 'bg-white border-[#bfdbfe] text-[#93c5fd] hover:border-[#60a5fa] hover:text-[#3b82f6]'}`}
                                        >
                                            <span className="text-[10px] font-black tracking-widest uppercase">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[9px] line-through decoration-[#ef4444] decoration-2 opacity-70 mb-1">{v.original}</span>
                                                )}
                                                <span className="text-lg font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-4 bg-white p-3 rounded-full border-4 border-[#2dd4bf] shadow-md">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-[#ecfeff] text-[#3b82f6] rounded-full flex items-center justify-center hover:bg-[#cffafe] active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-[#1e3a8a] ooo-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#3b82f6] text-white rounded-full flex items-center justify-center hover:bg-[#2563eb] active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-[#2dd4bf] font-black uppercase tracking-widest mb-1">Gems</p>
                                    <p className="text-4xl font-black text-[#3b82f6] ooo-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Write a message for Jake..." 
                                    className="w-full p-6 bg-[#f0f9ff] border-4 border-white rounded-[2.5rem] focus:border-[#facc15] focus:outline-none h-36 resize-none text-xl font-bold text-[#1e3a8a] placeholder:text-[#93c5fd] transition-colors shadow-inner ooo-font"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-white border-4 border-[#bfdbfe] text-[#3b82f6] font-black text-xl rounded-full active:scale-95 transition-all shadow-md ooo-font">
                                Stash It
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-algebraic text-2xl active:scale-95 transition-all flex items-center justify-center gap-2 ooo-font tracking-widest">
                                SLAMACOW! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (Backpack) --- */}
        {activeTab === 'cart' && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#1e3a8a]/60 backdrop-blur-sm animate-fade-in duration-300">
                <div className="w-full max-w-md bg-white border-t-[10px] border-[#3b82f6] flex flex-col shadow-[0_-20px_60px_rgba(59,130,246,0.3)] h-[85vh] rounded-t-[4rem] animate-in slide-in-from-bottom duration-300">
                    <div className="w-full py-6 cursor-pointer rounded-t-[4rem] hover:bg-gray-50" onClick={() => setActiveTab('menu')}>
                        <div className="w-20 h-2 bg-[#bfdbfe] rounded-full mx-auto" />
                    </div>

                    <div className="flex justify-between items-center mb-6 px-10 pt-4">
                        <h2 className="text-4xl font-black text-[#1e3a8a] ooo-font transform -rotate-2">Loot Bag</h2>
                        <div className="w-14 h-14 bg-[#dcfce7] text-[#15803d] border-4 border-white rounded-2xl flex items-center justify-center font-black text-2xl ooo-font shadow-lg">
                            <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 px-8 pb-6 no-scrollbar">
                        {cart.map((item: any, idx: any) => (
                            <div key={idx} className="flex items-center gap-4 bg-[#f0f9ff] p-4 border-2 border-white rounded-[2rem] relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <img src={item.image_url} className="w-16 h-16 object-cover border-2 border-white rounded-2xl ml-2" />
                                <div className="flex-1">
                                    <div className="font-bold text-[#1e3a8a] text-lg leading-tight ooo-font tracking-wide">
                                        {item.name} <span className="text-[#3b82f6] text-sm">x{item.quantity}</span>
                                    </div>
                                    <div className="text-xs text-[#f97316] mt-1 font-bold">
                                        {item.variant !== 'normal' && <span className="bg-white px-2 py-0.5 rounded-full mr-2 shadow-sm">{item.variant}</span>}
                                        {item.note && <span className="block text-[#f472b6] italic mt-1 font-normal">"{item.note}"</span>}
                                    </div>
                                </div>
                                <div className="font-black text-[#3b82f6] text-xl ooo-font">{item.price * item.quantity}.-</div>
                                <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#fef2f2] hover:bg-[#fee2e2] flex items-center justify-center text-[#ef4444] border-2 border-white rounded-full transition-colors active:scale-90 shadow-sm">
                                    <Icon name="trash" size={16} />
                                </button>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="text-center py-20 text-[#bfdbfe] font-bold ooo-font text-xl">Bag is empty, dude...</div>
                        )}
                    </div>

                    <div className="p-8 bg-[#ecfeff] border-t-4 border-white relative z-30 rounded-t-[3rem]">
                        <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-white">
                            <div>
                                <p className="text-xs text-[#2dd4bf] font-black uppercase tracking-widest">Total Loot</p>
                                <p className="text-5xl font-black text-[#1e3a8a] ooo-font">{cartTotal}.-</p>
                            </div>
                            <div className="w-16 h-16 bg-white border-4 border-[#cffafe] rounded-full flex items-center justify-center text-[#facc15] transform rotate-6 shadow-sm">
                                <Icon name="basket" size={32} />
                            </div>
                        </div>
                        <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-algebraic text-2xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest ooo-font">
                            <span>ALGEBRAIC!</span> <Icon name="check" size={28} strokeWidth={4} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#1e3a8a]/95 z-[250] flex items-center justify-center p-8 backdrop-blur-md animate-pop-up" style={{animationDelay: '0s'}}>
                <div className="w-full max-w-sm bg-white border-8 border-[#2dd4bf] p-10 text-center shadow-2xl relative overflow-hidden rounded-[3rem]">
                    <div className="w-28 h-28 bg-[#ecfeff] text-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-lg relative z-10 animate-jake">
                        <Icon name="chef" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-3xl ooo-font text-[#1e3a8a] mb-4 leading-tight relative z-10 uppercase tracking-widest">In the Bag?</h3>
                            <p className="text-lg text-[#3b82f6] mb-10 font-bold ooo-font relative z-10">Add "{selectedProduct.name}" and go?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-[#3b82f6] text-white font-black border-4 border-white shadow-xl active:scale-95 transition-all text-xl ooo-font uppercase tracking-widest rounded-2xl">YES! ADVENTURE!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-white border-4 border-[#bfdbfe] text-[#1e3a8a] font-black text-lg active:scale-95 transition-transform hover:bg-[#ecfeff] ooo-font rounded-full uppercase">Just Stash</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl ooo-font text-[#1e3a8a] mb-4 leading-tight relative z-10 uppercase tracking-widest">Start Quest?</h3>
                            <p className="text-lg text-[#3b82f6] mb-10 font-bold ooo-font relative z-10">Eat all the loot in your bag?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-5 bg-[#3b82f6] text-white font-black border-4 border-white shadow-xl active:scale-95 transition-all text-xl ooo-font uppercase tracking-widest rounded-2xl">YES! LET'S GO!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white border-4 border-[#bfdbfe] text-[#1e3a8a] font-black text-lg active:scale-95 transition-transform hover:bg-[#ecfeff] ooo-font rounded-full uppercase">Wait!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}