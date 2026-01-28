import React, { useState, useEffect, useRef } from "react";

// --- 🏕️ Camp Lazlo Icons Wrapper ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    home: <path d="M22 19h-2.53l-2.22-6h-3.5l-2.22 6H2l10-18h1.11L17.5 10h2.97l1.53 9zM12 4.48L7.33 13h9.34L12 4.48zM10.5 15v4h3v-4h-3z" />,
    menu: <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />,
    search: <circle cx="11" cy="11" r="8" />,
    basket: <path d="M19 6h-2c0-2.21-1.79-4-4-4S9 3.79 9 6H7c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 14H5V8h14v10z" />,
    clock: <circle cx="12" cy="12" r="10" />,
    chef: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />,
    star: <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />,
    plus: <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />,
    minus: <path d="M19 13H5v-2h14v2z" />,
    x: <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />,
    trash: <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />,
    check: <polyline points="20 6 9 17 4 12" />,
    flame: <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />,
    pencil: <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />,
    map: <path d="M20.5 3l-6 1.5-6-1.5-5.5 3V21l6-1.5 6 1.5 5.5-3V3zM12 18.5l-6 1.5v-12l6-1.5v12zm6-1.5l-6 1.5v-12l6-1.5v12z" />
  };

  const content = (icons as any)[name] || icons.home;
   
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {content}
      {name === 'search' && <path d="m21 21-4.3-4.3" />}
      {name === 'basket' && <path d="M9 11h6" opacity="0.5"/>}
      {name === 'clock' && <path d="M12 6v6l4 2" />}
    </svg>
  );
};

