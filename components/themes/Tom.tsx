import React, { useState, useEffect, useRef } from "react";

// --- 🧀 Tom & Jerry Icons Wrapper ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Mouse Hole
    home: <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm5 15h-2v-6H9v6H7v-7.81l5-4.5 5 4.5V18z" />,
    // Menu -> Cheese Wedge
    menu: <path d="M2 12h20v2H2zM2 7h20v2H2zM2 17h20v2H2z" />,
    // Search
    search: <circle cx="11" cy="11" r="8" />,
    // Basket -> Shopping Basket
    basket: <path d="M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1h-4.79zM9 9l3-4.4L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />,
    // Clock -> Running / Chase
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Chef Hat / Cat
    chef: <path d="M12 2c-4 0-8 4-8 9 0 4.5 3.5 8 8 8s8-3.5 8-8c0-5-4-9-8-9zm0 14c-1.5 0-3-1-3-2.5S10.5 11 12 11s3 1 3 2.5S13.5 16 12 16z" />,
    // Star -> Cheese Slice
    star: <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />,
    plus: <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />,
    minus: <path d="M19 13H5v-2h14v2z" />,
    x: <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />,
    trash: <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Run / Dash
    flame: <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />,
    pencil: <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />,
    // Running
    run: <path d="M13.49 10c-3.03 0-5.49 2.46-5.49 5.49 0 3.03 2.46 5.49 5.49 5.49 3.03 0 5.49-2.46 5.49-5.49 0-3.03-2.46-5.49-5.49-5.49zm0 8.98c-1.92 0-3.49-1.57-3.49-3.49 0-1.92 1.57-3.49 3.49-3.49 1.92 0 3.49 1.57 3.49 3.49 0 1.92-1.57 3.49-3.49 3.49z M19 3H5v2h14V3z M19 7H5v2h14V7z" />
  };

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
      {icons[name] || icons.home}
      {name === 'search' && <path d="m21 21-4.3-4.3" />}
      {name === 'basket' && <path d="M12 13h2" opacity="0.5"/>}
      {name === 'clock' && <path d="M12 6v6l4 2" />}
    </svg>
  );
};

