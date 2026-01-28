import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Standard Modern Icons (Fixed Syntax) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    search: (
      <>
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </>
    ),
    // Basket: Single path, no wrapper needed
    basket: <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0"/>,
    clock: (
      <>
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </>
    ),
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    // Plus: Multiple lines, MUST wrap
    plus: (
      <>
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </>
    ),
    // Minus: Single line, OK
    minus: <line x1="5" y1="12" x2="19" y2="12"/>,
    // X: Multiple lines, MUST wrap
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
    // Shop: Multiple elements, MUST wrap
    shop: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
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


  if (loading && !isVerified) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-blue-800 font-medium">Loading...</div>;

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
    // Theme: Modern Professional Blue
    <div className="w-full max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden bg-slate-50 font-sans text-slate-800">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap');
            
            :root {
                --primary-blue: #0284c7; /* sky-600 */
                --primary-dark: #0369a1; /* sky-700 */
                --secondary-blue: #e0f2fe; /* sky-100 */
                --accent-orange: #f97316;
                --bg-page: #f8fafc;
                --text-main: #1e293b;
                --text-light: #64748b;
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg-page);
                -webkit-tap-highlight-color: transparent;
                color: var(--text-main);
            }

            .font-inter { font-family: 'Inter', sans-serif; }

            /* Animations */
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .animate-fade-in-up {
                animation: fadeInUp 0.4s ease-out forwards;
            }

            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

            /* Modern Card Style */
            .modern-card {
                background: white;
                border-radius: 1.25rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                transition: all 0.2s ease-in-out;
                border: 1px solid #f1f5f9;
            }
            
            .modern-card:active {
                transform: scale(0.98);
            }

            .glass {
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.3);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            .btn-primary {
                background: linear-gradient(135deg, var(--primary-blue), var(--primary-dark));
                color: white;
                border-radius: 1rem;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(2, 132, 199, 0.2);
                transition: all 0.2s;
            }
            
            .btn-primary:active {
                transform: scale(0.98);
                box-shadow: 0 2px 6px rgba(2, 132, 199, 0.2);
            }

            .tab-active {
                background: var(--primary-blue) !important;
                color: white !important;
                box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
            }
            
            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: var(--text-light);
                border: 1px solid #e2e8f0;
                border-radius: 0.75rem;
                font-weight: 600;
            }
        `}} />

        {/* --- Header (Modern Blue Gradient) --- */}
        <header className="bg-gradient-to-br from-sky-700 to-blue-800 text-white pt-12 pb-20 px-8 rounded-b-[3rem] relative overflow-hidden shadow-xl z-10">
             {/* Subtle Abstract Background */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
             <div className="absolute bottom-0 left-0 w-40 h-40 bg-sky-400/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

             <div className="flex justify-between items-center relative z-10">
                 <div>
                     <div className="flex items-center gap-2 mb-2">
                         <span className="w-2 h-2 rounded-full bg-sky-300 animate-pulse"></span>
                         <p className="text-sky-100 text-xs font-semibold tracking-wider font-inter uppercase">Table {tableLabel}</p>
                     </div>
                     <h1 className="text-2xl font-bold tracking-tight leading-none text-white">
                         {brand?.name || "Premium Dining"}
                     </h1>
                 </div>
                 <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center shadow-sm text-sky-700">
                     <Icon name="shop" size={20} />
                 </div>
             </div>
        </header>

        <main className="px-6 -mt-12 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade-in-up">
                    {/* Hero Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-52 bg-slate-100 rounded-[2rem] overflow-hidden shadow-md mb-8 group">
                             <img 
                                src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                             />
                             <div className="absolute bottom-4 left-4 py-1.5 px-4 glass rounded-full text-[10px] font-semibold text-sky-800 uppercase tracking-widest shadow-sm">
                                 Recommended
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-1">
                         <div>
                             <h2 className="text-xl font-bold text-slate-800">เมนูแนะนำ</h2>
                             <p className="text-sm text-slate-500 font-inter">คัดสรรพิเศษเพื่อคุณ</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="text-sky-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                             ดูทั้งหมด <Icon name="chevronRight" size={16} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="modern-card cursor-pointer p-3" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full h-36 overflow-hidden relative rounded-xl bg-slate-100 mb-3">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm font-inter">
                                                SALE
                                            </div>
                                         )}
                                     </div>
                                     <h3 className="font-semibold text-slate-700 text-sm line-clamp-2 mb-2 h-10 leading-snug">{p.name}</h3>
                                     <div className="flex justify-between items-end">
                                         <div className="flex flex-col">
                                             {pricing.discount > 0 && (
                                                 <span className="text-[11px] text-slate-400 line-through font-medium font-inter">
                                                     {pricing.original}
                                                 </span>
                                             )}
                                             <span className="text-sky-700 font-bold text-lg font-inter leading-none">
                                                 {pricing.final}.-
                                             </span>
                                         </div>
                                         <div className="w-8 h-8 bg-sky-50 text-sky-600 flex items-center justify-center rounded-full shadow-sm">
                                             <Icon name="plus" size={14} strokeWidth={2.5} />
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
                <section className="animate-fade-in-up pt-4">
                    {/* Search Bar */}
                    <div className="relative mb-6 group">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                         </div>
                         <input type="text" placeholder="ค้นหาเมนู..." className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white shadow-sm border border-slate-100 focus:ring-2 focus:ring-sky-100 focus:border-sky-300 outline-none transition-all text-sm font-medium text-slate-600 placeholder:text-slate-300" />
                    </div>

                    {/* Categories */}
                    <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-5 py-2.5 text-sm font-semibold ${selectedCategoryId === c.id ? 'tab-active' : ''}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="modern-card cursor-pointer p-3" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full h-36 overflow-hidden relative rounded-xl bg-slate-100 mb-3">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                                     </div>
                                     <h3 className="font-semibold text-slate-700 text-sm line-clamp-2 mb-2 h-10 leading-snug">{p.name}</h3>
                                     <div className="flex justify-between items-end">
                                         <div className="flex flex-col">
                                             {pricing.discount > 0 && <span className="text-[11px] text-slate-400 line-through font-medium font-inter">{pricing.original}</span>}
                                             <span className="text-sky-700 font-bold text-lg font-inter leading-none">{pricing.final}.-</span>
                                         </div>
                                         <div className="w-8 h-8 bg-sky-50 text-sky-600 flex items-center justify-center rounded-full shadow-sm">
                                             <Icon name="plus" size={14} strokeWidth={2.5} />
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
                <section className="animate-fade-in-up pt-4 pb-24">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-800">สถานะออเดอร์</h2>
                        <p className="text-sm text-slate-500">ติดตามรายการอาหารของคุณ</p>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="modern-card p-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-bl-3xl -mr-2 -mt-2"></div>
                                
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                     <span className="text-xs text-slate-400 font-semibold font-inter tracking-wider flex items-center gap-1">
                                         Order #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wide rounded-full border flex items-center gap-1.5 font-inter
                                        ${o.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                         {o.status === 'pending' && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>}
                                         {o.status === 'pending' ? 'กำลังปรุง' : 'เสิร์ฟแล้ว'}
                                     </span>
                                </div>

                                <div className="space-y-3 relative z-10 border-t border-slate-100 pt-3">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-slate-700 font-medium">
                                            <div className="flex items-start gap-2">
                                                <span className="font-bold text-slate-900">{i.quantity}x</span>
                                                <div className="flex flex-col">
                                                    <span>{i.product_name}</span>
                                                    {/* Variant */}
                                                    {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-slate-400 capitalize">{i.variant}</span>}
                                                </div>
                                            </div>
                                            <span className="font-bold text-slate-800 font-inter">{i.price * i.quantity}.-</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100 relative z-10">
                                     <span className="font-semibold text-slate-400 text-xs uppercase">ยอดรวม</span>
                                     <span className="font-bold text-sky-700 text-xl font-inter">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-12 opacity-50">
                                <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-3 flex items-center justify-center text-slate-400">
                                    <Icon name="clock" size={32} />
                                </div>
                                <p className="text-sm font-medium text-slate-500">ยังไม่มีออเดอร์</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Modern Glass) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[70px] glass rounded-2xl shadow-lg flex justify-around items-center px-2 z-[90]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all w-16 ${activeTab === 'home' ? 'text-sky-600' : 'text-slate-400'}`}>
                 <Icon name="home" size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                 <span className="text-[10px] font-medium">หน้าแรก</span>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all w-16 ${activeTab === 'menu' ? 'text-sky-600' : 'text-slate-400'}`}>
                 <Icon name="menu" size={24} strokeWidth={activeTab === 'menu' ? 2.5 : 2} />
                 <span className="text-[10px] font-medium">เมนู</span>
             </button>

             {/* Main Action Button (Cart) */}
             <div className="relative -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform border-4 border-slate-50">
                     <Icon name="basket" size={26} />
                     {cart?.length > 0 && (
                         <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm font-inter">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all w-16 ${activeTab === 'status' ? 'text-sky-600' : 'text-slate-400'}`}>
                 <Icon name="clock" size={24} strokeWidth={activeTab === 'status' ? 2.5 : 2} />
                 <span className="text-[10px] font-medium">สถานะ</span>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Modern Bottom Sheet) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in-up">
                <div onClick={() => setSelectedProduct(null)} className="absolute inset-0"></div>
                
                <div className="w-full max-w-md bg-white rounded-t-[2rem] shadow-xl relative overflow-hidden max-h-[90vh] flex flex-col">
                    <div className="relative h-64 shrink-0 bg-slate-100">
                        <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-9 h-9 glass rounded-full flex items-center justify-center text-white hover:bg-white hover:text-slate-800 transition-colors">
                            <Icon name="x" size={20} />
                        </button>
                        
                        <div className="absolute bottom-0 left-0 w-full p-6 text-white bg-gradient-to-t from-slate-900/80 to-transparent">
                            <h2 className="text-2xl font-bold mb-1">{selectedProduct.name}</h2>
                            {/* Price Display in Modal header */}
                            <div className="flex items-end gap-2 font-inter">
                                {currentPriceObj.discount > 0 && (
                                    <span className="text-sm text-white/80 line-through font-medium mb-1">
                                        {currentPriceObj.original}
                                    </span>
                                )}
                                <span className="text-3xl font-bold text-white">{currentPriceObj.final}.-</span>
                                {currentPriceObj.discount > 0 && (
                                    <span className="bg-orange-500 text-white text-[10px] px-2 py-1 rounded-md font-bold ml-2 mb-2">
                                        ลด {currentPriceObj.discount}.-
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 pb-32 overflow-y-auto bg-white">
                        <div className="space-y-6">
                            {/* Variant Selector */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">เลือกขนาด:</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { key: 'normal', label: 'ปกติ', icon: 'star', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'พิเศษ', icon: 'star', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'จัมโบ้', icon: 'star', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 relative
                                                ${variant === v.key 
                                                    ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' 
                                                    : 'border-slate-200 text-slate-500 hover:border-sky-200 hover:bg-slate-50'}`}
                                        >
                                            <span className="text-sm font-semibold">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none font-inter">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through text-slate-400">{v.original}</span>
                                                )}
                                                <span className="text-lg font-bold">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 border-y border-slate-100">
                                <span className="text-sm font-bold text-slate-700">จำนวน:</span>
                                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 bg-white text-slate-600 rounded-lg flex items-center justify-center hover:text-sky-600 active:scale-95 transition-all border border-slate-100 shadow-sm"><Icon name="minus" size={18} /></button>
                                    <span className="text-xl font-bold w-10 text-center text-slate-800 font-inter">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-10 h-10 bg-white text-slate-600 rounded-lg flex items-center justify-center hover:text-sky-600 active:scale-95 transition-all border border-slate-100 shadow-sm"><Icon name="plus" size={18} /></button>
                                </div>
                            </div>

                            {/* Note Input */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">ข้อความเพิ่มเติม (ถ้ามี):</label>
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="เช่น ไม่ใส่ผัก, เผ็ดน้อย..." 
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-400 focus:ring-1 focus:ring-sky-200 focus:outline-none h-28 resize-none text-sm text-slate-700 placeholder:text-slate-400 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border-2 border-sky-600 text-sky-600 font-bold rounded-xl active:scale-95 transition-all">
                                ใส่ตะกร้า
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-primary font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                สั่งเลย <Icon name="fire" size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART DRAWER (Modern) --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in-up">
                 <div className="w-full max-w-md bg-white rounded-t-[2rem] shadow-2xl h-[85vh] flex flex-col relative">
                     {/* Handle */}
                     <div onClick={() => setActiveTab('menu')} className="w-full py-4 flex justify-center cursor-pointer hover:bg-slate-50 rounded-t-[2rem]">
                         <div className="w-14 h-1.5 bg-slate-200 rounded-full"></div>
                     </div>

                     <div className="px-8 mb-4 flex justify-between items-end">
                         <div>
                            <h2 className="text-2xl font-bold text-slate-800">ตะกร้าของคุณ</h2>
                            <p className="text-sm text-slate-500">{cart.length} รายการ</p>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 no-scrollbar">
                         {cart.map((item: any, idx: any) => {
                            // Calculate Discount for Cart Display
                            const finalPriceTotal = item.price * item.quantity;
                            const originalPriceTotal = (item.original_price || item.price) * item.quantity;
                            const hasDiscount = originalPriceTotal > finalPriceTotal;

                             return (
                             <div key={idx} className="flex gap-4 p-3 modern-card">
                                 <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                     <img src={item.image_url} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1">
                                     <h3 className="font-bold text-slate-700 text-sm line-clamp-1">{item.name}</h3>
                                     <div className="text-xs text-slate-500 mt-1">
                                         {item.variant !== 'normal' && <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 mr-2">{item.variant}</span>}
                                         {item.note && (
                                             <span className="italic flex items-center gap-1 mt-1">
                                                 <Icon name="pencil" size={10} /> "{item.note}"
                                             </span>
                                         )}
                                     </div>
                                     
                                     <div className="flex justify-between items-end mt-3">
                                        <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100 p-1">
                                            <button onClick={() => updateQuantity(idx, -1)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><Icon name="minus" size={14}/></button>
                                            <span className="text-sm font-bold text-slate-700 w-8 text-center font-inter">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(idx, 1)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-sky-600 transition-colors"><Icon name="plus" size={14}/></button>
                                        </div>
                                        <div className="flex flex-col items-end font-inter">
                                            {hasDiscount && (
                                                <span className="text-xs text-slate-400 line-through">{originalPriceTotal}</span>
                                            )}
                                            <span className="font-bold text-sky-700 text-lg leading-none">{finalPriceTotal}.-</span>
                                        </div>
                                     </div>
                                 </div>
                                 <button onClick={() => updateQuantity(idx, -100)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors">
                                     <Icon name="trash" size={18} />
                                 </button>
                             </div>
                         )})}
                         {cart.length === 0 && (
                             <div className="text-center py-20 opacity-50">
                                 <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-300">
                                     <Icon name="basket" size={40} />
                                 </div>
                                 <p className="text-slate-500 font-medium">ตะกร้าว่างเปล่า</p>
                             </div>
                         )}
                     </div>

                     <div className="p-6 bg-white border-t border-slate-100 rounded-t-[2rem]">
                         <div className="flex justify-between items-center mb-6">
                             <span className="text-slate-600 font-bold text-lg">ยอดรวมทั้งสิ้น</span>
                             <span className="text-3xl font-bold text-sky-700 font-inter">{cartTotal}.-</span>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} disabled={cart.length === 0} className="w-full py-4 btn-primary text-white font-bold text-lg active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2">
                             <Icon name="check" size={20} /> ยืนยันการสั่งซื้อ
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL (Clean Style) --- */}
        {showConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-6 animate-fade-in-up">
                <div className="w-full max-w-sm bg-white rounded-2xl p-8 text-center shadow-2xl relative">
                    <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Icon name="check" size={40} strokeWidth={3} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                             <h3 className="text-xl font-bold text-slate-800 mb-2">สั่งเลยไหมครับ?</h3>
                             <p className="text-slate-500 mb-8 text-sm">เพิ่ม "{selectedProduct.name}" และส่งออเดอร์เข้าครัวทันที</p>
                             <div className="flex flex-col gap-3">
                                 <button onClick={() => { performCookNow(); setShowConfirm(false); }} className="w-full py-3.5 btn-primary text-white font-bold rounded-xl">ยืนยัน สั่งเลย!</button>
                                 <button onClick={() => { handleAdd(true); setShowConfirm(false); }} className="w-full py-3.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">แค่ใส่ตะกร้าไว้ก่อน</button>
                             </div>
                         </>
                    ) : (
                         <>
                             <h3 className="text-xl font-bold text-slate-800 mb-2">ยืนยันออเดอร์</h3>
                             <p className="text-slate-500 mb-8 text-sm">ส่งรายการอาหาร {cart.length} อย่าง เข้าครัวเลยนะครับ?</p>
                             <div className="flex flex-col gap-3">
                                 <button onClick={() => { onCheckoutClick(); }} className="w-full py-3.5 btn-primary text-white font-bold rounded-xl">ยืนยันการสั่ง</button>
                                 <button onClick={() => setShowConfirm(false)} className="w-full py-3.5 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl">ยกเลิก</button>
                             </div>
                         </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}