export default function CampLazloTheme({ state, actions, helpers }: any) {
  const {
    loading, isVerified, activeTab, brand, tableLabel,
    banners, currentBannerIndex, categories, selectedCategoryId,
    products, filteredProducts, selectedProduct,
    cart = [], cartTotal = 0, ordersList = []
  } = state || {}; 

  const { setActiveTab, setSelectedCategoryId, setSelectedProduct, handleAddToCart, updateQuantity, handleCheckout } = actions || {};
  const { calculatePrice, getMenuUrl, getBannerUrl } = helpers || {};

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

  if (loading && !isVerified) return <div className="min-h-screen bg-[#ecfccb] flex items-center justify-center text-[#78350f] font-black text-2xl animate-pulse">Scouting...</div>;

  const currentPriceObj = selectedProduct ? calculatePrice(selectedProduct, variant) : { final: 0 };

  const handleAdd = (addToCartOnly = true) => {
    if (!selectedProduct) return;
    const finalNote = note ? note.trim() : ""; 
    const productToAdd = { ...selectedProduct, variant, note: finalNote, specialRequest: finalNote, comment: finalNote, remark: finalNote };

    if (addToCartOnly) {
        for(let i=0; i<qty; i++) handleAddToCart(productToAdd, variant, finalNote);
        setSelectedProduct(null);
    } else {
        if (cart && cart.length > 0) setShowConfirm(true); 
        else performCookNow();
    }
  };

  const performCookNow = () => {
    const finalNote = note ? note.trim() : "";
    const productToAdd = { ...selectedProduct, variant, note: finalNote, specialRequest: finalNote, comment: finalNote, remark: finalNote };
    for(let i=0; i<qty; i++) handleAddToCart(productToAdd, variant, finalNote);
    setPendingCookNow(true);
    setSelectedProduct(null);
  };

  const onCheckoutClick = () => {
      handleCheckout("");
      setShowConfirm(false);
  };

  return (
    // 🔥 REMOVED 'animate-boing-enter' FROM ROOT to prevent fixed position bugs
    <div className="w-full max-w-md mx-auto min-h-screen relative overflow-x-hidden border-x-4 border-[#78350f] font-sans text-[#451a03]">
        
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Mali:ital,wght@0,300;0,400;0,600;0,700;1,600&family=Sarabun:wght@300;400;600;700&display=swap');
            :root { --lazlo-orange: #f97316; --scout-green: #65a30d; --wood-brown: #78350f; --bg-camp: #ecfccb; --text-color: #451a03; }
            body { font-family: 'Sarabun', sans-serif; background-color: var(--bg-camp); background-image: radial-gradient(circle at 50% 0, var(--scout-green) 10%, transparent 11%), radial-gradient(circle at 50% 100%, var(--scout-green) 10%, transparent 11%); background-size: 30px 30px; background-position: 0 0, 15px 15px; background-attachment: fixed; -webkit-tap-highlight-color: transparent; }
            .camp-font { font-family: 'Mali', cursive; }
            @keyframes boing-enter {
                0% { opacity: 0; transform: scale(0.3) translateY(100px); }
                50% { opacity: 1; transform: scale(1.05) translateY(-20px); }
                70% { transform: scale(0.95) translateY(10px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-boing-enter { animation: boing-enter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            @keyframes jelly-bounce {
                0%, 100% { transform: scale(1, 1); } 25% { transform: scale(0.9, 1.1); } 50% { transform: scale(1.1, 0.9); } 75% { transform: scale(0.95, 1.05); }
            }
            .animate-jelly-loop { animation: jelly-bounce 2s infinite; }
            @keyframes bounce-log { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px) rotate(1deg); } }
            .animate-log { animation: bounce-log 2s infinite ease-in-out; }
            .item-card { transition: all 0.3s; background: #fff; border-radius: 1rem; border: 3px solid var(--wood-brown); box-shadow: 0 4px 0 var(--scout-green); overflow: hidden; }
            .item-card:hover, .item-card:active { transform: scale(0.98) rotate(-1deg); border-color: var(--lazlo-orange); box-shadow: 0 2px 0 var(--lazlo-orange); }
            .btn-camp { background: var(--lazlo-orange); color: white; border: 3px solid var(--wood-brown); border-radius: 0.8rem; font-family: 'Mali', cursive; font-weight: 700; box-shadow: 0 4px 0 var(--wood-brown); transition: all 0.1s; text-transform: uppercase; }
            .btn-camp:active { transform: translateY(4px); box-shadow: 0 0 0 var(--wood-brown); }
            .tab-active { background: var(--scout-green) !important; color: white !important; border: 2px dashed #fff; box-shadow: 0 4px 0 var(--wood-brown); transform: rotate(-2deg); }
            .tab-btn { transition: all 0.3s; background: #fefce8; color: var(--wood-brown); border: 2px solid var(--wood-brown); border-radius: 0.8rem; }
            .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            
            /* ✨ NEW: Pop Up Animation for Page Transitions */
            @keyframes pop-up-enter {
                0% { opacity: 0; transform: translateY(50px) scale(0.9); }
                60% { opacity: 1; transform: translateY(-10px) scale(1.02); }
                100% { transform: translateY(0) scale(1); }
            }
            /* ✨ MODIFIED: Uses new animation */
            .page-transition { animation: pop-up-enter 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
        `}} />

        {/* --- 🔥 WRAPPER FOR CONTENT ONLY (Animated) --- */}
        <div className="animate-boing-enter pb-40"> 
            {/* Header */}
            <header className="bg-[#65a30d] text-white pt-8 pb-16 px-6 rounded-b-[2rem] relative overflow-hidden shadow-xl z-10 border-b-8 border-[#78350f]">
                 <div className="absolute inset-0 opacity-20" style={{backgroundImage: `repeating-linear-gradient(90deg,transparent,transparent_20px,#3f6212_20px,#3f6212_22px)`}}></div>
                 <div className="flex justify-between items-center relative z-10 mt-2">
                     <div>
                         <div className="flex items-center gap-2 mb-2 bg-[#fde047] w-fit px-3 py-1 rounded-sm border-2 border-[#78350f] shadow-sm transform -rotate-1">
                             <span className="w-3 h-3 rounded-full bg-[#ef4444] animate-bounce border border-[#78350f]"></span>
                             <p className="text-[#78350f] text-xs font-black tracking-wide camp-font">JELLY CABIN</p>
                         </div>
                         <h1 className="text-3xl camp-font tracking-wide leading-none mt-2 text-[#fefce8] drop-shadow-[2px_2px_0_#3f6212]">
                             {brand?.name || "Camp Kidney Grub"}
                         </h1>
                         <p className="text-sm text-[#a3e635] font-bold ml-1 opacity-90 camp-font">{tableLabel}</p>
                     </div>
                     <div className="w-16 h-16 bg-[#f97316] rounded-full border-4 border-white flex items-center justify-center relative shadow-[4px_4px_0_rgba(0,0,0,0.2)] animate-log">
                         <Icon name="chef" size={32} className="text-white transform -rotate-6" />
                         <div className="absolute -bottom-2 -right-1 w-8 h-8 bg-[#facc15] rounded-full border-2 border-[#78350f] flex items-center justify-center text-[#78350f]"><Icon name="star" size={14} /></div>
                     </div>
                 </div>
            </header>

            <main className="px-5 -mt-8 relative z-20">
                {/* --- HOME PAGE --- */}
                {activeTab === 'home' && (
                    <section className="page-transition">
                        {/* Hero Banner (Bulletin Board) */}
                        {banners?.length > 0 && (
                            <div className="relative w-full h-56 bg-[#b45309] rounded-xl overflow-hidden shadow-[6px_6px_0_#451a03] mb-8 border-4 border-[#78350f] p-2">
                                 {/* Pin */}
                                 <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-600 rounded-full border-2 border-black z-10 shadow-sm"></div>
                                 
                                 <div className="h-full w-full rounded-lg overflow-hidden bg-[#fefce8] border border-[#78350f] relative">
                                     <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                                 </div>
                                 
                                 <div className="absolute bottom-4 right-4 bg-[#65a30d] text-white px-3 py-1 rounded-lg border-2 border-[#3f6212] transform rotate-2 shadow-md">
                                     <span className="camp-font text-sm">Lumpus Approved!</span>
                                 </div>
                            </div>
                        )}

                        <div className="flex justify-between items-end mb-5 px-2">
                             <div>
                                 <h2 className="text-3xl camp-font text-[#78350f] drop-shadow-sm transform -rotate-1">Bean Scout Eats</h2>
                                 <p className="text-sm text-[#65a30d] font-bold camp-font ml-1">Daily Rations</p>
                             </div>
                             <button onClick={() => setActiveTab('menu')} className="bg-[#f97316] text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#ea580c] transition-colors camp-font border-2 border-[#78350f] shadow-[3px_3px_0_#78350f] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                                 View Menu <Icon name="search" size={14} />
                             </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pb-10">
                            {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                                 const pricing = calculatePrice(p, 'normal');
                                 return (
                                    <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                         <div className="w-full h-36 overflow-hidden relative bg-white border-b-2 border-[#78350f] mt-0">
                                             <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                             {pricing.discount > 0 && (
                                                 <div className="absolute top-2 left-2 bg-[#ef4444] text-white text-[10px] font-bold px-2 py-1 rounded border-2 border-[#78350f] transform -rotate-6 shadow-sm">SALE!</div>
                                             )}
                                         </div>
                                         <div className="p-4 bg-white">
                                             <h3 className="font-bold text-[#451a03] text-sm line-clamp-2 mb-2 leading-tight camp-font tracking-wide h-10">{p.name}</h3>
                                             <div className="flex justify-between items-end mt-2">
                                                 <div className="flex flex-col">
                                                     {pricing.discount > 0 && <span className="text-[10px] text-[#a8a29e] line-through decoration-[#f97316] decoration-2 font-bold">{pricing.original}</span>}
                                                     <span className="text-[#65a30d] font-black text-xl camp-font leading-none">{pricing.final}.-</span>
                                                 </div>
                                                 <button className="w-8 h-8 bg-[#fde047] text-[#78350f] border-2 border-[#78350f] flex items-center justify-center rounded-md hover:bg-[#facc15] transition-all shadow-sm active:scale-90">
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
                        <div className="relative mb-8 group mt-4">
                             <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><Icon name="search" className="text-[#78350f] text-xl" /></div>
                             <input type="text" placeholder="Scout for food..." className="w-full pl-14 pr-6 py-4 rounded-xl bg-[#fefce8] border-4 border-[#65a30d] text-[#451a03] placeholder:text-[#a3e635] focus:outline-none focus:border-[#f97316] focus:rotate-1 transition-all text-lg font-bold camp-font shadow-sm" />
                        </div>

                        <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                            {categories?.map((c: any) => (
                                <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} className={`tab-btn shrink-0 px-6 py-3 text-lg font-bold camp-font ${selectedCategoryId === c.id ? 'tab-active' : ''}`}>
                                    <span>{c.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 pb-24">
                            {filteredProducts?.map((p: any, idx: any) => {
                                 const pricing = calculatePrice(p, 'normal');
                                 return (
                                    <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer" style={{animationDelay: `${idx * 0.1}s`}}>
                                         <div className="w-full h-36 overflow-hidden relative bg-white border-b-2 border-[#78350f] mt-0">
                                             <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         </div>
                                         <div className="p-4 bg-white">
                                             <h3 className="font-bold text-[#451a03] text-sm line-clamp-2 mb-2 leading-tight camp-font tracking-wide h-10">{p.name}</h3>
                                             <div className="flex justify-between items-end mt-2">
                                                 <div className="flex flex-col">
                                                     {pricing.discount > 0 && <span className="text-[10px] text-[#a8a29e] line-through decoration-[#f97316] decoration-2 font-bold">{pricing.original}</span>}
                                                     <span className="text-[#65a30d] font-black text-xl camp-font leading-none">{pricing.final}.-</span>
                                                 </div>
                                                 <button className="w-8 h-8 bg-[#fde047] text-[#78350f] border-2 border-[#78350f] flex items-center justify-center rounded-md hover:bg-[#facc15] transition-all shadow-sm active:scale-90">
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
                        <div className="mb-8 flex items-center justify-between bg-[#fefce8] p-6 border-4 border-[#78350f] rounded-lg shadow-[6px_6px_0_#65a30d] relative overflow-hidden transform rotate-1">
                             {/* Badge Pattern */}
                             <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#facc15] opacity-30" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
                             
                             <div className="relative z-10">
                                 <h2 className="text-3xl camp-font text-[#78350f]">Scout Log</h2>
                                 <p className="text-sm text-[#65a30d] font-bold mt-1 camp-font">Tracking your badge...</p>
                             </div>
                             <div className="w-16 h-16 bg-[#60a5fa] border-4 border-[#78350f] rounded-full flex items-center justify-center animate-bounce shadow-sm">
                                 <Icon name="check" size={32} className="text-white" />
                             </div>
                        </div>

                        <div className="space-y-4">
                            {ordersList?.map((o: any) => (
                                <div key={o.id} className="bg-white p-6 border-4 border-[#78350f] rounded-xl shadow-sm relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                         <span className="text-xs text-[#f97316] font-bold uppercase tracking-widest flex items-center gap-1"><Icon name="menu" size={14} /> Ticket #{o.id.slice(-4)}</span>
                                         <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-wide border-2 rounded-full flex items-center gap-1.5 shadow-sm camp-font transform -rotate-1 ${o.status === 'pending' ? 'bg-[#fefce8] text-[#78350f] border-[#facc15]' : 'bg-[#dcfce7] text-[#15803d] border-[#22c55e]'}`}>
                                           {o.status === 'pending' ? 'Cooking...' : 'Served!'}
                                         </span>
                                    </div>
                                    <div className="mb-4 space-y-2 bg-[#ecfccb] p-5 rounded-lg border-2 border-[#65a30d]">
                                        {o.order_items.map((i: any, idx: any) => (
                                            <div key={idx} className="flex justify-between text-sm text-[#451a03] font-bold border-b-2 border-dashed border-[#a3e635] pb-2 last:border-0 camp-font">
                                                <div className="flex flex-col">
                                                    <span>{i.quantity}x {i.product_name}</span>
                                                    {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-white bg-[#78350f] px-1.5 rounded-sm w-fit border border-[#451a03] uppercase font-bold">{i.variant}</span>}
                                                    {i.note && <span className="text-[10px] text-[#65a30d] italic bg-white px-2 py-0.5 rounded border border-[#a3e635] mt-1 block w-fit shadow-sm"><Icon name="pencil" size={8} /> "{i.note}"</span>}
                                                </div>
                                                <span className="text-[#f97316]">{i.price * i.quantity}.-</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t-4 border-[#e5e7eb]">
                                         <span className="font-bold text-[#a8a29e] text-xs uppercase tracking-widest">TOTAL</span>
                                         <span className="font-black text-[#451a03] text-3xl camp-font">{o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>

        {/* --- FLOATING NAV (Canoe Style) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[80px] bg-[#78350f] shadow-[0_10px_20px_rgba(69,26,3,0.5)] flex justify-around items-center px-4 z-[100] rounded-2xl border-t-4 border-[#a16207]">
             <div className="absolute inset-0 rounded-2xl opacity-10" style={{backgroundImage: `repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_12px)`}}></div>

             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group z-10 ${activeTab === 'home' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 border-transparent transition-colors ${activeTab === 'home' ? 'bg-[#92400e] border-[#fde047]' : ''}`}>
                     <Icon name="home" size={24} className={`${activeTab === 'home' ? 'text-white scale-110' : 'text-[#fde047]'}`} />
                 </div>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group z-10 ${activeTab === 'menu' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 border-transparent transition-colors ${activeTab === 'menu' ? 'bg-[#92400e] border-[#fde047]' : ''}`}>
                     <Icon name="menu" size={24} className={`${activeTab === 'menu' ? 'text-white scale-110' : 'text-[#fde047]'}`} />
                 </div>
             </button>

             {/* 🔥 Animated Backpack Cart Button (Jelly Loop) */}
             <div className="relative w-16 h-16 flex items-center justify-center -mt-12 z-10">
                 <button onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-[#65a30d] rounded-full shadow-[0_6px_0_#3f6212] flex items-center justify-center text-white border-4 border-[#fefce8] active:scale-90 transition-all duration-100 group hover:bg-[#4d7c0f] animate-jelly-loop">
                     <Icon name="basket" size={32} className="group-hover:rotate-12 transition-transform" />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#ef4444] text-white text-xs w-7 h-7 rounded-full flex items-center justify-center font-black hidden border-2 border-white animate-bounce">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all duration-300 w-16 group z-10 ${activeTab === 'status' ? 'active' : ''}`}>
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 border-transparent transition-colors ${activeTab === 'status' ? 'bg-[#92400e] border-[#fde047]' : ''}`}>
                     <Icon name="map" size={24} className={`${activeTab === 'status' ? 'text-white scale-110' : 'text-[#fde047]'}`} />
                 </div>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Tent Flap) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#451a03]/80 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-[#fefce8] border-t-8 border-[#65a30d] h-auto max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-t-[2.5rem] relative">
                    <div className="relative">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-[#ef4444] text-white rounded-lg border-2 border-[#7f1d1d] flex items-center justify-center hover:bg-[#b91c1c] transition-colors shadow-md active:scale-90">
                            <Icon name="x" strokeWidth={3} />
                        </button>
                        <div className="relative w-full h-80 overflow-hidden border-b-4 border-[#78350f] rounded-b-[2rem] bg-[#ecfccb]">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-4">
                                <div className="px-6 py-2 bg-[#f97316] text-white font-black text-3xl camp-font rounded-lg border-4 border-white shadow-[4px_4px_0_rgba(0,0,0,0.2)] transform -rotate-3 flex flex-col items-center leading-none">
                                    {currentPriceObj.discount > 0 && (
                                        <span className="text-sm line-through text-[#78350f] decoration-white decoration-2 mb-1">{currentPriceObj.original}</span>
                                    )}
                                    <span>{currentPriceObj.final}.-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-32 relative">
                        <h2 className="text-4xl camp-font text-[#78350f] mb-6 leading-tight drop-shadow-sm">{selectedProduct.name}</h2>
                        <div className="space-y-5">
                            
                            {/* PRICES VARIANT SELECTOR */}
                            <div>
                                <label className="block text-xl font-bold text-[#451a03] mb-3 camp-font uppercase tracking-wide">CHOOSE SIZE:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'CAMPER', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'SCOUT', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'LUMPUS', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button 
                                            key={v.key} 
                                            onClick={() => setVariant(v.key)}
                                            className={`p-2 rounded-xl border-4 transition-all flex flex-col items-center justify-between h-28 camp-font ${variant === v.key ? 'bg-[#78350f] border-[#451a03] shadow-[4px_4px_0_#000] -translate-y-1 text-white' : 'bg-white border-[#d6d3d1] text-[#a8a29e] hover:border-[#f97316] hover:text-[#f97316]'}`}
                                        >
                                            <span className="text-xs font-black tracking-widest">{v.label}</span>
                                            <Icon name="star" size={24} className={variant === v.key ? "text-[#fde047]" : "text-[#d6d3d1]"} />
                                            <div className="flex flex-col items-center leading-none mt-1">
                                                {v.discount > 0 && <span className="text-[10px] line-through decoration-[#ef4444] decoration-2">{v.original}</span>}
                                                <span className="text-2xl font-black">{v.final}.-</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Special Checkbox (Merit Badge) */}
                            <div className="flex items-center justify-between p-5 bg-[#ecfccb] border-2 border-[#65a30d] rounded-xl border-dashed">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#fde047] text-[#78350f] flex items-center justify-center border-2 border-[#78350f] rounded-full shadow-sm">
                                        <Icon name="star" size={16} />
                                    </div>
                                    <span className="font-bold text-[#3f6212] text-lg camp-font">Merit Badge?</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="specialCheck" className="sr-only peer" />
                                    <div className="w-16 h-9 bg-[#a3e635] peer-focus:outline-none rounded-full border-2 border-[#65a30d] peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-[#f97316] peer-checked:border-[#c2410c]"></div>
                                </label>
                            </div>

                            {/* Qty Control */}
                            <div className="flex items-center justify-between py-4 mt-2">
                                <div className="flex items-center gap-3 bg-[#fefce8] p-3 rounded-xl border-4 border-[#78350f] shadow-sm">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 bg-white text-[#78350f] rounded-lg flex items-center justify-center hover:bg-[#fff7ed] active:scale-90 transition-all font-black text-2xl border-2 border-[#78350f]"><Icon name="minus" /></button>
                                    <span className="text-3xl font-black w-14 text-center bg-transparent border-none text-[#78350f] camp-font">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-12 h-12 bg-[#78350f] text-white rounded-lg flex items-center justify-center hover:bg-[#451a03] active:scale-90 transition-all font-black text-2xl border-2 border-[#78350f]"><Icon name="plus" /></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-[#65a30d] font-black uppercase tracking-widest mb-1 camp-font">COST</p>
                                    <p className="text-4xl font-black text-[#78350f] camp-font">{currentPriceObj.final * qty}.-</p>
                                </div>
                            </div>

                            {/* Note Input */}
                            <div className="relative">
                                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Dear Scoutmaster..." className="w-full p-6 bg-white border-4 border-[#78350f] rounded-xl focus:border-[#f97316] focus:outline-none h-32 resize-none text-lg font-bold text-[#78350f] placeholder:text-[#a8a29e] transition-colors shadow-inner camp-font" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => handleAdd(true)} className="py-4 bg-white border-4 border-[#78350f] text-[#78350f] font-black text-lg rounded-xl active:scale-95 transition-all shadow-[4px_4px_0_#a8a29e] camp-font">Pack It</button>
                            <button onClick={() => handleAdd(false)} className="py-4 btn-camp text-xl active:scale-95 transition-all flex items-center justify-center gap-2">CAMP OUT! <Icon name="flame" size={24} /></button>
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
                    className="fixed inset-0 bg-[#451a03]/80 z-[130] backdrop-blur-sm animate-fade-in block" 
                    onClick={() => setActiveTab('menu')}
                ></div>
                
                {/* Modal Sheet */}
                <div 
                    id="orderSummary" 
                    className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#fefce8] border-t-[6px] border-[#78350f] z-[140] flex flex-col shadow-[0_-20px_60px_rgba(120,53,15,0.4)] h-[90vh] rounded-t-[3rem] animate-slide-up"
                >
                    <div className="sticky top-0 bg-[#fefce8] z-20 rounded-t-[3rem] border-b-2 border-[#78350f]/20 p-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                        <div className="w-20 h-2 bg-[#78350f] rounded-full mx-auto mt-2 opacity-50"></div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-6 px-8 pt-6">
                        <h2 className="text-4xl camp-font text-[#78350f] transform -rotate-1">Backpack</h2>
                        <div className="w-12 h-12 bg-[#65a30d] text-white border-4 border-[#3f6212] rounded-full flex items-center justify-center font-black text-xl camp-font shadow-md">
                            <span>{cart.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar">
                        {cart.map((item: any, idx: any) => (
                            <div key={idx} className="flex items-center gap-4 bg-white p-4 border-2 border-[#d6d3d1] rounded-xl relative overflow-hidden shadow-sm">
                                <div className="w-2 h-full absolute left-0 top-0 bg-[#f97316]" />
                                <img src={item.image_url} className="w-16 h-16 object-cover border-2 border-[#d6d3d1] rounded-lg ml-2 bg-[#f5f5f4]" />
                                <div className="flex-1">
                                    <div className="font-bold text-[#451a03] text-lg leading-tight camp-font tracking-wide">
                                        {item.name} <span className="text-[#f97316]">x{item.quantity}</span>
                                    </div>
                                    <div className="text-xs text-[#65a30d] mt-1 font-bold">
                                        {item.variant !== 'normal' && <span className="text-[#f97316] font-black uppercase mr-2">{item.variant}</span>}
                                        {item.note && <span className="block text-[#451a03] italic mt-1 bg-[#ecfccb] p-1 rounded">"{item.note}"</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                     <span className="font-black text-[#78350f] text-xl camp-font">{item.price * item.quantity}.-</span>
                                     <button onClick={() => updateQuantity(idx, -1)} className="w-10 h-10 bg-[#fef2f2] hover:bg-[#fee2e2] flex items-center justify-center text-[#ef4444] border-2 border-[#fee2e2] rounded-lg transition-colors active:scale-90">
                                         <Icon name="trash" size={16} />
                                     </button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="text-center py-20 text-[#a8a29e] font-bold text-2xl camp-font opacity-50">Empty Pack...</div>
                        )}
                    </div>

                    <div className="p-8 bg-white border-t-4 border-[#78350f] relative z-30 rounded-t-[2rem]">
                        <div className="flex justify-between items-center mb-6 pb-6 border-b-4 border-dashed border-[#a8a29e]">
                            <div>
                                <p className="text-xs text-[#65a30d] font-black uppercase tracking-widest camp-font">Total Beans</p>
                                <p className="text-5xl camp-font text-[#78350f]">{cartTotal}.-</p>
                            </div>
                            <div className="w-16 h-16 bg-[#fde047] border-4 border-[#78350f] rounded-full flex items-center justify-center text-[#78350f] transform rotate-6 shadow-lg">
                                <Icon name="check" size={32} />
                            </div>
                        </div>
                        <button onClick={() => { onCheckoutClick(); }} className="w-full py-5 btn-camp text-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                            <span>ORDER!</span> <Icon name="flame" size={24} />
                        </button>
                    </div>
                </div>
            </>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 bg-[#451a03]/90 z-[250] flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-sm bg-[#fefce8] border-4 border-[#f97316] p-8 text-center shadow-[0_0_0_8px_#78350f] animate-bounce-in relative overflow-hidden rounded-[2rem]">
                    <div className="w-24 h-24 bg-[#65a30d] text-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#3f6212] shadow-lg relative z-10">
                        <Icon name="home" size={48} className="animate-log" />
                    </div>
                    
                    {selectedProduct ? (
                         <>
                            <h3 className="text-3xl camp-font text-[#78350f] mb-2 leading-tight relative z-10">Attention Scout!</h3>
                            <p className="text-lg text-[#65a30d] mb-8 font-bold camp-font relative z-10">You have supplies in your pack. Order them all?</p>
                            <div className="flex flex-col gap-3 relative z-10">
                                <button onClick={() => { performCookNow(); setShowConfirm(false); }} className="w-full py-4 bg-[#f97316] text-white font-black border-4 border-[#c2410c] shadow-[4px_4px_0_#c2410c] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-xl camp-font rounded-xl">SIR, YES SIR!</button>
                                <button onClick={() => { handleAdd(true); setShowConfirm(false); }} className="w-full py-4 bg-white border-4 border-[#a8a29e] text-[#78350f] font-black text-sm active:scale-95 transition-transform hover:bg-gray-50 camp-font rounded-xl">Retreat!</button>
                            </div>
                         </>
                    ) : (
                        <>
                            <h3 className="text-3xl camp-font text-[#78350f] mb-2 leading-tight relative z-10">All Set?</h3>
                            <p className="text-lg text-[#65a30d] mb-8 font-bold camp-font relative z-10">Send your ration request?</p>
                            <div className="flex flex-col gap-3 relative z-10">
                                <button onClick={() => { onCheckoutClick(); }} className="w-full py-4 bg-[#f97316] text-white font-black border-4 border-[#c2410c] shadow-[4px_4px_0_#c2410c] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-xl camp-font rounded-xl">SEND IT!</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-[#a8a29e] text-[#78350f] font-black text-sm active:scale-95 transition-transform hover:bg-gray-50 camp-font rounded-xl">Not Yet!</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}
    </div>
  );
}