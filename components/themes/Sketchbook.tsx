import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Sketch / Hand-drawn Style) ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Simple House Doodle
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />, 
    // Menu -> List Lines
    menu: <path d="M3 12h18M3 6h18M3 18h18" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Bag Doodle
    basket: <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />,
    // Clock -> Circle with hands
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Hat Doodle
    chef: <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Scribble Fire
    flame: <path d="M12 2c0 0-3 5-3 9 0 4.418 3 8 8 8s5-3.582 5-8c0-5-7-9-7-9z" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
      {name === 'clock' && <polyline points="12 6 12 12 16 14" />}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#fefcf0] flex items-center justify-center text-[#1a1a1a] font-black text-2xl animate-pulse">DRAWING...</div>;

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
    // Theme: Sketchbook - Full Color Images
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#1a1a1a]">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Itim&family=Mali:wght@400;600;700&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --ink-black: #1a1a1a;
                --pencil-gray: #4b5563;
                --paper-white: #fefcf0;
                --paper-texture: #f4f1ea;
                --sketch-border: #262626;
            }

            body {
                font-family: 'Itim', 'Sarabun', sans-serif;
                background-color: var(--paper-texture);
                /* Paper texture and subtle grid line */
                background-image: 
                    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
                background-size: 25px 25px;
                background-attachment: fixed;
                color: var(--ink-black);
            }

            h1, h2, h3, .sketch-font {
                font-family: 'Mali', cursive;
                font-weight: 700;
            }

            /* Hand-drawn wiggly border effect */
            .sketch-border {
                border: 3px solid var(--ink-black);
                border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
            }

            /* Scribble Animation */
            @keyframes scribble {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(0.5deg); }
                75% { transform: rotate(-0.5deg); }
            }

            .animate-scribble {
                animation: scribble 0.5s infinite linear;
            }

            /* Item Card - Sketch Style */
            .item-card {
                transition: all 0.3s ease;
                position: relative;
                background: white;
                border: 2px solid var(--ink-black);
                border-radius: 4px;
                box-shadow: 4px 4px 0px var(--ink-black);
                overflow: hidden;
                transform: rotate(-0.5deg);
            }
            
            .item-card:hover, .item-card:active {
                transform: translate(2px, 2px) rotate(0.5deg);
                box-shadow: 1px 1px 0px var(--ink-black);
            }

            /* Normal Color Image */
            .sketch-image {
                filter: none;
                mix-blend-mode: normal;
                border-bottom: 2px solid var(--ink-black);
            }

            .btn-ink {
                background: var(--ink-black);
                color: white;
                border-radius: 4px;
                font-weight: 700;
                box-shadow: 3px 3px 0 rgba(0,0,0,0.2);
                transition: all 0.2s;
                text-transform: uppercase;
                border: 2px solid transparent;
            }
            
            .btn-ink:active {
                transform: scale(0.98);
                box-shadow: 0 0 0;
            }

            .btn-outline {
                background: white;
                color: var(--ink-black);
                border: 2px solid var(--ink-black);
                border-radius: 4px;
                font-weight: 700;
                box-shadow: 3px 3px 0 var(--ink-black);
                transition: all 0.2s;
            }
            
            .btn-outline:active {
                transform: translate(2px, 2px);
                box-shadow: 0 0 0;
            }

            .tab-active {
                background: var(--ink-black) !important;
                color: white !important;
                text-decoration: underline;
                transform: rotate(-1deg);
            }
            
            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: var(--ink-black);
                border: 2px solid var(--ink-black);
                border-radius: 4px;
                font-weight: 800;
                box-shadow: 2px 2px 0 var(--pencil-gray);
            }

            .page-transition {
                animation: fadeIn 0.5s ease;
            }
            
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (Sketch Title) --- */}
        <header className="pt-8 pb-4 px-6 relative z-10">
             <div className="flex justify-between items-center">
                 <div>
                     <div className="inline-block px-3 py-1 border-2 border-black bg-white transform -rotate-2 mb-2 shadow-[2px_2px_0_black]">
                         <p className="text-[10px] font-bold tracking-widest uppercase sketch-font">Table: {tableLabel}</p>
                     </div>
                     <h1 className="text-4xl sketch-font leading-none mt-1 underline decoration-wavy decoration-2 decoration-gray-400">
                         {brand?.name || "The Sketchbook"}
                     </h1>
                 </div>
                 <div className="w-16 h-16 border-4 border-black rounded-full flex items-center justify-center bg-white shadow-[4px_4px_0_black] animate-scribble">
                     <Icon name="chef" size={32} />
                 </div>
             </div>
        </header>

        <main className="px-5 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade-in">
                    {/* Hero Banner (Sketch Frame) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white border-4 border-black p-3 mb-10 shadow-[6px_6px_0_black] transform rotate-1">
                             <div className="h-full w-full border-2 border-gray-200 overflow-hidden relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover" 
                                 />
                             </div>
                             <div className="absolute -bottom-4 -left-2 bg-black text-white px-4 py-1 transform -rotate-3 sketch-font">
                                 #Featured
                             </div>
                             {/* Tape effect */}
                             <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/50 border border-gray-300 transform -rotate-1"></div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2">
                         <div>
                             <h2 className="text-3xl sketch-font">Daily Sketches</h2>
                             <p className="text-xs text-gray-500 font-bold uppercase tracking-widest ml-1">Freshly Drawn for You</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="btn-outline px-4 py-2 text-xs flex items-center gap-2">
                             FULL MENU <Icon name="menu" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer">
                                     <div className="w-full h-40 overflow-hidden relative border-b-2 border-black">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover sketch-image" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-2 right-2 bg-black text-white text-[10px] font-bold px-2 py-1 sketch-font">
                                                 PROMO
                                             </div>
                                         )}
                                     </div>
                                     <div className="p-3">
                                         <h3 className="font-bold text-sm line-clamp-2 mb-1 leading-tight sketch-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-gray-400 line-through decoration-black">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="font-black text-xl sketch-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <div className="w-8 h-8 border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                                                 <Icon name="plus" size={14} strokeWidth={3} />
                                             </div>
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
                    <div className="relative mb-8">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                             <Icon name="search" />
                         </div>
                         <input type="text" placeholder="Search sketch..." className="w-full pl-12 pr-4 py-3 bg-white border-2 border-black rounded-none focus:outline-none focus:shadow-[4px_4px_0_gray] transition-all text-lg font-bold sketch-font" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-2 text-lg sketch-font ${selectedCategoryId === c.id ? 'tab-active' : ''}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer">
                                     <div className="w-full h-40 overflow-hidden relative border-b-2 border-black">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover sketch-image" />
                                     </div>
                                     <div className="p-3">
                                         <h3 className="font-bold text-sm line-clamp-2 mb-1 leading-tight sketch-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-gray-400 line-through decoration-black">{pricing.original}</span>}
                                                 <span className="font-black text-xl sketch-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <div className="w-8 h-8 border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                                                 <Icon name="plus" size={14} strokeWidth={3} />
                                             </div>
                                         </div>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- STATUS PAGE (Sketch Theme - FIXED LOGIC) --- */}
            {activeTab === 'status' && (
                <section className="animate-fade-in pt-4 pb-24">
                    <div className="mb-8 flex items-center justify-between bg-white p-6 border-4 border-black shadow-[8px_8px_0_gray] relative overflow-hidden transform -rotate-1">
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black sketch-font underline decoration-wavy">Order Log</h2>
                             <p className="text-sm text-gray-600 font-bold mt-1 uppercase tracking-widest">Kitchen is sketching...</p>
                         </div>
                         <div className="w-16 h-16 border-4 border-black rounded-full flex items-center justify-center animate-scribble">
                             <Icon name="clock" size={32} />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="bg-white p-6 border-2 border-black shadow-[4px_4px_0_black] relative">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-2">
                                     <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 sketch-font">
                                         Ticket #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wide border-2 border-black 
                                        ${o.status === 'pending' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                        {o.status === 'pending' ? 'DRAWING...' : 'DONE!'}
                                     </span>
                                </div>

                                {/* Items */}
                                <div className="mb-4 space-y-2">
                                    {o.order_items.map((i, idx) => {
                                        // ✅ FIXED LOGIC FOR STATUS PAGE
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        const hasDiscount = (i.original_price && i.original_price > i.price) || (i.discount > 0);
                                        const originalPriceTotal = hasDiscount 
                                            ? (i.original_price ? i.original_price * i.quantity : (i.price + (i.discount || 0)) * i.quantity) 
                                            : finalPriceTotal;
                                        const discountAmount = originalPriceTotal - finalPriceTotal;

                                        return (
                                            <div key={idx} className="flex justify-between items-start text-sm font-bold border-b border-dashed border-gray-400 pb-2 last:border-0 sketch-font">
                                                
                                                {/* Left Info */}
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-base">
                                                        <span className="text-lg">{quantity}x</span> {i.product_name}
                                                    </span>
                                                    
                                                    {/* Variant Badge (Sketch Style) */}
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] bg-black text-white px-2 py-0.5 border border-black font-sans font-bold mt-1 uppercase tracking-wider transform -rotate-1`}>
                                                            {i.variant === 'special' ? '★ SPECIAL' : i.variant === 'jumbo' ? '■ JUMBO' : i.variant}
                                                        </span>
                                                    )}

                                                    {/* Note */}
                                                    {i.note && <span className="text-[10px] text-gray-500 italic mt-0.5">"{i.note}"</span>}
                                                </div>

                                                {/* Right Price */}
                                                <div className="text-right flex flex-col items-end min-w-[80px]">
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className="text-[10px] bg-gray-200 text-black px-1 border border-black transform rotate-2">
                                                                SAVE -{discountAmount}
                                                            </span>
                                                            <span className="text-xs text-gray-400 line-through decoration-black font-bold">
                                                                {originalPriceTotal}
                                                            </span>
                                                            <span className="text-lg leading-none">
                                                                {finalPriceTotal}.-
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-lg">{finalPriceTotal}.-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t-4 border-double border-black">
                                     <span className="font-bold text-xs uppercase tracking-widest">TOTAL INK</span>
                                     <span className="font-black text-3xl sketch-font">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-20 text-gray-400 font-bold text-2xl sketch-font">
                                Nothing drawn yet...
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Toolbar) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[70px] bg-white shadow-[4px_4px_0_black] flex justify-around items-center px-4 z-[100] border-2 border-black">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all w-16 ${activeTab === 'home' ? 'scale-110' : 'opacity-50'}`}>
                 <Icon name="home" size={24} />
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all w-16 ${activeTab === 'menu' ? 'scale-110' : 'opacity-50'}`}>
                 <Icon name="menu" size={24} />
             </button>

             {/* Big Cart Button (Ink Pot) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-16 h-16 bg-black rounded-full shadow-[2px_2px_0_gray] flex items-center justify-center text-white border-2 border-white active:scale-90 transition-all z-20">
                     <Icon name="basket" size={24} />
                     {cart?.length > 0 && (
                         <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-black">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all w-16 ${activeTab === 'status' ? 'scale-110' : 'opacity-50'}`}>
                 <Icon name="clock" size={24} />
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Sketch Pad - FIXED 3 PRICES) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-white border-t-4 border-x-4 border-black h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-[0_-10px_0_rgba(0,0,0,0.1)] relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-30 w-10 h-10 bg-white text-black border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors shadow-[2px_2px_0_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-4 border-black bg-gray-100">
                            {/* 🔥 FULL COLOR IMAGE */}
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-white text-black font-black text-3xl sketch-font border-4 border-black shadow-[4px_4px_0_black] transform -rotate-2 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-gray-400 decoration-black decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pt-8 pb-32 relative">
                        <h2 className="text-3xl sketch-font text-black mb-6 leading-tight underline decoration-2 decoration-gray-400">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            
                            {/* ✅ FIXED: 3 Variants Grid (Black & White Toggle) */}
                            <div>
                                <label className="block text-lg font-bold text-black mb-3 sketch-font ml-1 tracking-wide">SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'NORMAL', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'SPECIAL', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'JUMBO', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 border-2 transition-all flex flex-col items-center justify-between h-24 sketch-font
                                                ${variant === v.key 
                                                    ? 'bg-black text-white border-black shadow-[4px_4px_0_gray] -translate-y-1' 
                                                    : 'bg-white text-black border-black hover:bg-gray-100'}`}
                                        >
                                            <span className="text-[10px] font-black tracking-widest uppercase">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className={`text-[9px] line-through decoration-2 opacity-70 mb-1 ${variant === v.key ? 'decoration-white' : 'decoration-black'}`}>{v.original}</span>
                                                )}
                                                <span className="text-lg font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2 border-y-2 border-dashed border-gray-300">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 bg-white text-black border-2 border-black flex items-center justify-center active:scale-90 transition-all font-black text-xl shadow-[2px_2px_0_black]"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-3xl font-black w-10 text-center bg-transparent border-none text-black sketch-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-10 h-10 bg-black text-white border-2 border-black flex items-center justify-center active:scale-90 transition-all font-black text-xl shadow-[2px_2px_0_gray]"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-1">Total Ink</p>
                                    <p className="text-4xl font-black text-black sketch-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Add a sketch note..." 
                                    className="w-full p-4 bg-white border-2 border-black focus:outline-none focus:shadow-[4px_4px_0_black] transition-shadow h-24 resize-none text-lg font-bold text-black placeholder:text-gray-400 sketch-font"
                                />
                                <div className="absolute top-2 right-2 text-gray-400 pointer-events-none">
                                    <Icon name="pencil" size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border-2 border-black text-black font-black text-lg shadow-[4px_4px_0_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all sketch-font">
                                ADD TO LIST
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 bg-black text-white border-2 border-black font-black text-lg shadow-[4px_4px_0_gray] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all sketch-font flex items-center justify-center gap-2">
                                DRAW NOW! <Icon name="check" size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (Rough List) --- */}
        {activeTab === 'cart' && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-[#fefcf0] border-t-4 border-x-4 border-black flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.2)] h-[85vh] relative" style={{backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '100% 2rem'}}>
                    
                    {/* Spiral binding visual */}
                    <div className="absolute -top-6 left-0 w-full h-8 flex justify-evenly z-20">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="w-4 h-8 bg-gray-300 border-2 border-black rounded-full"></div>
                        ))}
                    </div>

                    <div className="w-full py-6 cursor-pointer hover:bg-black/5 flex justify-center" onClick={() => setActiveTab('menu')}>
                        <div className="w-16 h-1 bg-black/20 rounded-full" />
                    </div>

                    <div className="flex justify-between items-center mb-4 px-8">
                        <h2 className="text-4xl font-black text-black sketch-font underline decoration-4 decoration-black">Your List</h2>
                        <div className="w-12 h-12 bg-black text-white border-2 border-black flex items-center justify-center font-black text-2xl shadow-[4px_4px_0_gray]">
                            <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-white p-3 border-2 border-black shadow-[4px_4px_0_black] relative">
                                {/* 🔥 FULL COLOR IMAGE IN CART */}
                                <img src={item.image_url} className="w-16 h-16 object-cover border-2 border-black" />
                                <div className="flex-1">
                                    <div className="font-bold text-black text-lg leading-tight sketch-font">
                                        {item.name} <span className="text-gray-500 text-sm">x{item.quantity}</span>
                                    </div>
                                    <div className="text-xs font-bold mt-1 text-black">
                                        {item.variant !== 'normal' && <span className="bg-black text-white px-2 py-0.5 mr-2">{item.variant}</span>}
                                        {item.note && <span className="block text-gray-500 italic mt-1 font-normal">"{item.note}"</span>}
                                    </div>
                                </div>
                                <div className="font-black text-black text-xl sketch-font">{item.price * item.quantity}.-</div>
                                <button onClick={() => updateQuantity(idx, -1)} className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                                    <Icon name="trash" size={14} />
                                </button>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="text-center py-20 text-gray-400 font-bold sketch-font text-xl">
                                List is empty... <br/>Start scribbling!
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-white border-t-4 border-black relative z-30">
                        <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-dashed border-black">
                            <div>
                                <p className="text-xs text-gray-500 font-black uppercase tracking-widest">Grand Total</p>
                                <p className="text-5xl font-black text-black sketch-font">{cartTotal}.-</p>
                            </div>
                            <div className="w-16 h-16 bg-black text-white border-4 border-black rounded-full flex items-center justify-center transform rotate-6">
                                <Icon name="basket" size={32} />
                            </div>
                        </div>
                        <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 bg-black text-white text-2xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest sketch-font shadow-[4px_4px_0_gray] border-2 border-black">
                            <span>CONFIRM!</span> <Icon name="check" size={28} strokeWidth={4} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-white/90 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-sm bg-white border-4 border-black p-10 text-center shadow-[10px_10px_0_black] relative overflow-hidden">
                    <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-black animate-scribble">
                        <Icon name="chef" size={48} />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-3xl sketch-font text-black mb-4 leading-tight uppercase tracking-widest decoration-wavy underline">Draw this?</h3>
                            <p className="text-lg text-gray-600 mb-10 font-bold sketch-font">Add "{selectedProduct.name}" to the queue?</p>
                            <div className="flex flex-col gap-4">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-black text-white font-black border-2 border-black shadow-[4px_4px_0_gray] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-xl sketch-font uppercase">YES! DRAW IT!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white text-black font-black border-2 border-black shadow-[4px_4px_0_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-lg sketch-font uppercase">Just List It</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl sketch-font text-black mb-4 leading-tight uppercase tracking-widest decoration-wavy underline">Finalize Art?</h3>
                            <p className="text-lg text-gray-600 mb-10 font-bold sketch-font">Send all items to the kitchen artists?</p>
                            <div className="flex flex-col gap-4">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-black text-white font-black border-2 border-black shadow-[4px_4px_0_gray] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-xl sketch-font uppercase">YES! START!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white text-black font-black border-2 border-black shadow-[4px_4px_0_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-lg sketch-font uppercase">Wait!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}