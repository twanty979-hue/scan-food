import React, { useState, useEffect, useRef } from "react";

// --- 🧁 Sugarcube Corner Icons Wrapper ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Gingerbread House / Sugarcube Corner
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />, 
    // Menu -> Cupcake / Candy
    menu: <path d="M12 2C8 2 5 5 5 9c0 2.5 2 4.5 4 5v3h6v-3c2-.5 4-2.5 4-5 0-4-3-7-7-7z M12 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />, // Simple Cupcake shape
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Party Balloon / Gift Bag
    basket: <path d="M12 2C7 2 4 6 4 10c0 3 2 6 6 9v3h4v-3c4-3 6-6 6-9 0-4-3-8-8-8z" />,
    // Clock -> Scroll / Time Magic
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Pony / Star
    chef: <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />, 
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6L6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Sparkle / Magic
    flame: <path d="M12 2L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 z" />,
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
      {name === 'basket' && <path d="M12 22v-3" opacity="0.5"/>} {/* Balloon string */}
      {name === 'clock' && <path d="M12 6v6l4 2" />}
      {name === 'menu' && <path d="M8 17h8" strokeLinecap="round"/>} {/* Cupcake wrapper line */}
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

  // --- 🔥 AUTO-CHECKOUT LOGIC (Original) ---
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#fdf4ff]" />;

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
    // Theme: Sugarcube Corner (MLP)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#701a75] border-x-4 border-[#fbcfe8]">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Mali:ital,wght@0,300;0,400;0,600;0,700;1,600&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --pinkie: #ec4899;
                --twilight: #a855f7;
                --rainbow: #06b6d4;
                --flutter: #fef08a;
                --apple: #f97316;
                --bg-magic: #fdf4ff;
                --text-color: #701a75;
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg-magic);
                /* --- 🟣 POLKA DOT PATTERN --- */
                background-image: radial-gradient(#F0ABFC 15%, transparent 16%);
                background-size: 25px 25px;
                background-position: 0 0;
                background-attachment: fixed;
            }

            .magic-font {
                font-family: 'Mali', cursive;
            }

            /* --- Animations --- */
            @keyframes bounce-slow {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }

            @keyframes sparkle {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.1); filter: brightness(1.2); }
            }
            .animate-sparkle { animation: sparkle 2s infinite ease-in-out; }

            @keyframes pop-in {
                0% { opacity: 0; transform: scale(0.9) translateY(10px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }

            /* --- Components --- */
            .btn-magic {
                background: linear-gradient(135deg, var(--pinkie) 0%, var(--twilight) 100%);
                color: white;
                border-radius: 1.5rem;
                font-family: 'Mali', cursive;
                font-weight: 700;
                box-shadow: 0 4px 0px #be185d;
                transition: all 0.2s;
                border: 2px solid white;
            }
            .btn-magic:active {
                transform: translateY(4px);
                box-shadow: 0 0 0 #be185d;
            }

            .item-card {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 1.5rem;
                border: 2px solid #fbcfe8;
                box-shadow: 0 4px 10px rgba(236, 72, 153, 0.15);
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .item-card:hover, .item-card:active {
                transform: scale(0.98) translateY(2px);
                border-color: var(--twilight);
                box-shadow: 0 2px 5px rgba(168, 85, 247, 0.2);
            }

            .tab-btn {
                background: white;
                color: var(--text-color);
                border: 2px solid #f5d0fe;
                border-radius: 1rem;
                transition: all 0.3s;
            }
            .tab-btn.active {
                background: var(--twilight);
                color: white;
                border-color: var(--twilight);
                box-shadow: 0 4px 10px rgba(168, 85, 247, 0.3);
                transform: scale(1.05);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* --- Header (Twilight Castle Style) --- */}
        <header className="bg-gradient-to-b from-[#a855f7] to-[#ec4899] text-white pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-2xl z-10 border-b-4 border-white">
             {/* Sparkles Overlay */}
             <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                 <div className="absolute top-10 left-10 text-xl animate-pulse">✨</div>
                 <div className="absolute top-20 right-20 text-lg animate-pulse" style={{animationDelay: '0.5s'}}>✨</div>
                 <div className="absolute bottom-10 left-1/2 text-2xl animate-pulse" style={{animationDelay: '1s'}}>✨</div>
             </div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-white/20 w-fit px-4 py-1.5 rounded-full border border-white/50 backdrop-blur-sm shadow-sm">
                         <span className="w-3 h-3 rounded-full bg-[#fde047] animate-sparkle"></span>
                         <p className="text-white text-xs font-bold tracking-wide magic-font">Table {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl magic-font tracking-wide leading-none mt-2 text-white drop-shadow-md">
                         {brand?.name || "Friendship Menu"}
                     </h1>
                 </div>
                 
                 {/* Cutie Mark Icon */}
                 <div className="w-20 h-20 bg-white rounded-full border-4 border-[#fde047] flex items-center justify-center relative shadow-lg animate-bounce-slow">
                     <Icon name="menu" className="text-[#ec4899] w-10 h-10 transform rotate-6" />
                     <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#06b6d4] rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
                         <Icon name="star" size={14} className="animate-spin-slow" />
                     </div>
                 </div>
             </div>
        </header>
        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-pop-in">
                    {/* Hero Banner (Rainbow) */}
                    {banners?.length > 0 && (
                        <div className="p-[3px] rounded-[1.6rem] mb-8 shadow-lg bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400">
                            <div className="relative w-full h-56 bg-white rounded-[1.5rem] overflow-hidden">
                                 <div className="h-full w-full bg-[#e0f2fe]">
                                     <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="absolute top-4 left-4 bg-[#ec4899] text-white px-4 py-1 rounded-full border-2 border-white shadow-md transform -rotate-2">
                                     <span className="magic-font text-sm font-bold">Pinkie Pie Approved!</span>
                                 </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                         <div>
                             <h2 className="text-3xl magic-font text-[#701a75] drop-shadow-sm">Magic Treats</h2>
                             <p className="text-sm text-[#ec4899] font-bold magic-font ml-1">Everypony loves these!</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#06b6d4] text-white px-5 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#0891b2] transition-colors magic-font shadow-md active:scale-95 border-2 border-white">
                             See All <Icon name="flame" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#fdf4ff] border-b-2 border-[#fbcfe8]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#ec4899] text-white text-xs font-black px-2 py-1 rounded-lg border border-white transform -rotate-3 shadow-sm">
                                                SAVE!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white/90">
                                         <h3 className="font-bold text-[#701a75] text-sm line-clamp-2 mb-2 leading-tight magic-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-xs text-gray-400 line-through decoration-[#ec4899] decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#ec4899] font-black text-xl magic-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#fdf4ff] text-[#a855f7] border border-[#a855f7] flex items-center justify-center rounded-full hover:bg-[#f5d0fe] transition-all shadow-sm active:scale-90">
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
                <section className="animate-pop-in pt-4">
                    <div className="relative mb-8 group">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#ec4899]" />
                         </div>
                         <input type="text" placeholder="Search for magic..." className="w-full pl-14 pr-6 py-4 rounded-[2rem] bg-white border-2 border-[#fbcfe8] text-[#701a75] placeholder:text-[#f472b6] focus:outline-none focus:border-[#ec4899] focus:ring-4 focus:ring-[#fce7f3] transition-all text-lg font-bold magic-font shadow-sm" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-3 text-lg font-bold rounded-2xl magic-font flex items-center gap-2 ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-24">
                        {filteredProducts?.map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#fdf4ff] border-b-2 border-[#fbcfe8]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                     </div>
                                     <div className="p-4 bg-white/90">
                                         <h3 className="font-bold text-[#701a75] text-sm line-clamp-2 mb-2 leading-tight magic-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-xs text-gray-400 line-through decoration-[#ec4899] decoration-2 font-bold">{pricing.original}</span>}
                                                 <span className="text-[#ec4899] font-black text-xl magic-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#fdf4ff] text-[#a855f7] border border-[#a855f7] flex items-center justify-center rounded-full hover:bg-[#f5d0fe] transition-all shadow-sm active:scale-90">
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
                <section className="animate-pop-in pt-4 pb-24">
                    {/* Header: Order Status */}
                    <div className="mb-8 flex items-center justify-between bg-white p-6 border-4 border-[#e0f2fe] rounded-[2.5rem] shadow-lg relative overflow-hidden">
                         <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">☁️</div>
                         <div className="relative z-10">
                             <h2 className="text-3xl magic-font text-[#06b6d4]">Order Status</h2>
                             <p className="text-sm text-[#ec4899] font-bold mt-1 magic-font">Flying fast like Rainbow Dash!</p>
                         </div>
                         <div className="w-16 h-16 bg-[#e0f2fe] border-4 border-white rounded-full flex items-center justify-center animate-bounce shadow-sm">
                             <Icon name="clock" size={32} className="text-[#06b6d4]" />
                         </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="bg-white p-5 border-2 border-[#fbcfe8] rounded-[2rem] relative overflow-hidden shadow-[0_4px_15px_rgba(236,72,153,0.1)]">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-[#ec4899] font-black uppercase tracking-widest flex items-center gap-1 font-bold">
                                         Order #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-3 py-1 text-xs font-black uppercase tracking-wide border-2 flex items-center gap-1.5 magic-font shadow-sm rounded-xl transform -rotate-1
                                         ${o.status === 'pending' ? 'bg-[#fefce8] text-[#a16207] border-[#fde047]' : 'bg-[#dcfce7] text-[#15803d] border-[#22c55e]'}`}>
                                         {o.status === 'pending' ? 'Baking...' : 'Served!'}
                                     </span>
                                </div>
                                <div className="mb-3 space-y-1 bg-[#fdf4ff] p-4 border border-[#f5d0fe] rounded-2xl">
                                    {o.order_items.map((i, idx) => {
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        return (
                                            <div key={idx} className="flex justify-between items-start text-sm text-[#701a75] font-bold mb-2 border-b border-dashed border-[#f5d0fe] pb-2 last:border-0 magic-font">
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-base">{quantity}x {i.product_name}</span>
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[10px] bg-[#a855f7] text-white px-2 py-0.5 rounded-md font-sans font-bold mt-1 shadow-sm uppercase tracking-wider`}>
                                                            {i.variant}
                                                        </span>
                                                    )}
                                                    {i.note && <span className="text-xs text-[#ec4899] italic mt-0.5">Note: {i.note}</span>}
                                                </div>
                                                <span className="text-[#a855f7] text-lg">{finalPriceTotal}.-</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-[#fbcfe8]">
                                     <span className="font-bold text-[#ec4899] text-xs uppercase tracking-widest">TOTAL</span>
                                     <span className="font-black text-[#701a75] text-2xl magic-font">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                         {(!ordersList || ordersList.length === 0) && (
                             <div className="text-center py-12 opacity-50">
                                <div className="w-16 h-16 bg-[#fdf4ff] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#fbcfe8] animate-pulse">
                                    <Icon name="search" size={32} className="text-[#ec4899]" />
                                </div>
                                <p className="magic-font text-xl text-[#701a75]">No magic here yet...</p>
                             </div>
                         )}
                    </div>
                </section>
            )}
        </main>

        {/* --- FLOATING NAV (Cloudsdale Style) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[75px] bg-white/90 backdrop-blur-md shadow-[0_10px_30px_rgba(236,72,153,0.3)] flex justify-around items-center px-4 z-[90] rounded-full border-2 border-white">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'home' ? 'text-[#ec4899]' : 'text-gray-400'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#fdf4ff]' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'menu' ? 'text-[#ec4899]' : 'text-gray-400'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#fdf4ff]' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* Cart Button (Heart/Balloon) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#ec4899] rounded-full shadow-[0_8px_20px_rgba(236,72,153,0.4)] flex items-center justify-center text-white border-4 border-white active:scale-90 transition-all duration-100 z-20 group hover:bg-[#be185d]">
                     <Icon name="basket" size={32} className="group-hover:rotate-12 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#fde047] text-[#701a75] text-xs w-6 h-6 rounded-full flex items-center justify-center font-black border-2 border-white animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'status' ? 'text-[#ec4899]' : 'text-gray-400'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#fdf4ff]' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#701a75]/60 backdrop-blur-sm animate-pop-in">
                <div className="w-full max-w-md bg-white border-t-4 border-[#a855f7] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[3rem]">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-[#ec4899] rounded-full border-2 border-[#ec4899] flex items-center justify-center hover:bg-[#fdf2f8] transition-colors shadow-md active:scale-90">
                            <Icon name="x" />
                        </button>
                        <div className="relative w-full h-80 overflow-hidden border-b-4 border-[#fbcfe8] rounded-b-[2.5rem] bg-[#fdf4ff]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#a855f7] text-white font-black text-2xl magic-font rounded-2xl border-4 border-white shadow-lg transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-white/80 decoration-white decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32">
                        <h2 className="text-4xl magic-font text-[#701a75] mb-6 leading-tight drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5">
                            {/* --- 🏷️ VARIANT SELECTOR (Replaces Element of Magic Checkbox) --- */}
                            <div>
                                <label className="block text-lg font-bold text-[#701a75] mb-3 magic-font ml-1 tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'NORMAL', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'SPECIAL', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'JUMBO', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-between h-24 magic-font
                                                ${variant === v.key 
                                                    ? 'bg-[#fdf4ff] border-[#a855f7] shadow-[0_3px_0_#a855f7] -translate-y-1 text-[#a855f7]' 
                                                    : 'bg-white border-[#f5d0fe] text-gray-400 hover:border-[#a855f7] hover:text-[#a855f7]'}`}
                                        >
                                            <span className="text-xs font-black tracking-widest">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && <span className="text-[10px] line-through decoration-[#ec4899] opacity-70">{v.original}</span>}
                                                <span className="text-xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-2 bg-[#fdf4ff] p-2 rounded-full border border-[#f5d0fe]">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white border border-[#f5d0fe] text-[#a855f7] rounded-full flex items-center justify-center hover:bg-[#faf5ff] active:scale-90 transition-all font-black text-xl"><Icon name="minus" /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-[#701a75] magic-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#a855f7] border border-[#a855f7] text-white rounded-full flex items-center justify-center hover:bg-[#9333ea] active:scale-90 transition-all font-black text-xl"><Icon name="plus" /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-[#ec4899] font-bold uppercase tracking-widest mb-1">BITS</p>
                                    <p className="text-4xl font-black text-[#701a75] magic-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Dear Princess Celestia..." 
                                    className="w-full p-4 bg-white border-2 border-[#f5d0fe] rounded-[2rem] font-bold text-[#701a75] placeholder:text-[#d8b4fe] focus:outline-none focus:border-[#a855f7] transition-all magic-font resize-none h-24 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border-2 border-[#a855f7] text-[#a855f7] font-black text-lg rounded-2xl active:scale-95 transition-all shadow-sm magic-font">
                                Add to Bag
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-magic text-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                                PARTY! <Icon name="flame" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#701a75]/60 backdrop-blur-sm animate-pop-in">
                 <div className="w-full max-w-md bg-[#fdf4ff] border-t-6 border-[#ec4899] flex flex-col shadow-[0_-20px_60px_rgba(236,72,153,0.3)] h-[85vh] rounded-t-[3rem]">
                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-2 bg-[#ec4899] rounded-full mx-auto opacity-30" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-3xl font-black text-[#701a75] magic-font transform -rotate-1">Your Goodies</h2>
                         <div className="w-12 h-12 bg-[#ec4899] text-white border-4 border-white rounded-full flex items-center justify-center font-black text-xl magic-font shadow-md">
                             <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-2 border-[#fbcfe8] rounded-2xl relative overflow-hidden shadow-sm">
                                 <img src={item.image_url} className="w-16 h-16 object-cover border-2 border-[#fbcfe8] rounded-xl ml-2 bg-[#fdf4ff]" />
                                 <div className="flex-1">
                                     <div className="font-bold text-[#701a75] text-lg leading-tight magic-font tracking-wide">
                                         {item.name} <span className="text-[#ec4899]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-xs text-[#a855f7] mt-1 font-bold">
                                         {item.variant !== 'normal' && <span className="text-[#a855f7] font-black uppercase mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-[#ec4899] italic mt-1 bg-[#fdf4ff] p-1 rounded">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#701a75] text-xl magic-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#fdf2f8] hover:bg-[#fce7f3] flex items-center justify-center text-[#ec4899] border-2 border-[#fbcfe8] rounded-xl transition-colors active:scale-90">
                                     <Icon name="trash" size={16} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-[#d8b4fe] font-bold magic-font text-xl">Bag is empty...</div>
                         )}
                     </div>

                     <div className="p-8 bg-white border-t-4 border-[#fbcfe8] relative z-30 rounded-t-[2.5rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-dashed border-[#f5d0fe]">
                             <div>
                                 <p className="text-xs text-[#a855f7] font-black uppercase tracking-widest magic-font">Grand Total</p>
                                 <p className="text-5xl font-black text-[#701a75] magic-font">{cartTotal}.-</p>
                             </div>
                             <div className="w-16 h-16 bg-[#06b6d4] border-4 border-white rounded-full flex items-center justify-center text-white transform rotate-6 shadow-lg">
                                 <Icon name="check" size={32} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-magic text-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                             <span>MAKE IT HAPPEN!</span> <Icon name="flame" size={28} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#701a75]/80 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-pop-in">
                <div className="w-full max-w-sm bg-white border-4 border-[#ec4899] p-8 text-center shadow-2xl animate-bounce-slow relative overflow-hidden rounded-[3rem]">
                    <div className="w-24 h-24 bg-[#fdf4ff] text-[#ec4899] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#ec4899] shadow-lg relative z-10">
                        <Icon name="basket" size={48} className="animate-pulse" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-3xl font-black text-[#701a75] mb-2 leading-tight magic-font">Bag not empty!</h3>
                            <p className="text-lg text-[#a855f7] mb-8 font-bold magic-font">Order {selectedProduct.name} together with bag items?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#ec4899] text-white font-black border-4 border-white shadow-lg active:scale-95 transition-all text-xl magic-font rounded-2xl">YES! 100% COOL!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-[#f3f4f6] text-gray-400 font-black text-sm active:scale-95 transition-transform hover:bg-gray-50 magic-font rounded-2xl">NO, JUST ADD TO BAG</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl font-black text-[#701a75] mb-2 leading-tight magic-font">Are you sure?</h3>
                            <p className="text-lg text-[#a855f7] mb-8 font-bold magic-font">Don't forget to share with friends!</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-[#ec4899] text-white font-black border-4 border-white shadow-lg active:scale-95 transition-all text-xl magic-font rounded-2xl">YES! LET'S PARTY!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-[#f3f4f6] text-gray-400 font-black text-sm active:scale-95 transition-transform hover:bg-gray-50 magic-font rounded-2xl">Maybe later...</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}