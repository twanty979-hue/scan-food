import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Sugarcube Corner / Pinkie Pie Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Gingerbread House / Sugarcube Corner
    home: <path d="M3 10L12 2l9 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10z M12 12c-2 0-3 2-3 4s1 4 3 4 3-2 3-4-1-4-3-4z" />, 
    // Menu -> Recipe Scroll
    menu: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Party Balloon
    basket: <path d="M12 2C7.58 2 4 5.58 4 10c0 4.42 3.58 8 8 8s8-3.58 8-8c0-4.42-3.58-8-8-8zm0 18c-1.1 0-2 .9-2 2h4c0-1.1-.9-2-2-2z M12 22v2" />,
    // Clock -> Cuckoo Clock / Timer
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Cupcake
    chef: <path d="M12 2C9 2 7 4 7 7c0 1.5 1 3 2.5 3.5C8 11.5 6 13 6 16v4h12v-4c0-3-2-4.5-3.5-5.5C16 10 17 8.5 17 7c0-3-2-5-5-5z M8 16c0-1 2-2 4-2s4 1 4 2v2H8v-2z" />, 
    // Star -> Sparkle / Cutie Mark
    star: <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Party Cannon / Confetti
    flame: <path d="M12 2L2 22h20L12 2zm0 4l6 12H6l6-12z" />, // Triangle blast shape
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    // Smile / Pinkie Sense
    smile: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm-5-6.5c1.5 2.5 4 3 5 3s3.5-.5 5-3" />
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
      {name === 'basket' && <path d="M12 10v4" strokeWidth="2"/>} {/* Balloon String */}
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
    // Theme: Sugarcube Corner (My Little Pony)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#880E4F]">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Chewy&family=Fredoka:wght@400;700&family=Mali:wght@400;700&display=swap');
            
            :root {
                --primary: #F48FB1; /* Pinkie Pink */
                --primary-dark: #EC407A;
                --secondary: #81D4FA; /* Rainbow Blue */
                --accent: #FFF176; /* Fluttershy Yellow */
                --choco: #880E4F; /* Dark Raspberry Text */
                --cream: #FFF9C4; /* Frosting */
            }

            body {
                font-family: 'Mali', cursive;
                background-color: #F8BBD0; /* Base Pink */
                /* --- 🧁 CUPCAKE SPRINKLES PATTERN --- */
                background-image: 
                    radial-gradient(#4DD0E1 20%, transparent 20%),
                    radial-gradient(#FFF176 20%, transparent 20%),
                    radial-gradient(#F06292 20%, transparent 20%);
                background-size: 30px 30px;
                background-position: 0 0, 15px 15px, 7px 22px;
                background-attachment: fixed;
            }

            .party-font {
                font-family: 'Chewy', cursive;
            }

            .bubbly-font {
                font-family: 'Fredoka', sans-serif;
            }

            @keyframes bounce-party {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px) rotate(2deg); }
            }

            .animate-party { animation: bounce-party 0.5s infinite; }

            .btn-pinkie {
                background: linear-gradient(135deg, #F48FB1, #F06292);
                color: white;
                border: 4px solid white;
                border-radius: 2rem;
                font-family: 'Chewy', cursive;
                box-shadow: 0 4px 0 #AD1457, 0 6px 10px rgba(0,0,0,0.1);
                transition: all 0.1s;
            }
            .btn-pinkie:active {
                transform: translateY(4px);
                box-shadow: 0 0 0 #AD1457;
            }

            .sweet-card {
                background: white;
                border: 4px solid #F06292;
                border-radius: 2rem;
                box-shadow: 6px 6px 0 #81D4FA;
                transition: all 0.2s;
                position: relative;
                overflow: hidden;
            }
            .sweet-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; height: 10px;
                background: repeating-linear-gradient(90deg, #F06292 0, #F06292 10px, white 10px, white 20px);
            }
            .sweet-card:active {
                transform: translate(3px, 3px);
                box-shadow: 3px 3px 0 #81D4FA;
            }

            .tab-btn {
                background: #E1F5FE;
                color: #0277BD;
                border: 2px solid #81D4FA;
                border-radius: 1.5rem;
                transition: all 0.3s;
                font-family: 'Chewy', cursive;
            }
            .tab-btn.active {
                background: #FFF176;
                color: #E65100;
                border-color: #FFCA28;
                box-shadow: 0 4px 0 #F57F17;
                transform: translateY(-2px);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* --- Header (Sugarcube Corner) --- */}
        <header className="bg-[#F06292] text-white pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-xl z-10 border-b-8 border-white">
             {/* Frosting decoration */}
             <div className="absolute top-0 left-0 right-0 h-4 bg-white/30" 
                  style={{
                      maskImage: 'radial-gradient(circle at 10px 10px, black 10px, transparent 0)',
                      maskSize: '20px 20px',
                      WebkitMaskImage: 'radial-gradient(circle at 10px 10px, black 10px, transparent 0)',
                      WebkitMaskSize: '20px 20px'
                  }} 
             />
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-white w-fit px-4 py-1.5 rounded-full border-2 border-[#81D4FA] shadow-sm transform -rotate-2">
                         <span className="w-3 h-3 rounded-full bg-[#FFEB3B] animate-spin"></span>
                         <p className="text-[#EC407A] text-xs font-bold tracking-widest uppercase bubbly-font">Party Table: {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl font-normal tracking-wide leading-none mt-2 party-font text-white drop-shadow-[2px_2px_0_#AD1457] transform rotate-1">
                         {brand?.name || "Sugarcube Corner"}
                     </h1>
                 </div>
                 {/* Cupcake Icon */}
                 <div className="w-20 h-20 bg-[#FFF] rounded-full border-4 border-[#81D4FA] flex items-center justify-center relative shadow-[0_4px_0_#4FC3F7] transform rotate-3 animate-party">
                     <Icon name="chef" className="text-[#EC407A] w-12 h-12" />
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#FFEB3B] rounded-full border-2 border-white flex items-center justify-center text-[#F57F17] text-xs font-bold shadow-sm">
                        🎉
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
                        <div className="relative w-full h-56 bg-[#FFF9C4] rounded-[2rem] overflow-hidden shadow-[6px_6px_0_#EC407A] mb-8 border-4 border-white p-2">
                             <div className="h-full w-full rounded-[1.5rem] overflow-hidden border-2 border-[#F48FB1] relative">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                             </div>
                             <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 bg-[#81D4FA] px-6 py-2 rounded-b-xl border-x-4 border-b-4 border-white shadow-lg">
                                 <span className="party-font text-xl text-white tracking-wider">PARTY SPECIAL!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                         <div>
                             <h2 className="text-3xl font-normal text-[#C2185B] party-font transform -rotate-1 drop-shadow-sm">Yummy Treats!</h2>
                             <p className="text-sm text-[#0277BD] font-bold ml-1 tracking-wide bg-[#E1F5FE] px-2 rounded-full inline-block">Smile, smile, smile!</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#FFF176] text-[#E65100] px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#FFEE58] transition-colors party-font border-4 border-white shadow-[0_4px_0_#FBC02D] active:translate-y-[2px] active:shadow-none text-lg">
                             SEE MENU <Icon name="menu" size={20} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="sweet-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#FCE4EC] border-b-4 border-[#F06292]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#81D4FA] text-white text-xs font-bold px-2 py-1 rounded-md border-2 border-white transform -rotate-6 shadow-sm bubbly-font">
                                                MAGIC DEAL!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#880E4F] text-lg line-clamp-2 mb-1 leading-tight party-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-xs text-gray-400 line-through decoration-[#F06292] decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#EC407A] font-black text-2xl party-font leading-none drop-shadow-[1px_1px_0_#FCE4EC]">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFEB3B] text-[#E65100] border-2 border-[#FDD835] flex items-center justify-center rounded-full hover:bg-[#FFF59D] transition-all shadow-[0_2px_0_#F9A825] active:translate-y-1 active:shadow-none">
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
                <section className="animate-jelly pt-4">
                    <div className="relative mb-8 group">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#EC407A]" />
                         </div>
                         <input type="text" placeholder="Search for treats..." className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border-4 border-[#F48FB1] text-[#880E4F] placeholder:text-[#F8BBD0] focus:outline-none focus:border-[#81D4FA] focus:shadow-[0_4px_0_#81D4FA] transition-all text-xl font-bold bubbly-font" />
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
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="sweet-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#FCE4EC] border-b-4 border-[#F06292]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#880E4F] text-lg line-clamp-2 mb-1 leading-tight party-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-xs text-gray-400 line-through decoration-[#F06292] decoration-2 font-bold">{pricing.original}</span>}
                                                <span className="text-[#EC407A] font-black text-2xl party-font leading-none drop-shadow-[1px_1px_0_#FCE4EC]">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFEB3B] text-[#E65100] border-2 border-[#FDD835] flex items-center justify-center rounded-full hover:bg-[#FFF59D] transition-all shadow-[0_2px_0_#F9A825] active:translate-y-1 active:shadow-none">
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

            {/* --- STATUS PAGE (Pinkie Pie / Party Theme) --- */}
{activeTab === 'status' && (
    <section className="animate-jelly pt-4 pb-24">
        {/* Header: Party Log */}
        <div className="mb-8 flex items-center justify-between bg-[#F06292] p-6 border-4 border-white rounded-[2rem] shadow-[6px_6px_0_#81D4FA] relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#F8BBD0] rounded-full border-4 border-white opacity-50"></div>
             <div className="relative z-10">
                 <h2 className="text-3xl font-normal party-font text-white drop-shadow-md">Party Log</h2>
                 <p className="text-sm text-[#FFEB3B] font-bold mt-1 tracking-wider">Are the cupcakes ready?</p>
             </div>
             {/* Clock Icon */}
             <div className="w-16 h-16 bg-white border-4 border-[#F06292] rounded-full flex items-center justify-center animate-spin-slow">
                 <Icon name="clock" className="text-[#F06292]" size={32} />
             </div>
        </div>

        <div className="space-y-4">
            {ordersList?.map((o: any) => (
                <div key={o.id} className="bg-white p-5 border-4 border-[#81D4FA] rounded-[2rem] relative overflow-hidden shadow-[6px_6px_0_#4FC3F7]">
                    
                    {/* Header: Party ID & Status */}
                    <div className="flex justify-between items-start mb-4">
                         <span className="text-sm text-[#0277BD] font-bold uppercase tracking-widest flex items-center gap-1 bubbly-font">
                             Party #{o.id.slice(-4)}
                         </span>
                         <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wide border-2 flex items-center gap-1.5 bubbly-font shadow-sm rounded-lg transform -rotate-1
                             ${o.status === 'pending' ? 'bg-[#FFF9C4] text-[#F57F17] border-[#FBC02D]' : 'bg-[#E1F5FE] text-[#0288D1] border-[#4FC3F7]'}`}>
                             {o.status === 'pending' ? 'BAKING...' : 'READY!'}
                         </span>
                    </div>

                    {/* Order Items List */}
                    <div className="mb-3 space-y-1 bg-[#F3E5F5] p-4 border-2 border-[#E1BEE7] rounded-xl">
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
                                <div key={idx} className="flex justify-between items-start text-lg text-[#880E4F] font-bold mb-2 border-b border-dashed border-[#F48FB1] pb-2 last:border-0 bubbly-font">
                                    
                                    {/* Left: Info */}
                                    <div className="flex flex-col items-start pr-2">
                                        <span className="leading-tight text-xl">{quantity}x {i.product_name}</span>
                                        
                                        {/* Variant Badge (Cupcake Style) */}
                                        {i.variant !== 'normal' && (
                                            <span className={`text-[10px] bg-[#F06292] text-white px-2 py-0.5 rounded-full border border-white font-sans font-bold mt-1 shadow-sm uppercase tracking-wider transform -rotate-2`}>
                                                {i.variant === 'special' ? '🧁 SPECIAL' : i.variant === 'jumbo' ? '🎂 HUGE' : i.variant}
                                            </span>
                                        )}

                                        {/* Note */}
                                        {i.note && <span className="text-xs text-[#EC407A] italic sans-serif mt-0.5">"{i.note}"</span>}
                                    </div>

                                    {/* Right: Price */}
                                    <div className="text-right flex flex-col items-end min-w-[80px]">
                                        {hasDiscount ? (
                                            <>
                                                {/* 🔥 ป้าย SAVE (Party Pop Style) */}
                                                <span className="text-[10px] text-white bg-[#AB47BC] px-2 py-0.5 rounded-full font-sans font-bold mb-1 shadow-sm border border-white transform rotate-3 animate-bounce">
                                                    SAVE -{discountAmount}
                                                </span>

                                                {/* ราคาเต็ม (ขีดฆ่า) */}
                                                <span className="text-sm text-[#F06292] line-through decoration-[#AB47BC] decoration-2 sans-serif opacity-70 mb-0.5 font-bold">
                                                    {originalPriceTotal}
                                                </span>

                                                {/* ราคาจริง */}
                                                <span className="text-[#AD1457] text-2xl leading-none drop-shadow-sm">
                                                    {finalPriceTotal}.-
                                                </span>
                                            </>
                                        ) : (
                                            // ราคาปกติ
                                            <span className="text-[#AD1457] text-2xl">{finalPriceTotal}.-</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer: Total */}
                    <div className="flex justify-between items-center pt-2 border-t-2 border-[#F06292]">
                         <span className="font-bold text-[#F06292] text-sm uppercase tracking-widest bubbly-font">TOTAL FUN</span>
                         <span className="font-black text-[#880E4F] text-3xl party-font">
                             {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                         </span>
                    </div>
                </div>
            ))}
            
            {/* Empty State */}
            {(!ordersList || ordersList.length === 0) && (
                 <div className="text-center py-12 opacity-50">
                    <div className="w-20 h-20 bg-[#FCE4EC] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#F06292] animate-bounce">
                        <Icon name="search" size={40} className="text-[#F06292]" />
                    </div>
                    <p className="party-font text-2xl text-[#880E4F]">Party hasn't started yet!</p>
                 </div>
            )}
        </div>
    </section>
)}

        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[75px] bg-white shadow-[0_8px_20px_rgba(240,98,146,0.3)] flex justify-around items-center px-4 z-[90] rounded-full border-4 border-[#F06292]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'home' ? 'text-[#EC407A]' : 'text-[#F48FB1]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#FCE4EC] border-2 border-[#F06292]' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'menu' ? 'text-[#EC407A]' : 'text-[#F48FB1]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#FCE4EC] border-2 border-[#F06292]' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* Big Cart Button (Balloon) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#81D4FA] rounded-full shadow-[0_6px_0_#0288D1] flex items-center justify-center text-white border-4 border-white active:shadow-none active:translate-y-[6px] transition-all duration-100 z-20 group animate-party">
                     <Icon name="basket" size={36} className="group-hover:scale-110 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#F50057] text-white text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-white animate-bounce bubbly-font">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'status' ? 'text-[#EC407A]' : 'text-[#F48FB1]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#FCE4EC] border-2 border-[#F06292]' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Recipe Book) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#880E4F]/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-full max-w-md bg-white border-t-8 border-x-8 border-[#F06292] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-[0_-10px_0_#C2185B] rounded-t-[3rem] animate-in slide-in-from-bottom duration-300">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#FFEB3B] text-[#F57F17] rounded-full border-4 border-white flex items-center justify-center hover:bg-[#FFF59D] transition-colors shadow-[0_4px_0_#FBC02D] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-8 border-[#F06292] rounded-b-[2rem] bg-[#81D4FA]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#EC407A] text-white font-normal text-3xl party-font rounded-xl border-4 border-white shadow-[0_4px_0_#AD1457] transform -rotate-3 flex flex-col items-center leading-none">
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

                    <div className="px-8 pt-8 pb-32 relative overflow-hidden bg-[#FFFDE7]">
                        <h2 className="text-4xl party-font text-[#C2185B] mb-6 leading-tight transform rotate-1 drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5 relative z-10">
                            {/* --- 🏷️ VARIANT SELECTOR (3 PRICES) --- */}
                            <div>
                                <label className="block text-lg font-bold text-[#EC407A] mb-3 bubbly-font ml-1 tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'CUPCAKE', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'CAKE', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'PARTY', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-xl border-4 transition-all flex flex-col items-center justify-between h-24 party-font
                                                ${variant === v.key 
                                                    ? 'bg-[#FFEB3B] border-[#FBC02D] shadow-[0_4px_0_#F57F17] -translate-y-1 text-[#E65100]' 
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
                            <div className="flex items-center justify-between py-4 mt-2 bg-white border-4 border-[#F06292] rounded-2xl p-4 shadow-[0_4px_0_#F8BBD0]">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-[#B3E5FC] border-2 border-[#81D4FA] text-[#0277BD] rounded-full flex items-center justify-center hover:bg-[#81D4FA] active:scale-90 transition-all font-black text-xl"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-4xl font-normal w-14 text-center text-[#880E4F] party-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#F48FB1] border-2 border-[#F06292] text-white rounded-full flex items-center justify-center hover:bg-[#F06292] active:scale-90 transition-all font-black text-xl"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[#EC407A] font-bold uppercase tracking-widest mb-1 bubbly-font">BITS</p>
                                    <p className="text-5xl font-normal text-[#880E4F] party-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <label className="block text-lg font-bold text-[#EC407A] mb-2 bubbly-font ml-1 tracking-wide">SPECIAL REQUESTS:</label>
                                <div className="relative">
                                    <textarea 
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="E.g., Extra sprinkles, More frosting..." 
                                        className="w-full p-4 pl-12 bg-white border-4 border-[#F48FB1] rounded-2xl font-bold text-[#880E4F] placeholder:text-[#F8BBD0] focus:outline-none focus:border-[#F06292] focus:shadow-[0_4px_0_#F8BBD0] transition-all resize-none h-28 text-lg bubbly-font"
                                    />
                                    <div className="absolute top-4 left-4 text-[#F06292]">
                                        <Icon name="pencil" size={24} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-[#FFF] border-4 border-[#F06292] text-[#EC407A] font-bold text-xl rounded-xl active:scale-95 transition-all shadow-[0_4px_0_#F8BBD0] party-font">
                                ADD TO CART
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-pinkie text-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                PARTY TIME! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (The Trap) --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#880E4F]/80 backdrop-blur-sm animate-in fade-in duration-300">
                 <div className="w-full max-w-md bg-[#FFF] border-t-8 border-[#F06292] flex flex-col shadow-[0_-10px_0_#AD1457] h-[85vh] rounded-t-[3rem] animate-in slide-in-from-bottom duration-300 relative">
                     {/* Decorative Elements */}
                     <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                        <Icon name="basket" size={64} className="text-[#81D4FA] animate-party" />
                     </div>

                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-2 bg-[#F06292] rounded-full mx-auto opacity-20" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-4xl party-font text-[#C2185B] drop-shadow-sm transform -rotate-2">Your Treats</h2>
                         <div className="w-14 h-14 bg-[#FFEB3B] text-[#E65100] border-4 border-[#FBC02D] rounded-xl flex items-center justify-center font-bold text-2xl party-font shadow-[0_4px_0_#F9A825]">
                             <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item: any, idx: any) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-[#F8BBD0] rounded-2xl relative overflow-hidden shadow-[0_4px_0_#FCE4EC]">
                                 <div className="w-4 h-full absolute left-0 top-0 bg-[#F06292]" />
                                 <img src={item.image_url} className="w-20 h-20 object-cover border-4 border-[#F48FB1] rounded-xl ml-4 bg-[#FCE4EC]" />
                                 <div className="flex-1">
                                     <div className="font-bold text-[#880E4F] text-xl leading-tight party-font tracking-wide">
                                         {item.name} <span className="text-[#EC407A]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-sm font-bold mt-1">
                                         {item.variant !== 'normal' && <span className="bg-[#FFEB3B] text-[#E65100] px-2 py-0.5 border border-[#FBC02D] rounded text-xs mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-[#EC407A] italic mt-1 text-xs">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#0288D1] text-2xl party-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#FFEBEE] hover:bg-[#FFCDD2] flex items-center justify-center text-[#D32F2F] border-2 border-[#FFCDD2] rounded-xl transition-colors active:scale-90 shadow-sm">
                                     <Icon name="trash" size={20} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-[#F48FB1] font-bold text-xl bubbly-font">Basket is empty...</div>
                         )}
                     </div>

                     <div className="p-8 bg-[#81D4FA] border-t-4 border-[#4FC3F7] relative z-30 rounded-t-[2.5rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-[#E1F5FE]">
                             <div>
                                 <p className="text-sm text-[#01579B] font-black uppercase tracking-widest bubbly-font">TOTAL BITS</p>
                                 <p className="text-6xl font-normal text-[#FFF] party-font drop-shadow-md">{cartTotal}.-</p>
                             </div>
                             <div className="w-20 h-20 bg-[#FFEB3B] border-4 border-[#FBC02D] rounded-full flex items-center justify-center text-[#E65100] transform rotate-6 shadow-[0_4px_0_#F57F17]">
                                 <Icon name="basket" size={40} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-pinkie text-3xl active:scale-95 transition-all flex items-center justify-center gap-3 border-4 border-white">
                             <span>THROW PARTY!</span> <Icon name="check" size={32} strokeWidth={4} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#880E4F]/90 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
                <div className="w-full max-w-sm bg-[#FFFDE7] border-8 border-[#F06292] p-8 text-center shadow-[0_10px_0_#C2185B] animate-in zoom-in duration-300 relative overflow-hidden rounded-[2.5rem]">
                    <div className="w-28 h-28 bg-[#81D4FA] text-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#4FC3F7] shadow-[0_4px_0_#0288D1]">
                        <Icon name="flame" size={56} className="animate-party" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-4xl party-font text-[#C2185B] mb-2 leading-tight">YAY!</h3>
                            <p className="text-xl text-[#F06292] mb-8 font-bold leading-tight bubbly-font">Add "{selectedProduct.name}" to your basket?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#FFEB3B] text-[#E65100] font-bold border-4 border-[#FBC02D] shadow-[0_4px_0_#F57F17] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl party-font rounded-xl">YES, PARTY!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-[#F48FB1] text-[#F06292] font-bold text-lg active:scale-95 transition-transform hover:bg-[#FCE4EC] rounded-xl bubbly-font">JUST ADD</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl party-font text-[#C2185B] mb-2 leading-tight">READY?</h3>
                            <p className="text-xl text-[#F06292] mb-8 font-bold leading-tight bubbly-font">Time to start the party?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-[#F06292] text-white font-bold border-4 border-[#EC407A] shadow-[0_4px_0_#AD1457] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl party-font rounded-xl">YES, LET'S GO!</button>
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