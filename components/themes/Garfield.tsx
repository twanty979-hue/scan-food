import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Garfield Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
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

  const content = (icons as any)[name] || icons.home;
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {content}
      {name === 'search' && <path d="m21 21-4.3-4.3" />}
      {name === 'star' && <circle cx="12" cy="12" r="3" fill="currentColor" />} 
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
  
  // Ref สำหรับกันการรันซ้ำซ้อน
  const isCheckingOut = useRef(false);
  const prevCartLength = useRef(cart?.length || 0);

  // Reset modal state when product changes
  useEffect(() => {
    if (selectedProduct) {
      setVariant('normal');
      setQty(1);
      setNote("");
    }
  }, [selectedProduct]);

  // --- 🔥 AUTO-CHECKOUT LOGIC (Fixed) ---
  useEffect(() => {
    // ถ้าไม่ได้อยู่ในโหมดสั่งทันที ให้จบการทำงาน
    if (!pendingCookNow) return;

    // เช็คว่าตะกร้ามีการเปลี่ยนแปลงจริงหรือไม่ (ของเพิ่มขึ้นไหม)
    const currentCartLength = cart?.length || 0;

    if (currentCartLength > prevCartLength.current) {
        // พบว่าของลงตะกร้าแล้ว!
        if (isCheckingOut.current) return; // กันรันซ้ำ
        
        isCheckingOut.current = true; // ล็อกไม่ให้ทำซ้ำ

        // หน่วงเวลาเล็กน้อยเพื่อให้ State นิ่ง แล้วสั่ง Checkout
        const timer = setTimeout(() => {
            handleCheckout().then(() => {
                setPendingCookNow(false);
                isCheckingOut.current = false;
            });
        }, 500); // เพิ่มเวลาเป็น 500ms เพื่อความชัวร์

        return () => clearTimeout(timer);
    } 
    
    // อัปเดตความยาวตะกร้าล่าสุดเสมอ
    prevCartLength.current = currentCartLength;

  }, [cart, pendingCookNow, handleCheckout]); // dependency array

  if (loading && !isVerified) return <div className="min-h-screen bg-[#18181B] flex items-center justify-center text-[#F97316] font-black text-2xl">LOADING...</div>;

  const currentPriceObj = selectedProduct 
    ? calculatePrice(selectedProduct, variant) 
    : { final: 0 };

  const handleAdd = (addToCartOnly = true) => {
    if (!selectedProduct) return;
    
    if (addToCartOnly) {
        // ใส่ตะกร้าเฉยๆ
        for(let i=0; i<qty; i++) {
            handleAddToCart(selectedProduct, variant, note);
        }
        setSelectedProduct(null);
    } else {
        // สั่งทันที
        if (cart && cart.length > 0) {
            // ถ้ามีของค้างอยู่ ให้ถามก่อน
            setShowConfirm(true); 
        } else {
            // ถ้าตะกร้าว่าง สั่งเลย
            performCookNow();
        }
    }
  };

  const performCookNow = () => {
    // เคลียร์ flag กันเหนียว
    isCheckingOut.current = false; 
    
    // วนลูปเพิ่มของลงตะกร้า
    for(let i=0; i<qty; i++) {
        handleAddToCart(selectedProduct, variant, note);
    }

    // เปิดโหมดรอ Checkout (เพื่อให้ useEffect ด้านบนทำงานเมื่อ cart เปลี่ยน)
    setPendingCookNow(true);
    setSelectedProduct(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-white">
        
        {/* ✅ แก้ไข: ใช้ dangerouslySetInnerHTML เหมือนหน้า Moana เพื่อความชัวร์ */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Carter+One&family=Mali:wght@400;700&display=swap');
            
            :root {
                --primary: #F97316; /* Garfield Orange */
                --primary-dark: #C2410C;
                --secondary: #FBBF24; /* Cheese Yellow */
                --bg: #18181B; /* Dark Background */
                --card-bg: #27272A; /* Dark Card */
            }

            body {
                font-family: 'Mali', cursive;
                background-color: #000;
                background-image: 
                    linear-gradient(45deg, #18181B 25%, transparent 25%, transparent 75%, #18181B 75%, #18181B),
                    linear-gradient(45deg, #18181B 25%, transparent 25%, transparent 75%, #18181B 75%, #18181B);
                background-position: 0 0, 20px 20px;
                background-size: 40px 40px;
                background-attachment: fixed;
                color: white;
            }

            .garfield-font {
                font-family: 'Carter One', cursive;
            }

            @keyframes dookdik {
                0%, 100% { transform: rotate(-3deg); }
                50% { transform: rotate(3deg); }
            }
            .animate-dookdik { animation: dookdik 2s ease-in-out infinite; }

            @keyframes dookdik-strong {
                0%, 100% { transform: rotate(-12deg) scale(1); }
                50% { transform: rotate(12deg) scale(1.1); }
            }
            .animate-dookdik-strong { animation: dookdik-strong 0.6s ease-in-out infinite; }

            @keyframes gentle-wiggle {
                0%, 100% { transform: rotate(-2deg) translateY(0); }
                50% { transform: rotate(2deg) translateY(-1px); }
            }
            .animate-gentle-wiggle { animation: gentle-wiggle 3s ease-in-out infinite; }

            @keyframes pop-image {
                0% { opacity: 0; transform: scale(0.8) translateY(10px); }
                60% { opacity: 1; transform: scale(1.05); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-image-pop { animation: pop-image 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }

            @keyframes slide-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }

            .btn-garfield {
                background: #F97316;
                color: black;
                border: 3px solid #000;
                border-radius: 1.5rem;
                font-family: 'Carter One', cursive;
                box-shadow: 0 4px 0 #C2410C;
                transition: all 0.2s;
            }
            .btn-garfield:active {
                transform: translateY(4px);
                box-shadow: 0 0 0 #C2410C;
            }

            .lazy-card {
                background: #27272A;
                border: 3px solid #F97316;
                border-radius: 1.5rem;
                box-shadow: 0 6px 0 #000;
                transition: all 0.2s;
                position: relative;
                overflow: hidden;
            }
            .lazy-card:active {
                transform: translate(2px, 2px);
                box-shadow: 0 4px 0 #000;
            }

            .tab-btn {
                background: #27272A;
                color: #A1A1AA;
                border: 3px solid #3F3F46;
                border-radius: 1.5rem;
                transition: all 0.3s;
                font-family: 'Carter One', cursive;
            }
            .tab-btn.active {
                background: #F97316;
                color: black;
                border-color: #F97316;
                box-shadow: 0 4px 0 #C2410C;
                transform: translateY(-2px);
            }
            
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (Garfield Dark) --- */}
        <header className="bg-[#F97316] text-black pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-[0_10px_30px_rgba(249,115,22,0.3)] z-10 border-b-8 border-[#27272A]">
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     {/* Label */}
                     <div className="flex items-center gap-2 mb-2 bg-[#27272A] w-fit px-4 py-1.5 rounded-full border-2 border-[#FBBF24] shadow-sm animate-gentle-wiggle">
                         <span className="w-3 h-3 rounded-full bg-[#F97316] animate-pulse"></span>
                         <p className="text-[#FBBF24] text-xs font-bold tracking-wide garfield-font uppercase">Table: {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl font-normal tracking-wide leading-none mt-2 garfield-font text-white drop-shadow-[4px_4px_0_#000] transform rotate-1">
                         {brand?.name || "Garfield's Dark"}
                     </h1>
                 </div>
                 {/* Logo */}
                 <div className="w-20 h-20 bg-[#27272A] rounded-full border-4 border-[#FBBF24] flex items-center justify-center relative shadow-lg animate-dookdik">
                     <Icon name="chef" className="text-[#F97316] w-12 h-12" />
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#F97316] rounded-full border-2 border-[#FBBF24] flex items-center justify-center text-black text-xs font-bold shadow-sm">
                        🐱
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-slide-up">
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-[#27272A] rounded-[2rem] overflow-hidden shadow-[6px_6px_0_#000] mb-8 border-4 border-[#F97316] p-2">
                             <div className="h-full w-full rounded-[1.5rem] overflow-hidden border-2 border-[#FBBF24] relative group">
                                 <img 
                                     src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                     className="w-full h-full object-cover animate-image-pop opacity-90" 
                                     key={currentBannerIndex} 
                                 />
                             </div>
                             <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 bg-[#000] px-6 py-2 rounded-b-xl border-x-4 border-b-4 border-[#F97316] shadow-lg animate-gentle-wiggle">
                                 <span className="garfield-font text-xl text-[#F97316] tracking-wider">MIDNIGHT SNACK!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                         <div>
                             <h2 className="text-3xl font-normal text-[#FBBF24] garfield-font transform -rotate-1 drop-shadow-md">Lasagna Time!</h2>
                             <p className="text-sm text-[#A1A1AA] font-bold ml-1 tracking-wide bg-[#27272A] px-2 rounded-full inline-block border border-[#3F3F46]">Feed me in the dark.</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#27272A] text-[#F97316] px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#3F3F46] transition-colors garfield-font border-4 border-[#F97316] shadow-[0_4px_0_#000] active:translate-y-[2px] active:shadow-none text-lg">
                             SEE FOOD <Icon name="menu" size={20} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="lazy-card group cursor-pointer animate-pop-up" style={{animationDelay: `${(idx * 0.1) + 0.2}s`}}>
                                     <div className="w-full h-36 overflow-hidden relative bg-[#000] border-b-4 border-[#F97316]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover animate-image-pop opacity-90 group-hover:opacity-100 transition-opacity" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-2 left-2 bg-[#F97316] text-black text-xs font-bold px-2 py-1 rounded-xl border-2 border-black transform -rotate-6 shadow-sm garfield-font animate-gentle-wiggle">
                                                 ★ YUM!
                                             </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-[#27272A]">
                                         <h3 className="font-bold text-white text-lg line-clamp-2 mb-1 leading-tight garfield-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-xs text-[#A1A1AA] line-through decoration-[#F97316] decoration-2 font-bold">{pricing.original}</span>}
                                                 <span className="text-[#FBBF24] font-black text-2xl garfield-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#F97316] text-black border-2 border-black flex items-center justify-center rounded-full hover:bg-[#FB923C] transition-all shadow-[0_2px_0_#000] active:scale-90">
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
                             <Icon name="search" className="text-[#F97316]" />
                         </div>
                         <input type="text" placeholder="Find lasagna..." className="w-full pl-14 pr-6 py-4 rounded-3xl bg-[#27272A] border-4 border-[#3F3F46] text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#F97316] focus:shadow-sm transition-all text-xl font-bold garfield-font" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-3 text-lg font-bold rounded-2xl flex items-center gap-2 ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="lazy-card group cursor-pointer animate-pop-up" style={{animationDelay: `${(idx * 0.1) + 0.2}s`}}>
                                     <div className="w-full h-36 overflow-hidden relative bg-[#000] border-b-4 border-[#F97316]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover animate-image-pop opacity-90 group-hover:opacity-100 transition-opacity" />
                                     </div>
                                     <div className="p-4 bg-[#27272A]">
                                         <h3 className="font-bold text-white text-lg line-clamp-2 mb-1 leading-tight garfield-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-xs text-[#A1A1AA] line-through decoration-[#F97316] decoration-2 font-bold">{pricing.original}</span>}
                                                 <span className="text-[#FBBF24] font-black text-2xl garfield-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#F97316] text-black border-2 border-black flex items-center justify-center rounded-full hover:bg-[#FB923C] transition-all shadow-[0_2px_0_#000] active:scale-90">
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

            {/* --- STATUS PAGE (Garfield Dark Theme) --- */}
            {activeTab === 'status' && (
                <section className="animate-slide-up pt-4 pb-24">
                    {/* Header: Nap Log */}
                    <div className="mb-8 flex items-center justify-between bg-[#000] p-6 border-4 border-[#F97316] rounded-[2rem] shadow-[6px_6px_0_#27272A] relative overflow-hidden">
                         <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#27272A] rounded-full border-4 border-[#F97316] opacity-50"></div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-bold garfield-font text-[#F97316] drop-shadow-sm">Nap Log</h2>
                             <p className="text-sm text-[#A1A1AA] font-bold mt-1 tracking-wider">Is it done yet?</p>
                         </div>
                         {/* ⏰ CLOCK (DookDik Strong) */}
                         <div className="w-16 h-16 bg-[#27272A] border-4 border-[#F97316] rounded-full flex items-center justify-center animate-dookdik-strong">
                             <Icon name="clock" className="text-[#FBBF24]" size={32} />
                         </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-[#27272A] p-5 border-4 border-[#3F3F46] rounded-[2rem] relative overflow-hidden shadow-[6px_6px_0_#000]">
                                {/* Header: Visit ID & Status Badge */}
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-sm text-[#F97316] font-bold uppercase tracking-widest flex items-center gap-1 garfield-font animate-gentle-wiggle">
                                         Visit #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wide border-2 flex items-center gap-1.5 garfield-font shadow-sm rounded-lg transform -rotate-1
                                        ${o.status === 'pending' ? 'bg-[#3F3F46] text-[#FBBF24] border-[#F97316]' : 'bg-[#064E3B] text-[#34D399] border-[#10B981]'}`}>
                                         {o.status === 'pending' ? 'COOKING...' : 'SERVED!'}
                                     </span>
                                </div>

                                {/* Order Items List */}
                                <div className="mb-3 space-y-1 bg-[#18181B] p-4 border-2 border-[#3F3F46] rounded-xl">
                                    {o.order_items.map((i: any, idx: any) => {
                                        // 1. คำนวณราคา
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        
                                        // 2. ตรวจสอบส่วนลด
                                        const hasDiscount = (i.original_price && i.original_price > i.price) || (i.discount > 0);
                                        
                                        // หาราคาเต็ม
                                        const originalPriceTotal = hasDiscount 
                                            ? (i.original_price ? i.original_price * i.quantity : (i.price + (i.discount || 0)) * i.quantity) 
                                            : finalPriceTotal;
                                            
                                        const discountAmount = originalPriceTotal - finalPriceTotal;

                                        return (
                                            <div key={idx} className="flex justify-between items-start text-lg text-white font-bold mb-2 border-b border-dashed border-[#3F3F46] pb-2 last:border-0 garfield-font">
                                                
                                                {/* Left: Info */}
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-xl">{quantity}x {i.product_name}</span>
                                                    
                                                    {/* Variant Badge (Yellow Cheese Style) */}
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] bg-[#FBBF24] text-black px-2 py-0.5 rounded-md border-2 border-black font-sans font-bold mt-1 shadow-sm uppercase tracking-wider transform -rotate-2`}>
                                                            {i.variant === 'special' ? 'BIG' : i.variant === 'jumbo' ? 'FAT CAT' : i.variant}
                                                        </span>
                                                    )}

                                                    {/* Note */}
                                                    {i.note && <span className="text-xs text-[#F97316] italic sans-serif mt-0.5 opacity-80">"{i.note}"</span>}
                                                </div>

                                                {/* Right: Price */}
                                                <div className="text-right flex flex-col items-end min-w-[80px]">
                                                    {hasDiscount ? (
                                                        <>
                                                            {/* 🔥 ป้าย SAVE (Red Alert Style) */}
                                                            <span className="text-[10px] text-white bg-[#EF4444] px-1.5 py-0.5 rounded-full font-sans font-bold mb-1 shadow-sm border border-white transform rotate-3 animate-pulse">
                                                                SAVE -{discountAmount}
                                                            </span>

                                                            {/* ราคาเต็ม (ขีดฆ่า) */}
                                                            <span className="text-sm text-[#71717A] line-through decoration-[#F97316] decoration-2 sans-serif opacity-70 mb-0.5 font-bold">
                                                                {originalPriceTotal}
                                                            </span>

                                                            {/* ราคาจริง */}
                                                            <span className="text-[#F97316] text-2xl leading-none filter drop-shadow-sm">
                                                                {finalPriceTotal}.-
                                                            </span>
                                                        </>
                                                    ) : (
                                                        // ราคาปกติ
                                                        <span className="text-[#F97316] text-2xl">{finalPriceTotal}.-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer: Total */}
                                <div className="flex justify-between items-center pt-2 border-t-2 border-[#3F3F46]">
                                     <span className="font-bold text-[#A1A1AA] text-sm uppercase tracking-widest garfield-font">TOTAL</span>
                                     <span className="font-black text-[#F97316] text-3xl garfield-font drop-shadow-[2px_2px_0_black]">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        
                        {/* Empty State */}
                        {(!ordersList || ordersList.length === 0) && (
                             <div className="text-center py-12 opacity-50">
                                <div className="w-20 h-20 bg-[#3F3F46] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#F97316]">
                                    <Icon name="search" size={40} className="text-[#F97316]" />
                                </div>
                                <p className="garfield-font text-2xl text-[#F97316]">No lasagna yet...</p>
                             </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[75px] bg-[#18181B] shadow-[0_8px_20px_rgba(0,0,0,0.8)] flex justify-around items-center px-4 z-[90] rounded-full border-4 border-[#3F3F46]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'home' ? 'text-[#F97316]' : 'text-[#52525B]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#27272A] border-2 border-[#F97316]' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'menu' ? 'text-[#F97316]' : 'text-[#52525B]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#27272A] border-2 border-[#F97316]' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* Big Cart Button */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#F97316] rounded-full shadow-[0_6px_0_#C2410C] flex items-center justify-center text-black border-4 border-black active:scale-95 transition-all duration-100 z-20 group animate-dookdik">
                     <Icon name="basket" size={36} className="group-hover:scale-110 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#FBBF24] text-black text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-black animate-bounce garfield-font">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'status' ? 'text-[#F97316]' : 'text-[#52525B]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#27272A] border-2 border-[#F97316]' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-slide-up">
                <div className="w-full max-w-md bg-[#18181B] border-t-8 border-x-8 border-[#F97316] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-lg rounded-t-[3rem] relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#FBBF24] text-black rounded-full border-4 border-black flex items-center justify-center hover:bg-[#F97316] transition-colors shadow-sm active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-8 border-[#F97316] rounded-b-[2rem] bg-[#000]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover animate-image-pop opacity-90" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#F97316] text-black font-bold text-3xl garfield-font rounded-xl border-4 border-black shadow-sm transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-base line-through text-[#27272A] decoration-white decoration-4 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32 relative overflow-hidden bg-[#27272A]">
                        <h2 className="text-4xl garfield-font text-[#F97316] mb-6 leading-tight transform rotate-1 drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5 relative z-10">
                            {/* Size Selector */}
                            <div>
                                <label className="block text-lg font-bold text-white mb-3 garfield-font ml-1 tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'NORMAL', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'BIG', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'FAT CAT', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-xl border-4 transition-all flex flex-col items-center justify-between h-24 garfield-font
                                                ${variant === v.key 
                                                    ? 'bg-[#FBBF24] border-[#F97316] shadow-sm -translate-y-1 text-black' 
                                                    : 'bg-[#18181B] border-[#3F3F46] text-[#71717A] hover:border-[#F97316] hover:text-[#F97316]'}`}
                                        >
                                            <span className="text-xs font-bold tracking-widest">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-[#F97316] decoration-2 opacity-70">{v.original}</span>
                                                )}
                                                <span className="text-xl font-normal">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty */}
                            <div className="flex items-center justify-between py-4 mt-2 bg-[#18181B] border-4 border-[#3F3F46] rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-[#27272A] border-2 border-[#52525B] text-white rounded-full flex items-center justify-center hover:bg-[#3F3F46] active:scale-90 transition-all font-black text-xl"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-4xl font-normal w-14 text-center text-[#F97316] garfield-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#F97316] border-2 border-[#C2410C] text-black rounded-full flex items-center justify-center hover:bg-[#FB923C] active:scale-90 transition-all font-black text-xl"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[#A1A1AA] font-bold uppercase tracking-widest mb-1 garfield-font">TOTAL</p>
                                    <p className="text-5xl font-normal text-white garfield-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* Note */}
                            <div className="relative">
                                <label className="block text-lg font-bold text-white mb-2 garfield-font ml-1 tracking-wide">SPECIAL REQUESTS:</label>
                                <div className="relative">
                                    <textarea 
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="E.g., No veggies, Extra cheese..." 
                                        className="w-full p-4 pl-12 bg-[#18181B] border-4 border-[#3F3F46] rounded-2xl font-bold text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#F97316] focus:shadow-sm transition-all resize-none h-28 text-lg garfield-font"
                                    />
                                    <div className="absolute top-4 left-4 text-[#F97316]">
                                        <Icon name="pencil" size={24} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-[#18181B] border-4 border-[#F97316] text-[#F97316] font-bold text-xl rounded-xl active:scale-95 transition-all shadow-sm garfield-font">
                                ADD TO BOWL
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-garfield text-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                EAT NOW! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-slide-up">
                 <div className="w-full max-w-md bg-[#18181B] border-t-8 border-[#F97316] flex flex-col shadow-lg h-[85vh] rounded-t-[3rem] relative">
                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-2 bg-[#F97316] rounded-full mx-auto opacity-20" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-4xl garfield-font text-white drop-shadow-sm transform -rotate-2">Your Food</h2>
                         <div className="w-14 h-14 bg-[#FBBF24] text-black border-4 border-[#000] rounded-xl flex items-center justify-center font-bold text-2xl garfield-font shadow-sm">
                             <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item: any, idx: any) => (
                             <div key={idx} className="flex items-center gap-4 bg-[#27272A] p-4 border-4 border-[#3F3F46] rounded-2xl relative overflow-hidden shadow-sm">
                                 <div className="w-4 h-full absolute left-0 top-0 bg-[#F97316]" />
                                 <img src={item.image_url} className="w-20 h-20 object-cover border-4 border-[#000] rounded-xl ml-4 bg-[#000]" />
                                 <div className="flex-1">
                                     <div className="font-bold text-white text-xl leading-tight garfield-font tracking-wide">
                                         {item.name} <span className="text-[#F97316]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-sm font-bold mt-1">
                                         {item.variant !== 'normal' && <span className="bg-[#FBBF24] text-black px-2 py-0.5 border border-[#000] rounded text-xs mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-[#A1A1AA] italic mt-1 text-xs">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#F97316] text-2xl garfield-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#3F3F46] hover:bg-[#52525B] flex items-center justify-center text-[#F87171] border-2 border-[#52525B] rounded-xl transition-colors active:scale-90 shadow-sm">
                                     <Icon name="trash" size={20} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-[#52525B] font-bold text-xl garfield-font">Bowl is empty...</div>
                         )}
                     </div>

                     <div className="p-8 bg-[#F97316] border-t-4 border-[#000] relative z-30 rounded-t-[2.5rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-[#FDBA74]">
                             <div>
                                 <p className="text-sm text-[#000] font-black uppercase tracking-widest garfield-font">TOTAL</p>
                                 <p className="text-6xl font-normal text-white garfield-font drop-shadow-md">{cartTotal}.-</p>
                             </div>
                             <div className="w-20 h-20 bg-[#FBBF24] border-4 border-[#000] rounded-full flex items-center justify-center text-black transform rotate-6 shadow-sm">
                                 <Icon name="basket" size={40} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-garfield text-3xl active:scale-95 transition-all flex items-center justify-center gap-3 border-4 border-white">
                             <span>FEED ME!</span> <Icon name="check" size={32} strokeWidth={4} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-slide-up">
                <div className="w-full max-w-sm bg-[#27272A] border-8 border-[#F97316] p-8 text-center shadow-lg rounded-[2.5rem]">
                    <div className="w-28 h-28 bg-[#FBBF24] text-black rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#000] shadow-sm">
                        <Icon name="flame" size={56} className="animate-dookdik" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-4xl garfield-font text-white mb-2 leading-tight">YUM!</h3>
                            <p className="text-xl text-[#F97316] mb-8 font-bold leading-tight garfield-font">Add "{selectedProduct.name}" to your bowl?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#FBBF24] text-black font-bold border-4 border-[#000] shadow-sm active:scale-95 transition-all text-xl garfield-font rounded-xl">YES, I WANT IT!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#18181B] border-4 border-[#F97316] text-[#F97316] font-bold text-lg active:scale-95 transition-transform hover:bg-[#27272A] rounded-xl garfield-font">JUST ADD</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl garfield-font text-white mb-2 leading-tight">READY?</h3>
                            <p className="text-xl text-[#F97316] mb-8 font-bold leading-tight garfield-font">Time to sleep... I mean eat?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-[#F97316] text-black font-bold border-4 border-[#C2410C] shadow-sm active:scale-95 transition-all text-xl garfield-font rounded-xl">YES, FEED ME!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-[#18181B] border-4 border-[#F97316] text-[#F97316] font-bold text-lg active:scale-95 transition-transform hover:bg-[#27272A] rounded-xl garfield-font">NOT YET!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}