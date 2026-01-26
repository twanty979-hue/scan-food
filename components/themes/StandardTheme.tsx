import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Garfield Style) ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Cat House / Bed
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />, 
    // Menu -> Lasagna Layers / List
    menu: <path d="M3 6h18M3 12h18M3 18h18" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Food Bowl
    basket: <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2 M9 14h6" />,
    // Clock -> Alarm Clock (Hated object)
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Cat Face
    chef: <path d="M12 2c-4 0-8 4-8 9 0 4.5 3.5 8 8 8s8-3.5 8-8c0-5-4-9-8-9zm0 14c-1.5 0-3-1-3-2.5S10.5 11 12 11s3 1 3 2.5S13.5 16 12 16z" />, 
    // Paw Print for star/special
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Hot Lasagna / Hunger
    flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.5-3.3a9 9 0 0 0 4 6.8Z" />,
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
      {name === 'basket' && <><path d="m8 10 1 4" /><path d="m16 10-1 4" /></>}
      {name === 'clock' && <path d="M12 6v6l4 2" />}
      {name === 'chef' && <path d="M7 10 L5 3 L9 6 L12 2 L15 6 L19 3 L17 10" stroke="currentColor" strokeWidth="2" fill="none"/>} {/* Cat ears hint */}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#FFEDD5]" />;

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
    // Theme: Garfield (Lazy Cat)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#1c1917]">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Mali:ital,wght@0,300;0,400;0,600;0,700;1,600&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --primary: #FB923C; /* Orange */
                --primary-light: #FFEDD5;
                --secondary: #FBBF24; /* Yellow/Cheese */
                --accent: #000000; /* Black Stripes */
                --stroke: #18181B; /* Dark Stroke */
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: #FFEDD5; /* Cream */
                /* --- 🐱 TIGER STRIPES / LASAGNA LAYERS PATTERN --- */
                background-image: 
                    repeating-linear-gradient(-45deg, #FDBA74 0, #FDBA74 20px, transparent 20px, transparent 40px);
                background-position: 0 0;
                background-attachment: fixed;
            }

            .cartoon-font {
                font-family: 'Mali', cursive;
            }

            @keyframes jelly {
                0% { transform: scale(1, 1); }
                25% { transform: scale(0.9, 1.1); }
                50% { transform: scale(1.1, 0.9); }
                75% { transform: scale(0.95, 1.05); }
                100% { transform: scale(1, 1); }
            }

            .animate-jelly { animation: jelly 0.5s; }

            .btn-theme {
                background: #FB923C; /* Garfield Orange */
                color: black;
                border: 3px solid #18181B;
                border-radius: 1rem;
                font-family: 'Mali', cursive;
                font-weight: 700;
                box-shadow: 4px 4px 0px #18181B;
                transition: all 0.1s;
            }
            .btn-theme:active {
                transform: translate(4px, 4px);
                box-shadow: 0px 0px 0px #18181B;
            }

            .item-card {
                background: #FFFFFF;
                border: 3px solid #18181B;
                border-radius: 1.5rem;
                box-shadow: 4px 4px 0px #FB923C;
                transition: all 0.2s;
            }
            .item-card:active {
                transform: translate(2px, 2px);
                box-shadow: 0px 0px 0px #FB923C;
            }

            .tab-btn {
                background: #FFFFFF;
                color: #18181B;
                border: 3px solid #FDBA74;
                border-radius: 1rem;
                transition: all 0.3s;
            }
            .tab-btn.active {
                background: #FBBF24;
                color: black;
                border: 3px solid #18181B;
                box-shadow: 3px 3px 0px #18181B;
                transform: rotate(-2deg);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* --- Header (Garfield Style) --- */}
        <header className="bg-[#FB923C] text-black pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-xl z-10 border-b-4 border-[#18181B]">
             <div className="absolute inset-0 opacity-10 pointer-events-none" 
                  style={{
                      backgroundImage: `repeating-linear-gradient(90deg, #000 0, #000 5px, transparent 5px, transparent 20px)`
                  }} 
             />
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#18181B] w-fit px-4 py-1.5 rounded-full border-2 border-white shadow-sm transform -rotate-2">
                         <span className="w-3 h-3 rounded-full bg-[#FBBF24] animate-bounce"></span>
                         <p className="text-[#FBBF24] text-xs font-bold tracking-wide cartoon-font uppercase">Table {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl font-black tracking-tight leading-none mt-2 cartoon-font drop-shadow-md text-white transform rotate-1 text-stroke-black">
                         {brand?.name || "Garfield's Eats"}
                     </h1>
                 </div>
                 {/* Cat Face Icon Background */}
                 <div className="w-20 h-20 bg-[#FBBF24] rounded-full border-4 border-[#18181B] flex items-center justify-center relative shadow-[4px_4px_0px_#18181B] transform rotate-3">
                     <Icon name="chef" className="text-[#18181B] w-12 h-12" />
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#FB923C] rounded-full border-2 border-[#18181B] flex items-center justify-center text-black text-xs font-bold">
                        🐱
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-jelly">
                    {/* Hero Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[2rem] overflow-hidden shadow-[6px_6px_0_#18181B] mb-8 border-4 border-[#18181B] p-2">
                             <div className="h-full w-full rounded-[1.2rem] overflow-hidden border-2 border-[#FDBA74] relative">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                             </div>
                             <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 bg-[#FBBF24] px-6 py-2 rounded-b-xl border-x-4 border-b-4 border-[#18181B] shadow-md">
                                 <span className="cartoon-font font-black text-[#18181B] uppercase">I Hate Mondays!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                         <div>
                             <h2 className="text-3xl font-black text-[#18181B] cartoon-font transform -rotate-1">Lasagna Time!</h2>
                             <p className="text-sm text-[#FB923C] font-bold ml-1 bg-white px-2 rounded-full border border-black inline-block">For Lazy Cats</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#18181B] text-[#FBBF24] px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#333] transition-colors cartoon-font border-2 border-[#FBBF24] shadow-[2px_2px_0_#FB923C] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                             See Menu <Icon name="menu" size={16} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-white border-b-2 border-[#FDBA74]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#EF4444] text-white text-xs font-black px-2 py-1 rounded-lg border-2 border-[#18181B] transform -rotate-6 shadow-sm">
                                                SAVE!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#18181B] text-sm line-clamp-2 mb-2 leading-tight cartoon-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-xs text-gray-400 line-through decoration-[#FB923C] decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#FB923C] font-black text-xl cartoon-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#18181B] text-[#FBBF24] border-2 border-[#FBBF24] flex items-center justify-center rounded-xl hover:bg-[#333] transition-all shadow-[2px_2px_0_#FB923C] active:translate-y-1 active:shadow-none">
                                                 <Icon name="plus" size={18} strokeWidth={4} />
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
                <section className="animate-jelly pt-4">
                    <div className="relative mb-8 group">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#FB923C]" />
                         </div>
                         <input type="text" placeholder="Find Lasagna..." className="w-full pl-14 pr-6 py-4 rounded-full bg-white border-4 border-[#18181B] text-[#18181B] placeholder:text-gray-400 focus:outline-none focus:border-[#FB923C] focus:shadow-[0_0_0_4px_#FED7AA] transition-all text-lg font-bold cartoon-font shadow-sm" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-3 text-lg font-bold rounded-2xl cartoon-font flex items-center gap-2 ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-24">
                        {filteredProducts?.map((p) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-white border-b-2 border-[#FDBA74]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#18181B] text-sm line-clamp-2 mb-2 leading-tight cartoon-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-xs text-gray-400 line-through decoration-[#FB923C] decoration-2 font-bold">{pricing.original}</span>}
                                                <span className="text-[#FB923C] font-black text-xl cartoon-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#18181B] text-[#FBBF24] border-2 border-[#FBBF24] flex items-center justify-center rounded-xl hover:bg-[#333] transition-all shadow-[2px_2px_0_#FB923C] active:translate-y-1 active:shadow-none">
                                                 <Icon name="plus" size={18} strokeWidth={4} />
                                             </button>
                                         </div>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- STATUS PAGE (Garfield / Nap Log Theme) --- */}
{activeTab === 'status' && (
    <section className="animate-jelly pt-4 pb-24">
        {/* Header: Nap Log */}
        <div className="mb-8 flex items-center justify-between bg-white p-6 border-4 border-[#18181B] rounded-[2rem] shadow-[6px_6px_0_#FB923C] relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#FBBF24] rounded-full border-4 border-[#18181B] opacity-50"></div>
             <div className="relative z-10">
                 <h2 className="text-3xl font-black cartoon-font text-[#18181B]">Nap Log</h2>
                 <p className="text-sm text-[#FB923C] font-bold mt-1">Is it ready yet?</p>
             </div>
             {/* Clock Icon */}
             <div className="w-14 h-14 bg-[#FFEDD5] border-4 border-[#18181B] rounded-full flex items-center justify-center animate-bounce shadow-sm">
                 <Icon name="clock" className="text-[#18181B]" />
             </div>
        </div>

        <div className="space-y-4">
            {ordersList?.map((o) => (
                <div key={o.id} className="bg-white p-5 border-4 border-[#18181B] rounded-[2rem] relative overflow-hidden shadow-[6px_6px_0_#FDBA74]">
                    
                    {/* Header: Order ID & Status */}
                    <div className="flex justify-between items-start mb-4">
                         <span className="text-xs text-[#FB923C] font-black uppercase tracking-widest flex items-center gap-1 font-bold">
                             Order #{o.id.slice(-4)}
                         </span>
                         <span className={`px-3 py-1 text-xs font-black uppercase tracking-wide border-2 flex items-center gap-1.5 cartoon-font shadow-sm rounded-xl transform -rotate-1
                             ${o.status === 'pending' ? 'bg-[#FFEDD5] text-[#C2410C] border-[#FB923C]' : 'bg-[#DCFCE7] text-[#15803D] border-[#22C55E]'}`}>
                             {o.status === 'pending' ? 'Cooking...' : 'Served!'}
                         </span>
                    </div>

                    {/* Order Items List */}
                    <div className="mb-3 space-y-1 bg-[#FFF7ED] p-4 border-2 border-[#FED7AA] rounded-xl">
                        {o.order_items.map((i, idx) => {
                            // ✅ LOGIC: คำนวณราคาและส่วนลด
                            const quantity = i.quantity || 1;
                            const finalPriceTotal = i.price * quantity;
                            
                            const hasDiscount = (i.original_price && i.original_price > i.price) || (i.discount > 0);
                            
                            const originalPriceTotal = hasDiscount 
                                ? (i.original_price ? i.original_price * i.quantity : (i.price + (i.discount || 0)) * i.quantity) 
                                : finalPriceTotal;
                                
                            const discountAmount = originalPriceTotal - finalPriceTotal;

                            return (
                                <div key={idx} className="flex justify-between items-start text-sm text-[#18181B] font-bold mb-2 border-b-2 border-dashed border-[#FDBA74] pb-2 last:border-0 cartoon-font">
                                    
                                    {/* Left: Info */}
                                    <div className="flex flex-col items-start pr-2">
                                        <span className="leading-tight text-base">{quantity}x {i.product_name}</span>
                                        
                                        {/* Variant Badge (Garfield Orange Style) */}
                                        {i.variant !== 'normal' && (
                                            <span className={`text-[10px] bg-[#F97316] text-white px-2 py-0.5 rounded-md border border-[#18181B] font-sans font-bold mt-1 shadow-sm uppercase tracking-wider transform -rotate-1`}>
                                                {i.variant === 'special' ? 'EXTRA CHEESE' : i.variant === 'jumbo' ? 'FAT CAT' : i.variant}
                                            </span>
                                        )}

                                        {/* Note */}
                                        {i.note && <span className="text-xs text-[#FB923C] italic mt-0.5">Note: {i.note}</span>}
                                    </div>

                                    {/* Right: Price */}
                                    <div className="text-right flex flex-col items-end min-w-[80px]">
                                        {hasDiscount ? (
                                            <>
                                                {/* 🔥 ป้าย SAVE */}
                                                <span className="text-[10px] text-white bg-[#EF4444] px-1.5 py-0.5 rounded-full font-sans font-bold mb-1 shadow-sm border border-[#18181B] transform rotate-2">
                                                    SAVE -{discountAmount}
                                                </span>

                                                {/* ราคาเต็ม (ขีดฆ่า) */}
                                                <span className="text-xs text-[#9CA3AF] line-through decoration-[#F97316] decoration-2 sans-serif opacity-80 mb-0.5 font-bold">
                                                    {originalPriceTotal}
                                                </span>

                                                {/* ราคาจริง */}
                                                <span className="text-[#C2410C] text-lg leading-none">
                                                    {finalPriceTotal}.-
                                                </span>
                                            </>
                                        ) : (
                                            // ราคาปกติ
                                            <span className="text-[#C2410C] text-lg">{finalPriceTotal}.-</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer: Total */}
                    <div className="flex justify-between items-center pt-2 border-t-2 border-[#18181B]">
                         <span className="font-bold text-[#FB923C] text-xs uppercase tracking-widest">TOTAL</span>
                         <span className="font-black text-[#18181B] text-2xl cartoon-font">
                             {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                         </span>
                    </div>
                </div>
            ))}
            
            {/* Empty State */}
            {(!ordersList || ordersList.length === 0) && (
                 <div className="text-center py-12 opacity-50">
                    <div className="w-16 h-16 bg-[#FFF7ED] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#FB923C] animate-pulse">
                        <Icon name="search" size={32} className="text-[#FB923C]" />
                    </div>
                    <p className="cartoon-font text-xl text-[#18181B]">I hate Mondays...</p>
                 </div>
            )}
        </div>
    </section>
)}

        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[75px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex justify-around items-center px-4 z-[90] rounded-full border-4 border-[#18181B]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'home' ? 'text-[#FB923C]' : 'text-gray-400'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#FFEDD5]' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'menu' ? 'text-[#FB923C]' : 'text-gray-400'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#FFEDD5]' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* Big Cart Button */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#FBBF24] rounded-full shadow-[0_8px_0_#18181B] flex items-center justify-center text-[#18181B] border-4 border-[#18181B] active:shadow-none active:translate-y-[8px] transition-all duration-100 z-20 group">
                     <Icon name="basket" size={32} className="group-hover:scale-110 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#EF4444] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-black border-2 border-[#18181B] animate-jelly">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'status' ? 'text-[#FB923C]' : 'text-gray-400'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#FFEDD5]' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Recipe Card) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#18181B]/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-full max-w-md bg-white border-t-4 border-x-4 border-[#18181B] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[3rem] animate-in slide-in-from-bottom duration-300">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-[#18181B] rounded-full border-4 border-[#18181B] flex items-center justify-center hover:bg-[#FDBA74] transition-colors shadow-[2px_2px_0_#18181B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                            <Icon name="x" />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-4 border-[#18181B] rounded-b-[2rem] bg-white">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#FBBF24] text-[#18181B] font-black text-2xl cartoon-font rounded-xl border-4 border-[#18181B] shadow-[4px_4px_0_#18181B] transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-[#C2410C] decoration-[#EF4444] decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32" style={{backgroundImage: 'radial-gradient(#FDBA74 20%, transparent 20%)', backgroundSize: '20px 20px', backgroundPosition: '0 0'}}>
                        <h2 className="text-3xl font-black text-[#18181B] mb-6 leading-tight cartoon-font transform rotate-1">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5">
                            {/* --- 🏷️ VARIANT SELECTOR (3 PRICES) --- */}
                            <div>
                                <label className="block text-lg font-bold text-[#18181B] mb-3 cartoon-font ml-1 tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'NORMAL', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'SPECIAL', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'JUMBO', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-xl border-4 transition-all flex flex-col items-center justify-between h-24 cartoon-font
                                                ${variant === v.key 
                                                    ? 'bg-[#FFEDD5] border-[#FB923C] shadow-[3px_3px_0_#18181B] -translate-y-1 text-[#C2410C]' 
                                                    : 'bg-white border-[#E5E7EB] text-gray-400 hover:border-[#FDBA74] hover:text-[#FB923C]'}`}
                                        >
                                            <span className="text-xs font-black tracking-widest">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-red-500 decoration-2 opacity-70">{v.original}</span>
                                                )}
                                                <span className="text-xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2 bg-white/60 backdrop-blur rounded-2xl p-4 border-2 border-[#FED7AA]">
                                <div className="flex items-center gap-2 bg-[#FFEDD5] p-2 rounded-full border-2 border-[#FDBA74]">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white border-2 border-[#FDBA74] text-[#C2410C] rounded-full flex items-center justify-center hover:bg-[#FED7AA] active:scale-90 transition-all font-black text-xl"><Icon name="minus" /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-[#18181B] cartoon-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#FB923C] border-2 border-[#FDBA74] text-white rounded-full flex items-center justify-center hover:bg-[#F97316] active:scale-90 transition-all font-black text-xl"><Icon name="plus" /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-[#FB923C] font-bold uppercase tracking-widest mb-1">TOTAL</p>
                                    <p className="text-4xl font-black text-[#18181B] cartoon-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <label className="block text-sm font-bold text-[#18181B] mb-2 cartoon-font ml-1">Message to Chef:</label>
                                <div className="relative">
                                    <textarea 
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="E.g., Extra Cheese..." 
                                        className="w-full p-4 pl-12 bg-white border-4 border-[#FED7AA] rounded-2xl font-bold text-[#18181B] placeholder:text-gray-400 focus:outline-none focus:border-[#FB923C] focus:shadow-[0_0_0_4px_#FFEDD5] transition-all cartoon-font resize-none h-24 shadow-inner"
                                    />
                                    <div className="absolute top-4 left-4 text-[#FBBF24]">
                                        <Icon name="pencil" size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border-4 border-[#18181B] text-[#18181B] font-black text-lg rounded-xl active:scale-95 transition-all shadow-[4px_4px_0_#ccc] cartoon-font">
                                Add to Pot
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-theme text-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                                EAT IT! <Icon name="flame" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (Tray) --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#18181B]/60 backdrop-blur-sm animate-in fade-in duration-300">
                 <div className="w-full max-w-md bg-[#FFF] border-t-4 border-[#18181B] flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.3)] h-[85vh] rounded-t-[3rem] animate-in slide-in-from-bottom duration-300">
                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-2 bg-[#18181B] rounded-full mx-auto opacity-20" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-3xl font-black text-[#18181B] cartoon-font transform -rotate-2">Your Tray</h2>
                         <div className="w-12 h-12 bg-[#FB923C] text-white border-4 border-[#18181B] rounded-xl flex items-center justify-center font-black text-xl cartoon-font shadow-[3px_3px_0_#18181B]">
                             <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-2 border-[#FED7AA] rounded-2xl relative overflow-hidden shadow-sm">
                                 <div className="w-2 h-full absolute left-0 top-0 bg-[#FBBF24]" />
                                 <img src={item.image_url} className="w-16 h-16 object-cover border-2 border-[#FED7AA] rounded-xl ml-2 bg-[#FFF7ED]" />
                                 <div className="flex-1">
                                     <div className="font-bold text-[#18181B] text-lg leading-tight cartoon-font tracking-wide">
                                         {item.name} <span className="text-[#FB923C]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-xs text-[#FB923C] mt-1 font-bold">
                                         {item.variant !== 'normal' && <span className="text-[#F97316] font-black uppercase mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-[#18181B] italic mt-1 bg-[#FFF7ED] p-1 rounded">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#18181B] text-xl cartoon-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#FEF2F2] hover:bg-[#FEE2E2] flex items-center justify-center text-[#EF4444] border-2 border-[#FEE2E2] rounded-xl transition-colors active:scale-90">
                                     <Icon name="trash" size={16} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-gray-400 font-bold cartoon-font text-xl">Tray is empty...</div>
                         )}
                     </div>

                     <div className="p-8 bg-white border-t-4 border-[#18181B] relative z-30 rounded-t-[2.5rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-[#FED7AA]">
                             <div>
                                 <p className="text-xs text-[#FB923C] font-black uppercase tracking-widest">Grand Total</p>
                                 <p className="text-5xl font-black text-[#18181B] cartoon-font">{cartTotal}.-</p>
                             </div>
                             <div className="w-16 h-16 bg-[#FBBF24] border-4 border-[#18181B] rounded-full flex items-center justify-center text-[#18181B] transform rotate-6 shadow-sm">
                                 <Icon name="basket" size={32} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-theme text-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                             <span>ORDER!</span> <Icon name="check" size={28} strokeWidth={4} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#18181B]/80 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
                <div className="w-full max-w-sm bg-[#FFF] border-4 border-[#18181B] p-8 text-center shadow-[8px_8px_0_#FB923C] animate-in zoom-in duration-300 relative overflow-hidden rounded-[2rem]">
                    <div className="w-24 h-24 bg-[#FFEDD5] text-[#18181B] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#18181B]">
                        <Icon name="basket" size={48} className="animate-bounce" />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-3xl font-black text-[#18181B] mb-2 leading-tight cartoon-font">Tray not empty!</h3>
                            <p className="text-lg text-[#FB923C] mb-8 font-bold cartoon-font">Order {selectedProduct.name} together with tray items?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#FB923C] text-black font-black border-4 border-[#18181B] shadow-[4px_4px_0_#18181B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-lg cartoon-font rounded-xl">YES, ORDER ALL!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-gray-300 text-gray-400 font-black text-sm active:scale-95 transition-transform hover:bg-gray-50 cartoon-font rounded-xl">NO, JUST ADD TO POT</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-3xl font-black text-[#18181B] mb-2 leading-tight cartoon-font">Wait a sec!</h3>
                            <p className="text-lg text-[#FB923C] mb-8 font-bold cartoon-font">Order everything on your tray?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-[#FB923C] text-black font-black border-4 border-[#18181B] shadow-[4px_4px_0_#18181B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-lg cartoon-font rounded-xl">YES, EAT IT ALL!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-gray-300 text-gray-400 font-black text-sm active:scale-95 transition-transform hover:bg-gray-50 cartoon-font rounded-xl">NO, I'M FULL</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}