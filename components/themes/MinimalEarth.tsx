import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons (Minimal & Thin Style) ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // ต้องใส่ <>...</> ครอบถ้ามีหลาย Element
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
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
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
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {content}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center text-[#44403c] font-light text-xl tracking-widest">LOADING</div>;

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

  return (
    // Theme: Minimal Earth (Stone & Olive)
    <div className="w-full max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden bg-[#FAFAF9] font-sans text-[#1C1917]">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Sarabun:wght@300;400;500;600&display=swap');
            
            :root {
                --primary: #1C1917; /* stone-900 */
                --secondary: #57534E; /* stone-600 */
                --accent: #65a30d; /* lime-600 (Olive tone) */
                --bg-main: #FAFAF9; /* stone-50 */
                --card-bg: #FFFFFF;
                --border-color: #E7E5E4; /* stone-200 */
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg-main);
                -webkit-tap-highlight-color: transparent;
                color: var(--primary);
                letter-spacing: 0.02em;
            }

            .font-head { font-family: 'Outfit', sans-serif; }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            /* Minimal Animations */
            @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade { animation: fadeIn 0.5s ease-out forwards; }

            /* Components */
            .card-minimal {
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 0.75rem; /* rounded-xl */
                transition: all 0.2s;
            }
            .card-minimal:active {
                border-color: var(--secondary);
                background-color: #fafaf9;
            }

            .btn-black {
                background: var(--primary);
                color: white;
                border-radius: 0.5rem; /* rounded-lg */
                font-weight: 500;
                letter-spacing: 0.05em;
                transition: opacity 0.2s;
            }
            .btn-black:active { opacity: 0.8; }

            .btn-outline {
                background: transparent;
                border: 1px solid var(--primary);
                color: var(--primary);
                border-radius: 0.5rem;
                font-weight: 500;
            }
            .btn-outline:active { background: #f5f5f4; }

            .tab-active {
                background: var(--primary) !important;
                color: white !important;
                border-color: var(--primary) !important;
            }
            
            .tab-btn {
                transition: all 0.2s;
                background: transparent;
                color: var(--secondary);
                border: 1px solid var(--border-color);
                border-radius: 2rem;
                font-size: 0.875rem;
            }
        `}} />

        {/* --- Header (Clean & Minimal) --- */}
        <header className="bg-white/80 backdrop-blur-md pt-12 pb-6 px-6 sticky top-0 z-50 border-b border-[#E7E5E4]">
             <div className="flex justify-between items-center">
                 <div>
                     <p className="text-[#57534E] text-[10px] font-medium tracking-[0.2em] font-head uppercase mb-1">Table {tableLabel}</p>
                     <h1 className="text-2xl font-semibold tracking-tight text-[#1C1917] font-head">
                         {brand?.name || "The Minimalist"}
                     </h1>
                 </div>
                 <div className="w-10 h-10 border border-[#E7E5E4] rounded-full flex items-center justify-center text-[#1C1917]">
                     <Icon name="shop" size={18} />
                 </div>
             </div>
        </header>

        <main className="px-6 pb-24 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade pt-6">
                    {/* Minimal Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full aspect-[2/1] bg-[#E7E5E4] rounded-lg overflow-hidden mb-8">
                             <img 
                                src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                className="w-full h-full object-cover opacity-90" 
                             />
                             <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-medium tracking-wider uppercase text-[#1C1917]">
                                 Featured
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-6 border-b border-[#E7E5E4] pb-4">
                         <h2 className="text-lg font-medium text-[#1C1917]">Recommended</h2>
                         <button onClick={() => setActiveTab('menu')} className="text-[#57534E] text-xs flex items-center gap-1 hover:text-[#1C1917] transition-colors">
                             View All <Icon name="chevronRight" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="cursor-pointer group" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full aspect-square overflow-hidden bg-[#F5F5F4] mb-3 relative">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-0 right-0 bg-[#1C1917] text-white text-[10px] px-2 py-1">
                                                -{pricing.discount}
                                            </div>
                                         )}
                                     </div>
                                     <h3 className="font-medium text-[#1C1917] text-sm mb-1 leading-snug">{p.name}</h3>
                                     <div className="flex items-baseline gap-2">
                                         <span className="text-[#1C1917] font-medium text-base font-head">{pricing.final}</span>
                                         {pricing.discount > 0 && (
                                             <span className="text-[10px] text-[#A8A29E] line-through font-head">
                                                 {pricing.original}
                                             </span>
                                         )}
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- MENU PAGE --- */}
            {activeTab === 'menu' && (
                <section className="animate-fade pt-6">
                    {/* Minimal Search */}
                    <div className="relative mb-8">
                         <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#A8A29E]" size={18} />
                         </div>
                         <input type="text" placeholder="Search for dishes..." className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-[#E7E5E4] focus:border-[#1C1917] outline-none text-sm text-[#1C1917] placeholder-[#A8A29E] transition-colors rounded-none" />
                    </div>

                    {/* Pill Filters */}
                    <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`shrink-0 px-4 py-2 rounded-full text-xs transition-all
                                    ${selectedCategoryId === c.id ? 'bg-[#1C1917] text-white' : 'bg-transparent border border-[#E7E5E4] text-[#57534E]'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4 pb-20">
                        {filteredProducts?.map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="flex gap-4 cursor-pointer py-2 border-b border-[#f5f5f4] last:border-0" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-24 h-24 bg-[#F5F5F4] overflow-hidden shrink-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover opacity-90" />
                                     </div>
                                     <div className="flex-1 flex flex-col justify-center">
                                         <h3 className="font-medium text-[#1C1917] text-sm mb-1">{p.name}</h3>
                                         {/* <p className="text-[10px] text-[#A8A29E] line-clamp-2 mb-2">Description goes here if available...</p> */}
                                         <div className="flex items-center gap-2 mt-1">
                                             <span className="text-[#1C1917] font-medium font-head">{pricing.final}.-</span>
                                             {pricing.discount > 0 && <span className="text-xs text-[#A8A29E] line-through font-head">{pricing.original}</span>}
                                         </div>
                                     </div>
                                     <div className="flex items-center">
                                         <div className="w-8 h-8 rounded-full border border-[#E7E5E4] flex items-center justify-center text-[#1C1917] hover:bg-[#1C1917] hover:text-white transition-colors">
                                             <Icon name="plus" size={14} />
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
                <section className="animate-fade pt-6 pb-24">
                    <h2 className="text-xl font-light text-[#1C1917] mb-6 font-head tracking-wide">Order Status</h2>

                    <div className="space-y-6">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="border border-[#E7E5E4] p-6 bg-white">
                                <div className="flex justify-between items-start mb-6">
                                     <div>
                                         <span className="text-[10px] text-[#A8A29E] uppercase tracking-widest block mb-1">Ticket ID</span>
                                         <span className="text-sm font-medium text-[#1C1917]">#{o.id.slice(-4)}</span>
                                     </div>
                                     <div className={`px-3 py-1 text-[10px] uppercase tracking-widest border
                                        ${o.status === 'pending' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-emerald-200 text-emerald-700 bg-emerald-50'}`}>
                                         {o.status === 'pending' ? 'Cooking' : 'Served'}
                                     </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {o.order_items.map((i, idx) => (
                                        <div key={idx} className="flex justify-between text-sm text-[#57534E]">
                                            <div className="flex gap-3">
                                                <span className="text-[#1C1917] w-6">{i.quantity}x</span>
                                                <div className="flex flex-col">
                                                    <span>{i.product_name}</span>
                                                    {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-[#A8A29E] uppercase mt-0.5">{i.variant}</span>}
                                                </div>
                                            </div>
                                            <span className="font-head">{i.price * i.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-[#E7E5E4]">
                                     <span className="text-xs text-[#1C1917] uppercase tracking-widest">Total</span>
                                     <span className="font-medium text-lg text-[#1C1917] font-head">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-24 opacity-40">
                                <p className="text-sm font-light text-[#57534E]">No active orders</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Minimal Bar) --- */}
        <nav className="fixed bottom-0 left-0 w-full h-[80px] bg-white border-t border-[#E7E5E4] flex justify-center items-center gap-12 z-[90] pb-2">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'home' ? 'text-[#1C1917]' : 'text-[#A8A29E]'}`}>
                 <Icon name="home" size={22} strokeWidth={activeTab === 'home' ? 1.5 : 1} />
                 <span className="text-[9px] uppercase tracking-widest">Home</span>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'menu' ? 'text-[#1C1917]' : 'text-[#A8A29E]'}`}>
                 <Icon name="menu" size={22} strokeWidth={activeTab === 'menu' ? 1.5 : 1} />
                 <span className="text-[9px] uppercase tracking-widest">Menu</span>
             </button>

             <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center gap-1.5 transition-colors relative ${activeTab === 'cart' ? 'text-[#1C1917]' : 'text-[#A8A29E]'}`}>
                 <div className="relative">
                     <Icon name="basket" size={22} strokeWidth={activeTab === 'cart' ? 1.5 : 1} />
                     {cart?.length > 0 && (
                         <span className="absolute -top-1 -right-2 bg-[#1C1917] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
                             {cart.length}
                         </span>
                     )}
                 </div>
                 <span className="text-[9px] uppercase tracking-widest">Cart</span>
             </button>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'status' ? 'text-[#1C1917]' : 'text-[#A8A29E]'}`}>
                 <Icon name="clock" size={22} strokeWidth={activeTab === 'status' ? 1.5 : 1} />
                 <span className="text-[9px] uppercase tracking-widest">Status</span>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Clean Side/Bottom) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#1C1917]/20 backdrop-blur-sm animate-fade">
                <div onClick={() => setSelectedProduct(null)} className="absolute inset-0"></div>
                
                <div className="w-full max-w-md bg-white shadow-2xl max-h-[90vh] flex flex-col animate-fade">
                    {/* Minimal Close */}
                    <div className="absolute top-4 right-4 z-20">
                        <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-[#1C1917] hover:bg-black hover:text-white transition-colors">
                            <Icon name="x" size={18} />
                        </button>
                    </div>

                    <div className="relative h-64 shrink-0 bg-[#F5F5F4]">
                        <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                    </div>

                    <div className="p-8 pb-32 overflow-y-auto bg-white flex-1">
                        <div className="mb-8">
                            <h2 className="text-2xl font-light text-[#1C1917] mb-2 font-head">{selectedProduct.name}</h2>
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-medium font-head text-[#1C1917]">{currentPriceObj.final}</span>
                                {currentPriceObj.discount > 0 && (
                                    <>
                                        <span className="text-sm text-[#A8A29E] line-through font-head">{currentPriceObj.original}</span>
                                        <span className="text-[10px] text-white bg-[#1C1917] px-2 py-0.5">SAVE {currentPriceObj.discount}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Variant Selector */}
                            <div>
                                <label className="block text-[10px] text-[#A8A29E] uppercase tracking-widest mb-3">Size Selection</label>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { key: 'normal', label: 'Regular', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'Large', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'Jumbo', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`w-full py-3 px-4 flex justify-between items-center border transition-all
                                                ${variant === v.key 
                                                    ? 'border-[#1C1917] bg-[#FAFAF9]' 
                                                    : 'border-[#E7E5E4] text-[#57534E]'}`}
                                        >
                                            <span className="text-sm">{v.label}</span>
                                            <div className="flex items-center gap-2">
                                                {v.discount > 0 && <span className="text-xs text-[#A8A29E] line-through">{v.original}</span>}
                                                <span className="text-sm font-medium font-head">{v.final}</span>
                                                {variant === v.key && <Icon name="check" size={14} />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty & Note */}
                            <div>
                                <label className="block text-[10px] text-[#A8A29E] uppercase tracking-widest mb-3">Customization</label>
                                <div className="flex gap-4 mb-4">
                                    <div className="flex items-center border border-[#E7E5E4] h-12 w-32">
                                        <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-full flex items-center justify-center hover:bg-[#F5F5F4]"><Icon name="minus" size={14}/></button>
                                        <span className="flex-1 text-center font-medium font-head">{qty}</span>
                                        <button onClick={() => setQty(qty+1)} className="w-10 h-full flex items-center justify-center hover:bg-[#F5F5F4]"><Icon name="plus" size={14}/></button>
                                    </div>
                                    <div className="flex-1">
                                        <input 
                                            type="text" 
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Add a note..." 
                                            className="w-full h-12 px-4 border border-[#E7E5E4] focus:border-[#1C1917] outline-none text-sm transition-colors bg-transparent placeholder-[#D6D3D1]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4 mt-12">
                            <button onClick={() => handleAdd(true)} className="py-4 border border-[#1C1917] text-[#1C1917] text-sm uppercase tracking-widest font-medium hover:bg-[#FAFAF9] transition-colors">
                                Add to Cart
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 bg-[#1C1917] text-white text-sm uppercase tracking-widest font-medium hover:opacity-90 transition-opacity">
                                Order Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART DRAWER (Minimal) --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#1C1917]/20 backdrop-blur-sm animate-fade">
                 <div className="w-full max-w-md bg-white h-[90vh] flex flex-col relative shadow-2xl">
                     <div className="px-8 pt-8 pb-4 border-b border-[#F5F5F4] flex justify-between items-center">
                        <h2 className="text-xl font-light text-[#1C1917] font-head">Your Order</h2>
                        <button onClick={() => setActiveTab('menu')} className="text-[#A8A29E] hover:text-[#1C1917]"><Icon name="x" size={20}/></button>
                     </div>

                     <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 no-scrollbar">
                         {cart.map((item, idx) => {
                            const finalPriceTotal = item.price * item.quantity;
                            const originalPriceTotal = (item.original_price || item.price) * item.quantity;
                            const hasDiscount = originalPriceTotal > finalPriceTotal;

                             return (
                             <div key={idx} className="flex gap-4">
                                 <div className="w-16 h-16 bg-[#F5F5F4] shrink-0">
                                     <img src={item.image_url} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1">
                                     <div className="flex justify-between items-start">
                                         <div>
                                             <h3 className="font-medium text-[#1C1917] text-sm">{item.name}</h3>
                                             <div className="text-xs text-[#A8A29E] mt-1">
                                                 {item.variant !== 'normal' && <span className="uppercase mr-2">{item.variant}</span>}
                                                 {item.note && <span className="italic">"{item.note}"</span>}
                                             </div>
                                         </div>
                                         <div className="text-right">
                                             {hasDiscount && <div className="text-[10px] text-[#A8A29E] line-through">{originalPriceTotal}</div>}
                                             <div className="font-medium font-head">{finalPriceTotal}</div>
                                         </div>
                                     </div>
                                     
                                     <div className="flex items-center gap-4 mt-3">
                                         <div className="flex items-center border border-[#E7E5E4] h-7">
                                            <button onClick={() => updateQuantity(idx, -1)} className="w-7 h-full flex items-center justify-center hover:bg-[#F5F5F4] text-[#A8A29E] hover:text-[#1C1917]"><Icon name="minus" size={10}/></button>
                                            <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(idx, 1)} className="w-7 h-full flex items-center justify-center hover:bg-[#F5F5F4] text-[#A8A29E] hover:text-[#1C1917]"><Icon name="plus" size={10}/></button>
                                         </div>
                                         <button onClick={() => updateQuantity(idx, -100)} className="text-[#A8A29E] hover:text-[#ef4444] text-[10px] uppercase tracking-wider underline">Remove</button>
                                     </div>
                                 </div>
                             </div>
                         )})}
                         {cart.length === 0 && (
                             <div className="text-center py-20 opacity-40">
                                 <p className="text-sm font-light">Your cart is empty.</p>
                             </div>
                         )}
                     </div>

                     <div className="p-8 bg-[#FAFAF9] border-t border-[#E7E5E4]">
                         <div className="flex justify-between items-center mb-6">
                             <span className="text-[#57534E] text-sm uppercase tracking-widest">Total</span>
                             <span className="text-3xl font-light text-[#1C1917] font-head">{cartTotal}</span>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} disabled={cart.length === 0} className="w-full py-4 bg-[#1C1917] text-white text-sm uppercase tracking-widest font-medium disabled:opacity-50 hover:opacity-90 transition-opacity">
                             Confirm Order
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL (Minimal) --- */}
        {showConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1C1917]/40 backdrop-blur-sm p-6 animate-fade">
                <div className="w-full max-w-sm bg-white p-8 text-center shadow-xl border border-[#E7E5E4]">
                    <div className="mb-6 flex justify-center text-[#1C1917]">
                        <Icon name="check" size={32} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                             <h3 className="text-lg font-medium text-[#1C1917] mb-2 font-head">Instant Order</h3>
                             <p className="text-sm text-[#57534E] mb-8 leading-relaxed">Send "{selectedProduct.name}" to the kitchen immediately?</p>
                             <div className="flex flex-col gap-3">
                                 <button onClick={() => { performCookNow(); setShowConfirm(false); }} className="w-full py-3 bg-[#1C1917] text-white text-sm uppercase tracking-widest">Confirm</button>
                                 <button onClick={() => { handleAdd(true); setShowConfirm(false); }} className="w-full py-3 border border-[#E7E5E4] text-[#57534E] text-sm uppercase tracking-widest hover:bg-[#FAFAF9]">Add to Cart</button>
                             </div>
                         </>
                    ) : (
                         <>
                             <h3 className="text-lg font-medium text-[#1C1917] mb-2 font-head">Confirm Order</h3>
                             <p className="text-sm text-[#57534E] mb-8 leading-relaxed">You are about to order {cart.length} items.</p>
                             <div className="flex flex-col gap-3">
                                 <button onClick={() => { onCheckoutClick(); }} className="w-full py-3 bg-[#1C1917] text-white text-sm uppercase tracking-widest">Place Order</button>
                                 <button onClick={() => setShowConfirm(false)} className="w-full py-3 text-[#A8A29E] text-sm uppercase tracking-widest hover:text-[#1C1917]">Cancel</button>
                             </div>
                         </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}