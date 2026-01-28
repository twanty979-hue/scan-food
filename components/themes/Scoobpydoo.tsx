import React, { useState, useEffect, useRef } from "react";

// --- 🐕 Scooby-Doo Icons Wrapper ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    home: <path d="M2 22 L12 2 L22 22 L18 22 L18 14 L6 14 L6 22 Z M10 14 L10 10 L14 10 L14 14" />, 
    menu: <path d="M4 8a2 2 0 1 1 4 0 2 2 0 0 1-4 0m12 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0M7 8h10M5 16h14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2" />,
    search: <circle cx="11" cy="11" r="8" />, 
    basket: <path d="M1 9h20l-2 10H3z M6 19a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M14 19a2 2 0 1 0 4 0a2 2 0 1 0-4 0" />,
    clock: <circle cx="12" cy="12" r="10" />,
    chef: <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0 M15 15l6 6" />, 
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6L6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    flame: <path d="M14 2c0 2.2-1.8 4-4 4s-4-1.8-4-4 M8 10c0 2 3 2 3 5 0 3-3 4-3 7" />,
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
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
      {name === 'clock' && <path d="M12 6v6l4 2" />}
      {name === 'chef' && <path d="M12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-transparent" />;

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
    // Theme: Mystery Inc. (Big Text & Clear BG)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-36 relative overflow-x-hidden font-sans text-[#1e293b] border-x-4 border-[#36b5b0]">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Creepster&family=Mali:ital,wght@0,300;0,400;0,600;0,700;1,600&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --teal: #36b5b0;
                --lime: #99cc33;
                --orange: #f28f1c;
                --purple: #7452a3;
                --bg-dark: #2d1b4e;
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg-dark);
                /* Retro Flower Power Pattern - VISIBLE */
                background-image: 
                    radial-gradient(circle at 10% 20%, var(--orange) 10%, transparent 11%),
                    radial-gradient(circle at 90% 80%, var(--lime) 10%, transparent 11%),
                    radial-gradient(circle at 50% 50%, var(--teal) 5%, transparent 6%);
                background-size: 100px 100px;
                background-attachment: fixed;
            }

            .spooky-font {
                font-family: 'Creepster', cursive;
                letter-spacing: 2px;
            }

            .fun-font {
                font-family: 'Mali', cursive;
            }

            /* --- Animations: Only for Entry/Transition --- */
            @keyframes zoom-in-logo {
                0% { transform: scale(0); opacity: 0; }
                80% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            .animate-logo-entry { animation: zoom-in-logo 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

            @keyframes slide-up-fade {
                0% { transform: translateY(20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            .page-transition { animation: slide-up-fade 0.4s ease-out forwards; }

            .btn-scooby {
                background: var(--teal);
                color: white;
                border: 3px solid var(--lime);
                border-radius: 999px;
                font-family: 'Mali', cursive;
                font-weight: 700;
                box-shadow: 0 6px 0px var(--lime); 
                transition: all 0.1s;
            }
            .btn-scooby:active {
                transform: translateY(6px);
                box-shadow: 0 0 0px var(--lime);
            }

            .item-card {
                background: #fff;
                border-radius: 1.5rem;
                border: 4px solid var(--purple); 
                transition: all 0.2s;
            }
            .item-card:active {
                transform: scale(0.98);
                border-color: var(--orange);
            }

            .tab-btn {
                background: white;
                color: var(--purple);
                border: 3px solid var(--purple);
                border-radius: 1rem;
                transition: all 0.3s;
            }
            .tab-btn.active {
                background: var(--orange);
                color: white;
                border: 3px solid #fff;
                box-shadow: 0 6px 15px rgba(0,0,0,0.4);
                transform: rotate(-2deg) scale(1.05);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* --- Header --- */}
        <header className="bg-[#36b5b0] text-white pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-xl z-10 border-b-8 border-[#99cc33]">
             <div className="absolute bottom-0 left-0 w-full h-12 bg-[#99cc33] transform -skew-y-2 origin-bottom-left translate-y-4"></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#f28f1c] w-fit px-4 py-2 rounded-full border-2 border-white shadow-md transform rotate-2">
                         {/* Static decorative dot */}
                         <span className="w-4 h-4 rounded-full bg-white"></span>
                         <p className="text-white text-sm font-black tracking-wide fun-font uppercase">Solving Hunger</p>
                     </div>
                     <h1 className="text-5xl spooky-font tracking-wide leading-none mt-2 text-[#2d1b4e] drop-shadow-md">
                         {brand?.name || "Mystery Inc."}
                     </h1>
                 </div>
                 
                 {/* Static Logo Icon - Only animates on load if you refresh, mostly static now */}
                 <div className="w-24 h-24 bg-white rounded-full border-4 border-[#2d1b4e] flex items-center justify-center relative shadow-lg animate-logo-entry">
                     <Icon name="chef" className="text-[#36b5b0] w-14 h-14" />
                     <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#f28f1c] rounded-full border-2 border-white"></div>
                 </div>
             </div>
        </header>
        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="page-transition">
                    {/* Hero Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-64 bg-white rounded-[2rem] overflow-hidden shadow-[8px_8px_0_#7452a3] mb-8 border-4 border-[#36b5b0] p-1">
                            <div className="h-full w-full rounded-[1.5rem] overflow-hidden">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute top-4 right-4 bg-[#f28f1c] text-white px-6 py-3 rounded-xl border-2 border-[#2d1b4e] transform rotate-3 shadow-md">
                                <span className="spooky-font text-2xl tracking-widest">YUMMY!</span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                         <div>
                             <h2 className="text-4xl spooky-font text-[#99cc33] drop-shadow-[2px_2px_0_#2d1b4e]">Jinkies! Food!</h2>
                             <p className="text-xl text-white font-bold fun-font ml-1 opacity-90 drop-shadow-md">Looks like a clue...</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#7452a3] text-white px-6 py-3 rounded-full text-xl font-bold flex items-center gap-2 hover:bg-[#5b3a8a] transition-colors fun-font border-2 border-white shadow-lg active:scale-95">
                             Search <Icon name="search" size={24} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-40 overflow-hidden relative bg-[#2d1b4e] border-b-4 border-[#7452a3]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#f28f1c] text-white text-sm font-black px-3 py-1 rounded-lg border-2 border-[#2d1b4e] shadow-sm">
                                                CLUE!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         {/* HUGE Product Name */}
                                         <h3 className="font-bold text-[#2d1b4e] text-2xl line-clamp-2 mb-2 leading-tight fun-font tracking-wide h-16">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-sm text-gray-400 line-through decoration-[#f28f1c] decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 {/* HUGE Price */}
                                                 <span className="text-[#f28f1c] font-black text-4xl fun-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-12 h-12 bg-[#36b5b0] text-white border-2 border-[#2d1b4e] flex items-center justify-center rounded-full hover:bg-[#2a9d8f] transition-all shadow-sm active:scale-90">
                                                 <Icon name="plus" size={24} strokeWidth={4} />
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
                <section className="page-transition pt-4">
                    <div className="relative mb-8 group mt-4">
                         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                             <Icon name="search" size={28} className="text-[#f28f1c]" />
                         </div>
                         <input type="text" placeholder="Search clues..." className="w-full pl-16 pr-6 py-5 rounded-full bg-white border-4 border-[#99cc33] text-[#2d1b4e] placeholder:text-[#36b5b0] focus:outline-none focus:border-[#f28f1c] focus:shadow-[0_0_15px_#f28f1c] transition-all text-2xl font-bold fun-font shadow-lg" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-4 text-2xl font-bold rounded-2xl fun-font flex items-center gap-2 ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-24">
                        {filteredProducts?.map((p: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-40 overflow-hidden relative bg-[#2d1b4e] border-b-4 border-[#7452a3]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#2d1b4e] text-2xl line-clamp-2 mb-2 leading-tight fun-font tracking-wide h-16">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-sm text-gray-400 line-through decoration-[#f28f1c] decoration-2 font-bold">{pricing.original}</span>}
                                                 <span className="text-[#f28f1c] font-black text-4xl fun-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-12 h-12 bg-[#36b5b0] text-white border-2 border-[#2d1b4e] flex items-center justify-center rounded-full hover:bg-[#2a9d8f] transition-all shadow-sm active:scale-90">
                                                 <Icon name="plus" size={24} strokeWidth={4} />
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
                <section className="page-transition pt-4 pb-24">
                    {/* Header: Mystery Log (Clock Animation ONLY here) */}
                    <div className="mb-8 flex items-center justify-between bg-[#2d1b4e] p-6 border-4 border-[#99cc33] rounded-[2rem] shadow-[0_0_20px_rgba(153,204,51,0.6)] relative overflow-hidden">
                         <div className="relative z-10">
                             <h2 className="text-4xl spooky-font text-[#f28f1c]">Mystery Log</h2>
                             <p className="text-xl text-[#36b5b0] font-bold mt-1 fun-font">Tracking the ghost...</p>
                         </div>
                         <div className="w-24 h-24 bg-[#36b5b0] border-4 border-white rounded-full flex items-center justify-center shadow-md animate-logo-entry">
                             <Icon name="clock" size={48} className="text-white" />
                         </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-white p-6 border-4 border-[#7452a3] rounded-3xl relative overflow-hidden shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-lg text-[#f28f1c] font-black uppercase tracking-widest flex items-center gap-2 font-bold">
                                         <Icon name="menu" size={20} /> Order #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-2 text-lg font-black uppercase tracking-wide border-2 flex items-center gap-1.5 fun-font shadow-sm rounded-xl transform -rotate-1
                                         ${o.status === 'pending' ? 'bg-[#2d1b4e] text-[#99cc33] border-[#99cc33]' : 'bg-[#99cc33] text-[#2d1b4e] border-[#2d1b4e]'}`}>
                                         {o.status === 'pending' ? 'Searching...' : 'Solved!'}
                                     </span>
                                </div>
                                <div className="mb-4 space-y-2 bg-[#f0fdf4] p-5 border-2 border-[#99cc33] rounded-2xl border-dashed">
                                    {o.order_items.map((i: any, idx: any) => {
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        return (
                                            <div key={idx} className="flex justify-between items-start text-xl text-[#2d1b4e] font-bold mb-2 border-b-2 border-dashed border-[#99cc33] pb-2 last:border-0 fun-font">
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight text-xl">{quantity}x {i.product_name}</span>
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-sm bg-[#7452a3] text-white px-2 py-1 rounded-lg font-sans font-bold mt-1 shadow-sm uppercase tracking-wider`}>
                                                            {i.variant}
                                                        </span>
                                                    )}
                                                    {i.note && <span className="text-base text-[#f28f1c] italic mt-0.5">Note: {i.note}</span>}
                                                </div>
                                                <span className="text-[#f28f1c] text-2xl">{finalPriceTotal}.-</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t-4 border-[#7452a3]">
                                     <span className="font-bold text-[#2d1b4e] text-lg uppercase tracking-widest">TOTAL</span>
                                     <span className="font-black text-[#f28f1c] text-4xl fun-font">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                         {(!ordersList || ordersList.length === 0) && (
                             <div className="text-center py-12 opacity-80">
                                <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#2d1b4e] animate-logo-entry">
                                    <Icon name="search" size={48} className="text-[#2d1b4e]" />
                                </div>
                                <p className="fun-font text-3xl text-white">No clues found...</p>
                             </div>
                         )}
                    </div>
                </section>
            )}
        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-[400px] h-[90px] bg-[#99cc33] shadow-[0_10px_0_#6aa022] flex justify-around items-center px-2 z-[100] rounded-full border-4 border-white">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-20 group ${activeTab === 'home' ? 'text-[#2d1b4e]' : 'text-white'}`}>
                 <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors border-4 border-transparent ${activeTab === 'home' ? 'bg-[#2d1b4e] border-white' : ''}`}>
                     <Icon name="home" size={28} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-20 group ${activeTab === 'menu' ? 'text-[#2d1b4e]' : 'text-white'}`}>
                 <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors border-4 border-transparent ${activeTab === 'menu' ? 'bg-[#2d1b4e] border-white' : ''}`}>
                     <Icon name="menu" size={28} />
                 </div>
             </button>

             {/* Cart Button */}
             <div className="relative w-20 h-20 flex items-center justify-center -mt-16">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-24 h-24 bg-[#f28f1c] rounded-full shadow-[0_0_0_6px_#2d1b4e] flex items-center justify-center text-white border-4 border-[#f28f1c] active:scale-90 transition-all duration-100 z-20 group">
                     <Icon name="basket" size={40} />
                     {cart?.length > 0 && (
                         <span className="absolute -top-1 -right-1 bg-[#7452a3] text-white text-lg w-9 h-9 rounded-full flex items-center justify-center font-black border-2 border-white animate-logo-entry">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-20 group ${activeTab === 'status' ? 'text-[#2d1b4e]' : 'text-white'}`}>
                 <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors border-4 border-transparent ${activeTab === 'status' ? 'bg-[#2d1b4e] border-white' : ''}`}>
                     <Icon name="clock" size={28} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#2d1b4e]/90 backdrop-blur-md animate-logo-entry">
                <div className="w-full max-w-md bg-white border-t-[6px] border-x-[6px] border-[#36b5b0] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[3rem]">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-14 h-14 bg-[#f28f1c] text-white rounded-full border-4 border-white flex items-center justify-center hover:bg-[#d97706] transition-colors shadow-lg active:scale-90">
                            <Icon name="x" size={32} />
                        </button>
                        <div className="relative w-full h-80 overflow-hidden border-b-[6px] border-[#36b5b0] rounded-b-[2.5rem] bg-[#99cc33]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-[#7452a3] text-[#99cc33] font-black text-4xl spooky-font rounded-2xl border-4 border-white shadow-xl transform rotate-2">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-lg line-through text-white decoration-[#f28f1c] decoration-4 mb-1 block">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-36">
                        <h2 className="text-5xl spooky-font text-[#2d1b4e] mb-8 leading-tight drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            {/* --- 🏷️ VARIANT SELECTOR --- */}
                            <div>
                                <label className="block text-2xl font-bold text-[#2d1b4e] mb-4 fun-font ml-1 tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { key: 'normal', label: 'SCOOBY', color: 'bg-[#99cc33]', text: 'text-[#2d1b4e]', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'SHAGGY', color: 'bg-[#f28f1c]', text: 'text-white', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'MONSTER', color: 'bg-[#7452a3]', text: 'text-[#99cc33]', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center justify-between h-32 fun-font
                                                ${variant === v.key 
                                                    ? `${v.color} border-[#2d1b4e] shadow-[4px_4px_0_#2d1b4e] -translate-y-2 ${v.text}` 
                                                    : 'bg-white border-gray-200 text-gray-400 hover:border-[#36b5b0]'}`}
                                        >
                                            <span className="text-base font-black tracking-widest">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && <span className="text-sm line-through opacity-70">{v.original}</span>}
                                                <span className="text-3xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Write a clue for the chef..." 
                                    className="w-full p-6 bg-white border-4 border-[#2d1b4e] rounded-[2rem] focus:border-[#f28f1c] focus:outline-none h-32 resize-none text-2xl font-bold text-[#2d1b4e] placeholder:text-gray-400 transition-colors shadow-inner fun-font"
                                />
                            </div>
                            
                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-3 bg-[#99cc33] p-3 rounded-full border-4 border-white shadow-xl">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-14 h-14 bg-white text-[#99cc33] rounded-full flex items-center justify-center hover:bg-[#f0fdf4] active:scale-90 transition-all font-black text-2xl border-2 border-[#99cc33]"><Icon name="minus" size={24} /></button>
                                    <span className="text-5xl font-black w-20 text-center bg-transparent border-none text-white fun-font drop-shadow-md">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-14 h-14 bg-[#2d1b4e] text-white rounded-full flex items-center justify-center hover:bg-[#4c1d95] active:scale-90 transition-all font-black text-2xl border-2 border-[#99cc33]"><Icon name="plus" size={24} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[#f28f1c] font-black uppercase tracking-widest mb-1 fun-font">TOTAL CLUES</p>
                                    <p className="text-6xl font-black text-[#2d1b4e] spooky-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => handleAdd(true)} className="py-6 bg-white border-4 border-[#2d1b4e] text-[#2d1b4e] font-black text-2xl rounded-2xl active:scale-95 transition-all shadow-[4px_4px_0_#99cc33] fun-font">
                                Save Clue
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-6 btn-scooby text-3xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                EAT IT! <Icon name="flame" size={32} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#2d1b4e]/80 backdrop-blur-sm animate-logo-entry">
                 <div className="w-full max-w-md bg-[#f0fdf4] border-t-[6px] border-[#36b5b0] flex flex-col shadow-[0_-20px_60px_rgba(54,181,176,0.4)] h-[85vh] rounded-t-[3rem]">
                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-24 h-2 bg-[#36b5b0] rounded-full mx-auto opacity-50" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-5xl spooky-font text-[#2d1b4e] transform -rotate-1">Scooby Snacks</h2>
                         <div className="w-16 h-16 bg-[#f28f1c] text-white border-4 border-white rounded-full flex items-center justify-center font-black text-3xl fun-font shadow-md">
                             <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item: any, idx: any) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-[#99cc33] rounded-3xl relative overflow-hidden shadow-sm">
                                 <img src={item.image_url} className="w-24 h-24 object-cover border-2 border-[#99cc33] rounded-2xl ml-2 bg-[#f0fdf4]" />
                                 <div className="flex-1">
                                     <div className="font-bold text-[#2d1b4e] text-2xl leading-tight fun-font tracking-wide">
                                         {item.name} <span className="text-[#f28f1c]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-lg text-[#36b5b0] mt-1 font-bold">
                                         {item.variant !== 'normal' && <span className="text-[#7452a3] font-black uppercase mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-[#f28f1c] italic mt-1 bg-[#fefce8] p-1 rounded">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#f28f1c] text-3xl fun-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-14 h-14 bg-[#fef2f2] hover:bg-[#fee2e2] flex items-center justify-center text-[#ef4444] border-2 border-[#fee2e2] rounded-xl transition-colors active:scale-90">
                                     <Icon name="trash" size={24} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-[#36b5b0] font-bold fun-font text-2xl">Bag is empty...</div>
                         )}
                     </div>

                     <div className="p-8 bg-white border-t-4 border-[#36b5b0] relative z-30 rounded-t-[2.5rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-gray-200">
                             <div>
                                 <p className="text-sm text-[#36b5b0] font-black uppercase tracking-widest fun-font">Bill to Fred</p>
                                 <p className="text-6xl spooky-font text-[#7452a3]">{cartTotal}.-</p>
                             </div>
                             <div className="w-20 h-20 bg-[#99cc33] border-4 border-[#2d1b4e] rounded-full flex items-center justify-center text-[#2d1b4e] transform rotate-6 shadow-lg">
                                 <Icon name="check" size={40} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-6 btn-scooby text-4xl active:scale-95 transition-all flex items-center justify-center gap-3">
                             <span>SOLVE MYSTERY!</span> <Icon name="flame" size={32} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#2d1b4e]/90 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-logo-entry">
                <div className="w-full max-w-sm bg-white border-4 border-[#f28f1c] p-8 text-center shadow-[0_0_40px_rgba(242,143,28,0.5)] relative overflow-hidden rounded-[3rem]">
                    <div className="w-28 h-28 bg-[#7452a3] text-[#99cc33] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg relative z-10">
                        <Icon name="basket" size={56} />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-5xl spooky-font text-[#2d1b4e] mb-2 leading-tight">Ruh-Roh!</h3>
                            <p className="text-2xl text-[#36b5b0] mb-8 font-bold fun-font">Order {selectedProduct.name} too?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-[#99cc33] text-[#2d1b4e] font-black border-4 border-[#2d1b4e] shadow-[4px_4px_0_#2d1b4e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl fun-font rounded-2xl">ZOINKS! YES!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-white border-4 border-gray-300 text-gray-400 font-black text-xl active:scale-95 transition-transform hover:bg-gray-50 fun-font rounded-2xl">Like, no way.</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-5xl spooky-font text-[#2d1b4e] mb-2 leading-tight">Jinkies!</h3>
                            <p className="text-2xl text-[#36b5b0] mb-8 font-bold fun-font">Ready to order these snacks?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-5 bg-[#99cc33] text-[#2d1b4e] font-black border-4 border-[#2d1b4e] shadow-[4px_4px_0_#2d1b4e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl fun-font rounded-2xl">YES! LET'S EAT!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white border-4 border-gray-300 text-gray-400 font-black text-xl active:scale-95 transition-transform hover:bg-gray-50 fun-font rounded-2xl">Hold on, Scoob.</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}