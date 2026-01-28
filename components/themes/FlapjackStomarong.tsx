import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Flapjack / Stormalong Harbor Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Stormalong Harbor / Dock
    home: <path d="M2 20h20 M4 20v-4c0-2 2-4 4-4h8c2 0 4 2 4 4v4 M12 2v10 M12 2l-3 3 M12 2l3 3" />, // Anchor-ish / Hut
    // Menu -> Candy Barrel / Map
    menu: <path d="M3 6h18M3 12h18M3 18h18" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Bubbie (Whale Mouth)
    basket: <path d="M2 12c0 5 4 9 9 9s9-4 9-9-4-9-9-9c-2 0-4 .5-6 1.5 M2 12l6 3 4-2 4 2 6-3" />,
    // Clock -> Sun / Adventure Time
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Captain K'nuckles Hat
    chef: <path d="M4 18h16v2H4z M6 18V8c0-3 3-5 6-5s6 2 6 5v10" />, 
    // Star -> Candy / Lollipop
    star: <circle cx="12" cy="12" r="8" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Adventure! / Compass
    flame: <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    // Candy Wrapper
    candy: <path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0 M2 12l6-4 M22 12l-6-4 M2 12l6 4 M22 12l-6 4" />
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
      {name === 'basket' && <path d="M12 8v2" />} {/* Whale eye/detail */}
      {name === 'star' && <path d="M12 4v16M4 12h16" strokeWidth="1.5" opacity="0.5"/>} {/* Lollipop stick */}
      {name === 'clock' && <path d="M12 6v6l4 2" />}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#FFF8E1]" />;

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
    // Theme: Flapjack (Stormalong Harbor)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#3E2723]">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Rye&family=Sancreek&family=Patrick+Hand&display=swap');
            
            :root {
                --primary: #81D4FA; /* Sky/Sea Blue */
                --primary-dark: #0288D1;
                --secondary: #FFCC80; /* Flapjack Skin */
                --accent: #D32F2F; /* Candy Red */
                --wood: #5D4037; /* Dock Wood */
                --paper: #FFF8E1; /* Old Map/Paper */
            }

            body {
                font-family: 'Patrick Hand', cursive;
                background-color: #B3E5FC; /* Light Sea */
                /* --- 🌊 WAVES PATTERN --- */
                background-image: 
                    radial-gradient(circle at 100% 150%, #B3E5FC 24%, #81D4FA 25%, #81D4FA 28%, #B3E5FC 29%, #B3E5FC 36%, #81D4FA 36%, #81D4FA 40%, transparent 40%, transparent),
                    radial-gradient(circle at 0 150%, #B3E5FC 24%, #81D4FA 25%, #81D4FA 28%, #B3E5FC 29%, #B3E5FC 36%, #81D4FA 36%, #81D4FA 40%, transparent 40%, transparent),
                    radial-gradient(circle at 50% 100%, #81D4FA 10%, #B3E5FC 11%, #B3E5FC 23%, #81D4FA 24%, #81D4FA 30%, #B3E5FC 31%, #B3E5FC 43%, #81D4FA 44%, #81D4FA 50%, #B3E5FC 51%, #B3E5FC 63%, #81D4FA 64%, #81D4FA 71%, transparent 71%, transparent),
                    radial-gradient(circle at 100% 50%, #81D4FA 5%, #B3E5FC 6%, #B3E5FC 15%, #81D4FA 16%, #81D4FA 20%, #B3E5FC 21%, #B3E5FC 30%, #81D4FA 31%, #81D4FA 35%, #B3E5FC 36%, #B3E5FC 45%, #81D4FA 46%, #81D4FA 49%, transparent 50%, transparent),
                    radial-gradient(circle at 0 50%, #81D4FA 5%, #B3E5FC 6%, #B3E5FC 15%, #81D4FA 16%, #81D4FA 20%, #B3E5FC 21%, #B3E5FC 30%, #81D4FA 31%, #81D4FA 35%, #B3E5FC 36%, #B3E5FC 45%, #81D4FA 46%, #81D4FA 49%, transparent 50%, transparent);
                background-size: 50px 25px;
                background-attachment: fixed;
            }

            .sailor-font {
                font-family: 'Rye', serif;
            }

            .fun-font {
                font-family: 'Sancreek', cursive;
            }

            @keyframes rock-boat {
                0% { transform: rotate(0deg); }
                25% { transform: rotate(1deg); }
                50% { transform: rotate(0deg); }
                75% { transform: rotate(-1deg); }
                100% { transform: rotate(0deg); }
            }

            .animate-rock { animation: rock-boat 3s ease-in-out infinite; }

            .btn-flapjack {
                background: #FFCC80;
                color: #5D4037;
                border: 3px solid #5D4037;
                border-radius: 1rem;
                font-family: 'Rye', serif;
                box-shadow: 4px 4px 0 #3E2723;
                transition: all 0.1s;
            }
            .btn-flapjack:active {
                transform: translate(2px, 2px);
                box-shadow: 2px 2px 0 #3E2723;
            }

            .dock-card {
                background: #FFF3E0; /* Paper */
                border: 4px solid #8D6E63; /* Wood */
                border-radius: 1rem;
                box-shadow: 6px 6px 0 #3E2723;
                transition: all 0.2s;
                position: relative;
            }
            .dock-card::before {
                content: '';
                position: absolute;
                top: 4px; left: 4px; right: 4px; bottom: 4px;
                border: 2px dashed #A1887F;
                border-radius: 0.8rem;
                pointer-events: none;
            }
            .dock-card:active {
                transform: translate(3px, 3px);
                box-shadow: 3px 3px 0 #3E2723;
            }

            .tab-btn {
                background: #FFF8E1;
                color: #5D4037;
                border: 3px solid #8D6E63;
                border-radius: 1rem;
                transition: all 0.3s;
                font-family: 'Rye', serif;
            }
            .tab-btn.active {
                background: #81D4FA;
                color: #01579B;
                border-color: #0288D1;
                box-shadow: 0 4px 0 #01579B;
                transform: translateY(-2px);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* --- Header (Stormalong Harbor) --- */}
        <header className="bg-[#5D4037] text-white pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-xl z-10 border-b-8 border-[#3E2723]">
             <div className="absolute inset-0 opacity-20 pointer-events-none" 
                  style={{
                      backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 19px, #8D6E63 20px)`,
                      backgroundSize: '20px 20px'
                  }} 
             />
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#FFF8E1] w-fit px-4 py-1.5 rounded-full border-2 border-[#8D6E63] shadow-sm transform -rotate-2">
                         <span className="w-3 h-3 rounded-full bg-[#D32F2F] animate-pulse border border-[#5D4037]"></span>
                         <p className="text-[#5D4037] text-xs font-bold tracking-widest uppercase sailor-font">Dock: {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl font-normal tracking-wide leading-none mt-2 fun-font text-[#FFCC80] drop-shadow-[3px_3px_0_#3E2723] transform rotate-1">
                         {brand?.name || "Flapjack's Feast"}
                     </h1>
                 </div>
                 {/* K'nuckles Hat Icon */}
                 <div className="w-20 h-20 bg-[#0288D1] rounded-full border-4 border-[#FFF] flex items-center justify-center relative shadow-[0_6px_0_#01579B] transform rotate-3">
                     <Icon name="chef" className="text-white w-12 h-12" />
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#D32F2F] rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🍬
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-rock">
                    {/* Hero Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-[#FFF8E1] rounded-[2rem] overflow-hidden shadow-[6px_6px_0_#3E2723] mb-8 border-4 border-[#5D4037] p-2">
                             <div className="h-full w-full rounded-[1.5rem] overflow-hidden border-2 border-[#D32F2F] relative">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover grayscale sepia-[.3]" />
                             </div>
                             <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 bg-[#D32F2F] px-6 py-2 rounded-b-xl border-x-4 border-b-4 border-[#3E2723] shadow-lg">
                                 <span className="sailor-font text-xl text-[#FFF]">CANDY ISLAND!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                         <div>
                             <h2 className="text-3xl font-normal text-[#5D4037] fun-font transform -rotate-1 drop-shadow-sm">Adventure Time!</h2>
                             <p className="text-sm text-[#0288D1] font-bold ml-1 tracking-wide bg-[#E1F5FE] px-2 rounded inline-block">Come with me...</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#81D4FA] text-[#01579B] px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#4FC3F7] transition-colors sailor-font border-4 border-[#0288D1] shadow-[0_4px_0_#01579B] active:translate-y-[2px] active:shadow-none text-lg">
                             SEE MAP <Icon name="menu" size={20} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="dock-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#B2EBF2] border-b-4 border-[#5D4037]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#D32F2F] text-white text-xs font-bold px-2 py-1 rounded-md border border-[#B71C1C] transform -rotate-6 shadow-sm sailor-font">
                                                CANDY!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-[#FFF8E1]">
                                         <h3 className="font-bold text-[#3E2723] text-lg line-clamp-2 mb-1 leading-tight sailor-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-xs text-gray-500 line-through decoration-[#D32F2F] decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#0288D1] font-black text-2xl fun-font leading-none drop-shadow-[1px_1px_0_#FFF]">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFCC80] text-[#5D4037] border-2 border-[#5D4037] flex items-center justify-center rounded-full hover:bg-[#FFB74D] transition-all shadow-[0_2px_0_#3E2723] active:translate-y-1 active:shadow-none">
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
                <section className="animate-rock pt-4">
                    <div className="relative mb-8 group">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#5D4037]" />
                         </div>
                         <input type="text" placeholder="Search for candy..." className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FFF3E0] border-4 border-[#8D6E63] text-[#3E2723] placeholder:text-[#A1887F] focus:outline-none focus:border-[#0288D1] focus:shadow-[0_4px_0_#0288D1] transition-all text-xl font-bold sailor-font" />
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
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="dock-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#FFF3E0] border-b-4 border-[#5D4037]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="p-4 bg-[#FFF8E1]">
                                         <h3 className="font-bold text-[#3E2723] text-lg line-clamp-2 mb-1 leading-tight sailor-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-xs text-gray-500 line-through decoration-[#D32F2F] decoration-2 font-bold">{pricing.original}</span>}
                                                <span className="text-[#0288D1] font-black text-2xl fun-font leading-none drop-shadow-[1px_1px_0_#FFF]">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFCC80] text-[#5D4037] border-2 border-[#5D4037] flex items-center justify-center rounded-full hover:bg-[#FFB74D] transition-all shadow-[0_2px_0_#3E2723] active:translate-y-1 active:shadow-none">
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

            {/* --- STATUS PAGE (One Piece / Captain's Log Theme) --- */}
{activeTab === 'status' && (
    <section className="animate-rock pt-4 pb-24">
        {/* Header: Captain's Log */}
        <div className="mb-8 flex items-center justify-between bg-[#5D4037] p-6 border-4 border-[#8D6E63] rounded-[2rem] shadow-[6px_6px_0_#3E2723] relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#FFCC80] rounded-full border-4 border-[#3E2723] opacity-50"></div>
             <div className="relative z-10">
                 <h2 className="text-3xl font-normal sailor-font text-[#FFF] drop-shadow-md">Captain's Log</h2>
                 <p className="text-sm text-[#FFCC80] font-bold mt-1 tracking-wider">West of the sun...</p>
             </div>
             {/* Clock Icon */}
             <div className="w-16 h-16 bg-[#FFF] border-4 border-[#FFCC80] rounded-full flex items-center justify-center animate-spin">
                 <Icon name="clock" className="text-[#5D4037]" size={32} />
             </div>
        </div>

        <div className="space-y-4">
            {ordersList?.map((o: any) => (
                <div key={o.id} className="bg-[#FFF8E1] p-5 border-4 border-[#8D6E63] rounded-[2rem] relative overflow-hidden shadow-[6px_6px_0_#3E2723]">
                    
                    {/* Header: Adventure ID & Status */}
                    <div className="flex justify-between items-start mb-4">
                         <span className="text-sm text-[#5D4037] font-bold uppercase tracking-widest flex items-center gap-1">
                             Adventure #{o.id.slice(-4)}
                         </span>
                         <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wide border-2 flex items-center gap-1.5 sailor-font shadow-sm rounded-lg transform -rotate-1
                             ${o.status === 'pending' ? 'bg-[#FFECB3] text-[#F57F17] border-[#FFCA28]' : 'bg-[#B2EBF2] text-[#006064] border-[#00BCD4]'}`}>
                             {o.status === 'pending' ? 'SAILING...' : 'ARRIVED!'}
                         </span>
                    </div>

                    {/* Order Items List */}
                    <div className="mb-3 space-y-1 bg-[#FFF3E0] p-4 border-2 border-[#FFE0B2] rounded-xl">
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
                                <div key={idx} className="flex justify-between items-start text-lg text-[#3E2723] font-bold mb-2 border-b border-dashed border-[#8D6E63] pb-2 last:border-0 sailor-font">
                                    
                                    {/* Left: Info */}
                                    <div className="flex flex-col items-start pr-2">
                                        <span className="leading-tight text-xl">{quantity}x {i.product_name}</span>
                                        
                                        {/* Variant Badge (Pirate Flag/Scroll Style) */}
                                        {i.variant !== 'normal' && (
                                            <span className={`text-[10px] bg-[#3E2723] text-[#FFCC80] px-2 py-0.5 rounded-sm border border-[#FFCC80] font-sans font-bold mt-1 shadow-sm uppercase tracking-wider transform -rotate-2`}>
                                                {i.variant === 'special' ? '🏴‍☠️ CAPTAIN' : i.variant === 'jumbo' ? '🌊 YONKO' : i.variant}
                                            </span>
                                        )}

                                        {/* Note */}
                                        {i.note && <span className="text-xs text-[#8D6E63] italic sans-serif mt-0.5">"{i.note}"</span>}
                                    </div>

                                    {/* Right: Price */}
                                    <div className="text-right flex flex-col items-end min-w-[80px]">
                                        {hasDiscount ? (
                                            <>
                                                {/* 🔥 ป้าย SAVE (Gold Coin Style) */}
                                                <span className="text-[10px] text-[#3E2723] bg-[#FFD54F] px-2 py-0.5 rounded-full font-sans font-bold mb-1 shadow-sm border border-[#3E2723] transform rotate-3 animate-pulse">
                                                    SAVE -{discountAmount}
                                                </span>

                                                {/* ราคาเต็ม (ขีดฆ่า) */}
                                                <span className="text-sm text-[#A1887F] line-through decoration-[#D32F2F] decoration-2 sans-serif opacity-70 mb-0.5 font-bold">
                                                    {originalPriceTotal}
                                                </span>

                                                {/* ราคาจริง */}
                                                <span className="text-[#0288D1] text-2xl leading-none drop-shadow-sm">
                                                    {finalPriceTotal}.-
                                                </span>
                                            </>
                                        ) : (
                                            // ราคาปกติ
                                            <span className="text-[#0288D1] text-2xl">{finalPriceTotal}.-</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer: Total */}
                    <div className="flex justify-between items-center pt-2 border-t-2 border-[#5D4037]">
                         <span className="font-bold text-[#8D6E63] text-sm uppercase tracking-widest">TREASURE</span>
                         <span className="font-black text-[#3E2723] text-3xl sailor-font">
                             {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                         </span>
                    </div>
                </div>
            ))}
            
            {/* Empty State */}
            {(!ordersList || ordersList.length === 0) && (
                 <div className="text-center py-12 opacity-50">
                    <div className="w-20 h-20 bg-[#FFF3E0] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#5D4037]">
                        <Icon name="search" size={40} className="text-[#5D4037]" />
                    </div>
                    <p className="sailor-font text-2xl text-[#3E2723]">No treasure maps yet...</p>
                 </div>
            )}
        </div>
    </section>
)}
        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[75px] bg-[#3E2723] shadow-[0_8px_0_#1B1B1B] flex justify-around items-center px-4 z-[90] rounded-full border-4 border-[#8D6E63]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'home' ? 'text-[#FFCC80]' : 'text-[#A1887F]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#5D4037] border border-[#FFCC80]' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'menu' ? 'text-[#FFCC80]' : 'text-[#A1887F]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#5D4037] border border-[#FFCC80]' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* Big Cart Button (Bubbie) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#81D4FA] rounded-full shadow-[0_6px_0_#0288D1] flex items-center justify-center text-[#01579B] border-4 border-[#FFF] active:shadow-none active:translate-y-[6px] transition-all duration-100 z-20 group animate-rock">
                     <Icon name="basket" size={36} className="group-hover:scale-110 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#D32F2F] text-white text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-white animate-pulse">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'status' ? 'text-[#FFCC80]' : 'text-[#A1887F]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#5D4037] border border-[#FFCC80]' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Wooden Plank) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#3E2723]/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-full max-w-md bg-[#FFF8E1] border-t-8 border-x-8 border-[#5D4037] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-[0_-10px_0_#3E2723] rounded-t-[3rem] animate-in slide-in-from-bottom duration-300">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#FFCC80] text-[#5D4037] rounded-full border-4 border-[#5D4037] flex items-center justify-center hover:bg-[#FFE0B2] transition-colors shadow-[2px_2px_0_#3E2723] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-8 border-[#5D4037] rounded-b-[2rem] bg-[#81D4FA]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#D32F2F] text-white font-normal text-3xl sailor-font rounded-xl border-4 border-[#FFF] shadow-[4px_4px_0_#3E2723] transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-base line-through text-[#FFCDD2] decoration-white decoration-4 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32 relative overflow-hidden bg-[#FFF3E0]">
                        <h2 className="text-4xl sailor-font text-[#3E2723] mb-6 leading-tight transform rotate-1 drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5 relative z-10">
                            {/* --- 🏷️ VARIANT SELECTOR (3 PRICES) --- */}
                            <div>
                                <label className="block text-lg font-bold text-[#5D4037] mb-3 sailor-font ml-1 tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'FLAP', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'BUBBIE', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'CAPTAIN', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-xl border-4 transition-all flex flex-col items-center justify-between h-24 sailor-font
                                                ${variant === v.key 
                                                    ? 'bg-[#FFCC80] border-[#E65100] shadow-[3px_3px_0_#3E2723] -translate-y-1 text-[#3E2723]' 
                                                    : 'bg-[#FFF8E1] border-[#D7CCC8] text-[#A1887F] hover:border-[#8D6E63] hover:text-[#5D4037]'}`}
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
                            <div className="flex items-center justify-between py-4 mt-2 bg-[#FFF8E1] border-4 border-[#8D6E63] rounded-2xl p-4 shadow-[4px_4px_0_#5D4037]">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-[#D7CCC8] border-2 border-[#8D6E63] text-[#3E2723] rounded-full flex items-center justify-center hover:bg-[#BCAAA4] active:scale-90 transition-all font-black text-xl"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-4xl font-normal w-14 text-center text-[#3E2723] sailor-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#FFCC80] border-2 border-[#E65100] text-[#3E2723] rounded-full flex items-center justify-center hover:bg-[#FFB74D] active:scale-90 transition-all font-black text-xl"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[#8D6E63] font-bold uppercase tracking-widest mb-1">CANDY COINS</p>
                                    <p className="text-5xl font-normal text-[#3E2723] sailor-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <label className="block text-lg font-bold text-[#5D4037] mb-2 sailor-font ml-1 tracking-wide">MESSAGE IN A BOTTLE:</label>
                                <div className="relative">
                                    <textarea 
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="E.g., Extra maple syrup..." 
                                        className="w-full p-4 pl-12 bg-[#FFF8E1] border-4 border-[#D7CCC8] rounded-2xl font-bold text-[#3E2723] placeholder:text-[#BCAAA4] focus:outline-none focus:border-[#FFCC80] focus:shadow-[4px_4px_0_#FFB74D] transition-all resize-none h-28 text-lg font-serif"
                                    />
                                    <div className="absolute top-4 left-4 text-[#8D6E63]">
                                        <Icon name="pencil" size={24} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-[#FFF] border-4 border-[#5D4037] text-[#5D4037] font-bold text-xl rounded-xl active:scale-95 transition-all shadow-[4px_4px_0_#3E2723] sailor-font">
                                STOW IT
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-flapjack text-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                ADVENTURE! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (The Trap) --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#3E2723]/80 backdrop-blur-sm animate-in fade-in duration-300">
                 <div className="w-full max-w-md bg-[#FFF8E1] border-t-8 border-[#5D4037] flex flex-col shadow-[0_-10px_0_#3E2723] h-[85vh] rounded-t-[3rem] animate-in slide-in-from-bottom duration-300 relative">
                     {/* Decorative Elements */}
                     <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                        <Icon name="basket" size={64} className="text-[#81D4FA] animate-bounce" />
                     </div>

                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-2 bg-[#5D4037] rounded-full mx-auto opacity-20" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-4xl sailor-font text-[#3E2723] drop-shadow-sm transform -rotate-2">Your Loot</h2>
                         <div className="w-14 h-14 bg-[#FFCC80] text-[#3E2723] border-4 border-[#E65100] rounded-xl flex items-center justify-center font-bold text-2xl sailor-font shadow-[3px_3px_0_#3E2723]">
                             <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item: any, idx: any) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-[#8D6E63] rounded-2xl relative overflow-hidden shadow-[4px_4px_0_#5D4037]">
                                 <div className="w-4 h-full absolute left-0 top-0 bg-[#81D4FA]" />
                                 <img src={item.image_url} className="w-20 h-20 object-cover border-4 border-[#D7CCC8] rounded-xl ml-4 bg-[#EFEBE9]" />
                                 <div className="flex-1">
                                     <div className="font-bold text-[#3E2723] text-xl leading-tight sailor-font tracking-wide">
                                         {item.name} <span className="text-[#0288D1]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-sm font-bold mt-1">
                                         {item.variant !== 'normal' && <span className="bg-[#FFCC80] text-[#3E2723] px-2 py-0.5 border border-[#E65100] rounded text-xs mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-[#8D6E63] italic mt-1 text-xs">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#0288D1] text-2xl sailor-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#FFEBEE] hover:bg-[#FFCDD2] flex items-center justify-center text-[#D32F2F] border-2 border-[#FFCDD2] rounded-xl transition-colors active:scale-90 shadow-sm">
                                     <Icon name="trash" size={20} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-[#A1887F] font-bold text-xl">Bubbie is hungry...</div>
                         )}
                     </div>

                     <div className="p-8 bg-[#81D4FA] border-t-4 border-[#0288D1] relative z-30 rounded-t-[2.5rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-[#B3E5FC]">
                             <div>
                                 <p className="text-sm text-[#01579B] font-black uppercase tracking-widest">TOTAL BOUNTY</p>
                                 <p className="text-6xl font-normal text-[#FFF] sailor-font drop-shadow-md">{cartTotal}.-</p>
                             </div>
                             <div className="w-20 h-20 bg-[#FFCC80] border-4 border-[#E65100] rounded-full flex items-center justify-center text-[#3E2723] transform rotate-6 shadow-[4px_4px_0_#3E2723]">
                                 <Icon name="basket" size={40} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-flapjack text-3xl active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-[#5D4037]">
                             <span>SET SAIL!</span> <Icon name="check" size={32} strokeWidth={4} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#3E2723]/90 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
                <div className="w-full max-w-sm bg-[#FFF8E1] border-8 border-[#5D4037] p-8 text-center shadow-[10px_10px_0_#3E2723] animate-in zoom-in duration-300 relative overflow-hidden rounded-[2.5rem]">
                    <div className="w-28 h-28 bg-[#81D4FA] text-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#0288D1] shadow-[4px_4px_0_#1B5E20]">
                        <Icon name="flame" size={56} className="animate-rock" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-4xl sailor-font text-[#3E2723] mb-2 leading-tight">AHOY!</h3>
                            <p className="text-xl text-[#5D4037] mb-8 font-bold leading-tight">Add "{selectedProduct.name}" to your stash?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#FFCC80] text-[#3E2723] font-bold border-4 border-[#E65100] shadow-[4px_4px_0_#3E2723] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl sailor-font rounded-xl">YES, TAKE IT ALL!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-[#8D6E63] text-[#5D4037] font-bold text-lg active:scale-95 transition-transform hover:bg-[#EFEBE9] rounded-xl">JUST STOW IT</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl sailor-font text-[#3E2723] mb-2 leading-tight">ADVENTURE?</h3>
                            <p className="text-xl text-[#5D4037] mb-8 font-bold leading-tight">Ready to sail to Candy Island?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-[#4CAF50] text-white font-bold border-4 border-[#1B5E20] shadow-[4px_4px_0_#1B5E20] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl sailor-font rounded-xl">YES, CAPTAIN!</button>
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