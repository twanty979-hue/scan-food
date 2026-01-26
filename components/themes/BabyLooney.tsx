import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Baby Looney Tunes Style) ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Cloud House / Playpen
    home: <path d="M3 10L12 2l9 8v11a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V10z M12 12c-2 0-3 2-3 4s1 4 3 4 3-2 3-4-1-4-3-4z" />, 
    // Menu -> Baby Bottle
    menu: <path d="M7 2h10v3H7zM9 5h6v14a3 3 0 0 1-6 0V5z" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Toy Box / Basket
    basket: <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />,
    // Clock -> Rattle / Nap Time
    clock: <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z M12 6v6l4 2" />,
    // Chef -> Bib / Tweety
    chef: <path d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z M7 14c0 4 2 8 5 8s5-4 5-8" />, 
    // Star -> Twinkle Star
    star: <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Sparkle / Magic
    flame: <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    // Milk / Cookie
    cookie: <circle cx="12" cy="12" r="10" />
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
      {name === 'basket' && <path d="M8 12h8" opacity="0.5"/>}
      {name === 'cookie' && <><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="16" r="1" fill="currentColor"/></>}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#E1F5FE]" />;

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
    // Theme: Baby Looney Tunes (Playtime Snacks)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#455A64]">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Mali:wght@400;700&display=swap');
            
            :root {
                --primary: #B3E5FC; /* Baby Blue (Bugs) */
                --primary-dark: #0288D1;
                --secondary: #FFF9C4; /* Pastel Yellow (Tweety) */
                --accent: #F8BBD0; /* Soft Pink (Lola) */
                --text: #37474F; /* Soft Grey/Blue Text */
                --white: #FFFFFF;
            }

            body {
                font-family: 'Mali', cursive;
                background-color: #E1F5FE;
                /* --- ☁️ CLOUDS & DOTS PATTERN --- */
                background-image: 
                    radial-gradient(#B3E5FC 20%, transparent 20%),
                    radial-gradient(#F8BBD0 20%, transparent 20%);
                background-size: 40px 40px;
                background-position: 0 0, 20px 20px;
                background-attachment: fixed;
            }

            .bubbly-font {
                font-family: 'Fredoka', sans-serif;
            }

            /* --- ANIMATIONS --- */
            
            @keyframes bounce-in {
                0% { opacity: 0; transform: scale(0.8) translateY(10px); }
                60% { opacity: 1; transform: scale(1.05) translateY(-2px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-pop-in { animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

            @keyframes wiggle {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-10deg); }
                75% { transform: rotate(10deg); }
            }
            .hover-wiggle:active { animation: wiggle 0.3s ease-in-out; }

            @keyframes slide-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }

            @keyframes tick-tock {
                0% { transform: rotate(-5deg); }
                50% { transform: rotate(5deg); }
                100% { transform: rotate(-5deg); }
            }
            .animate-clock { animation: tick-tock 2s infinite ease-in-out; }

            /* ✨ NEW: Continuous Wiggle (Dook-Dik) Animation */
            @keyframes dookdik {
                0%, 100% { transform: rotate(-3deg) translateY(0); }
                50% { transform: rotate(3deg) translateY(-2px); }
            }
            .animate-dookdik { animation: dookdik 3s ease-in-out infinite; }

            .btn-baby {
                background: #FFF9C4;
                color: #F06292;
                border: 3px solid #F06292;
                border-radius: 1.5rem;
                font-family: 'Fredoka', sans-serif;
                box-shadow: 0 4px 0 #F8BBD0;
                transition: all 0.2s;
            }
            .btn-baby:active {
                transform: translateY(4px);
                box-shadow: 0 0 0 #F8BBD0;
            }

            .baby-card {
                background: white;
                border: 3px solid #B3E5FC;
                border-radius: 2rem;
                box-shadow: 0 4px 0 #81D4FA;
                transition: all 0.2s;
                position: relative;
                overflow: hidden;
            }
            .baby-card:active {
                transform: scale(0.98);
                box-shadow: 0 2px 0 #81D4FA;
            }

            .tab-btn {
                background: #FFFFFF;
                color: #546E7A;
                border: 3px solid #CFD8DC;
                border-radius: 1.5rem;
                transition: all 0.3s;
                font-family: 'Fredoka', sans-serif;
            }
            .tab-btn.active {
                background: #B3E5FC;
                color: #0277BD;
                border-color: #4FC3F7;
                box-shadow: 0 4px 0 #0288D1;
                transform: translateY(-2px);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* --- Header (Playtime Nursery) --- */}
        <header className="bg-[#B3E5FC] text-white pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-md z-10 border-b-4 border-white">
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-white w-fit px-4 py-1.5 rounded-full border-2 border-[#81D4FA] shadow-sm transform -rotate-1">
                         <span className="w-3 h-3 rounded-full bg-[#FFEB3B] animate-pulse"></span>
                         <p className="text-[#0277BD] text-xs font-bold tracking-wide bubbly-font uppercase">Play Date: {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl font-bold tracking-tight leading-none mt-2 bubbly-font text-[#01579B] drop-shadow-sm transform rotate-1">
                         {brand?.name || "Baby Looney Snacks"}
                     </h1>
                 </div>
                 {/* Chef Icon (Logo) with DookDik Animation */}
                 <div className="w-20 h-20 bg-white rounded-full border-4 border-[#F8BBD0] flex items-center justify-center relative shadow-sm animate-dookdik">
                     <Icon name="chef" className="text-[#F06292] w-12 h-12" />
                     <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#FFF9C4] rounded-full border-2 border-white flex items-center justify-center text-[#FBC02D] text-xs font-bold shadow-sm">
                        🍼
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
                        <div className="relative w-full h-56 bg-[#FFF9C4] rounded-[2rem] overflow-hidden shadow-sm mb-8 border-4 border-white p-2">
                             <div className="h-full w-full rounded-[1.5rem] overflow-hidden border-2 border-[#FFF176] relative">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover rounded-[1.3rem]" />
                             </div>
                             <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 bg-[#F8BBD0] px-6 py-2 rounded-b-2xl border-x-4 border-b-4 border-white shadow-md">
                                 <span className="bubbly-font text-xl text-white">Yummy Time!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                         <div>
                             <h2 className="text-3xl font-bold text-[#F48FB1] bubbly-font transform -rotate-2 drop-shadow-sm">Snack Time!</h2>
                             <p className="text-sm text-[#90A4AE] font-bold ml-1 tracking-wide bg-white px-2 rounded-full inline-block shadow-sm">For little tummies</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#B3E5FC] text-[#0277BD] px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#81D4FA] transition-colors bubbly-font border-4 border-white shadow-sm active:translate-y-[2px] active:shadow-none text-lg">
                             SEE FOOD <Icon name="menu" size={20} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="baby-card group cursor-pointer">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#FCE4EC] border-b-4 border-[#B3E5FC]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 rounded-t-[1.8rem]" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#FFF9C4] text-[#FBC02D] text-xs font-bold px-2 py-1 rounded-xl border-2 border-white transform -rotate-6 shadow-sm bubbly-font">
                                                ★ SPECIAL
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#546E7A] text-lg line-clamp-2 mb-1 leading-tight bubbly-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-xs text-gray-400 line-through decoration-[#F48FB1] decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#F06292] font-black text-2xl bubbly-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFF9C4] text-[#FBC02D] border-2 border-[#FFF59D] flex items-center justify-center rounded-full hover:bg-[#FFF176] transition-all shadow-sm active:scale-90">
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
                             <Icon name="search" className="text-[#81D4FA]" />
                         </div>
                         <input type="text" placeholder="Find baby snacks..." className="w-full pl-14 pr-6 py-4 rounded-3xl bg-white border-4 border-[#B3E5FC] text-[#546E7A] placeholder:text-[#CFD8DC] focus:outline-none focus:border-[#F48FB1] focus:shadow-sm transition-all text-xl font-bold bubbly-font" />
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
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="baby-card group cursor-pointer">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#FCE4EC] border-b-4 border-[#B3E5FC]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover rounded-t-[1.8rem]" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#546E7A] text-lg line-clamp-2 mb-1 leading-tight bubbly-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-xs text-gray-400 line-through decoration-[#F48FB1] decoration-2 font-bold">{pricing.original}</span>}
                                                <span className="text-[#F06292] font-black text-2xl bubbly-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFF9C4] text-[#FBC02D] border-2 border-[#FFF59D] flex items-center justify-center rounded-full hover:bg-[#FFF176] transition-all shadow-sm active:scale-90">
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

            {/* --- STATUS PAGE (Bubbly/Pink Theme) --- */}
{activeTab === 'status' && (
    <section className="animate-slide-up pt-4 pb-24">
        {/* Header: Nap Log */}
        <div className="mb-8 flex items-center justify-between bg-[#F8BBD0] p-6 border-4 border-white rounded-[2rem] shadow-sm relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#F48FB1] rounded-full border-4 border-white opacity-50"></div>
             <div className="relative z-10">
                 <h2 className="text-3xl font-bold bubbly-font text-white drop-shadow-sm">Nap Log</h2>
                 <p className="text-sm text-[#880E4F] font-bold mt-1 tracking-wider">Waiting for food...</p>
             </div>
             {/* Clock Animation */}
             <div className="w-16 h-16 bg-white border-4 border-[#F8BBD0] rounded-full flex items-center justify-center animate-clock">
                 <Icon name="clock" className="text-[#F48FB1]" size={32} />
             </div>
        </div>

        <div className="space-y-4">
            {ordersList?.map((o) => (
                <div key={o.id} className="bg-white p-5 border-4 border-[#B3E5FC] rounded-[2rem] relative overflow-hidden shadow-sm">
                    
                    {/* Header: Ticket ID & Status */}
                    <div className="flex justify-between items-start mb-4">
                         <span className="text-sm text-[#0277BD] font-bold uppercase tracking-widest flex items-center gap-1 bubbly-font">
                             Ticket #{o.id.slice(-4)}
                         </span>
                         <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wide border-2 flex items-center gap-1.5 bubbly-font shadow-sm rounded-lg transform -rotate-1
                             ${o.status === 'pending' ? 'bg-[#FFF9C4] text-[#FBC02D] border-[#FFF176]' : 'bg-[#E1F5FE] text-[#0288D1] border-[#81D4FA]'}`}>
                             {o.status === 'pending' ? 'COOKING...' : 'READY!'}
                         </span>
                    </div>

                    {/* Order Items List */}
                    <div className="mb-3 space-y-1 bg-[#F3E5F5] p-4 border-2 border-[#E1BEE7] rounded-xl">
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
                                <div key={idx} className="flex justify-between items-start text-lg text-[#546E7A] font-bold mb-2 border-b border-dashed border-[#CE93D8] pb-2 last:border-0 bubbly-font">
                                    
                                    {/* Left: Info */}
                                    <div className="flex flex-col items-start pr-2">
                                        <span className="leading-tight text-xl">{quantity}x {i.product_name}</span>
                                        
                                        {/* Variant Badge (Cute Bubble Style) */}
                                        {i.variant !== 'normal' && (
                                            <span className={`text-[10px] bg-[#AB47BC] text-white px-2 py-0.5 rounded-full border border-white font-sans font-bold mt-1 shadow-sm uppercase tracking-wider transform -rotate-2`}>
                                                {i.variant === 'special' ? '✨ SPECIAL' : i.variant === 'jumbo' ? '🎈 JUMBO' : i.variant}
                                            </span>
                                        )}

                                        {/* Note */}
                                        {i.note && <span className="text-xs text-[#AB47BC] italic sans-serif mt-0.5">"{i.note}"</span>}
                                    </div>

                                    {/* Right: Price */}
                                    <div className="text-right flex flex-col items-end min-w-[80px]">
                                        {hasDiscount ? (
                                            <>
                                                {/* 🔥 ป้าย SAVE (Pop Style) */}
                                                <span className="text-[10px] text-white bg-[#EC407A] px-2 py-0.5 rounded-full font-sans font-bold mb-1 shadow-sm border border-white transform rotate-3 animate-pulse">
                                                    SAVE -{discountAmount}
                                                </span>

                                                {/* ราคาเต็ม (ขีดฆ่า) */}
                                                <span className="text-sm text-[#90A4AE] line-through decoration-[#EC407A] decoration-2 sans-serif opacity-70 mb-0.5 font-bold">
                                                    {originalPriceTotal}
                                                </span>

                                                {/* ราคาจริง */}
                                                <span className="text-[#8E24AA] text-2xl leading-none drop-shadow-sm">
                                                    {finalPriceTotal}.-
                                                </span>
                                            </>
                                        ) : (
                                            // ราคาปกติ
                                            <span className="text-[#8E24AA] text-2xl">{finalPriceTotal}.-</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer: Total */}
                    <div className="flex justify-between items-center pt-2 border-t-2 border-[#B3E5FC]">
                         <span className="font-bold text-[#0288D1] text-sm uppercase tracking-widest bubbly-font">TOTAL</span>
                         <span className="font-black text-[#01579B] text-3xl bubbly-font drop-shadow-sm">
                             {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                         </span>
                    </div>
                </div>
            ))}
            
            {/* Empty State */}
            {(!ordersList || ordersList.length === 0) && (
                 <div className="text-center py-12 opacity-50">
                    <div className="w-20 h-20 bg-[#F3E5F5] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#AB47BC]">
                        <Icon name="search" size={40} className="text-[#AB47BC]" />
                    </div>
                    <p className="bubbly-font text-2xl text-[#8E24AA]">Hungry...</p>
                 </div>
            )}
        </div>
    </section>
)}

        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[75px] bg-white shadow-lg flex justify-around items-center px-4 z-[90] rounded-full border-4 border-[#B3E5FC]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'home' ? 'text-[#F06292]' : 'text-[#CFD8DC]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#FCE4EC] border-2 border-[#F48FB1]' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'menu' ? 'text-[#F06292]' : 'text-[#CFD8DC]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#FCE4EC] border-2 border-[#F48FB1]' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* Big Cart Button with DookDik Animation */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#81D4FA] rounded-full shadow-md flex items-center justify-center text-white border-4 border-white active:scale-95 transition-all duration-100 z-20 group animate-dookdik">
                     <Icon name="basket" size={36} className="group-hover:scale-110 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#F50057] text-white text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-white animate-bounce bubbly-font">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'status' ? 'text-[#F06292]' : 'text-[#CFD8DC]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#FCE4EC] border-2 border-[#F48FB1]' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Pop-up Animation) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#546E7A]/60 backdrop-blur-sm animate-pop-in">
                <div className="w-full max-w-md bg-white border-t-8 border-x-8 border-[#B3E5FC] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-lg rounded-t-[3rem] relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#FFEB3B] text-[#F57F17] rounded-full border-4 border-white flex items-center justify-center hover:bg-[#FFF59D] transition-colors shadow-sm active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-8 border-[#B3E5FC] rounded-b-[2rem] bg-[#E1F5FE]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#F06292] text-white font-bold text-3xl bubbly-font rounded-xl border-4 border-white shadow-sm transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-base line-through text-[#F8BBD0] decoration-white decoration-4 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32 relative overflow-hidden bg-[#FAFAFA]">
                        <h2 className="text-4xl bubbly-font text-[#0277BD] mb-6 leading-tight transform rotate-1 drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5 relative z-10">
                            {/* --- 🏷️ VARIANT SELECTOR (3 PRICES) --- */}
                            <div>
                                <label className="block text-lg font-bold text-[#546E7A] mb-3 bubbly-font ml-1 tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'BABY', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'MOMMY', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'DADDY', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-xl border-4 transition-all flex flex-col items-center justify-between h-24 bubbly-font
                                                ${variant === v.key 
                                                    ? 'bg-[#FFF9C4] border-[#FBC02D] shadow-sm -translate-y-1 text-[#E65100]' 
                                                    : 'bg-white border-[#F48FB1] text-[#F06292] hover:border-[#EC407A] hover:text-[#EC407A]'}`}
                                        >
                                            <span className="text-xs font-bold tracking-widest">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-[#F50057] decoration-2 opacity-70">{v.original}</span>
                                                )}
                                                <span className="text-xl font-normal">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2 bg-[#E3F2FD] border-4 border-[#B3E5FC] rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white border-2 border-[#81D4FA] text-[#0277BD] rounded-full flex items-center justify-center hover:bg-[#E1F5FE] active:scale-90 transition-all font-black text-xl"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-4xl font-normal w-14 text-center text-[#455A64] bubbly-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#81D4FA] border-2 border-[#4FC3F7] text-white rounded-full flex items-center justify-center hover:bg-[#4FC3F7] active:scale-90 transition-all font-black text-xl"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[#0288D1] font-bold uppercase tracking-widest mb-1 bubbly-font">TOTAL</p>
                                    <p className="text-5xl font-normal text-[#01579B] bubbly-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <label className="block text-lg font-bold text-[#546E7A] mb-2 bubbly-font ml-1 tracking-wide">SPECIAL REQUESTS:</label>
                                <div className="relative">
                                    <textarea 
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="E.g., No veggies, Extra milk..." 
                                        className="w-full p-4 pl-12 bg-white border-4 border-[#F8BBD0] rounded-2xl font-bold text-[#546E7A] placeholder:text-[#F48FB1] focus:outline-none focus:border-[#F06292] focus:shadow-sm transition-all resize-none h-28 text-lg bubbly-font"
                                    />
                                    <div className="absolute top-4 left-4 text-[#F06292]">
                                        <Icon name="pencil" size={24} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-[#FFF] border-4 border-[#F06292] text-[#EC407A] font-bold text-xl rounded-xl active:scale-95 transition-all shadow-sm bubbly-font">
                                ADD TO TOY BOX
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-baby text-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                EAT NOW! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (The Trap) --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#546E7A]/60 backdrop-blur-sm animate-slide-up">
                 <div className="w-full max-w-md bg-[#FFF] border-t-8 border-[#F06292] flex flex-col shadow-lg h-[85vh] rounded-t-[3rem] relative">
                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-2 bg-[#F06292] rounded-full mx-auto opacity-20" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-4xl bubbly-font text-[#EC407A] drop-shadow-sm transform -rotate-2">Your Toys</h2>
                         <div className="w-14 h-14 bg-[#FFF9C4] text-[#F9A825] border-4 border-[#FBC02D] rounded-xl flex items-center justify-center font-bold text-2xl bubbly-font shadow-sm">
                             <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-[#E1F5FE] rounded-2xl relative overflow-hidden shadow-sm">
                                 <div className="w-4 h-full absolute left-0 top-0 bg-[#4FC3F7]" />
                                 <img src={item.image_url} className="w-20 h-20 object-cover border-4 border-[#B3E5FC] rounded-xl ml-4 bg-[#FAFAFA]" />
                                 <div className="flex-1">
                                     <div className="font-bold text-[#455A64] text-xl leading-tight bubbly-font tracking-wide">
                                         {item.name} <span className="text-[#0288D1]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-sm font-bold mt-1">
                                         {item.variant !== 'normal' && <span className="bg-[#FFF9C4] text-[#F9A825] px-2 py-0.5 border border-[#FBC02D] rounded text-xs mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-[#0277BD] italic mt-1 text-xs">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#01579B] text-2xl bubbly-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#FFEBEE] hover:bg-[#FFCDD2] flex items-center justify-center text-[#D32F2F] border-2 border-[#FFCDD2] rounded-xl transition-colors active:scale-90 shadow-sm">
                                     <Icon name="trash" size={20} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-[#B0BEC5] font-bold text-xl bubbly-font">Toy box is empty...</div>
                         )}
                     </div>

                     <div className="p-8 bg-[#81D4FA] border-t-4 border-[#4FC3F7] relative z-30 rounded-t-[2.5rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-[#E1F5FE]">
                             <div>
                                 <p className="text-sm text-[#01579B] font-black uppercase tracking-widest bubbly-font">TOTAL</p>
                                 <p className="text-6xl font-normal text-[#FFF] bubbly-font drop-shadow-md">{cartTotal}.-</p>
                             </div>
                             <div className="w-20 h-20 bg-[#FFF9C4] border-4 border-[#FBC02D] rounded-full flex items-center justify-center text-[#F57F17] transform rotate-6 shadow-sm">
                                 <Icon name="basket" size={40} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-baby text-3xl active:scale-95 transition-all flex items-center justify-center gap-3 border-4 border-white">
                             <span>LET'S PLAY!</span> <Icon name="check" size={32} strokeWidth={4} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#455A64]/80 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-pop-in">
                <div className="w-full max-w-sm bg-[#FFFDE7] border-8 border-[#F06292] p-8 text-center shadow-lg rounded-[2.5rem]">
                    <div className="w-28 h-28 bg-[#81D4FA] text-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#4FC3F7] shadow-sm">
                        <Icon name="flame" size={56} className="animate-wiggle" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-4xl bubbly-font text-[#AD1457] mb-2 leading-tight">YAY!</h3>
                            <p className="text-xl text-[#F06292] mb-8 font-bold leading-tight bubbly-font">Add "{selectedProduct.name}" to your toys?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#FFF9C4] text-[#E65100] font-bold border-4 border-[#FBC02D] shadow-sm active:scale-95 transition-all text-xl bubbly-font rounded-xl">YES, PLAY!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-[#F48FB1] text-[#F06292] font-bold text-lg active:scale-95 transition-transform hover:bg-[#FCE4EC] rounded-xl bubbly-font">JUST ADD</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl bubbly-font text-[#AD1457] mb-2 leading-tight">READY?</h3>
                            <p className="text-xl text-[#F06292] mb-8 font-bold leading-tight bubbly-font">Time to play with snacks?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-[#F06292] text-white font-bold border-4 border-[#EC407A] shadow-sm active:scale-95 transition-all text-xl bubbly-font rounded-xl">YES, GO!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-[#F48FB1] text-[#F06292] font-bold text-lg active:scale-95 transition-transform hover:bg-[#FCE4EC] rounded-xl bubbly-font">NOT YET!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}