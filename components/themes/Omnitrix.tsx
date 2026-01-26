import React, { useState, useEffect, useRef } from "react";

// --- ⌚ Omnitrix Icons Wrapper ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    home: <path d="M2 22 L12 2 L22 22 L18 22 L18 14 L6 14 L6 22 Z M10 14 L10 10 L14 10 L14 14" />, 
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    search: <circle cx="11" cy="11" r="8" />, 
    basket: <path d="M21 9h-2l-2-5H7L5 9H3V20h18V9zm-10 2h2v7h-2v-7zm-4 0h2v7H7v-7zm8 0h2v7h-2v-7z" />,
    clock: <circle cx="12" cy="12" r="10" />,
    chef: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />, 
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6L6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    flame: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
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
      {name === 'basket' && <path d="M1 9h22" strokeWidth="1" opacity="0.3"/>}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-black" />;

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
    // Theme: Omnitrix (Ben 10)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-lime-100 border-x border-gray-900 bg-[#050505]">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,300;0,400;0,600;0,700;1,600&family=Orbitron:wght@400;700;900&display=swap');
            
            :root {
                --primary: #84cc16; /* Lime */
                --primary-glow: #a3e635;
                --dark-bg: #050505;
                --panel-bg: #111;
            }

            body {
                font-family: 'Chakra Petch', sans-serif;
                background-color: var(--dark-bg);
                /* Radial Energy Pattern */
                background-image: 
                    radial-gradient(circle at 50% 50%, rgba(132, 204, 22, 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 100% 0%, rgba(132, 204, 22, 0.08) 0%, transparent 30%),
                    radial-gradient(circle at 0% 100%, rgba(132, 204, 22, 0.08) 0%, transparent 30%);
                background-size: 100% 100%;
                background-attachment: fixed;
            }

            .hero-font {
                font-family: 'Orbitron', sans-serif;
                letter-spacing: 1px;
            }

            @keyframes rotateDial {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .omnitrix-dial::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 50%;
                background: conic-gradient(transparent 0deg, #84cc16 90deg, transparent 180deg, #84cc16 270deg, transparent 360deg);
                opacity: 0.2;
                animation: rotateDial 6s linear infinite;
            }

            .item-card {
                background: #111;
                border: 2px solid #333;
                border-radius: 1.5rem;
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            }
            .item-card:hover, .item-card:active {
                border-color: #84cc16;
                box-shadow: 0 0 15px rgba(132, 204, 22, 0.3);
                transform: scale(0.98);
            }

            .btn-hero {
                background: #84cc16;
                color: #000;
                border-radius: 9999px;
                font-weight: 900;
                box-shadow: 0 0 15px rgba(132, 204, 22, 0.4);
                transition: all 0.2s;
                text-transform: uppercase;
            }
            .btn-hero:active {
                transform: scale(0.95);
                box-shadow: 0 0 5px rgba(132, 204, 22, 0.6);
            }

            .tab-btn {
                background: #1a1a1a;
                color: #666;
                border: 1px solid #333;
                border-radius: 1rem;
                transition: all 0.3s;
            }
            .tab-btn.active {
                background: #84cc16;
                color: #000;
                font-weight: 900;
                box-shadow: 0 0 15px rgba(132, 204, 22, 0.5);
                border: none;
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            
            /* Omnitrix Hourglass Shape Helper */
            .hourglass-clip {
                clip-path: polygon(0 0, 100% 0, 50% 50%, 100% 100%, 0 100%, 50% 50%);
            }
        `}</style>

        {/* --- Header (Omnitrix Watch Face) --- */}
        <header className="bg-black text-white pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-2xl z-10 border-b-4 border-lime-600">
             {/* Glow overlay */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-lime-900/10 rounded-full blur-3xl pointer-events-none"></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-lime-900/30 w-fit px-4 py-1.5 rounded-full border border-lime-500/50">
                         <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse shadow-[0_0_5px_#84cc16]"></span>
                         <p className="text-lime-300 text-[10px] font-bold tracking-widest hero-font">DNA LOADED</p>
                     </div>
                     <h1 className="text-3xl font-black tracking-tight leading-none mt-1 drop-shadow-[0_0_10px_rgba(132,204,22,0.8)] hero-font italic">
                         HERO TIME!
                     </h1>
                 </div>
                 
                 {/* Omnitrix Symbol Icon */}
                 <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border-4 border-[#444] flex items-center justify-center relative shadow-[0_0_20px_rgba(132,204,22,0.4)] omnitrix-dial">
                     <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                        {/* The Green Hourglass */}
                        <div className="w-10 h-10 bg-[#84cc16] shadow-[0_0_10px_#84cc16] hourglass-clip"></div>
                     </div>
                 </div>
             </div>
        </header>
        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate__animated animate__fadeIn">
                    {/* Hero Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-52 bg-[#111] rounded-[2rem] overflow-hidden shadow-lg mb-8 border-2 border-lime-500/50 group">
                            <div className="h-full opacity-90 group-hover:opacity-100 transition-opacity">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover filter grayscale-[20%] contrast-125" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                            <div className="absolute bottom-4 left-4">
                                <div className="px-4 py-1.5 bg-lime-600 text-black text-[10px] font-black uppercase tracking-widest rounded-full hero-font shadow-[0_0_10px_#84cc16]">
                                    ALIEN OF THE WEEK
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                         <div>
                             <h2 className="text-2xl font-black text-white hero-font">ALIEN GRUB</h2>
                             <p className="text-xs text-lime-400 font-medium tracking-wide">Plumber Approved</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#222] hover:bg-[#333] text-lime-400 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all border border-lime-500/30 hero-font uppercase">
                             SCAN ALL <Icon name="search" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer group">
                                     <div className="w-full h-32 overflow-hidden relative bg-black border-b border-[#333]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-lime-600 text-black text-[10px] font-bold px-2 py-0.5 rounded-full hero-font shadow-lg">
                                                DNA UPGRADE
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-[#111]">
                                         <h3 className="font-bold text-gray-200 text-sm line-clamp-2 mb-2 leading-tight tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-gray-500 line-through decoration-lime-500 decoration-1 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-lime-400 font-black text-xl hero-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#222] text-lime-400 border border-lime-500/30 flex items-center justify-center rounded-full hover:bg-lime-500 hover:text-black transition-all shadow-[0_0_5px_rgba(132,204,22,0.2)] active:scale-90">
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
                <section className="animate__animated animate__fadeIn pt-4">
                    <div className="relative mb-6 group mt-4">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-lime-500" />
                         </div>
                         <input type="text" placeholder="Search DNA sequence..." className="w-full pl-14 pr-6 py-4 rounded-full bg-[#1a1a1a] border-2 border-lime-900 text-lime-100 placeholder:text-gray-600 focus:outline-none focus:border-lime-500 focus:shadow-[0_0_15px_rgba(132,204,22,0.3)] transition-all text-sm font-medium hero-font" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-3 text-xs uppercase tracking-wider rounded-full hero-font flex items-center gap-2 ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-24">
                        {filteredProducts?.map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer group">
                                     <div className="w-full h-32 overflow-hidden relative bg-black border-b border-[#333]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                     </div>
                                     <div className="p-4 bg-[#111]">
                                         <h3 className="font-bold text-gray-200 text-sm line-clamp-2 mb-2 leading-tight tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-gray-500 line-through decoration-lime-500 decoration-1 font-bold">{pricing.original}</span>}
                                                 <span className="text-lime-400 font-black text-xl hero-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#222] text-lime-400 border border-lime-500/30 flex items-center justify-center rounded-full hover:bg-lime-500 hover:text-black transition-all shadow-[0_0_5px_rgba(132,204,22,0.2)] active:scale-90">
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

            {/* --- STATUS PAGE --- */}
            {activeTab === 'status' && (
                <section className="animate__animated animate__fadeIn pt-4 pb-24">
                    {/* Header: Mission Log */}
                    <div className="mb-8 flex items-center justify-between bg-[#111] p-6 border-2 border-lime-500 rounded-[2rem] shadow-[0_0_20px_rgba(132,204,22,0.15)] relative overflow-hidden">
                         <div className="absolute -right-10 -top-10 w-40 h-40 bg-lime-500/10 rounded-full blur-2xl animate-pulse"></div>
                         <div className="relative z-10">
                             <h2 className="text-2xl font-black hero-font text-white">MISSION LOG</h2>
                             <p className="text-xs text-lime-400 mt-1 uppercase tracking-widest">Tracking Status...</p>
                         </div>
                         <div className="w-14 h-14 border-4 border-lime-500 rounded-full flex items-center justify-center shadow-[0_0_15px_#84cc16] bg-black">
                             <Icon name="clock" size={24} className="text-lime-400" />
                         </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="bg-[#111] p-5 border border-lime-900 rounded-2xl relative overflow-hidden shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-[10px] text-lime-500 font-bold uppercase tracking-widest flex items-center gap-1 font-mono">
                                         <Icon name="menu" size={12} /> ID: {o.id.slice(-6)}
                                     </span>
                                     <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border rounded-full hero-font shadow-[0_0_10px_rgba(0,0,0,0.5)]
                                         ${o.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-600' : 'bg-lime-900/30 text-lime-400 border-lime-500'}`}>
                                         {o.status === 'pending' ? 'PROCESSING...' : 'COMPLETE'}
                                     </span>
                                </div>
                                <div className="mb-3 space-y-1 bg-[#0a0a0a] p-4 border border-lime-900/50 rounded-xl">
                                    {o.order_items.map((i, idx) => {
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        return (
                                            <div key={idx} className="flex justify-between items-start text-sm text-gray-300 font-medium mb-2 border-b border-dashed border-gray-800 pb-2 last:border-0 font-mono">
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-white">{quantity}x {i.product_name}</span>
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] bg-lime-900 text-lime-400 px-2 py-0.5 rounded border border-lime-700 font-bold mt-1 uppercase tracking-wider`}>
                                                            {i.variant}
                                                        </span>
                                                    )}
                                                    {i.note && <span className="text-[10px] text-gray-500 italic mt-0.5">&gt;&gt; {i.note}</span>}
                                                </div>
                                                <span className="text-lime-500 font-bold">{finalPriceTotal}.-</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-lime-900">
                                     <span className="font-bold text-gray-500 text-[10px] uppercase tracking-widest">ENERGY</span>
                                     <span className="font-black text-white text-xl hero-font drop-shadow-[0_0_5px_#84cc16]">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                         {(!ordersList || ordersList.length === 0) && (
                             <div className="text-center py-12 opacity-50">
                                <div className="w-16 h-16 bg-[#111] rounded-full mx-auto mb-4 flex items-center justify-center border border-lime-900">
                                    <Icon name="search" size={24} className="text-lime-700" />
                                </div>
                                <p className="hero-font text-sm text-lime-800 tracking-widest">NO DATA FOUND</p>
                             </div>
                         )}
                    </div>
                </section>
            )}
        </main>

        {/* --- FLOATING NAV (Capsule Tech) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[70px] bg-[#111]/90 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex justify-around items-center px-4 z-[100] border-2 border-lime-900 rounded-full">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-12 group ${activeTab === 'home' ? 'text-lime-400' : 'text-gray-600'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTab === 'home' ? 'bg-lime-900/30 shadow-[0_0_10px_#84cc16]' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-12 group ${activeTab === 'menu' ? 'text-lime-400' : 'text-gray-600'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTab === 'menu' ? 'bg-lime-900/30 shadow-[0_0_10px_#84cc16]' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* Cart Button (Dial) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-8">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-18 h-18 bg-black rounded-full shadow-[0_0_20px_#84cc16] flex items-center justify-center text-white border-4 border-lime-500 active:scale-95 transition-all duration-300 z-20 group">
                     <Icon name="basket" size={24} className="text-lime-400 group-hover:text-white transition-colors" />
                     {cart?.length > 0 && (
                         <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-lime-500">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-12 group ${activeTab === 'status' ? 'text-lime-400' : 'text-gray-600'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTab === 'status' ? 'bg-lime-900/30 shadow-[0_0_10px_#84cc16]' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/95 backdrop-blur-md animate__animated animate__fadeInUp">
                <div className="w-full max-w-md bg-[#0a0a0a] border-t-2 border-lime-500 h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-[0_-10px_50px_rgba(132,204,22,0.2)] rounded-t-[3rem]">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-10 h-10 bg-black/50 text-white rounded-full border border-lime-500 flex items-center justify-center hover:bg-lime-900/50 transition-colors backdrop-blur-md">
                            <Icon name="x" size={20} />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-4 border-lime-500/20 rounded-b-[3rem]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover opacity-90" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-6 py-2 bg-lime-500 text-black font-black text-2xl hero-font rounded-full shadow-[0_0_15px_#84cc16]">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-black/60 block -mb-1">{currentPriceObj.original}</span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-36">
                        <h2 className="text-3xl font-black text-white mb-6 leading-tight hero-font uppercase tracking-wide">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            {/* --- 🏷️ VARIANT SELECTOR (Alien Forms) --- */}
                            <div>
                                <label className="block text-sm font-bold text-lime-500 mb-3 hero-font tracking-widest">SELECT FORM:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'HUMAN', color: 'bg-lime-700', text: 'text-white', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'HEATBLAST', color: 'bg-red-600', text: 'text-white', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'FOURARMS', color: 'bg-red-800', text: 'text-white', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-between h-20 hero-font
                                                ${variant === v.key 
                                                    ? `bg-lime-600 border-lime-400 text-black shadow-[0_0_15px_#84cc16]` 
                                                    : 'bg-[#111] border-gray-800 text-gray-500 hover:border-lime-700 hover:text-lime-200'}`}
                                        >
                                            <span className="text-[10px] font-black tracking-widest">{v.label}</span>
                                            <span className="text-lg font-bold">{v.final}.-</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Modify DNA structure (Notes)..." 
                                    className="w-full p-4 bg-[#111] border border-lime-900 rounded-2xl focus:border-lime-500 focus:outline-none h-24 resize-none text-sm font-medium text-lime-100 placeholder:text-gray-600 transition-colors shadow-inner font-mono"
                                />
                            </div>
                            
                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-2 mt-2">
                                <div className="flex items-center gap-2 bg-[#1a1a1a] p-2 rounded-full border border-lime-900">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 bg-black border border-lime-900 text-white rounded-full flex items-center justify-center hover:bg-lime-900/30 active:scale-90 transition-all"><Icon name="minus" size={16} /></button>
                                    <span className="text-2xl font-bold w-12 text-center bg-transparent border-none text-lime-400 hero-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-10 h-10 bg-lime-900/20 border border-lime-500/50 text-white rounded-full flex items-center justify-center hover:bg-lime-500 hover:text-black active:scale-90 transition-all"><Icon name="plus" size={16} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-lime-600 font-bold uppercase tracking-widest mb-1">ENERGY COST</p>
                                    <p className="text-3xl font-black text-white hero-font drop-shadow-[0_0_5px_#84cc16]">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-[#111] border-2 border-lime-900 text-lime-400 font-bold text-sm uppercase tracking-wider active:scale-95 transition-all hover:border-lime-500 rounded-full hero-font">
                                ADD DATA
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-hero font-black text-sm uppercase tracking-widest active:scale-95 transition-all hero-font flex items-center justify-center gap-2">
                                TRANSFORM <Icon name="flame" size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/95 backdrop-blur-md animate__animated animate__fadeInUp">
                 <div className="w-full max-w-md bg-[#0a0a0a] border-t-2 border-lime-500 flex flex-col shadow-[0_-20px_60px_rgba(132,204,22,0.2)] h-[85vh] rounded-t-[3rem]">
                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-1.5 bg-lime-900 rounded-full mx-auto opacity-50" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-3xl font-black text-white hero-font uppercase tracking-wider">Inventory</h2>
                         <div className="px-4 py-1.5 bg-lime-900/30 text-lime-400 border border-lime-500 font-bold font-mono rounded-full">
                             <span id="summaryCount">{cart.reduce((a, b) => a + b.quantity, 0)}</span> UNITS
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-4 bg-[#111] p-4 border border-lime-900/50 rounded-2xl relative overflow-hidden shadow-sm">
                                 <img src={item.image_url} className="w-16 h-16 object-cover border border-lime-900 rounded-xl opacity-80" />
                                 <div className="flex-1">
                                     <div className="font-bold text-gray-200 text-lg leading-tight tracking-wide font-mono">
                                         {item.name} <span className="text-lime-500">x{item.quantity}</span>
                                     </div>
                                     <div className="text-xs text-lime-700 mt-1 font-bold">
                                         {item.variant !== 'normal' && <span className="text-lime-400 uppercase mr-2 border border-lime-900 px-1 rounded">{item.variant}</span>}
                                         {item.note && <span className="block text-gray-500 italic mt-1">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-lime-500 text-xl hero-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-black border border-red-900/50 flex items-center justify-center text-red-500 rounded-full transition-colors active:scale-90 hover:border-red-500">
                                     <Icon name="trash" size={16} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-lime-900 font-bold hero-font text-lg">BUFFER EMPTY</div>
                         )}
                     </div>

                     <div className="p-8 bg-[#111] border-t border-lime-900 relative z-30 rounded-t-[2.5rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b border-dashed border-gray-700">
                             <div>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">TOTAL ENERGY</p>
                                 <p className="text-5xl font-black text-lime-400 hero-font drop-shadow-[0_0_8px_rgba(132,204,22,0.5)]">{cartTotal}.-</p>
                             </div>
                             <div className="w-14 h-14 bg-black border border-lime-500 rounded-full flex items-center justify-center text-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.2)]">
                                 <Icon name="check" size={24} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-hero text-xl active:scale-95 transition-all hero-font flex items-center justify-center gap-3 uppercase tracking-widest">
                             <span>ACTIVATE</span> <Icon name="flame" size={20} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate__animated animate__fadeIn">
                <div className="w-full max-w-sm bg-[#111] border-2 border-lime-500 p-8 text-center shadow-[0_0_30px_rgba(132,204,22,0.3)] animate__animated animate__zoomIn relative overflow-hidden rounded-[2.5rem]">
                    <div className="w-20 h-20 bg-lime-900/20 text-lime-400 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-lime-500 shadow-[0_0_15px_#84cc16]">
                        <Icon name="basket" size={40} className="animate-pulse" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-2xl font-black text-white mb-2 leading-tight hero-font uppercase">COMBINE DNA?</h3>
                            <p className="text-sm text-gray-400 mb-8 font-medium">Add new sample to existing buffer?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-lime-600 text-black font-black border border-lime-400 hover:bg-lime-500 active:scale-95 transition-all text-sm hero-font uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(132,204,22,0.5)]">CONFIRM MERGE</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-transparent border border-gray-600 text-gray-400 font-bold text-xs active:scale-95 transition-transform hover:bg-gray-800 hero-font uppercase rounded-full">STORE ONLY</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-2xl font-black text-white mb-2 leading-tight hero-font uppercase">INITIATE SEQUENCE?</h3>
                            <p className="text-sm text-gray-400 mb-8 font-medium">Transmit all data to headquarters?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-lime-600 text-black font-black border border-lime-400 hover:bg-lime-500 active:scale-95 transition-all text-sm hero-font uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(132,204,22,0.5)]">EXECUTE</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-transparent border border-gray-600 text-gray-400 font-bold text-xs active:scale-95 transition-transform hover:bg-gray-800 hero-font uppercase rounded-full">ABORT</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}