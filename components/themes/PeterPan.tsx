import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Peter Pan / Neverland Style) ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Treehouse / Star (Second star to the right)
    home: <path d="M12 2L2 22h20L12 2zm0 4l6 12H6l6-12z" />, // Simplified star/tent shape
    // Menu -> Treasure Map
    menu: <path d="M9 2L2 6v14l7-4 6 4 7-4V2l-7 4-6-4zm0 16l-5 2.86V6.86L9 4v14zm7 0l-5 2.86V6.86L16 4v14z" />,
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Treasure Chest
    basket: <path d="M5 5h14v2H5z M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zm4 4h2v2H7v-2zm8 0h2v2h-2v-2z" />,
    // Clock -> Crocodile / Tick-Tock
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Peter Pan Hat with Feather
    chef: <path d="M2 12l10-8 10 8-2 8H4l-2-8z" />, 
    // Star -> Tinkerbell / Pixie Dust
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Fairy Wings / Magic
    flame: <path d="M12 2C8 2 8 8 4 8c4 0 4 6 8 6 4 0 4-6 8-6-4 0-4-6-8-6z" />, 
    pencil: <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />,
    // Feather Icon
    feather: <path d="M20.24 3.76a3 3 0 0 0-4.24 0l-9 9a3 3 0 0 0 0 4.24l.76.76a1 1 0 0 0 1.41-1.41l-.76-.76a1 1 0 0 1 0-1.41l9-9a1 1 0 0 1 1.41 0 1 1 0 0 1 0 1.41l-9 9a1 1 0 0 0 0 1.41l.76.76a3 3 0 0 0 4.24 0l9-9a3 3 0 0 0 0-4.24zM6 20l2-2" />
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
      {name === 'basket' && <path d="M8 11h8" />} 
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#1A472A]" />;

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
    // Theme: Peter Pan (Neverland)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#2E1503]">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Berkshire+Swash&family=Lato:wght@400;700;900&display=swap');
            
            :root {
                --primary: #4CAF50; /* Peter Pan Green */
                --primary-dark: #2E7D32;
                --secondary: #FFD700; /* Pixie Dust Gold */
                --accent: #FF5722; /* Red Feather */
                --wood: #8D6E63; /* Treehouse Wood */
                --sky: #81D4FA; /* Night Sky Blue */
            }

            body {
                font-family: 'Lato', sans-serif;
                background-color: #1A472A; /* Deep Forest Green */
                /* --- 🌟 STARS & LEAVES PATTERN --- */
                background-image: 
                    radial-gradient(white 1px, transparent 1px),
                    radial-gradient(white 1px, transparent 1px);
                background-size: 50px 50px;
                background-position: 0 0, 25px 25px;
                background-attachment: fixed;
            }

            .fantasy-font {
                font-family: 'Berkshire Swash', cursive;
            }

            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
                100% { transform: translateY(0px); }
            }

            .animate-float { animation: float 3s ease-in-out infinite; }

            @keyframes sparkle {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.8); }
            }

            .animate-sparkle { animation: sparkle 1.5s infinite; }

            .btn-pan {
                background: linear-gradient(to bottom, #66BB6A, #43A047);
                color: white;
                border: 2px solid #1B5E20;
                border-radius: 1rem;
                font-family: 'Berkshire Swash', cursive;
                box-shadow: 0 4px 0 #1B5E20, 0 5px 10px rgba(0,0,0,0.3);
                transition: all 0.1s;
            }
            .btn-pan:active {
                transform: translateY(4px);
                box-shadow: 0 0 0 #1B5E20;
            }

            .wood-card {
                background: #FFF3E0; /* Parchment Color */
                border: 4px solid #5D4037; /* Wood Border */
                border-radius: 1.5rem;
                box-shadow: 5px 5px 0 #3E2723;
                transition: all 0.2s;
                position: relative;
            }
            .wood-card:active {
                transform: translate(2px, 2px);
                box-shadow: 3px 3px 0 #3E2723;
            }

            .tab-btn {
                background: #FFF3E0;
                color: #5D4037;
                border: 2px solid #8D6E63;
                border-radius: 1rem;
                transition: all 0.3s;
                font-family: 'Berkshire Swash', cursive;
            }
            .tab-btn.active {
                background: #FFD700;
                color: #3E2723;
                border-color: #F57F17;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                transform: translateY(-2px);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* --- Header (Neverland Style) --- */}
        <header className="bg-[#2E7D32] text-white pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-xl z-10 border-b-4 border-[#1B5E20]">
             {/* Stars Background */}
             <div className="absolute inset-0 opacity-30 pointer-events-none" 
                  style={{
                      backgroundImage: `radial-gradient(#FFF 1px, transparent 1px)`,
                      backgroundSize: '20px 20px'
                  }} 
             />
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#1B5E20] w-fit px-4 py-1.5 rounded-full border-2 border-[#FFD700] shadow-sm transform -rotate-2">
                         <Icon name="star" size={12} className="text-[#FFD700] animate-sparkle" />
                         <p className="text-[#FFD700] text-xs font-bold tracking-widest uppercase">Table: {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl font-normal tracking-wide leading-none mt-2 fantasy-font text-[#FFF] drop-shadow-[2px_2px_0_#1B5E20] transform rotate-1">
                         {brand?.name || "Neverland Eats"}
                     </h1>
                 </div>
                 {/* Peter Pan Hat Icon */}
                 <div className="w-20 h-20 bg-[#4CAF50] rounded-full border-4 border-[#FFD700] flex items-center justify-center relative shadow-[0_4px_10px_rgba(0,0,0,0.3)] transform rotate-3">
                     <Icon name="feather" className="text-[#FF5722] w-12 h-12 absolute -top-2 -right-2 transform rotate-45" />
                     <Icon name="chef" className="text-white w-10 h-10" />
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade-in">
                    {/* Hero Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-[#3E2723] rounded-[2rem] overflow-hidden shadow-[6px_6px_0_#1B5E20] mb-8 border-4 border-[#5D4037] p-1">
                             <div className="h-full w-full rounded-[1.8rem] overflow-hidden border-2 border-[#8D6E63] relative">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                             </div>
                             <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 bg-[#FFD700] px-6 py-2 rounded-b-xl border-x-2 border-b-2 border-[#F57F17] shadow-lg">
                                 <span className="fantasy-font text-xl text-[#3E2723]">Pixie Dust Special!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                         <div>
                             <h2 className="text-3xl font-normal text-[#FFD700] fantasy-font transform -rotate-1 drop-shadow-md">Lost Boys' Grub</h2>
                             <p className="text-sm text-[#81D4FA] font-bold ml-1 tracking-wide">Second star to the right...</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#5D4037] text-[#FFD700] px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#4E342E] transition-colors fantasy-font border-2 border-[#8D6E63] shadow-[0_4px_0_#3E2723] active:translate-y-[2px] active:shadow-none text-lg">
                             Explore Map <Icon name="menu" size={20} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="wood-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#FFF3E0] border-b-4 border-[#5D4037]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#FF5722] text-white text-xs font-bold px-2 py-1 rounded-md border border-[#BF360C] transform -rotate-6 shadow-sm fantasy-font">
                                                MAGIC DEAL!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-[#FFF8E1]">
                                         <h3 className="font-bold text-[#3E2723] text-lg line-clamp-2 mb-1 leading-tight fantasy-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-xs text-gray-500 line-through decoration-[#FF5722] decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#2E7D32] font-black text-2xl fantasy-font leading-none drop-shadow-[1px_1px_0_#FFF]">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFD700] text-[#3E2723] border-2 border-[#F57F17] flex items-center justify-center rounded-full hover:bg-[#FFC107] transition-all shadow-[0_2px_0_#F57F17] active:translate-y-1 active:shadow-none">
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
                <section className="animate-fade-in pt-4">
                    <div className="relative mb-8 group">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#5D4037]" />
                         </div>
                         <input type="text" placeholder="Search the island..." className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FFF3E0] border-4 border-[#8D6E63] text-[#3E2723] placeholder:text-[#A1887F] focus:outline-none focus:border-[#FFD700] focus:shadow-[0_4px_0_#F57F17] transition-all text-xl font-bold fantasy-font" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-3 text-lg font-bold rounded-xl flex items-center gap-2 ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-24">
                        {filteredProducts?.map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="wood-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#FFF3E0] border-b-4 border-[#5D4037]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="p-4 bg-[#FFF8E1]">
                                         <h3 className="font-bold text-[#3E2723] text-lg line-clamp-2 mb-1 leading-tight fantasy-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-xs text-gray-500 line-through decoration-[#FF5722] decoration-2 font-bold">{pricing.original}</span>}
                                                <span className="text-[#2E7D32] font-black text-2xl fantasy-font leading-none drop-shadow-[1px_1px_0_#FFF]">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFD700] text-[#3E2723] border-2 border-[#F57F17] flex items-center justify-center rounded-full hover:bg-[#FFC107] transition-all shadow-[0_2px_0_#F57F17] active:translate-y-1 active:shadow-none">
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

            {/* --- STATUS PAGE (Fantasy/Treasure Theme) --- */}
            {activeTab === 'status' && (
                <section className="animate-fade-in pt-4 pb-24">
                    {/* Header Section */}
                    <div className="mb-8 flex items-center justify-between bg-[#2E7D32] p-6 border-4 border-[#FFD700] rounded-[2rem] shadow-[6px_6px_0_#1B5E20] relative overflow-hidden">
                         <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#FFD700] rounded-full border-4 border-white opacity-50"></div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-normal fantasy-font text-[#FFF] drop-shadow-md">Captain's Log</h2>
                             <p className="text-sm text-[#FFD700] font-bold mt-1 tracking-wider">Tick-Tock goes the clock...</p>
                         </div>
                         <div className="w-16 h-16 bg-[#FFF] border-4 border-[#FFD700] rounded-full flex items-center justify-center animate-pulse">
                             <Icon name="clock" className="text-[#2E7D32]" size={32} />
                         </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="bg-[#FFF8E1] p-5 border-4 border-[#5D4037] rounded-[2rem] relative overflow-hidden shadow-[6px_6px_0_#3E2723]">
                                {/* Header: Map ID & Status Badge */}
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-sm text-[#5D4037] font-bold uppercase tracking-widest flex items-center gap-1">
                                         Map #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wide border-2 flex items-center gap-1.5 fantasy-font shadow-sm rounded-lg transform -rotate-1
                                        ${o.status === 'pending' ? 'bg-[#FFECB3] text-[#F57F17] border-[#FFCA28]' : 'bg-[#C8E6C9] text-[#2E7D32] border-[#66BB6A]'}`}>
                                         {o.status === 'pending' ? 'HUNTING...' : 'FOUND!'}
                                     </span>
                                </div>

                                {/* Order Items List */}
                                <div className="mb-3 space-y-1 bg-[#FFF3E0] p-4 border-2 border-[#FFE0B2] rounded-xl">
                                    {o.order_items.map((i, idx) => {
                                        // 1. คำนวณราคา
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        
                                        // 2. 🧪 SIMULATION:
                                        const isSimulatedDiscount = i.variant === 'jumbo' || i.variant === 'special'; 
                                        
                                        let originalPriceTotal = finalPriceTotal;
                                        let discountAmount = 0;

                                        // 3. ตรวจสอบส่วนลด
                                        if ( (i.original_price && i.original_price > i.price) || i.discount > 0 || isSimulatedDiscount ) {
                                            const unitOriginal = i.original_price ? i.original_price : (i.price + (i.discount || 50)); 
                                            originalPriceTotal = unitOriginal * quantity;
                                            discountAmount = originalPriceTotal - finalPriceTotal;
                                        }

                                        const hasDiscount = discountAmount > 0;

                                        return (
                                            <div key={idx} className="flex justify-between items-start text-lg text-[#3E2723] font-bold mb-2 border-b border-dashed border-[#8D6E63] pb-2 last:border-0 fantasy-font">
                                                
                                                {/* Left: Info */}
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-xl">{quantity}x {i.product_name}</span>
                                                    
                                                    {/* Variant Badge (Fantasy Style: Gold Coin/Plaque) */}
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] bg-[#FFD700] text-[#3E2723] px-2 py-0.5 rounded-md border-2 border-[#5D4037] font-sans font-bold mt-1 shadow-sm uppercase tracking-wider transform -rotate-2`}>
                                                            {i.variant === 'special' ? 'MYTHIC' : i.variant === 'jumbo' ? 'LEGENDARY' : i.variant}
                                                        </span>
                                                    )}

                                                    {i.note && <span className="text-xs text-[#8D6E63] italic sans-serif mt-0.5 opacity-80">"{i.note}"</span>}
                                                </div>

                                                {/* Right: Price */}
                                                <div className="text-right flex flex-col items-end min-w-[80px]">
                                                    {hasDiscount ? (
                                                        <>
                                                            {/* 🔥 ป้าย SAVE (Fantasy Style: Red Sealing Wax) */}
                                                            <span className="text-[10px] text-white bg-[#C62828] px-1.5 py-0.5 rounded-full font-sans font-bold mb-1 shadow-sm border border-[#FFD700] transform rotate-3 animate-pulse">
                                                                SAVE -{discountAmount}
                                                            </span>

                                                            {/* ราคาเต็ม (ขีดฆ่า สีน้ำตาลอ่อน) */}
                                                            <span className="text-sm text-[#A1887F] line-through decoration-[#C62828] decoration-2 sans-serif opacity-80 mb-0.5 font-bold">
                                                                {originalPriceTotal}
                                                            </span>

                                                            {/* ราคาจริง (สีเขียวมรกต) */}
                                                            <span className="text-[#2E7D32] text-2xl leading-none filter drop-shadow-sm">
                                                                {finalPriceTotal}.-
                                                            </span>
                                                        </>
                                                    ) : (
                                                        // ราคาปกติ
                                                        <span className="text-[#2E7D32] text-2xl">{finalPriceTotal}.-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer: Total */}
                                <div className="flex justify-between items-center pt-2 border-t-2 border-[#5D4037]">
                                     <span className="font-bold text-[#8D6E63] text-sm uppercase tracking-widest">BOUNTY</span>
                                     <span className="font-black text-[#3E2723] text-3xl fantasy-font">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        
                        {/* Empty State */}
                        {(!ordersList || ordersList.length === 0) && (
                             <div className="text-center py-12 opacity-50">
                                <div className="w-20 h-20 bg-[#FFE0B2] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#FFD700]">
                                    <Icon name="search" size={40} className="text-[#E65100]" />
                                </div>
                                <p className="fantasy-font text-2xl text-[#5D4037]">No treasure maps yet...</p>
                             </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[75px] bg-[#3E2723] shadow-[0_8px_0_#1B5E20] flex justify-around items-center px-4 z-[90] rounded-full border-4 border-[#8D6E63]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'home' ? 'text-[#FFD700]' : 'text-[#A1887F]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#5D4037] border border-[#FFD700]' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'menu' ? 'text-[#FFD700]' : 'text-[#A1887F]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#5D4037] border border-[#FFD700]' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* Big Cart Button */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#FFD700] rounded-full shadow-[0_6px_0_#F57F17] flex items-center justify-center text-[#3E2723] border-4 border-[#FFF] active:shadow-none active:translate-y-[6px] transition-all duration-100 z-20 group animate-float">
                     <Icon name="basket" size={32} className="group-hover:scale-110 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#FF5722] text-white text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-white animate-pulse">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'status' ? 'text-[#FFD700]' : 'text-[#A1887F]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#5D4037] border border-[#FFD700]' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Parchment) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#1B5E20]/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-full max-w-md bg-[#FFF8E1] border-t-8 border-x-8 border-[#5D4037] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-[0_-10px_0_#3E2723] rounded-t-[3rem] animate-in slide-in-from-bottom duration-300">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#FFD700] text-[#3E2723] rounded-full border-4 border-[#FFF] flex items-center justify-center hover:bg-[#FFC107] transition-colors shadow-[2px_2px_0_#F57F17] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-8 border-[#5D4037] rounded-b-[2rem] bg-[#8D6E63]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#2E7D32] text-white font-normal text-3xl fantasy-font rounded-xl border-4 border-[#FFD700] shadow-[4px_4px_0_#1B5E20] transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-base line-through text-[#A5D6A7] decoration-[#FF5722] decoration-4 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32 relative overflow-hidden bg-[#FFF3E0]">
                        <h2 className="text-4xl fantasy-font text-[#3E2723] mb-6 leading-tight transform rotate-1 drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5 relative z-10">
                            {/* --- 🏷️ VARIANT SELECTOR (3 PRICES) --- */}
                            <div>
                                <label className="block text-lg font-bold text-[#5D4037] mb-3 fantasy-font ml-1 tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'TINK', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'WENDY', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'HOOK', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-xl border-4 transition-all flex flex-col items-center justify-between h-24 fantasy-font
                                                ${variant === v.key 
                                                    ? 'bg-[#FFD700] border-[#F57F17] shadow-[3px_3px_0_#3E2723] -translate-y-1 text-[#3E2723]' 
                                                    : 'bg-[#FFF8E1] border-[#D7CCC8] text-[#A1887F] hover:border-[#8D6E63] hover:text-[#5D4037]'}`}
                                        >
                                            <span className="text-xs font-bold tracking-widest">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-[#FF5722] decoration-2 opacity-70">{v.original}</span>
                                                )}
                                                <span className="text-xl font-normal">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2 bg-[#FFF8E1] border-4 border-[#8D6E63] rounded-2xl p-4 shadow-[4px_4px_0_#5D4037]">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-[#D7CCC8] border-2 border-[#8D6E63] text-[#3E2723] rounded-full flex items-center justify-center hover:bg-[#BCAAA4] active:scale-90 transition-all font-black text-xl"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-4xl font-normal w-14 text-center text-[#3E2723] fantasy-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#2E7D32] border-2 border-[#1B5E20] text-white rounded-full flex items-center justify-center hover:bg-[#1B5E20] active:scale-90 transition-all font-black text-xl"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[#8D6E63] font-bold uppercase tracking-widest mb-1">GOLD DOUBLOONS</p>
                                    <p className="text-5xl font-normal text-[#3E2723] fantasy-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <label className="block text-lg font-bold text-[#5D4037] mb-2 fantasy-font ml-1 tracking-wide">SCROLL MESSAGE:</label>
                                <div className="relative">
                                    <textarea 
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="E.g., No ticking clocks..." 
                                        className="w-full p-4 pl-12 bg-[#FFF8E1] border-4 border-[#D7CCC8] rounded-2xl font-bold text-[#3E2723] placeholder:text-[#BCAAA4] focus:outline-none focus:border-[#FFD700] focus:shadow-[4px_4px_0_#F57F17] transition-all resize-none h-28 text-lg font-serif"
                                    />
                                    <div className="absolute top-4 left-4 text-[#8D6E63]">
                                        <Icon name="pencil" size={24} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-[#FFF] border-4 border-[#5D4037] text-[#5D4037] font-bold text-xl rounded-xl active:scale-95 transition-all shadow-[4px_4px_0_#3E2723] fantasy-font">
                                ADD TO CHEST
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-pan text-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                FLY TO EAT! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (The Trap) --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#1B5E20]/80 backdrop-blur-sm animate-in fade-in duration-300">
                 <div className="w-full max-w-md bg-[#FFF8E1] border-t-8 border-[#5D4037] flex flex-col shadow-[0_-10px_0_#3E2723] h-[85vh] rounded-t-[3rem] animate-in slide-in-from-bottom duration-300 relative">
                     {/* Decorative Elements */}
                     <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                        <Icon name="basket" size={64} className="text-[#FFD700] animate-bounce" />
                     </div>

                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-2 bg-[#5D4037] rounded-full mx-auto opacity-20" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-4xl fantasy-font text-[#3E2723] drop-shadow-sm transform -rotate-2">Your Loot</h2>
                         <div className="w-14 h-14 bg-[#FFD700] text-[#3E2723] border-4 border-[#F57F17] rounded-xl flex items-center justify-center font-bold text-2xl fantasy-font shadow-[3px_3px_0_#3E2723]">
                             <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-[#8D6E63] rounded-2xl relative overflow-hidden shadow-[4px_4px_0_#5D4037]">
                                 <div className="w-4 h-full absolute left-0 top-0 bg-[#2E7D32]" />
                                 <img src={item.image_url} className="w-20 h-20 object-cover border-4 border-[#D7CCC8] rounded-xl ml-4 bg-[#EFEBE9]" />
                                 <div className="flex-1">
                                     <div className="font-bold text-[#3E2723] text-xl leading-tight fantasy-font tracking-wide">
                                         {item.name} <span className="text-[#2E7D32]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-sm font-bold mt-1">
                                         {item.variant !== 'normal' && <span className="bg-[#FFD700] text-[#3E2723] px-2 py-0.5 border border-[#F57F17] rounded text-xs mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-[#8D6E63] italic mt-1 text-xs">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#2E7D32] text-2xl fantasy-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#FFEBEE] hover:bg-[#FFCDD2] flex items-center justify-center text-[#D32F2F] border-2 border-[#FFCDD2] rounded-xl transition-colors active:scale-90 shadow-sm">
                                     <Icon name="trash" size={20} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-[#A1887F] font-bold text-xl">Chest is empty...</div>
                         )}
                     </div>

                     <div className="p-8 bg-[#2E7D32] border-t-4 border-[#1B5E20] relative z-30 rounded-t-[2.5rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-[#4CAF50]">
                             <div>
                                 <p className="text-sm text-[#A5D6A7] font-black uppercase tracking-widest">TOTAL BOUNTY</p>
                                 <p className="text-6xl font-normal text-[#FFF] fantasy-font drop-shadow-md">{cartTotal}.-</p>
                             </div>
                             <div className="w-20 h-20 bg-[#FFD700] border-4 border-[#F57F17] rounded-full flex items-center justify-center text-[#3E2723] transform rotate-6 shadow-[4px_4px_0_#3E2723]">
                                 <Icon name="basket" size={40} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-pan text-3xl active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-[#1B5E20]">
                             <span>OFF TO NEVERLAND!</span> <Icon name="check" size={32} strokeWidth={4} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#1B5E20]/90 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
                <div className="w-full max-w-sm bg-[#FFF8E1] border-8 border-[#5D4037] p-8 text-center shadow-[10px_10px_0_#3E2723] animate-in zoom-in duration-300 relative overflow-hidden rounded-[2.5rem]">
                    <div className="w-28 h-28 bg-[#2E7D32] text-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#FFD700] shadow-[4px_4px_0_#1B5E20]">
                        <Icon name="flame" size={56} className="animate-sparkle" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-4xl fantasy-font text-[#3E2723] mb-2 leading-tight">AHOY!</h3>
                            <p className="text-xl text-[#5D4037] mb-8 font-bold leading-tight">Add "{selectedProduct.name}" to your chest?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#FFD700] text-[#3E2723] font-bold border-4 border-[#F57F17] shadow-[4px_4px_0_#3E2723] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl fantasy-font rounded-xl">YES, TAKE IT ALL!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-[#8D6E63] text-[#5D4037] font-bold text-lg active:scale-95 transition-transform hover:bg-[#EFEBE9] rounded-xl">JUST STOW IT</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl fantasy-font text-[#3E2723] mb-2 leading-tight">FLY NOW?</h3>
                            <p className="text-xl text-[#5D4037] mb-8 font-bold leading-tight">Ready to feast with the Lost Boys?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-[#4CAF50] text-white font-bold border-4 border-[#1B5E20] shadow-[4px_4px_0_#1B5E20] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl fantasy-font rounded-xl">YES, I CAN FLY!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-[#8D6E63] text-[#5D4037] font-bold text-lg active:scale-95 transition-transform hover:bg-[#EFEBE9] rounded-xl">NOT YET!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}