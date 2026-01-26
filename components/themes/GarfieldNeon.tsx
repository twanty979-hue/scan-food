import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    home: <path d="M3 10L12 2l9 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10z M12 12c-2 0-3 2-3 4s1 4 3 4 3-2 3-4-1-4-3-4z" />, 
    menu: <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="3" strokeLinecap="round" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    basket: <path d="M2 12c0 5 4 9 9 9s9-4 9-9-4-9-9-9c-2 0-4 .5-6 1.5 M2 12l6 3 4-2 4 2 6-3" />,
    clock: <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z M12 6v6l4 2 M20 2l-2 2 M4 2l2 2" />,
    chef: <path d="M12 2c-4 0-8 4-8 9 0 4.5 3.5 8 8 8s8-3.5 8-8c0-5-4-9-8-9zm0 14c-1.5 0-3-1-3-2.5S10.5 11 12 11s3 1 3 2.5S13.5 16 12 16z" />, 
    star: <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
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
      {name === 'clock' && <path d="M12 6v6l4 2" />}
      {name === 'star' && <circle cx="12" cy="12" r="3" fill="currentColor" />} 
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#fffbeb] flex items-center justify-center text-[#fb923c] font-black text-2xl">LOADING...</div>;

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
    // เอา bg-[#fffbeb] ออกเพื่อให้เห็นพื้นหลัง body ที่เป็นจุดส้มชัดๆ
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#1f2937]">
        
        {/* ใช้ dangerouslySetInnerHTML เพื่อเลี่ยงปัญหา attribute jsx/global */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Mali:wght@400;700&family=Sarabun:wght@400;600&display=swap');
            
            :root {
                --primary: #fb923c; /* Orange 400 */
                --primary-dark: #c2410c; /* Orange 700 */
                --accent: #1f2937; /* Black/Gray */
                --bg: #ffffff; /* เปลี่ยนเป็นขาวล้วน เพื่อให้จุดส้มเด่น */
                --yellow: #fcd34d;
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg);
                /* จุดส้มชัดๆ บนพื้นขาว */
                background-image: radial-gradient(#fb923c 20%, transparent 20%), radial-gradient(#fb923c 20%, transparent 20%);
                background-position: 0 0, 25px 25px;
                background-size: 50px 50px;
                background-attachment: fixed;
                color: #1f2937;
            }

            .cat-font {
                font-family: 'Mali', cursive;
            }

            /* 🔥 ANIMATION: Pop Up (เด้งขึ้นมาแล้วหยุด) */
            @keyframes pop-up {
                0% { opacity: 0; transform: scale(0.5) translateY(50px); }
                70% { opacity: 1; transform: scale(1.05) translateY(-5px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-pop-up {
                animation: pop-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                opacity: 0; /* ซ่อนไว้ก่อนเริ่มอนิเมชัน */
            }

            /* 🔥 ANIMATION: DookDik (ดุ๊กดิ๊กตลอดเวลา) */
            @keyframes dookdik {
                0%, 100% { transform: rotate(-5deg) scale(1); }
                50% { transform: rotate(5deg) scale(1.1); }
            }
            .animate-dookdik {
                animation: dookdik 2s ease-in-out infinite;
            }

            @keyframes sleepyZoom {
                from { transform: scale(1); filter: brightness(1); }
                to { transform: scale(1.1); filter: brightness(1.1); }
            }

            .item-card {
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                position: relative;
                overflow: hidden;
                border: 3px solid #000;
                box-shadow: 4px 4px 0px #000;
                border-radius: 1.5rem;
                background: white;
            }
            
            .item-card::after {
                content: '';
                position: absolute;
                bottom: -10px; right: -10px;
                width: 40px; height: 40px;
                background: repeating-linear-gradient(45deg, var(--primary), var(--primary) 5px, var(--primary-dark) 5px, var(--primary-dark) 10px);
                border-radius: 50%;
                border: 2px solid #000;
                z-index: 5;
            }

            .item-card:active {
                transform: translate(2px, 2px);
                box-shadow: 2px 2px 0px #000;
            }

            .btn-cat {
                background: #fb923c;
                border: 3px solid #000;
                box-shadow: 4px 4px 0px #000;
                color: #000;
                font-family: 'Mali', cursive;
                font-weight: 700;
                transition: all 0.2s;
            }
            
            .btn-cat:active {
                transform: translate(2px, 2px);
                box-shadow: 2px 2px 0px #000;
            }

            .tab-btn {
                transition: all 0.3s;
                border: 3px solid transparent;
                font-family: 'Mali', cursive;
                font-weight: 700;
            }

            .tab-btn.active {
                background: #000 !important;
                color: #fb923c !important;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                border: 3px solid #000;
                transform: rotate(-2deg);
            }
            
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header --- */}
        <header className="bg-[#fb923c] text-black pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-[0_10px_0_#c2410c] z-10 border-b-4 border-black">
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-black w-fit px-4 py-1.5 rounded-full border-2 border-white shadow-sm transform -rotate-2">
                         <span className="w-3 h-3 rounded-full bg-[#fb923c] animate-pulse"></span>
                         <p className="text-white text-xs font-bold tracking-wide cat-font uppercase">Table: {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl font-black tracking-wide leading-none mt-2 cat-font text-white drop-shadow-[3px_3px_0_#000] transform rotate-1">
                         {brand?.name || "Garfield's Eats"}
                     </h1>
                 </div>
                 {/* 🐱 LOGO (DookDik) */}
                 <div className="w-20 h-20 bg-[#fcd34d] rounded-full border-4 border-black flex items-center justify-center relative shadow-[4px_4px_0_#000] transform rotate-3 animate-dookdik">
                     <Icon name="chef" className="text-black w-12 h-12" />
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#fb923c] rounded-full border-2 border-black flex items-center justify-center text-black text-xs font-bold shadow-sm">
                        🐱
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section>
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[2rem] overflow-hidden shadow-[6px_6px_0_#000] mb-8 border-4 border-black p-2 animate-pop-up" style={{animationDelay: '0s'}}>
                             <div className="h-full w-full rounded-[1.5rem] overflow-hidden border-2 border-[#fb923c] relative group">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover" 
                                    style={{animation: 'sleepyZoom 6s infinite alternate ease-in-out'}}
                                 />
                             </div>
                             <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 bg-[#000] px-6 py-2 rounded-b-xl border-x-4 border-b-4 border-[#fb923c] shadow-lg">
                                 <span className="cat-font text-xl text-[#fb923c] tracking-wider">I HATE MONDAYS!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2 animate-pop-up" style={{animationDelay: '0.1s'}}>
                         <div>
                             <h2 className="text-3xl font-black text-[#c2410c] cat-font transform -rotate-1 drop-shadow-sm bg-white/80 px-2 rounded-lg">Lasagna Time!</h2>
                             <p className="text-sm text-[#1f2937] font-bold ml-1 tracking-wide bg-white px-2 rounded-full inline-block border border-black shadow-sm">Feed me now.</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-black text-[#fb923c] px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#333] transition-colors cat-font border-4 border-[#fb923c] shadow-[4px_4px_0_#000] active:translate-y-[2px] active:shadow-none text-lg">
                             SEE FOOD <Icon name="menu" size={20} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             // 🍔 Food Items: Add Pop-up Animation with delay
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card group cursor-pointer animate-pop-up" style={{animationDelay: `${(idx * 0.1) + 0.2}s`}}>
                                     <div className="w-full h-36 overflow-hidden relative bg-[#fffbeb] border-b-4 border-black">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#fb923c] text-black text-xs font-bold px-2 py-1 rounded-xl border-2 border-black transform -rotate-6 shadow-sm cat-font">
                                                ★ YUM!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-black text-lg line-clamp-2 mb-1 leading-tight cat-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-xs text-gray-400 line-through decoration-[#fb923c] decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#c2410c] font-black text-2xl cat-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#fcd34d] text-black border-2 border-black flex items-center justify-center rounded-full hover:bg-[#fb923c] transition-all shadow-[2px_2px_0_#000] active:scale-90">
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
                             <Icon name="search" className="text-[#fb923c]" />
                         </div>
                         <input type="text" placeholder="Find lasagna..." className="w-full pl-14 pr-6 py-4 rounded-3xl bg-white border-4 border-black text-black placeholder:text-gray-400 focus:outline-none focus:border-[#fb923c] focus:shadow-[4px_4px_0_#fb923c] transition-all text-xl font-bold cat-font" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1 animate-pop-up" style={{animationDelay: '0.1s'}}>
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-3 text-lg font-bold rounded-2xl flex items-center gap-2 ${selectedCategoryId === c.id ? 'active' : 'bg-white text-gray-500 border-2 border-gray-200'}`}>
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
                                     <div className="w-full h-36 overflow-hidden relative bg-[#fffbeb] border-b-4 border-black">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-black text-lg line-clamp-2 mb-1 leading-tight cat-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-xs text-gray-400 line-through decoration-[#fb923c] decoration-2 font-bold">{pricing.original}</span>}
                                                <span className="text-[#c2410c] font-black text-2xl cat-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#fcd34d] text-black border-2 border-black flex items-center justify-center rounded-full hover:bg-[#fb923c] transition-all shadow-[2px_2px_0_#000] active:scale-90">
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

            {/* --- STATUS PAGE (Cat Theme) --- */}
            {activeTab === 'status' && (
                <section className="pt-4 pb-24 animate-pop-up">
                    {/* Header Section */}
                    <div className="mb-8 flex items-center justify-between bg-black p-6 border-4 border-[#fb923c] rounded-[2rem] shadow-[6px_6px_0_#c2410c] relative overflow-hidden">
                         <div className="relative z-10">
                             <h2 className="text-3xl font-bold cat-font text-[#fb923c] drop-shadow-sm">Nap Log</h2>
                             <p className="text-sm text-white font-bold mt-1 tracking-wider">Is it done yet?</p>
                         </div>
                         {/* ⏰ CLOCK (DookDik) */}
                         <div className="w-16 h-16 bg-[#fb923c] border-4 border-white rounded-full flex items-center justify-center animate-dookdik">
                             <Icon name="clock" className="text-black" size={32} />
                         </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="bg-white p-5 border-4 border-black rounded-[2rem] relative overflow-hidden shadow-[6px_6px_0_#fb923c]">
                                {/* Header: Visit ID & Status Badge */}
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-sm text-[#c2410c] font-bold uppercase tracking-widest flex items-center gap-1 cat-font">
                                         Visit #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wide border-2 flex items-center gap-1.5 cat-font shadow-sm rounded-lg transform -rotate-1
                                        ${o.status === 'pending' ? 'bg-[#fffbeb] text-[#d97706] border-[#f59e0b]' : 'bg-[#ecfdf5] text-[#059669] border-[#10b981]'}`}>
                                         {o.status === 'pending' ? 'COOKING...' : 'SERVED!'}
                                     </span>
                                </div>

                                {/* Order Items List */}
                                <div className="mb-3 space-y-1 bg-[#fff7ed] p-4 border-2 border-[#fed7aa] rounded-xl">
                                    {o.order_items.map((i, idx) => {
                                        // 1. คำนวณราคา
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        
                                        // 2. 🧪 SIMULATION: (จำลองว่าถ้าเป็น Jumbo/Special ให้มีส่วนลด)
                                        // ถ้า Database จริงพร้อมแล้ว ให้ลบตัวแปร isSimulatedDiscount นี้ทิ้ง
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
                                            <div key={idx} className="flex justify-between items-start text-lg text-black font-bold mb-2 border-b border-dashed border-[#fdba74] pb-2 last:border-0 cat-font">
                                                
                                                {/* Left: Info */}
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-xl">{quantity}x {i.product_name}</span>
                                                    
                                                    {/* Variant Badge (Cat Style: Orange/Black) */}
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-md border-2 border-black font-sans font-bold mt-1 shadow-[2px_2px_0_black] uppercase tracking-wider transform -rotate-2
                                                            ${i.variant === 'jumbo' ? 'bg-[#fb923c] text-black' : 'bg-black text-[#fb923c]'}`}>
                                                            {i.variant === 'special' ? 'SPECIAL' : i.variant === 'jumbo' ? 'BIG MEAL' : i.variant}
                                                        </span>
                                                    )}

                                                    {i.note && <span className="text-xs text-[#ea580c] italic sans-serif mt-0.5 opacity-80">"{i.note}"</span>}
                                                </div>

                                                {/* Right: Price */}
                                                <div className="text-right flex flex-col items-end min-w-[80px]">
                                                    {hasDiscount ? (
                                                        <>
                                                            {/* 🔥 ป้าย SAVE (ธีมแมว: สีแดงเข้ม/ขาว ขอบดำ) */}
                                                            <span className="text-[10px] text-white bg-[#ef4444] px-1.5 py-0.5 rounded-full font-sans font-bold mb-1 shadow-sm border border-black transform rotate-6 animate-pulse">
                                                                SAVE -{discountAmount}
                                                            </span>

                                                            {/* ราคาเต็ม (ขีดฆ่า) */}
                                                            <span className="text-sm text-gray-400 line-through decoration-[#c2410c] decoration-2 sans-serif opacity-80 mb-0.5 font-bold">
                                                                {originalPriceTotal}
                                                            </span>

                                                            {/* ราคาจริง (ตัวใหญ่ สีส้มเข้ม) */}
                                                            <span className="text-[#c2410c] text-2xl leading-none filter drop-shadow-sm">
                                                                {finalPriceTotal}.-
                                                            </span>
                                                        </>
                                                    ) : (
                                                        // ราคาปกติ
                                                        <span className="text-[#c2410c] text-2xl">{finalPriceTotal}.-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer: Total */}
                                <div className="flex justify-between items-center pt-2 border-t-2 border-black">
                                     <span className="font-bold text-[#9ca3af] text-sm uppercase tracking-widest cat-font">TOTAL</span>
                                     <span className="font-black text-[#fb923c] text-3xl cat-font drop-shadow-[1px_1px_0_black]">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        
                        {/* Empty State */}
                        {(!ordersList || ordersList.length === 0) && (
                             <div className="text-center py-12 opacity-50">
                                <div className="w-20 h-20 bg-[#fed7aa] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#fb923c]">
                                    <Icon name="search" size={40} className="text-[#c2410c]" />
                                </div>
                                <p className="cat-font text-2xl text-[#c2410c]">Nothing here...</p>
                             </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[75px] bg-white shadow-[0_8px_20px_rgba(0,0,0,0.3)] flex justify-around items-center px-4 z-[90] rounded-full border-4 border-black">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'home' ? 'text-[#fb923c]' : 'text-gray-400'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#fffbeb] border-2 border-[#fb923c]' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'menu' ? 'text-[#fb923c]' : 'text-gray-400'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#fffbeb] border-2 border-[#fb923c]' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* 🧺 Big Cart Button (DookDik) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#fb923c] rounded-full shadow-[0_6px_0_#c2410c] flex items-center justify-center text-black border-4 border-black active:scale-95 transition-all duration-100 z-20 group animate-dookdik">
                     <Icon name="basket" size={36} className="group-hover:scale-110 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#fcd34d] text-black text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-black animate-bounce cat-font">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'status' ? 'text-[#fb923c]' : 'text-gray-400'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#fffbeb] border-2 border-[#fb923c]' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-md bg-white border-t-8 border-x-8 border-black h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-lg rounded-t-[3rem] relative animate-pop-up" style={{animationDelay: '0s'}}>
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#fcd34d] text-black rounded-full border-4 border-black flex items-center justify-center hover:bg-[#fb923c] transition-colors shadow-sm active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-8 border-black rounded-b-[2rem] bg-[#fffbeb]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#fb923c] text-black font-bold text-3xl cat-font rounded-xl border-4 border-black shadow-sm transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-base line-through text-[#fff] decoration-black decoration-4 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32 relative overflow-hidden bg-[#fff7ed]">
                        <h2 className="text-4xl cat-font text-[#c2410c] mb-6 leading-tight transform rotate-1 drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5 relative z-10">
                            {/* Size Selector */}
                            <div>
                                <label className="block text-lg font-bold text-black mb-3 cat-font ml-1 tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'NORMAL', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'BIG', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'FAT CAT', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-xl border-4 transition-all flex flex-col items-center justify-between h-24 cat-font
                                                ${variant === v.key 
                                                    ? 'bg-[#fcd34d] border-[#fb923c] shadow-sm -translate-y-1 text-black' 
                                                    : 'bg-white border-gray-300 text-gray-400 hover:border-[#fb923c] hover:text-[#fb923c]'}`}
                                        >
                                            <span className="text-xs font-bold tracking-widest">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-[#c2410c] decoration-2 opacity-70">{v.original}</span>
                                                )}
                                                <span className="text-xl font-normal">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty */}
                            <div className="flex items-center justify-between py-4 mt-2 bg-white border-4 border-black rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white border-2 border-black text-black rounded-full flex items-center justify-center hover:bg-[#fffbeb] active:scale-90 transition-all font-black text-xl"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-4xl font-normal w-14 text-center text-black cat-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#fb923c] border-2 border-black text-black rounded-full flex items-center justify-center hover:bg-[#c2410c] active:scale-90 transition-all font-black text-xl"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[#c2410c] font-bold uppercase tracking-widest mb-1 cat-font">TOTAL</p>
                                    <p className="text-5xl font-normal text-black cat-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* Note */}
                            <div className="relative">
                                <label className="block text-lg font-bold text-black mb-2 cat-font ml-1 tracking-wide">SPECIAL REQUESTS:</label>
                                <div className="relative">
                                    <textarea 
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="E.g., No veggies, Extra cheese..." 
                                        className="w-full p-4 pl-12 bg-white border-4 border-[#fdba74] rounded-2xl font-bold text-black placeholder:text-[#9ca3af] focus:outline-none focus:border-[#fb923c] focus:shadow-sm transition-all resize-none h-28 text-lg cat-font"
                                    />
                                    <div className="absolute top-4 left-4 text-[#fb923c]">
                                        <Icon name="pencil" size={24} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border-4 border-[#fb923c] text-[#fb923c] font-bold text-xl rounded-xl active:scale-95 transition-all shadow-sm cat-font">
                                ADD TO BOWL
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-cat text-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                EAT NOW! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm">
                 <div className="w-full max-w-md bg-white border-t-8 border-black flex flex-col shadow-lg h-[85vh] rounded-t-[3rem] relative animate-pop-up" style={{animationDelay: '0s'}}>
                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-2 bg-black rounded-full mx-auto opacity-20" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-4xl cat-font text-[#c2410c] drop-shadow-sm transform -rotate-2">Your Food</h2>
                         <div className="w-14 h-14 bg-[#fcd34d] text-black border-4 border-black rounded-xl flex items-center justify-center font-bold text-2xl cat-font shadow-sm">
                             <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-[#fffbeb] rounded-2xl relative overflow-hidden shadow-sm animate-pop-up" style={{animationDelay: `${idx * 0.1}s`}}>
                                 <div className="w-4 h-full absolute left-0 top-0 bg-[#fb923c]" />
                                 <img src={item.image_url} className="w-20 h-20 object-cover border-4 border-[#fed7aa] rounded-xl ml-4 bg-[#fff]" />
                                 <div className="flex-1">
                                     <div className="font-bold text-black text-xl leading-tight cat-font tracking-wide">
                                         {item.name} <span className="text-[#fb923c]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-sm font-bold mt-1">
                                         {item.variant !== 'normal' && <span className="bg-[#fcd34d] text-black px-2 py-0.5 border border-black rounded text-xs mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-[#c2410c] italic mt-1 text-xs">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#fb923c] text-2xl cat-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#fef2f2] hover:bg-[#fee2e2] flex items-center justify-center text-[#ef4444] border-2 border-[#fee2e2] rounded-xl transition-colors active:scale-90 shadow-sm">
                                     <Icon name="trash" size={20} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-gray-400 font-bold text-xl cat-font">Bowl is empty...</div>
                         )}
                     </div>

                     <div className="p-8 bg-[#fb923c] border-t-4 border-black relative z-30 rounded-t-[2.5rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-[#fffbeb]">
                             <div>
                                 <p className="text-sm text-black font-black uppercase tracking-widest cat-font">TOTAL</p>
                                 <p className="text-6xl font-normal text-white cat-font drop-shadow-md">{cartTotal}.-</p>
                             </div>
                             <div className="w-20 h-20 bg-[#fcd34d] border-4 border-black rounded-full flex items-center justify-center text-black transform rotate-6 shadow-sm">
                                 <Icon name="basket" size={40} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-cat text-3xl active:scale-95 transition-all flex items-center justify-center gap-3 border-4 border-white">
                             <span>FEED ME!</span> <Icon name="check" size={32} strokeWidth={4} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6 backdrop-blur-sm">
                <div className="w-full max-w-sm bg-[#fff7ed] border-8 border-[#fb923c] p-8 text-center shadow-lg rounded-[2.5rem] animate-pop-up" style={{animationDelay: '0s'}}>
                    <div className="w-28 h-28 bg-[#fcd34d] text-black rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-black shadow-sm">
                        <Icon name="flame" size={56} className="animate-dookdik" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-4xl cat-font text-black mb-2 leading-tight">YUM!</h3>
                            <p className="text-xl text-[#fb923c] mb-8 font-bold leading-tight cat-font">Add "{selectedProduct.name}" to your bowl?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#fcd34d] text-black font-bold border-4 border-black shadow-sm active:scale-95 transition-all text-xl cat-font rounded-xl">YES, I WANT IT!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-[#fb923c] text-[#fb923c] font-bold text-lg active:scale-95 transition-transform hover:bg-[#fffbeb] rounded-xl cat-font">JUST ADD</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl cat-font text-black mb-2 leading-tight">READY?</h3>
                            <p className="text-xl text-[#fb923c] mb-8 font-bold leading-tight cat-font">Time to sleep... I mean eat?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-[#fb923c] text-white font-bold border-4 border-[#c2410c] shadow-sm active:scale-95 transition-all text-xl cat-font rounded-xl">YES, FEED ME!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-[#fb923c] text-[#fb923c] font-bold text-lg active:scale-95 transition-transform hover:bg-[#fffbeb] rounded-xl cat-font">NOT YET!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}