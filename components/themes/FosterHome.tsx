import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Foster's Home Style) ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Foster's Mansion
    home: <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z M12 4.5l6 6V18h-2v-6H8v6H6v-7.5l6-6z" />, 
    // Menu -> Coco's Eggs / List
    menu: <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="3" strokeLinecap="round" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Bloo / Toy Chest
    basket: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z M8 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />,
    // Clock -> Grandfather Clock / Time
    clock: <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z M12 6v6l4 2" />,
    // Chef -> Mac's Backpack / Bloo
    chef: <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-4 8a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm8 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm-4 6c-2.67 0-4-2-4-2s1.33-2 4-2 4 2 4 2-1.33 2-4 2z" />, 
    // Star -> Imagination Sparkle
    star: <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Imagination
    flame: <path d="M12 2L2 22h20L12 2zm0 5l5 11H7l5-11z" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    // Cookie -> Coco Egg
    cookie: <path d="M12 2C8 2 5 6 5 11c0 5.5 3 11 7 11s7-5.5 7-11c0-5-3-9-7-9zm0 18c-2.5 0-5-4-5-9 0-3.5 2-7 5-7s5 3.5 5 7c0 5-2.5 9-5 9z" />
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
      {name === 'basket' && <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeWidth="2" strokeLinecap="round" />} {/* Smile */}
      {name === 'clock' && <path d="M12 6v6l4 2" />}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#E3F2FD]" />;

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
    // Theme: Foster's Home for Imaginary Friends
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#1A237E]">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Chewy&family=Fredoka+One&family=Mali:wght@400;700&display=swap');
            
            :root {
                --primary: #2979FF; /* Bloo Blue */
                --primary-dark: #1565C0;
                --secondary: #D32F2F; /* Mac Red */
                --accent: #7C4DFF; /* Eduardo Purple */
                --bg: #E3F2FD; /* Light Blue Sky */
                --house: #FFECB3; /* House Color */
            }

            body {
                font-family: 'Mali', cursive;
                background-color: var(--bg);
                /* --- 🏠 HOUSE PATTERN --- */
                background-image: 
                    radial-gradient(#90CAF9 15%, transparent 16%),
                    radial-gradient(#90CAF9 15%, transparent 16%);
                background-position: 0 0, 20px 20px;
                background-size: 40px 40px;
                background-attachment: fixed;
            }

            .foster-font {
                font-family: 'Fredoka One', cursive;
            }

            .fun-font {
                font-family: 'Chewy', cursive;
            }

            /* --- ANIMATIONS --- */
            
            /* DookDik (Wiggle) Animation - Original/Gentle */
            @keyframes dookdik {
                0%, 100% { transform: rotate(-3deg); }
                50% { transform: rotate(3deg); }
            }
            .animate-dookdik { animation: dookdik 2s ease-in-out infinite; }

            /* DookDik Strong (Wiggle Hard) - For Clock */
            @keyframes dookdik-strong {
                0%, 100% { transform: rotate(-12deg) scale(1); }
                50% { transform: rotate(12deg) scale(1.1); }
            }
            .animate-dookdik-strong { animation: dookdik-strong 0.6s ease-in-out infinite; }

            /* Gentle Wiggle for Labels */
            @keyframes gentle-wiggle {
                0%, 100% { transform: rotate(-2deg) translateY(0); }
                50% { transform: rotate(2deg) translateY(-1px); }
            }
            .animate-gentle-wiggle { animation: gentle-wiggle 3s ease-in-out infinite; }

            /* Image Pop Animation (On Open/Change) */
            @keyframes pop-image {
                0% { opacity: 0; transform: scale(0.8) translateY(10px); }
                60% { opacity: 1; transform: scale(1.05); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-image-pop { animation: pop-image 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }

            /* Simple Fade Up for Layout */
            @keyframes slide-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }

            .btn-bloo {
                background: #2979FF;
                color: white;
                border: 4px solid #1565C0;
                border-radius: 1.5rem;
                font-family: 'Chewy', cursive;
                box-shadow: 0 6px 0 #0D47A1;
                transition: all 0.2s;
            }
            .btn-bloo:active {
                transform: translateY(4px);
                box-shadow: 0 2px 0 #0D47A1;
            }

            .friend-card {
                background: white;
                border: 4px solid #1A237E;
                border-radius: 2rem;
                box-shadow: 6px 6px 0 #2979FF;
                transition: all 0.2s;
                position: relative;
                overflow: hidden;
            }
            .friend-card:active {
                transform: translate(3px, 3px);
                box-shadow: 3px 3px 0 #2979FF;
            }

            .tab-btn {
                background: #FFFFFF;
                color: #5C6BC0;
                border: 3px solid #C5CAE9;
                border-radius: 1.5rem;
                transition: all 0.3s;
                font-family: 'Fredoka One', cursive;
            }
            .tab-btn.active {
                background: #FFD54F;
                color: #3E2723;
                border-color: #FFA000;
                box-shadow: 0 4px 0 #FF6F00;
                transform: translateY(-2px);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* --- Header (Foster's Mansion) --- */}
        <header className="bg-[#D32F2F] text-white pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-xl z-10 border-b-8 border-white">
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     {/* Label with gentle wiggle */}
                     <div className="flex items-center gap-2 mb-2 bg-white w-fit px-4 py-1.5 rounded-full border-2 border-[#B71C1C] shadow-sm animate-gentle-wiggle">
                         <span className="w-3 h-3 rounded-full bg-[#2979FF] animate-pulse"></span>
                         <p className="text-[#D32F2F] text-xs font-bold tracking-wide foster-font uppercase">Room: {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl font-normal tracking-wide leading-none mt-2 fun-font text-white drop-shadow-[2px_2px_0_#B71C1C] transform rotate-1">
                         {brand?.name || "Foster's Kitchen"}
                     </h1>
                 </div>
                 {/* Logo (Bloo/Chef) - DookDik Animation */}
                 <div className="w-20 h-20 bg-[#2979FF] rounded-full border-4 border-white flex items-center justify-center relative shadow-lg animate-dookdik">
                     <Icon name="chef" className="text-white w-12 h-12" />
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#FFD54F] rounded-full border-2 border-[#2979FF] flex items-center justify-center text-[#D32F2F] text-xs font-bold shadow-sm">
                        🏠
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-slide-up">
                    {/* Hero Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-[#FFF9C4] rounded-[2rem] overflow-hidden shadow-[6px_6px_0_#1A237E] mb-8 border-4 border-[#1A237E] p-2">
                             <div className="h-full w-full rounded-[1.5rem] overflow-hidden border-2 border-[#FFECB3] relative group">
                                 {/* Banner Image Animation */}
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover animate-image-pop" 
                                    key={currentBannerIndex} 
                                 />
                             </div>
                             <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 bg-[#2979FF] px-6 py-2 rounded-b-xl border-x-4 border-b-4 border-[#1A237E] shadow-lg animate-gentle-wiggle">
                                 <span className="fun-font text-xl text-white tracking-wider">IT'S HOT IN TOPEKA!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                         <div>
                             <h2 className="text-3xl font-normal text-[#D32F2F] fun-font transform -rotate-1 drop-shadow-sm">Imaginary Snacks!</h2>
                             <p className="text-sm text-[#1565C0] font-bold ml-1 tracking-wide bg-white px-2 rounded-full inline-block border border-[#2979FF]">For all friends</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#FFD54F] text-[#3E2723] px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#FFCA28] transition-colors foster-font border-4 border-white shadow-[0_4px_0_#FFA000] active:translate-y-[2px] active:shadow-none text-lg">
                             FRIEND MENU <Icon name="menu" size={20} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="friend-card group cursor-pointer">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#E3F2FD] border-b-4 border-[#1A237E]">
                                         {/* Product Image Animation */}
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover animate-image-pop" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#D32F2F] text-white text-xs font-bold px-2 py-1 rounded-xl border-2 border-white transform -rotate-6 shadow-sm foster-font animate-gentle-wiggle">
                                                ★ WOW!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#1A237E] text-lg line-clamp-2 mb-1 leading-tight fun-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-xs text-gray-400 line-through decoration-[#D32F2F] decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#2979FF] font-black text-2xl foster-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFD54F] text-[#3E2723] border-2 border-[#FFA000] flex items-center justify-center rounded-full hover:bg-[#FFC107] transition-all shadow-[0_2px_0_#FF6F00] active:scale-90">
                                                 <Icon name="plus" size={20} strokeWidth={3} />
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
                <section className="animate-slide-up pt-4">
                    <div className="relative mb-8 group">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#2979FF]" />
                         </div>
                         <input type="text" placeholder="Search for food..." className="w-full pl-14 pr-6 py-4 rounded-3xl bg-white border-4 border-[#90CAF9] text-[#1A237E] placeholder:text-[#9FA8DA] focus:outline-none focus:border-[#2979FF] focus:shadow-sm transition-all text-xl font-bold foster-font" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-3 text-lg font-bold rounded-2xl flex items-center gap-2 ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-24">
                        {filteredProducts?.map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="friend-card group cursor-pointer">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#E3F2FD] border-b-4 border-[#1A237E]">
                                         {/* Product Image Animation */}
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover animate-image-pop" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#1A237E] text-lg line-clamp-2 mb-1 leading-tight fun-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-xs text-gray-400 line-through decoration-[#D32F2F] decoration-2 font-bold">{pricing.original}</span>}
                                                <span className="text-[#2979FF] font-black text-2xl foster-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFD54F] text-[#3E2723] border-2 border-[#FFA000] flex items-center justify-center rounded-full hover:bg-[#FFC107] transition-all shadow-[0_2px_0_#FF6F00] active:scale-90">
                                                 <Icon name="plus" size={20} strokeWidth={3} />
                                             </button>
                                         </div>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- STATUS PAGE (Eduardo/Foster Theme) --- */}
{activeTab === 'status' && (
    <section className="animate-slide-up pt-4 pb-24">
        {/* Header: Eduardo's Log */}
        <div className="mb-8 flex items-center justify-between bg-[#7C4DFF] p-6 border-4 border-white rounded-[2rem] shadow-[6px_6px_0_#1A237E] relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#B388FF] rounded-full border-4 border-white opacity-50"></div>
             <div className="relative z-10">
                 <h2 className="text-3xl font-bold fun-font text-white drop-shadow-sm">Eduardo's Log</h2>
                 <p className="text-sm text-[#EDE7F6] font-bold mt-1 tracking-wider">Potatoes are coming...</p>
             </div>
             {/* Clock - DookDik STRONG Animation */}
             <div className="w-16 h-16 bg-white border-4 border-[#7C4DFF] rounded-full flex items-center justify-center animate-dookdik-strong">
                 <Icon name="clock" className="text-[#7C4DFF]" size={32} />
             </div>
        </div>

        <div className="space-y-4">
            {ordersList?.map((o) => (
                <div key={o.id} className="bg-white p-5 border-4 border-[#1A237E] rounded-[2rem] relative overflow-hidden shadow-[6px_6px_0_#90CAF9]">
                    
                    {/* Header: Visit ID & Status */}
                    <div className="flex justify-between items-start mb-4">
                         <span className="text-sm text-[#2979FF] font-bold uppercase tracking-widest flex items-center gap-1 foster-font animate-gentle-wiggle">
                             Visit #{o.id.slice(-4)}
                         </span>
                         <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wide border-2 flex items-center gap-1.5 foster-font shadow-sm rounded-lg transform -rotate-1
                             ${o.status === 'pending' ? 'bg-[#FFF9C4] text-[#FBC02D] border-[#FFF176]' : 'bg-[#E1F5FE] text-[#0288D1] border-[#81D4FA]'}`}>
                             {o.status === 'pending' ? 'MAKING...' : 'DONE!'}
                         </span>
                    </div>

                    {/* Order Items List */}
                    <div className="mb-3 space-y-1 bg-[#E8EAF6] p-4 border-2 border-[#C5CAE9] rounded-xl">
                        {o.order_items.map((i, idx) => {
                            // ✅ LOGIC: คำนวณราคาและส่วนลด
                            const quantity = i.quantity || 1;
                            const finalPriceTotal = i.price * quantity;
                            
                            const hasDiscount = (i.original_price && i.original_price > i.price) || (i.discount > 0);
                            
                            const originalPriceTotal = hasDiscount 
                                ? (i.original_price ? i.original_price * i.quantity : (i.price + (i.discount || 0)) * i.quantity) 
                                : finalPriceTotal;
                                
                            const discountAmount = originalPriceTotal - finalPriceTotal;

                            return (
                                <div key={idx} className="flex justify-between items-start text-lg text-[#1A237E] font-bold mb-2 border-b border-dashed border-[#9FA8DA] pb-2 last:border-0 foster-font">
                                    
                                    {/* Left: Info */}
                                    <div className="flex flex-col items-start pr-2">
                                        <span className="leading-tight text-xl">{quantity}x {i.product_name}</span>
                                        
                                        {/* Variant Badge (Purple Style) */}
                                        {i.variant !== 'normal' && (
                                            <span className={`text-[10px] bg-[#B388FF] text-white px-2 py-0.5 rounded-md border-2 border-[#651FFF] font-sans font-bold mt-1 shadow-sm uppercase tracking-wider transform -rotate-2`}>
                                                {i.variant === 'special' ? 'SPECIAL' : i.variant === 'jumbo' ? 'JUMBO' : i.variant}
                                            </span>
                                        )}

                                        {/* Note */}
                                        {i.note && <span className="text-xs text-[#FF4081] italic sans-serif mt-0.5">"{i.note}"</span>}
                                    </div>

                                    {/* Right: Price */}
                                    <div className="text-right flex flex-col items-end min-w-[80px]">
                                        {hasDiscount ? (
                                            <>
                                                {/* 🔥 ป้าย SAVE (Pink Pop Style) */}
                                                <span className="text-[10px] text-white bg-[#FF4081] px-1.5 py-0.5 rounded-full font-sans font-bold mb-1 shadow-sm border border-white transform rotate-3 animate-pulse">
                                                    SAVE -{discountAmount}
                                                </span>

                                                {/* ราคาเต็ม (ขีดฆ่า) */}
                                                <span className="text-sm text-[#7986CB] line-through decoration-[#FF4081] decoration-2 sans-serif opacity-70 mb-0.5 font-bold">
                                                    {originalPriceTotal}
                                                </span>

                                                {/* ราคาจริง */}
                                                <span className="text-[#2979FF] text-2xl leading-none">
                                                    {finalPriceTotal}.-
                                                </span>
                                            </>
                                        ) : (
                                            // ราคาปกติ
                                            <span className="text-[#2979FF] text-2xl">{finalPriceTotal}.-</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer: Total */}
                    <div className="flex justify-between items-center pt-2 border-t-2 border-[#1A237E]">
                         <span className="font-bold text-[#D32F2F] text-sm uppercase tracking-widest foster-font">TOTAL FUN</span>
                         <span className="font-black text-[#1A237E] text-3xl fun-font">
                             {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                         </span>
                    </div>
                </div>
            ))}
            
            {/* Empty State */}
            {(!ordersList || ordersList.length === 0) && (
                 <div className="text-center py-12 opacity-50">
                    <div className="w-20 h-20 bg-[#E8EAF6] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#7C4DFF]">
                        <Icon name="search" size={40} className="text-[#7C4DFF]" />
                    </div>
                    <p className="fun-font text-2xl text-[#1A237E]">No orders yet, amigo...</p>
                 </div>
            )}
        </div>
    </section>
)}

        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[75px] bg-white shadow-[0_8px_20px_rgba(41,121,255,0.3)] flex justify-around items-center px-4 z-[90] rounded-full border-4 border-[#2979FF]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'home' ? 'text-[#2979FF]' : 'text-[#B0BEC5]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#E3F2FD] border-2 border-[#2979FF]' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'menu' ? 'text-[#2979FF]' : 'text-[#B0BEC5]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#E3F2FD] border-2 border-[#2979FF]' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* Big Cart Button (Bloo Style) - DookDik Animation */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#2979FF] rounded-full shadow-[0_6px_0_#0D47A1] flex items-center justify-center text-white border-4 border-white active:scale-95 transition-all duration-100 z-20 group animate-dookdik">
                     <Icon name="basket" size={36} className="group-hover:scale-110 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#D32F2F] text-white text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-white animate-bounce foster-font">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'status' ? 'text-[#2979FF]' : 'text-[#B0BEC5]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#E3F2FD] border-2 border-[#2979FF]' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Pop-up Animation) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#1A237E]/60 backdrop-blur-sm animate-slide-up">
                <div className="w-full max-w-md bg-white border-t-8 border-x-8 border-[#2979FF] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-lg rounded-t-[3rem] relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#FFD54F] text-[#3E2723] rounded-full border-4 border-white flex items-center justify-center hover:bg-[#FFCA28] transition-colors shadow-sm active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-8 border-[#2979FF] rounded-b-[2rem] bg-[#E3F2FD]">
                            {/* Product Image Animation in Modal */}
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover animate-image-pop" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#2979FF] text-white font-bold text-3xl foster-font rounded-xl border-4 border-white shadow-sm transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-base line-through text-[#90CAF9] decoration-white decoration-4 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32 relative overflow-hidden bg-[#FAFAFA]">
                        <h2 className="text-4xl fun-font text-[#1A237E] mb-6 leading-tight transform rotate-1 drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5 relative z-10">
                            {/* --- 🏷️ VARIANT SELECTOR (3 PRICES) --- */}
                            <div>
                                <label className="block text-lg font-bold text-[#1A237E] mb-3 foster-font ml-1 tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'MAC', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'BLOO', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'EDUARDO', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-xl border-4 transition-all flex flex-col items-center justify-between h-24 foster-font
                                                ${variant === v.key 
                                                    ? 'bg-[#FFD54F] border-[#FFA000] shadow-sm -translate-y-1 text-[#3E2723]' 
                                                    : 'bg-white border-[#90CAF9] text-[#2979FF] hover:border-[#1565C0] hover:text-[#1565C0]'}`}
                                        >
                                            <span className="text-xs font-bold tracking-widest">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
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
                            <div className="flex items-center justify-between py-4 mt-2 bg-[#E3F2FD] border-4 border-[#90CAF9] rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white border-2 border-[#2979FF] text-[#1565C0] rounded-full flex items-center justify-center hover:bg-[#E3F2FD] active:scale-90 transition-all font-black text-xl"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-4xl font-normal w-14 text-center text-[#1A237E] foster-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#2979FF] border-2 border-[#1565C0] text-white rounded-full flex items-center justify-center hover:bg-[#1565C0] active:scale-90 transition-all font-black text-xl"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[#1565C0] font-bold uppercase tracking-widest mb-1 foster-font">TOTAL</p>
                                    <p className="text-5xl font-normal text-[#1A237E] foster-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <label className="block text-lg font-bold text-[#1A237E] mb-2 foster-font ml-1 tracking-wide">MAC'S NOTE:</label>
                                <div className="relative">
                                    <textarea 
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="E.g., No sugar for Bloo..." 
                                        className="w-full p-4 pl-12 bg-white border-4 border-[#90CAF9] rounded-2xl font-bold text-[#1A237E] placeholder:text-[#9FA8DA] focus:outline-none focus:border-[#2979FF] focus:shadow-sm transition-all resize-none h-28 text-lg foster-font"
                                    />
                                    <div className="absolute top-4 left-4 text-[#2979FF]">
                                        <Icon name="pencil" size={24} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-[#FFF] border-4 border-[#2979FF] text-[#2979FF] font-bold text-xl rounded-xl active:scale-95 transition-all shadow-sm foster-font">
                                KEEP IN ROOM
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-bloo text-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                EAT NOW! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (The Trap) --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#1A237E]/60 backdrop-blur-sm animate-slide-up">
                 <div className="w-full max-w-md bg-[#FFF] border-t-8 border-[#2979FF] flex flex-col shadow-lg h-[85vh] rounded-t-[3rem] relative">
                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-2 bg-[#2979FF] rounded-full mx-auto opacity-20" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-4xl fun-font text-[#1A237E] drop-shadow-sm transform -rotate-2">Bloo's Stash</h2>
                         <div className="w-14 h-14 bg-[#FFD54F] text-[#3E2723] border-4 border-[#FFA000] rounded-xl flex items-center justify-center font-bold text-2xl foster-font shadow-sm">
                             <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-[#E3F2FD] rounded-2xl relative overflow-hidden shadow-sm">
                                 <div className="w-4 h-full absolute left-0 top-0 bg-[#2979FF]" />
                                 <img src={item.image_url} className="w-20 h-20 object-cover border-4 border-[#90CAF9] rounded-xl ml-4 bg-[#FAFAFA]" />
                                 <div className="flex-1">
                                     <div className="font-bold text-[#1A237E] text-xl leading-tight fun-font tracking-wide">
                                         {item.name} <span className="text-[#2979FF]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-sm font-bold mt-1">
                                         {item.variant !== 'normal' && <span className="bg-[#FFD54F] text-[#3E2723] px-2 py-0.5 border border-[#FFA000] rounded text-xs mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-[#1565C0] italic mt-1 text-xs">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#1565C0] text-2xl foster-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#FFEBEE] hover:bg-[#FFCDD2] flex items-center justify-center text-[#D32F2F] border-2 border-[#FFCDD2] rounded-xl transition-colors active:scale-90 shadow-sm">
                                     <Icon name="trash" size={20} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-[#90CAF9] font-bold text-xl foster-font">Box is empty...</div>
                         )}
                     </div>

                     <div className="p-8 bg-[#2979FF] border-t-4 border-[#1565C0] relative z-30 rounded-t-[2.5rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-[#BBDEFB]">
                             <div>
                                 <p className="text-sm text-[#E3F2FD] font-black uppercase tracking-widest foster-font">TOTAL COST</p>
                                 <p className="text-6xl font-normal text-[#FFF] fun-font drop-shadow-md">{cartTotal}.-</p>
                             </div>
                             <div className="w-20 h-20 bg-[#FFD54F] border-4 border-[#FFA000] rounded-full flex items-center justify-center text-[#3E2723] transform rotate-6 shadow-[0_4px_0_#FF6F00]">
                                 <Icon name="basket" size={40} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-bloo text-3xl active:scale-95 transition-all flex items-center justify-center gap-3 border-4 border-white">
                             <span>CHECKOUT!</span> <Icon name="check" size={32} strokeWidth={4} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#1A237E]/80 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-slide-up">
                <div className="w-full max-w-sm bg-[#FFFDE7] border-8 border-[#2979FF] p-8 text-center shadow-lg rounded-[2.5rem]">
                    <div className="w-28 h-28 bg-[#1565C0] text-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#90CAF9] shadow-sm">
                        <Icon name="flame" size={56} className="animate-dookdik" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-4xl fun-font text-[#1A237E] mb-2 leading-tight">WOW!</h3>
                            <p className="text-xl text-[#2979FF] mb-8 font-bold leading-tight foster-font">Add "{selectedProduct.name}" to Bloo's stash?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#FFD54F] text-[#3E2723] font-bold border-4 border-[#FFA000] shadow-sm active:scale-95 transition-all text-xl foster-font rounded-xl">YES, I WANT IT!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-[#2979FF] text-[#2979FF] font-bold text-lg active:scale-95 transition-transform hover:bg-[#E3F2FD] rounded-xl foster-font">JUST ADD</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl fun-font text-[#1A237E] mb-2 leading-tight">READY?</h3>
                            <p className="text-xl text-[#2979FF] mb-8 font-bold leading-tight foster-font">Time to eat with friends?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-[#2979FF] text-white font-bold border-4 border-[#1565C0] shadow-sm active:scale-95 transition-all text-xl foster-font rounded-xl">YES, LET'S GO!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-[#2979FF] text-[#2979FF] font-bold text-lg active:scale-95 transition-transform hover:bg-[#E3F2FD] rounded-xl foster-font">NOT YET!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}