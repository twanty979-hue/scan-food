import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Scooby-Doo Mystery Style) ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Haunted House / Van
    home: <path d="M2 22 12 2l10 20H2zM12 6v4M10 14h4" />, 
    // Menu -> Clue List
    menu: <path d="M3 6h18M3 12h18M3 18h18" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Scooby Snack Box / Dog Bowl
    basket: <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2 M9 14h6" />,
    // Clock -> Pocket Watch / Ghost Hour
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Dog Collar / Paw
    chef: <path d="M12 2c-4 0-8 4-8 9 0 4.5 3.5 8 8 8s8-3.5 8-8c0-5-4-9-8-9zm0 14c-1.5 0-3-1-3-2.5S10.5 11 12 11s3 1 3 2.5S13.5 16 12 16z" />, 
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Ghost / Spooky
    flame: <path d="M9 22h6c3.31 0 6-2.69 6-6V9c0-3.31-2.69-6-6-6H9C5.69 3 3 5.69 3 9v7c0 3.31 2.69 6 6 6zm3-11c1.38 0 2.5 1.12 2.5 2.5S13.38 16 12 16s-2.5-1.12-2.5-2.5S10.62 11 12 11z" />,
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    // Bone icon for fun
    bone: <path d="M17 4c-1.66 0-3 1.34-3 3 0 .2.02.38.06.56C13.56 7.22 12.82 7 12 7c-.82 0-1.56.22-2.06.56.04-.18.06-.36.06-.56 0-1.66-1.34-3-3-3s-3 1.34-3 3c0 1.28.8 2.37 1.94 2.8C5.28 10.4 5 11.16 5 12c0 1.66 1.34 3 3 3 1.66 0 3-1.34 3-3 0-.2-.02-.38-.06-.56.5-.34 1.24-.56 2.06-.56.82 0 1.56.22 2.06.56-.04.18-.06.36-.06.56 0 1.66 1.34 3 3 3s3-1.34 3-3c0-.84-.28-1.6-.74-2.2C21.2 12.37 22 11.28 22 10c0-1.66-1.34-3-3-3-.84 0-1.6.28-2.2.74C16.6 7.28 15.8 6.4 16 5.5 16.2 4.6 17 4 17 4z" />
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
      {name === 'basket' && <><path d="m8 10 1 4" /><path d="m16 10-1 4" /></>}
      {name === 'clock' && <path d="M12 6v6l4 2" />}
    </svg>
  );
};

