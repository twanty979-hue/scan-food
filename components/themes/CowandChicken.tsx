import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Cow and Chicken Style) ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> The House (Abstract/Wacky)
    home: <path d="M2 22 L12 2 L22 22 H2 Z M12 8 V16 M8 16 H16" strokeWidth="3" strokeLinejoin="round" />, 
    // Menu -> Pork Butt (Circle with bone)
    menu: <path d="M12 2C6 2 2 6 2 12s4 10 10 10 10-4 10-10S18 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Tater / Potato
    basket: <path d="M12 2c-4 0-8 3-8 9 0 6 4 9 8 9s8-3 8-9c0-6-4-9-8-9z M8 8h2 M14 14h2 M6 12h2" />,
    // Clock -> Wacky Clock
    clock: <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-16v6l4 2" />,
    // Chef -> The Red Guy (Devil Horns)
    chef: <path d="M4 4l4 4 M20 4l-4 4 M12 22c-5 0-9-4-9-9 0-5 9-11 9-11s9 6 9 11c0 5-4 9-9 9z" />, 
    // Star -> Supercow Logo / Udder
    star: <path d="M12 2l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9z" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Explosion / Scream
    flame: <path d="M12 2L4 22h16L12 2zm0 6l3 8H9l3-8z" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    // Chicken Leg
    chicken: <path d="M6 2c-2 0-3 2-3 4s2 4 4 4v8c0 2 2 4 4 4s4-2 4-4V10c2 0 4-2 4-4s-1-4-3-4-5 2-5 2-3-2-5-2z" />, 
    // Cow Spot
    cow: <path d="M12 2C8 2 4 5 4 10c0 4 3 6 6 6 1 0 2 2 2 4 0 2 4 2 6 0 1-1 2-4 2-8 0-6-6-10-8-10z" />,
    // Butt
    butt: <path d="M12 22s-4-2-4-8c0-4 2-8 4-8s4 4 4 8c0 6-4 8-4 8z M12 6v6" />
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
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {content}
      {name === 'search' && <path d="m21 21-4.3-4.3" />}
      {name === 'basket' && <path d="M12 2v3M4 10v2M20 10v2" strokeWidth="2"/>}
      {name === 'chef' && <path d="M9 14h6 M12 14v3" />} {/* Smile */}
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
  const [orderNote, setOrderNote] = useState(""); 
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCookNow, setPendingCookNow] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setVariant('normal');
      setQty(1);
      setNote("");
    }
  }, [selectedProduct]);

  // --- 🔥 AUTO-CHECKOUT LOGIC (Original) ---
  const prevCartLength = useRef(cart?.length || 0);

  useEffect(() => {
    if (pendingCookNow) {
        if (cart?.length > prevCartLength.current) {
             handleCheckout(orderNote); // Pass orderNote to checkout
             setPendingCookNow(false);
        }
        const timer = setTimeout(() => {
             if(pendingCookNow) {
                 handleCheckout(orderNote); 
                 setPendingCookNow(false);
             }
        }, 1000);
        return () => clearTimeout(timer);
    }
    prevCartLength.current = cart?.length || 0;
  }, [cart, pendingCookNow, handleCheckout, orderNote]);


  if (loading && !isVerified) return <div className="min-h-screen bg-[#FEF3C7] flex items-center justify-center text-[#DC2626] font-black text-2xl">LOADING...</div>;

  const currentPriceObj = selectedProduct 
    ? calculatePrice(selectedProduct, variant) 
    : { final: 0 };

  // --- 📝 FIXED: Robust Data Passing (Original) ---
  const handleAdd = (addToCartOnly = true) => {
    if (!selectedProduct) return;
    const finalNote = note ? note.trim() : ""; 
    
    const productToAdd = { 
        ...selectedProduct, 
        variant: variant, 
        note: finalNote,
        specialRequest: finalNote, 
        comment: finalNote,
        remark: finalNote
    };

    if (addToCartOnly) {
        for(let i=0; i<qty; i++) {
            handleAddToCart(productToAdd, variant, finalNote);
        }
        setSelectedProduct(null);
    } else {
        if (cart && cart.length > 0) setShowConfirm(true); 
        else performCookNow();
    }
  };

  const performCookNow = () => {
    const finalNote = note ? note.trim() : "";
    const productToAdd = { 
        ...selectedProduct, 
        variant: variant, 
        note: finalNote,
        specialRequest: finalNote,
        comment: finalNote,
        remark: finalNote
    };
    
    for(let i=0; i<qty; i++) {
        handleAddToCart(productToAdd, variant, finalNote);
    }
    setPendingCookNow(true);
    setSelectedProduct(null);
  };

  const onCheckoutClick = () => {
      const finalOrderNote = orderNote ? orderNote.trim() : "";
      handleCheckout(finalOrderNote);
      setShowConfirm(false);
  };

  return (
    // Theme: Cow and Chicken (Red, Yellow, Wacky)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#1F2937]">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&display=swap');
            
            :root {
                --cn-red: #DC2626; /* The Red Guy */
                --cn-yellow: #FCD34D; /* Cow / Taters */
                --cn-purple: #7C3AED; /* Supercow */
                --cn-white: #FFFFFF;
                --cn-black: #111827;
                --bg: #FEF3C7; /* Pale Yellow Background */
            }

            body {
                font-family: 'Comic Neue', cursive;
                background-color: var(--bg);
                /* Retro Abstract Pattern */
                background-image: 
                    repeating-linear-gradient(45deg, #FDE68A 25%, transparent 25%, transparent 75%, #FDE68A 75%, #FDE68A),
                    repeating-linear-gradient(45deg, #FDE68A 25%, #FEF3C7 25%, #FEF3C7 75%, #FDE68A 75%, #FDE68A);
                background-position: 0 0, 20px 20px;
                background-size: 40px 40px;
                background-attachment: fixed;
                color: #1F2937;
            }

            .wacky-font {
                font-family: 'Bangers', cursive;
                letter-spacing: 1px;
            }

            @keyframes wobble {
                0%, 100% { transform: rotate(-3deg); }
                50% { transform: rotate(3deg); }
            }
            .animate-wobble { animation: wobble 2s ease-in-out infinite; }

            @keyframes bounce-crazy {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1) rotate(5deg); }
            }
            .animate-crazy { animation: bounce-crazy 0.5s infinite; }

            /* Image Pop Animation */
            @keyframes pop-image {
                0% { opacity: 0; transform: scale(0.5) rotate(-10deg); }
                60% { opacity: 1; transform: scale(1.1) rotate(5deg); }
                100% { opacity: 1; transform: scale(1) rotate(0deg); }
            }
            .animate-image-pop { animation: pop-image 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }

            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.3s ease-out; }

            .item-card {
                transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
                position: relative;
                background: white;
                border: 4px solid #1F2937;
                border-radius: 1.5rem;
                box-shadow: 6px 6px 0px #DC2626;
                overflow: hidden;
            }
            .item-card:active {
                transform: translate(4px, 4px);
                box-shadow: 2px 2px 0px #DC2626;
            }

            .btn-red-guy {
                background: #DC2626;
                color: white;
                border: 4px solid #1F2937;
                border-radius: 1rem;
                font-family: 'Bangers', cursive;
                font-size: 1.25rem;
                box-shadow: 4px 4px 0 #1F2937;
                transition: all 0.1s;
            }
            .btn-red-guy:active {
                transform: translate(4px, 4px);
                box-shadow: 0 0 0 #1F2937;
            }

            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: #1F2937;
                border: 3px solid #1F2937;
                border-radius: 1rem;
                font-family: 'Bangers', cursive;
            }
            .tab-btn.active {
                background: #FCD34D !important;
                color: #1F2937 !important;
                box-shadow: 4px 4px 0 #DC2626;
                transform: translate(-2px, -2px);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (Pork Butts & Taters) --- */}
        <header className="bg-[#DC2626] text-white pt-10 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-[0_10px_0_#1F2937] border-b-4 border-black z-10">
             {/* Background shapes */}
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMjAgMjBMMCAwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')]"></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#FCD34D] w-fit px-4 py-1.5 rounded-full border-4 border-black transform -rotate-2 shadow-sm">
                         <span className="w-3 h-3 rounded-full bg-[#DC2626] animate-pulse border-2 border-black"></span>
                         <p className="text-black text-[12px] font-bold tracking-widest wacky-font uppercase">TABLE: {tableLabel}</p>
                     </div>
                     <h1 className="text-4xl wacky-font tracking-wide leading-none mt-2 text-white drop-shadow-[3px_3px_0_#000] transform rotate-1">
                         {brand?.name || "Pork Butts & Taters"}
                     </h1>
                 </div>
                 {/* Red Guy Logo */}
                 <div className="w-20 h-20 bg-white rounded-full border-4 border-black flex items-center justify-center relative shadow-[4px_4px_0_#000] animate-wobble">
                     <Icon name="chef" size={48} className="text-[#DC2626]" />
                     <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#FCD34D] rounded-full border-4 border-black flex items-center justify-center text-black text-[10px] font-bold">
                        <Icon name="flame" size={14} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade-in">
                    {/* Hero Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[3rem] overflow-hidden shadow-[8px_8px_0_#000] mb-10 border-4 border-black p-2 group animate-image-pop">
                             <div className="h-full w-full rounded-[2.5rem] overflow-hidden bg-[#FEE2E2] relative border-2 border-black">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                 />
                             </div>
                             <div className="absolute bottom-4 left-6 bg-[#FCD34D] text-black px-5 py-2 rounded-xl border-4 border-black shadow-[4px_4px_0_#000] transform rotate-[-3deg]">
                                 <span className="wacky-font text-xl uppercase tracking-widest">SUPERCOW APPROVES!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2 animate-image-pop">
                         <div>
                             <h2 className="text-4xl wacky-font text-[#DC2626] drop-shadow-[2px_2px_0_#FFF]">Pork Butts!</h2>
                             <p className="text-sm text-black font-bold uppercase tracking-widest ml-1 bg-white px-2 border-2 border-black rotate-1 inline-block">And Taters!</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#7C3AED] text-white px-5 py-3 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-[#6D28D9] transition-all border-4 border-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none wacky-font">
                             SEE MENU <Icon name="menu" size={18} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#FEF3C7] border-b-4 border-black mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-[#DC2626] text-white text-[12px] font-bold px-3 py-1 rounded-lg border-2 border-black shadow-sm wacky-font transform rotate-3">
                                                SALE!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-black text-lg line-clamp-2 mb-1 leading-tight wacky-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[12px] text-gray-500 line-through font-bold decoration-2 decoration-red-500">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#DC2626] font-black text-2xl wacky-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FCD34D] text-black border-4 border-black flex items-center justify-center rounded-full hover:bg-[#F59E0B] transition-all shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                                                 <Icon name="plus" size={18} strokeWidth={4} />
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
                    <div className="relative mb-8 group animate-image-pop">
                         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                             <Icon name="search" className="text-black" />
                         </div>
                         <input type="text" placeholder="Where's the food?..." className="w-full pl-16 pr-8 py-5 rounded-2xl bg-white border-4 border-black text-black placeholder:text-gray-400 focus:outline-none focus:border-[#DC2626] focus:shadow-[4px_4px_0_#000] transition-all text-xl font-bold wacky-font" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1 animate-image-pop">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-xl font-bold ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#FEF3C7] border-b-4 border-black mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-black text-lg line-clamp-2 mb-1 leading-tight wacky-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-[12px] text-gray-500 line-through font-bold decoration-2 decoration-red-500">{pricing.original}</span>}
                                                <span className="text-[#DC2626] font-black text-2xl wacky-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FCD34D] text-black border-4 border-black flex items-center justify-center rounded-full hover:bg-[#F59E0B] transition-all shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                                                 <Icon name="plus" size={18} strokeWidth={4} />
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
                <section className="animate-fade-in pt-4 pb-24">
                    <div className="mb-8 flex items-center justify-between bg-white p-8 border-4 border-black rounded-[3rem] shadow-[8px_8px_0_#DC2626] relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-20 rotate-12 text-[#DC2626]">
                            <Icon name="clock" size={100} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-4xl font-black wacky-font text-[#DC2626]">Food Log</h2>
                             <p className="text-sm text-black font-bold mt-1 uppercase tracking-widest">Wait for it...</p>
                         </div>
                         <div className="w-16 h-16 bg-[#FCD34D] border-4 border-black rounded-full flex items-center justify-center animate-wobble shadow-md text-black">
                             <Icon name="clock" size={32} />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="bg-white p-6 border-4 border-black rounded-[2.5rem] shadow-[4px_4px_0_#9CA3AF] relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-[#DC2626] font-bold uppercase tracking-widest flex items-center gap-1">
                                         <Icon name="menu" size={14} /> Order #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-1 text-[12px] font-black uppercase tracking-wide border-2 border-black rounded-lg flex items-center gap-1.5 shadow-sm wacky-font transform -rotate-1
                                        ${o.status === 'pending' ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#D1FAE5] text-[#059669]'}`}>
                                         {o.status === 'pending' ? 'COOKING...' : 'DONE!'}
                                     </span>
                                </div>
                                <div className="mb-4 space-y-2 bg-[#F3F4F6] p-5 rounded-2xl border-2 border-black">
                                    {o.order_items.map((i, idx) => (
                                        <div key={idx} className="flex justify-between text-base text-black font-bold border-b-2 border-dashed border-gray-300 pb-2 last:border-0 wacky-font">
                                            <div className="flex flex-col">
                                                <span>{i.quantity}x {i.product_name}</span>
                                                {/* Variant */}
                                                {i.variant && i.variant !== 'normal' && <span className="text-[12px] text-[#7C3AED] bg-purple-100 px-1.5 rounded w-fit border border-purple-200 uppercase">{i.variant}</span>}
                                                {/* Note */}
                                                {i.note && <span className="text-[12px] text-gray-500 italic font-sans font-normal">"{i.note}"</span>}
                                            </div>
                                            <span className="text-[#DC2626]">{i.price * i.quantity}.-</span>
                                        </div>
                                    ))}
                                </div>
                                {/* Order Note */}
                                {o.note && (
                                    <div className="mb-4 px-5 py-2 bg-[#FEF2F2] rounded-xl border-2 border-[#FECACA] text-xs text-[#B91C1C] italic font-bold flex items-center gap-2">
                                        <Icon name="pencil" size={12} /> Note: "{o.note}"
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t-4 border-black">
                                     <span className="font-bold text-gray-500 text-xs uppercase tracking-widest">TOTAL</span>
                                     <span className="font-black text-black text-4xl wacky-font">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Wacky Capsule) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[85px] bg-white shadow-[0_8px_0_#000] flex justify-around items-center px-4 z-[100] rounded-[3rem] border-4 border-black">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#FEF3C7] border-2 border-black' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-black' : 'text-gray-400'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#FEF3C7] border-2 border-black' : ''}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-black' : 'text-gray-400'}`} />
                 </div>
             </button>

             {/* Big Cart Button (Udder/Basket) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#FCD34D] rounded-full shadow-[0_4px_0_#000] flex items-center justify-center text-black border-4 border-black active:scale-90 transition-all duration-100 z-20 group hover:bg-[#F59E0B] animate-wobble">
                     <Icon name="basket" size={32} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#DC2626] text-white text-[12px] font-black w-8 h-8 rounded-full flex items-center justify-center border-2 border-black animate-bounce wacky-font">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#FEF3C7] border-2 border-black' : ''}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-black' : 'text-gray-400'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Speech Bubble Style) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-white border-t-8 border-x-8 border-black h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[4rem] relative animate-image-pop">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-14 h-14 bg-[#DC2626] text-white rounded-full border-4 border-black flex items-center justify-center hover:bg-red-700 transition-colors shadow-sm active:scale-90">
                            <Icon name="x" strokeWidth={4} />
                        </button>
                        <div className="relative w-full h-85 overflow-hidden border-b-8 border-black rounded-b-[3.5rem] bg-[#FEE2E2]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-[#FCD34D] text-black font-black text-4xl wacky-font rounded-xl border-4 border-black shadow-[4px_4px_0_#000] transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-gray-600 decoration-red-500 decoration-4 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32 relative">
                        <h2 className="text-5xl wacky-font text-black mb-6 leading-tight drop-shadow-sm uppercase tracking-wide transform rotate-1">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            {/* --- 3 PRICES VARIANT SELECTOR (COW, CHICKEN, RED GUY) --- */}
                            <div>
                                <label className="block text-xl font-bold text-black mb-3 wacky-font uppercase tracking-wider">PICK A SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'CHICKEN', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'COW', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'RED GUY', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center justify-between h-28 wacky-font
                                                ${variant === v.key 
                                                    ? 'bg-[#7C3AED] border-black shadow-[4px_4px_0_#000] -translate-y-1 text-white' 
                                                    : 'bg-white border-gray-300 text-gray-400 hover:border-black hover:text-black'}`}
                                        >
                                            <span className="text-sm font-black tracking-widest">{v.label}</span>
                                            {v.key === 'normal' && <Icon name="chicken" size={24} className={variant === v.key ? "text-white" : "text-gray-300"} />}
                                            {v.key === 'special' && <Icon name="cow" size={24} className={variant === v.key ? "text-white" : "text-gray-300"} />}
                                            {v.key === 'jumbo' && <Icon name="butt" size={24} className={variant === v.key ? "text-white" : "text-gray-300"} />}
                                            
                                            <div className="flex flex-col items-center leading-none mt-1">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-black decoration-2">{v.original}</span>
                                                )}
                                                <span className="text-2xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-4 bg-white p-3 rounded-full border-4 border-black shadow-[4px_4px_0_#000]">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-gray-200 text-black rounded-full flex items-center justify-center hover:bg-gray-300 active:scale-90 transition-all font-black text-2xl border-2 border-black"><Icon name="minus" strokeWidth={4} /></button>
                                    <span className="text-4xl font-black w-14 text-center bg-transparent border-none text-black wacky-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#FCD34D] text-black rounded-full flex items-center justify-center hover:bg-[#F59E0B] active:scale-90 transition-all font-black text-2xl border-2 border-black"><Icon name="plus" strokeWidth={4} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-black font-black uppercase tracking-widest mb-1 wacky-font">DAMAGE</p>
                                    <p className="text-5xl font-black text-[#DC2626] wacky-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Item Note Input */}
                            <div className="relative">
                                <label className="block text-xl font-bold text-black mb-2 wacky-font uppercase tracking-wider">SECRET NOTE:</label>
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="E.g., Extra ketchup, No bones..." 
                                    className="w-full p-6 pl-12 bg-[#FEF3C7] border-4 border-black rounded-[2rem] focus:border-[#DC2626] focus:shadow-[4px_4px_0_#000] focus:outline-none h-32 resize-none text-xl font-bold text-black placeholder:text-gray-400 transition-all shadow-inner font-sans"
                                />
                                <div className="absolute top-12 left-4 text-[#DC2626] pointer-events-none">
                                    <Icon name="pencil" size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-white border-4 border-black text-black font-black text-xl rounded-xl active:scale-95 transition-all shadow-[4px_4px_0_#000] wacky-font">
                                STOW IT
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-red-guy text-2xl active:scale-95 transition-all flex items-center justify-center gap-2 wacky-font">
                                EAT IT! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ORDER SUMMARY MODAL --- */}
        <div id="orderSummaryOverlay" className={`fixed inset-0 bg-black/60 z-[130] backdrop-blur-sm animate-fade-in ${activeTab === 'cart' ? 'block' : 'hidden'}`} onClick={() => setActiveTab('menu')}></div>
        <div id="orderSummary" className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-[8px] border-black z-[140] flex flex-col shadow-2xl h-[92vh] rounded-t-[3rem] transition-transform duration-300 ${activeTab === 'cart' ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="sticky top-0 bg-white z-20 rounded-t-[3rem] border-b-4 border-black p-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                <div className="w-24 h-2 bg-black rounded-full mx-auto mt-2 opacity-20"></div>
            </div>
            
            <div className="flex justify-between items-center mb-6 px-10 pt-8">
                <h2 className="text-5xl wacky-font text-[#DC2626] transform -rotate-2 tracking-widest uppercase text-shadow-sm">Your Stash</h2>
                <div className="w-16 h-16 bg-[#FCD34D] text-black border-4 border-black rounded-full flex items-center justify-center font-black text-3xl shadow-[2px_2px_0_#000] wacky-font">
                    <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 px-8 pb-4 no-scrollbar">
                {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-black rounded-[2rem] shadow-[4px_4px_0_#9CA3AF] relative overflow-hidden hover:shadow-[2px_2px_0_#9CA3AF] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                        <div className="w-20 h-20 bg-[#FEF3C7] rounded-2xl overflow-hidden border-2 border-black shrink-0">
                            <img src={item.image_url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-black text-xl leading-tight wacky-font tracking-wide">
                                {item.name} <span className="text-[#DC2626]">x{item.quantity}</span>
                            </div>
                            <div className="text-sm font-bold mt-1 text-[#4B5563]">
                                {item.variant !== 'normal' && <span className="bg-[#7C3AED] text-white px-2 py-0.5 rounded border-2 border-black text-xs mr-2 font-sans uppercase font-bold">{item.variant}</span>}
                                {/* 🔥 VISIBLE ITEM NOTE IN CART */}
                                {item.note && (
                                    <span className="block mt-1 bg-[#FEF3C7] text-black text-[12px] px-2 py-1 rounded border border-black italic font-sans">
                                        <Icon name="pencil" size={10} /> "{item.note}"
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className="font-black text-black text-2xl wacky-font">{item.price * item.quantity}.-</span>
                             <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#FEE2E2] text-[#DC2626] rounded-full flex items-center justify-center hover:bg-red-200 transition-colors border-2 border-black shadow-sm active:scale-90">
                                 <Icon name="trash" size={18} />
                             </button>
                        </div>
                    </div>
                ))}
                {cart.length === 0 && (
                    <div className="text-center py-20 text-gray-400 font-bold text-2xl wacky-font opacity-50">
                        Nothing here...
                    </div>
                )}
            </div>

            {/* 📝 Order Note Input (Removed as requested, sticking to Item Note) */}

            <div className="p-10 bg-[#FEF3C7] border-t-4 border-black relative z-30 rounded-t-[3rem]">
                <div className="flex justify-between items-center mb-8 pb-6 border-b-4 border-dashed border-black">
                    <div>
                        <p className="text-sm text-black font-black uppercase tracking-widest wacky-font">Total</p>
                        <p className="text-6xl font-black text-[#DC2626] drop-shadow-[2px_2px_0_#FFF] wacky-font">{cartTotal}.-</p>
                    </div>
                    <div className="w-24 h-24 bg-white border-4 border-black rounded-full flex items-center justify-center text-black transform rotate-6 shadow-[4px_4px_0_#000]">
                        <Icon name="basket" size={48} />
                    </div>
                </div>
                <button onClick={() => { onCheckoutClick(); }} className="w-full py-6 btn-red-guy text-4xl active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-widest wacky-font">
                    <span>CHECKOUT!</span> <Icon name="check" size={32} strokeWidth={4} />
                </button>
            </div>
        </div>

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-black/90 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-image-pop">
                <div className="w-full max-w-sm bg-white border-8 border-black p-10 text-center shadow-[10px_10px_0_#DC2626] relative overflow-hidden rounded-[3rem]">
                    <div className="w-28 h-28 bg-[#FCD34D] text-black rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-black shadow-lg relative z-10 animate-crazy">
                        <Icon name="flame" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-4xl wacky-font text-black mb-4 leading-tight relative z-10 uppercase tracking-widest">GOT IT?</h3>
                            <p className="text-xl text-gray-700 mb-10 font-bold font-sans relative z-10">Add "{selectedProduct.name}" to the pile?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-[#DC2626] text-white font-black border-4 border-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl wacky-font uppercase tracking-widest rounded-xl">YES! GRAB IT!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-white border-4 border-black text-black font-black text-xl active:scale-95 transition-transform hover:bg-gray-100 wacky-font rounded-xl uppercase">JUST ADD</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl wacky-font text-black mb-4 leading-tight relative z-10 uppercase tracking-widest">EAT NOW?</h3>
                            <p className="text-xl text-gray-700 mb-10 font-bold font-sans relative z-10">Devour all the food in your stash?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                {/* Pass orderNote to handleCheckout */}
                                <button onClick={() => { onCheckoutClick(); }} className="w-full py-5 bg-[#7C3AED] text-white font-black border-4 border-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl wacky-font uppercase tracking-widest rounded-xl">YES! I'M HUNGRY!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white border-4 border-black text-black font-black text-xl active:scale-95 transition-transform hover:bg-gray-100 wacky-font rounded-xl uppercase">NOT YET!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}