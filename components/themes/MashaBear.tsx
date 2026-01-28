import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Masha Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // Home -> Bear's House / Hut
    home: <path d="M2 22 12 2l10 20H2zM12 6v4M10 14h4" />, 
    // Menu -> Apple / Jam Jar
    menu: <path d="M12 2a3 3 0 0 0-3 3v2c-3.3 0-6 2.7-6 6v5h18v-5c0-3.3-2.7-6-6-6V5a3 3 0 0 0-3-3z" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Berry Jar / Basket
    basket: <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2 M9 14h6" />,
    // Clock -> Alarm Clock / Time
    clock: <circle cx="12" cy="12" r="10" />,
    // Chef -> Masha's Hood / Bear
    chef: <path d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z M7 14c0 4 2 8 5 8s5-4 5-8" />, 
    // Star -> Flower / Honey
    star: <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Fun / Play / Sparkle
    flame: <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    // Honey Pot
    honey: <path d="M12 2l2 4h4l-3 3 1 5-4-2-4 2 1-5-3-3h4z" />,
    // Tree / Forest
    tree: <path d="M12 2L4 18h16z M10 18v4h4v-4" />
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
      {name === 'basket' && <path d="M8 12h8" strokeWidth="1.5" opacity="0.5"/>}
      {name === 'clock' && <path d="M12 6v6l4 2" />}
      {name === 'chef' && <path d="M9 14s1.5 2 3 2 3-2 3-2" />} {/* Smile */}
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
  // Removed orderNote
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
             handleCheckout(); // Checkout directly
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#fefce8] flex items-center justify-center text-[#db2777] font-black text-2xl">LOADING...</div>;

  const currentPriceObj = selectedProduct 
    ? calculatePrice(selectedProduct, variant) 
    : { final: 0 };

  // --- 📝 Robust Data Passing ---
  const handleAdd = (addToCartOnly = true) => {
    if (!selectedProduct) return;
    const finalNote = note ? note.trim() : ""; 
    
    // Create a rich product object that includes the choices
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
      handleCheckout();
      setShowConfirm(false);
  };

  return (
    // Theme: Masha & The Bear - Forest Kitchen
    <div className="w-full max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden border-x-4 border-pink-100 bg-[#fefce8] font-sans text-[#451a03]">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Itim&family=Mali:wght@400;600;700&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                /* Masha & Bear Palette */
                --masha-pink: #db2777; /* Masha's Dress */
                --bear-brown: #78350f; /* Bear's Fur */
                --forest-green: #65a30d; /* Forest Leaves */
                --sunflower-yellow: #facc15; /* Nature/Sun */
                --cream-bg: #fefce8;
                --text-main: #451a03;
            }

            body {
                font-family: 'Itim', 'Sarabun', sans-serif;
                background-color: var(--cream-bg);
                /* Forest & Sunflower Pattern */
                background-image: 
                    radial-gradient(var(--forest-green) 1px, transparent 1px),
                    radial-gradient(var(--sunflower-yellow) 1px, transparent 1px);
                background-size: 40px 40px;
                background-position: 0 0, 20px 20px;
                background-attachment: fixed;
                -webkit-tap-highlight-color: transparent;
                color: var(--text-main);
                margin: 0;
                padding: 0;
            }

            .forest-font {
                font-family: 'Mali', cursive;
                font-weight: 700;
            }

            /* Cute Bouncing Animation */
            @keyframes hop {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }

            .animate-hop {
                animation: hop 2s infinite ease-in-out;
            }

            /* Image Pop Animation */
            @keyframes pop-image {
                0% { opacity: 0; transform: scale(0.8) translateY(10px); }
                60% { opacity: 1; transform: scale(1.05); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-image-pop { animation: pop-image 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }

            @keyframes bounceInUp {
                from,
                60%,
                75%,
                90%,
                to {
                    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
                }
                from {
                    opacity: 0;
                    transform: translate3d(0, 3000px, 0) scaleY(5);
                }
                60% {
                    opacity: 1;
                    transform: translate3d(0, -20px, 0) scaleY(0.9);
                }
                75% {
                    transform: translate3d(0, 10px, 0) scaleY(0.95);
                }
                90% {
                    transform: translate3d(0, -5px, 0) scaleY(0.985);
                }
                to {
                    transform: translate3d(0, 0, 0);
                }
            }
            
            .page-transition {
                animation: bounceInUp 0.8s;
            }

            /* Item Card - Nature Window Look */
            .item-card {
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                background: white;
                border-radius: 2rem;
                border: 4px solid #fbcfe8; /* Soft pink border */
                box-shadow: 0 8px 15px rgba(219, 39, 119, 0.1);
                overflow: hidden;
            }
            
            .item-card:hover, .item-card:active {
                transform: scale(0.98) rotate(-1deg);
                border-color: var(--masha-pink);
                box-shadow: 0 4px 10px rgba(219, 39, 119, 0.2);
            }

            .ordering-locked {
                filter: grayscale(1) sepia(0.3);
                pointer-events: none;
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            .btn-masha {
                background: linear-gradient(135deg, var(--masha-pink) 0%, #be185d 100%);
                color: white;
                border: 3px solid white;
                border-radius: 1.5rem;
                font-weight: 700;
                box-shadow: 0 4px 10px rgba(219, 39, 119, 0.3);
                transition: all 0.2s;
            }
            
            .btn-masha:active {
                transform: scale(0.95);
                box-shadow: 0 2px 5px rgba(219, 39, 119, 0.4);
            }

            .tab-active {
                background: var(--masha-pink) !important;
                color: white !important;
                border: 3px solid white;
                box-shadow: 0 6px 12px rgba(219, 39, 119, 0.3);
                transform: scale(1.05);
            }
            
            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: var(--masha-pink);
                border: 2px solid #fbcfe8;
                border-radius: 1.2rem;
                font-weight: 700;
            }

            .modal-handle-area {
                cursor: pointer;
                padding: 12px 0 20px 0;
                width: 100%;
            }
        `}} />

        {/* --- Header (Bear's House Style) --- */}
        <header className="bg-[#78350f] text-white pt-10 pb-16 px-6 rounded-b-[4rem] relative overflow-hidden shadow-xl z-10 border-b-8 border-[#451a03]">
             {/* Sun & Flower Overlays */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl opacity-30"></div>
             <div className="absolute top-4 left-10 text-white/30 text-3xl animate-pulse">
                <Icon name="clock" size={32} /> {/* Sun replacement */}
             </div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-pink-500/80 w-fit px-4 py-1.5 rounded-full border-2 border-white shadow-md transform rotate-1">
                         <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
                         <p className="text-white text-xs font-bold tracking-wider forest-font uppercase">Gathering treats!</p>
                     </div>
                     <h1 className="text-3xl forest-font tracking-tight leading-none mt-2 text-white drop-shadow-[0_4px_0_rgba(69,26,3,0.5)]">
                         {brand?.name || "Bear's Cozy Kitchen"}
                     </h1>
                 </div>
                 {/* Paw Badge Icon */}
                 <div className="w-20 h-20 bg-white rounded-full border-4 border-pink-200 flex items-center justify-center relative shadow-lg transform -rotate-6 animate-hop">
                     <Icon name="chef" size={40} className="text-[#78350f]" />
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-pink-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
                        <Icon name="star" size={14} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="page-transition">
                    {/* Hero Banner (Forest Frame Style) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[3rem] overflow-hidden shadow-xl mb-10 border-4 border-pink-100 p-2 group animate-image-pop">
                             <div className="h-full w-full rounded-[2.5rem] overflow-hidden bg-green-50 relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover" 
                                 />
                             </div>
                             <div className="absolute bottom-4 left-4 bg-yellow-400 text-[#451a03] px-5 py-2 rounded-full border-2 border-white shadow-lg transform rotate-2">
                                 <span className="forest-font text-lg font-bold">BEAR'S FAVORITE!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2 animate-image-pop">
                         <div>
                             <h2 className="text-3xl forest-font text-[#451a03] drop-shadow-sm transform -rotate-1">Forest Nums</h2>
                             <p className="text-sm text-pink-600 font-bold forest-font ml-1">Sweet & Fresh!</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-white text-pink-500 px-5 py-2.5 rounded-full text-sm font-black flex items-center gap-2 hover:bg-pink-50 transition-all forest-font border-2 border-pink-100 shadow-md active:scale-95">
                             See All <Icon name="tree" size={14} />
                         </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#fbcfe8] border-b-4 border-pink-200 mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-[#db2777] text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm forest-font transform rotate-3">
                                                SALE!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#451a03] text-lg line-clamp-2 mb-1 leading-tight forest-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-gray-400 line-through font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-[#db2777] font-black text-2xl forest-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#facc15] text-[#451a03] border-2 border-white flex items-center justify-center rounded-full hover:bg-[#fde047] transition-all shadow-sm active:scale-90">
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
                    <div className="relative mb-8 group animate-image-pop">
                         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                             <Icon name="search" className="text-pink-300" />
                         </div>
                         <input type="text" placeholder="Sniff for berries?..." className="w-full pl-16 pr-8 py-5 rounded-full bg-white border-4 border-pink-50 text-pink-900 placeholder:text-pink-200 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all text-lg font-bold forest-font shadow-inner" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1 animate-image-pop">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-lg font-bold forest-font ${selectedCategoryId === c.id ? 'tab-active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-image-pop" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#fbcfe8] border-b-4 border-pink-200 mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#451a03] text-lg line-clamp-2 mb-1 leading-tight forest-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-[10px] text-gray-400 line-through font-bold">{pricing.original}</span>}
                                                <span className="text-[#db2777] font-black text-2xl forest-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-[#facc15] text-[#451a03] border-2 border-white flex items-center justify-center rounded-full hover:bg-[#fde047] transition-all shadow-sm active:scale-90">
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
                    <div className="mb-8 flex items-center justify-between bg-white p-8 border-4 border-pink-100 rounded-[3rem] shadow-xl relative overflow-hidden transform rotate-1 animate-hop">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12 text-pink-300">
                            <Icon name="star" size={100} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black forest-font text-pink-600">The Tea Log</h2>
                             <p className="text-sm text-green-600 font-bold mt-1 forest-font">Is it tea time yet?</p>
                         </div>
                         <div className="w-16 h-16 bg-pink-100 border-4 border-white rounded-full flex items-center justify-center animate-bounce shadow-md">
                             <Icon name="clock" size={32} className="text-pink-600" />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="bg-white p-6 border-4 border-pink-200 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-[#db2777] font-bold uppercase tracking-widest flex items-center gap-1">
                                         <Icon name="menu" size={14} /> Order #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-wide border-2 border-pink-100 rounded-full flex items-center gap-1.5 shadow-sm forest-font transform -rotate-1
                                        ${o.status === 'pending' ? 'bg-[#fef3c7] text-[#b45309]' : 'bg-[#dcfce7] text-[#166534]'}`}>
                                         {o.status === 'pending' ? 'COOKING...' : 'DONE!'}
                                     </span>
                                </div>
                                <div className="mb-4 space-y-2 bg-[#fdf2f8] p-5 rounded-2xl border-2 border-pink-100">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-[#451a03] font-bold border-b-2 border-dashed border-pink-200 pb-2 last:border-0 forest-font">
                                            <div className="flex flex-col">
                                                <span>{i.quantity}x {i.product_name}</span>
                                                {/* Variant */}
                                                {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-white bg-[#db2777] px-1.5 rounded w-fit border border-pink-300 uppercase font-bold">{i.variant}</span>}
                                                {/* Note */}
                                                {i.note && <span className="text-[10px] text-gray-500 italic bg-white px-2 py-0.5 rounded border border-pink-200 mt-1 block w-fit shadow-sm"><Icon name="pencil" size={8} /> "{i.note}"</span>}
                                            </div>
                                            <span className="text-[#db2777]">{i.price * i.quantity}.-</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t-4 border-pink-100">
                                     <span className="font-bold text-gray-500 text-xs uppercase tracking-widest">TOTAL</span>
                                     <span className="font-black text-[#451a03] text-3xl forest-font">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Forest Path Style) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[85px] bg-white/95 backdrop-blur-md shadow-2xl flex justify-around items-center px-4 z-[100] rounded-[2.5rem] border-4 border-pink-50">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-pink-100' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-pink-500' : 'text-pink-200'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-pink-100' : ''}`}>
                     <Icon name="basket" size={24} className={`${activeTab === 'menu' ? 'text-pink-500' : 'text-pink-200'}`} />
                 </div>
             </button>

             {/* Big Cart Button (Big Berry Jar) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-pink-500 rounded-full shadow-lg flex items-center justify-center text-white border-4 border-white active:scale-90 transition-all duration-100 z-20 group hover:bg-pink-600 animate-hop">
                     <Icon name="basket" size={32} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-yellow-400 text-[#451a03] text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white animate-bounce forest-font">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-pink-100' : ''}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-pink-500' : 'text-pink-200'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-pink-900/40 backdrop-blur-sm animate-image-pop">
                <div className="w-full max-w-md bg-white border-t-8 border-pink-400 h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[4rem] relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-pink-500 rounded-full border-2 border-pink-100 flex items-center justify-center hover:bg-pink-50 transition-colors shadow-md active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-85 overflow-hidden border-b-4 border-pink-50 rounded-b-[3.5rem] bg-pink-50">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-yellow-400 text-[#451a03] font-black text-3xl forest-font rounded-full border-4 border-white shadow-xl transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-[#451a03] decoration-white decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32 relative">
                        <h2 className="text-4xl forest-font text-pink-600 mb-6 leading-tight drop-shadow-sm uppercase tracking-wider">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            {/* --- 3 PRICES VARIANT SELECTOR --- */}
                            <div>
                                <label className="block text-xl font-bold text-[#451a03] mb-3 forest-font uppercase tracking-wider">PICK SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'CUB', icon: 'star', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'BEAR', icon: 'star', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'MASHA', icon: 'star', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center justify-between h-28 forest-font
                                                ${variant === v.key 
                                                    ? 'bg-[#db2777] border-[#be185d] shadow-md -translate-y-1 text-white' 
                                                    : 'bg-white border-pink-100 text-pink-300 hover:border-pink-300 hover:text-pink-500'}`}
                                        >
                                            <span className="text-sm font-black tracking-widest">{v.label}</span>
                                            <Icon name={v.icon || "star"} size={24} className={variant === v.key ? "text-white" : "text-pink-200"} />
                                            
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
                                <div className="flex items-center gap-4 bg-white p-3 rounded-full border-4 border-pink-100 shadow-md">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center hover:bg-pink-100 active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-pink-800 forest-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center hover:bg-pink-600 active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-pink-400 font-black uppercase tracking-widest mb-1 forest-font">Coins</p>
                                    <p className="text-4xl font-black text-pink-600 forest-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Item Note Input */}
                            <div className="relative">
                                <label className="block text-xl font-bold text-[#451a03] mb-2 forest-font uppercase tracking-wider">Note to Bear:</label>
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="A note for Bear or Masha..." 
                                    className="w-full p-6 bg-pink-50 border-4 border-white rounded-[2.5rem] focus:border-pink-300 focus:outline-none h-36 resize-none text-xl font-bold text-pink-800 placeholder:text-pink-200 transition-colors shadow-inner forest-font"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-white border-4 border-pink-50 text-pink-500 font-black text-xl rounded-full active:scale-95 transition-all shadow-md forest-font">
                                Pack It Up!
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-masha text-2xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                LET'S EAT! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ORDER SUMMARY MODAL --- */}
        <div id="orderSummaryOverlay" className={`fixed inset-0 bg-pink-900/60 z-[130] backdrop-blur-sm animate-fade-in ${activeTab === 'cart' ? 'block' : 'hidden'}`} onClick={() => setActiveTab('menu')}></div>
        <div id="orderSummary" className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-[10px] border-pink-100 z-[140] flex flex-col shadow-2xl h-[92vh] rounded-t-[4rem] transition-transform duration-300 ${activeTab === 'cart' ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="sticky top-0 bg-white z-20 rounded-t-[4rem] border-b-4 border-pink-50 p-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                <div className="w-24 h-2 bg-pink-100 rounded-full mx-auto mt-2"></div>
            </div>
            
            <div className="flex justify-between items-center mb-6 px-10 pt-8">
                <h2 className="text-4xl forest-font text-pink-600 transform -rotate-1">Bear's Basket</h2>
                <div className="w-14 h-14 bg-pink-100 text-pink-500 border-4 border-white rounded-2xl flex items-center justify-center font-black text-2xl forest-font shadow-lg">
                    <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 px-8 pb-4 no-scrollbar">
                {cart.map((item: any, idx: any) => (
                    <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-pink-100 rounded-[2rem] shadow-sm relative overflow-hidden hover:shadow-md hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                        <div className="w-20 h-20 bg-pink-50 rounded-2xl overflow-hidden border-2 border-white shrink-0">
                            <img src={item.image_url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-[#451a03] text-xl leading-tight forest-font tracking-wide">
                                {item.name} <span className="text-[#db2777]">x{item.quantity}</span>
                            </div>
                            <div className="text-sm font-bold mt-1 text-pink-400">
                                {item.variant !== 'normal' && <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full text-xs mr-2 border border-pink-200 uppercase font-bold">{item.variant}</span>}
                                {/* 🔥 VISIBLE ITEM NOTE IN CART */}
                                {item.note && (
                                    <span className="block mt-1 bg-white text-[#451a03] text-[12px] px-2 py-1 rounded border border-pink-100 italic font-sans">
                                        <Icon name="pencil" size={10} /> "{item.note}"
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className="font-black text-[#db2777] text-2xl forest-font">{item.price * item.quantity}.-</span>
                             <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-pink-50 text-[#db2777] rounded-full flex items-center justify-center hover:bg-pink-100 transition-colors border-2 border-white shadow-sm active:scale-90">
                                 <Icon name="trash" size={18} />
                             </button>
                        </div>
                    </div>
                ))}
                {cart.length === 0 && (
                    <div className="text-center py-20 text-pink-200 font-bold text-2xl forest-font opacity-50">
                        Nothing in the basket...
                    </div>
                )}
            </div>

            <div className="p-10 bg-pink-50 border-t-4 border-white relative z-30 rounded-t-[4rem]">
                <div className="flex justify-between items-center mb-8 pb-6 border-b-4 border-dashed border-white">
                    <div>
                        <p className="text-xs text-pink-400 font-black uppercase tracking-widest forest-font">Total Coins</p>
                        <p className="text-5xl forest-font text-pink-600 drop-shadow-sm">{cartTotal}.-</p>
                    </div>
                    <div className="w-20 h-20 bg-white border-4 border-pink-100 rounded-full flex items-center justify-center text-pink-400 transform rotate-6 shadow-lg">
                        <Icon name="basket" size={40} />
                    </div>
                </div>
                <button onClick={() => { onCheckoutClick(); }} className="w-full py-6 btn-masha text-3xl active:scale-95 transition-all flex items-center justify-center gap-4">
                    <span>THAT'S ALL!</span> <Icon name="check" size={32} strokeWidth={4} />
                </button>
            </div>
        </div>

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-pink-900/80 z-[200] flex items-center justify-center p-8 backdrop-blur-sm animate-image-pop">
                <div className="w-full max-w-sm bg-white border-8 border-pink-100 p-10 text-center shadow-2xl relative overflow-hidden rounded-[3rem]">
                    <div className="w-28 h-28 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-lg relative z-10 animate-hop">
                        <Icon name="flame" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-4xl forest-font text-pink-600 mb-4 leading-tight relative z-10">More Treats?</h3>
                            <p className="text-xl text-green-600 mb-10 font-bold forest-font relative z-10">Masha found more things! Order them all?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-pink-500 text-white font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl forest-font rounded-full uppercase">PLAY ALL!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-white border-4 border-pink-50 text-pink-200 font-black text-lg active:scale-95 transition-transform hover:bg-pink-50 forest-font rounded-full uppercase">Not yet!</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl forest-font text-pink-600 mb-4 leading-tight relative z-10">Finished?</h3>
                            <p className="text-xl text-green-600 mb-10 font-bold forest-font relative z-10">Ready to eat?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { onCheckoutClick(); }} className="w-full py-5 bg-pink-500 text-white font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl forest-font rounded-full uppercase">YES! YUMMY!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white border-4 border-pink-50 text-pink-200 font-black text-lg active:scale-95 transition-transform hover:bg-pink-50 forest-font rounded-full uppercase">Not yet!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}