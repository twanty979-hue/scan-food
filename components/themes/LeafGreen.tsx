import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons (Friendly Rounded Style - Green Theme) ---
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
    // ✅ FIXED: Wrapped in Fragment
    leaf: (
      <>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.48 10-10 10Z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </>
    )
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center text-[#166534] font-bold text-xl">Loading Freshness...</div>;

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
    // Theme: Fresh Garden (Nature & Vibrant Green)
    <div className="w-full max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden bg-[#f0fdf4] font-sans text-[#14532d]">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Sarabun:wght@300;400;500;600&display=swap');
            
            :root {
                --primary-green: #16a34a; /* green-600 */
                --primary-dark: #14532d; /* green-900 */
                --secondary-green: #dcfce7; /* green-100 */
                --accent-lime: #84cc16; /* lime-500 */
                --bg-page: #f0fdf4; /* green-50 */
                --text-main: #14532d;
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg-page);
                -webkit-tap-highlight-color: transparent;
                color: var(--text-main);
            }

            .font-friendly { font-family: 'Nunito', sans-serif; }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            /* Animations */
            @keyframes popIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
            .animate-pop { animation: popIn 0.3s ease-out forwards; }

            /* Components */
            .card-fresh {
                background: white;
                border-radius: 1.5rem;
                box-shadow: 0 4px 15px -3px rgba(22, 163, 74, 0.15);
                border: 1px solid #ecfdf5;
                transition: all 0.2s;
            }
            .card-fresh:active { transform: scale(0.98); border-color: var(--primary-green); }

            .btn-green {
                background: linear-gradient(135deg, var(--primary-green), #059669);
                color: white;
                box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
                border-radius: 1rem;
                font-weight: 700;
                transition: all 0.2s;
                font-family: 'Nunito', sans-serif;
            }
            .btn-green:active { transform: translateY(2px); box-shadow: 0 2px 6px rgba(22, 163, 74, 0.2); }

            .chip-active {
                background: var(--primary-green);
                color: white;
                box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3);
            }
            .chip-inactive {
                background: white;
                color: var(--primary-green);
                border: 1px solid var(--secondary-green);
            }
        `}} />

        {/* --- Header (Fresh Green Gradient) --- */}
        <header className="bg-gradient-to-b from-green-600 to-green-500 text-white pt-10 pb-20 px-6 rounded-b-[3rem] relative shadow-lg z-10 overflow-hidden">
             {/* Subtle Leaf Pattern Overlay */}
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/axiom-pattern.png')]"></div>
             
             <div className="flex justify-between items-center relative z-10">
                 <div>
                     <div className="flex items-center gap-2 mb-1 opacity-90">
                         <div className="w-2 h-2 bg-lime-300 rounded-full animate-pulse"></div>
                         <p className="text-xs font-bold uppercase tracking-wide font-friendly">Table {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm font-friendly">
                         {brand?.name || "Fresh Garden Cafe"}
                     </h1>
                 </div>
                 <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white shadow-sm">
                     <Icon name="leaf" size={22} />
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-14 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-pop">
                    {/* Banner Slider */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[2rem] overflow-hidden shadow-md mb-8 group border-4 border-white">
                             <img 
                                src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                             />
                             <div className="absolute top-4 left-4 bg-lime-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 font-friendly">
                                 <Icon name="star" size={12} className="fill-current" /> เมนูแนะนำ
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-1">
                         <div>
                             <h2 className="text-xl font-extrabold text-green-800 font-friendly">สดชื่นต้องลอง! 🥗</h2>
                             <p className="text-sm text-green-600 font-medium">คัดสรรความสดใหม่เพื่อคุณ</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="text-green-600 text-sm font-bold flex items-center gap-1 bg-green-100 px-3 py-1.5 rounded-full hover:bg-green-200 transition-colors font-friendly">
                             ดูทั้งหมด <Icon name="chevronRight" size={16} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-28">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="card-fresh p-3 pb-4 cursor-pointer relative group h-full flex flex-col" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full aspect-square overflow-hidden relative rounded-2xl bg-green-50 mb-3 shadow-inner">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-lime-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm font-friendly">
                                                ลดพิเศษ
                                            </div>
                                         )}
                                     </div>
                                     <h3 className="font-bold text-green-800 text-sm line-clamp-2 mb-auto leading-tight font-friendly">{p.name}</h3>
                                     
                                     <div className="flex justify-between items-end mt-3">
                                         <div className="flex flex-col">
                                             {pricing.discount > 0 && (
                                                 <span className="text-[10px] text-green-400 line-through font-medium">
                                                     {pricing.original}
                                                 </span>
                                             )}
                                             <span className="text-green-700 font-extrabold text-lg leading-none font-friendly">
                                                 {pricing.final}.-
                                             </span>
                                         </div>
                                         <button className="w-9 h-9 bg-green-100 text-green-600 flex items-center justify-center rounded-full hover:bg-green-600 hover:text-white transition-all shadow-sm">
                                             <Icon name="plus" size={18} strokeWidth={2.5} />
                                         </button>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- MENU PAGE --- */}
            {activeTab === 'menu' && (
                <section className="animate-pop pt-4">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-green-400" size={20} />
                         </div>
                         <input type="text" placeholder="ค้นหาความสดชื่น..." className="w-full pl-12 pr-6 py-4 rounded-full bg-white shadow-sm border border-green-100 focus:ring-2 focus:ring-green-200 focus:border-green-400 focus:outline-none text-sm font-medium placeholder:text-green-300 text-green-800 font-friendly" />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm font-friendly
                                    ${selectedCategoryId === c.id ? 'chip-active' : 'chip-inactive'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-28">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="card-fresh p-3 pb-4 cursor-pointer relative group h-full flex flex-col" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full aspect-square overflow-hidden relative rounded-2xl bg-green-50 mb-3 shadow-inner">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                     </div>
                                     <h3 className="font-bold text-green-800 text-sm line-clamp-2 mb-auto leading-tight font-friendly">{p.name}</h3>
                                     
                                     <div className="flex justify-between items-end mt-3">
                                         <div className="flex flex-col">
                                             {pricing.discount > 0 && <span className="text-[10px] text-green-400 line-through font-medium">{pricing.original}</span>}
                                             <span className="text-green-700 font-extrabold text-lg leading-none font-friendly">{pricing.final}.-</span>
                                         </div>
                                         <button className="w-9 h-9 bg-green-100 text-green-600 flex items-center justify-center rounded-full hover:bg-green-600 hover:text-white transition-all shadow-sm">
                                             <Icon name="plus" size={18} strokeWidth={2.5} />
                                         </button>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- STATUS PAGE --- */}
            {activeTab === 'status' && (
                <section className="animate-pop pt-4 pb-28">
                    <div className="mb-6 flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-green-100">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <Icon name="leaf" size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-green-800 font-friendly">สถานะความอร่อย</h2>
                            <p className="text-xs text-green-600 font-medium">สดใหม่จากครัว กำลังเดินทางมา</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="card-fresh p-5 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-green-500 font-bold tracking-wider font-friendly">
                                         ORDER #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-3 py-1 text-[10px] font-bold rounded-full border flex items-center gap-1.5 font-friendly
                                        ${o.status === 'pending' ? 'bg-lime-50 text-lime-700 border-lime-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                         {o.status === 'pending' && <span className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-pulse"></span>}
                                         {o.status === 'pending' ? 'กำลังปรุงสด' : 'เสิร์ฟแล้วจ้า'}
                                     </span>
                                </div>

                                <div className="space-y-3 relative z-10 border-t border-dashed border-green-100 pt-3">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-green-800 font-medium">
                                            <div className="flex items-start gap-2">
                                                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0 font-friendly">{i.quantity}</div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold font-friendly">{i.product_name}</span>
                                                    {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-green-500 font-medium">{i.variant}</span>}
                                                    {/* 🔥 Added Note here */}
                                                    {i.note && <span className="text-[10px] text-green-500 italic mt-0.5">"{i.note}"</span>}
                                                </div>
                                            </div>
                                            <span className="font-bold font-friendly">{i.price * i.quantity}.-</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-3 mt-3 border-t border-green-100">
                                     <span className="font-bold text-green-500 text-xs font-friendly">ยอดรวมสุทธิ</span>
                                     <span className="font-extrabold text-green-700 text-xl font-friendly">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-16 opacity-60">
                                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-green-300 border-2 border-dashed border-green-200">
                                    <Icon name="basket" size={32} />
                                </div>
                                <p className="text-green-600 font-medium font-friendly">ยังไม่มีรายการสั่งซื้อ</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Soft Green Bubble) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[70px] bg-white rounded-full shadow-[0_8px_30px_rgba(22,163,74,0.15)] flex justify-around items-center px-2 z-[90] border border-green-50">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all w-16 ${activeTab === 'home' ? 'text-green-600' : 'text-green-300'}`}>
                 <Icon name="home" size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all w-16 ${activeTab === 'menu' ? 'text-green-600' : 'text-green-300'}`}>
                 <Icon name="menu" size={24} strokeWidth={activeTab === 'menu' ? 2.5 : 2} />
             </button>

             {/* Main Cart Button */}
             <div className="relative -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-[0_4px_15px_rgba(22,163,74,0.4)] flex items-center justify-center text-white active:scale-95 transition-transform border-4 border-[#f0fdf4]">
                     <Icon name="basket" size={26} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-lime-400 text-green-900 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm font-friendly">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all w-16 ${activeTab === 'status' ? 'text-green-600' : 'text-green-300'}`}>
                 <Icon name="clock" size={24} strokeWidth={activeTab === 'status' ? 2.5 : 2} />
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Fixed Click-Through) --- */}
        {selectedProduct && (
            <div 
                className="fixed inset-0 z-[100] flex items-end justify-center bg-green-900/40 backdrop-blur-sm animate-pop"
                onClick={() => setSelectedProduct(null)} // ✅ Close on backdrop click
            >
                <div 
                    className="w-full max-w-md bg-white rounded-t-[2.5rem] shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
                    onClick={stopProp} // ✅ Prevent close on content click
                >
                    <div className="relative h-72 shrink-0 bg-green-50">
                        <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent"></div>
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-green-600 transition-colors border border-white/40">
                            <Icon name="x" size={20} />
                        </button>
                        
                        <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                            <h2 className="text-2xl font-extrabold mb-1 leading-tight font-friendly">{selectedProduct.name}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                {currentPriceObj.discount > 0 && (
                                    <span className="text-sm text-white/80 line-through font-medium">
                                        {currentPriceObj.original}
                                    </span>
                                )}
                                <span className="text-4xl font-extrabold text-lime-300 drop-shadow-sm font-friendly">{currentPriceObj.final}.-</span>
                                {currentPriceObj.discount > 0 && (
                                    <span className="bg-lime-500 text-white text-[10px] px-2.5 py-1 rounded-full font-bold ml-2 font-friendly animate-pulse">
                                        ลด {currentPriceObj.discount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 pb-32 overflow-y-auto bg-white rounded-t-[2rem] -mt-6 relative z-10">
                        <div className="space-y-6">
                            {/* Variant Selector */}
                            <div>
                                <label className="block text-sm font-bold text-green-600 mb-3 font-friendly">เลือกขนาดความสดชื่น</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { key: 'normal', label: 'ปกติ', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'พิเศษ', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'จัมโบ้', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 relative font-friendly
                                                ${variant === v.key 
                                                    ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' 
                                                    : 'border-green-100 text-green-400 hover:bg-green-50 hover:border-green-200'}`}
                                        >
                                            <span className="text-sm font-bold">{v.label}</span>
                                            <span className="text-lg font-extrabold">{v.final}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                                <span className="text-sm font-bold text-green-700 font-friendly">จำนวน</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-9 h-9 bg-white text-green-600 rounded-full flex items-center justify-center shadow-sm active:scale-95 border border-green-100 hover:bg-green-100"><Icon name="minus" size={18}/></button>
                                    <span className="text-xl font-extrabold w-8 text-center text-green-800 font-friendly">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-9 h-9 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 hover:bg-green-700"><Icon name="plus" size={18}/></button>
                                </div>
                            </div>

                            {/* Note Input */}
                            <div>
                                <label className="block text-sm font-bold text-green-600 mb-2 font-friendly">โน๊ตเพิ่มเติมถึงครัว</label>
                                <div className="relative">
                                    <textarea 
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="เช่น ไม่ใส่ผักชี, เผ็ดน้อย..." 
                                        className="w-full p-4 pl-11 bg-white border-2 border-green-100 rounded-2xl focus:border-green-500 focus:ring-0 focus:outline-none h-24 resize-none text-sm text-green-800 placeholder:text-green-300 font-medium transition-colors"
                                    />
                                    <div className="absolute top-4 left-4 text-green-400">
                                        <Icon name="pencil" size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4 mt-8 font-friendly">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border-2 border-green-600 text-green-600 font-bold rounded-2xl active:scale-95 transition-all hover:bg-green-50">
                                ใส่ตะกร้าไว้ก่อน
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-green font-bold rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                                สั่งเลยทันที <Icon name="fire" size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART DRAWER (Fixed Click-Through) --- */}
        {activeTab === 'cart' && (
             <div 
                className="fixed inset-0 z-[100] flex items-end justify-center bg-green-900/40 backdrop-blur-sm animate-pop"
                onClick={() => setActiveTab('menu')} // ✅ Close on backdrop click
             >
                 <div 
                    className="w-full max-w-md bg-white rounded-t-[2.5rem] shadow-2xl h-[85vh] flex flex-col relative"
                    onClick={stopProp} // ✅ Prevent close on content click
                 >
                     {/* Handle */}
                     <div onClick={() => setActiveTab('menu')} className="w-full py-4 flex justify-center cursor-pointer hover:bg-green-50 rounded-t-[2.5rem] group">
                         <div className="w-12 h-1.5 bg-green-200 rounded-full group-hover:bg-green-300 transition-colors"></div>
                     </div>

                     <div className="px-8 mb-4">
                        <h2 className="text-2xl font-extrabold text-green-800 font-friendly">ตะกร้าความสดชื่น</h2>
                        <p className="text-sm text-green-500 font-medium">{cart.length} รายการพร้อมเสิร์ฟ</p>
                     </div>

                     <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 no-scrollbar">
                         {cart.map((item: any, idx: any) => {
                            const finalPriceTotal = item.price * item.quantity;
                            const originalPriceTotal = (item.original_price || item.price) * item.quantity;
                            const hasDiscount = originalPriceTotal > finalPriceTotal;

                             return (
                             <div key={idx} className="flex gap-4 p-3 card-fresh shadow-sm border-0 bg-green-50/50">
                                 <div className="w-20 h-20 bg-white rounded-xl overflow-hidden shrink-0 shadow-sm border border-green-100">
                                     <img src={item.image_url} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1">
                                     <h3 className="font-bold text-green-800 text-sm line-clamp-1 font-friendly">{item.name}</h3>
                                     <div className="text-xs text-green-500 mt-1 flex flex-wrap gap-1 font-medium">
                                         {item.variant !== 'normal' && <span className="bg-white px-2 py-0.5 rounded-full border border-green-200 text-green-600">{item.variant}</span>}
                                         {item.note && (
                                             <span className="italic flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-green-200">
                                                 <Icon name="pencil" size={10} /> "{item.note}"
                                             </span>
                                         )}
                                     </div>
                                     
                                     <div className="flex justify-between items-end mt-2">
                                        <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-full border border-green-100">
                                            <button onClick={() => updateQuantity(idx, -1)} className="text-green-400 hover:text-red-500 transition-colors"><Icon name="minus" size={16}/></button>
                                            <span className="text-sm font-extrabold text-green-700 font-friendly w-6 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(idx, 1)} className="text-green-400 hover:text-green-600 transition-colors"><Icon name="plus" size={16}/></button>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {hasDiscount && (
                                                <span className="text-xs text-green-400 line-through font-medium">{originalPriceTotal}</span>
                                            )}
                                            <span className="font-extrabold text-green-700 text-lg leading-none font-friendly">{finalPriceTotal}.-</span>
                                        </div>
                                     </div>
                                 </div>
                                 <button onClick={() => updateQuantity(idx, -100)} className="absolute top-2 right-2 text-green-300 hover:text-red-500 transition-colors bg-white rounded-full p-1">
                                     <Icon name="trash" size={16} />
                                 </button>
                             </div>
                         )})}
                         {cart.length === 0 && (
                             <div className="text-center py-20 opacity-50">
                                 <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center text-green-300 border-2 border-dashed border-green-200">
                                     <Icon name="basket" size={40} />
                                 </div>
                                 <p className="text-green-600 font-medium font-friendly">ตะกร้ายังว่างอยู่เลย</p>
                             </div>
                         )}
                     </div>

                     <div className="p-6 bg-white border-t border-green-100 rounded-t-[2rem] shadow-[0_-4px_20px_rgba(22,163,74,0.05)]">
                         <div className="flex justify-between items-center mb-6 font-friendly">
                             <span className="text-green-600 font-bold text-lg">ยอดรวมสุทธิ</span>
                             <span className="text-3xl font-extrabold text-green-700">{cartTotal}.-</span>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} disabled={cart.length === 0} className="w-full py-4 btn-green text-white font-bold text-lg active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg font-friendly">
                             <Icon name="check" size={22} /> ยืนยันออเดอร์
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL (Fixed Click-Through) --- */}
        {showConfirm && (
            <div 
                className="fixed inset-0 z-[200] flex items-center justify-center bg-green-900/60 backdrop-blur-sm p-6 animate-pop"
                onClick={() => setShowConfirm(false)} // ✅ Close on backdrop click
            >
                <div 
                    className="w-full max-w-sm bg-white rounded-[2rem] p-8 text-center shadow-2xl relative border-4 border-green-50"
                    onClick={stopProp} // ✅ Prevent close on content click
                >
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white animate-bounce">
                        <Icon name="check" size={48} strokeWidth={3} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                             <h3 className="text-xl font-extrabold text-green-800 mb-2 font-friendly">สั่งเลยไหมครับ?</h3>
                             <p className="text-green-600 mb-8 text-sm font-medium">เพิ่ม "{selectedProduct.name}" เข้าครัวทันที</p>
                             <div className="flex flex-col gap-3 font-friendly">
                                 <button onClick={() => { performCookNow(); setShowConfirm(false); }} className="w-full py-4 btn-green text-white font-bold rounded-xl shadow-lg hover:shadow-xl">ยืนยัน สั่งเลย!</button>
                                 <button onClick={() => { handleAdd(true); setShowConfirm(false); }} className="w-full py-4 bg-white border-2 border-green-200 text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors">ใส่ตะกร้าไว้ก่อน</button>
                             </div>
                         </>
                    ) : (
                         <>
                             <h3 className="text-xl font-extrabold text-green-800 mb-2 font-friendly">ยืนยันการสั่งซื้อ</h3>
                             <p className="text-green-600 mb-8 text-sm font-medium">ส่งรายการอาหาร {cart.length} อย่าง เข้าครัวเลยนะครับ?</p>
                             <div className="flex flex-col gap-3 font-friendly">
                                 <button onClick={() => { onCheckoutClick(); }} className="w-full py-4 btn-green text-white font-bold rounded-xl shadow-lg hover:shadow-xl">ยืนยันการสั่ง</button>
                                 <button onClick={() => setShowConfirm(false)} className="w-full py-4 text-green-400 font-bold text-sm hover:text-green-600 transition-colors">ยกเลิก</button>
                             </div>
                         </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}