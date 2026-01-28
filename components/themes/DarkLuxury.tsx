import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons (Luxury Line Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    shop: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </>
    ),
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    search: (
      <>
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </>
    ),
    basket: <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0"/>,
    clock: (
      <>
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </>
    ),
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    plus: (
      <>
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </>
    ),
    minus: <line x1="5" y1="12" x2="19" y2="12"/>,
    x: (
      <>
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </>
    ),
    check: <polyline points="20 6 9 17 4 12"/>,
    trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>,
    fire: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3a1 1 0 0 1 .9-.7z"/>,
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>,
    chevronRight: <polyline points="9 18 15 12 9 6"/>,
    diamond: <path d="M6 3h12l4 6-10 13L2 9z"/>
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
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {content}
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
             handleCheckout(""); 
             setPendingCookNow(false);
        }
        const timer = setTimeout(() => {
             if(pendingCookNow) {
                 handleCheckout(""); 
                 setPendingCookNow(false);
             }
        }, 1000);
        return () => clearTimeout(timer);
    }
    prevCartLength.current = cart?.length || 0;
  }, [cart, pendingCookNow, handleCheckout]);


  if (loading && !isVerified) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-[#e2e8f0]">ACCESSING...</div>;

  const currentPriceObj = selectedProduct 
    ? calculatePrice(selectedProduct, variant) 
    : { final: 0 };

  // --- 📝 Robust Data Passing ---
  const handleAdd = (addToCartOnly = true) => {
    if (!selectedProduct) return;
    const finalNote = note ? note.trim() : ""; 
    const pricing = calculatePrice(selectedProduct, variant);
    
    const productToAdd = { 
        ...selectedProduct, 
        variant: variant, 
        note: finalNote,
        specialRequest: finalNote, 
        comment: finalNote,
        remark: finalNote,
        price: pricing.final,
        original_price: pricing.original_value || pricing.final + pricing.discount 
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
    const pricing = calculatePrice(selectedProduct, variant);
    
    const productToAdd = { 
        ...selectedProduct, 
        variant: variant, 
        note: finalNote,
        specialRequest: finalNote,
        comment: finalNote,
        remark: finalNote,
        price: pricing.final,
        original_price: pricing.original_value || pricing.final + pricing.discount 
    };
    
    for(let i=0; i<qty; i++) {
        handleAddToCart(productToAdd, variant, finalNote);
    }
    setPendingCookNow(true);
    setSelectedProduct(null);
  };

  const onCheckoutClick = () => {
      handleCheckout("");
      setShowConfirm(false);
  };

  // ✅ Fix: Function to stop click propagation
  const stopProp = (e: any) => {
      e.stopPropagation();
  };

  return (
    // Theme: Midnight Gold (Fixed Modal Bug)
    <div className="w-full max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden bg-[#0f172a] font-sans text-white">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Kanit:wght@300;400;500;600&display=swap');
            
            :root {
                --bg-dark: #0f172a;
                --bg-card: #1e293b;
                --gold: #fbbf24;
                --gold-light: #fcd34d;
                --text-main: #f8fafc;
                --text-muted: #94a3b8;
            }

            body {
                font-family: 'Kanit', sans-serif;
                background-color: var(--bg-dark);
                color: var(--text-main);
            }

            .font-lux { font-family: 'Cinzel', serif; }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            /* Luxury Glow */
            .gold-glow {
                box-shadow: 0 0 15px rgba(251, 191, 36, 0.2);
            }

            /* Animations */
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .animate-slide { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }

            .glass-dark {
                background: rgba(15, 23, 42, 0.8);
                backdrop-filter: blur(12px);
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .btn-gold {
                background: linear-gradient(135deg, #fbbf24, #d97706);
                color: #0f172a;
                font-weight: 600;
                transition: all 0.3s;
            }
            .btn-gold:active {
                transform: scale(0.98);
                filter: brightness(0.9);
            }
        `}} />

        {/* --- Header --- */}
        <header className="pt-10 pb-6 px-6 sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5">
             <div className="flex justify-between items-center">
                 <div>
                     <div className="flex items-center gap-2 mb-1">
                         <span className="w-1.5 h-1.5 bg-[#fbbf24] rotate-45"></span>
                         <p className="text-[#94a3b8] text-[10px] uppercase tracking-[0.2em] font-lux">Table {tableLabel}</p>
                     </div>
                     <h1 className="text-2xl font-bold tracking-wide text-[#f8fafc]">
                         {brand?.name || "The Midnight"}
                     </h1>
                 </div>
                 <div className="w-10 h-10 rounded-full border border-[#fbbf24]/30 flex items-center justify-center text-[#fbbf24]">
                     <Icon name="diamond" size={18} />
                 </div>
             </div>
        </header>

        <main className="px-6 pb-28 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-slide pt-6">
                    {banners?.length > 0 && (
                        <div className="relative w-full aspect-[16/9] bg-[#1e293b] rounded-sm overflow-hidden mb-10 shadow-2xl group">
                             <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent z-10"></div>
                             <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105" />
                             <div className="absolute bottom-4 left-4 z-20">
                                 <span className="text-[#fbbf24] text-xs font-lux tracking-widest uppercase block mb-1">Chef's Selection</span>
                                 <h2 className="text-xl font-light text-white">Exquisite Taste</h2>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
                         <h2 className="text-lg font-light text-[#e2e8f0] tracking-wide">Signature Dishes</h2>
                         <button onClick={() => setActiveTab('menu')} className="text-[#fbbf24] text-xs uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                             View All <Icon name="chevronRight" size={12} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="cursor-pointer group" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full aspect-[4/5] overflow-hidden bg-[#1e293b] mb-4 relative rounded-sm">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-[#fbbf24] text-[#0f172a] text-[10px] px-2 py-0.5 font-bold uppercase tracking-wide">
                                                Special
                                            </div>
                                         )}
                                     </div>
                                     <h3 className="font-light text-[#f1f5f9] text-sm mb-1 leading-snug tracking-wide">{p.name}</h3>
                                     <div className="flex items-center gap-3">
                                         <span className="text-[#fbbf24] font-medium text-base font-lux">{pricing.final}</span>
                                         {pricing.discount > 0 && <span className="text-[10px] text-[#64748b] line-through decoration-[#fbbf24]/50">{pricing.original}</span>}
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- MENU PAGE --- */}
            {activeTab === 'menu' && (
                <section className="animate-slide pt-4">
                    <div className="relative mb-8">
                         <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#fbbf24]" size={18} />
                         </div>
                         <input type="text" placeholder="Search menu..." className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-white/20 focus:border-[#fbbf24] outline-none text-sm text-white placeholder:text-[#475569] transition-colors rounded-none font-light" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`shrink-0 px-5 py-2 rounded-sm text-xs uppercase tracking-widest transition-all border
                                    ${selectedCategoryId === c.id 
                                        ? 'border-[#fbbf24] text-[#fbbf24] bg-[#fbbf24]/10' 
                                        : 'border-white/10 text-[#94a3b8] hover:border-white/30'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-6 pb-20">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="flex gap-5 cursor-pointer group" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-24 h-24 bg-[#1e293b] overflow-hidden shrink-0 rounded-sm">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                                     </div>
                                     <div className="flex-1 flex flex-col justify-center border-b border-white/5 pb-4">
                                         <div className="flex justify-between items-start mb-2">
                                             <h3 className="font-light text-[#f1f5f9] text-base">{p.name}</h3>
                                             <div className="flex flex-col items-end">
                                                 <span className="text-[#fbbf24] font-lux text-lg">{pricing.final}</span>
                                                 {pricing.discount > 0 && <span className="text-[10px] text-[#64748b] line-through">{pricing.original}</span>}
                                             </div>
                                         </div>
                                         <p className="text-[10px] text-[#64748b] line-clamp-2 font-light">Premium ingredients prepared to perfection.</p>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- STATUS PAGE --- */}
            {activeTab === 'status' && (
                <section className="animate-slide pt-6 pb-24">
                    <h2 className="text-xl font-lux text-[#f8fafc] mb-8 text-center uppercase tracking-[0.2em] border-b border-white/10 pb-4">Order History</h2>

                    <div className="space-y-8">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="relative pl-6 border-l border-white/10">
                                <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-[#0f172a] ${o.status === 'pending' ? 'bg-[#fbbf24]' : 'bg-[#10b981]'}`}></div>
                                
                                <div className="flex justify-between items-start mb-4">
                                     <div>
                                         <span className="text-[10px] text-[#fbbf24] uppercase tracking-widest block mb-1">Ticket #{o.id.slice(-4)}</span>
                                         <span className={`text-xs uppercase tracking-wide ${o.status === 'pending' ? 'text-[#94a3b8]' : 'text-[#10b981]'}`}>
                                             {o.status === 'pending' ? 'Preparing in kitchen' : 'Order Completed'}
                                         </span>
                                     </div>
                                </div>

                                <div className="bg-[#1e293b]/50 p-4 rounded-sm border border-white/5 space-y-3">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-[#cbd5e1] font-light">
                                            <div className="flex gap-3">
                                                <span className="text-[#fbbf24] w-6 font-lux">{i.quantity}x</span>
                                                <div className="flex flex-col">
                                                    <span>{i.product_name}</span>
                                                    {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-[#64748b] uppercase tracking-wider">{i.variant}</span>}
                                                    {/* 🔥 Added Note here */}
                                                    {i.note && <span className="text-[10px] text-[#94a3b8] italic mt-0.5">"{i.note}"</span>}
                                                </div>
                                            </div>
                                            <span className="font-lux">{i.price * i.quantity}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-2">
                                         <span className="text-[10px] text-[#94a3b8] uppercase tracking-widest">Total Amount</span>
                                         <span className="font-lux text-lg text-[#fbbf24]">
                                             {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                         </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-24 opacity-30">
                                <Icon name="clock" size={40} className="mx-auto mb-4" />
                                <p className="text-sm font-light text-[#94a3b8] tracking-widest uppercase">No active orders</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-0 left-0 w-full h-[85px] glass-dark flex justify-center items-center gap-10 z-[90] pb-4">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'home' ? 'text-[#fbbf24]' : 'text-[#64748b] hover:text-[#e2e8f0]'}`}>
                 <Icon name="home" size={20} strokeWidth={1} />
                 <span className="text-[8px] uppercase tracking-[0.2em]">Home</span>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'menu' ? 'text-[#fbbf24]' : 'text-[#64748b] hover:text-[#e2e8f0]'}`}>
                 <Icon name="menu" size={20} strokeWidth={1} />
                 <span className="text-[8px] uppercase tracking-[0.2em]">Menu</span>
             </button>

             <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center gap-2 transition-all relative ${activeTab === 'cart' ? 'text-[#fbbf24]' : 'text-[#64748b] hover:text-[#e2e8f0]'}`}>
                 <div className="relative">
                     <Icon name="basket" size={20} strokeWidth={1} />
                     {cart?.length > 0 && (
                         <span className="absolute -top-1.5 -right-2 bg-[#fbbf24] text-[#0f172a] text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                             {cart.length}
                         </span>
                     )}
                 </div>
                 <span className="text-[8px] uppercase tracking-[0.2em]">Cart</span>
             </button>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'status' ? 'text-[#fbbf24]' : 'text-[#64748b] hover:text-[#e2e8f0]'}`}>
                 <Icon name="clock" size={20} strokeWidth={1} />
                 <span className="text-[8px] uppercase tracking-[0.2em]">Status</span>
             </button>
        </nav>

        {/* --- 💎 ITEM DETAIL MODAL (Fixed Click-Through) --- */}
        {selectedProduct && (
            <div 
                className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center bg-black/80 backdrop-blur-sm animate-slide"
                onClick={() => setSelectedProduct(null)} // ✅ Click backdrop to close
            >
                {/* ❌ Removed inner absolute div to avoid conflict */}
                
                <div 
                    className="w-full sm:max-w-md bg-[#0f172a] shadow-2xl max-h-[90vh] flex flex-col border border-white/10 rounded-t-xl sm:rounded-xl overflow-hidden"
                    onClick={stopProp} // ✅ STOP PROPAGATION HERE: Clicking inside modal won't close it
                >
                    <div className="relative h-72 shrink-0">
                        <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent"></div>
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-[#fbbf24] transition-colors border border-white/10">
                            <Icon name="x" size={20} />
                        </button>
                        
                        <div className="absolute bottom-0 left-0 w-full p-8">
                            <h2 className="text-3xl font-light text-white mb-2 font-lux tracking-wide">{selectedProduct.name}</h2>
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-medium font-lux text-[#fbbf24]">{currentPriceObj.final}</span>
                                {currentPriceObj.discount > 0 && (
                                    <span className="text-sm text-[#94a3b8] line-through font-lux decoration-[#fbbf24] decoration-2">{currentPriceObj.original}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 pb-32 overflow-y-auto bg-[#0f172a] flex-1">
                        <div className="space-y-8">
                            {/* Variant Selector */}
                            <div>
                                <label className="block text-[10px] text-[#94a3b8] uppercase tracking-[0.2em] mb-4">Select Size</label>
                                <div className="flex flex-col gap-3">
                                    {[
                                        { key: 'normal', label: 'Standard', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'Large', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'Jumbo', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`w-full py-4 px-6 flex justify-between items-center border transition-all rounded-sm group
                                                ${variant === v.key 
                                                    ? 'border-[#fbbf24] bg-[#fbbf24]/5 text-[#fbbf24]' 
                                                    : 'border-white/10 text-[#cbd5e1] hover:border-white/30'}`}
                                        >
                                            <span className="text-sm uppercase tracking-wide">{v.label}</span>
                                            <span className="text-base font-lux">{v.final}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty & Note */}
                            <div>
                                <label className="block text-[10px] text-[#94a3b8] uppercase tracking-[0.2em] mb-4">Preferences</label>
                                <div className="flex gap-4 mb-4">
                                    <div className="flex items-center border border-white/10 h-12 w-36 rounded-sm">
                                        <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-full flex items-center justify-center hover:bg-white/5 text-white transition-colors"><Icon name="minus" size={14}/></button>
                                        <span className="flex-1 text-center font-lux text-lg text-[#fbbf24]">{qty}</span>
                                        <button onClick={() => setQty(qty+1)} className="w-12 h-full flex items-center justify-center hover:bg-white/5 text-white transition-colors"><Icon name="plus" size={14}/></button>
                                    </div>
                                    <div className="flex-1">
                                        <input 
                                            type="text" 
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Add notes..." 
                                            className="w-full h-12 px-4 border border-white/10 bg-transparent rounded-sm focus:border-[#fbbf24] outline-none text-sm text-white placeholder:text-[#475569] transition-colors font-light"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4 mt-12">
                            <button onClick={() => handleAdd(true)} className="py-4 border border-white/20 text-white text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition-colors rounded-sm">
                                Add to Cart
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-gold text-xs uppercase tracking-[0.2em] rounded-sm shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                                Order Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART DRAWER (Fixed Click-Through) --- */}
        {activeTab === 'cart' && (
             <div 
                className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-slide"
                onClick={() => setActiveTab('menu')} // ✅ Click backdrop to close
             >
                 <div 
                    className="w-full max-w-md bg-[#0f172a] border-t border-white/10 h-[90vh] flex flex-col relative shadow-2xl rounded-t-xl"
                    onClick={stopProp} // ✅ STOP PROPAGATION
                 >
                     <div className="px-8 pt-8 pb-4 border-b border-white/5 flex justify-between items-center bg-[#0f172a] z-10 rounded-t-xl">
                        <h2 className="text-xl font-light text-white font-lux tracking-wider">Your Selection</h2>
                        <button onClick={() => setActiveTab('menu')} className="text-[#94a3b8] hover:text-white"><Icon name="x" size={20}/></button>
                     </div>

                     <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 no-scrollbar">
                         {cart.map((item: any, idx: any) => {
                            const finalPriceTotal = item.price * item.quantity;
                            const originalPriceTotal = (item.original_price || item.price) * item.quantity;
                            const hasDiscount = originalPriceTotal > finalPriceTotal;

                             return (
                             <div key={idx} className="flex gap-5 border-b border-white/5 pb-6 last:border-0">
                                 <div className="w-20 h-20 bg-[#1e293b] shrink-0 rounded-sm overflow-hidden">
                                     <img src={item.image_url} className="w-full h-full object-cover opacity-80" />
                                 </div>
                                 <div className="flex-1">
                                     <div className="flex justify-between items-start mb-1">
                                         <div>
                                             <h3 className="font-light text-[#f1f5f9] text-sm tracking-wide">{item.name}</h3>
                                             <div className="text-[10px] text-[#64748b] mt-1 uppercase tracking-wider">
                                                 {item.variant !== 'normal' && <span className="mr-2 text-[#fbbf24]">{item.variant}</span>}
                                                 {item.note && <span className="italic">"{item.note}"</span>}
                                             </div>
                                         </div>
                                         <div className="text-right">
                                             {hasDiscount && <div className="text-[10px] text-[#64748b] line-through decoration-[#fbbf24]">{originalPriceTotal}</div>}
                                             <div className="font-lux text-[#fbbf24] text-lg">{finalPriceTotal}</div>
                                         </div>
                                     </div>
                                     
                                     <div className="flex items-center justify-between mt-3">
                                         <div className="flex items-center border border-white/10 h-7 w-20 rounded-sm">
                                            <button onClick={() => updateQuantity(idx, -1)} className="w-7 h-full flex items-center justify-center hover:bg-white/5 text-[#94a3b8] hover:text-white transition-colors"><Icon name="minus" size={10}/></button>
                                            <span className="flex-1 text-center text-xs font-lux text-white">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(idx, 1)} className="w-7 h-full flex items-center justify-center hover:bg-white/5 text-[#94a3b8] hover:text-white transition-colors"><Icon name="plus" size={10}/></button>
                                         </div>
                                         <button onClick={() => updateQuantity(idx, -100)} className="text-[#ef4444] text-[10px] uppercase tracking-widest hover:text-red-400">Remove</button>
                                     </div>
                                 </div>
                             </div>
                         )})}
                         {cart.length === 0 && (
                             <div className="text-center py-32 opacity-30">
                                 <p className="text-xs font-light uppercase tracking-[0.3em]">Selection is empty</p>
                             </div>
                         )}
                     </div>

                     <div className="p-8 bg-[#0f172a] border-t border-white/10">
                         <div className="flex justify-between items-center mb-8">
                             <span className="text-[#94a3b8] text-xs uppercase tracking-[0.2em]">Total</span>
                             <span className="text-3xl font-lux text-[#fbbf24] gold-glow">{cartTotal}</span>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} disabled={cart.length === 0} className="w-full py-4 btn-gold text-sm uppercase tracking-[0.2em] rounded-sm disabled:opacity-50 disabled:grayscale">
                             Confirm Order
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL (Fixed Click-Through) --- */}
        {showConfirm && (
            <div 
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-slide"
                onClick={() => setShowConfirm(false)} // ✅ Click backdrop to close
            >
                <div 
                    className="w-full max-w-sm bg-[#0f172a] p-10 text-center shadow-2xl border border-white/10 rounded-sm"
                    onClick={stopProp} // ✅ STOP PROPAGATION
                >
                    <div className="mb-8 flex justify-center text-[#fbbf24]">
                        <Icon name="check" size={40} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                             <h3 className="text-lg font-light text-white mb-2 font-lux tracking-wide">Direct Order</h3>
                             <p className="text-xs text-[#94a3b8] mb-10 leading-relaxed uppercase tracking-widest">Send "{selectedProduct.name}" to kitchen?</p>
                             <div className="flex flex-col gap-4">
                                 <button onClick={() => { performCookNow(); setShowConfirm(false); }} className="w-full py-4 btn-gold text-xs uppercase tracking-[0.2em] rounded-sm">Confirm</button>
                                 <button onClick={() => { handleAdd(true); setShowConfirm(false); }} className="w-full py-4 border border-white/10 text-[#94a3b8] text-xs uppercase tracking-[0.2em] hover:bg-white/5 rounded-sm transition-colors">Add to Cart</button>
                             </div>
                         </>
                    ) : (
                         <>
                             <h3 className="text-lg font-light text-white mb-2 font-lux tracking-wide">Confirm Selection</h3>
                             <p className="text-xs text-[#94a3b8] mb-10 leading-relaxed uppercase tracking-widest">Proceed with {cart.length} items?</p>
                             <div className="flex flex-col gap-4">
                                 <button onClick={() => { onCheckoutClick(); }} className="w-full py-4 btn-gold text-xs uppercase tracking-[0.2em] rounded-sm">Place Order</button>
                                 <button onClick={() => setShowConfirm(false)} className="w-full py-4 text-[#64748b] text-xs uppercase tracking-[0.2em] hover:text-white transition-colors">Cancel</button>
                             </div>
                         </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}