import React, { useState, useEffect, useRef } from "react";

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
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  
  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToastMsg = (msg: string, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    if (selectedProduct) {
      setVariant('normal');
      setQty(1);
      setNote("");
      
      const initialOptions: any = {};
      if (selectedProduct.options && Array.isArray(selectedProduct.options)) {
        selectedProduct.options.forEach((opt: any, index: number) => {
            if (opt.type === 'single' && opt.required && opt.choices.length > 0) {
                initialOptions[index] = [opt.choices[0].name];
            } else {
                initialOptions[index] = [];
            }
        });
      }
      setSelectedOptions(initialOptions);
    }
  }, [selectedProduct]);

  const prevCartLength = useRef(cart?.length || 0);

  useEffect(() => {
    if (pendingCookNow) {
        if (cart?.length > prevCartLength.current) {
             handleCheckout();
             setPendingCookNow(false);
             showToastMsg("Sent! Time for a nap.");
             setActiveTab('status');
        }
        const timer = setTimeout(() => {
             if(pendingCookNow) {
                 handleCheckout(); 
                 setPendingCookNow(false);
                 showToastMsg("Sent! Time for a nap.");
                 setActiveTab('status');
             }
        }, 1000);
        return () => clearTimeout(timer);
    }
    prevCartLength.current = cart?.length || 0;
  }, [cart, pendingCookNow, handleCheckout]);

  if (loading && !isVerified) return <div className="min-h-screen bg-[#fffbeb]" />;

  const basePriceObj = selectedProduct ? calculatePrice(selectedProduct, variant) : { final: 0, original: 0, discount: 0 };
  
  const optionsExtraPrice = Object.keys(selectedOptions).reduce((total, groupIndex) => {
      const selectedNames = selectedOptions[groupIndex] || [];
      const groupInfo = selectedProduct?.options?.[parseInt(groupIndex)];
      if (!groupInfo) return total;
      
      const groupExtra = selectedNames.reduce((groupTotal: number, name: string) => {
          const choiceInfo = groupInfo.choices.find((c: any) => c.name === name);
          return groupTotal + (choiceInfo?.price || 0);
      }, 0);
      return total + groupExtra;
  }, 0);

  const finalPriceWithOpts = basePriceObj.final + optionsExtraPrice;

  const generateOptionNote = () => {
    if (!selectedProduct?.options) return note;
    let optTexts: string[] = [];
    selectedProduct.options.forEach((opt: any, index: number) => {
        const selectedNames = selectedOptions[index];
        if (selectedNames && selectedNames.length > 0) {
            optTexts.push(`${opt.name}: ${selectedNames.join(', ')}`);
        }
    });
    const optionsString = optTexts.length > 0 ? `[${optTexts.join(' | ')}] ` : "";
    return (optionsString + note).trim();
  };

  const handleAdd = (addToCartOnly = true) => {
    if (!selectedProduct) return;
    if (selectedProduct.options) {
        for (let i = 0; i < selectedProduct.options.length; i++) {
            const opt = selectedProduct.options[i];
            if (opt.required && (!selectedOptions[i] || selectedOptions[i].length === 0)) {
                showToastMsg(`Please select: ${opt.name}`, "error");
                return;
            }
        }
    }
    const finalNote = generateOptionNote();
    const productWithOptionsPrice = {
        ...selectedProduct,
        price: finalPriceWithOpts,
        price_special: finalPriceWithOpts,
        price_jumbo: finalPriceWithOpts
    };

    if (addToCartOnly) {
        for(let i=0; i<qty; i++) {
            handleAddToCart(productWithOptionsPrice, variant, finalNote);
        }
        showToastMsg(`Got it! ${selectedProduct.name}`);
        setSelectedProduct(null);
    } else {
        if (cart && cart.length > 0) {
            setShowConfirm(true); 
        } else {
            performCookNow(productWithOptionsPrice, finalNote);
        }
    }
  };

  const performCookNow = (prodObj = selectedProduct, nNote = note) => {
    for(let i=0; i<qty; i++) {
        handleAddToCart(prodObj, variant, nNote);
    }
    setPendingCookNow(true);
    setSelectedProduct(null);
  };

  const handleOptionToggle = (groupIndex: number, choiceName: string, type: string) => {
      setSelectedOptions((prev: any) => {
          const currentSelected = prev[groupIndex] || [];
          if (type === 'single') return { ...prev, [groupIndex]: [choiceName] };
          if (currentSelected.includes(choiceName)) {
              return { ...prev, [groupIndex]: currentSelected.filter((n: string) => n !== choiceName) };
          }
          return { ...prev, [groupIndex]: [...currentSelected, choiceName] };
      });
  };

  return (
    <>
        {/* ย้าย Style ออกมาข้างนอกสุด และบังคับ Background ให้ Body ตรงๆ */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Mali:ital,wght@0,300;0,400;0,600;0,700;1,600&family=Sarabun:wght@300;400;600;700&display=swap');
            
            :root {
                --primary: #fb923c;
                --primary-dark: #c2410c;
                --accent: #1f2937;
                --bg: #fffbeb;
                --yellow: #fcd34d;
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg) !important;
                background-image: radial-gradient(#fb923c 15%, transparent 16%), radial-gradient(#fb923c 15%, transparent 16%) !important;
                background-position: 0 0, 25px 25px !important;
                background-size: 50px 50px !important;
                background-attachment: fixed !important;
                -webkit-tap-highlight-color: transparent;
                color: #1f2937;
                margin: 0;
                padding: 0;
            }

            h1, h2, h3, .cat-font {
                font-family: 'Mali', cursive;
            }

            @keyframes wobble {
                0% { transform: translateX(0%); }
                15% { transform: translateX(-5%) rotate(-5deg); }
                30% { transform: translateX(4%) rotate(3deg); }
                45% { transform: translateX(-3%) rotate(-3deg); }
                60% { transform: translateX(2%) rotate(2deg); }
                75% { transform: translateX(-1%) rotate(-1deg); }
                100% { transform: translateX(0%); }
            }

            .animate-wobble-custom {
                animation: wobble 0.8s ease-in-out;
            }

            .item-card {
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                position: relative;
                overflow: hidden;
                border: 3px solid #000;
                box-shadow: 4px 4px 0px #000;
                border-radius: 1.5rem;
                background: white;
            }
            
            .item-card::after {
                content: '';
                position: absolute;
                bottom: -10px; right: -10px;
                width: 40px; height: 40px;
                background: repeating-linear-gradient(45deg, var(--primary), var(--primary) 5px, var(--primary-dark) 5px, var(--primary-dark) 10px);
                border-radius: 50%;
                border: 2px solid #000;
                z-index: 5;
            }

            .item-card:active {
                transform: translate(2px, 2px);
                box-shadow: 2px 2px 0px #000;
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            .btn-cat {
                background: #fb923c;
                border: 3px solid #000;
                box-shadow: 4px 4px 0px #000;
                color: #000;
                font-family: 'Mali', cursive;
                font-weight: 700;
            }
            
            .btn-cat:active {
                transform: translate(2px, 2px);
                box-shadow: 2px 2px 0px #000;
            }

            .tab-btn {
                transition: all 0.3s;
                border: 3px solid transparent;
            }
            
            .tab-btn:not(.active):hover {
                transform: rotate(2deg);
                background: #fed7aa;
            }
            
            .tab-btn.active {
                background: #000 !important;
                color: #fb923c !important;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                border: 3px solid #000;
                transform: rotate(-2deg);
            }

            .page-transition {
                animation: fadeIn 0.4s ease-out;
            }
        `}} />

        {/* แก้ไขตรงนี้แหละครับนาย! ลบ bg-[#fff7ed] ออก เพื่อให้มันทะลุไปเห็นลายจุดของ body
            และคงแค่โครง max-w-md mx-auto เอาไว้ให้คอนเทนต์อยู่ตรงกลาง 
        */}
        <div className="max-w-md mx-auto shadow-2xl min-h-screen pb-32 relative overflow-x-hidden border-x-4 border-black bg-transparent">
            
            {/* --- Toast System --- */}
            {toast.show && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl text-black text-sm font-bold shadow-[4px_4px_0px_#000] flex items-center gap-3 bg-white border-4 transform -rotate-1 animate__animated animate__fadeInDown
                    ${toast.type === 'error' ? 'border-red-600' : 'border-black'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 border-black
                        ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-orange-400 text-black'}`}>
                        <i className={toast.type === 'error' ? 'fi fi-rr-cross-circle text-xl' : 'fi fi-rr-paw text-xl'}></i>
                    </div>
                    <span className="cat-font text-lg">{toast.message}</span>
                </div>
            )}

            {/* --- Header --- */}
            <header className="bg-orange-400 text-black pt-8 pb-16 px-6 rounded-b-[3rem] relative overflow-hidden shadow-xl z-10 border-b-4 border-black">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-600/20 rounded-full blur-2xl"></div>
                <div className="absolute top-4 left-4 text-orange-700/20 text-6xl font-black rotate-[-10deg]">Zzz...</div>
                
                <div className="flex justify-between items-center relative z-10 mt-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1 bg-black w-fit px-4 py-1.5 rounded-full transform -rotate-2">
                            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse border border-white"></span>
                            <p className="text-white text-xs font-bold tracking-widest cat-font">FEED ME {tableLabel ? `(T${tableLabel})` : ''}</p>
                        </div>
                        <h1 id="headerTitle" className="text-4xl font-black tracking-tight leading-none mt-2 drop-shadow-sm cat-font text-black">
                            {brand?.name || "I'M HUNGRY..."}
                        </h1>
                    </div>
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transform rotate-3">
                        <i className="fi fi-sr-cat text-orange-500 text-3xl"></i>
                    </div>
                </div>
            </header>

            {/* --- Content Area --- */}
            <main className="px-5 -mt-8 relative z-20">
                
                {/* HOME PAGE */}
                <section id="homePage" className={`page-transition ${activeTab === 'home' ? 'block' : 'hidden'}`}>
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[2rem] overflow-hidden shadow-[6px_6px_0_#000] mb-8 border-4 border-black group">
                            <div id="bannerSlider" className="h-full">
                                <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                            <div className="absolute top-4 right-4 py-2 px-4 bg-yellow-400 text-black text-xs font-black uppercase tracking-wider shadow-lg border-2 border-black transform rotate-6 cat-font rounded-lg">
                                JON'S FAVORITE
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-2">
                        <div>
                            <h2 className="text-3xl font-black text-black cat-font transform -rotate-1">Big Fat Meals</h2>
                            <p className="text-sm text-slate-500 font-bold ml-1 bg-white/80 px-2 rounded-full inline-block">กินให้อิ่มแล้วไปนอน...</p>
                        </div>
                        <button onClick={() => setActiveTab('menu')} className="bg-black text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors cat-font shadow-[3px_3px_0_#fb923c] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]">
                            See All <i className="fi fi-sr-arrow-small-right"></i>
                        </button>
                    </div>
                    
                    <div id="foodItemsHome" className="grid grid-cols-2 gap-4 pb-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 4).map((p: any, idx: number) => {
                            const pricing = calculatePrice(p, 'normal');
                            return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card animate-wobble-custom cursor-pointer" style={{ animationDelay: `${idx * 0.1}s` }}>
                                    <div className="w-full h-36 overflow-hidden relative bg-slate-100 border-b-4 border-black">
                                        <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                        {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg border-2 border-black transform -rotate-6 shadow-sm">SAVE!</div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-white relative z-10">
                                        <h3 className="font-black text-black text-sm line-clamp-2 mb-2 leading-tight cat-font h-10">{p.name}</h3>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-[10px] text-gray-400 line-through decoration-orange-400 decoration-2 font-bold">{pricing.original}</span>}
                                                <span className="text-orange-600 font-black text-xl cat-font leading-none">{pricing.final}.-</span>
                                            </div>
                                            <button className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-[2px_2px_0_#fb923c] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all border-2 border-black">
                                                <i className="fi fi-rr-plus text-lg"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* MENU PAGE */}
                <section id="menuPage" className={`page-transition ${activeTab === 'menu' ? 'block' : 'hidden'}`}>
                    <div className="relative mb-8 group mt-4">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <i className="fi fi-rr-paw text-orange-500 text-xl"></i>
                        </div>
                        <input id="searchMenuInput" type="text" placeholder="หาของกิน..." className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border-4 border-black shadow-[4px_4px_0_#fb923c] focus:outline-none focus:shadow-[2px_2px_0_#fb923c] focus:translate-x-[2px] focus:translate-y-[2px] transition-all text-lg font-bold placeholder:text-slate-300 cat-font" />
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                className={`tab-btn shrink-0 px-8 py-3 rounded-2xl bg-white border-4 border-black text-black font-black text-lg shadow-[3px_3px_0_#ccc] cat-font ${selectedCategoryId === c.id ? 'active' : ''}`}>
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Grid Lists */}
                    <div id="foodItemsMenu" className="tab-pane grid grid-cols-2 gap-5 pb-24">
                        {filteredProducts?.map((p: any, idx: number) => {
                            const pricing = calculatePrice(p, 'normal');
                            return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="item-card cursor-pointer group animate__animated animate__fadeInUp" style={{ animationDelay: `${idx * 0.05}s` }}>
                                    <div className="w-full h-36 overflow-hidden relative bg-slate-100 border-b-4 border-black">
                                        <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4 bg-white relative z-10">
                                        <h3 className="font-black text-black text-sm line-clamp-2 mb-2 leading-tight cat-font h-10">{p.name}</h3>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="flex flex-col">
                                                {pricing.discount > 0 && <span className="text-[10px] text-gray-400 line-through decoration-orange-400 decoration-2 font-bold">{pricing.original}</span>}
                                                <span className="text-orange-600 font-black text-xl cat-font leading-none">{pricing.final}.-</span>
                                            </div>
                                            <button className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-[2px_2px_0_#fb923c] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all border-2 border-black">
                                                <i className="fi fi-rr-plus text-lg"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* STATUS PAGE */}
                <section id="morePage" className={`page-transition pt-6 ${activeTab === 'status' ? 'block' : 'hidden'}`}>
                    <div className="mb-8 flex items-center justify-between bg-black p-6 rounded-3xl text-white shadow-[6px_6px_0_#fb923c] relative overflow-hidden border-4 border-white transform rotate-1">
                        <div className="relative z-10">
                            <h2 className="text-4xl font-black cat-font text-orange-400">STATUS</h2>
                            <p className="text-sm text-slate-300 mt-1 font-bold">รออาหาร... (หิวแล้วนะ)</p>
                        </div>
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center animate-bounce border-4 border-orange-500">
                            <i className="fi fi-rr-clock-five text-3xl text-black"></i>
                        </div>
                    </div>
                    
                    <div id="pendingOrders" className="space-y-6 pb-24">
                        {ordersList?.map((o: any, idx: number) => {
                            const isDone = o.status === 'done';
                            return (
                                <div key={o.id} className="bg-white p-6 rounded-3xl shadow-[6px_6px_0_#000] border-4 border-black animate__animated animate__bounceIn" style={{ animationDelay: `${idx * 0.05}s` }}>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                                            <i className="fi fi-rr-clock"></i> {new Date(o.created_at || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                        <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide border-2 flex items-center gap-1.5 cat-font shadow-sm transform -rotate-2
                                            ${isDone ? 'bg-green-100 text-black border-green-400' : 'bg-yellow-100 text-black border-yellow-400'}`}>
                                            <i className={`fi ${isDone ? 'fi-sr-utensils' : 'fi-rr-bed'}`}></i> {isDone ? 'EAT IT!' : 'Dreaming...'}
                                        </span>
                                    </div>
                                    <div className="mb-4 space-y-1 bg-slate-50 p-4 border-2 border-black rounded-xl">
                                        {o.order_items.map((i: any, cIdx: number) => (
                                            <div key={cIdx} className="flex justify-between text-sm text-slate-700 font-bold mb-2 border-b-2 border-dashed border-slate-300 pb-1 last:border-0 cat-font">
                                                <div className="flex flex-col flex-1 pr-2">
                                                    <span>{i.quantity || 1}x {i.product_name}</span>
                                                    {i.variant !== 'normal' && <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-md border border-black font-sans uppercase w-fit mt-1 transform -rotate-1">{i.variant}</span>}
                                                    {i.note && <span className="text-[10px] text-orange-600 italic mt-0.5">Note: {i.note}</span>}
                                                </div>
                                                <span className="text-black shrink-0">{(i.price * (i.quantity || 1))}.-</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t-4 border-black">
                                        <span className="font-black text-black text-xs uppercase tracking-widest">Total</span>
                                        <span className="font-black text-orange-600 text-2xl cat-font">
                                            {o.order_items.reduce((acc: any, i: any) => acc + (i.price * (i.quantity || 1)), 0)}.-
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                        
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-24 text-slate-400 font-bold cat-font text-xl opacity-50 bg-white/50 rounded-3xl mx-4">EMPTY BOWL</div>
                        )}
                    </div>
                </section>
            </main>

            {/* --- Navigation Bar --- */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[75px] bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex justify-around items-center px-4 z-[100] rounded-full border-4 border-white">
                <button data-page="home" onClick={() => setActiveTab('home')} className={`nav-btn flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'home' ? 'active text-orange-400' : ''}`}>
                    <i className="fi fi-sr-home text-2xl transition-colors group-[.active]:text-orange-400"></i>
                </button>
                
                <button data-page="menu" onClick={() => setActiveTab('menu')} className={`nav-btn flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'menu' ? 'active text-orange-400' : ''}`}>
                    <i className="fi fi-sr-utensils text-2xl transition-colors group-[.active]:text-orange-400"></i>
                </button>

                <div className="relative w-16 h-16 flex items-center justify-center -mt-12">
                    <button data-page="cart" onClick={() => setActiveTab('cart')} className="absolute w-20 h-20 bg-orange-500 rounded-full shadow-[0_0_0_6px_#000] flex items-center justify-center text-black border-4 border-white active:scale-95 transition-all duration-300 z-20 group">
                        <i className="fi fi-sr-shopping-cart text-3xl"></i>
                        <span id="cartCount" className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white font-black animate__animated animate__bounceIn ${cart?.length > 0 ? '' : 'hidden'}`}>
                            {cart?.length || 0}
                        </span>
                    </button>
                </div>

                <button data-page="more" onClick={() => setActiveTab('status')} className={`nav-btn flex flex-col items-center gap-1 transition-all duration-300 w-16 group ${activeTab === 'status' ? 'active text-orange-400' : ''}`}>
                    <i className="fi fi-sr-bed-alt text-2xl transition-colors group-[.active]:text-orange-400"></i>
                </button>
            </nav>

            {/* --- UI Components (Modals) --- */}

            {/* Item Details Modal */}
            {selectedProduct && (
                <>
                    <div id="itemOverlay" className="fixed inset-0 bg-black/90 z-[110] backdrop-blur-md animate__animated animate__fadeIn" onClick={() => setSelectedProduct(null)}></div>
                    <div id="itemModal" className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#fff7ed] rounded-t-[3rem] z-[120] h-auto max-h-[95vh] overflow-y-auto no-scrollbar animate__animated animate__slideInUp shadow-2xl border-t-[6px] border-black">
                        
                        <div className="relative">
                            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors border-4 border-black shadow-[4px_4px_0_#000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]">
                                <i className="fi fi-rr-cross-small text-2xl font-bold"></i>
                            </button>

                            <div className="relative w-full h-80 rounded-b-[3rem] overflow-hidden border-b-4 border-black">
                                <img id="modalImage" src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                                <div className="absolute bottom-6 left-6 bg-white px-6 py-2 rounded-full border-4 border-black shadow-[4px_4px_0_#fb923c] transform -rotate-2">
                                    <p id="modalPrice" className="text-black font-black text-3xl cat-font">{finalPriceWithOpts}.-</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 pt-8 pb-32">
                            <h2 id="modalName" className="text-4xl font-black text-black mb-6 leading-tight cat-font">{selectedProduct.name}</h2>
                            
                            <div className="space-y-6">
                                {/* Variants Size */}
                                {(selectedProduct.price_special || selectedProduct.price_jumbo) && (
                                    <div className="flex items-center justify-between p-5 bg-white rounded-2xl border-4 border-black shadow-[4px_4px_0_#000]">
                                        <div className="w-full">
                                            <p className="text-[12px] font-black text-orange-600 uppercase tracking-widest mb-3">Size</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { key: 'normal', label: 'REG', ...calculatePrice(selectedProduct, 'normal') },
                                                    selectedProduct.price_special && { key: 'special', label: 'BIG', ...calculatePrice(selectedProduct, 'special') },
                                                    selectedProduct.price_jumbo && { key: 'jumbo', label: 'MAX', ...calculatePrice(selectedProduct, 'jumbo') }
                                                ].filter(Boolean).map((v: any) => (
                                                    <button key={v.key} onClick={() => setVariant(v.key)}
                                                        className={`p-2 rounded-xl border-[3px] transition-all flex flex-col items-center justify-center h-16 cat-font
                                                        ${variant === v.key ? 'bg-orange-100 border-orange-500 text-orange-700 shadow-inner transform -rotate-2' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                                        <span className="text-[10px] font-black uppercase">{v.label}</span>
                                                        <span className="text-sm font-black">+{v.final}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Options Group */}
                                {selectedProduct.options?.map((opt: any, index: number) => {
                                    if (!opt.name || !opt.choices?.length) return null;
                                    return (
                                        <div key={index} className="bg-white p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0_#000]">
                                            <div className="flex justify-between items-center mb-4 border-b-4 border-dashed border-slate-200 pb-3">
                                                <span className="font-black text-black cat-font text-xl">{opt.name}</span>
                                                <span className={`text-[10px] font-black px-2 py-1 rounded-md border-2 border-black transform rotate-2 shadow-sm ${opt.required ? 'bg-red-500 text-white' : 'bg-slate-200 text-black'}`}>
                                                    {opt.required ? 'REQ' : 'OPT'}
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                {opt.choices.map((choice: any, cIdx: number) => {
                                                    const isSelected = selectedOptions[index]?.includes(choice.name);
                                                    const inputType = opt.type === 'single' ? 'radio' : 'checkbox';
                                                    return (
                                                        <label key={cIdx} className={`flex items-center justify-between p-3 border-4 rounded-xl cursor-pointer transition-all ${isSelected ? 'border-orange-500 bg-orange-50 transform -translate-y-1' : 'border-black bg-white'}`}>
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-6 h-6 flex items-center justify-center border-[3px] border-black bg-white ${inputType === 'radio' ? 'rounded-full' : 'rounded-md'}`}>
                                                                    {isSelected && <div className={`bg-orange-500 ${inputType === 'radio' ? 'w-3 h-3 rounded-full' : 'w-3 h-3 rounded-sm'}`} />}
                                                                </div>
                                                                <span className="font-bold text-base text-black">{choice.name}</span>
                                                            </div>
                                                            <span className="font-black text-orange-600 text-sm">{choice.price > 0 ? `+${choice.price}` : 'Free'}</span>
                                                            <input type={inputType} className="hidden" checked={isSelected || false} onChange={() => handleOptionToggle(index, choice.name, opt.type)} />
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="relative">
                                    <textarea id="itemNote" value={note} onChange={(e) => setNote(e.target.value)} placeholder="บอกเชฟหน่อย (เช่น ไม่เอาผัก)..." 
                                        className="w-full p-5 bg-white rounded-2xl border-4 border-black focus:border-orange-500 focus:outline-none h-32 resize-none text-lg font-bold placeholder:text-slate-300 transition-colors cat-font shadow-inner"></textarea>
                                </div>
                                
                                <div className="flex items-center justify-between py-4 mt-2">
                                    <div className="flex items-center gap-3 bg-black p-2 rounded-full border-4 border-black shadow-lg">
                                        <button id="qtyMinus" onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-slate-200 transition-colors active:scale-90"><i className="fi fi-rr-minus text-xl font-bold"></i></button>
                                        <input id="qtyDisplay" type="text" value={qty} readOnly className="text-2xl font-black w-14 text-center bg-transparent border-none text-white cat-font outline-none" />
                                        <button id="qtyPlus" onClick={() => setQty(qty+1)} className="w-12 h-12 rounded-full bg-orange-500 text-black flex items-center justify-center hover:bg-orange-400 transition-colors active:scale-90"><i className="fi fi-rr-plus text-xl font-bold"></i></button>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-1">Total</p>
                                        <p id="modalTotalPrice" className="text-4xl font-black text-black cat-font underline decoration-4 decoration-orange-400">{finalPriceWithOpts * qty}.-</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <button id="addToCartBtn" onClick={() => handleAdd(true)} className="py-4 rounded-xl bg-white border-4 border-black text-black font-black text-lg active:scale-95 transition-all shadow-[4px_4px_0_#ccc] cat-font">
                                    Grab It
                                </button>
                                <button id="orderNowBtn" onClick={() => handleAdd(false)} className="py-4 rounded-xl btn-cat font-black text-lg active:scale-95 transition-all cat-font flex items-center justify-center gap-2">
                                    EAT NOW <i className="fi fi-sr-utensils"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Order Summary Modal (Cart) */}
{activeTab === 'cart' && (
    <>
        <div id="orderSummaryOverlay" className="fixed inset-0 bg-black/90 z-[130] backdrop-blur-md animate__animated animate__fadeIn" onClick={() => setActiveTab('menu')}></div>
        <div id="orderSummary" className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#fffbeb] rounded-t-[3rem] z-[140] flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.5)] h-[90vh] border-t-[6px] border-black animate__animated animate__slideInUp overflow-hidden">
            
            {/* พื้นหลังลายจุดภายใน Modal */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fb923c 15%, transparent 16%)', backgroundSize: '40px 40px' }}></div>

            <div className="modal-handle-area sticky top-0 z-20 rounded-t-[3rem] border-b-4 border-black/10 flex justify-center py-4 cursor-pointer" onClick={() => setActiveTab('menu')}>
                <div className="handle-bar w-16 h-2 bg-black/20 rounded-full"></div>
            </div>
            
            <div className="flex justify-between items-center mb-6 px-8 pt-4 relative z-10">
                <h2 className="text-4xl font-black text-black cat-font transform -rotate-2">My Food</h2>
                <div className="w-14 h-14 bg-orange-500 text-black rounded-2xl flex items-center justify-center border-4 border-black shadow-[4px_4px_0_#000]">
                    <span id="summaryCount" className="font-black text-2xl cat-font">
                        {cart.reduce((a: any, b: any) => a + b.quantity, 0)}
                    </span>
                </div>
            </div>
            
            <ul id="summaryList" className="flex-1 overflow-y-auto space-y-4 px-6 pb-6 no-scrollbar relative z-10">
                {cart.length > 0 ? cart.map((item: any, idx: number) => (
                    <li key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0_#000] relative animate__animated animate__fadeInLeft" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <div className="w-2 h-full absolute left-0 top-0 bg-orange-400 rounded-l-md"></div>
                        <img src={item.image_url} className="w-20 h-20 rounded-xl object-cover border-4 border-black shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="font-black text-black text-lg leading-tight cat-font truncate">{item.name}</div>
                            <div className="text-orange-600 font-black">x{item.quantity}</div>
                            <div className="text-xs text-slate-500 mt-1 font-bold">
                                {item.variant !== 'normal' && <span className="bg-orange-100 px-1 rounded">[{item.variant}]</span>}
                                {item.note && <span className="ml-1">Note: {item.note}</span>}
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="font-black text-black text-xl cat-font">{item.price * item.quantity}.-</div>
                            <button onClick={() => updateQuantity(idx, -1)} className="mt-2 w-10 h-10 bg-red-100 hover:bg-red-500 hover:text-white flex items-center justify-center text-red-600 rounded-xl transition-all border-2 border-black shadow-[2px_2px_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                                <i className="fi fi-sr-trash text-sm"></i>
                            </button>
                        </div>
                    </li>
                )) : (
                    <div className="text-center py-20 opacity-30 cat-font">
                        <i className="fi fi-sr-basket-shopping text-6xl block mb-4"></i>
                        <p className="text-2xl font-black uppercase">Bowl is Empty</p>
                    </div>
                )}
            </ul>

            <div className="p-8 bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-30 border-t-6 border-black">
                <div className="flex justify-between items-center mb-6 border-b-4 border-dashed border-slate-200 pb-6">
                    <div>
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Total Price</p>
                        <p id="summaryTotal" className="text-5xl font-black text-orange-600 cat-font">{cartTotal}.-</p>
                    </div>
                    <div className="w-16 h-16 bg-yellow-300 rounded-2xl flex items-center justify-center text-black border-4 border-black transform rotate-6 shadow-[4px_4px_0_#000]">
                        <i className="fi fi-sr-receipt text-3xl"></i>
                    </div>
                </div>
                <button 
                    id="confirmOrderBtn" 
                    onClick={() => { if(cart.length > 0) setShowConfirm(true); }} 
                    className={`w-full py-5 rounded-3xl btn-cat text-2xl transition-all flex items-center justify-center gap-3 
                    ${cart.length === 0 ? 'bg-slate-200 text-slate-400 border-slate-300 shadow-none pointer-events-none' : 'active:scale-95'}`}
                >
                    <span>CONFIRM (MEOW)</span> 
                    <i className="fi fi-sr-paw text-2xl"></i>
                </button>
            </div>
        </div>
    </>
)}

            {/* Custom Confirmation Pop-up */}
            {showConfirm && (
                <div id="confirmOverlay" className="fixed inset-0 bg-black/90 z-[250] flex items-center justify-center p-6 backdrop-blur-sm animate__animated animate__fadeIn">
                    <div id="confirmModal" className="w-full max-w-sm bg-white rounded-3xl border-4 border-black p-8 text-center shadow-[8px_8px_0_#fb923c] animate__animated animate__bounceIn relative overflow-hidden">
                        
                        <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-black">
                            <i className="fi fi-sr-shopping-bag text-4xl animate-tada"></i>
                        </div>

                        {selectedProduct ? (
                            <>
                                <h3 id="confirmTitle" className="text-3xl font-black text-black mb-2 leading-tight cat-font">More Food?</h3>
                                <p id="confirmDesc" className="text-base text-slate-600 mb-8 font-bold cat-font">มีของในตะกร้าอยู่แล้ว จะสั่ง {selectedProduct.name} รวมกันเลยไหม?</p>
                                
                                <div className="flex flex-col gap-3">
                                    <button id="confirmYes" onClick={() => { performCookNow(selectedProduct, generateOptionNote()); setShowConfirm(false); }} className="w-full py-4 bg-orange-500 text-black rounded-xl font-black border-4 border-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-lg cat-font">
                                        YES, FEED ME ALL!
                                    </button>
                                    <button id="confirmNo" onClick={() => { handleAdd(true); setShowConfirm(false); }} className="w-full py-4 bg-white border-4 border-slate-300 text-slate-400 rounded-xl font-black text-sm active:scale-95 transition-transform hover:bg-slate-50 cat-font">
                                        NO, JUST ADD TO TRAY
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 id="confirmTitle" className="text-3xl font-black text-black mb-2 leading-tight cat-font">Ready?</h3>
                                <p id="confirmDesc" className="text-base text-slate-600 mb-8 font-bold cat-font">พร้อมสั่งอาหารทั้งหมดในตะกร้าเลยไหมครับ?</p>
                                
                                <div className="flex flex-col gap-3">
                                    <button id="confirmYes" onClick={() => { handleCheckout(); setShowConfirm(false); }} className="w-full py-4 bg-orange-500 text-black rounded-xl font-black border-4 border-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-lg cat-font">
                                        YES, EAT IT ALL!
                                    </button>
                                    <button id="confirmNo" onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-4 border-slate-300 text-slate-400 rounded-xl font-black text-sm active:scale-95 transition-transform hover:bg-slate-50 cat-font">
                                        NO, WAIT
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    </>
  );
}