export default function TomAndJerryTheme({ state, actions, helpers }) {
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

  // --- 🔥 AUTO-CHECKOUT LOGIC (100% Preserved) ---
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#fef3c7] flex items-center justify-center text-[#92400e] font-black text-2xl animate-pulse">Chasing...</div>;

  const currentPriceObj = selectedProduct 
    ? calculatePrice(selectedProduct, variant) 
    : { final: 0 };

  // --- 📝 Logic Handlers (100% Preserved) ---
  const handleAdd = (addToCartOnly = true) => {
    if (!selectedProduct) return;
    const finalNote = note ? note.trim() : ""; 
    
    // 💥 Force Bind Safety (from previous safe version)
    const productToAdd = { 
        ...selectedProduct, 
        variant: variant, 
        note: finalNote,
        specialRequest: finalNote, 
        comment: finalNote,
        remark: finalNote
    };

    if (addToCartOnly) {
        for(let i=0; i<qty; i++) {
            handleAddToCart(productToAdd, variant, finalNote);
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
    const finalNote = note ? note.trim() : "";
    const productToAdd = { 
        ...selectedProduct, 
        variant: variant, 
        note: finalNote,
        specialRequest: finalNote,
        comment: finalNote,
        remark: finalNote
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
    // Theme: Tom & Jerry's Kitchen
    <div className="w-full max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden border-x-4 border-slate-300 font-sans text-slate-800">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Mali:ital,wght@0,300;0,400;0,600;0,700;1,600&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --tom-gray: #64748b;
                --tom-dark: #334155;
                --jerry-brown: #92400e;
                --cheese-yellow: #fbbf24;
                --cheese-dark: #d97706;
                --bg-kitchen: #fef3c7;
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg-kitchen);
                /* Cheese Pattern */
                background-image: 
                    radial-gradient(circle at 20% 30%, var(--cheese-yellow) 2%, transparent 3%),
                    radial-gradient(circle at 80% 70%, var(--cheese-yellow) 4%, transparent 5%),
                    radial-gradient(circle at 40% 80%, var(--cheese-yellow) 3%, transparent 4%);
                background-size: 100px 100px;
                background-attachment: fixed;
                -webkit-tap-highlight-color: transparent;
            }

            .cartoon-font { font-family: 'Mali', cursive; }

            .item-card {
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                background: #fff;
                border-radius: 2rem;
                border: 4px solid var(--tom-gray);
                box-shadow: 6px 6px 0px var(--jerry-brown);
                overflow: hidden;
            }
            .item-card:hover, .item-card:active {
                transform: scale(0.98);
                border-color: var(--cheese-yellow);
                box-shadow: 3px 3px 0px var(--cheese-dark);
            }

            .btn-cheese {
                background: var(--cheese-yellow);
                color: var(--jerry-brown);
                border: 3px solid var(--jerry-brown);
                border-radius: 1.5rem;
                font-family: 'Mali', cursive;
                font-weight: 900;
                box-shadow: 0 5px 0 var(--jerry-brown);
                transition: all 0.1s;
            }
            .btn-cheese:active { transform: translateY(5px); box-shadow: 0 0 0 var(--jerry-brown); }

            .btn-tom {
                background: var(--tom-gray);
                color: white;
                border-radius: 1.5rem;
                border: 3px solid var(--tom-dark);
                box-shadow: 0 5px 0 var(--tom-dark);
            }

            .tab-btn {
                transition: all 0.3s;
                background: #fff;
                color: var(--tom-gray);
                border: 2px solid var(--tom-gray);
                border-radius: 1.2rem;
            }
            .tab-active {
                background: var(--cheese-yellow) !important;
                color: var(--jerry-brown) !important;
                border: 3px solid var(--jerry-brown);
                box-shadow: 4px 4px 0px var(--jerry-brown);
                transform: scale(1.1);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            @keyframes bounceIn {
                0%, 20%, 40%, 60%, 80%, 100% { animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); }
                0% { opacity: 0; transform: scale3d(.3, .3, .3); }
                20% { transform: scale3d(1.1, 1.1, 1.1); }
                40% { transform: scale3d(.9, .9, .9); }
                60% { opacity: 1; transform: scale3d(1.03, 1.03, 1.03); }
                80% { transform: scale3d(.97, .97, .97); }
                100% { opacity: 1; transform: scale3d(1, 1, 1); }
            }
            .animate-bounce-in { animation: bounceIn 0.8s; }
            
            .page-transition { animation: bounceIn 0.6s; }
            
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
        `}} />

        {/* --- Header --- */}
        <header className="bg-slate-500 text-white pt-8 pb-16 px-6 rounded-b-[4rem] relative overflow-hidden shadow-xl z-10 border-b-8 border-slate-700">
             <div className="absolute inset-0 opacity-10" style={{backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 5px, transparent 5px, transparent 20px)`}}></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-[#fbbf24] w-fit px-4 py-1 rounded-full border-2 border-[#92400e] shadow-sm transform -rotate-2">
                         <span className="w-3 h-3 rounded-full bg-white animate-ping border border-[#92400e]"></span>
                         <p className="text-[#92400e] text-xs font-black tracking-wide cartoon-font uppercase">The Great Chase: {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl cartoon-font tracking-wide leading-none mt-2 text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
                         {brand?.name || "Tom's Kitchen"}
                     </h1>
                 </div>
                 
                 <div className="w-20 h-20 bg-white rounded-full border-4 border-slate-700 flex items-center justify-center relative shadow-lg overflow-hidden group">
                     <div className="absolute bottom-0 w-12 h-14 bg-[#2d1a12]" style={{clipPath: 'ellipse(50% 60% at 50% 100%)'}}></div>
                     <div className="relative z-10 mt-4 text-[#92400e] group-hover:animate-bounce">
                        <Icon name="chef" size={40} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="page-transition">
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-[8px_8px_0_#334155] mb-8 border-4 border-white p-2">
                             <div className="h-full w-full rounded-[2rem] overflow-hidden bg-white relative">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                             </div>
                             <div className="absolute top-4 right-4 bg-[#fbbf24] text-[#92400e] px-5 py-2 rounded-xl border-4 border-[#92400e] transform rotate-6 shadow-md">
                                 <span className="cartoon-font text-xl uppercase">Jerry's Stash!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2">
                         <div>
                             <h2 className="text-3xl cartoon-font text-[#1e293b] drop-shadow-sm transform -rotate-1">Delicious Loot</h2>
                             <p className="text-sm text-slate-500 font-bold cartoon-font ml-1">Don't let Tom see you!</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-[#fbbf24] text-[#92400e] px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-[#f59e0b] transition-all cartoon-font border-4 border-[#92400e] shadow-[4px_4px_0_#92400e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                             Menu <Icon name="menu" size={16} />
                         </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-36 overflow-hidden relative bg-white border-b-4 border-[#94a3b8] mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg border-2 border-slate-800 transform -rotate-6 shadow-sm">SALE!</div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2 leading-tight cartoon-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-slate-400 line-through decoration-[#fbbf24] decoration-2 font-bold">{pricing.original}</span>}
                                                 <span className="text-[#d97706] font-black text-xl cartoon-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#fbbf24] text-[#92400e] border-2 border-[#92400e] flex items-center justify-center rounded-lg hover:bg-yellow-300 transition-all shadow-sm active:scale-90">
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
                <section className="page-transition pt-4">
                    <div className="relative mb-8 group">
                         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none"><Icon name="search" className="text-slate-400 text-xl" /></div>
                         <input type="text" placeholder="Sniff for snacks..." className="w-full pl-16 pr-8 py-5 rounded-full bg-white border-4 border-slate-300 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#fbbf24] focus:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all text-lg font-bold cartoon-font" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} className={`tab-btn shrink-0 px-8 py-3 text-lg font-bold cartoon-font ${selectedCategoryId === c.id ? 'tab-active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-24">
                        {filteredProducts?.map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-36 overflow-hidden relative bg-white border-b-4 border-[#94a3b8] mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2 leading-tight cartoon-font tracking-wide h-10">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-slate-400 line-through decoration-[#fbbf24] decoration-2 font-bold">{pricing.original}</span>}
                                                 <span className="text-[#d97706] font-black text-xl cartoon-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#fbbf24] text-[#92400e] border-2 border-[#92400e] flex items-center justify-center rounded-lg hover:bg-yellow-300 transition-all shadow-sm active:scale-90">
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
                <section className="page-transition pt-4 pb-24">
                    <div className="mb-8 flex items-center justify-between bg-white p-7 border-4 border-slate-800 rounded-[2.5rem] shadow-[10px_10px_0_#fbbf24] relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12">🧀</div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black cartoon-font text-slate-800">Chase Status</h2>
                             <p className="text-sm text-red-500 font-bold mt-1 cartoon-font">Run, Jerry, Run!</p>
                         </div>
                         <div className="w-16 h-16 bg-[#fbbf24] border-4 border-slate-800 rounded-full flex items-center justify-center animate-bounce shadow-md text-slate-800">
                             <Icon name="clock" size={32} />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="bg-white p-6 border-4 border-[#94a3b8] rounded-[2.5rem] shadow-sm relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-[#d97706] font-bold uppercase tracking-widest flex items-center gap-1"><Icon name="menu" size={14} /> Ticket #{o.id.slice(-4)}</span>
                                     <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-wide border-2 rounded-full flex items-center gap-1.5 shadow-sm cartoon-font transform -rotate-1 ${o.status === 'pending' ? 'bg-[#fef3c7] text-[#d97706] border-[#fbbf24]' : 'bg-[#dcfce7] text-[#166534] border-[#22c55e]'}`}>
                                       {o.status === 'pending' ? 'Cooking...' : 'Served!'}
                                     </span>
                                </div>
                                <div className="mb-4 space-y-2 bg-[#f1f5f9] p-5 rounded-2xl border-2 border-slate-200">
                                    {o.order_items.map((i, idx) => (
                                        <div key={idx} className="flex justify-between text-sm text-slate-700 font-bold border-b-2 border-dashed border-slate-300 pb-2 last:border-0 cartoon-font">
                                            <div className="flex flex-col">
                                                <span>{i.quantity}x {i.product_name}</span>
                                                {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-white bg-[#64748b] px-1.5 rounded-full w-fit border border-slate-600 uppercase font-bold">{i.variant}</span>}
                                                {i.note && <span className="text-[10px] text-slate-500 italic bg-white px-2 py-0.5 rounded border border-slate-200 mt-1 block w-fit shadow-sm"><Icon name="pencil" size={8} /> "{i.note}"</span>}
                                            </div>
                                            <span className="text-[#d97706]">{i.price * i.quantity}.-</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t-4 border-slate-200">
                                     <span className="font-bold text-slate-400 text-xs uppercase tracking-widest">TOTAL</span>
                                     <span className="font-black text-slate-800 text-3xl cartoon-font">{o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>

        {/* --- FLOATING NAV --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[80px] bg-white shadow-[0_15px_30px_rgba(0,0,0,0.1)] flex justify-around items-center px-4 z-[100] rounded-[2.5rem] border-4 border-slate-100">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-slate-100' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-slate-800 scale-110' : 'text-slate-300'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-slate-100' : ''}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-slate-800 scale-110' : 'text-slate-300'}`} />
                 </div>
             </button>

             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#fbbf24] rounded-full shadow-[0_8px_0_#d97706] flex items-center justify-center text-[#92400e] border-4 border-white active:shadow-none active:translate-y-[8px] transition-all duration-100 z-20 group hover:bg-[#f59e0b]">
                     <Icon name="basket" size={32} className="group-hover:rotate-12 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-white animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-slate-100' : ''}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-slate-800 scale-110' : 'text-slate-300'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/90 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-white border-t-[8px] border-x-[4px] border-slate-700 h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[3rem] relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-slate-800 rounded-full border-4 border-slate-800 flex items-center justify-center hover:bg-red-50 transition-colors shadow-md active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-80 overflow-hidden border-b-[6px] border-slate-700 rounded-b-[2.5rem] bg-slate-100">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-6 py-2 bg-[#fbbf24] text-[#92400e] font-black text-3xl cartoon-font rounded-2xl border-4 border-[#92400e] shadow-[6px_6px_0_rgba(0,0,0,0.2)] transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-[#78350f] decoration-white decoration-2 mb-1">{currentPriceObj.original}</span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32 relative">
                        <h2 className="text-4xl cartoon-font text-slate-800 mb-6 leading-tight drop-shadow-sm">{selectedProduct.name}</h2>
                        <div className="space-y-6">
                            {/* PRICES VARIANT SELECTOR */}
                            <div>
                                <label className="block text-xl font-bold text-slate-800 mb-3 cartoon-font ml-1 tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'TINY', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'BIG', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'HUGE', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center justify-between h-28 cartoon-font ${variant === v.key ? 'bg-slate-700 border-slate-800 shadow-[4px_4px_0_#000] -translate-y-1 text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-[#fbbf24] hover:text-[#d97706]'}`}
                                        >
                                            <span className="text-xs font-black tracking-widest">{v.label}</span>
                                            <Icon name="star" size={24} className={variant === v.key ? "text-[#fbbf24]" : "text-slate-300"} />
                                            <div className="flex flex-col items-center leading-none mt-1">
                                                {v.discount > 0 && <span className="text-[10px] line-through decoration-red-500 decoration-2">{v.original}</span>}
                                                <span className="text-2xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-3 bg-slate-100 p-3 rounded-[2rem] border-4 border-white shadow-md">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white text-slate-800 rounded-full flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all font-black text-2xl border-2 border-slate-800"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-3xl font-black w-16 text-center bg-transparent border-none text-slate-800 cartoon-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-slate-700 active:scale-90 transition-all font-black text-2xl border-2 border-slate-800"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-1 cartoon-font">Total Loot</p>
                                    <p className="text-4xl font-black text-slate-800 cartoon-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* Note Input */}
                            <div className="relative">
                                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes for the chef (Keep it quiet!)..." className="w-full p-6 bg-white border-4 border-slate-700 rounded-[2rem] focus:border-[#fbbf24] focus:outline-none h-36 resize-none text-xl font-bold text-slate-800 placeholder:text-slate-300 transition-colors shadow-inner cartoon-font" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-8">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-white border-4 border-slate-800 text-slate-800 font-black text-xl rounded-2xl active:scale-95 transition-all shadow-[6px_6px_0_#fbbf24] cartoon-font">Stash It</button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-cheese text-2xl active:scale-95 transition-all flex items-center justify-center gap-2">EAT! <Icon name="star" size={24} /></button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ORDER SUMMARY MODAL (FIXED LOGIC) --- */}
        {activeTab === 'cart' && (
            <>
                {/* Overlay */}
                <div 
                    id="orderSummaryOverlay" 
                    className="fixed inset-0 bg-slate-900/80 z-[130] backdrop-blur-sm animate-fade-in block" 
                    onClick={() => setActiveTab('menu')}
                ></div>
                
                {/* Modal Sheet */}
                <div 
                    id="orderSummary" 
                    className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-[8px] border-slate-700 z-[140] flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.3)] h-[90vh] rounded-t-[3.5rem] animate-slide-up"
                >
                    <div className="sticky top-0 bg-white z-20 rounded-t-[3.5rem] border-b-4 border-slate-50 p-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                        <div className="w-24 h-2 bg-slate-200 rounded-full mx-auto mt-2"></div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-6 px-10 pt-6">
                        <h2 className="text-4xl cartoon-font text-slate-800 transform -rotate-1">Mouse Hole Stash</h2>
                        <div className="w-14 h-14 bg-[#fbbf24] text-[#92400e] border-4 border-slate-800 rounded-2xl flex items-center justify-center font-black text-2xl cartoon-font shadow-[4px_4px_0_#92400e]">
                            <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-5 px-8 pb-8 no-scrollbar">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-slate-200 rounded-[2rem] shadow-sm relative overflow-hidden hover:shadow-md hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                                <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden border-2 border-white shrink-0">
                                    <img src={item.image_url} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-800 text-xl leading-tight cartoon-font tracking-wide">
                                        {item.name} <span className="text-[#d97706]">x{item.quantity}</span>
                                    </div>
                                    <div className="text-sm font-bold mt-1 text-slate-400">
                                        {item.variant !== 'normal' && <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs mr-2 border border-slate-300 uppercase font-bold">{item.variant}</span>}
                                        {item.note && (
                                            <span className="block mt-1 bg-white text-slate-500 text-[12px] px-2 py-1 rounded border border-slate-200 italic font-sans">
                                                <Icon name="pencil" size={10} /> "{item.note}"
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                     <span className="font-black text-[#d97706] text-2xl cartoon-font">{item.price * item.quantity}.-</span>
                                     <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors border-2 border-red-100 shadow-sm active:scale-90">
                                         <Icon name="trash" size={18} />
                                     </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="text-center py-20 text-slate-300 font-bold text-2xl cartoon-font opacity-50">Stash is empty...</div>
                        )}
                    </div>

                    <div className="p-10 bg-slate-50 border-t-4 border-slate-800 relative z-30 rounded-t-[3rem]">
                        <div className="flex justify-between items-center mb-8 pb-6 border-b-4 border-dashed border-slate-200">
                            <div>
                                <p className="text-xs text-slate-400 font-black uppercase tracking-widest cartoon-font">Total Cheese</p>
                                <p className="text-5xl cartoon-font text-[#d97706]">{cartTotal}.-</p>
                            </div>
                            <div className="w-20 h-20 bg-white border-4 border-slate-800 rounded-full flex items-center justify-center text-slate-800 transform rotate-6 shadow-xl">
                                <Icon name="basket" size={40} />
                            </div>
                        </div>
                        <button onClick={() => { onCheckoutClick(); }} className="w-full py-6 btn-cheese text-3xl active:scale-95 transition-all flex items-center justify-center gap-4">
                            <span>SCRAM!</span> <Icon name="check" size={32} strokeWidth={4} />
                        </button>
                    </div>
                </div>
            </>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-slate-900/90 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-sm bg-white border-8 border-[#fbbf24] p-10 text-center shadow-[0_0_50px_rgba(251,191,36,0.4)] animate-bounce-in relative overflow-hidden rounded-[3rem]">
                    <div className="w-28 h-28 bg-[#fbbf24] text-white rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-[#92400e] shadow-lg relative z-10">
                        <Icon name="clock" size={60} className="animate-pulse" />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-4xl cartoon-font text-slate-800 mb-4 leading-tight relative z-10">Hold It!</h3>
                            <p className="text-xl text-slate-500 mb-10 font-bold cartoon-font relative z-10">Tom is coming! Shall we stash everything in the hole?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { performCookNow(); setShowConfirm(false); }} className="w-full py-5 bg-red-500 text-white font-black border-4 border-slate-800 shadow-[6px_6px_0_#991b1b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl cartoon-font rounded-2xl uppercase">SCRAM & ORDER!</button>
                                <button onClick={() => { handleAdd(true); setShowConfirm(false); }} className="w-full py-5 bg-white border-4 border-slate-200 text-slate-300 font-black text-lg active:scale-95 transition-transform hover:bg-gray-50 cartoon-font rounded-2xl">Aborted!</button>
                            </div>
                         </>
                    ) : (
                        <>
                            <h3 className="text-4xl cartoon-font text-slate-800 mb-4 leading-tight relative z-10">Ready?</h3>
                            <p className="text-xl text-slate-500 mb-10 font-bold cartoon-font relative z-10">Want to order all your slices together?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { onCheckoutClick(); }} className="w-full py-5 bg-red-500 text-white font-black border-4 border-slate-800 shadow-[6px_6px_0_#991b1b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl cartoon-font rounded-2xl uppercase">YAY! SERVE ALL!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white border-4 border-slate-200 text-slate-300 font-black text-lg active:scale-95 transition-transform hover:bg-gray-50 cartoon-font rounded-2xl">Not yet!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}
    </div>
  );
}