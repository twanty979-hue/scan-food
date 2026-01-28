import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (We Bare Bears Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Cave / Den
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />, 
    // Menu -> Stack / List
    menu: <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="3" strokeLinecap="round" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Tote Bag / Backpack
    basket: <path d="M5 8h14l-2 13H7L5 8zm7-6v6" />,
    // Clock -> Alarm Clock
    clock: <circle cx="12" cy="12" r="10" strokeWidth="3" />,
    // Chef -> Chef Hat / Paw
    chef: <path d="M18 6c-2-2-5-2-7 0L8 9c-1 1-1 3 0 4l3 3c1 1 3 1 4 0l1-1" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Action / Spark
    flame: <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />, 
    
    // Specifics
    paw: <path d="M12 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3m5.5 3a2.5 2.5 0 0 1 2.5 2.5 2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1 2.5-2.5m-11 0a2.5 2.5 0 0 1 2.5 2.5 2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1 2.5-2.5" />,
    star: <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />,
    camera: <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#f0f9ff] flex items-center justify-center text-[#0ea5e9] font-black text-2xl animate-stack">STACKING...</div>;

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
    // Theme: We Bare Bears - Stacked Order System
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#0f172a]">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Inter:wght@400;600;800&family=Itim&display=swap');
            
            :root {
                --bear-blue: #0ea5e9; /* Sky Blue */
                --bear-deep: #1e40af; /* Navy */
                --grizzly-brown: #92400e;
                --panda-black: #18181b;
                --ice-white: #f8fafc;
                --bg-den: #f0f9ff;
                --text-main: #0f172a;
            }

            body {
                font-family: 'Chakra Petch', 'Inter', sans-serif;
                background-color: var(--bg-den);
                background-image: 
                    radial-gradient(circle at 10% 20%, rgba(14, 165, 233, 0.05) 10%, transparent 11%),
                    linear-gradient(rgba(14, 165, 233, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(14, 165, 233, 0.03) 1px, transparent 1px);
                background-size: 100px 100px, 40px 40px, 40px 40px;
                background-attachment: fixed;
                color: var(--text-main);
            }

            h1, h2, h3, .bear-font {
                font-family: 'Inter', sans-serif;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 800;
            }

            @keyframes bear-stack {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }
            .animate-stack {
                animation: bear-stack 4s infinite ease-in-out;
            }

            /* Image Pop Animation */
            @keyframes pop-image {
                0% { opacity: 0; transform: scale(0.95); }
                100% { opacity: 1; transform: scale(1); }
            }
            .animate-image-pop { animation: pop-image 0.4s ease-out; }

            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.5s ease-out; }

            .item-card {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                background: white;
                border-radius: 1.5rem;
                border: 2px solid #e2e8f0;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .item-card:hover, .item-card:active {
                transform: translateY(-5px);
                border-color: var(--bear-blue);
                box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.3);
            }

            .card-stripe {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 4px;
                background: linear-gradient(90deg, var(--grizzly-brown), var(--panda-black), var(--bear-blue));
            }

            .btn-bear {
                background: linear-gradient(90deg, var(--bear-deep) 0%, var(--bear-blue) 100%);
                color: white;
                border-radius: 1rem;
                font-weight: 700;
                box-shadow: 0 4px 15px rgba(30, 64, 175, 0.3);
                transition: all 0.2s;
                border: 1px solid rgba(255,255,255,0.2);
            }
            .btn-bear:active { transform: scale(0.95); filter: brightness(1.2); }

            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: var(--bear-deep);
                border: 1px solid #bae6fd;
                border-radius: 1rem;
                font-weight: 700;
            }
            .tab-btn.active {
                background: var(--bear-blue) !important;
                color: white !important;
                box-shadow: 0 8px 15px rgba(14, 165, 233, 0.3);
                transform: translateY(-2px);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (Bear Cave HUD) --- */}
        <header className="bg-white text-[#0f172a] pt-10 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-sm border-b-2 border-[#e0f2fe]">
             <div className="absolute top-4 right-10 text-[#0ea5e9]/20 text-5xl animate-pulse">
                <Icon name="paw" size={64} />
             </div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#f0f9ff] w-fit px-3 py-1 rounded-lg border border-[#bae6fd]">
                         <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse"></span>
                         <p className="text-[#0369a1] text-[10px] font-bold tracking-widest uppercase bear-font">The Cave: {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl bear-font font-black tracking-tighter leading-none mt-2 text-[#0f172a]">
                         {brand?.name || "Bear Bros Bistro"}
                     </h1>
                 </div>
                 {/* Bear Stack Badge */}
                 <div className="w-16 h-16 bg-[#0ea5e9] rounded-2xl flex flex-col items-center justify-center relative shadow-lg animate-stack overflow-hidden border-2 border-white">
                     <div className="w-full h-1/3 bg-[#92400e]"></div> {/* Grizzly */}
                     <div className="w-full h-1/3 bg-[#18181b]"></div> {/* Panda */}
                     <div className="w-full h-1/3 bg-[#f8fafc]"></div> {/* Ice Bear */}
                     <div className="absolute inset-0 flex items-center justify-center text-white">
                        <Icon name="chef" size={24} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade-in">
                    {/* Hero Banner (Modern Card) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[2rem] overflow-hidden shadow-lg mb-10 border border-[#e2e8f0] group animate-image-pop">
                             <div className="h-full w-full rounded-[2rem] overflow-hidden bg-[#f1f5f9] relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                 />
                             </div>
                             <div className="absolute bottom-4 left-6 bg-[#0f172a] text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                                 <Icon name="star" size={14} className="text-[#facc15]" />
                                 <span className="bear-font text-[10px] font-bold">#1 Rated!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2 animate-image-pop">
                         <div>
                             <h2 className="text-2xl bear-font text-[#0f172a]">Top Picks</h2>
                             <p className="text-xs text-[#64748b] font-bold uppercase tracking-widest ml-1">Approved by Ice Bear</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-white text-[#0ea5e9] px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#f0f9ff] transition-all border border-[#bae6fd] shadow-sm active:scale-95">
                             FULL MENU <Icon name="menu" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="card-stripe"></div>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#f8fafc]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-3 right-3 bg-[#ef4444] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm bear-font">
                                                 DEAL
                                             </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#0f172a] text-sm line-clamp-2 mb-1 leading-tight">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-[#94a3b8] line-through font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#0ea5e9] font-black text-lg bear-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#f0f9ff] text-[#0ea5e9] border border-[#bae6fd] flex items-center justify-center rounded-lg hover:bg-[#e0f2fe] transition-all active:scale-90">
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
                             <Icon name="search" className="text-[#94a3b8]" />
                         </div>
                         <input type="text" placeholder="Search for snacks..." className="w-full pl-14 pr-8 py-4 rounded-2xl bg-white border border-[#e2e8f0] text-[#0f172a] placeholder:text-[#cbd5e1] focus:outline-none focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#f0f9ff] transition-all text-sm font-bold" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1 animate-image-pop">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-2 text-sm font-bold bear-font ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="card-stripe"></div>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#f8fafc]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#0f172a] text-sm line-clamp-2 mb-1 leading-tight">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-[#94a3b8] line-through font-bold">{pricing.original}</span>}
                                                 <span className="text-[#0ea5e9] font-black text-lg bear-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#f0f9ff] text-[#0ea5e9] border border-[#bae6fd] flex items-center justify-center rounded-lg hover:bg-[#e0f2fe] transition-all active:scale-90">
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

            {/* --- STATUS PAGE (Bear Theme - FIXED LOGIC) --- */}
            {activeTab === 'status' && (
                <section className="animate-fade-in pt-4 pb-24">
                    <div className="mb-8 flex items-center justify-between bg-white p-6 border-l-8 border-[#0ea5e9] rounded-r-2xl shadow-sm relative overflow-hidden">
                         <div className="relative z-10">
                             <h2 className="text-2xl font-black bear-font text-[#0f172a]">Order Log</h2>
                             <p className="text-xs text-[#64748b] font-bold mt-1 uppercase tracking-widest">Ice Bear is cooking...</p>
                         </div>
                         <div className="w-14 h-14 bg-[#f0f9ff] rounded-xl flex items-center justify-center animate-pulse text-[#0ea5e9]">
                             <Icon name="clock" size={28} />
                         </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-white p-5 rounded-2xl shadow-sm border border-[#e2e8f0] relative overflow-hidden">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4 border-b border-[#f1f5f9] pb-3">
                                     <span className="text-xs text-[#0f172a] font-bold uppercase tracking-widest flex items-center gap-2">
                                         <span className="w-2 h-2 rounded-full bg-[#0ea5e9]"></span> Order #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wide rounded-md flex items-center gap-1
                                        ${o.status === 'pending' ? 'bg-[#fef9c3] text-[#b45309]' : 'bg-[#dcfce7] text-[#15803d]'}`}>
                                        {o.status === 'pending' ? 'PREPARING...' : 'SERVED!'}
                                     </span>
                                </div>

                                {/* Items */}
                                <div className="mb-4 space-y-2">
                                    {o.order_items.map((i: any, idx: any) => {
                                        // ✅ FIXED LOGIC FOR STATUS PAGE
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        const hasDiscount = (i.original_price && i.original_price > i.price) || (i.discount > 0);
                                        const originalPriceTotal = hasDiscount 
                                            ? (i.original_price ? i.original_price * i.quantity : (i.price + (i.discount || 0)) * i.quantity) 
                                            : finalPriceTotal;
                                        const discountAmount = originalPriceTotal - finalPriceTotal;

                                        return (
                                            <div key={idx} className="flex justify-between items-start text-sm text-[#334155] font-medium">
                                                
                                                {/* Left Info */}
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-tight">
                                                        <span className="font-bold text-[#0ea5e9]">{quantity}x</span> {i.product_name}
                                                    </span>
                                                    
                                                    {/* Variant Badge (Bear Style) */}
                                                    {i.variant !== 'normal' && (
                                                        <span className={`text-[9px] bg-[#f1f5f9] text-[#475569] px-1.5 py-0.5 rounded border border-[#e2e8f0] font-bold mt-1 uppercase tracking-wide`}>
                                                            {i.variant === 'special' ? 'GRIZZ SIZE' : i.variant === 'jumbo' ? 'ICE BEAR SIZE' : i.variant}
                                                        </span>
                                                    )}

                                                    {/* Note */}
                                                    {i.note && <span className="text-[10px] text-[#94a3b8] italic mt-0.5">"{i.note}"</span>}
                                                </div>

                                                {/* Right Price */}
                                                <div className="text-right flex flex-col items-end min-w-[80px]">
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className="text-[9px] text-[#16a34a] bg-[#dcfce7] px-1 rounded font-bold mb-0.5">
                                                                SAVE -{discountAmount}
                                                            </span>
                                                            <span className="text-[10px] text-[#cbd5e1] line-through font-bold">
                                                                {originalPriceTotal}
                                                            </span>
                                                            <span className="text-[#0f172a] font-bold">
                                                                {finalPriceTotal}.-
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[#0f172a] font-bold">{finalPriceTotal}.-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-[#f1f5f9]">
                                     <span className="font-bold text-[#94a3b8] text-xs uppercase tracking-widest">TOTAL</span>
                                     <span className="font-black text-[#0ea5e9] text-2xl bear-font">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-20 text-[#cbd5e1] font-bold text-lg bear-font">
                                No orders yet...
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Modern Capsule) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[80px] bg-white/90 backdrop-blur-md shadow-xl flex justify-around items-center px-4 z-[100] rounded-full border border-[#e2e8f0]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#f0f9ff] text-[#0ea5e9]' : 'text-[#94a3b8]'}`}>
                     <Icon name="home" size={20} />
                 </div>
                 <span className={`text-[10px] font-bold ${activeTab === 'home' ? 'text-[#0ea5e9]' : 'text-[#94a3b8]'}`}>Home</span>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#f0f9ff] text-[#0ea5e9]' : 'text-[#94a3b8]'}`}>
                     <Icon name="menu" size={20} />
                 </div>
                 <span className={`text-[10px] font-bold ${activeTab === 'menu' ? 'text-[#0ea5e9]' : 'text-[#94a3b8]'}`}>Menu</span>
             </button>

             {/* Big Cart Button (Tote) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-16 h-16 bg-[#0f172a] rounded-2xl shadow-lg flex items-center justify-center text-white border-4 border-white active:scale-90 transition-all duration-100 z-20 group hover:bg-[#1e293b]">
                     <Icon name="basket" size={24} />
                     {cart?.length > 0 && (
                         <span className="absolute -top-2 -right-2 bg-[#ef4444] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#f0f9ff] text-[#0ea5e9]' : 'text-[#94a3b8]'}`}>
                     <Icon name="clock" size={20} />
                 </div>
                 <span className={`text-[10px] font-bold ${activeTab === 'status' ? 'text-[#0ea5e9]' : 'text-[#94a3b8]'}`}>Status</span>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Clean Card - FIXED 3 PRICES) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0f172a]/60 backdrop-blur-md animate-fade-in">
                <div className="w-full max-w-md bg-white border-t border-[#e2e8f0] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[2rem] relative animate-image-pop">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-30 w-10 h-10 bg-white/80 backdrop-blur text-[#0f172a] rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-80 overflow-hidden bg-[#f8fafc]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/60 to-transparent">
                                <div className="flex items-end justify-between">
                                    <div className="flex flex-col text-white">
                                        {currentPriceObj.discount > 0 && (
                                            <span className="text-sm line-through text-gray-300 mb-1 font-bold">
                                                {currentPriceObj.original}
                                            </span>
                                        )}
                                        <span className="font-black text-4xl bear-font">{currentPriceObj.final}.-</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pt-6 pb-32 relative">
                        <h2 className="text-2xl font-black text-[#0f172a] mb-6 leading-tight">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            
                            {/* ✅ FIXED: 3 Variants Grid (PANDA/GRIZZ/ICE BEAR) */}
                            <div>
                                <label className="block text-xs font-black text-[#94a3b8] mb-3 uppercase tracking-widest">SELECT SIZE</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { key: 'normal', label: 'PANDA', ...calculatePrice(selectedProduct, 'normal'), color: 'bg-[#18181b] text-white' },
                                        selectedProduct.price_special && { key: 'special', label: 'GRIZZ', ...calculatePrice(selectedProduct, 'special'), color: 'bg-[#92400e] text-white' },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'ICE BEAR', ...calculatePrice(selectedProduct, 'jumbo'), color: 'bg-[#0ea5e9] text-white' }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-between h-24
                                                ${variant === v.key 
                                                    ? `${v.color} border-transparent shadow-lg scale-[1.02]` 
                                                    : 'bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1]'}`}
                                        >
                                            <span className="text-[10px] font-black tracking-widest uppercase">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none mt-2">
                                                {v.discount > 0 && (
                                                    <span className={`text-[10px] line-through opacity-70 mb-1`}>{v.original}</span>
                                                )}
                                                <span className="text-lg font-bold">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2 border-y border-[#f1f5f9]">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 bg-[#f1f5f9] text-[#0f172a] rounded-lg flex items-center justify-center hover:bg-[#e2e8f0] active:scale-90 transition-all"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-2xl font-black w-10 text-center bg-transparent border-none text-[#0f172a]">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-10 h-10 bg-[#0ea5e9] text-white rounded-lg flex items-center justify-center hover:bg-[#0284c7] active:scale-90 transition-all"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-[#64748b] font-black uppercase tracking-widest mb-1">Subtotal</p>
                                    <p className="text-3xl font-black text-[#0f172a] bear-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Special request for Ice Bear..." 
                                    className="w-full p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#e0f2fe] focus:outline-none h-24 resize-none text-sm font-medium text-[#0f172a] placeholder:text-[#94a3b8] transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border border-[#e2e8f0] text-[#0f172a] font-bold text-sm rounded-xl active:scale-95 transition-all shadow-sm">
                                ADD TO BAG
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-bear text-sm uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
                                ORDER NOW
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (Tote Bag) --- */}
        {activeTab === 'cart' && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0f172a]/60 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-white border-t border-[#e2e8f0] flex flex-col shadow-2xl h-[85vh] rounded-t-[2rem] animate-image-pop">
                    <div className="w-full py-4 cursor-pointer hover:bg-[#f8fafc] rounded-t-[2rem]" onClick={() => setActiveTab('menu')}>
                        <div className="w-16 h-1.5 bg-[#e2e8f0] rounded-full mx-auto" />
                    </div>

                    <div className="flex justify-between items-center mb-4 px-6">
                        <h2 className="text-2xl font-black text-[#0f172a] bear-font">Your Bag</h2>
                        <div className="w-10 h-10 bg-[#0ea5e9] text-white rounded-xl flex items-center justify-center font-bold shadow-md">
                            <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 px-6 pb-6 no-scrollbar">
                        {cart.map((item: any, idx: any) => (
                            <div key={idx} className="flex items-center gap-4 bg-[#f8fafc] p-3 rounded-xl border border-[#f1f5f9]">
                                <img src={item.image_url} className="w-16 h-16 object-cover rounded-lg" />
                                <div className="flex-1">
                                    <div className="font-bold text-[#0f172a] text-sm leading-tight">
                                        {item.name} <span className="text-[#64748b] text-xs">x{item.quantity}</span>
                                    </div>
                                    <div className="text-[10px] font-bold mt-1 text-[#0ea5e9] uppercase">
                                        {item.variant !== 'normal' && <span className="bg-white px-2 py-0.5 rounded border border-[#e2e8f0] mr-2">{item.variant}</span>}
                                        {item.note && <span className="block text-[#64748b] italic mt-1 font-normal lowercase first-letter:uppercase">"{item.note}"</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                     <span className="font-black text-[#0f172a] text-lg">{item.price * item.quantity}.-</span>
                                     <button onClick={() => updateQuantity(idx, -1)} className="w-8 h-8 bg-white border border-[#e2e8f0] text-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#fef2f2] transition-colors active:scale-90">
                                         <Icon name="trash" size={14} />
                                     </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="text-center py-20 text-[#cbd5e1] font-bold bear-font text-lg">
                                Empty like a bear's tummy...
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-white border-t border-[#e2e8f0] relative z-30">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-[10px] text-[#64748b] font-black uppercase tracking-widest">Total</p>
                                <p className="text-4xl font-black text-[#0f172a] bear-font">{cartTotal}.-</p>
                            </div>
                        </div>
                        <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-bear text-lg active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest rounded-xl shadow-xl shadow-blue-200">
                            <span>CHECKOUT</span> <Icon name="check" size={20} strokeWidth={4} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#0f172a]/80 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-image-pop">
                <div className="w-full max-w-sm bg-white border border-[#e2e8f0] p-8 text-center shadow-2xl relative overflow-hidden rounded-[2rem]">
                    <div className="w-20 h-20 bg-[#f0f9ff] text-[#0ea5e9] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Icon name="chef" size={40} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-2xl font-black text-[#0f172a] mb-2">Add to Bag?</h3>
                            <p className="text-sm text-[#64748b] mb-8 font-medium">Add "{selectedProduct.name}" and checkout?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 btn-bear text-white font-bold text-sm uppercase tracking-widest rounded-xl shadow-lg">YES! ORDER NOW</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border border-[#e2e8f0] text-[#64748b] font-bold text-sm active:scale-95 transition-transform hover:bg-[#f8fafc] rounded-xl uppercase">Keep Shopping</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-2xl font-black text-[#0f172a] mb-2">Ready to Eat?</h3>
                            <p className="text-sm text-[#64748b] mb-8 font-medium">Send order to the kitchen?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 btn-bear text-white font-bold text-sm uppercase tracking-widest rounded-xl shadow-lg">YES! I'M HUNGRY</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border border-[#e2e8f0] text-[#64748b] font-bold text-sm active:scale-95 transition-transform hover:bg-[#f8fafc] rounded-xl uppercase">Wait</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}