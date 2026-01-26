import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Peter Pan / Neverland Style) ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Treehouse
    home: <path d="M2 22 12 2l10 20H2zM12 6v4M10 14h4" />, 
    // Menu -> Treasure Map / Scroll
    menu: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Leaf Bundle
    basket: <path d="M2 12h20 M12 2v10 M12 12l-6 10 M12 12l6 10" />,
    // Clock -> Tic-Toc Croc (Clock face)
    clock: <circle cx="12" cy="12" r="10" strokeWidth="3" />,
    // Chef -> Peter's Hat with Feather
    chef: <path d="M3 20l9-16 9 16H3z M12 4l6 4" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Pixie Dust / Sparkles
    flame: <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />, 
    
    // Specifics
    feather: <path d="M19 13c-1.5-3-4-6-9-6s-6 2-5 6c2 1 5 3 9 3s5-1 5-3z M10 7v10" />,
    star: <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />,
    hook: <path d="M14 2v8a4 4 0 0 1-8 0" />, // Simplified hook
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
      {name === 'clock' && <path d="M12 6v6l3 3" />}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center text-[#14532d] font-black text-2xl animate-fly">FLYING TO NEVERLAND...</div>;

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
    // Theme: Peter Pan - Neverland System
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#14532d]">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Itim&family=Mali:wght@400;600;700&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --peter-green: #22c55e;
                --forest-deep: #14532d;
                --feather-red: #ef4444;
                --dust-gold: #facc15;
                --night-blue: #0f172a;
                --bg-neverland: #f0fdf4;
                --text-main: #14532d;
            }

            body {
                font-family: 'Itim', 'Sarabun', sans-serif;
                background-color: var(--bg-neverland);
                /* Starry Sky & Leaf Pattern */
                background-image: 
                    radial-gradient(circle at 10% 20%, rgba(250, 204, 21, 0.1) 2px, transparent 3px),
                    radial-gradient(circle at 80% 80%, rgba(250, 204, 21, 0.1) 2px, transparent 3px),
                    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M20 2L22 18L38 20L22 22L20 38L18 22L2 20L18 18L20 2Z' fill='%23facc15' fill-opacity='0.03'/%3E%3C/svg%3E");
                background-attachment: fixed;
                color: var(--text-main);
            }

            .adventure-font {
                font-family: 'Mali', cursive;
                font-weight: 700;
            }

            @keyframes fly-float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-15px) rotate(2deg); }
            }
            .animate-fly { animation: fly-float 4s infinite ease-in-out; }

            @keyframes sparkle {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
            }
            .animate-sparkle { animation: sparkle 2s infinite ease-in-out; }

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
                border-radius: 1.5rem;
                border: 3px solid #dcfce7;
                box-shadow: 0 10px 20px -5px rgba(20, 83, 45, 0.1);
                overflow: hidden;
            }
            .item-card:hover, .item-card:active {
                transform: translateY(-8px);
                border-color: var(--peter-green);
                box-shadow: 0 20px 30px -10px rgba(34, 197, 94, 0.3);
            }

            .card-feather {
                position: absolute;
                top: 10px; right: 10px;
                width: 25px; height: 25px;
                background: var(--feather-red);
                clip-path: polygon(0% 100%, 50% 0%, 100% 100%, 50% 80%);
                transform: rotate(15deg);
            }

            .btn-adventure {
                background: linear-gradient(135deg, var(--peter-green) 0%, var(--forest-deep) 100%);
                color: white;
                border-radius: 1rem;
                font-weight: 700;
                box-shadow: 0 6px 15px rgba(34, 197, 94, 0.4);
                transition: all 0.2s;
                border: 2px solid rgba(255,255,255,0.2);
            }
            .btn-adventure:active { transform: scale(0.95); box-shadow: 0 2px 8px rgba(34, 197, 94, 0.6); }

            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: var(--forest-deep);
                border: 2px solid #dcfce7;
                border-radius: 1rem;
                font-weight: 700;
            }
            .tab-btn.active {
                background: var(--peter-green) !important;
                color: white !important;
                box-shadow: 0 8px 15px rgba(34, 197, 94, 0.3);
                transform: translateY(-2px);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (Neverland HUD) --- */}
        <header className="bg-gradient-to-b from-[#0f172a] to-[#14532d] text-white pt-10 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-2xl border-b-4 border-[#22c55e]">
             {/* Star overlay */}
             <div className="absolute top-4 right-10 text-[#facc15] text-4xl animate-sparkle">
                <Icon name="star" size={32} />
             </div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#ffffff]/10 w-fit px-4 py-1.5 rounded-full border border-[#22c55e] transform -rotate-1">
                         <span className="w-3 h-3 rounded-full bg-[#facc15] animate-pulse shadow-[0_0_10px_#facc15]"></span>
                         <p className="text-[#dcfce7] text-[10px] font-bold tracking-widest uppercase adventure-font">Lost Boys Hideout: {tableLabel}</p>
                     </div>
                     <h1 className="text-4xl adventure-font font-black tracking-tighter leading-none mt-2 text-[#ffffff] drop-shadow-[0_4px_0_#14532d]">
                         {brand?.name || "Neverland Eats"}
                     </h1>
                 </div>
                 {/* Peter's Hat Badge */}
                 <div className="w-20 h-20 bg-[#ffffff] rounded-full border-4 border-[#22c55e] flex items-center justify-center relative shadow-lg animate-fly">
                     <Icon name="chef" size={40} className="text-[#14532d]" />
                     <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#ef4444] rounded-full border border-white flex items-center justify-center text-white text-[10px]">
                        <Icon name="star" size={14} />
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
                        <div className="relative w-full h-56 bg-white rounded-[2rem] overflow-hidden shadow-xl mb-10 border-4 border-[#dcfce7] p-2 group animate-image-pop">
                             <div className="h-full w-full rounded-[1.5rem] overflow-hidden bg-[#f0fdf4] relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                 />
                             </div>
                             <div className="absolute bottom-4 right-4 bg-[#22c55e] text-white px-5 py-2 rounded-full border-2 border-white shadow-lg transform rotate-[-2deg]">
                                 <span className="adventure-font text-xs font-bold uppercase tracking-widest">Pan's Pick!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2 animate-image-pop">
                         <div>
                             <h2 className="text-3xl adventure-font text-[#14532d] drop-shadow-sm">Adventure Food</h2>
                             <p className="text-xs text-[#15803d] font-bold uppercase tracking-widest ml-1">Straight from the treehouse</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-white text-[#15803d] px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 hover:bg-[#dcfce7] transition-all border-2 border-[#22c55e] shadow-md active:scale-95">
                             THE MAP <Icon name="menu" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="card-feather"></div>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#f0fdf4] border-b-2 border-[#bbf7d0]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-2 left-2 bg-[#ef4444] text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white shadow-sm adventure-font">
                                                 MAGIC!
                                             </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#14532d] text-sm line-clamp-2 mb-1 leading-tight adventure-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-[#22c55e] line-through font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#15803d] font-black text-xl adventure-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#dcfce7] text-[#15803d] border-2 border-[#22c55e] flex items-center justify-center rounded-full hover:bg-[#86efac] transition-all shadow-sm active:scale-90">
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
                             <Icon name="search" className="text-[#86efac]" />
                         </div>
                         <input type="text" placeholder="Scouting for snacks?..." className="w-full pl-16 pr-8 py-5 rounded-full bg-white border-4 border-[#dcfce7] text-[#14532d] placeholder:text-[#86efac] focus:outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#dcfce7] transition-all text-lg font-bold" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1 animate-image-pop">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-lg font-bold adventure-font ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="card-feather"></div>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#f0fdf4] border-b-2 border-[#bbf7d0]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#14532d] text-sm line-clamp-2 mb-1 leading-tight adventure-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-[#22c55e] line-through font-bold">{pricing.original}</span>}
                                                 <span className="text-[#15803d] font-black text-xl adventure-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#dcfce7] text-[#15803d] border-2 border-[#22c55e] flex items-center justify-center rounded-full hover:bg-[#86efac] transition-all shadow-sm active:scale-90">
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

            {/* --- STATUS PAGE (Peter Pan Theme - FIXED LOGIC) --- */}
            {activeTab === 'status' && (
                <section className="animate-fade-in pt-4 pb-24">
                    <div className="mb-8 flex items-center justify-between bg-white p-8 border-4 border-[#22c55e] rounded-[3rem] shadow-xl relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-20 rotate-12 text-[#facc15] animate-sparkle">
                            <Icon name="star" size={100} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black adventure-font text-[#14532d]">Captain's Log</h2>
                             <p className="text-sm text-[#15803d] font-bold mt-1 uppercase tracking-widest">Flying towards you...</p>
                         </div>
                         <div className="w-16 h-16 bg-[#dcfce7] border-4 border-[#14532d] rounded-full flex items-center justify-center animate-fly shadow-md text-[#15803d]">
                             <Icon name="clock" size={32} />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="bg-white p-6 border-2 border-[#bbf7d0] rounded-[2.5rem] shadow-sm relative overflow-hidden">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-[#15803d] font-bold uppercase tracking-widest flex items-center gap-1">
                                         <Icon name="menu" size={14} /> Scroll #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-wide border rounded-full flex items-center gap-1.5 shadow-sm
                                        ${o.status === 'pending' ? 'bg-[#fef9c3] text-[#b45309] border-[#fde047]' : 'bg-[#dcfce7] text-[#15803d] border-[#22c55e]'}`}>
                                        {o.status === 'pending' ? 'FLYING...' : 'LANDED!'}
                                     </span>
                                </div>

                                {/* Items */}
                                <div className="mb-4 space-y-2 bg-[#f0fdf4] p-5 rounded-2xl border border-[#dcfce7]">
                                    {o.order_items.map((i, idx) => {
                                        // ✅ FIXED LOGIC FOR STATUS PAGE
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        const hasDiscount = (i.original_price && i.original_price > i.price) || (i.discount > 0);
                                        const originalPriceTotal = hasDiscount 
                                            ? (i.original_price ? i.original_price * i.quantity : (i.price + (i.discount || 0)) * i.quantity) 
                                            : finalPriceTotal;
                                        const discountAmount = originalPriceTotal - finalPriceTotal;

                                        return (
                                            <div key={idx} className="flex justify-between items-start text-sm text-[#14532d] font-bold border-b border-dashed border-[#86efac] pb-2 last:border-0 adventure-font">
                                                
                                                {/* Left Info */}
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-base">{quantity}x {i.product_name}</span>
                                                    
                                                    {/* Variant Badge (Neverland Style) */}
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] bg-[#15803d] text-white px-2 py-0.5 rounded-sm border border-[#22c55e] font-sans font-bold mt-1 shadow-sm uppercase tracking-wider transform -rotate-1`}>
                                                            {i.variant === 'special' ? '🧚 FAIRY' : i.variant === 'jumbo' ? '🐊 CROC' : i.variant}
                                                        </span>
                                                    )}

                                                    {/* Note */}
                                                    {i.note && <span className="text-[10px] text-[#22c55e] italic mt-0.5">Note: {i.note}</span>}
                                                </div>

                                                {/* Right Price */}
                                                <div className="text-right flex flex-col items-end min-w-[80px]">
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className="text-[10px] text-white bg-[#ef4444] px-1.5 py-0.5 rounded-full font-sans font-bold mb-1 shadow-sm border border-[#14532d] transform rotate-2">
                                                                SAVE -{discountAmount}
                                                            </span>
                                                            <span className="text-xs text-[#86efac] line-through decoration-[#15803d] decoration-2 sans-serif opacity-80 mb-0.5 font-bold">
                                                                {originalPriceTotal}
                                                            </span>
                                                            <span className="text-[#15803d] text-lg leading-none">
                                                                {finalPriceTotal}.-
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[#15803d] text-lg">{finalPriceTotal}.-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                     <span className="font-bold text-[#86efac] text-xs uppercase tracking-widest">DUST</span>
                                     <span className="font-black text-[#14532d] text-3xl adventure-font">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-20 text-[#86efac] font-bold text-2xl adventure-font opacity-50">
                                No pixie dust here...
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Leaf Capsule) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[85px] bg-white/95 backdrop-blur-md shadow-2xl flex justify-around items-center px-4 z-[100] rounded-[3rem] border-4 border-[#22c55e]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#dcfce7]' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-[#15803d]' : 'text-[#86efac]'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#dcfce7]' : ''}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-[#15803d]' : 'text-[#86efac]'}`} />
                 </div>
             </button>

             {/* Big Cart Button (Leaf Sack) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#15803d] rounded-full shadow-lg flex items-center justify-center text-white border-4 border-[#dcfce7] active:scale-90 transition-all duration-100 z-20 group hover:bg-[#14532d] animate-fly">
                     <Icon name="basket" size={32} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#ef4444] text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#dcfce7]' : ''}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-[#15803d]' : 'text-[#86efac]'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Forest Panel - FIXED 3 PRICES) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0f172a]/70 backdrop-blur-md animate-fade-in">
                <div className="w-full max-w-md bg-white border-t-8 border-[#22c55e] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[4rem] relative animate-image-pop">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-[#15803d] rounded-full border-2 border-[#22c55e] flex items-center justify-center hover:bg-[#dcfce7] transition-colors shadow-md active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-85 overflow-hidden border-b-4 border-[#bbf7d0] rounded-b-[3.5rem] bg-white">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-[#15803d] text-white font-black text-3xl adventure-font rounded-full border-4 border-[#dcfce7] shadow-xl transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-[#86efac] decoration-white decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32 relative">
                        <h2 className="text-4xl adventure-font text-[#14532d] mb-6 leading-tight drop-shadow-sm uppercase tracking-wider">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            
                            {/* ✅ FIXED: 3 Variants Grid (LOST BOY/CAPTAIN/PAN) */}
                            <div>
                                <label className="block text-lg font-bold text-[#15803d] mb-3 adventure-font ml-1 tracking-wide">CHOOSE RANK:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'LOST BOY', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'CAPTAIN', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'PAN', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center justify-between h-24 adventure-font
                                                ${variant === v.key 
                                                    ? 'bg-[#dcfce7] border-[#15803d] shadow-[3px_3px_0_#14532d] -translate-y-1 text-[#15803d]' 
                                                    : 'bg-white border-[#86efac] text-[#86efac] hover:border-[#22c55e] hover:text-[#22c55e]'}`}
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
                                <div className="flex items-center gap-4 bg-white p-3 rounded-full border-4 border-[#bbf7d0] shadow-md">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-[#dcfce7] text-[#15803d] rounded-full flex items-center justify-center hover:bg-[#86efac] active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-[#14532d] adventure-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#15803d] text-white rounded-full flex items-center justify-center hover:bg-[#14532d] active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-[#22c55e] font-black uppercase tracking-widest mb-1">Pixie Dust</p>
                                    <p className="text-4xl font-black text-[#14532d] adventure-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Leave a note on the map..." 
                                    className="w-full p-6 bg-[#f0fdf4] border-4 border-white rounded-[2.5rem] focus:border-[#86efac] focus:outline-none h-36 resize-none text-xl font-bold text-[#14532d] placeholder:text-[#86efac] transition-colors shadow-inner adventure-font"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-white border-4 border-[#bbf7d0] text-[#15803d] font-black text-xl rounded-full active:scale-95 transition-all shadow-md adventure-font">
                                Stash Loot
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-adventure text-2xl active:scale-95 transition-all flex items-center justify-center gap-2 adventure-font tracking-widest">
                                FLY! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ORDER SUMMARY MODAL --- */}
        <div id="orderSummaryOverlay" className={`fixed inset-0 bg-[#0f172a]/60 z-[130] backdrop-blur-sm animate-fade-in ${activeTab === 'cart' ? 'block' : 'hidden'}`} onClick={() => setActiveTab('menu')}></div>
        <div id="orderSummary" className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-[10px] border-[#15803d] z-[140] flex flex-col shadow-2xl h-[92vh] rounded-t-[4rem] transition-transform duration-300 ${activeTab === 'cart' ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="sticky top-0 bg-white z-20 rounded-t-[4rem] border-b-4 border-[#f0fdf4] p-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                <div className="w-24 h-1.5 bg-[#bbf7d0] rounded-full mx-auto mt-2 opacity-50"></div>
            </div>
            
            <div className="flex justify-between items-center mb-6 px-10 pt-8">
                <h2 className="text-4xl adventure-font text-[#14532d] transform -rotate-1 tracking-widest italic">Treasure Stash</h2>
                <div className="w-14 h-14 bg-[#dcfce7] text-[#15803d] border-4 border-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm">
                    <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 px-8 pb-10 no-scrollbar">
                {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white p-4 border-3 border-[#bbf7d0] rounded-[2rem] shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                        <div className="w-20 h-20 bg-[#f0fdf4] rounded-2xl overflow-hidden border-2 border-white shrink-0">
                            <img src={item.image_url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-[#14532d] text-xl leading-tight adventure-font tracking-wide">
                                {item.name} <span className="text-[#22c55e]">x{item.quantity}</span>
                            </div>
                            <div className="text-sm font-bold mt-1 text-[#ef4444]">
                                {item.variant !== 'normal' && <span className="bg-[#f0fdf4] px-2 py-0.5 rounded-full text-xs mr-2 border border-[#dcfce7]">{item.variant}</span>}
                                {item.note && <span className="block text-[#15803d] italic mt-1 text-xs font-normal">"{item.note}"</span>}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className="font-black text-[#15803d] text-2xl adventure-font">{item.price * item.quantity}.-</span>
                             <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#fef2f2] text-[#ef4444] rounded-full flex items-center justify-center hover:bg-[#fee2e2] transition-colors border border-white shadow-sm active:scale-90">
                                 <Icon name="trash" size={18} />
                             </button>
                        </div>
                    </div>
                ))}
                {cart.length === 0 && (
                    <div className="text-center py-20 text-[#86efac] font-bold text-2xl adventure-font opacity-50">
                        Stash is empty...
                    </div>
                )}
            </div>

            <div className="p-10 bg-[#f0fdf4] border-t-4 border-white relative z-30 rounded-t-[4rem]">
                <div className="flex justify-between items-center mb-8 pb-6 border-b-4 border-dashed border-[#bbf7d0]">
                    <div>
                        <p className="text-xs text-[#15803d] font-black uppercase tracking-widest">Total Gold</p>
                        <p className="text-5xl font-black text-[#14532d] drop-shadow-md">{cartTotal}.-</p>
                    </div>
                    <div className="w-20 h-20 bg-white border-4 border-[#bbf7d0] rounded-full flex items-center justify-center text-[#22c55e] transform rotate-6 shadow-lg">
                        <Icon name="basket" size={40} />
                    </div>
                </div>
                <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-6 btn-adventure text-3xl active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.1em] adventure-font">
                    <span>OFF TO NEVERLAND!</span> <Icon name="flame" size={24} />
                </button>
            </div>
        </div>

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#0f172a]/90 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-image-pop">
                <div className="w-full max-w-sm bg-white border-8 border-[#bbf7d0] p-10 text-center shadow-2xl relative overflow-hidden rounded-[3rem]">
                    <div className="w-28 h-28 bg-[#f0fdf4] text-[#15803d] rounded-full flex items-center justify-center mx-auto mb-8 border border-[#bbf7d0] shadow-lg relative z-10 animate-fly">
                        <Icon name="flame" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-3xl adventure-font text-[#14532d] mb-4 leading-tight relative z-10 uppercase tracking-widest">Take Flight?</h3>
                            <p className="text-lg text-[#15803d] mb-10 font-bold adventure-font relative z-10">Add "{selectedProduct.name}" and fly?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-[#15803d] text-white font-black border border-white shadow-xl active:scale-95 transition-all text-xl adventure-font uppercase tracking-widest rounded-2xl">YES! SECOND STAR TO THE RIGHT!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-white border-4 border-[#bbf7d0] text-[#15803d] font-black text-lg active:scale-95 transition-transform hover:bg-[#f0fdf4] adventure-font rounded-full uppercase">Just Stash</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl adventure-font text-[#14532d] mb-4 leading-tight relative z-10 uppercase tracking-widest">Start Adventure?</h3>
                            <p className="text-lg text-[#15803d] mb-10 font-bold adventure-font relative z-10">Feast with the Lost Boys now?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-5 bg-[#15803d] text-white font-black border border-white shadow-xl active:scale-95 transition-all text-xl adventure-font uppercase tracking-widest rounded-2xl">YES! HERE WE GO!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white border-4 border-[#bbf7d0] text-[#15803d] font-black text-lg active:scale-95 transition-transform hover:bg-[#f0fdf4] adventure-font rounded-full uppercase">Wait!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}