import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Tom & Jerry Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Mouse Hole
    home: <path d="M12 3a9 9 0 0 0-9 9v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7a9 9 0 0 0-9-9z M12 21a4 4 0 0 1-4-4h8a4 4 0 0 1-4 4z" />, 
    // Menu -> Cheese Block
    menu: <path d="M3 6h18M3 12h18M3 18h18" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Mousetrap
    basket: <path d="M2 12h20v8H2z M12 12V6a4 4 0 0 0-8 0v6" />,
    // Clock -> Dynamite Timer
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Chef Hat
    chef: <path d="M12 2C9 2 7 4 7 7c0 1.5 1 3 2.5 3.5C8 11.5 6 13 6 16v4h12v-4c0-3-2-4.5-3.5-5.5C16 10 17 8.5 17 7c0-3-2-5-5-5z" />, 
    // Star -> Cheese Wedge
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Explosion / Wham!
    flame: <path d="M12 2l2 5h5l-4 4 2 6-5-3-5 3 2-6-4-4h5z" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    // Hammer (Mallet)
    hammer: <path d="M21 10h-3V3h-4v7H3v6h11v5h4v-5h3z" />
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
      {name === 'basket' && <circle cx="12" cy="16" r="2" fill="currentColor" />} {/* Cheese Bait */}
      {name === 'clock' && <path d="M12 6v6l4 2" />}
      {name === 'star' && <circle cx="10" cy="10" r="1" fill="currentColor" />} {/* Cheese Hole */}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#FFF8E1]" />;

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
    // Theme: Tom & Jerry (Kitchen Chase)
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#1E3A8A]">
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&display=swap');
            
            :root {
                --primary: #3B82F6; /* Tom Blue */
                --primary-dark: #1E40AF;
                --secondary: #8D6E63; /* Jerry Brown */
                --accent: #FFD700; /* Cheese Yellow */
                --danger: #EF4444; /* Dynamite Red */
                --stroke: #111827; /* Outline */
            }

            body {
                font-family: 'Comic Neue', cursive;
                background-color: #E0F2FE; /* Kitchen Tile Blue */
                /* --- 🏁 KITCHEN TILE PATTERN --- */
                background-image: 
                    conic-gradient(#BFDBFE 90deg, #E0F2FE 90deg 180deg, #BFDBFE 180deg 270deg, #E0F2FE 270deg);
                background-size: 40px 40px;
                background-attachment: fixed;
            }

            .comic-font {
                font-family: 'Bangers', cursive;
                letter-spacing: 1px;
            }

            /* Reduced Motion: Simple Fade In */
            @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .animate-enter { animation: fade-in-up 0.4s ease-out forwards; }

            .btn-tom {
                background: #3B82F6;
                color: white;
                border: 3px solid #111827;
                border-radius: 1rem;
                font-family: 'Bangers', cursive;
                box-shadow: 4px 4px 0 #111827;
                transition: all 0.1s;
            }
            .btn-tom:active {
                transform: translate(2px, 2px);
                box-shadow: 2px 2px 0 #111827;
            }

            .kitchen-card {
                background: white;
                border: 3px solid #111827;
                border-radius: 1.5rem;
                box-shadow: 6px 6px 0 #8D6E63;
                transition: all 0.2s;
                position: relative;
                overflow: hidden;
            }
            .kitchen-card::after {
                content: '';
                position: absolute;
                bottom: -10px; right: -10px;
                width: 40px; height: 40px;
                background: #FFD700;
                border-radius: 50%;
                opacity: 0.2;
            }
            .kitchen-card:active {
                transform: translate(3px, 3px);
                box-shadow: 3px 3px 0 #8D6E63;
            }

            .tab-btn {
                background: white;
                color: #374151;
                border: 3px solid #9CA3AF;
                border-radius: 1rem;
                transition: all 0.3s;
                font-family: 'Bangers', cursive;
                font-size: 1.2rem;
            }
            .tab-btn.active {
                background: #FFD700;
                color: #111827;
                border-color: #111827;
                box-shadow: 0 4px 0 #F59E0B;
                transform: translateY(-2px);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* --- Header (The Chase) --- */}
        <header className="bg-[#3B82F6] text-white pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-xl z-10 border-b-4 border-[#111827]">
             <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
             <div className="absolute bottom-[-10px] right-[-10px] w-32 h-32 bg-[#FFD700]/20 rounded-full blur-xl"></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#111827] w-fit px-4 py-1.5 rounded-full border-2 border-white shadow-sm transform -rotate-2">
                         <span className="w-3 h-3 rounded-full bg-[#EF4444]"></span>
                         <p className="text-[#FFD700] text-xs font-bold tracking-widest uppercase comic-font">KITCHEN TABLE: {tableLabel}</p>
                     </div>
                     <h1 className="text-4xl font-normal tracking-wide leading-none mt-2 comic-font text-white drop-shadow-[3px_3px_0_#111827] transform rotate-1">
                         {brand?.name || "Tom's Kitchen"}
                     </h1>
                 </div>
                 {/* Tom Icon */}
                 <div className="w-20 h-20 bg-[#9CA3AF] rounded-full border-4 border-[#111827] flex items-center justify-center relative shadow-[0_4px_0_#4B5563] transform rotate-3">
                     <Icon name="chef" className="text-[#111827] w-12 h-12" />
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#EF4444] rounded-full border-2 border-[#111827] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        💥
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-enter">
                    {/* Hero Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[2rem] overflow-hidden shadow-[6px_6px_0_#111827] mb-8 border-4 border-[#111827] p-2">
                             <div className="h-full w-full rounded-[1.5rem] overflow-hidden border-2 border-[#3B82F6] relative">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                             </div>
                             <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 bg-[#EF4444] px-6 py-2 rounded-b-xl border-x-4 border-b-4 border-[#111827] shadow-lg">
                                 <span className="comic-font text-xl text-white tracking-wider">CHEESE TRAP!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                         <div>
                             <h2 className="text-3xl font-normal text-[#1E3A8A] comic-font transform -rotate-1 drop-shadow-sm">Catch the Food!</h2>
                             <p className="text-sm text-[#8D6E63] font-bold ml-1 tracking-wide bg-[#FEF3C7] px-2 rounded-full inline-block border border-[#8D6E63]">Before Jerry gets it...</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#FFD700] text-[#111827] px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#F59E0B] transition-colors comic-font border-4 border-[#111827] shadow-[4px_4px_0_#8D6E63] active:translate-y-[2px] active:shadow-none text-lg">
                             OPEN FRIDGE <Icon name="menu" size={20} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="kitchen-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#DBEAFE] border-b-4 border-[#3B82F6]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#EF4444] text-white text-xs font-bold px-2 py-1 rounded-md border-2 border-[#111827] transform -rotate-6 shadow-sm comic-font">
                                                BOOM! SALE
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#111827] text-lg line-clamp-2 mb-1 leading-tight comic-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-xs text-gray-400 line-through decoration-[#EF4444] decoration-2 font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#3B82F6] font-black text-2xl comic-font leading-none drop-shadow-[1px_1px_0_#E0F2FE]">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFD700] text-[#111827] border-2 border-[#111827] flex items-center justify-center rounded-full hover:bg-[#F59E0B] transition-all shadow-[2px_2px_0_#111827] active:translate-y-1 active:shadow-none">
                                                 <Icon name="plus" size={20} strokeWidth={3} />
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
                <section className="animate-enter pt-4">
                    <div className="relative mb-8 group">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#3B82F6]" />
                         </div>
                         <input type="text" placeholder="Sniff out cheese..." className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border-4 border-[#111827] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FFD700] focus:shadow-[4px_4px_0_#111827] transition-all text-xl font-bold comic-font" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-6 py-3 text-lg font-bold rounded-xl flex items-center gap-2 ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-24">
                        {filteredProducts?.map((p: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="kitchen-card overflow-hidden relative cursor-pointer group">
                                     <div className="w-full h-36 overflow-hidden relative bg-[#DBEAFE] border-b-4 border-[#3B82F6]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#111827] text-lg line-clamp-2 mb-1 leading-tight comic-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-xs text-gray-400 line-through decoration-[#EF4444] decoration-2 font-bold">{pricing.original}</span>}
                                                <span className="text-[#3B82F6] font-black text-2xl comic-font leading-none drop-shadow-[1px_1px_0_#E0F2FE]">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-10 h-10 bg-[#FFD700] text-[#111827] border-2 border-[#111827] flex items-center justify-center rounded-full hover:bg-[#F59E0B] transition-all shadow-[2px_2px_0_#111827] active:translate-y-1 active:shadow-none">
                                                 <Icon name="plus" size={20} strokeWidth={3} />
                                             </button>
                                         </div>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- STATUS PAGE (Coyote/Trap Theme) --- */}
{activeTab === 'status' && (
    <section className="animate-enter pt-4 pb-24">
        {/* Header: Trap Log */}
        <div className="mb-8 flex items-center justify-between bg-[#111827] p-6 border-4 border-[#3B82F6] rounded-[2rem] shadow-[6px_6px_0_#8D6E63] relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#3B82F6] rounded-full border-4 border-white opacity-50"></div>
             <div className="relative z-10">
                 <h2 className="text-3xl font-normal comic-font text-[#FFD700] drop-shadow-md">Trap Log</h2>
                 <p className="text-sm text-white font-bold mt-1 tracking-wider">Is the trap set?</p>
             </div>
             {/* Clock Icon */}
             <div className="w-16 h-16 bg-[#EF4444] border-4 border-white rounded-full flex items-center justify-center animate-pulse">
                 <Icon name="clock" className="text-white" size={32} />
             </div>
        </div>

        <div className="space-y-4">
            {ordersList?.map((o: any) => (
                <div key={o.id} className="bg-white p-5 border-4 border-[#111827] rounded-[2rem] relative overflow-hidden shadow-[6px_6px_0_#EF4444]">
                    
                    {/* Header: Plan ID & Status */}
                    <div className="flex justify-between items-start mb-4">
                         <span className="text-sm text-[#1E3A8A] font-bold uppercase tracking-widest flex items-center gap-1 comic-font">
                             Plan #{o.id.slice(-4)}
                         </span>
                         <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wide border-2 flex items-center gap-1.5 comic-font shadow-sm rounded-lg transform -rotate-1
                             ${o.status === 'pending' ? 'bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]' : 'bg-[#D1FAE5] text-[#059669] border-[#10B981]'}`}>
                             {o.status === 'pending' ? 'CHASING...' : 'CAUGHT!'}
                         </span>
                    </div>

                    {/* Order Items List */}
                    <div className="mb-3 space-y-1 bg-[#F3F4F6] p-4 border-2 border-[#D1D5DB] rounded-xl">
                        {o.order_items.map((i: any, idx: any) => {
                            // ✅ LOGIC: คำนวณราคาและส่วนลด
                            const quantity = i.quantity || 1;
                            const finalPriceTotal = i.price * quantity;
                            
                            const hasDiscount = (i.original_price && i.original_price > i.price) || (i.discount > 0);
                            
                            const originalPriceTotal = hasDiscount 
                                ? (i.original_price ? i.original_price * i.quantity : (i.price + (i.discount || 0)) * i.quantity) 
                                : finalPriceTotal;
                                
                            const discountAmount = originalPriceTotal - finalPriceTotal;

                            return (
                                <div key={idx} className="flex justify-between items-start text-lg text-[#111827] font-bold mb-2 border-b border-dashed border-[#9CA3AF] pb-2 last:border-0 comic-font">
                                    
                                    {/* Left: Info */}
                                    <div className="flex flex-col items-start pr-2">
                                        <span className="leading-tight text-xl">{quantity}x {i.product_name}</span>
                                        
                                        {/* Variant Badge (Explosive Style) */}
                                        {i.variant !== 'normal' && (
                                            <span className={`text-[10px] bg-[#EF4444] text-white px-2 py-0.5 rounded-none border-2 border-black font-sans font-bold mt-1 shadow-[2px_2px_0_black] uppercase tracking-wider transform -rotate-2`}>
                                                {i.variant === 'special' ? '🧨 TNT' : i.variant === 'jumbo' ? '💣 NUKE' : i.variant}
                                            </span>
                                        )}

                                        {/* Note */}
                                        {i.note && <span className="text-xs text-[#8D6E63] italic sans-serif mt-0.5">"{i.note}"</span>}
                                    </div>

                                    {/* Right: Price */}
                                    <div className="text-right flex flex-col items-end min-w-[80px]">
                                        {hasDiscount ? (
                                            <>
                                                {/* 🔥 ป้าย SAVE (Bang! Style) */}
                                                <span className="text-[10px] text-black bg-[#FCD34D] px-2 py-0.5 rounded-sm font-sans font-bold mb-1 shadow-sm border-2 border-black transform rotate-3 animate-pulse">
                                                    SAVE -{discountAmount}
                                                </span>

                                                {/* ราคาเต็ม (ขีดฆ่า) */}
                                                <span className="text-sm text-[#6B7280] line-through decoration-[#EF4444] decoration-4 sans-serif opacity-70 mb-0.5 font-bold">
                                                    {originalPriceTotal}
                                                </span>

                                                {/* ราคาจริง */}
                                                <span className="text-[#EF4444] text-2xl leading-none">
                                                    {finalPriceTotal}.-
                                                </span>
                                            </>
                                        ) : (
                                            // ราคาปกติ
                                            <span className="text-[#EF4444] text-2xl">{finalPriceTotal}.-</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer: Total */}
                    <div className="flex justify-between items-center pt-2 border-t-2 border-[#111827]">
                         <span className="font-bold text-[#8D6E63] text-sm uppercase tracking-widest comic-font">DAMAGE</span>
                         <span className="font-black text-[#111827] text-3xl comic-font">
                             {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                         </span>
                    </div>
                </div>
            ))}
            
            {/* Empty State */}
            {(!ordersList || ordersList.length === 0) && (
                 <div className="text-center py-12 opacity-50">
                    <div className="w-20 h-20 bg-[#F3F4F6] rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-[#111827]">
                        <Icon name="search" size={40} className="text-[#111827]" />
                    </div>
                    <p className="comic-font text-2xl text-[#111827]">No traps triggered yet...</p>
                 </div>
            )}
        </div>
    </section>
)}

        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[75px] bg-white shadow-[0_8px_0_#111827] flex justify-around items-center px-4 z-[90] rounded-full border-4 border-[#3B82F6]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'home' ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#DBEAFE] border-2 border-[#3B82F6]' : ''}`}>
                     <Icon name="home" />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'menu' ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-[#DBEAFE] border-2 border-[#3B82F6]' : ''}`}>
                     <Icon name="menu" />
                 </div>
             </button>

             {/* Big Cart Button (Mousetrap) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#EF4444] rounded-full shadow-[0_6px_0_#B91C1C] flex items-center justify-center text-white border-4 border-[#111827] active:shadow-none active:translate-y-[6px] transition-all duration-100 z-20 group hover:scale-105">
                     <Icon name="basket" size={36} className="group-hover:scale-110 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#FFD700] text-[#111827] text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-[#111827] comic-font">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-14 group ${activeTab === 'status' ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-[#DBEAFE] border-2 border-[#3B82F6]' : ''}`}>
                     <Icon name="clock" />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Cookbook) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#111827]/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-full max-w-md bg-white border-t-8 border-x-8 border-[#111827] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-[0_-10px_0_#EF4444] rounded-t-[3rem] animate-in slide-in-from-bottom duration-300">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#EF4444] text-white rounded-full border-4 border-[#111827] flex items-center justify-center hover:bg-[#DC2626] transition-colors shadow-[0_4px_0_#991B1B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-72 overflow-hidden border-b-8 border-[#111827] rounded-b-[2rem] bg-[#3B82F6]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#FFD700] text-[#111827] font-normal text-3xl comic-font rounded-xl border-4 border-[#111827] shadow-[0_4px_0_#B45309] transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-base line-through text-[#8D6E63] decoration-[#EF4444] decoration-4 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32 relative overflow-hidden bg-[#FFF8E1]">
                        <h2 className="text-4xl comic-font text-[#1E3A8A] mb-6 leading-tight transform rotate-1 drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-5 relative z-10">
                            {/* --- 🏷️ VARIANT SELECTOR (3 PRICES) --- */}
                            <div>
                                <label className="block text-lg font-bold text-[#111827] mb-3 comic-font ml-1 tracking-wide">SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'MOUSE', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'CAT', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'SPIKE', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-xl border-4 transition-all flex flex-col items-center justify-between h-24 comic-font
                                                ${variant === v.key 
                                                    ? 'bg-[#3B82F6] border-[#1E40AF] shadow-[0_4px_0_#111827] -translate-y-1 text-white' 
                                                    : 'bg-white border-[#D1D5DB] text-[#9CA3AF] hover:border-[#3B82F6] hover:text-[#3B82F6]'}`}
                                        >
                                            <span className="text-xs font-bold tracking-widest">{v.label}</span>
                                            <div className="flex flex-col items-center leading-none">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-[#EF4444] decoration-2 opacity-70">{v.original}</span>
                                                )}
                                                <span className="text-xl font-normal">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2 bg-white border-4 border-[#111827] rounded-2xl p-4 shadow-[0_4px_0_#9CA3AF]">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-[#E5E7EB] border-2 border-[#9CA3AF] text-[#374151] rounded-full flex items-center justify-center hover:bg-[#D1D5DB] active:scale-90 transition-all font-black text-xl"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-4xl font-normal w-14 text-center text-[#111827] comic-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#3B82F6] border-2 border-[#1E40AF] text-white rounded-full flex items-center justify-center hover:bg-[#2563EB] active:scale-90 transition-all font-black text-xl"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[#8D6E63] font-bold uppercase tracking-widest mb-1 comic-font">TOTAL</p>
                                    <p className="text-5xl font-normal text-[#111827] comic-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Note Input */}
                            <div className="relative">
                                <label className="block text-lg font-bold text-[#111827] mb-2 comic-font ml-1 tracking-wide">KITCHEN NOTE:</label>
                                <div className="relative">
                                    <textarea 
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="E.g., Extra cheese, No dynamite..." 
                                        className="w-full p-4 pl-12 bg-white border-4 border-[#D1D5DB] rounded-2xl font-bold text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_4px_0_#93C5FD] transition-all resize-none h-28 text-lg font-sans"
                                    />
                                    <div className="absolute top-4 left-4 text-[#8D6E63]">
                                        <Icon name="pencil" size={24} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-[#FFF] border-4 border-[#111827] text-[#111827] font-bold text-xl rounded-xl active:scale-95 transition-all shadow-[0_4px_0_#9CA3AF] comic-font">
                                SET TRAP
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-tom text-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                WHAM! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (The Trap) --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#111827]/80 backdrop-blur-sm animate-in fade-in duration-300">
                 <div className="w-full max-w-md bg-[#FFF] border-t-8 border-[#111827] flex flex-col shadow-[0_-10px_0_#3B82F6] h-[85vh] rounded-t-[3rem] animate-in slide-in-from-bottom duration-300 relative">
                     {/* Decorative Elements */}
                     <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                        <Icon name="basket" size={64} className="text-[#EF4444]" />
                     </div>

                     <div className="w-full py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                         <div className="w-20 h-2 bg-[#111827] rounded-full mx-auto opacity-20" />
                     </div>

                     <div className="flex justify-between items-center mb-6 px-8 pt-2">
                         <h2 className="text-4xl comic-font text-[#1E3A8A] drop-shadow-sm transform -rotate-2">Your Stash</h2>
                         <div className="w-14 h-14 bg-[#FFD700] text-[#111827] border-4 border-[#111827] rounded-xl flex items-center justify-center font-bold text-2xl comic-font shadow-[0_4px_0_#B45309]">
                             <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                         </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                         {cart.map((item: any, idx: any) => (
                             <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-[#8D6E63] rounded-2xl relative overflow-hidden shadow-[0_4px_0_#D1D5DB]">
                                 <div className="w-4 h-full absolute left-0 top-0 bg-[#3B82F6]" />
                                 <img src={item.image_url} className="w-20 h-20 object-cover border-4 border-[#D1D5DB] rounded-xl ml-4 bg-[#F3F4F6]" />
                                 <div className="flex-1">
                                     <div className="font-bold text-[#111827] text-xl leading-tight comic-font tracking-wide">
                                         {item.name} <span className="text-[#3B82F6]">x{item.quantity}</span>
                                     </div>
                                     <div className="text-sm font-bold mt-1">
                                         {item.variant !== 'normal' && <span className="bg-[#FFD700] text-[#111827] px-2 py-0.5 border border-[#B45309] rounded text-xs mr-2">{item.variant}</span>}
                                         {item.note && <span className="block text-[#8D6E63] italic mt-1 text-xs">"{item.note}"</span>}
                                     </div>
                                 </div>
                                 <div className="font-black text-[#1E3A8A] text-2xl comic-font">{item.price * item.quantity}.-</div>
                                 <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#FEF2F2] hover:bg-[#FEE2E2] flex items-center justify-center text-[#EF4444] border-2 border-[#FECACA] rounded-xl transition-colors active:scale-90 shadow-sm">
                                     <Icon name="trash" size={20} />
                                 </button>
                             </div>
                         ))}
                         {cart.length === 0 && (
                             <div className="text-center py-10 text-[#9CA3AF] font-bold text-xl">Fridge is empty...</div>
                         )}
                     </div>

                     <div className="p-8 bg-[#3B82F6] border-t-4 border-[#1E40AF] relative z-30 rounded-t-[2.5rem]">
                         <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-[#93C5FD]">
                             <div>
                                 <p className="text-sm text-[#DBEAFE] font-black uppercase tracking-widest comic-font">TOTAL DAMAGE</p>
                                 <p className="text-6xl font-normal text-[#FFF] comic-font drop-shadow-md">{cartTotal}.-</p>
                             </div>
                             <div className="w-20 h-20 bg-[#FFD700] border-4 border-[#111827] rounded-full flex items-center justify-center text-[#111827] transform rotate-6 shadow-[0_4px_0_#B45309]">
                                 <Icon name="basket" size={40} />
                             </div>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-5 btn-tom text-3xl active:scale-95 transition-all flex items-center justify-center gap-3 border-4 border-[#1E40AF]">
                             <span>CHECKOUT!</span> <Icon name="check" size={32} strokeWidth={4} />
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#111827]/90 z-[200] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
                <div className="w-full max-w-sm bg-[#FFF8E1] border-8 border-[#3B82F6] p-8 text-center shadow-[0_10px_0_#1E40AF] animate-in zoom-in duration-300 relative overflow-hidden rounded-[2.5rem]">
                    <div className="w-28 h-28 bg-[#EF4444] text-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#111827] shadow-[0_4px_0_#991B1B]">
                        <Icon name="flame" size={56} />
                    </div>
                    
                    {selectedProduct ? (
                        <>
                            <h3 className="text-4xl comic-font text-[#111827] mb-2 leading-tight">GOTCHA!</h3>
                            <p className="text-xl text-[#8D6E63] mb-8 font-bold leading-tight">Add "{selectedProduct.name}" to the pile?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 bg-[#FFD700] text-[#111827] font-bold border-4 border-[#111827] shadow-[0_4px_0_#B45309] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl comic-font rounded-xl">YES, GRAB IT!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-white border-4 border-[#9CA3AF] text-[#374151] font-bold text-lg active:scale-95 transition-transform hover:bg-[#F3F4F6] rounded-xl">JUST STASH IT</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl comic-font text-[#111827] mb-2 leading-tight">EAT NOW?</h3>
                            <p className="text-xl text-[#8D6E63] mb-8 font-bold leading-tight">Ready to devour everything?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-[#3B82F6] text-white font-bold border-4 border-[#1E40AF] shadow-[0_4px_0_#111827] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-xl comic-font rounded-xl">YES, I'M HUNGRY!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-[#9CA3AF] text-[#374151] font-bold text-lg active:scale-95 transition-transform hover:bg-[#F3F4F6] rounded-xl">NOT YET!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}