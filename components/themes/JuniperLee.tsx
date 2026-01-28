import React, { useState, useEffect, useRef } from "react";

// --- 🔮 Icons Wrapper (Adapted for Juniper/Magic Theme) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    home: <path d="M2 20h20 M12 3l10 17H2L12 3z" />, // Dojo/Hut style
    menu: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6" />, // Spellbook/File
    search: <circle cx="11" cy="11" r="8" />, 
    basket: <circle cx="12" cy="12" r="10" />, // Magic Orb
    clock: <circle cx="12" cy="12" r="10" />,
    chef: <path d="M12 2a4 4 0 0 1 4 4c0 .738-.192 1.416-.522 2.005C17.72 8.788 19.5 10.5 20 13v7H4v-7c.5-2.5 2.28-4.212 4.522-4.995A3.996 3.996 0 0 1 8 6a4 4 0 0 1 4-4Z" />, 
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    dragon: <path d="M19 12c.5-2 1.5-3 3-3-2 0-4-1-6-3 .5 3-1.5 5-2.5 6-.8 1-.5 2.3.8 3 1.3.7 3 .7 5 0ZM5 12c-.5-2-1.5-3-3-3 2 0 4-1 6-3-.5 3 1.5 5 2.5 6 .8 1 .5 2.3-.8 3-1.3.7-3 .7-5 0Z M12 6V3 M12 21v-3" />, // Wings/Creature
    bolt: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    wand: <path d="m19 2 2 2-2 2-2-2 2-2z m-7 7 9 9-2 2-9-9 2-2z M5 8l-2 2 2 2 2-2-2-2z" />, // Wand sparkles
    scroll: <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z" />
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
      {name === 'clock' && <polyline points="12 6 12 12 16 14" />}
      {name === 'basket' && <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M8 12h8 M12 8v8" />} {/* Magic Circle look */}
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


  if (loading && !isVerified) return (
    <div className="min-h-screen bg-[#faf5ff] flex items-center justify-center">
        <div className="text-[#7e22ce] font-black text-4xl animate-pulse magic-font tracking-widest drop-shadow-md">
            SUMMONING...
        </div>
    </div>
  );

  const currentPriceObj = selectedProduct 
    ? calculatePrice(selectedProduct, variant) 
    : { final: 0 };

  const handleAdd = (addToCartOnly = true) => {
    if (!selectedProduct) return;
    if (addToCartOnly) {
        for(let i=0; i<qty; i++) handleAddToCart(selectedProduct, variant, note);
        setSelectedProduct(null);
    } else {
        if (cart && cart.length > 0) setShowConfirm(true); 
        else performCookNow();
    }
  };

  const performCookNow = () => {
    for(let i=0; i<qty; i++) handleAddToCart(selectedProduct, variant, note);
    setPendingCookNow(true);
    setSelectedProduct(null);
  };

  return (
    // Theme: Juniper Lee / Orchid Bay (Purple/Pink/Green/Dark Blue)
    <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto min-h-screen pb-32 relative overflow-x-hidden font-sans text-[#2e1065] bg-[#faf5ff] border-x border-purple-200">
        
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Itim&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                /* Juniper Palette */
                --juniper-purple: #7e22ce; 
                --magic-pink: #db2777;
                --jade-green: #10b981;
                --dark-mystic: #1e1b4b;
                --bg-orchid: #faf5ff;
                --text-main: #2e1065;
            }

            body {
                font-family: 'Chakra Petch', 'Sarabun', sans-serif;
                background-color: var(--bg-orchid);
                /* Magic Circle Pattern */
                background-image: 
                    radial-gradient(circle at 10% 20%, rgba(126, 34, 206, 0.05) 15%, transparent 16%),
                    radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.05) 10%, transparent 11%),
                    linear-gradient(rgba(219, 39, 119, 0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(219, 39, 119, 0.02) 1px, transparent 1px);
                background-size: 100px 100px, 150px 150px, 30px 30px, 30px 30px;
                background-attachment: fixed;
                -webkit-tap-highlight-color: transparent;
                color: var(--text-main);
            }

            h1, h2, h3, .magic-font {
                font-family: 'Chakra Petch', sans-serif;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            /* Magic Pulse Animation */
            @keyframes magic-glow {
                0%, 100% { filter: drop-shadow(0 0 5px var(--magic-pink)); }
                50% { filter: drop-shadow(0 0 15px var(--juniper-purple)); }
            }

            .animate-magic {
                animation: magic-glow 3s infinite ease-in-out;
            }

            @keyframes fadeInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
            .animate-fade-in { animation: fadeInRight 0.5s ease-out; }

            /* Item Card - Tech-Magic Style */
            .item-card {
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                background: white;
                border-radius: 1.2rem;
                border: 2px solid #e9d5ff;
                box-shadow: 0 10px 20px -5px rgba(126, 34, 206, 0.1);
                overflow: hidden;
            }
            
            .item-card:hover, .item-card:active {
                transform: translateY(-5px);
                border-color: var(--jade-green);
                box-shadow: 0 15px 30px -10px rgba(16, 185, 129, 0.3);
            }

            /* Corner Accent for Cards */
            .card-accent {
                position: absolute;
                top: 0;
                right: 0;
                width: 25px;
                height: 25px;
                background: var(--juniper-purple);
                clip-path: polygon(100% 0, 0 0, 100% 100%);
                z-index: 10;
            }

            .btn-juniper {
                background: linear-gradient(135deg, var(--juniper-purple) 0%, var(--magic-pink) 100%);
                color: white;
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 0.8rem;
                font-weight: 700;
                box-shadow: 0 4px 15px rgba(126, 34, 206, 0.4);
                transition: all 0.2s;
            }
            
            .btn-juniper:active {
                transform: scale(0.95);
                box-shadow: 0 2px 5px rgba(126, 34, 206, 0.6);
            }

            .tab-active {
                background: var(--dark-mystic) !important;
                color: var(--jade-green) !important;
                border: 2px solid var(--jade-green);
                box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
                transform: translateY(-2px);
            }
            
            .tab-btn {
                transition: all 0.3s;
                background: white;
                color: var(--juniper-purple);
                border: 1px solid #ddd6fe;
                border-radius: 0.8rem;
                font-weight: 600;
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* --- Header (Orchid Bay Style) --- */}
        <header className="bg-indigo-950 text-white pt-10 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-xl z-10 border-b-4 border-emerald-500">
             {/* Magic Grid Overlay */}
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
             <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-purple-600/20 rounded-full blur-3xl"></div>
             
             <div className="flex justify-between items-center relative z-10 mt-2">
                 <div>
                     <div className="flex items-center gap-2 mb-2 bg-purple-600/40 w-fit px-4 py-1.5 rounded-full border border-purple-400/50 backdrop-blur-sm transform -rotate-1">
                         <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                         <p className="text-emerald-300 text-[10px] font-bold tracking-[0.2em] magic-font uppercase">The Protector</p>
                     </div>
                     <h1 className="text-2xl magic-font font-extrabold tracking-tighter leading-none mt-2 text-white drop-shadow-[0_2px_10px_rgba(168,85,247,0.5)]">
                         {brand?.name || "Orchid Bay Kitchen"}
                     </h1>
                 </div>
                 
                 {/* Magic Icon Badge */}
                 <div className="w-18 h-18 bg-white/5 rounded-full border-2 border-emerald-500 flex items-center justify-center relative shadow-glow animate-magic">
                     <div className="text-emerald-400"><Icon name="dragon" size={40} /></div>
                     <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full border border-white flex items-center justify-center text-white text-[10px]">
                        <Icon name="bolt" size={14} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-8 relative z-20">
            
            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade-in">
                    {/* Hero Banner (Magic Portal Style) */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-52 bg-indigo-900 rounded-2xl overflow-hidden shadow-2xl mb-10 border-2 border-purple-500/50 p-1 group">
                             <div className="h-full w-full rounded-xl overflow-hidden relative">
                                 <img 
                                    src={getBannerUrl(banners[currentBannerIndex].image_name)} 
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                 />
                             </div>
                             
                             {/* HUD Borders */}
                             <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
                             <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>
                             
                             <div className="absolute bottom-4 left-4 bg-purple-700/90 text-white px-4 py-1.5 rounded-sm border-l-4 border-emerald-400 shadow-lg">
                                 <span className="magic-font text-xs font-bold uppercase tracking-widest">Aura: Stable</span>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-6 px-1">
                         <div>
                             <h2 className="text-2xl magic-font text-indigo-900 drop-shadow-sm transform -rotate-1">Adopted Grubs</h2>
                             <p className="text-xs text-purple-500 font-bold uppercase tracking-widest ml-1">Monster Provisions</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="bg-white text-purple-600 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-purple-50 transition-all magic-font border border-purple-200 shadow-md active:scale-95">
                             View Data <Icon name="search" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="card-accent"></div>
                                     <div className="w-full h-40 overflow-hidden relative bg-purple-50">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                             <div className="absolute top-3 left-3 bg-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-sm shadow-md animate-pulse">
                                                 SALE
                                             </div>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white relative">
                                         <h3 className="font-bold text-indigo-950 text-sm line-clamp-2 mb-2 leading-tight font-sans">{p.name}</h3>
                                         <div className="flex justify-between items-end pt-1">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && (
                                                     <span className="text-[10px] text-purple-400 line-through font-bold">
                                                         {pricing.original}
                                                     </span>
                                                 )}
                                                 <span className="text-purple-800 font-black text-lg leading-none">
                                                     {pricing.final}.-
                                                 </span>
                                             </div>
                                             <button className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all shadow-sm active:scale-90">
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
                <section className="animate-fade-in pt-4">
                    <div className="relative mb-8 group mt-2">
                         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                             <div className="text-emerald-500"><Icon name="search" size={20} /></div>
                         </div>
                         <input type="text" placeholder="Scanning for supplies..." className="w-full pl-16 pr-8 py-4 rounded-xl bg-white border border-purple-200 text-indigo-900 placeholder:text-purple-300 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all text-lg font-bold" />
                    </div>

                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-1 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`tab-btn shrink-0 px-8 py-3 text-sm font-bold uppercase tracking-widest ${selectedCategoryId === c.id ? 'tab-active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="card-accent"></div>
                                     <div className="w-full h-40 overflow-hidden relative bg-purple-50">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <div className="p-4 bg-white">
                                         <h3 className="font-bold text-indigo-950 text-sm line-clamp-2 mb-2 leading-tight font-sans">{p.name}</h3>
                                         <div className="flex justify-between items-end pt-1">
                                             <div className="flex flex-col">
                                                 {pricing.discount > 0 && <span className="text-[10px] text-purple-400 line-through font-bold">{pricing.original}</span>}
                                                 <span className="text-purple-800 font-black text-lg leading-none">{pricing.final}.-</span>
                                             </div>
                                             <button className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all shadow-sm active:scale-90">
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
                <section className="animate-fade-in pt-4 pb-24 max-w-3xl mx-auto">
                    <div className="mb-8 flex items-center justify-between bg-white p-7 border-l-8 border-purple-700 rounded-xl shadow-xl relative overflow-hidden transform rotate-1">
                         <div className="absolute -right-4 -bottom-4 text-9xl opacity-5 rotate-12 text-purple-900">
                            <Icon name="scroll" size={120} />
                         </div>
                         <div className="relative z-10">
                             <h2 className="text-2xl font-black magic-font text-indigo-950">Mission Log</h2>
                             <p className="text-xs text-purple-500 font-bold mt-1 uppercase tracking-widest">Balance in Progress...</p>
                         </div>
                         <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-400 rounded-xl flex items-center justify-center animate-pulse shadow-sm">
                             <div className="text-emerald-600"><Icon name="menu" size={32} /></div>
                         </div>
                    </div>

                    <div className="space-y-6">
                        {ordersList?.map((o: any, idx: any) => (
                            <div key={o.id} className="bg-white p-6 border-l-4 border-purple-500 rounded-r-xl shadow-md relative overflow-hidden" style={{animationDelay: `${idx * 0.1}s`}}>
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4 border-b border-purple-100 pb-3">
                                     <span className="text-sm text-indigo-900 font-bold magic-font flex items-center gap-1">
                                         ORDER #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full flex items-center gap-1.5 shadow-sm
                                         ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'}`}>
                                         {o.status === 'pending' ? 'COOKING...' : 'COMPLETED'}
                                     </span>
                                </div>

                                {/* Items */}
                                <div className="mb-4 space-y-3 font-sans">
                                    {o.order_items.map((i: any, idx: any) => {
                                        const quantity = i.quantity || 1;
                                        const finalPriceTotal = i.price * quantity;
                                        return (
                                            <div key={idx} className="flex justify-between items-start text-sm text-indigo-950">
                                                <div className="flex flex-col items-start pr-2">
                                                    <span className="leading-snug font-medium">
                                                        <span className="text-purple-600 font-bold">{quantity}x</span> {i.product_name}
                                                    </span>
                                                    {i.variant !== 'normal' && (
                                                        <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-bold mt-1 uppercase">
                                                            {i.variant}
                                                        </span>
                                                    )}
                                                    {i.note && <span className="text-[10px] text-purple-400 italic mt-0.5">"{i.note}"</span>}
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-indigo-900 font-bold">{finalPriceTotal}.-</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-dashed border-purple-200">
                                     <span className="font-bold text-purple-400 text-xs uppercase tracking-wider">Total Crystals</span>
                                     <span className="font-black text-xl text-purple-800">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Magical Interface Style) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-[75px] bg-[#1e1b4b]/95 backdrop-blur-md shadow-2xl flex justify-around items-center px-4 z-[100] rounded-2xl border border-white/10">
             
             <button onClick={() => setActiveTab('home')} className={`group transition-all duration-300 w-16 flex flex-col items-center gap-1 ${activeTab === 'home' ? 'transform -translate-y-2' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-emerald-500/20 text-emerald-400 drop-shadow-[0_0_5px_#10b981]' : 'text-slate-500'}`}>
                     <Icon name="home" size={20} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`group transition-all duration-300 w-16 flex flex-col items-center gap-1 ${activeTab === 'menu' ? 'transform -translate-y-2' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'menu' ? 'bg-emerald-500/20 text-emerald-400 drop-shadow-[0_0_5px_#10b981]' : 'text-slate-500'}`}>
                     <Icon name="menu" size={20} />
                 </div>
             </button>

             {/* Cart Button (Magic Core) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-18 h-18 bg-gradient-to-tr from-purple-700 to-pink-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center justify-center text-white border-2 border-white/50 active:scale-90 transition-all duration-300 z-20 group">
                     <div className="group-hover:rotate-12 transition-transform">
                        <Icon name="basket" size={28} />
                     </div>
                     {cart?.length > 0 && (
                         <span className="absolute top-[-5px] right-[-5px] bg-emerald-500 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black border border-white hidden animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`group transition-all duration-300 w-16 flex flex-col items-center gap-1 ${activeTab === 'status' ? 'transform -translate-y-2' : ''}`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'status' ? 'bg-emerald-500/20 text-emerald-400 drop-shadow-[0_0_5px_#10b981]' : 'text-slate-500'}`}>
                     <Icon name="scroll" size={20} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[110] flex items-end justify-center bg-indigo-950/80 backdrop-blur-sm animate-fade-in p-0 md:items-center">
                <div className="w-full max-w-md md:max-w-lg bg-white h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl border-t-8 border-emerald-500 rounded-t-[3rem] relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-indigo-950 rounded-full border border-purple-100 flex items-center justify-center hover:bg-purple-50 transition-colors shadow-md active:scale-90">
                            <Icon name="x" size={24} />
                        </button>
                        <div className="relative w-full h-85 overflow-hidden border-b-4 border-purple-50 rounded-b-[2.5rem] bg-indigo-50">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-6">
                                <div className="px-8 py-3 bg-indigo-950 text-emerald-400 font-black text-2xl magic-font rounded-xl border border-emerald-500/50 shadow-xl transform -rotate-1">
                                     {currentPriceObj.discount > 0 && (
                                        <div className="text-xs text-pink-400 line-through font-sans font-bold leading-none absolute -top-4 left-0 bg-indigo-900 px-2 py-0.5 rounded-md">{currentPriceObj.original}</div>
                                     )}
                                     {currentPriceObj.final}.-
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-10 pb-32">
                        <h2 className="text-3xl magic-font text-indigo-950 mb-6 leading-tight drop-shadow-sm uppercase tracking-widest">{selectedProduct.name}</h2>
                        
                        <div className="space-y-6">
                            
                            {/* Variants - Te-Zhen Style */}
                            <div>
                                <label className="block text-sm font-bold text-indigo-900 mb-3 ml-1 tracking-wide uppercase">Select Variant</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { key: 'normal', label: 'Regular', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'Special', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'Jumbo', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-3 border-2 transition-all flex flex-col items-center justify-center gap-1 rounded-xl active:scale-95
                                                ${variant === v.key 
                                                    ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-md' 
                                                    : 'bg-white border-purple-100 text-slate-500 hover:border-purple-300'}`}
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wider">{v.label}</span>
                                            <span className="text-lg font-black magic-font">{v.final}.-</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Qty & Total */}
                            <div className="flex items-center justify-between py-4 mt-2 bg-indigo-950 p-4 rounded-2xl shadow-lg border border-white/10">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white/10 text-white rounded-lg flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all font-black text-2xl border border-white/20">
                                        <Icon name="minus" size={20} />
                                    </button>
                                    <span className="text-3xl font-black w-14 text-center magic-font text-emerald-400">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-400 active:scale-90 transition-all font-black text-2xl border border-white/20">
                                        <Icon name="plus" size={20} />
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-purple-400 font-black uppercase tracking-[0.2em] mb-1 magic-font">Aura Cost</p>
                                    <p className="text-4xl font-black text-white magic-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* Note */}
                            <div>
                                <label className="block text-sm font-bold text-indigo-900 mb-2 ml-1 tracking-wide uppercase">Notes for the Protector</label>
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Add specific instructions..." 
                                    className="w-full p-4 bg-purple-50 border border-purple-200 text-indigo-900 focus:border-emerald-500 focus:outline-none h-24 resize-none text-lg font-bold rounded-2xl shadow-inner placeholder:text-purple-300"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border border-purple-200 text-purple-600 font-black text-xl rounded-xl active:scale-95 transition-all shadow-sm magic-font uppercase">
                                Stow Supply
                            </button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-juniper active:scale-95 transition-all flex items-center justify-center gap-2 text-2xl">
                                BANISH! <Icon name="wand" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET --- */}
        {activeTab === 'cart' && (
            <div className="fixed inset-0 z-[130] flex items-end justify-center bg-indigo-950/90 backdrop-blur-sm animate-fade-in md:items-center">
                <div className="w-full max-w-md md:max-w-lg bg-white border-t-[10px] border-emerald-500 flex flex-col shadow-2xl h-[92vh] md:h-auto md:max-h-[90vh] relative rounded-t-[4rem]">
                    
                    <button 
                        onClick={() => setActiveTab('menu')}
                        className="absolute top-6 right-6 z-50 w-12 h-12 bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-200 transition-colors rounded-full shadow-sm"
                    >
                        <Icon name="x" size={24} />
                    </button>

                    <div className="w-full py-4 cursor-pointer hover:bg-purple-50 rounded-t-[4rem] border-b border-purple-100" onClick={() => setActiveTab('menu')}>
                        <div className="w-24 h-2 bg-purple-200 rounded-full mx-auto mt-2 opacity-50"></div>
                    </div>

                    <div className="flex justify-between items-center mb-6 px-10 pt-8">
                        <h2 className="text-4xl magic-font text-indigo-950 transform -rotate-1 tracking-widest">Inventory</h2>
                        <div className="w-14 h-14 bg-purple-600 text-white border-2 border-white rounded-2xl flex items-center justify-center font-black text-2xl magic-font shadow-lg">
                            {cart.reduce((a: any, b: any) => a + b.quantity, 0)}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                        {cart.map((item: any, idx: any) => (
                            <div key={idx} className="flex items-center gap-4 bg-white p-3 border-2 border-purple-100 rounded-2xl shadow-sm relative group">
                                <img src={item.image_url} className="w-20 h-20 object-cover rounded-xl border border-purple-200" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-indigo-950 text-lg leading-tight truncate font-sans">
                                        {item.name}
                                    </div>
                                    <div className="text-sm font-bold mt-1 text-purple-600 flex flex-wrap gap-2">
                                        <span className="text-emerald-600 font-black">{item.quantity}x</span>
                                        {item.variant !== 'normal' && <span className="bg-purple-100 text-purple-800 px-2 py-0.5 text-xs uppercase font-bold tracking-wider rounded-md">{item.variant}</span>}
                                    </div>
                                    {item.note && <div className="text-xs text-slate-500 italic mt-1 truncate pl-1">"{item.note}"</div>}
                                </div>
                                <div className="flex flex-col items-end gap-2 pl-2">
                                     <span className="font-black text-indigo-900 text-xl magic-font">{item.price * item.quantity}.-</span>
                                     <button onClick={() => updateQuantity(idx, -1)} className="w-8 h-8 bg-purple-50 text-purple-300 rounded-lg flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors active:scale-90">
                                         <Icon name="trash" size={16} />
                                     </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-purple-300 space-y-4 opacity-70">
                                <Icon name="basket" size={64} />
                                <span className="text-2xl font-black magic-font uppercase">Empty Inventory</span>
                            </div>
                        )}
                    </div>

                    <div className="p-10 bg-indigo-950 border-t-4 border-emerald-500 relative z-30 rounded-t-[3rem]">
                        <div className="flex justify-between items-center mb-8 pb-6 border-b border-dashed border-white/20">
                            <div>
                                <p className="text-[10px] text-purple-300 font-black uppercase tracking-widest magic-font">Total Crystals</p>
                                <p className="text-5xl font-black text-white magic-font drop-shadow-glow">{cartTotal}.-</p>
                            </div>
                             <div className="w-20 h-20 bg-white/5 border-2 border-emerald-500/50 rounded-full flex items-center justify-center text-emerald-400 transform rotate-6 shadow-2xl">
                                <Icon name="basket" size={40} />
                            </div>
                        </div>
                        <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} className="w-full py-6 btn-juniper text-3xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-wider rounded-2xl">
                            LINK START! <Icon name="bolt" size={24} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-indigo-950/95 z-[250] flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-sm bg-white border-4 border-emerald-500 p-10 text-center shadow-2xl relative overflow-hidden rounded-3xl animate-fade-in">
                    
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500 shadow-glow relative z-10 rounded-full animate-pulse">
                        <Icon name="check" size={48} />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-2xl magic-font text-indigo-950 mb-2 uppercase tracking-wide">Seal the Spell?</h3>
                            <p className="text-purple-700 mb-8 font-bold tracking-wide">Add "{selectedProduct.name}" to inventory?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { 
                                    performCookNow(); 
                                    setShowConfirm(false); 
                                }} className="w-full py-4 btn-juniper text-xl shadow-lg rounded-xl">YES! CAST NOW</button>
                                
                                <button onClick={() => { 
                                    handleAdd(true);
                                    setShowConfirm(false);
                                }} className="w-full py-4 bg-transparent border-2 border-purple-200 text-purple-400 font-black hover:bg-purple-50 rounded-xl uppercase">Stow for Later</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-2xl magic-font text-indigo-950 mb-2 uppercase tracking-widest">Finalize Ritual?</h3>
                            <p className="text-purple-700 mb-8 font-bold tracking-wide">Combine all enchanted items?</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 btn-juniper text-2xl shadow-lg rounded-xl">YES! PROTECT ALL!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-transparent border-2 border-purple-200 text-purple-400 font-black hover:bg-purple-50 rounded-xl uppercase">Abort</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}