// Flower Pattern for Mystery Machine vibes
const MysteryFlower = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        <path d="M50 35 C35 10, 15 35, 35 50 C15 65, 35 90, 50 65 C65 90, 85 65, 65 50 C85 35, 65 10, 50 35" />
        <circle cx="50" cy="50" r="10" />
    </svg>
);

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
  const [variant, setVariant] = useState('normal'); // 'normal', 'special', 'jumbo'
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#2D1B4E]" />;

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
    // Theme: Scooby Doo (Mystery Machine)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#2D1B4E]">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Creepster&family=Mali:wght@400;700&display=swap');
            
            :root {
                --primary: #36B5B0; /* Mystery Machine Teal */
                --primary-dark: #008080;
                --secondary: #7452A3; /* Daphne Purple */
                --accent: #99CC33; /* Lime Green */
                --alert: #F28F1C; /* Fred Orange */
                --stroke: #000000; /* Comic Black Stroke */
            }

            body {
                font-family: 'Mali', cursive;
                background-color: #2D1B4E; /* Night Sky Purple */
                background-image: 
                    radial-gradient(circle at 50% 50%, #3a2363 20%, transparent 20%), 
                    radial-gradient(circle at 0% 0%, #3a2363 20%, transparent 20%);
                background-size: 60px 60px;
                background-attachment: fixed;
            }

            .spooky-font {
                font-family: 'Creepster', cursive;
                letter-spacing: 2px;
            }

            .comic-font {
                font-family: 'Bangers', cursive;
                letter-spacing: 1px;
            }

            @keyframes shake {
                0% { transform: rotate(0deg); }
                25% { transform: rotate(2deg); }
                50% { transform: rotate(0deg); }
                75% { transform: rotate(-2deg); }
                100% { transform: rotate(0deg); }
            }

            .animate-shake { animation: shake 0.5s infinite; }

            @keyframes pop-in {
                0% { transform: scale(0.8); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }

            .animate-pop { animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

            .btn-mystery {
                background: #F28F1C; 
                color: black;
                border: 3px solid #000;
                border-radius: 1rem;
                font-family: 'Bangers', cursive;
                font-size: 1.2rem;
                box-shadow: 4px 4px 0px #000;
                transition: all 0.1s;
            }
            .btn-mystery:active {
                transform: translate(4px, 4px);
                box-shadow: 0px 0px 0px #000;
            }

            .mystery-card {
                background: white;
                border: 4px solid #000;
                border-radius: 1.5rem;
                box-shadow: 6px 6px 0px #36B5B0;
                transition: all 0.2s;
            }
            .mystery-card:active {
                transform: translate(3px, 3px);
                box-shadow: 3px 3px 0px #36B5B0;
            }

            .tab-btn {
                background: #36B5B0;
                color: #2D1B4E;
                border: 3px solid #000;
                border-radius: 1rem;
                transition: all 0.3s;
                font-family: 'Bangers', cursive;
                letter-spacing: 1px;
            }
            .tab-btn.active {
                background: #99CC33;
                color: black;
                box-shadow: 4px 4px 0px #000;
                transform: rotate(-3deg);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* --- Header (Mystery Machine Style) --- */}
        <header className="bg-[#36B5B0] text-white pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-[0_8px_0_#7452A3] z-10 border-b-4 border-black">
             {/* Decorative Flowers */}
             <MysteryFlower className="absolute top-2 right-4 w-24 h-24 text-[#F28F1C] opacity-80 animate-pulse" />
             <MysteryFlower className="absolute bottom-2 left-[-20px] w-32 h-32 text-[#99CC33] opacity-60" />
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#7452A3] w-fit px-4 py-1.5 rounded-full border-2 border-black shadow-[3px_3px_0_black] transform -rotate-2">
                         <span className="w-3 h-3 rounded-full bg-[#99CC33] animate-ping border border-black"></span>
                         <p className="text-white text-xs font-black tracking-widest comic-font uppercase text-shadow">TABLE {tableLabel}</p>
                     </div>
                     <h1 className="text-4xl font-black tracking-wide leading-none mt-2 spooky-font text-[#99CC33] drop-shadow-[3px_3px_0_black] transform rotate-1">
                         {brand?.name || "MYSTERY EATS"}
                     </h1>
                 </div>
                 {/* Dog Collar Icon */}
                 <div className="w-20 h-20 bg-[#F28F1C] rounded-full border-4 border-black flex items-center justify-center relative shadow-[4px_4px_0px_black] transform rotate-3">
                     <div className="bg-[#36B5B0] w-14 h-14 rounded-full flex items-center justify-center border-2 border-black">
                        <span className="comic-font text-3xl text-black font-black">SD</span>
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-pop">
                    {/* Hero Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-black rounded-[2rem] overflow-hidden shadow-[8px_8px_0_#99CC33] mb-8 border-4 border-black p-1">
                             <div className="h-full w-full rounded-[1.8rem] overflow-hidden border-2 border-white relative">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover opacity-90" />
                             </div>
                             <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 bg-[#F28F1C] px-6 py-2 rounded-b-xl border-x-4 border-b-4 border-black shadow-lg">
                                 <span className="comic-font text-xl text-black">MYSTERY SPECIAL!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                         <div>
                             <h2 className="text-4xl spooky-font text-[#99CC33] drop-shadow-[2px_2px_0_black] transform -rotate-1">ZOINKS! SNACKS!</h2>
                             <p className="text-sm text-[#F28F1C] font-bold ml-1 comic-font tracking-wide">For hungry detectives...</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#7452A3] text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#5E3D85] transition-colors comic-font border-4 border-black shadow-[4px_4px_0_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-lg">
                             CLUES <Icon name="menu" size={20} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="mystery-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#36B5B0] border-b-4 border-black">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-all duration-300" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#F28F1C] text-black text-xs font-black px-2 py-1 rounded-md border-2 border-black transform -rotate-6 shadow-[2px_2px_0_black] comic-font">
                                                SAVE!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-black text-lg line-clamp-2 mb-1 leading-tight comic-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-xs text-gray-500 line-through decoration-red-600 decoration-4 font-bold comic-font">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#7452A3] font-black text-2xl comic-font leading-none drop-shadow-[1px_1px_0_#99CC33]">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#99CC33] text-black border-2 border-black flex items-center justify-center rounded-lg hover:bg-[#88B82D] transition-all shadow-[2px_2px_0_black] active:translate-y-1 active:shadow-none">
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
                <section className="animate-pop pt-4">
                    <div className="relative mb-8 group">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#7452A3]" />
                         </div>
                         <input type="text" placeholder="Search for clues..." className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border-4 border-black text-black placeholder:text-gray-400 focus:outline-none focus:border-[#99CC33] focus:shadow-[4px_4px_0_#99CC33] transition-all text-xl font-bold comic-font" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-3 text-xl font-bold rounded-xl flex items-center gap-2 ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-24">
                        {filteredProducts?.map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="mystery-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#36B5B0] border-b-4 border-black">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-black text-lg line-clamp-2 mb-1 leading-tight comic-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-xs text-gray-500 line-through decoration-red-600 decoration-4 font-bold comic-font">{pricing.original}</span>}
                                                <span className="text-[#7452A3] font-black text-2xl comic-font leading-none drop-shadow-[1px_1px_0_#99CC33]">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#99CC33] text-black border-2 border-black flex items-center justify-center rounded-lg hover:bg-[#88B82D] transition-all shadow-[2px_2px_0_black] active:translate-y-1 active:shadow-none">
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

            {/* --- STATUS PAGE (Scooby-Doo / Mystery Theme) --- */}
{activeTab === 'status' && (
    <section className="animate-pop pt-4 pb-24">
        {/* Header: Clue Log */}
        <div className="mb-8 flex items-center justify-between bg-[#2D1B4E] p-6 border-4 border-[#99CC33] rounded-[2rem] shadow-[6px_6px_0_#7452A3] relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#7452A3] rounded-full border-4 border-[#99CC33] opacity-50"></div>
             <div className="relative z-10">
                 <h2 className="text-4xl spooky-font text-[#99CC33] drop-shadow-[2px_2px_0_black]">Clue Log</h2>
                 <p className="text-sm text-[#36B5B0] font-bold mt-1 comic-font tracking-wider">Solving the mystery...</p>
             </div>
             {/* Search Icon */}
             <div className="w-16 h-16 bg-[#F28F1C] border-4 border-black rounded-full flex items-center justify-center animate-spin-slow">
                 <Icon name="search" className="text-black" size={32} />
             </div>
        </div>

        <div className="space-y-4">
            {ordersList?.map((o) => (
                <div key={o.id} className="bg-white p-5 border-4 border-black rounded-[2rem] relative overflow-hidden shadow-[6px_6px_0_#99CC33]">
                    
                    {/* Header: Case ID & Status */}
                    <div className="flex justify-between items-start mb-4">
                         <span className="text-sm text-[#7452A3] font-black uppercase tracking-widest flex items-center gap-1 comic-font">
                             Case #{o.id.slice(-4)}
                         </span>
                         <span className={`px-3 py-1 text-sm font-black uppercase tracking-wide border-2 border-black flex items-center gap-1.5 comic-font shadow-[2px_2px_0_black] rounded-lg transform -rotate-1
                             ${o.status === 'pending' ? 'bg-[#F28F1C] text-black' : 'bg-[#99CC33] text-black'}`}>
                             {o.status === 'pending' ? 'INVESTIGATING...' : 'SOLVED!'}
                         </span>
                    </div>

                    {/* Order Items List */}
                    <div className="mb-3 space-y-1 bg-[#F1F8E9] p-4 border-2 border-black rounded-xl">
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
                                <div key={idx} className="flex justify-between items-start text-lg text-black font-bold mb-2 border-b-2 border-dashed border-gray-300 pb-2 last:border-0 comic-font">
                                    
                                    {/* Left: Info */}
                                    <div className="flex flex-col items-start pr-2">
                                        <span className="leading-tight text-xl">{quantity}x {i.product_name}</span>
                                        
                                        {/* Variant Badge (Mystery Machine Style) */}
                                        {i.variant !== 'normal' && (
                                            <span className={`text-[10px] bg-[#36B5B0] text-black px-2 py-0.5 rounded-sm border-2 border-black font-black mt-1 shadow-[2px_2px_0_black] uppercase tracking-wider transform -rotate-1 comic-font`}>
                                                {i.variant === 'special' ? 'ZOINKS!' : i.variant === 'jumbo' ? 'JINKIES!' : i.variant}
                                            </span>
                                        )}

                                        {/* Note */}
                                        {i.note && <span className="text-xs text-[#7452A3] italic sans-serif mt-0.5">"{i.note}"</span>}
                                    </div>

                                    {/* Right: Price */}
                                    <div className="text-right flex flex-col items-end min-w-[80px]">
                                        {hasDiscount ? (
                                            <>
                                                {/* 🔥 ป้าย SAVE (Scooby Snack Style) */}
                                                <span className="text-[10px] text-black bg-[#99CC33] px-2 py-0.5 rounded-none font-black mb-1 shadow-[1px_1px_0_black] border-2 border-black transform rotate-2 animate-bounce">
                                                    SAVE -{discountAmount}
                                                </span>

                                                {/* ราคาเต็ม (ขีดฆ่า) */}
                                                <span className="text-sm text-gray-500 line-through decoration-[#F28F1C] decoration-4 sans-serif opacity-100 mb-0.5 font-bold">
                                                    {originalPriceTotal}
                                                </span>

                                                {/* ราคาจริง */}
                                                <span className="text-[#7452A3] text-2xl leading-none drop-shadow-sm">
                                                    {finalPriceTotal}.-
                                                </span>
                                            </>
                                        ) : (
                                            // ราคาปกติ
                                            <span className="text-[#F28F1C] text-2xl drop-shadow-[1px_1px_0_black]">{finalPriceTotal}.-</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer: Total */}
                    <div className="flex justify-between items-center pt-2 border-t-4 border-black">
                         <span className="font-bold text-[#7452A3] text-sm uppercase tracking-widest comic-font">TOTAL CLUES</span>
                         <span className="font-black text-black text-3xl comic-font">
                             {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                         </span>
                    </div>
                </div>
            ))}
            
            {/* Empty State */}
            {(!ordersList || ordersList.length === 0) && (
                 <div className="text-center py-12 opacity-50">
                    <div className="w-20 h-20 bg-[#F1F8E9] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-black">
                        <Icon name="search" size={40} className="text-[#7452A3]" />
                    </div>
                    <p className="spooky-font text-2xl text-[#2D1B4E]">Looks like a ghost town...</p>
                 </div>
            )}
        </div>
    </section>
)}

        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[75px] bg-[#36B5B0] shadow-[0_8px_0_#2D1B4E] flex justify-around items-center px-4 z-[90] rounded-full border-4 border-black">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'home' ? 'text-black' : 'text-[#2D1B4E]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#99CC33] border-2 border-black' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'menu' ? 'text-black' : 'text-[#2D1B4E]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#99CC33] border-2 border-black' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* Big Cart Button */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#F28F1C] rounded-full shadow-[0_6px_0_black] flex items-center justify-center text-black border-4 border-black active:shadow-none active:translate-y-[6px] transition-all duration-100 z-20 group">
                     <Icon name="basket" size={32} className="group-hover:scale-110 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#7452A3] text-white text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-black animate-bounce comic-font">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'status' ? 'text-black' : 'text-[#2D1B4E]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#99CC33] border-2 border-black' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Trap Card) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#2D1B4E]/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-full max-w-md bg-white border-t-4 border-x-4 border-black h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-[0_-10px_0_#99CC33] rounded-t-[3rem] animate-in slide-in-from-bottom duration-300">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#F28F1C] text-black rounded-full border-4 border-black flex items-center justify-center hover:bg-[#ffaa4d] transition-colors shadow-[2px_2px_0_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-4 border-black rounded-b-[2rem] bg-[#36B5B0]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#99CC33] text-black font-black text-3xl comic-font rounded-xl border-4 border-black shadow-[4px_4px_0_black] transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-base line-through text-black decoration-red-600 decoration-4 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32 relative overflow-hidden">
                        <MysteryFlower className="absolute top-10 right-[-20px] w-40 h-40 text-[#36B5B0] opacity-20" />
                        
                        <h2 className="text-4xl spooky-font text-[#7452A3] mb-6 leading-tight transform rotate-1 drop-shadow-[1px_1px_0_#99CC33]">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5 relative z-10">
                            {/* --- 🏷️ VARIANT SELECTOR (3 PRICES) --- */}
                            <div>
                                <label className="block text-lg font-bold text-black mb-3 comic-font ml-1 tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'NORMAL', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'SPECIAL', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'JUMBO', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-xl border-4 transition-all flex flex-col items-center justify-between h-24 comic-font
                                                ${variant === v.key 
                                                    ? 'bg-[#F28F1C] border-black shadow-[3px_3px_0_black] -translate-y-1' 
                                                    : 'bg-white border-gray-300 text-gray-400 hover:border-black hover:text-black'}`}
                                        >
                                            <span className="text-xs font-black tracking-widest">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-red-500 decoration-2 opacity-70">{v.original}</span>
                                                )}
                                                <span className="text-xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2 bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0_#36B5B0]">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white border-4 border-black text-black rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-all font-black text-xl"><Icon name="minus" strokeWidth={4} /></button>
                                    <span className="text-4xl font-black w-14 text-center text-black comic-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#99CC33] border-4 border-black text-black rounded-full flex items-center justify-center hover:bg-[#88B82D] active:scale-90 transition-all font-black text-xl"><Icon name="plus" strokeWidth={4} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[#7452A3] font-bold uppercase tracking-widest mb-1 comic-font">TOTAL</p>
                                    <p className="text-5xl font-black text-black comic-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <label className="block text-lg font-bold text-black mb-2 comic-font ml-1 tracking-wide">SECRET MESSAGE TO CHEF:</label>
                                <div className="relative">
                                    <textarea 
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="E.g., No ghosts, Extra sauce..." 
                                        className="w-full p-4 pl-12 bg-[#F1F8E9] border-4 border-black rounded-2xl font-bold text-black placeholder:text-gray-400 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0_#7452A3] transition-all comic-font resize-none h-28 text-lg"
                                    />
                                    <div className="absolute top-4 left-4 text-[#7452A3]">
                                        <Icon name="pencil" size={24} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border-4 border-black text-black font-black text-xl rounded-xl active:scale-95 transition-all shadow-[4px_4px_0_black] comic-font">
                                ADD TO VAN
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-mystery text-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                EAT IT! <Icon name="bone" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (The Trap) --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#2D1B4E]/80 backdrop-blur-sm animate-in fade-in duration-300">
                 <div className="w-full max-w-md bg-[#FFF] border-t-4 border-black flex flex-col shadow-[0_-10px_0_#F28F1C] h-[85vh] rounded-t-[3rem] animate-in slide-in-from-bottom duration-300 relative">
                     {/* Decorative Elements */}
                     <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                        <Icon name="flame" size={64} className="text-[#99CC33] animate-bounce" />
                     </div>

                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-2 bg-black rounded-full mx-auto opacity-20" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-4xl spooky-font text-[#7452A3] drop-shadow-[2px_2px_0_#99CC33] transform -rotate-2">Captured Snacks</h2>
                         <div className="w-14 h-14 bg-[#F28F1C] text-black border-4 border-black rounded-xl flex items-center justify-center font-black text-2xl comic-font shadow-[3px_3px_0_black]">
                             <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-black rounded-2xl relative overflow-hidden shadow-[4px_4px_0_#36B5B0]">
                                 <div className="w-4 h-full absolute left-0 top-0 bg-[#36B5B0] border-r-4 border-black" />
                                 <img src={item.image_url} className="w-20 h-20 object-cover border-4 border-black rounded-xl ml-4 bg-gray-100" />
                                 <div className="flex-1">
                                     <div className="font-bold text-black text-xl leading-tight comic-font tracking-wide">
                                         {item.name} <span className="text-[#7452A3]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-sm font-bold mt-1">
                                         {item.variant !== 'normal' && <span className="bg-[#F28F1C] text-black px-2 py-0.5 border-2 border-black rounded text-xs comic-font mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-gray-500 italic mt-1 text-xs">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#F28F1C] text-2xl comic-font drop-shadow-[1px_1px_0_black]">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#ffcccc] hover:bg-red-200 flex items-center justify-center text-red-600 border-2 border-black rounded-xl transition-colors active:scale-90 shadow-[2px_2px_0_black]">
                                     <Icon name="trash" size={20} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-[#7452A3] spooky-font text-2xl animate-pulse">
                                 Ruh-Roh! No Snacks!
                             </div>
                         )}
                     </div>

                     <div className="p-8 bg-[#36B5B0] border-t-4 border-black relative z-30 rounded-t-[2.5rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-black">
                             <div>
                                 <p className="text-sm text-black font-black uppercase tracking-widest comic-font">TOTAL LOOT</p>
                                 <p className="text-6xl font-black text-[#F28F1C] comic-font drop-shadow-[3px_3px_0_black]">{cartTotal}.-</p>
                             </div>
                             <div className="w-20 h-20 bg-white border-4 border-black rounded-full flex items-center justify-center text-[#7452A3] transform rotate-6 shadow-[4px_4px_0_black]">
                                 <Icon name="basket" size={40} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-mystery text-3xl active:scale-95 transition-all flex items-center justify-center gap-3">
                             <span>SOLVE HUNGER!</span> <Icon name="check" size={32} strokeWidth={4} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#2D1B4E]/90 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
                <div className="w-full max-w-sm bg-[#99CC33] border-4 border-black p-8 text-center shadow-[10px_10px_0_#7452A3] animate-in zoom-in duration-300 relative overflow-hidden rounded-[2.5rem]">
                    <div className="w-28 h-28 bg-[#36B5B0] text-black rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-black shadow-[4px_4px_0_black]">
                        <Icon name="flame" size={56} className="animate-pulse" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-4xl spooky-font text-black mb-2 leading-tight">JINKIES!</h3>
                            <p className="text-xl text-black mb-8 font-bold comic-font leading-tight">Add "{selectedProduct.name}" to your stash?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#F28F1C] text-black font-black border-4 border-black shadow-[4px_4px_0_black] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl comic-font rounded-xl">YES, GRAB IT ALL!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-black text-black font-black text-lg active:scale-95 transition-transform hover:bg-gray-100 comic-font rounded-xl">JUST ADD TO VAN</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl spooky-font text-black mb-2 leading-tight">WAIT GANG!</h3>
                            <p className="text-xl text-black mb-8 font-bold comic-font leading-tight">Ready to unmask these delicious snacks?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-[#F28F1C] text-black font-black border-4 border-black shadow-[4px_4px_0_black] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl comic-font rounded-xl">LET'S EAT!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-black text-black font-black text-lg active:scale-95 transition-transform hover:bg-gray-100 comic-font rounded-xl">NOT YET, SCOOB!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}