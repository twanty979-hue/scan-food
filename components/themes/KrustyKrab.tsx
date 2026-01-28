import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (SpongeBob / Krusty Krab Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Pineapple House
    home: <path d="M12 2L2 22h20L12 2zm0 6v4M10 14h4" />, 
    // Menu -> Spatula
    menu: <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="3" strokeLinecap="round" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Treasure Chest
    basket: <path d="M5 5h14v2H5z M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zm4 4h2v2H7v-2zm8 0h2v2h-2v-2z" />,
    // Clock -> Alarm Clock
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Krusty Krab Hat
    chef: <path d="M4 18h16v2H4z M6 18V8c0-3 3-5 6-5s6 2 6 5v10" />, 
    // Star -> Patrick Star
    star: <path d="M12 2l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9z" />, 
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Bubble / Fun
    flame: <circle cx="12" cy="12" r="10" strokeWidth="2" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    // Burger
    burger: <path d="M4 15h16v4h-16v-4zM6 9c0-2 3-4 6-4s6 2 6 4v2h-12v-2z" />,
    // Jellyfish
    jellyfish: <path d="M6 10c0-4 3-8 6-8s6 4 6 8v2h-12v-2zM8 14v4M12 14v4M16 14v4" />
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
      {name === 'flame' && <circle cx="15" cy="9" r="3" fill="currentColor" />}
      {name === 'chef' && <path d="M12 10a2 2 0 0 1 0 4 2 2 0 0 1 0-4" fill="currentColor" stroke="none"/>} {/* Anchor */}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#06b6d4] flex items-center justify-center text-white font-black text-2xl">LOADING...</div>;

  const currentPriceObj = selectedProduct 
    ? calculatePrice(selectedProduct, variant) 
    : { final: 0 };

  // --- 📝 Robust Data Passing ---
  const handleAdd = (addToCartOnly = true) => {
    if (!selectedProduct) return;
    const finalNote = note ? note.trim() : ""; 
    
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
        if (cart && cart.length > 0) setShowConfirm(true); 
        else performCookNow();
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
    // Theme: Krusty Krab - Bikini Bottom
    <div className="">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Itim&family=Mali:wght@400;600;700&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                /* SpongeBob Palette */
                --spongebob-yellow: #fbbf24; /* SpongeBob Body */
                --patrick-pink: #f472b6; /* Patrick Body */
                --krab-red: #ef4444; /* Mr. Krabs / Krusty Krab */
                --bikini-blue: #06b6d4; /* Ocean Water */
                --krusty-wood: #78350f; /* Ship/Restaurant wood */
                --text-main: #1e1b4b;
            }

            body {
                font-family: 'Itim', 'Sarabun', sans-serif;
                background-color: var(--bikini-blue);
                /* Sea Flower Sky Pattern (Classic SpongeBob Motif) */
                background-image: 
                    radial-gradient(circle at 10% 20%, rgba(255,255,255,0.2) 2%, transparent 3%),
                    radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2) 4%, transparent 5%),
                    /* Sea Flowers */
                    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 15%, transparent 20%),
                    linear-gradient(45deg, var(--bikini-blue) 0%, #0891b2 100%);
                background-size: 150px 150px;
                background-attachment: fixed;
                -webkit-tap-highlight-color: transparent;
                color: var(--text-main);
                margin: 0;
                padding: 0;
            }

            .spongebob-font {
                font-family: 'Itim', cursive;
                letter-spacing: 0.5px;
            }

            /* Float Animation */
            @keyframes float-underwater {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-15px) rotate(1deg); }
            }

            .animate-underwater {
                animation: float-underwater 4s infinite ease-in-out;
            }

            /* Bubble Pop Animation */
            @keyframes bubble-pop {
                0% { transform: scale(0.5); opacity: 0; }
                80% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }

            .page-transition {
                animation: bubble-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

            /* Item Card - Porous Sponge Look */
            .item-card {
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                background: #fff;
                border-radius: 2.5rem;
                border: 5px solid var(--spongebob-yellow);
                box-shadow: 0 10px 0 var(--krusty-wood);
                overflow: hidden;
            }
            
            .item-card:hover, .item-card:active {
                transform: translateY(5px);
                box-shadow: 0 2px 0 var(--krusty-wood);
                border-color: var(--patrick-pink);
            }

            .ordering-locked {
                filter: grayscale(1) brightness(0.6);
                pointer-events: none;
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            .btn-krusty {
                background: var(--krab-red);
                color: white;
                border: 4px solid white;
                border-radius: 1rem;
                font-weight: 700;
                box-shadow: 0 6px 0 #991b1b;
                transition: all 0.1s;
            }
            
            .btn-krusty:active {
                transform: translateY(6px);
                box-shadow: 0 0 0 #991b1b;
            }

            .tab-active {
                background: var(--spongebob-yellow) !important;
                color: #78350f !important;
                border: 4px solid var(--krusty-wood);
                box-shadow: 0 6px 0 var(--krusty-wood);
                transform: translateY(-2px);
            }
            
            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: var(--bikini-blue);
                border: 3px solid var(--bikini-blue);
                border-radius: 1.5rem;
            }

            .modal-handle-area {
                cursor: pointer;
                padding: 12px 0 20px 0;
                width: 100%;
            }
        `}} />

        {/* --- Header (Krusty Krab Sign Style) --- */}
        <header className="bg-[#78350f] text-white pt-10 pb-16 px-6 rounded-b-none relative overflow-hidden shadow-xl z-10 border-b-8 border-yellow-500">
             {/* Wood texture overlay */}
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl opacity-20"></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-yellow-400 w-fit px-4 py-1.5 rounded-sm border-2 border-white shadow-md transform -rotate-1">
                         <span className="w-3 h-3 rounded-full bg-red-500 animate-ping border border-white"></span>
                         <p className="text-red-700 text-xs font-black tracking-wider spongebob-font uppercase">Order Up!</p>
                     </div>
                     <h1 className="text-3xl spongebob-font tracking-tight leading-none mt-2 text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
                         {brand?.name || "Krusty Krab Kitchen"}
                     </h1>
                 </div>
                 {/* Burger Icon Badge */}
                 <div className="w-18 h-18 bg-yellow-400 rounded-[2rem] border-4 border-white flex items-center justify-center relative shadow-lg transform rotate-6 animate-underwater">
                     <Icon name="burger" size={40} className="text-red-600" />
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-sky-400 rounded-full border-2 border-white flex items-center justify-center text-white">
                        <Icon name="flame" size={14} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20 w-full">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="page-transition">
                    {/* Hero Banner (Pineapple House Style) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-orange-400 rounded-[3rem] overflow-hidden shadow-xl mb-10 border-4 border-white p-2 group">
                             <div className="h-full w-full rounded-[2.5rem] overflow-hidden bg-sky-300 relative">
                                 {/* Shows Real Colors! */}
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover opacity-100 group-hover:opacity-100 transition-opacity" 
                                 />
                             </div>
                             <div className="absolute top-4 right-4 bg-yellow-400 text-red-700 px-5 py-2 rounded-full border-4 border-white transform rotate-3 shadow-lg">
                                 <span className="spongebob-font text-lg font-bold">ME HOY MINOY!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2">
                         <div>
                             <h2 className="text-3xl spongebob-font text-white drop-shadow-[2px_2px_0_#78350f]">Bikini Bottom Treats</h2>
                             <p className="text-sm text-yellow-300 font-bold spongebob-font ml-1">The Finest Dining in the Sea!</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-yellow-400 text-red-700 px-5 py-2.5 rounded-full text-sm font-black flex items-center gap-2 hover:bg-yellow-300 transition-all spongebob-font border-4 border-white shadow-md active:scale-95">
                             Full Menu <Icon name="menu" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-sky-200 border-b-4 border-yellow-400 mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full border-2 border-white shadow-sm spongebob-font transform rotate-3">
                                                SALE!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#1e1b4b] text-lg line-clamp-2 mb-1 leading-tight spongebob-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-gray-500 line-through font-bold decoration-2 decoration-red-500">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#06b6d4] font-black text-2xl spongebob-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-yellow-400 text-white border-2 border-white flex items-center justify-center rounded-full hover:bg-yellow-500 transition-all shadow-sm active:scale-90">
                                                 <Icon name="plus" size={14} strokeWidth={4} />
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
                         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                             <Icon name="search" className="text-yellow-500 text-xl" />
                         </div>
                         <input type="text" placeholder="Sniff for Krabby Patties..." className="w-full pl-16 pr-8 py-5 rounded-full bg-white border-4 border-yellow-400 text-red-900 placeholder:text-yellow-200 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-yellow-200 transition-all text-lg font-bold spongebob-font shadow-inner" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-lg font-bold spongebob-font ${selectedCategoryId === c.id ? 'tab-active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-sky-200 border-b-4 border-yellow-400 mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#1e1b4b] text-lg line-clamp-2 mb-1 leading-tight spongebob-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-[10px] text-gray-500 line-through font-bold decoration-2 decoration-red-500">{pricing.original}</span>}
                                                <span className="text-[#06b6d4] font-black text-2xl spongebob-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-yellow-400 text-white border-2 border-white flex items-center justify-center rounded-full hover:bg-yellow-500 transition-all shadow-sm active:scale-90">
                                                 <Icon name="plus" size={14} strokeWidth={4} />
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
                    <div className="mb-8 flex items-center justify-between bg-white p-8 border-4 border-yellow-500 rounded-[3rem] shadow-xl relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12 text-yellow-400">
                            <Icon name="flame" size={100} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black spongebob-font text-red-600">The Stove</h2>
                             <p className="text-sm text-sky-500 font-bold mt-1 spongebob-font uppercase">Working at the Krusty Krab!</p>
                         </div>
                         <div className="w-16 h-16 bg-yellow-100 border-4 border-yellow-500 rounded-full flex items-center justify-center animate-bounce shadow-md">
                             <Icon name="chef" size={32} className="text-red-500" />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-white p-6 border-4 border-yellow-200 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-red-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                         <Icon name="menu" size={14} /> Order #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-wide border-2 border-yellow-400 rounded-full flex items-center gap-1.5 shadow-sm spongebob-font transform -rotate-1
                                        ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                         {o.status === 'pending' ? 'GRILLING...' : 'SERVED!'}
                                     </span>
                                </div>
                                <div className="mb-4 space-y-2 bg-sky-50 p-5 rounded-2xl border-2 border-sky-100">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-[#1e1b4b] font-bold border-b-2 border-dashed border-sky-200 pb-2 last:border-0 spongebob-font">
                                            <div className="flex flex-col">
                                                <span>{i.quantity}x {i.product_name}</span>
                                                {/* Variant */}
                                                {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-white bg-pink-400 px-1.5 rounded w-fit border border-pink-500 uppercase font-bold">{i.variant}</span>}
                                                {/* Note */}
                                                {i.note && <span className="text-[10px] text-sky-600 italic bg-white px-2 py-0.5 rounded border border-sky-200 mt-1 block w-fit shadow-sm"><Icon name="pencil" size={8} /> "{i.note}"</span>}
                                            </div>
                                            <span className="text-red-500">{i.price * i.quantity}.-</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t-4 border-yellow-200">
                                     <span className="font-bold text-gray-400 text-xs uppercase tracking-widest">TOTAL</span>
                                     <span className="font-black text-[#1e1b4b] text-3xl spongebob-font">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Bubbly Style) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[85px] bg-white/90 backdrop-blur-md shadow-2xl flex justify-around items-center px-4 z-[100] rounded-[2.5rem] border-4 border-yellow-200">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-yellow-100' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-yellow-600' : 'text-yellow-400'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-yellow-100' : ''}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-yellow-600' : 'text-yellow-400'}`} />
                 </div>
             </button>

             {/* Big Cart Button (Patrick Pink) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-pink-400 rounded-full shadow-lg flex items-center justify-center text-white border-4 border-white active:scale-90 transition-all duration-100 z-20 group hover:bg-pink-500">
                     <Icon name="basket" size={32} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-yellow-400 text-red-900 text-xs w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-white animate-bounce spongebob-font">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-yellow-100' : ''}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-yellow-600' : 'text-yellow-400'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-blue-900/60 backdrop-blur-md animate-pop-up">
                <div className="w-full max-w-md bg-white border-t-8 border-yellow-500 h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[4rem] relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-red-500 rounded-full border-2 border-yellow-100 flex items-center justify-center hover:bg-red-50 transition-colors shadow-md active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-85 overflow-hidden border-b-4 border-yellow-100 rounded-b-[3.5rem] bg-yellow-50">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-yellow-400 text-red-900 font-black text-3xl spongebob-font rounded-full border-4 border-white shadow-xl transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-red-700 decoration-white decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32 relative">
                        <h2 className="text-4xl spongebob-font text-red-600 mb-6 leading-tight drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            {/* --- 3 PRICES VARIANT SELECTOR --- */}
                            <div>
                                <label className="block text-xl font-bold text-red-700 mb-3 spongebob-font uppercase tracking-wider">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'PATTY', icon: 'burger', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'DOUBLE', icon: 'burger', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'TRIPLE', icon: 'burger', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center justify-between h-28 spongebob-font
                                                ${variant === v.key 
                                                    ? 'bg-yellow-400 border-red-500 shadow-md -translate-y-1 text-red-900' 
                                                    : 'bg-white border-yellow-200 text-yellow-600 hover:border-yellow-400 hover:text-yellow-700'}`}
                                        >
                                            <span className="text-sm font-black tracking-widest">{v.label}</span>
                                            <Icon name={v.icon || "star"} size={24} className={variant === v.key ? "text-red-900" : "text-yellow-300"} />
                                            
                                            <div className="flex flex-col items-center leading-none mt-1">
                                                {v.discount > 0 && (
                                                    <span className="text-[10px] line-through decoration-white decoration-2">{v.original}</span>
                                                )}
                                                <span className="text-2xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-4 bg-white p-3 rounded-full border-4 border-yellow-200 shadow-md">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-red-800 spongebob-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-yellow-400 text-white rounded-full flex items-center justify-center hover:bg-yellow-500 active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-yellow-600 font-black uppercase tracking-widest mb-1 spongebob-font">Doubloons</p>
                                    <p className="text-4xl font-black text-red-600 spongebob-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Item Note Input */}
                            <div className="relative">
                                <label className="block text-xl font-bold text-red-700 mb-2 spongebob-font uppercase tracking-wider">Secret Formula Note:</label>
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="E.g., Extra pickles, hold the mayo..." 
                                    className="w-full p-6 pl-12 bg-blue-50 border-4 border-white rounded-[2.5rem] focus:border-red-400 focus:outline-none h-36 resize-none text-xl font-bold text-red-800 placeholder:text-blue-200 transition-colors shadow-inner spongebob-font"
                                />
                                <div className="absolute top-12 left-4 text-red-400 pointer-events-none">
                                    <Icon name="pencil" size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-white border-4 border-yellow-400 text-red-700 font-black text-xl rounded-full active:scale-95 transition-all shadow-md spongebob-font">
                                Stash It!
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-krusty text-2xl active:scale-95 transition-all flex items-center justify-center gap-2 spongebob-font">
                                EAT NOW! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ORDER SUMMARY MODAL --- */}
        <div id="orderSummaryOverlay" className={`fixed inset-0 bg-blue-900/60 z-[130] backdrop-blur-sm animate-fade-in ${activeTab === 'cart' ? 'block' : 'hidden'}`} onClick={() => setActiveTab('menu')}></div>
        <div id="orderSummary" className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-[10px] border-yellow-400 z-[140] flex flex-col shadow-2xl h-[92vh] rounded-t-[4rem] transition-transform duration-300 ${activeTab === 'cart' ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="sticky top-0 bg-white z-20 rounded-t-[4rem] border-b-4 border-yellow-50 p-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                <div className="w-24 h-2 bg-yellow-200 rounded-full mx-auto mt-2"></div>
            </div>
            
            <div className="flex justify-between items-center mb-6 px-10 pt-8">
                <h2 className="text-4xl spongebob-font text-red-600 transform -rotate-1">Krusty Bag</h2>
                <div className="w-14 h-14 bg-yellow-100 text-yellow-600 border-4 border-white rounded-2xl flex items-center justify-center font-black text-2xl spongebob-font shadow-lg">
                    <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 px-8 pb-4 no-scrollbar">
                {cart.map((item: any, idx: any) => (
                    <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-yellow-100 rounded-[2rem] shadow-sm relative overflow-hidden hover:shadow-md hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                        <div className="w-20 h-20 bg-yellow-50 rounded-2xl overflow-hidden border-2 border-white shrink-0">
                            <img src={item.image_url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-[#1e1b4b] text-xl leading-tight spongebob-font tracking-wide">
                                {item.name} <span className="text-[#06b6d4]">x{item.quantity}</span>
                            </div>
                            <div className="text-sm font-bold mt-1 text-[#ef4444]">
                                {item.variant !== 'normal' && <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs mr-2 border border-yellow-200 uppercase font-bold">{item.variant}</span>}
                                {/* 🔥 VISIBLE ITEM NOTE IN CART */}
                                {item.note && (
                                    <span className="block mt-1 bg-white text-[#1e1b4b] text-[12px] px-2 py-1 rounded border border-yellow-100 italic font-sans">
                                        <Icon name="pencil" size={10} /> "{item.note}"
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className="font-black text-[#166534] text-2xl spongebob-font">{item.price * item.quantity}.-</span>
                             <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#fef2f2] text-[#ef4444] rounded-full flex items-center justify-center hover:bg-red-200 transition-colors border-2 border-white shadow-sm active:scale-90">
                                 <Icon name="trash" size={18} />
                             </button>
                        </div>
                    </div>
                ))}
                {cart.length === 0 && (
                    <div className="text-center py-20 text-yellow-200 font-bold text-2xl spongebob-font opacity-50">
                        Me money...
                    </div>
                )}
            </div>

            <div className="p-10 bg-yellow-50 border-t-4 border-white relative z-30 rounded-t-[4rem]">
                <div className="flex justify-between items-center mb-8 pb-6 border-b-4 border-dashed border-white">
                    <div>
                        <p className="text-xs text-yellow-600 font-black uppercase tracking-widest spongebob-font">Net Payable</p>
                        <p className="text-5xl spongebob-font text-red-600">{cartTotal}.-</p>
                    </div>
                    <div className="w-20 h-20 bg-white border-4 border-yellow-100 rounded-full flex items-center justify-center text-yellow-400 transform rotate-6 shadow-lg">
                        <Icon name="basket" size={40} />
                    </div>
                </div>
                <button onClick={() => { onCheckoutClick(); }} className="w-full py-6 btn-krusty text-3xl active:scale-95 transition-all flex items-center justify-center gap-4 spongebob-font">
                    <span>SCRAM!</span> <Icon name="check" size={32} strokeWidth={4} />
                </button>
            </div>
        </div>

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-blue-900/80 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-pop-image">
                <div className="w-full max-w-sm bg-white border-8 border-yellow-400 p-10 text-center shadow-2xl relative overflow-hidden rounded-[3rem]">
                    <div className="w-28 h-28 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-lg relative z-10 animate-underwater">
                        <Icon name="flame" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-4xl spongebob-font text-red-600 mb-4 leading-tight relative z-10">Ready to Eat?</h3>
                            <p className="text-xl text-sky-500 mb-10 font-bold spongebob-font relative z-10">Add "{selectedProduct.name}" to your order?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-red-500 text-white font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl spongebob-font rounded-full uppercase">YAY! SERVE ALL!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-white border-4 border-yellow-100 text-yellow-400 font-black text-lg active:scale-95 transition-transform hover:bg-yellow-50 spongebob-font rounded-full uppercase">Wait a sec!</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl spongebob-font text-red-600 mb-4 leading-tight relative z-10">Ready to Eat?</h3>
                            <p className="text-xl text-sky-500 mb-10 font-bold spongebob-font relative z-10">Combine all Krabby treats into one big order?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                {/* Pass orderNote to handleCheckout */}
                                <button onClick={() => { onCheckoutClick(); }} className="w-full py-5 bg-red-500 text-white font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl spongebob-font rounded-full uppercase">YAY! SERVE ALL!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white border-4 border-yellow-100 text-yellow-400 font-black text-lg active:scale-95 transition-transform hover:bg-yellow-50 spongebob-font rounded-full uppercase">Wait a sec!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}