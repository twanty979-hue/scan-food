import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons Wrapper (Foster's Home Style) ---
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    // Home -> Door / Entrance
    home: <path d="M20 20V8h-2V6h-2v2H8V6H6v2H4v12h16zM6 10h3v8H6v-8zm5 0h3v8h-3v-8zm5 0h3v8h-3v-8z M12 2l-6 4h12l-6-4z" />, 
    // Menu -> Utensils
    menu: <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v16h2.5V6c0-1.5.5-2 1.25-2 .23 0 .45.05.65.13l.85-2.34C20.65 1.57 19.86 1.5 19 1.5c-2.3 0-4 1.7-4 4.5z" />, 
    search: <circle cx="11" cy="11" r="8" />, 
    // Basket -> Open Box / Toy Chest
    basket: <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 14H4V8h16v10z" />,
    // Clock -> Clipboard / ID Card
    clock: <path d="M16 4h-2a2 2 0 0 0-4 0H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-4 14H9v-2h3v2zm0-5H9v-2h3v2zm4 5h-3v-2h3v2zm0-5h-3v-2h3v2z" />,
    // Chef -> Ghost / Bloo Shape
    chef: <path d="M12 2C7 2 4 5 4 10v7c0 2.5 2 4 5 4 1 0 2-.5 2.5-1.5.5 1 1.5 1.5 2.5 1.5 3 0 5-1.5 5-4v-7c0-5-3-8-8-8zM9 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />, 
    // Star -> Sparkle / Imagination
    star: <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    // Flame -> Heart / Love
    flame: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />, 
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    // Pizza Slice
    pizza: <path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.78 3.55 15.57 2 12 2zM7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />,
    // Wine Glass / Elixir
    glass: <path d="M12 19c2.97 0 5.5-1.83 6.47-4.41L19 13h-2v-1h2l.53-1.6C16.94 10.15 14.62 10 12 10c-2.62 0-4.94.15-7.53.4L5 12h2v1H5l.53 1.59C6.5 17.17 9.03 19 12 19zm0-17C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8 3.59 8 8z" />,
    // Paw Print
    paw: <path d="M12 2C9 2 7 4 7 6c0 1.5 1 3 2.5 3.5C8 10.5 6 12 6 15v4h12v-4c0-3-2-4.5-3.5-5.5C16 9 17 7.5 17 6c0-2-2-4-5-4z M4 6h2v2H4zm14 0h2v2h-2z" />
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
      {name === 'chef' && <path d="M9 14s1.5 2 3 2 3-2 3-2" strokeWidth="2" />} {/* Smile */}
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#fefce8] flex items-center justify-center text-[#3b82f6] font-black text-2xl">LOADING...</div>;

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
      handleCheckout();
      setShowConfirm(false);
  };

  return (
    // Theme: Foster's Home for Imaginary Friends
    <div className="w-full max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden border-x-4 border-blue-600 bg-white font-sans text-[#1e1b4b]">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Itim&family=Mali:wght@400;600;700&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --bloo-blue: #3b82f6; /* Bloo */
                --wilt-red: #ef4444; /* Wilt */
                --eduardo-purple: #7c3aed; /* Eduardo */
                --coco-pink: #f472b6; /* Coco */
                --mansion-cream: #fefce8; /* Mansion Walls */
                --text-dark: #1e1b4b;
            }

            body {
                font-family: 'Itim', 'Sarabun', sans-serif;
                background-color: var(--mansion-cream);
                /* Mansion Wallpaper Pattern */
                background-image: 
                    radial-gradient(var(--bloo-blue) 2px, transparent 2px),
                    radial-gradient(var(--wilt-red) 2px, transparent 2px);
                background-size: 50px 50px;
                background-position: 0 0, 25px 25px;
                background-attachment: fixed;
                -webkit-tap-highlight-color: transparent;
                color: var(--text-dark);
                margin: 0;
                padding: 0;
            }

            /* Bloo's Smooth Shape Effect */
            .bloo-round {
                border-radius: 40% 40% 10% 10% / 50% 50% 10% 10%;
            }

            .imaginary-font {
                font-family: 'Itim', cursive;
            }

            /* Wobbly Animation for Friends */
            @keyframes imaginary-float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-12px) rotate(1deg); }
            }

            .animate-imaginary {
                animation: imaginary-float 5s infinite ease-in-out;
            }

            /* Item Card - Foster's Frame Style */
            .item-card {
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                background: white;
                border-radius: 1.5rem;
                border: 4px solid var(--bloo-blue);
                box-shadow: 6px 6px 0px var(--eduardo-purple);
                overflow: hidden;
            }
            
            .item-card:hover, .item-card:active {
                transform: translate(3px, 3px);
                box-shadow: 2px 2px 0px var(--eduardo-purple);
                border-color: var(--wilt-red);
            }

            .ordering-locked {
                filter: grayscale(1) sepia(0.5);
                pointer-events: none;
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            .btn-foster {
                background: linear-gradient(135deg, var(--bloo-blue) 0%, var(--eduardo-purple) 100%);
                color: white;
                border: 3px solid white;
                border-radius: 1.2rem;
                font-weight: 700;
                box-shadow: 0 6px 12px rgba(124, 58, 237, 0.3);
                transition: all 0.2s;
            }
            
            .btn-foster:active {
                transform: scale(0.95);
                box-shadow: 0 2px 6px rgba(124, 58, 237, 0.4);
            }

            .tab-active {
                background: var(--bloo-blue) !important;
                color: white !important;
                border: 3px solid white;
                box-shadow: 4px 4px 0px var(--eduardo-purple);
                transform: rotate(-2deg);
            }
            
            .tab-btn {
                transition: all 0.3s;
                background: #fff;
                color: var(--bloo-blue);
                border: 2px solid var(--bloo-blue);
                border-radius: 1rem;
            }

            .modal-handle-area {
                cursor: pointer;
                padding: 12px 0 20px 0;
                width: 100%;
            }

            .page-transition {
                animation: slideInRight 0.5s;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        `}} />

        {/* --- Header (Foster's Mansion Entrance Style) --- */}
        <header className="bg-gradient-to-b from-blue-600 to-blue-500 text-white pt-10 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-xl z-10 border-b-8 border-purple-800">
             {/* Abstract Shapes Overlay */}
             <div className="absolute -top-5 -left-5 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl"></div>
             <div className="absolute bottom-4 right-10 text-white/30 text-4xl animate-pulse">
                <Icon name="home" size={48} />
             </div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-purple-900/40 w-fit px-4 py-1.5 rounded-full border border-white/50 backdrop-blur-sm transform rotate-1">
                         <span className="w-3 h-3 rounded-full bg-red-400 animate-pulse border border-white"></span>
                         <p className="text-white text-xs font-bold tracking-wider imaginary-font uppercase">Foster's Is Hiring!</p>
                     </div>
                     <h1 className="text-3xl imaginary-font tracking-tight leading-none mt-2 text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.2)]">
                         {brand?.name || "Imaginary Friends Grill"}
                     </h1>
                 </div>
                 {/* Bloo Badge Icon */}
                 <div className="w-20 h-20 bg-white bloo-round border-4 border-blue-400 flex items-center justify-center relative shadow-lg animate-imaginary">
                     <Icon name="chef" size={40} className="text-blue-500" />
                     <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
                        <Icon name="flame" size={14} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="page-transition">
                    {/* Hero Banner (Foster's Picture Frame) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-3xl overflow-hidden shadow-xl mb-10 border-4 border-purple-900 p-2 group animate-fade-in">
                             <div className="h-full w-full rounded-2xl overflow-hidden bg-blue-50 relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover" 
                                 />
                             </div>
                             <div className="absolute top-4 right-4 bg-yellow-400 text-blue-900 px-6 py-2 rounded-xl border-4 border-blue-900 shadow-lg transform rotate-6">
                                 <span className="imaginary-font text-lg font-bold">WILT'S PICKS!</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-2 animate-fade-in">
                         <div>
                             <h2 className="text-3xl imaginary-font text-purple-900 drop-shadow-sm transform -rotate-1">Adopt a Meal</h2>
                             <p className="text-sm text-blue-500 font-bold imaginary-font ml-1">"I'm sorry, is that okay?"</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-red-600 transition-all imaginary-font border-2 border-white shadow-md active:scale-95">
                             See More <Icon name="search" size={14} />
                         </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter(p => p.is_recommended).slice(0, 6).map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-fade-in" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#fefce8] border-b-4 border-blue-200 mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-lg border-2 border-white shadow-sm imaginary-font transform rotate-3">
                                                SPECIAL!
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#1e1b4b] text-lg line-clamp-2 mb-1 leading-tight imaginary-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-gray-400 line-through font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-blue-500 font-black text-2xl imaginary-font leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-yellow-400 text-white border-2 border-white flex items-center justify-center rounded-full hover:bg-yellow-500 transition-all shadow-sm active:scale-90">
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
                    <div className="relative mb-8 group animate-fade-in">
                         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                             <Icon name="search" className="text-blue-400 text-xl" />
                         </div>
                         <input type="text" placeholder="Scout for snacks?..." className="w-full pl-16 pr-8 py-5 rounded-3xl bg-white border-4 border-blue-200 text-purple-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-lg font-bold imaginary-font" />
                    </div>

                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1 animate-fade-in">
                        {categories?.map((c) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-lg font-bold imaginary-font ${selectedCategoryId === c.id ? 'tab-active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p, idx) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer animate-fade-in" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-full h-40 overflow-hidden relative bg-[#fefce8] border-b-4 border-blue-200 mt-0">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-[#1e1b4b] text-lg line-clamp-2 mb-1 leading-tight imaginary-font">{p.name}</h3>
                                         <div className="flex justify-between items-end mt-2">
                                             <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-[10px] text-gray-400 line-through font-bold">{pricing.original}</span>}
                                                <span className="text-blue-500 font-black text-2xl imaginary-font leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-yellow-400 text-white border-2 border-white flex items-center justify-center rounded-full hover:bg-yellow-500 transition-all shadow-sm active:scale-90">
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
                    <div className="mb-8 flex items-center justify-between bg-white p-8 border-4 border-purple-800 rounded-3xl shadow-[8px_8px_0_rgba(124,58,237,0.2)] relative overflow-hidden transform rotate-1 animate-imaginary">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12 text-blue-400">
                            <Icon name="chef" size={100} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-3xl font-black imaginary-font text-blue-600">The Hallway</h2>
                             <p className="text-sm text-purple-500 font-bold mt-1 imaginary-font">Watching for Mac...</p>
                         </div>
                         <div className="w-16 h-16 bg-blue-100 border-4 border-blue-500 rounded-full flex items-center justify-center animate-bounce shadow-md">
                             <Icon name="clock" size={32} className="text-blue-600" />
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o) => (
                            <div key={o.id} className="bg-white p-6 border-4 border-blue-200 rounded-3xl shadow-sm relative overflow-hidden animate-fade-in">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-purple-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                         <Icon name="menu" size={14} /> Ticket #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-wide border-2 rounded-full flex items-center gap-1.5 shadow-sm imaginary-font transform -rotate-1
                                        ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-green-100 text-green-800 border-green-300'}`}>
                                         {o.status === 'pending' ? 'COOKING...' : 'SERVED!'}
                                     </span>
                                </div>
                                <div className="mb-4 space-y-2 bg-blue-50 p-5 rounded-2xl border-2 border-blue-100">
                                    {o.order_items.map((i, idx) => (
                                        <div key={idx} className="flex justify-between text-sm text-[#1e1b4b] font-bold border-b-2 border-dashed border-blue-200 pb-2 last:border-0 imaginary-font">
                                            <div className="flex flex-col">
                                                <span>{i.quantity}x {i.product_name}</span>
                                                {/* Variant */}
                                                {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-white bg-purple-500 px-1.5 rounded w-fit border border-purple-600 uppercase font-bold">{i.variant}</span>}
                                                {/* Note */}
                                                {i.note && <span className="text-[10px] text-blue-500 italic bg-white px-2 py-0.5 rounded border border-blue-200 mt-1 block w-fit shadow-sm"><Icon name="pencil" size={8} /> "{i.note}"</span>}
                                            </div>
                                            <span className="text-red-500">{i.price * i.quantity}.-</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t-4 border-blue-100">
                                     <span className="font-bold text-gray-400 text-xs uppercase tracking-widest">TOTAL</span>
                                     <span className="font-black text-[#1e1b4b] text-3xl imaginary-font">
                                         {o.order_items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Mansion Railing Style) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[85px] bg-white shadow-2xl flex justify-around items-center px-4 z-[100] rounded-3xl border-t-8 border-purple-900 border-x-2">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-blue-50' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-blue-500' : 'text-slate-300'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-blue-50' : ''}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-blue-500' : 'text-slate-300'}`} />
                 </div>
             </button>

             {/* Big Cart Button (Big Red Wilt Button) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-red-500 rounded-full shadow-lg flex items-center justify-center text-white border-4 border-white active:scale-90 transition-all duration-100 z-20 group hover:bg-red-600 animate-imaginary">
                     <Icon name="basket" size={32} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-yellow-400 text-blue-900 text-xs w-7 h-7 rounded-full flex items-center justify-center font-black hidden border-2 border-white animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-blue-50' : ''}`}>
                     <Icon name="clock" size={24} className={`${activeTab === 'status' ? 'text-blue-500' : 'text-slate-300'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-indigo-900/60 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-white border-t-8 border-blue-500 h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[3rem] relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-red-500 rounded-full border-2 border-red-100 flex items-center justify-center hover:bg-red-50 transition-colors shadow-md active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-85 overflow-hidden border-b-4 border-blue-50 rounded-b-[3rem] bg-blue-50">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-yellow-400 text-blue-900 font-black text-3xl imaginary-font rounded-2xl border-4 border-white shadow-xl transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-blue-700 decoration-white decoration-2 mb-1">
                                            {currentPriceObj.original}
                                        </span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32 relative">
                        <h2 className="text-4xl imaginary-font text-blue-600 mb-6 leading-tight drop-shadow-sm">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            {/* --- 3 PRICES VARIANT SELECTOR --- */}
                            <div>
                                <label className="block text-xl font-bold text-purple-900 mb-3 imaginary-font uppercase tracking-wider">CHOOSE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'MAC', icon: 'star', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'BLOO', icon: 'chef', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'COCO', icon: 'flame', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center justify-between h-28 imaginary-font
                                                ${variant === v.key 
                                                    ? 'bg-blue-500 border-blue-600 shadow-md -translate-y-1 text-white' 
                                                    : 'bg-white border-blue-100 text-blue-300 hover:border-blue-400 hover:text-blue-500'}`}
                                        >
                                            <span className="text-sm font-black tracking-widest">{v.label}</span>
                                            <Icon name={v.icon || "star"} size={24} className={variant === v.key ? "text-white" : "text-blue-200"} />
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
                                <div className="flex items-center gap-4 bg-white p-3 rounded-full border-4 border-blue-100 shadow-md">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center hover:bg-sky-100 active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="minus" strokeWidth={3} /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-blue-800 imaginary-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 active:scale-90 transition-all font-black text-2xl border border-white"><Icon name="plus" strokeWidth={3} /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-red-400 font-black uppercase tracking-widest mb-1 imaginary-font">Imaginary Coins</p>
                                    <p className="text-4xl font-black text-blue-600 imaginary-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* 📝 Item Note Input */}
                            <div className="relative">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="A message for Mac or Frankie..." 
                                    className="w-full p-6 bg-blue-50 border-4 border-white rounded-3xl focus:border-blue-300 focus:outline-none h-36 resize-none text-xl font-bold text-blue-800 placeholder:text-blue-200 transition-colors shadow-inner imaginary-font"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mt-10">
                            <button onClick={() => handleAdd(true)} className="py-5 bg-white border-4 border-blue-50 text-blue-400 font-black text-xl rounded-2xl active:scale-95 transition-all shadow-md imaginary-font">
                                Pack It Up!
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-5 btn-foster text-2xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                ADOPT! <Icon name="flame" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ORDER SUMMARY MODAL --- */}
        <div id="orderSummaryOverlay" className={`fixed inset-0 bg-indigo-900/60 z-[130] backdrop-blur-sm animate-fade-in ${activeTab === 'cart' ? 'block' : 'hidden'}`} onClick={() => setActiveTab('menu')}></div>
        <div id="orderSummary" className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-[10px] border-blue-100 z-[140] flex flex-col shadow-2xl h-[92vh] rounded-t-[4rem] transition-transform duration-300 ${activeTab === 'cart' ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="sticky top-0 bg-white z-20 rounded-t-[4rem] border-b-4 border-blue-50 p-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                <div className="w-24 h-2 bg-blue-100 rounded-full mx-auto mt-2"></div>
            </div>
            
            <div className="flex justify-between items-center mb-6 px-10 pt-8">
                <h2 className="text-4xl imaginary-font text-blue-600 transform -rotate-1">Adopt Bag</h2>
                <div className="w-14 h-14 bg-red-100 text-red-500 border-4 border-white rounded-2xl flex items-center justify-center font-black text-2xl imaginary-font shadow-lg">
                    <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 px-8 pb-4 no-scrollbar">
                {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white p-4 border-4 border-blue-100 rounded-[2rem] shadow-sm relative overflow-hidden hover:shadow-md hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                        <div className="w-20 h-20 bg-blue-50 rounded-2xl overflow-hidden border-2 border-white shrink-0">
                            <img src={item.image_url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-[#1e1b4b] text-xl leading-tight imaginary-font tracking-wide">
                                {item.name} <span className="text-blue-500">x{item.quantity}</span>
                            </div>
                            <div className="text-sm font-bold mt-1 text-purple-500">
                                {item.variant !== 'normal' && <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs mr-2 border border-purple-200 uppercase font-bold">{item.variant}</span>}
                                {/* 🔥 VISIBLE ITEM NOTE IN CART */}
                                {item.note && (
                                    <span className="block mt-1 bg-white text-[#1e1b4b] text-[12px] px-2 py-1 rounded border border-blue-100 italic font-sans">
                                        <Icon name="pencil" size={10} /> "{item.note}"
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className="font-black text-blue-600 text-2xl imaginary-font">{item.price * item.quantity}.-</span>
                             <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors border-2 border-white shadow-sm active:scale-90">
                                 <Icon name="trash" size={18} />
                             </button>
                        </div>
                    </div>
                ))}
                {cart.length === 0 && (
                    <div className="text-center py-20 text-blue-200 font-bold text-2xl imaginary-font opacity-50">
                        Nothing in the basket...
                    </div>
                )}
            </div>

            <div className="p-10 bg-blue-50 border-t-4 border-white relative z-30 rounded-t-[4rem]">
                <div className="flex justify-between items-center mb-8 pb-6 border-b-4 border-dashed border-white">
                    <div>
                        <p className="text-xs text-blue-300 font-black uppercase tracking-widest imaginary-font">Total Loot</p>
                        <p className="text-5xl imaginary-font text-red-500">{cartTotal}.-</p>
                    </div>
                    <div className="w-20 h-20 bg-white border-4 border-blue-100 rounded-full flex items-center justify-center text-blue-300 transform rotate-6 shadow-lg">
                        <Icon name="basket" size={40} />
                    </div>
                </div>
                <button onClick={() => { onCheckoutClick(); }} className="w-full py-6 btn-foster text-3xl active:scale-95 transition-all flex items-center justify-center gap-4">
                    <span>IT'S OKAY!</span> <Icon name="flame" size={24} />
                </button>
            </div>
        </div>

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-indigo-900/80 z-[250] flex items-center justify-center p-8 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-sm bg-white border-8 border-blue-100 p-10 text-center shadow-2xl relative overflow-hidden rounded-[3rem]">
                    <div className="w-28 h-28 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-lg relative z-10 animate-imaginary">
                        <Icon name="chef" size={60} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-4xl imaginary-font text-blue-600 mb-4 leading-tight relative z-10">Hold on, Bloo!</h3>
                            <p className="text-xl text-blue-300 mb-10 font-bold imaginary-font relative z-10">Add "{selectedProduct.name}" to your stash?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-5 bg-red-400 text-white font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl imaginary-font rounded-full uppercase">YES! ORDER ALL!</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-5 bg-white border-4 border-blue-50 text-blue-200 font-black text-lg active:scale-95 transition-transform hover:bg-blue-50 imaginary-font rounded-full uppercase">Just Add</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-4xl imaginary-font text-blue-600 mb-4 leading-tight relative z-10">Hold on, Bloo!</h3>
                            <p className="text-xl text-blue-300 mb-10 font-bold imaginary-font relative z-10">You have things in your bag! Want to bring them all out?</p>
                            <div className="flex flex-col gap-4 relative z-10">
                                <button onClick={() => { onCheckoutClick(); }} className="w-full py-5 bg-red-400 text-white font-black border-4 border-white shadow-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-2xl imaginary-font rounded-full uppercase">YES! ORDER ALL!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white border-4 border-blue-50 text-blue-200 font-black text-lg active:scale-95 transition-transform hover:bg-blue-50 imaginary-font rounded-full uppercase">Not yet!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}