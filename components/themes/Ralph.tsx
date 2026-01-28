import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Sugar Rush / Vanellope Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Candy Castle
    home: <path d="M4 22V9l8-7 8 7v13H4zm6-7h4v4h-4v-4z" />, 
    // Menu -> Candy Wrapper / List
    menu: <path d="M3 6h18M3 12h18M3 18h18" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Go-Kart / Racing Car
    basket: <path d="M3 14h18v6H3v-6zm2-4h4v2H5v-2zm10 0h4v2h-4v-2zM3 18h3v4H3v-4zm15 0h3v4h-3v-4z" />,
    // Clock -> Stopwatch / Timer
    clock: <path d="M12 2v2M12 22c4.97 0 9-4.03 9-9 0-4.97-4.03-9-9-9-4.97 0-9 4.03-9 9 0 4.97 4.03 9 9 9zm0-14v5l4 2" />,
    // Chef -> Crown (Princess Vanellope)
    chef: <path d="M2 20h20V8l-5 4-5-8-5 8-5-4v12z" />, 
    // Star -> Gold Coin
    star: <circle cx="12" cy="12" r="9" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Glitch / Turbo / Lightning
    flame: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
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
      {name === 'basket' && <><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></>} {/* Kart Wheels */}
      {name === 'star' && <path d="M12 7v10M7 12h10" strokeWidth="4" />} {/* Coin detail */}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#FCE4EC]" />;

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
    // Theme: Vanellope von Schweetz (Sugar Rush)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#3E2723]">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Mali:wght@400;700&family=VT323&display=swap');
            
            :root {
                --primary: #4DD0E1; /* Mint Green (Hoodie) */
                --primary-dark: #00BCD4;
                --secondary: #F50057; /* Candy Pink (Skirt/Licorice) */
                --accent: #FFEB3B; /* Gold Coin / Stars */
                --choco: #3E2723; /* Chocolate Text */
                --stroke: #FFFFFF; /* White Stroke for candy feel */
            }

            body {
                font-family: 'Mali', cursive;
                background-color: #FCE4EC; /* Pink Cream */
                /* --- 🍬 SPRINKLES / CANDY PATTERN --- */
                background-image: 
                    radial-gradient(#4DD0E1 15%, transparent 16%),
                    radial-gradient(#F50057 15%, transparent 16%),
                    radial-gradient(#FFEB3B 15%, transparent 16%);
                background-position: 0 0, 10px 10px, 20px 20px;
                background-size: 30px 30px;
                background-attachment: fixed;
            }

            .pixel-font {
                font-family: 'VT323', monospace;
                letter-spacing: 1px;
            }

            .bubbly-font {
                font-family: 'Fredoka One', cursive;
                letter-spacing: 0.5px;
            }

            /* --- ⚡ GLITCH ANIMATION --- */
            @keyframes glitch-skew {
                0% { transform: skew(0deg); }
                20% { transform: skew(-2deg); }
                40% { transform: skew(2deg); }
                60% { transform: skew(-1deg); }
                80% { transform: skew(1deg); }
                100% { transform: skew(0deg); }
            }

            .animate-glitch { animation: glitch-skew 0.5s infinite linear alternate-reverse; }

            @keyframes bounce-car {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
            }

            .animate-bounce-car { animation: bounce-car 0.2s infinite; }

            .btn-candy {
                background: linear-gradient(180deg, #F50057 0%, #C51162 100%);
                color: white;
                border: 4px solid white;
                border-radius: 999px;
                font-family: 'Fredoka One', cursive;
                box-shadow: 0 6px 0 #880E4F, 0 10px 10px rgba(0,0,0,0.2);
                transition: all 0.1s;
            }
            .btn-candy:active {
                transform: translateY(4px);
                box-shadow: 0 2px 0 #880E4F, 0 4px 4px rgba(0,0,0,0.2);
            }

            .item-card {
                background: white;
                border: 4px solid #4DD0E1;
                border-radius: 1.5rem;
                box-shadow: 6px 6px 0 #F50057;
                transition: all 0.2s;
                position: relative;
            }
            .item-card::after {
                content: '';
                position: absolute;
                top: 4px; right: 4px;
                width: 10px; height: 10px;
                background: white;
                border-radius: 50%;
                opacity: 0.5;
            }
            .item-card:active {
                transform: translate(3px, 3px);
                box-shadow: 3px 3px 0 #F50057;
            }

            .tab-btn {
                background: white;
                color: #3E2723;
                border: 4px solid #B2EBF2;
                border-radius: 1rem;
                transition: all 0.3s;
                font-family: 'Fredoka One', cursive;
            }
            .tab-btn.active {
                background: #4DD0E1;
                color: white;
                border-color: white;
                box-shadow: 0 4px 0 #0097A7;
                transform: translateY(-2px);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* --- Header (Sugar Rush Style) --- */}
        <header className="bg-[#4DD0E1] text-white pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-[0_8px_0_#0097A7] z-10 border-b-8 border-white">
             {/* Glitch Overlay */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" 
                  style={{
                      backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, #fff 2px, #fff 4px)`
                  }} 
             />
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#F50057] w-fit px-4 py-1.5 rounded-full border-4 border-white shadow-sm transform -rotate-2">
                         <span className="w-3 h-3 rounded-full bg-[#FFEB3B] animate-pulse"></span>
                         <p className="text-white text-xs font-black tracking-widest pixel-font uppercase">PLAYER 1: T-{tableLabel}</p>
                     </div>
                     <h1 className="text-3xl font-black tracking-wide leading-none mt-2 bubbly-font text-white drop-shadow-[2px_2px_0_#F50057] transform rotate-1">
                         {brand?.name || "Sugar Rush"}
                     </h1>
                 </div>
                 {/* Crown Icon */}
                 <div className="w-20 h-20 bg-white rounded-full border-[5px] border-[#F50057] flex items-center justify-center relative shadow-[0_4px_0_#F50057] transform rotate-3">
                     <Icon name="chef" className="text-[#F50057] w-12 h-12" />
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#4DD0E1] rounded-full border-4 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        👑
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-jelly">
                    {/* Hero Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-black rounded-[2rem] overflow-hidden shadow-[6px_6px_0_#F50057] mb-8 border-4 border-white p-1">
                             <div className="h-full w-full rounded-[1.8rem] overflow-hidden border-2 border-[#4DD0E1] relative">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                             </div>
                             <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 bg-[#FFEB3B] px-6 py-2 rounded-b-xl border-x-4 border-b-4 border-white shadow-lg">
                                 <span className="bubbly-font text-xl text-[#3E2723]">BONUS LEVEL!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                         <div>
                             <h2 className="text-3xl font-black text-[#F50057] bubbly-font transform -rotate-1 drop-shadow-sm">Race Fuel!</h2>
                             <p className="text-sm text-[#4DD0E1] font-bold ml-1 pixel-font tracking-wide bg-white px-2 rounded">POWER UP!</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#4DD0E1] text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#26C6DA] transition-colors bubbly-font border-4 border-white shadow-[0_4px_0_#0097A7] active:translate-y-[2px] active:shadow-none text-lg">
                             GO TO MENU <Icon name="flame" size={20} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#B2EBF2] border-b-4 border-[#4DD0E1]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#F50057] text-white text-xs font-black px-2 py-1 rounded-md border-2 border-white transform -rotate-6 shadow-sm pixel-font">
                                                GLITCH!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#3E2723] text-lg line-clamp-2 mb-1 leading-tight bubbly-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-xs text-gray-400 line-through decoration-[#F50057] decoration-2 font-bold pixel-font">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#4DD0E1] font-black text-2xl bubbly-font leading-none drop-shadow-[1px_1px_0_#0097A7]">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFEB3B] text-[#3E2723] border-4 border-white flex items-center justify-center rounded-full hover:bg-[#FDD835] transition-all shadow-[0_4px_0_#FBC02D] active:translate-y-1 active:shadow-none">
                                                 <Icon name="plus" size={20} strokeWidth={4} />
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
                <section className="animate-jelly pt-4">
                    <div className="relative mb-8 group">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#F50057]" />
                         </div>
                         <input type="text" placeholder="Search for candy..." className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border-4 border-[#4DD0E1] text-[#3E2723] placeholder:text-[#B2EBF2] focus:outline-none focus:border-[#F50057] focus:shadow-[0_4px_0_#F50057] transition-all text-xl font-bold bubbly-font" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-3 text-lg font-bold rounded-xl flex items-center gap-2 ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-24">
                        {filteredProducts?.map((p: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#B2EBF2] border-b-4 border-[#4DD0E1]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#3E2723] text-lg line-clamp-2 mb-1 leading-tight bubbly-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-xs text-gray-400 line-through decoration-[#F50057] decoration-2 font-bold pixel-font">{pricing.original}</span>}
                                                <span className="text-[#4DD0E1] font-black text-2xl bubbly-font leading-none drop-shadow-[1px_1px_0_#0097A7]">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFEB3B] text-[#3E2723] border-4 border-white flex items-center justify-center rounded-full hover:bg-[#FDD835] transition-all shadow-[0_4px_0_#FBC02D] active:translate-y-1 active:shadow-none">
                                                 <Icon name="plus" size={20} strokeWidth={4} />
                                             </button>
                                         </div>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- STATUS PAGE (Vanellope / Sugar Rush Theme) --- */}
{activeTab === 'status' && (
    <section className="animate-jelly pt-4 pb-24">
        {/* Header: Race Log */}
        <div className="mb-8 flex items-center justify-between bg-[#3E2723] p-6 border-4 border-[#F50057] rounded-[2rem] shadow-[6px_6px_0_#4DD0E1] relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#F50057] rounded-full border-4 border-white opacity-50"></div>
             <div className="relative z-10">
                 <h2 className="text-3xl font-black bubbly-font text-[#FFEB3B] drop-shadow-[2px_2px_0_#F50057]">Race Log</h2>
                 <p className="text-sm text-white font-bold mt-1 pixel-font tracking-wider">Pit Stop Status...</p>
             </div>
             {/* Basket Icon */}
             <div className="w-16 h-16 bg-[#4DD0E1] border-4 border-white rounded-full flex items-center justify-center animate-spin">
                 <Icon name="basket" className="text-white" size={32} />
             </div>
        </div>

        <div className="space-y-4">
            {ordersList?.map((o: any) => (
                <div key={o.id} className="bg-white p-5 border-4 border-[#4DD0E1] rounded-[2rem] relative overflow-hidden shadow-[6px_6px_0_#F50057]">
                    
                    {/* Header: Lap ID & Status */}
                    <div className="flex justify-between items-start mb-4">
                         <span className="text-sm text-[#F50057] font-black uppercase tracking-widest flex items-center gap-1 pixel-font">
                             Lap #{o.id.slice(-4)}
                         </span>
                         <span className={`px-3 py-1 text-sm font-black uppercase tracking-wide border-2 border-white flex items-center gap-1.5 bubbly-font shadow-sm rounded-lg transform -rotate-1 text-white
                             ${o.status === 'pending' ? 'bg-[#FFEB3B] text-[#3E2723]' : 'bg-[#4DD0E1]'}`}>
                             {o.status === 'pending' ? 'RACING...' : 'FINISHED!'}
                         </span>
                    </div>

                    {/* Order Items List */}
                    <div className="mb-3 space-y-1 bg-[#E0F7FA] p-4 border-2 border-[#B2EBF2] rounded-xl">
                        {o.order_items.map((i: any, idx: any) => {
                            // ✅ LOGIC: คำนวณราคาและส่วนลด
                            const quantity = i.quantity || 1;
                            const finalPriceTotal = i.price * quantity;
                            
                            const hasDiscount = (i.original_price && i.original_price > i.price) || (i.discount > 0);
                            
                            const originalPriceTotal = hasDiscount 
                                ? (i.original_price ? i.original_price * i.quantity : (i.price + (i.discount || 0)) * i.quantity) 
                                : finalPriceTotal;
                                
                            const discountAmount = originalPriceTotal - finalPriceTotal;

                            return (
                                <div key={idx} className="flex justify-between items-start text-lg text-[#3E2723] font-bold mb-2 border-b-2 border-dashed border-[#4DD0E1] pb-2 last:border-0 bubbly-font">
                                    
                                    {/* Left: Info */}
                                    <div className="flex flex-col items-start pr-2">
                                        <span className="leading-tight text-xl">{quantity}x {i.product_name}</span>
                                        
                                        {/* Variant Badge (Candy/Glitch Style) */}
                                        {i.variant !== 'normal' && (
                                            <span className={`text-[10px] bg-[#F50057] text-white px-2 py-0.5 rounded-sm border-2 border-white font-black mt-1 shadow-[2px_2px_0_#3E2723] uppercase tracking-wider transform -rotate-2 pixel-font`}>
                                                {i.variant === 'special' ? '🍬 SWEET' : i.variant === 'jumbo' ? '🍭 MEGA' : i.variant}
                                            </span>
                                        )}

                                        {/* Note */}
                                        {i.note && <span className="text-xs text-[#F50057] italic pixel-font mt-0.5">"{i.note}"</span>}
                                    </div>

                                    {/* Right: Price */}
                                    <div className="text-right flex flex-col items-end min-w-[80px]">
                                        {hasDiscount ? (
                                            <>
                                                {/* 🔥 ป้าย SAVE (Glitch/Star Style) */}
                                                <span className="text-[10px] text-[#3E2723] bg-[#FFEB3B] px-2 py-0.5 rounded-none font-black mb-1 shadow-sm border-2 border-[#3E2723] transform rotate-3 animate-pulse pixel-font">
                                                    SAVE -{discountAmount}
                                                </span>

                                                {/* ราคาเต็ม (ขีดฆ่า) */}
                                                <span className="text-sm text-[#B2EBF2] line-through decoration-[#F50057] decoration-4 sans-serif opacity-100 mb-0.5 font-bold">
                                                    {originalPriceTotal}
                                                </span>

                                                {/* ราคาจริง */}
                                                <span className="text-[#00BCD4] text-2xl leading-none drop-shadow-sm">
                                                    {finalPriceTotal}.-
                                                </span>
                                            </>
                                        ) : (
                                            // ราคาปกติ
                                            <span className="text-[#00BCD4] text-2xl">{finalPriceTotal}.-</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer: Total */}
                    <div className="flex justify-between items-center pt-2 border-t-4 border-[#4DD0E1]">
                         <span className="font-bold text-[#F50057] text-sm uppercase tracking-widest pixel-font">SCORE</span>
                         <span className="font-black text-[#3E2723] text-3xl bubbly-font">
                             {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                         </span>
                    </div>
                </div>
            ))}
            
            {/* Empty State */}
            {(!ordersList || ordersList.length === 0) && (
                 <div className="text-center py-12 opacity-50">
                    <div className="w-20 h-20 bg-[#E0F7FA] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#4DD0E1] animate-bounce">
                        <Icon name="search" size={40} className="text-[#4DD0E1]" />
                    </div>
                    <p className="pixel-font text-2xl text-[#3E2723]">Start your engines!</p>
                 </div>
            )}
        </div>
    </section>
)}

        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[75px] bg-[#4DD0E1] shadow-[0_8px_0_#0097A7] flex justify-around items-center px-4 z-[90] rounded-full border-4 border-white">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'home' ? 'text-white' : 'text-[#E0F7FA]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#F50057] border-2 border-white' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'menu' ? 'text-white' : 'text-[#E0F7FA]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#F50057] border-2 border-white' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* Big Cart Button */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#FFEB3B] rounded-full shadow-[0_6px_0_#FBC02D] flex items-center justify-center text-[#3E2723] border-4 border-white active:shadow-none active:translate-y-[6px] transition-all duration-100 z-20 group">
                     <Icon name="basket" size={32} className="group-hover:scale-110 transition-transform animate-bounce-car" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#F50057] text-white text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-white animate-pulse bubbly-font">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'status' ? 'text-white' : 'text-[#E0F7FA]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#F50057] border-2 border-white' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Recipe Card) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#3E2723]/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-full max-w-md bg-white border-t-8 border-x-8 border-[#F50057] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-[0_-10px_0_#C51162] rounded-t-[3rem] animate-in slide-in-from-bottom duration-300">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#FFEB3B] text-[#3E2723] rounded-full border-4 border-white flex items-center justify-center hover:bg-[#FDD835] transition-colors shadow-[2px_2px_0_#F9A825] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-8 border-[#F50057] rounded-b-[2rem] bg-[#B2EBF2]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#4DD0E1] text-white font-black text-3xl bubbly-font rounded-xl border-4 border-white shadow-[4px_4px_0_#0097A7] transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-base line-through text-[#006064] decoration-[#F50057] decoration-4 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32 relative overflow-hidden bg-[#FCE4EC]">
                        <h2 className="text-4xl bubbly-font text-[#F50057] mb-6 leading-tight transform rotate-1 drop-shadow-[1px_1px_0_white]">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5 relative z-10">
                            {/* --- 🏷️ VARIANT SELECTOR (3 PRICES) --- */}
                            <div>
                                <label className="block text-lg font-bold text-[#3E2723] mb-3 bubbly-font ml-1 tracking-wide">CHOOSE POWER-UP:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'MINI', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'SUPER', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'MEGA', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-xl border-4 transition-all flex flex-col items-center justify-between h-24 bubbly-font
                                                ${variant === v.key 
                                                    ? 'bg-[#FFEB3B] border-[#FBC02D] shadow-[3px_3px_0_#F57F17] -translate-y-1 text-[#3E2723]' 
                                                    : 'bg-white border-[#F8BBD0] text-[#F48FB1] hover:border-[#F50057] hover:text-[#F50057]'}`}
                                        >
                                            <span className="text-xs font-black tracking-widest">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-[#F50057] decoration-2 opacity-70">{v.original}</span>
                                                )}
                                                <span className="text-xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2 bg-white border-4 border-[#F50057] rounded-2xl p-4 shadow-[4px_4px_0_#C51162]">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-[#B2EBF2] border-4 border-white text-[#006064] rounded-full flex items-center justify-center hover:bg-[#80DEEA] active:scale-90 transition-all font-black text-xl"><Icon name="minus" strokeWidth={4} /></button>
                                    <span className="text-4xl font-black w-14 text-center text-[#3E2723] bubbly-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#4DD0E1] border-4 border-white text-white rounded-full flex items-center justify-center hover:bg-[#26C6DA] active:scale-90 transition-all font-black text-xl"><Icon name="plus" strokeWidth={4} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[#F50057] font-bold uppercase tracking-widest mb-1 pixel-font">COINS NEEDED</p>
                                    <p className="text-5xl font-black text-[#3E2723] bubbly-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <label className="block text-lg font-bold text-[#3E2723] mb-2 bubbly-font ml-1 tracking-wide">PIT CREW NOTES:</label>
                                <div className="relative">
                                    <textarea 
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="E.g., Extra nitro (sauce)..." 
                                        className="w-full p-4 pl-12 bg-white border-4 border-[#F8BBD0] rounded-2xl font-bold text-[#3E2723] placeholder:text-[#F48FB1] focus:outline-none focus:border-[#F50057] focus:shadow-[4px_4px_0_#F8BBD0] transition-all pixel-font resize-none h-28 text-lg"
                                    />
                                    <div className="absolute top-4 left-4 text-[#F50057]">
                                        <Icon name="pencil" size={24} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border-4 border-[#4DD0E1] text-[#4DD0E1] font-black text-xl rounded-xl active:scale-95 transition-all shadow-[4px_4px_0_#B2EBF2] bubbly-font">
                                ADD TO KART
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-candy text-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                START RACE! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (The Trap) --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#3E2723]/80 backdrop-blur-sm animate-in fade-in duration-300">
                 <div className="w-full max-w-md bg-[#FFF] border-t-8 border-[#F50057] flex flex-col shadow-[0_-10px_0_#C51162] h-[85vh] rounded-t-[3rem] animate-in slide-in-from-bottom duration-300 relative">
                     {/* Decorative Elements */}
                     <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                        <Icon name="basket" size={64} className="text-[#FFEB3B] animate-bounce-car" />
                     </div>

                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-2 bg-[#F50057] rounded-full mx-auto opacity-20" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-4xl bubbly-font text-[#3E2723] drop-shadow-[2px_2px_0_#F8BBD0] transform -rotate-2">Your Kart</h2>
                         <div className="w-14 h-14 bg-[#FFEB3B] text-[#3E2723] border-4 border-white rounded-xl flex items-center justify-center font-black text-2xl bubbly-font shadow-[3px_3px_0_#FBC02D]">
                             <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item: any, idx: any) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-[#4DD0E1] rounded-2xl relative overflow-hidden shadow-[4px_4px_0_#B2EBF2]">
                                 <div className="w-4 h-full absolute left-0 top-0 bg-[#4DD0E1]" />
                                 <img src={item.image_url} className="w-20 h-20 object-cover border-4 border-white rounded-xl ml-4 bg-[#E0F7FA]" />
                                 <div className="flex-1">
                                     <div className="font-bold text-[#3E2723] text-xl leading-tight bubbly-font tracking-wide">
                                         {item.name} <span className="text-[#F50057]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-sm font-bold mt-1">
                                         {item.variant !== 'normal' && <span className="bg-[#FFEB3B] text-[#3E2723] px-2 py-0.5 border-2 border-white rounded text-xs pixel-font mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-[#4DD0E1] italic mt-1 text-xs">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#F50057] text-2xl bubbly-font drop-shadow-[1px_1px_0_white]">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#FFEBEE] hover:bg-[#FFCDD2] flex items-center justify-center text-[#F50057] border-2 border-[#FFCDD2] rounded-xl transition-colors active:scale-90 shadow-sm">
                                     <Icon name="trash" size={20} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-[#F48FB1] pixel-font text-2xl animate-pulse">
                                 OUT OF FUEL! (Empty)
                             </div>
                         )}
                     </div>

                     <div className="p-8 bg-[#4DD0E1] border-t-4 border-white relative z-30 rounded-t-[2.5rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-white">
                             <div>
                                 <p className="text-sm text-white font-black uppercase tracking-widest pixel-font">HIGH SCORE</p>
                                 <p className="text-6xl font-black text-[#3E2723] bubbly-font drop-shadow-[3px_3px_0_white]">{cartTotal}.-</p>
                             </div>
                             <div className="w-20 h-20 bg-[#F50057] border-4 border-white rounded-full flex items-center justify-center text-white transform rotate-6 shadow-[4px_4px_0_#C51162]">
                                 <Icon name="basket" size={40} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-candy text-3xl active:scale-95 transition-all flex items-center justify-center gap-3">
                             <span>FINISH LINE!</span> <Icon name="check" size={32} strokeWidth={4} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#3E2723]/90 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
                <div className="w-full max-w-sm bg-[#4DD0E1] border-8 border-white p-8 text-center shadow-[10px_10px_0_#F50057] animate-in zoom-in duration-300 relative overflow-hidden rounded-[2.5rem]">
                    <div className="w-28 h-28 bg-[#F50057] text-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-[4px_4px_0_#C51162]">
                        <Icon name="flame" size={56} className="animate-glitch" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-4xl bubbly-font text-white mb-2 leading-tight text-shadow-sm">BONUS ROUND!</h3>
                            <p className="text-xl text-[#3E2723] mb-8 font-bold pixel-font leading-tight">Add "{selectedProduct.name}" to your kart?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#FFEB3B] text-[#3E2723] font-black border-4 border-white shadow-[4px_4px_0_#FBC02D] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl bubbly-font rounded-xl">YES, TURBO BOOST!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-[#B2EBF2] text-[#0097A7] font-black text-lg active:scale-95 transition-transform hover:bg-[#E0F7FA] pixel-font rounded-xl">JUST ADD TO KART</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl bubbly-font text-white mb-2 leading-tight text-shadow-sm">GAME OVER?</h3>
                            <p className="text-xl text-[#3E2723] mb-8 font-bold pixel-font leading-tight">Ready to cash in your coins?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-[#F50057] text-white font-black border-4 border-white shadow-[4px_4px_0_#C51162] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl bubbly-font rounded-xl">YES, WINNER!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-[#B2EBF2] text-[#0097A7] font-black text-lg active:scale-95 transition-transform hover:bg-[#E0F7FA] pixel-font rounded-xl">NOT YET!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}