"use client";
import React from "react";

export const ThemeMaster = ({ state, actions, helpers, themeConfig, themeIcons }: any) => {
  const { activeTab, brand, tableLabel, banners, currentBannerIndex, categories, selectedCategoryId, products, filteredProducts, selectedProduct, cart, cartTotal, ordersList } = state;
  const { setActiveTab, setSelectedCategoryId, setSelectedProduct, handleAddToCart, updateQuantity, handleCheckout } = actions;
  const { calculatePrice, getMenuUrl, getBannerUrl } = helpers;

  const totalDiscount = cart?.reduce((acc: number, item: any) => acc + (item.discount || 0) * item.quantity, 0) || 0;

  return (
    <div className="w-full max-w-full lg:max-w-2xl mx-auto min-h-screen pb-48 relative overflow-x-hidden font-sans" 
         style={{ backgroundColor: themeConfig.colors.bg, color: themeConfig.colors.text }}>
        
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Mali:wght@400;700&display=swap');
            .theme-font { font-family: ${themeConfig.styles.font}; }
            
            @keyframes spring-pop {
                0% { transform: scale(0.5); opacity: 0; }
                70% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes nav-up {
                0% { transform: translate(-50%, 120px); }
                70% { transform: translate(-50%, -15px); }
                100% { transform: translate(-50%, 0); }
            }
            .animate-pop { animation: spring-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
            .animate-nav { animation: nav-up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
            .active-squash:active { transform: scale(0.9); transition: 0.1s; }
            .no-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>

        {/* 🚐 HEADER */}
        <div className="fixed top-0 inset-x-0 z-50 w-full max-w-2xl mx-auto px-4 pt-4">
             <header className="animate-pop flex justify-between items-center p-5 border-[6px] shadow-[0_10px_0_rgba(0,0,0,0.2)] relative overflow-hidden" 
                     style={{ backgroundColor: themeConfig.colors.primary, borderColor: themeConfig.colors.border, borderRadius: themeConfig.styles.headerRadius }}>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-white/20 p-2 rounded-full border-2 border-white/50">{themeIcons.header}</div>
                    <div>
                        <h1 className="text-2xl sm:text-4xl theme-font text-white drop-shadow-[4px_4px_0_rgba(0,0,0,0.3)]">{brand?.name}</h1>
                        <div className="px-4 py-0.5 text-white text-[10px] font-black rounded-full border-2 mt-1 inline-block shadow-sm" style={{ backgroundColor: themeConfig.colors.secondary, borderColor: themeConfig.colors.border }}>
                            TABLE {tableLabel}
                        </div>
                    </div>
                </div>
                <button className="bg-white p-3 rounded-2xl border-4 border-black active-squash shadow-md"><themeIcons.search className="w-6 h-6" /></button>
             </header>
        </div>

        <main className="relative z-10 px-5 pt-36">
            {activeTab === 'home' && (
                <div className="space-y-8 pb-10">
                    {banners?.length > 0 && (
                        <div className="animate-pop relative w-full h-48 sm:h-64 bg-white rounded-[3rem] overflow-hidden border-[6px]" style={{ borderColor: themeConfig.colors.border }}>
                             <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                             <div className="absolute bottom-5 left-6 bg-white/90 px-5 py-1 border-4 shadow-xl" style={{ borderColor: themeConfig.colors.border }}>
                                <span className="theme-font text-2xl" style={{ color: themeConfig.colors.text }}>{banners[currentBannerIndex].title}</span>
                             </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-6">
                        {products?.filter((p:any) => p.is_recommended).slice(0, 4).map((p:any, idx:number) => (
                            <div key={p.id} onClick={() => setSelectedProduct(p)} 
                                 className={`animate-pop active-squash p-3 cursor-pointer bg-white border-[5px] ${themeConfig.styles.card}`}
                                 style={{ borderColor: themeConfig.colors.border, animationDelay: `${idx * 0.1}s`, boxShadow: `8px 8px 0 ${themeConfig.colors.shadow}` }}>
                                <div className="aspect-square rounded-[1.8rem] overflow-hidden mb-3 border-4 border-black/5 bg-slate-100">
                                    <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="text-xl theme-font truncate">{p.name}</h3>
                                <span className="text-2xl theme-font" style={{ color: themeConfig.colors.primary }}>฿{calculatePrice(p).final}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 🍱 MENU TAB (Large Images) */}
            {activeTab === 'menu' && (
                <div className="pt-2 space-y-6">
                    <div className="flex gap-3 overflow-x-auto no-scrollbar py-4 px-1">
                        {categories?.map((c: any, idx: number) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)} 
                                    className={`animate-pop delay-${idx % 4} active-squash shrink-0 px-8 py-3 rounded-full theme-font text-xl border-[4px] transition-all
                                    ${selectedCategoryId === c.id ? 'bg-white -translate-y-1 shadow-lg' : 'opacity-70'}`}
                                    style={{ backgroundColor: selectedCategoryId === c.id ? themeConfig.colors.accent : 'white', borderColor: themeConfig.colors.border }}>
                                {c.name.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    {filteredProducts?.map((p: any) => (
                        <div key={p.id} onClick={() => setSelectedProduct(p)} className="animate-pop active-squash flex items-center gap-6 bg-white p-5 rounded-[2.5rem] border-[5px] shadow-xl cursor-pointer" style={{ borderColor: themeConfig.colors.border }}>
                            <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-[2.2rem] overflow-hidden shrink-0 border-4 border-black/10 bg-slate-100"><img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" /></div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-2xl sm:text-4xl theme-font leading-tight truncate">{p.name}</h3>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-3xl theme-font" style={{ color: themeConfig.colors.primary }}>฿{calculatePrice(p).final}</span>
                                    <button className="px-6 py-2 rounded-full border-4 theme-font text-lg shadow-md" style={{ backgroundColor: themeConfig.colors.accent, borderColor: themeConfig.colors.border }}>ADD +</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>

        {/* 🛶 NAVIGATION BAR (Fixed Centering!) */}
        <nav className="animate-nav fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-lg h-[85px] flex justify-around items-center px-4 z-[90] rounded-full border-[6px] shadow-[0_12px_0_rgba(0,0,0,0.2)]"
             style={{ backgroundColor: themeConfig.colors.secondary, borderColor: themeConfig.colors.border }}>
            <button onClick={() => setActiveTab('home')} className={`p-4 rounded-full transition-all active-squash ${activeTab === 'home' ? 'bg-white/20 border-4' : 'text-white'}`} style={{ borderColor: themeConfig.colors.border }}><themeIcons.home size={32} /></button>
            <button onClick={() => setActiveTab('menu')} className={`p-4 rounded-full transition-all active-squash ${activeTab === 'menu' ? 'bg-white/20 border-4' : 'text-white'}`} style={{ borderColor: themeConfig.colors.border }}><themeIcons.menu size={32} /></button>
            <div className="relative -top-10">
                <button onClick={() => setActiveTab('cart')} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[6px] flex items-center justify-center text-white shadow-xl active-squash" style={{ backgroundColor: themeConfig.colors.primary, borderColor: themeConfig.colors.border }}>
                    <themeIcons.cart size={44} />
                    {cart?.length > 0 && <span className="absolute -top-1 -right-1 bg-white text-black w-10 h-10 rounded-full flex items-center justify-center border-4 animate-bounce theme-font text-xl">{cart.length}</span>}
                </button>
            </div>
            <button onClick={() => setActiveTab('status')} className={`p-4 rounded-full transition-all active-squash ${activeTab === 'status' ? 'bg-white/20 border-4' : 'text-white'}`} style={{ borderColor: themeConfig.colors.border }}><themeIcons.status size={32} /></button>
        </nav>

        {/* 🌲 MODAL */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-300">
                <div className="bg-white w-full max-w-xl rounded-t-[4rem] border-t-[10px] border-x-[10px] p-8 animate-pop shadow-2xl" style={{ borderColor: themeConfig.colors.border, backgroundColor: themeConfig.colors.bg }}>
                    <div className="aspect-square rounded-[3rem] overflow-hidden mb-8 border-[8px] bg-white shadow-inner" style={{ borderColor: themeConfig.colors.border }}><img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" /></div>
                    <h2 className="text-5xl theme-font text-center mb-6">{selectedProduct.name}</h2>
                    <div className="grid gap-4">
                        {[{ label: 'SCOUT SIZE', key: 'normal' }, { label: 'GIANT SIZE', key: 'jumbo' }].map((opt) => (
                            <button key={opt.key} onClick={() => { handleAddToCart(selectedProduct, opt.key); setSelectedProduct(null); }} 
                                    className="w-full p-6 bg-white border-[6px] rounded-[2rem] flex justify-between items-center active-squash shadow-md" style={{ borderColor: themeConfig.colors.border }}>
                                <span className="theme-font text-2xl">{opt.label}</span>
                                <span className="theme-font text-3xl" style={{ color: themeConfig.colors.primary }}>฿{calculatePrice(selectedProduct, opt.key).final}</span>
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setSelectedProduct(null)} className="w-full mt-6 py-4 theme-font text-xl opacity-50">CLOSE</button>
                </div>
            </div>
        )}
    </div>
  );
};