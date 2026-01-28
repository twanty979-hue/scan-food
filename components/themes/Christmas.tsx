import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Christmas / Festive Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Igloo / Cabin
    home: <path d="M3 10L12 2l9 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10z M12 12c-2 0-3 2-3 4s1 4 3 4 3-2 3-4-1-4-3-4z" />, 
    // Menu -> Scroll / List
    menu: <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="3" strokeLinecap="round" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Gift Box
    basket: <path d="M20 12h-2V5h1a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1v7H10V5h1a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1v7H4a2 2 0 0 0-2 2v9a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-9a2 2 0 0 0-2-2zm-9-8h4v1h-4V4zm-8 1h4v1H3V5zm2 16v-7h4v7H5zm6 0v-7h4v7h-4zm6 0v-7h4v7h-4z" />,
    // Clock -> Wreath / Timer
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Reindeer / Santa Hat
    chef: <path d="M12 2C7 2 2 7 2 12s5 10 10 10 10-5 10-10S17 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />, 
    // Star -> North Star
    star: <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Sparkle / Magic
    flame: <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    snowflake: <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" strokeWidth="2" />,
    deer: <path d="M12 2l2 4h4l-3 3 1 5-4-2-4 2 1-5-3-3h4z" />,
    bell: <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />,
    truck: <path d="M20 8h-3V4H3v16h2v-2h12v2h2l3-3V8zM5 6h10v2H5V6zm2 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />,
    candy: <path d="M17 8.5c0-2.5-2-4.5-4.5-4.5S8 6 8 8.5v8c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5v-8zM6 10h12" />
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
      {name === 'chef' && <circle cx="12" cy="14" r="2" fill="currentColor"/>}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#f0f9ff] flex items-center justify-center text-[#dc2626] font-black text-2xl animate-pulse">LOADING...</div>;

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
    // Theme: Christmas - Joyful Feast System
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#1e3a8a]">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Itim&family=Mali:wght@400;600;700&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --xmas-red: #dc2626;
                --xmas-green: #166534;
                --xmas-gold: #fbbf24;
                --snow-white: #ffffff;
                --sky-blue: #f0f9ff;
                --text-festive: #1e3a8a;
            }

            body {
                font-family: 'Itim', 'Sarabun', sans-serif;
                background-color: var(--sky-blue);
                /* Snowflake & Polka Dot Pattern */
                background-image: 
                    radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.8) 5%, transparent 6%),
                    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40 0 L42 38 L80 40 L42 42 L40 80 L38 42 L0 40 L38 38 Z' fill='%23ffffff' fill-opacity='0.5'/%3E%3C/svg%3E");
                background-attachment: fixed;
                color: var(--text-festive);
            }

            .festive-title {
                font-family: 'Mali', cursive;
                font-weight: 700;
            }

            @keyframes sleigh-float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-10px) rotate(2deg); }
            }
            .animate-sleigh { animation: sleigh-float 3s infinite ease-in-out; }

            @keyframes twinkle {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.1); }
            }
            .animate-twinkle { animation: twinkle 2s infinite; }

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
                border: 3px solid var(--xmas-green);
                border-radius: 1.5rem;
                box-shadow: 0 10px 20px -5px rgba(22, 101, 52, 0.2);
                overflow: hidden;
            }
            .item-card:hover, .item-card:active {
                transform: translateY(-8px);
                border-color: var(--xmas-red);
                box-shadow: 0 15px 30px -10px rgba(220, 38, 38, 0.3);
            }

            .card-ribbon {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 8px;
                background: repeating-linear-gradient(90deg, var(--xmas-red), var(--xmas-red) 10px, white 10px, white 20px);
                z-index: 5;
            }

            .btn-festive {
                background: linear-gradient(135deg, var(--xmas-red) 0%, #991b1b 100%);
                color: white;
                border-radius: 1rem;
                font-weight: 700;
                box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
                transition: all 0.2s;
                border: 2px solid white;
            }
            .btn-festive:active { transform: scale(0.95); }

            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: var(--xmas-green);
                border: 2px solid var(--xmas-green);
                border-radius: 1rem;
                font-weight: 700;
            }
            .tab-btn.active {
                background: var(--xmas-green) !important;
                color: white !important;
                box-shadow: 0 8px 15px rgba(22, 101, 52, 0.3);
                transform: translateY(-2px);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (North Pole Station HUD) --- */}
        <header className="bg-gradient-to-b from-red-600 to-red-700 text-white pt-10 pb-16 px-6 rounded-b-[4rem] relative overflow-hidden shadow-xl border-b-4 border-green-800">
             {/* Snow overlay */}
             <div className="absolute top-4 left-10 text-white/30 text-5xl animate-pulse">
                <Icon name="snowflake" size={48} />
             </div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-green-600/50 w-fit px-4 py-1.5 rounded-full border border-white transform -rotate-1">
                         <span className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse border border-white"></span>
                         <p className="text-white text-[10px] font-bold tracking-widest uppercase">Santa's Workshop: {tableLabel}</p>
                     </div>
                     <h1 className="text-4xl festive-title font-black tracking-tighter leading-none mt-2 text-white drop-shadow-md">
                         {brand?.name || "ฉลองคริสต์มาส"}
                     </h1>
                 </div>
                 {/* Reindeer Badge */}
                 <div className="w-20 h-20 bg-white rounded-full border-4 border-green-700 flex items-center justify-center relative shadow-lg animate-sleigh">
                     <Icon name="chef" size={40} className="text-red-600" />
                     <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full border border-white flex items-center justify-center text-red-700 text-[10px]">
                        <Icon name="bell" size={14} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade-in">
                    {/* Hero Banner (Snowy View) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[3rem] overflow-hidden shadow-2xl mb-10 border-4 border-green-100 p-2 group animate-image-pop">
                             <div className="h-full w-full rounded-[2.5rem] overflow-hidden bg-sky-50 relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                 />
                             </div>
                             <div className="absolute bottom-4 left-6 bg-red-600 text-white px-5 py-2 rounded-full border-2 border-white shadow-lg transform rotate-[-2deg]">
                                 <span className="festive-title text-xs font-bold uppercase tracking-widest">Santa's Favorites!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2 animate-image-pop">
                         <div>
                             <h2 className="text-3xl festive-title text-red-700 drop-shadow-sm">Holiday Treats</h2>
                             <p className="text-xs text-green-700 font-bold uppercase tracking-widest ml-1">Fresh from the North Pole</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-white text-red-600 px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 hover:bg-red-50 transition-all border-2 border-green-100 shadow-md active:scale-95">
                             VIEW MENU <Icon name="candy" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="card-ribbon"></div>
                                     <div className="w-full h-40 overflow-hidden relative bg-green-50/50 mt-2">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-2 right-2 bg-[#fbbf24] text-red-700 text-[10px] font-bold px-3 py-1 rounded-full border border-white shadow-sm festive-title">
                                                 GIFT!
                                             </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#1e3a8a] text-sm line-clamp-2 mb-1 leading-tight festive-title">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-gray-400 line-through font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#dc2626] font-black text-xl festive-title leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#dcfce7] text-[#166534] border-2 border-[#166534] flex items-center justify-center rounded-full hover:bg-[#bbf7d0] transition-all shadow-sm active:scale-90">
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
                             <Icon name="search" className="text-green-400" />
                         </div>
                         <input type="text" placeholder="Looking for gifts?..." className="w-full pl-16 pr-8 py-5 rounded-full bg-white border-4 border-green-100 text-green-900 placeholder:text-green-200 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all text-lg font-bold" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1 animate-image-pop">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-lg font-bold ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="card-ribbon"></div>
                                     <div className="w-full h-40 overflow-hidden relative bg-green-50/50 mt-2">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#1e3a8a] text-sm line-clamp-2 mb-1 leading-tight festive-title">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-gray-400 line-through font-bold">{pricing.original}</span>}
                                                 <span className="text-[#dc2626] font-black text-xl festive-title leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#dcfce7] text-[#166534] border-2 border-[#166534] flex items-center justify-center rounded-full hover:bg-[#bbf7d0] transition-all shadow-sm active:scale-90">
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

            {/* --- STATUS PAGE (Christmas Theme - FIXED LOGIC) --- */}
            {activeTab === 'status' && (
                <section className="animate-fade-in pt-4 pb-24">
                    <div className="mb-8 flex items-center justify-between bg-white p-8 border-4 border-green-100 rounded-[3rem] shadow-xl relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12 text-red-500">
                            <Icon name="flame" size={100} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black festive-title text-red-600">Delivery Log</h2>
                             <p className="text-sm text-green-700 font-bold mt-1 uppercase tracking-widest">Sleigh is on the way...</p>
                         </div>
                         <div className="w-16 h-16 bg-red-50 border-4 border-white rounded-full flex items-center justify-center animate-bounce shadow-md text-red-500">
                             <Icon name="truck" size={32} />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-white p-6 border-2 border-green-100 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-red-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                         <Icon name="truck" size={14} /> Gift #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-wide border rounded-full flex items-center gap-1.5 shadow-sm
                                        ${o.status === 'pending' ? 'bg-[#fef3c7] text-[#b45309] border-[#fcd34d]' : 'bg-[#ccfbf1] text-[#0f766e] border-[#5eead4]'}`}>
                                        {o.status === 'pending' ? 'WRAPPING...' : 'DELIVERED!'}
                                     </span>
                                </div>

                                {/* Items */}
                                <div className="mb-4 space-y-2 bg-[#f0fdf4] p-5 rounded-2xl border border-[#dcfce7]">
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
                                            <div key={idx} className="flex justify-between items-start text-sm text-[#166534] font-bold border-b border-dashed border-[#bbf7d0] pb-2 last:border-0 festive-title">
                                                
                                                {/* Left Info */}
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-base">{quantity}x {i.product_name}</span>
                                                    
                                                    {/* Variant Badge (Christmas Style) */}
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] bg-[#dc2626] text-white px-2 py-0.5 rounded-sm border border-[#1e3a8a] font-sans font-bold mt-1 shadow-sm uppercase tracking-wider transform -rotate-1`}>
                                                            {i.variant === 'special' ? '🦌 REINDEER' : i.variant === 'jumbo' ? '🎅 SANTA' : i.variant}
                                                        </span>
                                                    )}

                                                    {/* Note */}
                                                    {i.note && <span className="text-[10px] text-[#dc2626] italic mt-0.5">Note: {i.note}</span>}
                                                </div>

                                                {/* Right Price */}
                                                <div className="text-right flex flex-col items-end min-w-[80px]">
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className="text-[10px] text-white bg-[#fbbf24] text-red-900 px-1.5 py-0.5 rounded-full font-sans font-bold mb-1 shadow-sm border border-[#dc2626] transform rotate-2">
                                                                SAVE -{discountAmount}
                                                            </span>
                                                            <span className="text-xs text-[#9ca3af] line-through decoration-[#dc2626] decoration-2 sans-serif opacity-80 mb-0.5 font-bold">
                                                                {originalPriceTotal}
                                                            </span>
                                                            <span className="text-[#166534] text-lg leading-none">
                                                                {finalPriceTotal}.-
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[#166534] text-lg">{finalPriceTotal}.-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                     <span className="font-bold text-[#9ca3af] text-xs uppercase tracking-widest">JOY</span>
                                     <span className="font-black text-[#166534] text-3xl festive-title">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-20 text-blue-200 font-bold text-2xl festive-title opacity-50">
                                The sleigh is empty...
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Festive Capsule) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[85px] bg-white shadow-2xl flex justify-around items-center px-4 z-[100] rounded-[3rem] border-4 border-green-100">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-red-50' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-red-500' : 'text-slate-300'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-red-50' : ''}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-red-500' : 'text-slate-300'}`} />
                 </div>
             </button>

             {/* Big Cart Button (Gift Basket) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-green-600 rounded-full shadow-lg flex items-center justify-center text-white border-4 border-white active:scale-90 transition-all duration-100 z-20 group hover:bg-green-700 animate-sleigh">
                     <Icon name="basket" size={32} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-red-50' : ''}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-red-500' : 'text-slate-300'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Holly Panel - FIXED 3 PRICES) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-sky-900/60 backdrop-blur-md animate-fade-in">
                <div className="w-full max-w-md bg-white border-t-8 border-red-500 h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[4rem] relative animate-image-pop">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-red-500 rounded-full border-2 border-red-100 flex items-center justify-center hover:bg-red-50 transition-colors shadow-md active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-85 overflow-hidden border-b-4 border-green-100 rounded-b-[3.5rem] bg-white">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-green-600 text-white font-black text-3xl festive-title rounded-full border-4 border-white shadow-xl transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-green-200 decoration-white decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32 relative">
                        <h2 className="text-4xl festive-title text-red-700 mb-6 leading-tight drop-shadow-sm uppercase tracking-wider">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            
                            {/* ✅ FIXED: 3 Variants Grid (ELF/SANTA/SLEIGH) */}
                            <div>
                                <label className="block text-lg font-bold text-green-800 mb-3 festive-title ml-1 tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'ELF', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'SANTA', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'SLEIGH', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center justify-between h-24 festive-title
                                                ${variant === v.key 
                                                    ? 'bg-red-50 border-red-500 shadow-[3px_3px_0_#991b1b] -translate-y-1 text-red-700' 
                                                    : 'bg-white border-green-100 text-green-300 hover:border-green-300 hover:text-green-500'}`}
                                        >
                                            <span className="text-[10px] font-black tracking-widest uppercase">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[9px] line-through decoration-green-600 decoration-2 opacity-70 mb-1">{v.original}</span>
                                                )}
                                                <span className="text-lg font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-4 bg-white p-3 rounded-full border-4 border-green-100 shadow-md">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-red-800 festive-title">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-green-600 font-black uppercase tracking-widest mb-1">Joy Points</p>
                                    <p className="text-4xl font-black text-red-700 festive-title">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="A message for Santa's elves..." 
                                    className="w-full p-6 bg-sky-50 border-4 border-white rounded-[2.5rem] focus:border-red-300 focus:outline-none h-36 resize-none text-xl font-bold text-blue-900 placeholder:text-blue-200 transition-colors shadow-inner festive-title"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-white border-4 border-green-100 text-green-700 font-black text-xl rounded-full active:scale-95 transition-all shadow-md festive-title">
                                Pack Gift
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-festive text-2xl active:scale-95 transition-all flex items-center justify-center gap-2 festive-title">
                                SEND JOY! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ORDER SUMMARY MODAL --- */}
        <div id="orderSummaryOverlay" className={`fixed inset-0 bg-sky-950/60 z-[130] backdrop-blur-sm animate-fade-in ${activeTab === 'cart' ? 'block' : 'hidden'}`} onClick={() => setActiveTab('menu')}></div>
        <div id="orderSummary" className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-[10px] border-green-600 z-[140] flex flex-col shadow-2xl h-[92vh] rounded-t-[4rem] transition-transform duration-300 ${activeTab === 'cart' ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="sticky top-0 bg-white z-20 rounded-t-[4rem] border-b-4 border-sky-50 p-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                <div className="w-24 h-1.5 bg-green-100 rounded-full mx-auto mt-2 opacity-50"></div>
            </div>
            
            <div className="flex justify-between items-center mb-6 px-10 pt-8">
                <h2 className="text-4xl festive-title text-red-700 transform -rotate-1 tracking-widest italic">Sleigh Bag</h2>
                <div className="w-14 h-14 bg-red-100 text-red-600 border-4 border-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm">
                    <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 px-8 pb-10 no-scrollbar">
                {cart.map((item: any, idx: any) => (
                    <div key={idx} className="flex items-center gap-4 bg-white p-4 border-3 border-green-100 rounded-[2rem] shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                        <div className="w-20 h-20 bg-green-50 rounded-2xl overflow-hidden border-2 border-white shrink-0">
                            <img src={item.image_url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-[#1e3a8a] text-xl leading-tight festive-title tracking-wide">
                                {item.name} <span className="text-[#166534]">x{item.quantity}</span>
                            </div>
                            <div className="text-sm font-bold mt-1 text-[#dc2626]">
                                {item.variant !== 'normal' && <span className="bg-[#fef3c7] px-2 py-0.5 rounded-full text-xs mr-2 border border-[#fcd34d]">{item.variant}</span>}
                                {item.note && <span className="block text-[#06b6d4] italic mt-1 text-xs font-normal">"{item.note}"</span>}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className="font-black text-[#166534] text-2xl festive-title">{item.price * item.quantity}.-</span>
                             <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#fef2f2] text-[#ef4444] rounded-full flex items-center justify-center hover:bg-[#fee2e2] transition-colors border border-white shadow-sm active:scale-90">
                                 <Icon name="trash" size={18} />
                             </button>
                        </div>
                    </div>
                ))}
                {cart.length === 0 && (
                    <div className="text-center py-20 text-blue-200 font-bold text-2xl festive-title opacity-50">
                        The sleigh is empty...
                    </div>
                )}
            </div>

            <div className="p-10 bg-green-50 border-t-4 border-white relative z-30 rounded-t-[4rem]">
                <div className="flex justify-between items-center mb-8 pb-6 border-b-4 border-dashed border-green-200">
                    <div>
                        <p className="text-xs text-green-600 font-black uppercase tracking-widest">Total Bounty</p>
                        <p className="text-5xl font-black text-red-700 drop-shadow-md">{cartTotal}.-</p>
                    </div>
                    <div className="w-20 h-20 bg-white border-4 border-green-100 rounded-full flex items-center justify-center text-red-400 transform rotate-6 shadow-lg">
                        <Icon name="basket" size={40} />
                    </div>
                </div>
                <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-6 btn-festive text-3xl active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.1em] festive-title">
                    <span>MERRY CHRISTMAS!</span> <Icon name="flame" size={24} />
                </button>
            </div>
        </div>

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-sky-950/80 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-image-pop">
                <div className="w-full max-w-sm bg-white border-8 border-green-100 p-10 text-center shadow-2xl relative overflow-hidden rounded-[3rem]">
                    <div className="w-28 h-28 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-100 shadow-lg relative z-10 animate-sleigh">
                        <Icon name="flame" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-3xl festive-title text-red-700 mb-4 leading-tight relative z-10 uppercase tracking-widest">Added to Sleigh?</h3>
                            <p className="text-lg text-green-700 mb-10 font-bold festive-title relative z-10">Add "{selectedProduct.name}" and fly?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-green-600 text-white font-black border border-white shadow-xl active:scale-95 transition-all text-xl festive-title uppercase tracking-widest rounded-2xl">YES! LET IT FLY!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-white border-4 border-green-100 text-green-700 font-black text-lg active:scale-95 transition-transform hover:bg-green-50 festive-title rounded-full uppercase">Just Add</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl festive-title text-red-700 mb-4 leading-tight relative z-10 uppercase tracking-widest">Send Gifts?</h3>
                            <p className="text-lg text-green-700 mb-10 font-bold festive-title relative z-10">Combine all stashed items into one grand holiday feast?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-5 bg-green-600 text-white font-black border border-white shadow-xl active:scale-95 transition-all text-xl festive-title uppercase tracking-widest rounded-2xl">YES! DELIVER ALL!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white border-4 border-green-50 text-green-200 font-black text-lg active:scale-95 transition-transform hover:bg-sky-50 festive-title rounded-full uppercase">Wait!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}