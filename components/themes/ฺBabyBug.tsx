import React, { useState, useEffect, useRef } from "react";

// --- 🍼 Baby Icons Wrapper (Baby Bugs / Nursery Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> House / Nursery
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />, 
    // Menu -> Cookie / Bowl
    menu: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Baby Carriage / Basket
    basket: <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />,
    // Clock -> Nap Time
    clock: <circle cx="12" cy="12" r="10" />,
    // Star -> Star / Magic
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Cloud
    cloud: <path d="M17.5 19c0-1.7-1.3-3-3-3h-1.1c-.5-2.5-2.7-4.4-5.3-4.4-2.2 0-4.1 1.3-5.1 3.2C1.3 15.3 0 17 0 19s1.3 3 3 3h14.5c1.7 0 3-1.3 3-3z" />,
    // Baby Bottle
    bottle: <path d="M9 2h6v2H9zm3 3c-2.2 0-4 1.8-4 4v11c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V9c0-2.2-1.8-4-4-4z" />,
    // Cookie Bite
    cookie: <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />,
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    rocket: <path d="M12 2.5s-4 5-6 11c0 3.5 2 5.5 6 5.5s6-2 6-5.5c-2-6-6-11-6-11z" />
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
      {name === 'basket' && <path d="M6 9h12" opacity="0.5"/>}
      {name === 'clock' && <path d="M12 6v6l4 2" />}
    </svg>
  );
};

