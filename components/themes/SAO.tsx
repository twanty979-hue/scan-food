import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (SAO / Aincrad Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Aincrad / Floor 1
    home: <path d="M12 2L2 22h20L12 2zm0 4l6 12H6l6-12z" />, 
    // Menu -> SAO Menu List
    menu: <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="square" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Inventory / Item Sack
    basket: <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8-2h4v2h-4V4zM4 8h16v12H4V8z" />,
    // Clock -> Timer / HP Bar
    clock: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />,
    // Chef -> Swords / Elucidator
    chef: <path d="M14.5 13.5L3 22l8.5-8.5L22 3l-8.5 8.5z M20 2l2 2-8.5 8.5-2-2L20 2z" />, 
    // Star -> Crystal / Teleport Crystal
    star: <path d="M12 2L2 12l10 10 10-10L12 2z" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Burst / Critical
    flame: <path d="M12 2l2 5h5l-4 4 2 6-5-3-5 3 2-6-4-4h5z" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    // Sword Icon
    sword: <path d="M6 22l12-12L21 7l-3 3-12 12zM21 3l-3 3 3 3 3-3z" />,
    // Shield / Defense
    shield: <path d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z" />,
    // Map / Floor Info
    map: <path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z" />
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
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {content}
      {name === 'search' && <path d="m21 21-4.3-4.3" />}
      {name === 'star' && <path d="M12 6l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" stroke="none" fill="currentColor" opacity="0.3"/>} {/* Inner glow */}
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
  // Removed orderNote
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
             handleCheckout(); // Checkout directly
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center text-[#40c4ff] font-bold text-2xl tracking-widest font-mono">LINK START...</div>;

  const currentPriceObj = selectedProduct 
    ? calculatePrice(selectedProduct, variant) 
    : { final: 0 };

  // --- 📝 Robust Data Passing ---
  const handleAdd = (addToCartOnly = true) => {
    if (!selectedProduct) return;
    const finalNote = note ? note.trim() : ""; 
    
    // Create a rich product object that includes the choices
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
      handleCheckout();
      setShowConfirm(false);
  };

  return (
    // Theme: Sword Art Online (Aincrad Interface)
    <div className="w-full max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden border-x border-[#40c4ff]/30 bg-[#1c1c1e] font-sans text-[#e0e0e0]">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&family=Rajdhani:wght@400;600;700&display=swap');
            
            :root {
                /* SAO Palette */
                --sao-bg: #1c1c1e;
                --sao-panel: rgba(230, 230, 230, 0.9);
                --sao-orange: #ff9800; /* Notification/Highlight */
                --sao-blue: #40c4ff; /* Primary UI */
                --sao-grey: #424242; /* Inactive/Border */
                --sao-text: #333333;
            }

            body {
                font-family: 'Rajdhani', sans-serif;
                background-color: var(--sao-bg);
                /* Digital Grid Pattern */
                background-image: 
                    linear-gradient(to right, rgba(64, 196, 255, 0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(64, 196, 255, 0.05) 1px, transparent 1px);
                background-size: 40px 40px;
                background-attachment: fixed;
                color: var(--sao-text);
                margin: 0;
                padding: 0;
            }

            .sao-font {
                font-family: 'Orbitron', sans-serif;
                letter-spacing: 1px;
            }

            /* Animations */
            @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 10px rgba(64, 196, 255, 0.4); }
                50% { box-shadow: 0 0 20px rgba(64, 196, 255, 0.8); }
            }
            .animate-glow { animation: pulse-glow 2s infinite; }

            @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin-slow { animation: spin-slow 10s linear infinite; }

            /* Digital Pop Animation */
            @keyframes digitize {
                0% { opacity: 0; transform: scaleY(0); }
                100% { opacity: 1; transform: scaleY(1); }
            }
            .animate-digitize { animation: digitize 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

            /* Item Card - Crystal Panel Style */
            .item-card {
                transition: all 0.2s ease-out;
                position: relative;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 4px;
                border: 1px solid #999;
                border-left: 4px solid #999; /* Inactive grey */
                overflow: hidden;
            }
            
            .item-card:hover, .item-card:active {
                transform: translateX(4px);
                border-left-color: var(--sao-orange); /* Active orange */
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }

            .btn-sao {
                background: linear-gradient(135deg, #40c4ff 0%, #0091ea 100%);
                color: white;
                border: 1px solid #80d8ff;
                border-radius: 50px;
                font-family: 'Orbitron', sans-serif;
                box-shadow: 0 2px 8px rgba(0, 145, 234, 0.4);
                transition: all 0.2s;
                text-transform: uppercase;
            }
            
            .btn-sao:active {
                transform: scale(0.95);
                box-shadow: 0 0 5px rgba(64, 196, 255, 0.8);
            }

            .tab-btn {
                transition: all 0.3s;
                background: rgba(0, 0, 0, 0.6);
                color: #b0bec5;
                border: 1px solid #546e7a;
                border-radius: 4px;
                font-family: 'Rajdhani', sans-serif;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .tab-btn.active {
                background: rgba(64, 196, 255, 0.2) !important;
                color: #40c4ff !important;
                border-color: #40c4ff;
                box-shadow: 0 0 10px rgba(64, 196, 255, 0.2);
            }

            .modal-handle-area {
                cursor: pointer;
                padding: 12px 0 20px 0;
                width: 100%;
            }

            /* Scrollbar for SAO lists */
            ::-webkit-scrollbar {
                width: 6px;
            }
            ::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.1);
            }
            ::-webkit-scrollbar-thumb {
                background: #90a4ae;
                border-radius: 3px;
            }
        `}} />

        {/* --- Header (SAO HP Bar Style) --- */}
        <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white pt-8 pb-12 px-6 rounded-b-3xl relative overflow-hidden shadow-2xl z-10 border-b-2 border-[#40c4ff]/50">
             {/* Grid overlay */}
             <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(0deg, transparent 24%, #40c4ff 25%, #40c4ff 26%, transparent 27%, transparent 74%, #40c4ff 75%, #40c4ff 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #40c4ff 25%, #40c4ff 26%, transparent 27%, transparent 74%, #40c4ff 75%, #40c4ff 76%, transparent 77%, transparent)', backgroundSize: '50px 50px'}}></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#40c4ff]/20 w-fit px-3 py-1 rounded border border-[#40c4ff]/50 backdrop-blur-md">
                         <span className="w-2 h-2 rounded-full bg-[#76ff03] animate-pulse shadow-[0_0_5px_#76ff03]"></span>
                         <p className="text-[#40c4ff] text-xs font-bold tracking-widest sao-font">FLOOR: {tableLabel}</p>
                     </div>
                     <h1 className="text-2xl sao-font tracking-widest leading-none mt-2 text-white drop-shadow-[0_0_10px_rgba(64,196,255,0.6)]">
                         {brand?.name || "Aincrad Cafe"}
                     </h1>
                     {/* HP Bar Effect */}
                     <div className="w-32 h-1.5 bg-gray-700 mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-400 to-green-600 w-[85%] rounded-full shadow-[0_0_5px_#4caf50]"></div>
                     </div>
                 </div>
                 {/* Menu Icon */}
                 <div className="w-16 h-16 bg-gray-800/80 rounded-full border border-[#40c4ff] flex items-center justify-center relative shadow-[0_0_15px_rgba(64,196,255,0.3)] backdrop-blur-md">
                     <Icon name="chef" size={32} className="text-[#40c4ff]" />
                     <div className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-full border border-gray-900 shadow-sm animate-pulse"></div>
                 </div>
             </div>
        </header>

        <main className="px-4 -mt-6 relative z-20 w-full">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-digitize">
                    {/* Hero Banner (Data Panel) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-gray-900 rounded-xl overflow-hidden shadow-2xl mb-8 border border-[#40c4ff]/30 p-1 group">
                             <div className="h-full w-full rounded-lg overflow-hidden bg-black relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
                                 />
                                 {/* Scanning Line */}
                                 <div className="absolute top-0 left-0 w-full h-1 bg-[#40c4ff]/50 shadow-[0_0_10px_#40c4ff] animate-[scan_3s_linear_infinite] opacity-50 pointer-events-none"></div>
                             </div>
                             <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-[#40c4ff] px-4 py-1 border-l-4 border-orange-500 shadow-lg">
                                 <span className="sao-font text-xs font-bold tracking-widest">RARE ITEM DROP!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-1">
                         <div>
                             <h2 className="text-xl sao-font text-[#40c4ff] drop-shadow-[0_0_5px_rgba(64,196,255,0.5)]">Recommended</h2>
                             <p className="text-xs text-gray-400 font-medium tracking-wide">Boost your stats.</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#40c4ff]/10 text-[#40c4ff] px-4 py-2 rounded-sm text-xs font-bold flex items-center gap-2 hover:bg-[#40c4ff]/20 transition-all border border-[#40c4ff]/50 shadow-[0_0_10px_rgba(64,196,255,0.2)] sao-font">
                             INVENTORY <Icon name="menu" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-digitize" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full h-32 overflow-hidden relative bg-gray-200 border-b border-gray-300">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm sao-font tracking-wide">
                                                SALE
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-3 bg-white/95">
                                         <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-1 leading-tight tracking-tight">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-gray-400 line-through font-mono">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#40c4ff] font-bold text-lg sao-font leading-none">
                                                     {pricing.final}<span className="text-xs ml-0.5">Col</span>
                                                 </span>
                                             </div>
                                             <button className="w-7 h-7 bg-gray-100 text-gray-600 border border-gray-300 flex items-center justify-center rounded-sm hover:bg-[#40c4ff] hover:text-white hover:border-[#40c4ff] transition-all shadow-sm">
                                                 <Icon name="plus" size={12} strokeWidth={3} />
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
                <section className="animate-digitize pt-2">
                    <div className="relative mb-6 group">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#40c4ff]" />
                         </div>
                         <input type="text" placeholder="Search Item Database..." className="w-full pl-12 pr-4 py-3 rounded-sm bg-gray-800/80 border border-gray-600 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#40c4ff] focus:bg-gray-800 focus:shadow-[0_0_15px_rgba(64,196,255,0.2)] transition-all text-sm font-mono tracking-wide" />
                    </div>

                    <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar py-2">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-2 text-sm ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-digitize" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full h-32 overflow-hidden relative bg-gray-200 border-b border-gray-300">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
                                     </div>
                                     <div className="p-3 bg-white/95">
                                         <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-1 leading-tight tracking-tight">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-[10px] text-gray-400 line-through font-mono">{pricing.original}</span>}
                                                <span className="text-[#40c4ff] font-bold text-lg sao-font leading-none">{pricing.final}<span className="text-xs ml-0.5">Col</span></span>
                                             </div>
                                             <button className="w-7 h-7 bg-gray-100 text-gray-600 border border-gray-300 flex items-center justify-center rounded-sm hover:bg-[#40c4ff] hover:text-white hover:border-[#40c4ff] transition-all shadow-sm">
                                                 <Icon name="plus" size={12} strokeWidth={3} />
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
                <section className="animate-digitize pt-4 pb-24">
                    <div className="mb-6 flex items-center justify-between bg-white/95 p-6 border-l-4 border-[#40c4ff] rounded-r-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-sm">
                         <div className="relative z-10">
                             <h2 className="text-2xl font-bold sao-font text-gray-800">Quest Log</h2>
                             <p className="text-xs text-orange-500 font-bold mt-1 uppercase tracking-widest">Tracking Orders...</p>
                         </div>
                         <div className="w-12 h-12 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center animate-spin-slow">
                             <Icon name="clock" className="text-[#40c4ff]" size={24} />
                         </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-gray-800/90 p-5 border border-gray-600 rounded-lg shadow-lg relative overflow-hidden">
                                <div className="flex justify-between items-start mb-3">
                                     <span className="text-xs text-[#40c4ff] font-bold uppercase tracking-widest flex items-center gap-1 font-mono">
                                         <Icon name="menu" size={12} /> ID: {o.id.slice(-6)}
                                     </span>
                                     <span className={`px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide border rounded-sm flex items-center gap-1.5 shadow-sm sao-font
                                        ${o.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500' : 'bg-green-500/20 text-green-300 border-green-500'}`}>
                                         {o.status === 'pending' ? 'PROCESSING' : 'COMPLETE'}
                                     </span>
                                </div>
                                <div className="mb-3 space-y-1 p-3 bg-black/40 rounded border border-gray-700">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-gray-300 font-mono border-b border-gray-700/50 pb-1 last:border-0">
                                            <div className="flex flex-col">
                                                <span>{i.quantity}x {i.product_name}</span>
                                                {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-orange-400 uppercase tracking-wide">[{i.variant}]</span>}
                                                {i.note && <span className="text-[10px] text-gray-500 italic">"{i.note}"</span>}
                                            </div>
                                            <span className="text-[#40c4ff]">{i.price * i.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                                     <span className="font-bold text-gray-500 text-xs uppercase tracking-widest">TOTAL COL</span>
                                     <span className="font-bold text-white text-2xl sao-font shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Main Menu Bar) --- */}
        <nav className="fixed bottom-0 left-0 w-full h-[70px] bg-[#1c1c1e]/95 backdrop-blur-md shadow-[0_-5px_20px_rgba(0,0,0,0.5)] flex justify-around items-center px-2 z-[100] border-t border-[#40c4ff]/30">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 w-16 group ${activeTab === 'home' ? 'text-[#40c4ff]' : 'text-gray-500'}`}>
                 <div className={`p-1 rounded-full transition-all duration-300 ${activeTab === 'home' ? 'bg-[#40c4ff]/10 shadow-[0_0_10px_rgba(64,196,255,0.3)]' : ''}`}>
                    <Icon name="home" size={24} />
                 </div>
                 <span className="text-[9px] uppercase tracking-widest font-bold">Home</span>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 w-16 group ${activeTab === 'menu' ? 'text-[#40c4ff]' : 'text-gray-500'}`}>
                 <div className={`p-1 rounded-full transition-all duration-300 ${activeTab === 'menu' ? 'bg-[#40c4ff]/10 shadow-[0_0_10px_rgba(64,196,255,0.3)]' : ''}`}>
                    <Icon name="menu" size={24} />
                 </div>
                 <span className="text-[9px] uppercase tracking-widest font-bold">Items</span>
             </button>

             {/* Center Cart Button (Crystal) */}
             <div className="relative -top-6">
                 <button onClick={() => setActiveTab('cart')} className="w-16 h-16 bg-gradient-to-br from-[#40c4ff] to-[#0091ea] rounded-full shadow-[0_0_20px_rgba(0,145,234,0.5)] flex items-center justify-center text-white border-4 border-[#1c1c1e] active:scale-95 transition-all duration-200 group">
                     <Icon name="basket" size={28} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1c1c1e] animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 w-16 group ${activeTab === 'status' ? 'text-[#40c4ff]' : 'text-gray-500'}`}>
                 <div className={`p-1 rounded-full transition-all duration-300 ${activeTab === 'status' ? 'bg-[#40c4ff]/10 shadow-[0_0_10px_rgba(64,196,255,0.3)]' : ''}`}>
                    <Icon name="clock" size={24} />
                 </div>
                 <span className="text-[9px] uppercase tracking-widest font-bold">Log</span>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Popup Window) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-digitize">
                <div className="w-[90%] max-w-sm bg-white/95 border border-[#999] shadow-[0_0_30px_rgba(255,255,255,0.2)] rounded-sm relative overflow-hidden flex flex-col max-h-[85vh]">
                    {/* SAO Window Header */}
                    <div className="bg-gray-100 p-2 border-b border-gray-300 flex justify-between items-center">
                        <span className="text-gray-500 text-xs font-bold tracking-widest uppercase ml-2">Item Info</span>
                        <button onClick={() => setSelectedProduct(null)} className="w-6 h-6 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                            <Icon name="x" size={14} />
                        </button>
                    </div>

                    <div className="relative w-full h-48 bg-gray-200 shrink-0">
                        <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                             {/* Added discount logic here */}
                            {currentPriceObj.discount > 0 && (
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm sao-font tracking-wide">
                                        SALE
                                    </span>
                                    <span className="text-gray-300 text-sm line-through font-mono">
                                        {currentPriceObj.original}
                                    </span>
                                </div>
                            )}
                            <div className="text-white font-bold text-2xl sao-font drop-shadow-md leading-none">
                                {currentPriceObj.final} <span className="text-sm">Col</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 leading-tight">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            {/* --- Variant Selector (List) --- */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Select Grade:</label>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { key: 'normal', label: 'Standard', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'High Quality', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'Legendary', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`flex items-center justify-between p-3 rounded border transition-all
                                                ${variant === v.key 
                                                    ? 'bg-[#40c4ff]/10 border-[#40c4ff] text-[#0091ea]' 
                                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            <span className="text-sm font-bold tracking-wide uppercase">{v.label}</span>
                                            <div className="flex flex-col items-end">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] text-gray-400 line-through font-mono">{v.original}</span>
                                                )}
                                                <span className="text-base font-mono font-bold">{v.final} Col</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-2 border-t border-b border-gray-200">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-8 h-8 bg-gray-200 text-gray-600 rounded flex items-center justify-center hover:bg-gray-300"><Icon name="minus" size={14} /></button>
                                    <span className="text-2xl font-black w-10 text-center text-gray-800 sao-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-8 h-8 bg-[#40c4ff] text-white rounded flex items-center justify-center hover:bg-[#0091ea]"><Icon name="plus" size={14} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Total</p>
                                    <p className="text-2xl font-bold text-[#40c4ff] sao-font">{currentPriceObj.final * qty}</p>
                                </div>
                            </div>

                            {/* Note */}
                            <div>
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Add notes..." 
                                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#40c4ff] resize-none h-20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <button onClick={() => handleAdd(true)} className="py-3 bg-white border border-gray-300 text-gray-600 font-bold text-sm rounded hover:bg-gray-50 uppercase tracking-wider">
                                Inventory
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-3 btn-sao text-sm font-bold flex items-center justify-center gap-2">
                                Equip <Icon name="check" size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (Inventory) --- */}
        <div id="orderSummaryOverlay" className={`fixed inset-0 bg-black/60 z-[130] backdrop-blur-sm animate-digitize ${activeTab === 'cart' ? 'block' : 'hidden'}`} onClick={() => setActiveTab('menu')}></div>
        <div id="orderSummary" className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#f5f5f5] border-t-2 border-[#40c4ff] z-[140] flex flex-col shadow-2xl h-[85vh] rounded-t-lg transition-transform duration-300 ${activeTab === 'cart' ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="bg-white border-b border-gray-300 p-4 flex justify-between items-center sticky top-0 z-10 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <Icon name="basket" className="text-[#40c4ff]" />
                    <h2 className="text-lg font-bold text-gray-800 uppercase tracking-widest sao-font">Inventory</h2>
                </div>
                <div className="bg-[#40c4ff] text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {cart.reduce((a: any, b: any) => a + b.quantity, 0)} Items
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {cart.map((item: any, idx: any) => (
                    <div key={idx} className="bg-white border border-gray-300 p-3 rounded flex items-center gap-3 shadow-sm relative overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ccc] group-hover:bg-orange-400 transition-colors"></div>
                        <div className="w-14 h-14 bg-gray-200 rounded overflow-hidden shrink-0 border border-gray-300">
                            <img src={item.image_url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 text-sm truncate">{item.name}</h3>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {item.variant !== 'normal' && <span className="text-[9px] bg-gray-100 border border-gray-300 px-1 rounded text-gray-500 uppercase">{item.variant}</span>}
                                {item.note && <span className="text-[9px] text-gray-400 italic">"{item.note}"</span>}
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-[#40c4ff] font-bold font-mono">{item.price * item.quantity}</div>
                             <div className="flex items-center justify-end gap-2 mt-1">
                                 <span className="text-xs text-gray-500">x{item.quantity}</span>
                                 <button onClick={() => updateQuantity(idx, -1)} className="text-gray-400 hover:text-red-500"><Icon name="trash" size={14} /></button>
                             </div>
                        </div>
                    </div>
                ))}
                {cart.length === 0 && (
                    <div className="text-center py-20 text-gray-400 font-mono text-sm">
                        [EMPTY SLOT]
                    </div>
                )}
            </div>

            <div className="p-4 bg-white border-t border-gray-300 relative z-30">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total Amount</p>
                    <p className="text-3xl font-black text-[#40c4ff] sao-font drop-shadow-sm">{cartTotal} Col</p>
                </div>
                <button onClick={() => { onCheckoutClick(); }} className="w-full py-4 btn-sao text-lg font-bold tracking-widest flex items-center justify-center gap-2">
                    <span>Confirm Trade</span> <Icon name="check" size={20} />
                </button>
            </div>
        </div>

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-black/80 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-digitize">
                <div className="w-full max-w-xs bg-white/90 border border-gray-400 p-6 text-center shadow-[0_0_20px_rgba(64,196,255,0.3)] rounded-sm">
                    <div className="w-16 h-16 bg-[#40c4ff]/10 text-[#40c4ff] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#40c4ff]/30">
                        <Icon name="check" size={32} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">Item Acquired</h3>
                            <p className="text-sm text-gray-600 mb-6">Add <span className="font-bold text-[#0091ea]">{selectedProduct.name}</span> to inventory?</p>
                            <div className="flex gap-3">
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="flex-1 py-2 bg-white border border-gray-300 text-gray-600 text-xs font-bold uppercase hover:bg-gray-50">Stash</button>
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="flex-1 py-2 bg-[#40c4ff] text-white text-xs font-bold uppercase shadow-sm hover:bg-[#00b0ff]">Equip</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">Confirm Trade</h3>
                            <p className="text-sm text-gray-600 mb-6">Complete transaction for all items?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 bg-white border border-gray-300 text-gray-600 text-xs font-bold uppercase hover:bg-gray-50">Cancel</button>
                                <button onClick={() => { onCheckoutClick(); }} className="flex-1 py-2 bg-orange-500 text-white text-xs font-bold uppercase shadow-sm hover:bg-orange-600">Accept</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}