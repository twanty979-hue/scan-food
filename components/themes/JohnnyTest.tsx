import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Johnny Test / Lab Style) ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Vials
    home: <path d="M9 3h6v2h-2v12a3 3 0 0 1-6 0V5H5V3h4zm2 14a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />, 
    // Menu -> Clipboard
    menu: <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Radiation
    basket: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />,
    // Clock -> Atom / Timer
    clock: <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4-2.37z" />,
    // Chef -> Dog (Dukey) / Hair
    chef: <path d="M12 2l-2 5h4l-2-5zm-5 7l2 4h6l2-4-5 2-5-2z" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Explosion
    flame: <path d="M12 2l2 4 4-2-2 5 4 2-5 2 2 4-5-2-2 4-2-5-5-2 4-2-2-5 4 2z" />, 
    
    // Specifics
    atom: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />,
    flask: <path d="M6 22h12a2 2 0 0 0 2-2V8l-6-6H6L0 8v12a2 2 0 0 0 2 2zm6-12a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />,
    bolt: <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z" />
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
      {name === 'basket' && <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />}
      {name === 'clock' && <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-[#facc15] font-black text-2xl animate-kaboom">INITIALIZING LAB...</div>;

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
    // Theme: Johnny Test - Test Lab System
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans ">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Chakra+Petch:wght@400;600;700&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --fire-yellow: #facc15;
                --flame-orange: #f97316;
                --johnny-red: #ef4444;
                --toxic-green: #22c55e;
                --denim-blue: #2563eb;
                --lab-dark: #18181b;
                --bg-lab: #f8fafc;
            }

            body {
                font-family: 'Chakra Petch', 'Sarabun', sans-serif;
                background-color: var(--bg-lab);
                background-image: 
                    linear-gradient(rgba(34, 197, 94, 0.05) 2px, transparent 2px),
                    linear-gradient(90deg, rgba(34, 197, 94, 0.05) 2px, transparent 2px);
                background-size: 50px 50px;
                background-attachment: fixed;
                color: var(--lab-dark);
            }

            .comic-font {
                font-family: 'Bangers', cursive;
                letter-spacing: 2px;
                text-transform: uppercase;
            }

            @keyframes kaboom {
                0% { transform: scale(1); filter: brightness(1); }
                50% { transform: scale(1.05); filter: brightness(1.2); }
                100% { transform: scale(1); filter: brightness(1); }
            }
            .animate-kaboom { animation: kaboom 2s infinite ease-in-out; }

            /* Shake Animation */
            @keyframes lab-shake {
                0% { transform: translate(0, 0); }
                25% { transform: translate(-2px, 2px); }
                50% { transform: translate(2px, -2px); }
                75% { transform: translate(-2px, -2px); }
                100% { transform: translate(0, 0); }
            }
            .hover-shake:hover { animation: lab-shake 0.2s infinite; }

            /* Image Pop Animation */
            @keyframes pop-image {
                0% { opacity: 0; transform: scale(0.8) translateY(10px); }
                60% { opacity: 1; transform: scale(1.05); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-image-pop { animation: pop-image 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }

            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.8s ease-out; }

            .item-card {
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                background: white;
                border: 4px solid var(--lab-dark);
                box-shadow: 8px 8px 0px var(--fire-yellow);
                overflow: hidden;
            }
            .item-card:hover, .item-card:active {
                transform: translate(-4px, -4px);
                box-shadow: 12px 12px 0px var(--toxic-green);
                border-color: var(--johnny-red);
            }

            .btn-experiment {
                background: var(--johnny-red);
                color: white;
                border: 3px solid var(--lab-dark);
                font-family: 'Bangers', cursive;
                font-size: 1.2rem;
                box-shadow: 4px 4px 0px var(--lab-dark);
                transition: all 0.1s;
            }
            .btn-experiment:active {
                transform: translate(4px, 4px);
                box-shadow: 0px 0px 0px var(--lab-dark);
            }

            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: var(--lab-dark);
                border: 3px solid var(--lab-dark);
                font-weight: 800;
            }
            .tab-btn.active {
                background: var(--toxic-green) !important;
                color: var(--lab-dark) !important;
                border: 4px solid var(--lab-dark);
                box-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
                transform: scale(1.1) rotate(-1deg);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (Lab Control Panel HUD) --- */}
        <header className="bg-zinc-900 text-white pt-10 pb-16 px-6 rounded-b-none relative overflow-hidden shadow-xl z-10 border-b-8 border-yellow-500">
             {/* Hazard Stripes Overlay */}
             <div className="absolute bottom-0 left-0 w-full h-4 opacity-50" style={{backgroundImage: 'repeating-linear-gradient(45deg,#facc15,#facc15 10px,#000 10px,#000 20px)'}}></div>
             <div className="absolute top-0 right-0 p-4 opacity-20 text-5xl rotate-12">
                <Icon name="basket" size={48} />
             </div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-green-600/40 w-fit px-3 py-1 border-2 border-green-400/50 backdrop-blur-sm transform -rotate-1">
                         <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                         <p className="text-green-300 text-[10px] font-black tracking-[0.2em] comic-font uppercase">Lab Protocol: {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl comic-font tracking-tighter leading-none mt-1 text-white drop-shadow-[0_4px_0_#ef4444]">
                         {brand?.name || "JOHNNY'S TEST LAB"}
                     </h1>
                 </div>
                 {/* Duke & Johnny Badge */}
                 <div className="flex items-center gap-2">
                     <div className="w-14 h-14 bg-white border-4 border-yellow-500 flex items-center justify-center relative shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-kaboom">
                         <Icon name="bolt" size={32} className="text-orange-500" />
                         <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 border-2 border-white flex items-center justify-center text-white text-[10px]">
                            <Icon name="chef" size={14} />
                         </div>
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade-in">
                    {/* Hero Banner (Lab Monitor Style) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-52 bg-slate-900 rounded-none overflow-hidden shadow-[10px_10px_0_#22c55e] mb-10 border-4 border-zinc-700 p-1 group animate-image-pop">
                             <div className="h-full w-full rounded-none overflow-hidden bg-black opacity-80 group-hover:opacity-100 transition-opacity relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover" 
                                 />
                                 <div className="absolute inset-0 pointer-events-none" style={{background: 'radial-gradient(circle,transparent 40%,rgba(0,0,0,0.4) 100%)'}}></div>
                             </div>
                             <div className="absolute bottom-4 left-4 bg-yellow-400 text-black px-4 py-1 border-2 border-black shadow-lg transform rotate-[-2deg]">
                                 <span className="comic-font text-lg">TOP SECRET PROJECT</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-1 animate-image-pop">
                         <div>
                             <h2 className="text-3xl comic-font text-zinc-900 drop-shadow-sm transform -rotate-1">Test Samples</h2>
                             <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest ml-1">Experimental Rations</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-black text-white px-5 py-2.5 rounded-none text-xs font-black flex items-center gap-2 hover:bg-zinc-800 transition-all border-2 border-white shadow-[4px_4px_0_#facc15] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                             LOG DATA <Icon name="search" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-zinc-100 border-b-4 border-zinc-900">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-2 right-2 bg-[#ef4444] text-white text-[10px] font-black px-2 py-1 border-2 border-black shadow-sm comic-font transform rotate-3">
                                                 DANGER!
                                             </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-zinc-900 text-sm line-clamp-2 mb-1 leading-tight comic-font tracking-wide">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-zinc-400 line-through decoration-red-500 decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#2563eb] font-black text-xl comic-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#facc15] text-black border-2 border-black flex items-center justify-center hover:bg-yellow-300 transition-all shadow-[2px_2px_0_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                                                 <Icon name="plus" size={14} strokeWidth={3} />
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
                             <Icon name="search" className="text-green-500" />
                         </div>
                         <input type="text" placeholder="Scanning inventory..." className="w-full pl-16 pr-8 py-5 rounded-none bg-white border-4 border-zinc-900 text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-lg font-bold" />
                    </div>

                    <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar py-1 px-1 animate-image-pop">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-2 text-sm font-bold uppercase tracking-widest comic-font ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-zinc-100 border-b-4 border-zinc-900">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-zinc-900 text-sm line-clamp-2 mb-1 leading-tight comic-font tracking-wide">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-zinc-400 line-through decoration-red-500 decoration-2 font-bold">{pricing.original}</span>}
                                                 <span className="text-[#2563eb] font-black text-xl comic-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#facc15] text-black border-2 border-black flex items-center justify-center hover:bg-yellow-300 transition-all shadow-[2px_2px_0_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                                                 <Icon name="plus" size={14} strokeWidth={3} />
                                             </button>
                                         </div>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- STATUS PAGE (Lab Theme - FIXED LOGIC) --- */}
            {activeTab === 'status' && (
                <section className="animate-fade-in pt-4 pb-24">
                    <div className="mb-8 flex items-center justify-between bg-white p-7 border-4 border-zinc-900 shadow-[10px_10px_0_#facc15] relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12 text-zinc-900">
                            <Icon name="basket" size={100} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black comic-font text-zinc-950">EXPERIMENT LOG</h2>
                             <p className="text-[10px] text-red-600 font-bold mt-1 uppercase tracking-widest">Awaiting Results...</p>
                         </div>
                         <div className="w-16 h-16 bg-zinc-900 border-4 border-green-400 flex items-center justify-center animate-pulse shadow-md text-green-400">
                             <Icon name="atom" size={32} />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="bg-white p-6 border-4 border-zinc-900 shadow-[6px_6px_0_#22c55e] relative overflow-hidden">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4 border-b-2 border-dashed border-zinc-300 pb-2">
                                     <span className="text-xs text-zinc-900 font-black uppercase tracking-widest flex items-center gap-1 comic-font">
                                         Test #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wide border-2 border-black 
                                        ${o.status === 'pending' ? 'bg-[#facc15] text-black' : 'bg-[#22c55e] text-black'}`}>
                                        {o.status === 'pending' ? 'PROCESSING...' : 'SUCCESS!'}
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
                                            <div key={idx} className="flex justify-between items-start text-sm font-bold border-b border-zinc-100 pb-2 last:border-0 comic-font tracking-wide">
                                                
                                                {/* Left Info */}
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-base text-zinc-800">
                                                        <span className="text-red-500">{quantity}x</span> {i.product_name}
                                                    </span>
                                                    
                                                    {/* Variant Badge (Lab Style) */}
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] bg-zinc-900 text-white px-2 py-0.5 border border-white font-sans font-bold mt-1 uppercase tracking-wider transform -rotate-1`}>
                                                            {i.variant === 'special' ? '🧪 BETA' : i.variant === 'jumbo' ? '☢️ OMEGA' : i.variant}
                                                        </span>
                                                    )}

                                                    {/* Note */}
                                                    {i.note && <span className="text-[10px] text-blue-600 italic mt-0.5 sans-serif">"{i.note}"</span>}
                                                </div>

                                                {/* Right Price */}
                                                <div className="text-right flex flex-col items-end min-w-[80px]">
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className="text-[10px] bg-red-500 text-white px-1 border border-black transform rotate-2">
                                                                SAVE -{discountAmount}
                                                            </span>
                                                            <span className="text-xs text-zinc-400 line-through decoration-black font-bold">
                                                                {originalPriceTotal}
                                                            </span>
                                                            <span className="text-lg leading-none text-zinc-900">
                                                                {finalPriceTotal}.-
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-lg text-zinc-900">{finalPriceTotal}.-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t-4 border-zinc-900">
                                     <span className="font-bold text-zinc-500 text-xs uppercase tracking-widest">ENERGY</span>
                                     <span className="font-black text-3xl comic-font text-blue-600">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-20 text-zinc-400 font-bold text-2xl comic-font">
                                No data found...
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Lab Tablet) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[380px] h-[80px] bg-zinc-900 shadow-2xl flex justify-around items-center px-4 z-[100] border-t-8 border-yellow-500 rounded-none">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 border-2 border-transparent flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-white/10 border-white/20' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-yellow-400 drop-shadow-[0_0_8px_#facc15]' : 'text-slate-500'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 border-2 border-transparent flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-white/10 border-white/20' : ''}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-yellow-400 drop-shadow-[0_0_8px_#facc15]' : 'text-slate-500'}`} />
                 </div>
             </button>

             {/* Big Cart Button (Red Alert) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-red-600 border-4 border-white shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center text-white active:scale-90 transition-all duration-100 z-20 group hover-shake">
                     <Icon name="basket" size={32} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-black w-7 h-7 flex items-center justify-center border-4 border-black animate-pulse">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 border-2 border-transparent flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-white/10 border-white/20' : ''}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-yellow-400 drop-shadow-[0_0_8px_#facc15]' : 'text-slate-500'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Lab Screen - FIXED 3 PRICES) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-white border-t-8 border-x-4 border-zinc-900 h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl relative animate-image-pop">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-30 w-12 h-12 bg-white text-black border-4 border-black flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors shadow-[4px_4px_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-80 overflow-hidden border-b-8 border-zinc-900 bg-slate-100">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-zinc-900 text-yellow-400 font-black text-3xl comic-font border-4 border-white shadow-[6px_6px_0_#ef4444] transform -rotate-2 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-zinc-500 decoration-red-500 decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32 relative">
                        <h2 className="text-4xl comic-font text-zinc-900 mb-6 leading-tight drop-shadow-sm uppercase tracking-widest">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            
                            {/* ✅ FIXED: 3 Variants Grid (PROTOTYPE/BETA/FINAL) */}
                            <div>
                                <label className="block text-lg font-bold text-zinc-800 mb-3 comic-font ml-1 tracking-wide">SELECT STAGE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'PROTO', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'BETA', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'FINAL', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 border-4 transition-all flex flex-col items-center justify-between h-24 comic-font
                                                ${variant === v.key 
                                                    ? 'bg-zinc-900 border-zinc-900 text-yellow-400 shadow-[4px_4px_0_#22c55e] -translate-y-1' 
                                                    : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600'}`}
                                        >
                                            <span className="text-[12px] font-black tracking-widest uppercase">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-red-500 decoration-2 opacity-70 mb-1">{v.original}</span>
                                                )}
                                                <span className="text-xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-4 bg-zinc-900 p-2 border-4 border-white shadow-lg">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white text-black flex items-center justify-center hover:bg-zinc-200 active:scale-90 transition-all font-black text-2xl"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-white comic-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-green-500 text-white flex items-center justify-center hover:bg-green-400 active:scale-90 transition-all font-black text-2xl"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-1">Energy Cost</p>
                                    <p className="text-4xl font-black text-slate-900 comic-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Enter test parameters (Notes)..." 
                                    className="w-full p-6 bg-slate-100 border-4 border-zinc-900 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-green-500 h-36 resize-none text-xl font-bold transition-colors shadow-inner comic-font"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-white border-4 border-zinc-900 text-zinc-600 font-black text-xl active:scale-95 transition-all shadow-[6px_6px_0_#22c55e] comic-font">
                                STASH SAMPLE
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-experiment text-2xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                KABOOM! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (Inventory) --- */}
        {activeTab === 'cart' && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/95 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-white border-t-[10px] border-zinc-900 flex flex-col shadow-2xl h-[92vh] animate-image-pop">
                    <div className="w-full py-4 cursor-pointer hover:bg-zinc-100 border-b-4 border-zinc-100" onClick={() => setActiveTab('menu')}>
                        <div className="w-24 h-2 bg-zinc-300 rounded-full mx-auto" />
                    </div>

                    <div className="flex justify-between items-center mb-6 px-10 pt-6">
                        <h2 className="text-3xl font-black comic-font text-zinc-900 transform -rotate-1 tracking-widest">INVENTORY</h2>
                        <div className="w-14 h-14 bg-yellow-400 text-black border-4 border-zinc-900 flex items-center justify-center font-black text-2xl shadow-lg">
                            <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 px-8 pb-6 no-scrollbar">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-zinc-50 p-4 border-4 border-zinc-200 shadow-sm relative overflow-hidden">
                                <img src={item.image_url} className="w-16 h-16 object-cover border-2 border-zinc-900" />
                                <div className="flex-1">
                                    <div className="font-bold text-zinc-900 text-xl leading-tight comic-font tracking-wide">
                                        {item.name} <span className="text-green-500">x{item.quantity}</span>
                                    </div>
                                    <div className="text-sm font-bold mt-1 text-red-500">
                                        {item.variant !== 'normal' && <span className="bg-white px-2 py-0.5 border border-zinc-300 text-xs mr-2">{item.variant}</span>}
                                        {item.note && <span className="block text-blue-500 italic mt-1 text-xs font-normal">"{item.note}"</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                     <span className="font-black text-zinc-900 text-2xl comic-font">{item.price * item.quantity}.-</span>
                                     <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-red-100 text-red-600 border-2 border-red-200 flex items-center justify-center hover:bg-red-200 transition-colors active:scale-90">
                                         <Icon name="trash" size={18} />
                                     </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="text-center py-20 text-zinc-300 font-bold comic-font text-2xl">
                                LAB EMPTY...
                            </div>
                        )}
                    </div>

                    <div className="p-10 bg-zinc-900 border-t-4 border-white relative z-30">
                        <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-dashed border-zinc-700">
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Final Calculation</p>
                                <p className="text-5xl font-black text-white drop-shadow-md comic-font">{cartTotal}.-</p>
                            </div>
                            <div className="w-20 h-20 bg-white border-4 border-zinc-900 flex items-center justify-center text-red-600 transform rotate-6 shadow-2xl">
                                <Icon name="atom" size={40} />
                            </div>
                        </div>
                        <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-6 btn-experiment text-3xl active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.1em]">
                            <span>INITIATE TEST!</span> <Icon name="bolt" size={24} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-black/98 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-image-pop">
                <div className="w-full max-w-sm bg-white border-8 border-zinc-900 p-10 text-center shadow-2xl relative overflow-hidden">
                    <div className="w-28 h-28 bg-red-600 text-white flex items-center justify-center mx-auto mb-8 border-4 border-zinc-900 shadow-lg relative z-10 animate-kaboom">
                        <Icon name="flame" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-3xl comic-font text-zinc-900 mb-4 leading-tight relative z-10 uppercase tracking-widest">Merge Tests?</h3>
                            <p className="text-lg text-zinc-500 mb-10 font-bold relative z-10">Inject "{selectedProduct.name}" into protocol?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-zinc-900 text-yellow-400 font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl comic-font uppercase">YES! DO IT!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-white border-4 border-zinc-200 text-zinc-300 font-black text-lg active:scale-95 transition-transform hover:bg-zinc-50 comic-font uppercase">Just Stash</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl comic-font text-zinc-900 mb-4 leading-tight relative z-10 uppercase tracking-widest">Run Final Test?</h3>
                            <p className="text-lg text-zinc-500 mb-10 font-bold relative z-10">Combine all experiments for the final result?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-5 bg-zinc-900 text-yellow-400 font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl comic-font uppercase">YES! FOR SCIENCE!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white border-4 border-zinc-200 text-zinc-300 font-black text-lg active:scale-95 transition-transform hover:bg-zinc-50 comic-font uppercase">Abort</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}