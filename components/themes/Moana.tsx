import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Moana Style) ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Island / Hut
    home: <path d="M2 22 12 2l10 20H2zM12 6v4M10 14h4" />, // Hut shape
    // Menu -> Wayfinder Map / Shell
    menu: <path d="M2 6c0-2 2-4 4-4h12c2 0 4 2 4 4v12c0 2-2 4-4 4H6c-2 0-4-2-4-4V6z M8 10h8 M8 14h5" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Coconut / Kakamora
    basket: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z M9 10a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-3 5a3 3 0 0 0 3-1H9a3 3 0 0 0 3 1z" />,
    // Clock -> Sun / Star Compass
    clock: <path d="M12 2l2.5 6.5L21 11l-5 4.5 1.5 7L12 18l-5.5 4.5 1.5-7L3 11l6.5-2.5L12 2z" />,
    // Chef -> Heart of Te Fiti / Flower
    chef: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />, 
    // Star -> Fish Hook
    star: <path d="M18 6c-2-2-5-2-7 0L8 9c-1 1-1 3 0 4l3 3c1 1 3 1 4 0l1-1" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Volcano / Lava
    flame: <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    fish: <path d="M20 12l-4-4v3H6v2h10v3l4-4z" /> 
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
      {name === 'star' && <path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />}
      {name === 'chef' && <path d="M12 8c-2 0-3 2-3 4s1 4 3 4 3-2 3-4-1-4-3-4" opacity="0.5" />} {/* Spiral Detail */}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#E0F7FA] flex items-center justify-center text-[#00ACC1] font-black text-2xl">LOADING...</div>;

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
    // Theme: Moana (Ocean Blue, Green, Sandy)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#006064]">
        
        {/* ใช้ dangerouslySetInnerHTML เพื่อเลี่ยงปัญหา attribute jsx/global */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Quicksand:wght@500;700&display=swap');
            
            :root {
                --primary: #00ACC1; /* Ocean Teal */
                --primary-dark: #00838F;
                --secondary: #FF6F00; /* Sunset Orange / Lava */
                --accent: #76FF03; /* Te Fiti Green */
                --bg: #E0F7FA; /* Light Ocean */
                --sand: #FFF59D; /* Sand */
            }

            body {
                font-family: 'Quicksand', sans-serif;
                background-color: var(--bg);
                /* Beach Gradient Pattern (Deep Sea -> Shallow Water -> Sand) */
                background-image: linear-gradient(180deg, 
                    #00ACC1 0%, 
                    #4DD0E1 40%, 
                    #E0F7FA 70%, 
                    #FFF59D 90%, 
                    #FFF176 100%
                );
                background-attachment: fixed;
                background-size: 100% 100%;
                color: #006064;
            }

            .island-font {
                font-family: 'Caveat', cursive;
            }

            /* 🔥 ANIMATION: Pop Up (เด้งขึ้นมาแล้วหยุด - เหมือนเดิม) */
            @keyframes pop-up {
                0% { opacity: 0; transform: scale(0.5) translateY(50px); }
                70% { opacity: 1; transform: scale(1.05) translateY(-5px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-pop-up {
                animation: pop-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                opacity: 0; 
            }

            /* 🔥 ANIMATION: DookDik (ดุ๊กดิ๊กตลอดเวลา - เหมือนเดิม) */
            @keyframes dookdik {
                0%, 100% { transform: rotate(-3deg); }
                50% { transform: rotate(3deg); }
            }
            .animate-dookdik {
                animation: dookdik 2s ease-in-out infinite;
            }

            /* 🔥 ANIMATION: DookDik Strong (แรงๆ - เหมือนเดิม) */
            @keyframes dookdik-strong {
                0%, 100% { transform: rotate(-12deg) scale(1); }
                50% { transform: rotate(12deg) scale(1.1); }
            }
            .animate-dookdik-strong { 
                animation: dookdik-strong 0.6s ease-in-out infinite; 
            }

            @keyframes gentle-wiggle {
                0%, 100% { transform: rotate(-2deg) translateY(0); }
                50% { transform: rotate(2deg) translateY(-1px); }
            }
            .animate-gentle-wiggle { animation: gentle-wiggle 3s ease-in-out infinite; }

            @keyframes sleepyZoom {
                from { transform: scale(1); filter: brightness(1); }
                to { transform: scale(1.1); filter: brightness(1.1); }
            }

            .item-card {
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                position: relative;
                overflow: hidden;
                border: 3px solid #00838F;
                box-shadow: 4px 4px 0px #006064;
                border-radius: 1.5rem;
                background: white;
            }
            
            .item-card::after {
                content: '';
                position: absolute;
                bottom: -10px; right: -10px;
                width: 40px; height: 40px;
                background: radial-gradient(circle, #76FF03, #4CAF50);
                border-radius: 50%;
                border: 2px solid #00838F;
                z-index: 5;
                opacity: 0.8;
            }

            .item-card:active {
                transform: translate(2px, 2px);
                box-shadow: 2px 2px 0px #006064;
            }

            .btn-moana {
                background: #00ACC1;
                border: 3px solid #006064;
                box-shadow: 4px 4px 0px #006064;
                color: white;
                font-family: 'Caveat', cursive;
                font-weight: 700;
                transition: all 0.2s;
            }
            
            .btn-moana:active {
                transform: translate(2px, 2px);
                box-shadow: 2px 2px 0px #006064;
            }

            .tab-btn {
                transition: all 0.3s;
                border: 3px solid transparent;
                font-family: 'Caveat', cursive;
                font-weight: 700;
            }

            .tab-btn.active {
                background: #FF6F00 !important;
                color: white !important;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                border: 3px solid #E65100;
                transform: rotate(-2deg);
            }
            
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header --- */}
        <header className="bg-[#00BCD4] text-white pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-[0_10px_0_#00838F] z-10 border-b-4 border-white">
             {/* Wave Decoration */}
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, #fff 10%, transparent 10%)', backgroundSize: '20px 20px'}}></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     {/* Label with gentle wiggle */}
                     <div className="flex items-center gap-2 mb-2 bg-white w-fit px-4 py-1.5 rounded-full border-2 border-[#76FF03] shadow-sm animate-gentle-wiggle">
                         <span className="w-3 h-3 rounded-full bg-[#FF6F00] animate-pulse"></span>
                         <p className="text-[#00838F] text-xs font-bold tracking-wide island-font uppercase">Canoe: {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl font-black tracking-wide leading-none mt-2 island-font text-white drop-shadow-[2px_2px_0_#006064] transform rotate-1">
                         {brand?.name || "Moana's Feast"}
                     </h1>
                 </div>
                 {/* 🌸 LOGO (DookDik) - Heart of Te Fiti */}
                 <div className="w-20 h-20 bg-[#76FF03] rounded-full border-4 border-white flex items-center justify-center relative shadow-[4px_4px_0_#33691E] transform rotate-3 animate-dookdik">
                     <Icon name="chef" className="text-[#33691E] w-12 h-12" />
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#FF6F00] rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        🌸
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section>
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[2rem] overflow-hidden shadow-[6px_6px_0_#006064] mb-8 border-4 border-[#00838F] p-2 animate-pop-up" style={{animationDelay: '0s'}}>
                             <div className="h-full w-full rounded-[1.5rem] overflow-hidden border-2 border-[#76FF03] relative group">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover" 
                                    style={{animation: 'sleepyZoom 6s infinite alternate ease-in-out'}}
                                 />
                             </div>
                             <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 bg-[#FF6F00] px-6 py-2 rounded-b-xl border-x-4 border-b-4 border-[#E65100] shadow-lg">
                                 <span className="island-font text-xl text-white tracking-wider">WAYFINDER'S CHOICE!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2 animate-pop-up" style={{animationDelay: '0.1s'}}>
                         <div>
                             <h2 className="text-3xl font-black text-[#006064] island-font transform -rotate-1 drop-shadow-sm bg-white/50 px-2 rounded-lg backdrop-blur-sm">Island Specials</h2>
                             <p className="text-sm text-[#00838F] font-bold ml-1 tracking-wide bg-white px-2 rounded-full inline-block border border-[#00BCD4] shadow-sm">Fresh from the ocean.</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#006064] text-[#76FF03] px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#004D40] transition-colors island-font border-4 border-[#76FF03] shadow-[4px_4px_0_#004D40] active:translate-y-[2px] active:shadow-none text-lg">
                             SEE MAP <Icon name="menu" size={20} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             // 🍔 Food Items: Add Pop-up Animation with delay
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card group cursor-pointer animate-pop-up" style={{animationDelay: `${(idx * 0.1) + 0.2}s`}}>
                                     <div className="w-full h-36 overflow-hidden relative bg-[#E0F7FA] border-b-4 border-[#00838F]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#FF6F00] text-white text-xs font-bold px-2 py-1 rounded-xl border-2 border-white transform -rotate-6 shadow-sm island-font">
                                                ★ GIFT!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#006064] text-lg line-clamp-2 mb-1 leading-tight island-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-xs text-gray-400 line-through decoration-[#FF6F00] decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#00ACC1] font-black text-2xl island-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFF59D] text-[#FF6F00] border-2 border-[#FF6F00] flex items-center justify-center rounded-full hover:bg-[#FFD54F] transition-all shadow-[2px_2px_0_#FF6F00] active:scale-90">
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
                <section className="pt-4">
                    <div className="relative mb-8 group animate-pop-up" style={{animationDelay: '0s'}}>
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#00ACC1]" />
                         </div>
                         <input type="text" placeholder="Find coconut..." className="w-full pl-14 pr-6 py-4 rounded-3xl bg-white border-4 border-[#00838F] text-[#006064] placeholder:text-gray-400 focus:outline-none focus:border-[#76FF03] focus:shadow-[4px_4px_0_#76FF03] transition-all text-xl font-bold island-font" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1 animate-pop-up" style={{animationDelay: '0.1s'}}>
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-3 text-lg font-bold rounded-2xl flex items-center gap-2 ${selectedCategoryId === c.id ? 'active' : 'bg-white text-[#00838F] border-2 border-[#B2EBF2]'}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-24">
                        {filteredProducts?.map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             // 🍔 Food Items: Add Pop-up Animation with delay
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card group cursor-pointer animate-pop-up" style={{animationDelay: `${(idx * 0.1) + 0.2}s`}}>
                                     <div className="w-full h-36 overflow-hidden relative bg-[#E0F7FA] border-b-4 border-[#00838F]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#006064] text-lg line-clamp-2 mb-1 leading-tight island-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-xs text-gray-400 line-through decoration-[#FF6F00] decoration-2 font-bold">{pricing.original}</span>}
                                                <span className="text-[#00ACC1] font-black text-2xl island-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFF59D] text-[#FF6F00] border-2 border-[#FF6F00] flex items-center justify-center rounded-full hover:bg-[#FFD54F] transition-all shadow-[2px_2px_0_#FF6F00] active:scale-90">
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

{/* --- STATUS PAGE --- */}
            {activeTab === 'status' && (
                <section className="pt-4 pb-24 animate-pop-up">
                    <div className="mb-8 flex items-center justify-between bg-[#FF6F00] p-6 border-4 border-white rounded-[2rem] shadow-[6px_6px_0_#E65100] relative overflow-hidden">
                         <div className="relative z-10">
                             <h2 className="text-3xl font-bold island-font text-white drop-shadow-sm">Star Log</h2>
                             <p className="text-sm text-[#FFF59D] font-bold mt-1 tracking-wider">Guided by the ancestors...</p>
                         </div>
                         {/* ⏰ CLOCK (DookDik) */}
                         <div className="w-16 h-16 bg-white border-4 border-[#FF6F00] rounded-full flex items-center justify-center animate-dookdik">
                             <Icon name="clock" className="text-[#FF6F00]" size={32} />
                         </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="bg-white p-5 border-4 border-[#00838F] rounded-[2rem] relative overflow-hidden shadow-[6px_6px_0_#006064]">
                                {/* Header: Voyage ID & Status Badge */}
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-sm text-[#00838F] font-bold uppercase tracking-widest flex items-center gap-1 island-font animate-gentle-wiggle">
                                         Voyage #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wide border-2 flex items-center gap-1.5 island-font shadow-sm rounded-lg transform -rotate-1
                                        ${o.status === 'pending' ? 'bg-[#FFF9C4] text-[#F57F17] border-[#FBC02D]' : 'bg-[#E0F2F1] text-[#00695C] border-[#26A69A]'}`}>
                                         {o.status === 'pending' ? 'SAILING...' : 'ARRIVED!'}
                                     </span>
                                </div>

                                {/* Order Items List */}
                                <div className="mb-3 space-y-1 bg-[#E0F7FA] p-4 border-2 border-[#B2EBF2] rounded-xl">
                                    {o.order_items.map((i, idx) => {
                                        // 1. คำนวณราคาขายจริงรวม
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        
                                        // 2. 🧪 SIMULATION: (จำลองว่าถ้าเป็น Jumbo หรือ Special ให้มีส่วนลด เพื่อให้เห็น UI)
                                        // ถ้า Database จริงพร้อมแล้ว ให้ลบตัวแปร isSimulatedDiscount นี้ทิ้งได้เลยครับ
                                        const isSimulatedDiscount = i.variant === 'jumbo' || i.variant === 'special'; 
                                        
                                        let originalPriceTotal = finalPriceTotal;
                                        let discountAmount = 0;

                                        // 3. ตรวจสอบว่ามีส่วนลดหรือไม่ (จาก DB หรือจากการจำลอง)
                                        if ( (i.original_price && i.original_price > i.price) || i.discount > 0 || isSimulatedDiscount ) {
                                            // หาราคาต่อหน่วย (ถ้าไม่มีใน DB ให้สมมติว่าลด 50 บาท)
                                            const unitOriginal = i.original_price ? i.original_price : (i.price + (i.discount || 50)); 
                                            originalPriceTotal = unitOriginal * quantity;
                                            discountAmount = originalPriceTotal - finalPriceTotal;
                                        }

                                        const hasDiscount = discountAmount > 0;

                                        return (
                                            <div key={idx} className="flex justify-between items-start text-lg text-[#006064] font-bold mb-2 border-b border-dashed border-[#80DEEA] pb-2 last:border-0 island-font">
                                                
                                                {/* 📦 ฝั่งซ้าย: ชื่อ + รูปแบบ + โน้ต */}
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-xl">{quantity}x {i.product_name}</span>
                                                    
                                                    {/* Variant Badge */}
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] text-white px-2 py-0.5 rounded-md border-2 border-white font-sans font-bold mt-1 shadow-sm uppercase tracking-wider transform -rotate-2
                                                            ${i.variant === 'jumbo' ? 'bg-[#FFAB00]' : 'bg-[#00ACC1]'}`}>
                                                            {i.variant === 'special' ? 'MAUI' : i.variant === 'jumbo' ? 'TE KA' : i.variant}
                                                        </span>
                                                    )}

                                                    {i.note && <span className="text-xs text-[#00ACC1] italic sans-serif mt-0.5 opacity-80">"{i.note}"</span>}
                                                </div>

                                                {/* 💰 ฝั่งขวา: ราคา (จัด Layout แบบ Modal) */}
                                                <div className="text-right flex flex-col items-end min-w-[80px]">
                                                    {hasDiscount ? (
                                                        <>
                                                            {/* ป้าย SAVE */}
                                                            <span className="text-[10px] text-white bg-[#FF5252] px-1.5 py-0.5 rounded-full font-sans font-bold mb-1 shadow-sm border border-white transform rotate-6 animate-pulse">
                                                                SAVE -{discountAmount}
                                                            </span>

                                                            {/* ราคาเต็ม (ขีดฆ่า) */}
                                                            <span className="text-sm text-[#FF8A65] line-through decoration-[#E65100] decoration-2 sans-serif opacity-70 mb-0.5 font-bold">
                                                                {originalPriceTotal}
                                                            </span>

                                                            {/* ราคาขายจริง (ตัวใหญ่) */}
                                                            <span className="text-[#FF6F00] text-2xl leading-none filter drop-shadow-sm">
                                                                {finalPriceTotal}.-
                                                            </span>
                                                        </>
                                                    ) : (
                                                        // ถ้าไม่มีส่วนลด แสดงราคาปกติ
                                                        <span className="text-[#FF6F00] text-2xl">{finalPriceTotal}.-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer: Total */}
                                <div className="flex justify-between items-center pt-2 border-t-2 border-[#00838F]">
                                     <span className="font-bold text-[#00ACC1] text-sm uppercase tracking-widest island-font">TREASURE</span>
                                     <span className="font-black text-[#FF6F00] text-3xl island-font">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        
                        {/* Empty State */}
                        {(!ordersList || ordersList.length === 0) && (
                             <div className="text-center py-12 opacity-50">
                                <div className="w-20 h-20 bg-[#B2EBF2] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#00ACC1]">
                                    <Icon name="search" size={40} className="text-[#00838F]" />
                                </div>
                                <p className="island-font text-2xl text-[#00838F]">No voyages yet...</p>
                             </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[75px] bg-white shadow-[0_8px_20px_rgba(0,172,193,0.3)] flex justify-around items-center px-4 z-[90] rounded-full border-4 border-[#00838F]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'home' ? 'text-[#00ACC1]' : 'text-[#90A4AE]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#E0F7FA] border-2 border-[#00ACC1]' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'menu' ? 'text-[#00ACC1]' : 'text-[#90A4AE]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#E0F7FA] border-2 border-[#00ACC1]' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* 🧺 Big Cart Button (Coconut/Kakamora) - DookDik Animation */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#76FF03] rounded-full shadow-[0_6px_0_#33691E] flex items-center justify-center text-[#33691E] border-4 border-white active:scale-95 transition-all duration-100 z-20 group animate-dookdik">
                     <Icon name="basket" size={36} className="group-hover:scale-110 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#FF6F00] text-white text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-white animate-bounce island-font">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'status' ? 'text-[#00ACC1]' : 'text-[#90A4AE]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#E0F7FA] border-2 border-[#00ACC1]' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#006064]/60 backdrop-blur-sm">
                <div className="w-full max-w-md bg-white border-t-8 border-x-8 border-[#00838F] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-lg rounded-t-[3rem] relative animate-pop-up" style={{animationDelay: '0s'}}>
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#FFEB3B] text-[#F57F17] rounded-full border-4 border-white flex items-center justify-center hover:bg-[#FFF59D] transition-colors shadow-sm active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-8 border-[#00838F] rounded-b-[2rem] bg-[#E0F7FA]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#00ACC1] text-white font-bold text-3xl island-font rounded-xl border-4 border-white shadow-sm transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-base line-through text-[#B2EBF2] decoration-white decoration-4 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32 relative overflow-hidden bg-[#FAFAFA]">
                        <h2 className="text-4xl island-font text-[#006064] mb-6 leading-tight transform rotate-1 drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5 relative z-10">
                            {/* Size Selector */}
                            <div>
                                <label className="block text-lg font-bold text-[#00838F] mb-3 island-font ml-1 tracking-wide">CHOOSE POWER:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'MOANA', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'MAUI', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'TE KA', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-xl border-4 transition-all flex flex-col items-center justify-between h-24 island-font
                                                ${variant === v.key 
                                                    ? 'bg-[#FFF9C4] border-[#FBC02D] shadow-sm -translate-y-1 text-[#E65100]' 
                                                    : 'bg-white border-[#B2EBF2] text-[#00ACC1] hover:border-[#00ACC1] hover:text-[#00838F]'}`}
                                        >
                                            <span className="text-xs font-bold tracking-widest">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-[#FF6F00] decoration-2 opacity-70">{v.original}</span>
                                                )}
                                                <span className="text-xl font-normal">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty */}
                            <div className="flex items-center justify-between py-4 mt-2 bg-[#E0F7FA] border-4 border-[#00ACC1] rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white border-2 border-[#00ACC1] text-[#00838F] rounded-full flex items-center justify-center hover:bg-[#B2EBF2] active:scale-90 transition-all font-black text-xl"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-4xl font-normal w-14 text-center text-[#006064] island-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#00ACC1] border-2 border-[#00838F] text-white rounded-full flex items-center justify-center hover:bg-[#00838F] active:scale-90 transition-all font-black text-xl"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[#00838F] font-bold uppercase tracking-widest mb-1 island-font">TOTAL</p>
                                    <p className="text-5xl font-normal text-[#006064] island-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* Note */}
                            <div className="relative">
                                <label className="block text-lg font-bold text-[#00838F] mb-2 island-font ml-1 tracking-wide">MESSAGE IN A BOTTLE:</label>
                                <div className="relative">
                                    <textarea 
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="E.g., Extra coconuts..." 
                                        className="w-full p-4 pl-12 bg-white border-4 border-[#B2EBF2] rounded-2xl font-bold text-[#006064] placeholder:text-[#80DEEA] focus:outline-none focus:border-[#00ACC1] focus:shadow-sm transition-all resize-none h-28 text-lg island-font"
                                    />
                                    <div className="absolute top-4 left-4 text-[#00ACC1]">
                                        <Icon name="pencil" size={24} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-[#FFF] border-4 border-[#00ACC1] text-[#00838F] font-bold text-xl rounded-xl active:scale-95 transition-all shadow-sm island-font">
                                STOW IT
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-moana text-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                SET SAIL! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#006064]/80 backdrop-blur-sm">
                 <div className="w-full max-w-md bg-white border-t-8 border-[#00838F] flex flex-col shadow-lg h-[85vh] rounded-t-[3rem] relative animate-pop-up" style={{animationDelay: '0s'}}>
                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-2 bg-[#00838F] rounded-full mx-auto opacity-20" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-4xl island-font text-[#006064] drop-shadow-sm transform -rotate-2">Your Stash</h2>
                         <div className="w-14 h-14 bg-[#FFF9C4] text-[#E65100] border-4 border-[#FBC02D] rounded-xl flex items-center justify-center font-bold text-2xl island-font shadow-sm">
                             <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-[#E0F7FA] rounded-2xl relative overflow-hidden shadow-sm animate-pop-up" style={{animationDelay: `${idx * 0.1}s`}}>
                                 <div className="w-4 h-full absolute left-0 top-0 bg-[#00ACC1]" />
                                 <img src={item.image_url} className="w-20 h-20 object-cover border-4 border-[#B2EBF2] rounded-xl ml-4 bg-[#FAFAFA]" />
                                 <div className="flex-1">
                                     <div className="font-bold text-[#006064] text-xl leading-tight island-font tracking-wide">
                                         {item.name} <span className="text-[#00ACC1]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-sm font-bold mt-1">
                                         {item.variant !== 'normal' && <span className="bg-[#FFF9C4] text-[#E65100] px-2 py-0.5 border border-[#FBC02D] rounded text-xs mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-[#00838F] italic mt-1 text-xs">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#00838F] text-2xl island-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#FFEBEE] hover:bg-[#FFCDD2] flex items-center justify-center text-[#FF5722] border-2 border-[#FFCDD2] rounded-xl transition-colors active:scale-90 shadow-sm">
                                     <Icon name="trash" size={20} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-[#B2EBF2] font-bold text-xl island-font">Basket is empty...</div>
                         )}
                     </div>

                     <div className="p-8 bg-[#00ACC1] border-t-4 border-[#00838F] relative z-30 rounded-t-[2.5rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-[#B2EBF2]">
                             <div>
                                 <p className="text-sm text-[#E0F7FA] font-black uppercase tracking-widest island-font">TOTAL</p>
                                 <p className="text-6xl font-normal text-white island-font drop-shadow-md">{cartTotal}.-</p>
                             </div>
                             <div className="w-20 h-20 bg-[#76FF03] border-4 border-white rounded-full flex items-center justify-center text-[#33691E] transform rotate-6 shadow-sm">
                                 <Icon name="basket" size={40} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-moana text-3xl active:scale-95 transition-all flex items-center justify-center gap-3 border-4 border-white">
                             <span>VOYAGE!</span> <Icon name="check" size={32} strokeWidth={4} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#006064]/90 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-pop-up" style={{animationDelay: '0s'}}>
                <div className="w-full max-w-sm bg-[#FFFDE7] border-8 border-[#FF6F00] p-8 text-center shadow-lg rounded-[2.5rem]">
                    <div className="w-28 h-28 bg-[#76FF03] text-[#33691E] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#00838F] shadow-sm">
                        <Icon name="flame" size={56} className="animate-dookdik" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-4xl island-font text-[#E65100] mb-2 leading-tight">YAY!</h3>
                            <p className="text-xl text-[#00838F] mb-8 font-bold leading-tight island-font">Add "{selectedProduct.name}" to your stash?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#FFD740] text-[#E65100] font-bold border-4 border-[#FFA000] shadow-sm active:scale-95 transition-all text-xl island-font rounded-xl">YES, I WANT IT!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-[#00ACC1] text-[#00838F] font-bold text-lg active:scale-95 transition-transform hover:bg-[#E0F7FA] rounded-xl island-font">JUST ADD</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl island-font text-[#E65100] mb-2 leading-tight">READY?</h3>
                            <p className="text-xl text-[#00838F] mb-8 font-bold leading-tight island-font">Time to sail and eat?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-[#00ACC1] text-white font-bold border-4 border-[#00838F] shadow-sm active:scale-95 transition-all text-xl island-font rounded-xl">YES, GO!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-[#00ACC1] text-[#00838F] font-bold text-lg active:scale-95 transition-transform hover:bg-[#E0F7FA] rounded-xl island-font">NOT YET!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}