export default function App({ state, actions, helpers }: any) {
  // --- 🛡️ Default Values ---
  const {
    loading, isVerified, activeTab, brand, tableLabel,
    banners, currentBannerIndex, categories, selectedCategoryId,
    products, filteredProducts, selectedProduct,
    cart = [], cartTotal = 0, ordersList = []
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

  // --- 🔥 AUTO-CHECKOUT LOGIC (From Garfield Code) ---
  const prevCartLength = useRef(cart?.length || 0);

  useEffect(() => {
    if (pendingCookNow) {
        if (cart?.length > prevCartLength.current) {
             handleCheckout(); // Logic เดิม ไม่ส่ง param
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#f0f9ff] flex items-center justify-center text-sky-400 font-black text-2xl animate-bounce">Playing...</div>;

  const currentPriceObj = selectedProduct 
    ? calculatePrice(selectedProduct, variant) 
    : { final: 0 };

  // --- 📝 Logic Handlers (Same as Garfield) ---
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
    // Theme: Baby Bugs / Sky Blue
    <div className="w-full max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden border-x-4 border-white bg-[#f0f9ff] font-sans text-slate-700">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;600;700&family=Nunito:wght@400;700;900&display=swap');
            
            .baby-font { font-family: 'Fredoka', 'Nunito', sans-serif; }

            @keyframes float-baby {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-8px) rotate(3deg); }
            }
            .animate-float-baby { animation: float-baby 4s infinite ease-in-out; }

            .item-card {
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                background: white;
                border-radius: 2rem;
                border: 3px solid #e0f2fe;
                box-shadow: 0 8px 0 #bae6fd;
                overflow: hidden;
            }
            .item-card:hover, .item-card:active {
                transform: translateY(4px);
                box-shadow: 0 4px 0 #bae6fd;
                border-color: #38bdf8;
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            .btn-baby {
                background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
                color: white;
                border: 3px solid white;
                border-radius: 9999px;
                font-weight: 700;
                box-shadow: 0 6px 12px rgba(236, 72, 153, 0.3);
                transition: all 0.2s;
            }
            .btn-baby:active { transform: scale(0.95); box-shadow: 0 2px 5px rgba(236, 72, 153, 0.4); }

            .tab-btn {
                transition: all 0.3s;
                background: #fff;
                color: #7dd3fc;
                border: 2px solid #e0f2fe;
                border-radius: 1.2rem;
            }
            .tab-btn.active {
                background: #38bdf8;
                color: white;
                border: 2px solid white;
                box-shadow: 0 4px 0 #0284c7;
                transform: translateY(-2px);
            }

            @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            
            .page-transition { animation: fadeIn 0.6s; }
        `}} />

        {/* --- Header (Sky Blue) --- */}
        <header className="bg-gradient-to-b from-sky-400 to-sky-300 text-white pt-10 pb-16 px-6 rounded-b-[4rem] relative overflow-hidden shadow-xl z-10 border-b-8 border-white">
             {/* Sun & Clouds */}
             <div className="absolute -top-5 -right-5 w-32 h-32 bg-yellow-200 rounded-full blur-xl opacity-40"></div>
             <div className="absolute top-4 left-10 text-white/50 text-3xl animate-pulse"><Icon name="cloud" size={32} /></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-pink-400 w-fit px-4 py-1.5 rounded-full border-2 border-white shadow-sm transform -rotate-2">
                         <span className="w-3 h-3 rounded-full bg-yellow-300 animate-pulse border border-white"></span>
                         <p className="text-white text-xs font-bold tracking-wider baby-font uppercase">Nursery is Open!</p>
                     </div>
                     <h1 className="text-4xl baby-font tracking-tight leading-none mt-2 text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.1)]">
                         {brand?.name || "Baby Cafe"}
                     </h1>
                     <p className="text-sm text-sky-100 font-bold ml-1 opacity-90 baby-font">{tableLabel}</p>
                 </div>
                 
                 {/* Character Badge Icon */}
                 <div className="w-20 h-20 bg-white rounded-full border-4 border-blue-200 flex items-center justify-center relative shadow-lg animate-float-baby">
                     <Icon name="basket" size={40} className="text-sky-400" />
                     <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-300 rounded-full border-2 border-white flex items-center justify-center text-orange-500">
                        <Icon name="star" size={14} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="page-transition">
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[3rem] overflow-hidden shadow-xl mb-10 border-4 border-white p-2">
                             <div className="h-full w-full rounded-[2.5rem] overflow-hidden bg-sky-50 relative">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                             </div>
                             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-orange-700 px-6 py-2 rounded-full border-2 border-white shadow-lg transform rotate-2">
                                 <span className="baby-font text-lg font-bold">TODAY'S TOYS!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2">
                         <div>
                             <h2 className="text-3xl baby-font text-sky-600 drop-shadow-sm transform -rotate-1">Sweet Nums</h2>
                             <p className="text-sm text-pink-400 font-bold baby-font ml-1">For little tummies!</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-white text-sky-400 px-5 py-2.5 rounded-full text-sm font-black flex items-center gap-2 hover:bg-sky-50 transition-all baby-font border-4 border-sky-100 shadow-md active:scale-95">
                             See More <Icon name="search" size={14} />
                         </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-sky-50 border-b-4 border-dashed border-blue-50 mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-2 right-2 bg-pink-400 text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm baby-font transform rotate-3">SALE!</div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-sky-800 text-sm line-clamp-2 mb-2 leading-tight baby-font tracking-wide">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-gray-400 line-through font-bold">{pricing.original}</span>}
                                                 <span className="text-pink-500 font-black text-xl baby-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-sky-400 text-white border-2 border-white flex items-center justify-center rounded-full hover:bg-sky-500 transition-all shadow-md active:scale-90">
                                                 <Icon name="plus" size={16} strokeWidth={3} />
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
                    <div className="relative mb-8 group">
                         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none"><Icon name="search" className="text-sky-300 text-xl" /></div>
                         <input type="text" placeholder="Looking for snacks?..." className="w-full pl-16 pr-8 py-5 rounded-full bg-white border-4 border-blue-50 text-sky-800 placeholder:text-blue-200 focus:outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-50 transition-all text-lg font-bold baby-font shadow-inner" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} className={`tab-btn shrink-0 px-8 py-3 text-lg font-bold baby-font ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-sky-50 border-b-4 border-dashed border-blue-50 mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-sky-800 text-sm line-clamp-2 mb-2 leading-tight baby-font tracking-wide">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-gray-400 line-through font-bold">{pricing.original}</span>}
                                                 <span className="text-pink-500 font-black text-xl baby-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-sky-400 text-white border-2 border-white flex items-center justify-center rounded-full hover:bg-sky-500 transition-all shadow-md active:scale-90">
                                                 <Icon name="plus" size={16} strokeWidth={3} />
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
                    <div className="mb-8 flex items-center justify-between bg-white p-8 border-4 border-blue-50 rounded-[3rem] shadow-xl relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12 text-sky-300"><Icon name="cloud" size={100} /></div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black baby-font text-sky-500">Order Diary</h2>
                             <p className="text-sm text-pink-400 font-bold mt-1 baby-font">Is it snack time yet?</p>
                         </div>
                         <div className="w-16 h-16 bg-yellow-50 border-4 border-yellow-200 rounded-full flex items-center justify-center animate-bounce shadow-md">
                             <Icon name="clock" size={32} className="text-orange-400" />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-white p-6 border-4 border-blue-50 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-sky-600 font-bold uppercase tracking-widest flex items-center gap-1"><Icon name="menu" size={14} /> Ticket #{o.id.slice(-4)}</span>
                                     <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-wide border-2 rounded-full flex items-center gap-1.5 shadow-sm baby-font transform -rotate-1 ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-600 border-yellow-200' : 'bg-green-100 text-green-600 border-green-200'}`}>
                                       {o.status === 'pending' ? 'Preparing...' : 'Ready!'}
                                     </span>
                                </div>
                                <div className="mb-4 space-y-2 bg-sky-50 p-5 rounded-2xl border-2 border-white">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-sky-800 font-bold border-b-2 border-dashed border-blue-100 pb-2 last:border-0 baby-font">
                                            <div className="flex flex-col">
                                                <span>{i.quantity}x {i.product_name}</span>
                                                {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-white bg-pink-400 px-1.5 rounded-full w-fit border border-pink-200 uppercase font-bold">{i.variant}</span>}
                                                {i.note && <span className="text-[10px] text-sky-400 italic bg-white px-2 py-0.5 rounded border border-blue-100 mt-1 block w-fit shadow-sm"><Icon name="pencil" size={8} /> "{i.note}"</span>}
                                            </div>
                                            <span className="text-pink-500">{i.price * i.quantity}.-</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t-4 border-blue-50">
                                     <span className="font-bold text-gray-400 text-xs uppercase tracking-widest">TOTAL</span>
                                     <span className="font-black text-sky-700 text-3xl baby-font">{o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[85px] bg-white/95 backdrop-blur-md shadow-2xl flex justify-around items-center px-4 z-[100] rounded-[2.5rem] border-4 border-white">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-sky-100' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-sky-500 scale-110' : 'text-blue-200'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-sky-100' : ''}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-sky-500 scale-110' : 'text-blue-200'}`} />
                 </div>
             </button>

             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-pink-400 rounded-full shadow-lg flex items-center justify-center text-white border-4 border-white active:scale-90 transition-all duration-100 z-20 group hover:bg-pink-500">
                     <Icon name="basket" size={32} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-yellow-400 text-orange-700 text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-white animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-sky-100' : ''}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-sky-500 scale-110' : 'text-blue-200'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-sky-900/50 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-white border-t-8 border-sky-200 h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[4rem] relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-sky-400 rounded-full border-2 border-sky-100 flex items-center justify-center hover:bg-sky-50 transition-colors shadow-md active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-85 overflow-hidden border-b-4 border-blue-50 rounded-b-[3.5rem] bg-sky-50">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-yellow-400 text-orange-800 font-black text-3xl baby-font rounded-full border-4 border-white shadow-xl transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-orange-700 decoration-white decoration-2 mb-1">{currentPriceObj.original}</span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32 relative">
                        <h2 className="text-4xl baby-font text-sky-600 mb-6 leading-tight drop-shadow-sm">{selectedProduct.name}</h2>
                        <div className="space-y-6">
                            
                            {/* PRICES VARIANT SELECTOR (Keeping Logic 100% - Styled as Baby Blocks) */}
                            <div>
                                <label className="block text-xl font-bold text-sky-700 mb-3 baby-font uppercase tracking-wider">Pick One:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'SMALL', icon: 'star', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'BIG', icon: 'bottle', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'HUGE', icon: 'rocket', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center justify-between h-28 baby-font ${variant === v.key ? 'bg-sky-400 border-sky-300 shadow-md -translate-y-1 text-white' : 'bg-white border-blue-100 text-sky-300 hover:border-sky-200 hover:text-sky-500'}`}
                                        >
                                            <span className="text-xs font-black tracking-widest">{v.label}</span>
                                            <Icon name={v.icon || "star"} size={24} className={variant === v.key ? "text-white" : "text-sky-200"} />
                                            <div className="flex flex-col items-center leading-none mt-1">
                                                {v.discount > 0 && <span className="text-[10px] line-through decoration-white decoration-2">{v.original}</span>}
                                                <span className="text-2xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-4 bg-white p-3 rounded-full border-4 border-blue-50 shadow-md">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-blue-50 text-sky-500 rounded-full flex items-center justify-center hover:bg-blue-100 active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-sky-800 baby-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-sky-400 text-white rounded-full flex items-center justify-center hover:bg-sky-500 active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-pink-400 font-black uppercase tracking-widest mb-1 baby-font">Total</p>
                                    <p className="text-4xl font-black text-sky-600 baby-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* Note Input */}
                            <div className="relative">
                                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="A message for the grown-ups..." className="w-full p-6 bg-blue-50 border-4 border-white rounded-[2.5rem] focus:border-sky-300 focus:outline-none h-36 resize-none text-xl font-bold text-sky-800 placeholder:text-blue-200 transition-colors shadow-inner baby-font" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-white border-4 border-blue-50 text-sky-400 font-black text-xl rounded-full active:scale-95 transition-all shadow-md baby-font">Pack It</button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-baby text-2xl active:scale-95 transition-all flex items-center justify-center gap-2">PLAY! <Icon name="star" size={24} /></button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ORDER SUMMARY MODAL (FIXED LOGIC + Baby Theme) --- */}
        {activeTab === 'cart' && (
            <>
                {/* Overlay with Close Action */}
                <div 
                    id="orderSummaryOverlay" 
                    className="fixed inset-0 bg-sky-900/60 z-[130] backdrop-blur-sm animate-fade-in block" 
                    onClick={() => setActiveTab('menu')}
                ></div>
                
                {/* Modal Sheet */}
                <div 
                    id="orderSummary" 
                    className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-[10px] border-sky-100 z-[140] flex flex-col shadow-2xl h-[92vh] rounded-t-[4rem] animate-slide-up"
                >
                    <div className="sticky top-0 bg-white z-20 rounded-t-[4rem] border-b-4 border-blue-50 p-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                        <div className="w-24 h-2 bg-blue-100 rounded-full mx-auto mt-2"></div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-6 px-10 pt-8">
                        <h2 className="text-4xl baby-font text-sky-600 transform -rotate-1">Toy Bag</h2>
                        <div className="w-14 h-14 bg-pink-100 text-pink-500 border-4 border-white rounded-2xl flex items-center justify-center font-black text-2xl baby-font shadow-lg">
                            <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-6 px-8 pb-4 no-scrollbar">
                        {cart.map((item: any, idx: any) => (
                            <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-blue-50 rounded-[2rem] shadow-sm relative overflow-hidden hover:shadow-md hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                                <div className="w-20 h-20 bg-blue-50 rounded-2xl overflow-hidden border-2 border-white shrink-0">
                                    <img src={item.image_url} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-sky-800 text-xl leading-tight baby-font tracking-wide">
                                        {item.name} <span className="text-pink-400">x{item.quantity}</span>
                                    </div>
                                    <div className="text-sm font-bold mt-1 text-sky-400">
                                        {item.variant !== 'normal' && <span className="bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full text-xs mr-2 border border-sky-200 uppercase font-bold">{item.variant}</span>}
                                        {item.note && (
                                            <span className="block mt-1 bg-white text-sky-700 text-[12px] px-2 py-1 rounded border border-blue-100 italic font-sans">
                                                <Icon name="pencil" size={10} /> "{item.note}"
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                     <span className="font-black text-pink-500 text-2xl baby-font">{item.price * item.quantity}.-</span>
                                     <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center hover:bg-pink-100 transition-colors border-2 border-white shadow-sm active:scale-90">
                                         <Icon name="trash" size={18} />
                                     </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="text-center py-20 text-sky-200 font-bold text-2xl baby-font opacity-50">Empty Bag...</div>
                        )}
                    </div>

                    <div className="p-10 bg-sky-50 border-t-4 border-white relative z-30 rounded-t-[4rem]">
                        <div className="flex justify-between items-center mb-8 pb-6 border-b-4 border-dashed border-white">
                            <div>
                                <p className="text-xs text-blue-300 font-black uppercase tracking-widest baby-font">All Nums</p>
                                <p className="text-5xl baby-font text-pink-500">{cartTotal}.-</p>
                            </div>
                            <div className="w-20 h-20 bg-white border-4 border-blue-100 rounded-full flex items-center justify-center text-sky-300 transform rotate-6 shadow-lg">
                                <Icon name="basket" size={40} />
                            </div>
                        </div>
                        <button onClick={() => { setShowConfirm(true); }} className="w-full py-6 btn-baby text-3xl active:scale-95 transition-all flex items-center justify-center gap-4">
                            <span>GO! GO! GO!</span> <Icon name="rocket" size={32} />
                        </button>
                    </div>
                </div>
            </>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-sky-900/80 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-sm bg-white border-8 border-sky-100 p-10 text-center shadow-2xl relative overflow-hidden rounded-[3rem]">
                    <div className="w-28 h-28 bg-yellow-50 text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-lg relative z-10 animate-float-baby">
                        <Icon name="star" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-4xl baby-font text-sky-600 mb-4 leading-tight relative z-10">More Toys?</h3>
                            <p className="text-xl text-blue-300 mb-10 font-bold baby-font relative z-10">Found more fun things! Add them too?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { performCookNow(); setShowConfirm(false); }} className="w-full py-5 bg-pink-400 text-white font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl baby-font rounded-full uppercase">PLAY ALL!</button>
                                <button onClick={() => { handleAdd(true); setShowConfirm(false); }} className="w-full py-5 bg-white border-4 border-blue-50 text-sky-300 font-black text-lg active:scale-95 transition-transform hover:bg-blue-50 baby-font rounded-full uppercase">Not yet!</button>
                            </div>
                         </>
                    ) : (
                        <>
                            <h3 className="text-4xl baby-font text-sky-600 mb-4 leading-tight relative z-10">Ready?</h3>
                            <p className="text-xl text-blue-300 mb-10 font-bold baby-font relative z-10">Want to order all your toys together?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                {/* 🔥 Logic: handleCheckout() from original code */}
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-5 bg-pink-400 text-white font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl baby-font rounded-full uppercase">YAY! SERVE ALL!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white border-4 border-blue-50 text-sky-300 font-black text-lg active:scale-95 transition-transform hover:bg-blue-50 baby-font rounded-full uppercase">Not yet!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}
    </div>
  );
}