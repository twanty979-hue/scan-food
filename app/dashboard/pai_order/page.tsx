'use client';

import { usePayment } from '@/hooks/usePayment';
import { IconWallet, IconReceipt, IconGrid, IconTrash, IconX, IconCheckCircle, IconAlertCircle, IconQrcode } from './components/Icons';
import ReceiptModal from './components/ReceiptModal';
import TableQrModal from '../tables/TableQrModal'; 

// --- Icon Auto ---
const IconZap = ({ size = 20, className = "" }: any) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);

export default function PaymentPage() {
    const {
        activeTab, setActiveTab, loading, 
        autoKitchen, setAutoKitchen,
        categories, products, unpaidOrders, allTables,
        selectedCategory, setSelectedCategory,
        
        // ✅ เพิ่ม calculatePrice ตรงนี้
        calculatePrice,

        cart, selectedOrder, setSelectedOrder,
        receivedAmount, setReceivedAmount,
        paymentMethod, setPaymentMethod,
        payableAmount, rawTotal,
        variantModalProduct, setVariantModalProduct,
        statusModal, setStatusModal,
        completedReceipt, setCompletedReceipt,
        qrTableData, setQrTableData,
        showTableSelector, setShowTableSelector,
        currentBrand,
        getFullImageUrl, handleSelectTableForQR, handleProductClick,
        addToCart, removeFromCart, handlePayment, formatCurrency
    } = usePayment();

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-6 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Table/Menu */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="flex gap-2 shrink-0 overflow-x-auto no-scrollbar">
                        <div className="bg-white p-2 rounded-2xl shadow-sm flex shrink-0 flex-1">
                            <button onClick={() => { setActiveTab('tables'); setSelectedOrder(null); }} className={`flex-1 py-3 px-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all ${activeTab === 'tables' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}><IconReceipt size={18} /> โต๊ะ ({unpaidOrders.length})</button>
                            <button onClick={() => { setActiveTab('pos'); setSelectedOrder(null); }} className={`flex-1 py-3 px-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all ${activeTab === 'pos' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400'}`}><IconGrid size={18} /> POS</button>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setAutoKitchen(!autoKitchen)}
                                className={`h-full aspect-square rounded-2xl shadow-sm flex items-center justify-center transition-all border-2 ${
                                    autoKitchen 
                                    ? 'bg-green-100 border-green-500 text-green-600 shadow-green-200' 
                                    : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300'
                                }`}
                                title={autoKitchen ? "ปิดระบบรับออเดอร์อัตโนมัติ" : "เปิดระบบรับออเดอร์อัตโนมัติ"}
                            >
                                <IconZap size={24} className={autoKitchen ? 'animate-pulse' : ''} />
                            </button>

                            <button 
                                onClick={() => setShowTableSelector(true)} 
                                className="h-full aspect-square bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all border-2 border-transparent hover:border-blue-200"
                                title="พิมพ์ QR Code"
                            >
                                <IconQrcode size={24}/>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] shadow-xl border border-slate-200 h-[75vh] flex flex-col overflow-hidden">
                        {activeTab === 'tables' ? (
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                                {unpaidOrders.length === 0 && <div className="text-center py-20 text-slate-400 font-bold">ไม่มีรายการที่ต้องชำระ</div>}
                                {unpaidOrders.map((o, i) => (
                                    <button key={i} onClick={() => { setSelectedOrder(o); setReceivedAmount(0); }} className={`w-full p-5 rounded-2xl border-2 flex justify-between items-center transition-all ${selectedOrder?.table_label === o.table_label ? 'border-orange-500 bg-orange-50 shadow-lg' : 'border-white bg-white hover:border-slate-200'}`}>
                                            <div className="text-left"><p className="font-black text-xl text-slate-800">โต๊ะ {o.table_label}</p><p className="text-xs text-slate-400 font-bold uppercase">{o.order_items?.length || 0} รายการ</p></div>
                                            <p className="font-black text-2xl text-orange-600">{formatCurrency(o.total_price)}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col h-full bg-white">
                                <div className="p-4 border-b flex gap-2 overflow-x-auto no-scrollbar shrink-0 bg-white">
                                    <button onClick={() => setSelectedCategory('ALL')} className={`px-5 py-2 rounded-xl text-sm font-black shrink-0 transition-all ${selectedCategory === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>ทั้งหมด</button>
                                    {categories.map(cat => (
                                        <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-5 py-2 rounded-xl text-sm font-black shrink-0 transition-all ${selectedCategory === cat.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>{cat.name}</button>
                                    ))}
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-slate-50/30">
                                    {products.map(p => {
                                        // 🔥 คำนวณราคาจริงและส่วนลด
                                        const pricing = calculatePrice(p, 'normal');
                                        const hasDiscount = pricing.discount > 0;

                                        return (
                                            <button 
                                                key={p.id} 
                                                onClick={() => handleProductClick(p)} 
                                                className={`
                                                    relative h-32 bg-white rounded-2xl border-2 transition-all flex flex-col justify-between p-4 group overflow-hidden
                                                    ${hasDiscount ? 'border-orange-100 hover:border-orange-500' : 'border-slate-200 hover:border-slate-900'}
                                                    hover:shadow-lg
                                                `}
                                            >
                                                {/* 🔥 ป้าย SALE */}
                                                {hasDiscount && (
                                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-bl-xl z-10 shadow-sm animate-in fade-in zoom-in">
                                                        SALE
                                                    </span>
                                                )}

                                                <h3 className="font-bold text-slate-700 text-left text-lg leading-tight line-clamp-2 group-hover:text-black">
                                                    {p.name}
                                                </h3>
                                                
                                                <div className="text-right w-full">
                                                    {/* 🔥 ราคาเดิม (ขีดฆ่า) */}
                                                    {hasDiscount && (
                                                        <span className="text-xs text-slate-400 line-through font-bold block">
                                                            {formatCurrency(pricing.original)}
                                                        </span>
                                                    )}
                                                    {/* 🔥 ราคาขายจริง */}
                                                    <span className={`font-black text-xl ${hasDiscount ? 'text-red-500' : 'text-slate-900'}`}>
                                                        {formatCurrency(pricing.final)}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Summary & Payment */}
                <div className="lg:col-span-5 flex flex-col h-[82vh]">
                    <div className="bg-white rounded-[32px] shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full">
                        <div className="p-5 border-b shrink-0 bg-slate-900 text-white flex justify-between items-center">
                            <h2 className="text-lg font-black flex items-center gap-2"><IconWallet /> สรุปบิล</h2>
                            {selectedOrder && activeTab === 'tables' && (
                                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">โต๊ะ {selectedOrder.table_label}</span>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
                            {(activeTab === 'tables' ? selectedOrder?.order_items : cart)?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center py-3 px-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex gap-3 items-center">
                                        <div className="bg-orange-50 w-10 h-10 rounded-xl flex items-center justify-center border border-orange-100">
                                            <span className="text-sm font-black text-orange-600">{item.quantity}x</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-700 leading-tight">{item.product_name || item.name}</p>
                                            {item.variant !== 'normal' && <span className="text-[10px] font-bold text-orange-400 uppercase italic">{item.variant}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right leading-tight">
                                            {item.originalPrice && item.price < item.originalPrice && <p className="text-[10px] text-slate-400 line-through font-bold">{formatCurrency(item.originalPrice * item.quantity)}</p>}
                                            <p className={`font-black ${item.price < item.originalPrice ? 'text-red-500' : 'text-slate-900'}`}>{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                        {activeTab === 'pos' && <button onClick={() => removeFromCart(idx)} className="text-red-300 hover:text-red-500 transition-colors"><IconTrash size={16}/></button>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(selectedOrder || cart.length > 0) && (
                            <div className="p-6 bg-white border-t space-y-4 shrink-0 shadow-[0_-15px_30px_rgba(0,0,0,0.03)]">
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <button onClick={() => setPaymentMethod('cash')} className={`py-3 rounded-2xl font-black flex items-center justify-center gap-2 border-2 transition-all ${paymentMethod === 'cash' ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-100 text-slate-400'}`}><IconWallet /> เงินสด</button>
                                    <button onClick={() => setPaymentMethod('promptpay')} className={`py-3 rounded-2xl font-black flex items-center justify-center gap-2 border-2 transition-all ${paymentMethod === 'promptpay' ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'border-slate-100 text-slate-400'}`}><IconQrcode /> พร้อมเพย์</button>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest">ยอดสุทธิ {paymentMethod === 'cash' && '(ปัดเศษ)'}</p>
                                    <div className="text-right">
                                        {rawTotal !== payableAmount && <p className="text-xs text-slate-400 line-through font-bold">{formatCurrency(rawTotal)}</p>}
                                        <p className="text-3xl font-black text-slate-900">{formatCurrency(payableAmount)}</p>
                                    </div>
                                </div>
                                
                                {paymentMethod === 'cash' && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom duration-300">
                                            <input type="number" className="w-full text-2xl p-4 bg-slate-50 border-2 rounded-2xl font-black text-right outline-none focus:border-orange-500" value={receivedAmount || ''} onChange={(e) => setReceivedAmount(Number(e.target.value))} placeholder="รับเงินมา..." />
                                            <div className="grid grid-cols-4 gap-2">
                                                {[20, 50, 100, 500, 1000].map(v => <button key={v} onClick={() => setReceivedAmount(prev => prev + v)} className="py-2 bg-slate-100 rounded-xl font-black text-xs hover:bg-slate-200 transition-colors">+{v}</button>)}
                                                <button onClick={() => setReceivedAmount(payableAmount)} className="col-span-3 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-xs uppercase border border-blue-100">รับเงินพอดี</button>
                                            </div>
                                    </div>
                                )}
                                
                                <button onClick={() => paymentMethod === 'promptpay' ? setStatusModal({show: true, type: 'qrcode', title:'', message:''}) : handlePayment()} className={`w-full py-5 rounded-[28px] font-black text-xl text-white shadow-xl active:scale-95 transition-all ${paymentMethod === 'promptpay' ? 'bg-blue-600 shadow-blue-200' : 'bg-slate-900 shadow-slate-200'}`}>
                                    {paymentMethod === 'promptpay' ? 'แสดง QR รับเงิน' : 'ยืนยันรับเงิน'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Modals --- */}
            {/* 1. Modal เลือกโต๊ะ */}
            {showTableSelector && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in duration-300">
                         <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-black text-slate-800">เลือกโต๊ะเพื่อพิมพ์ QR</h3>
                            <button onClick={() => setShowTableSelector(false)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"><IconX size={20}/></button>
                         </div>
                         <div className="p-4 overflow-y-auto grid grid-cols-3 gap-3">
                             {allTables.map((table) => (
                                 <button 
                                    key={table.id}
                                    onClick={() => handleSelectTableForQR(table)}
                                    className="p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 group"
                                 >
                                     <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-lg group-hover:bg-blue-600 transition-colors">{table.label}</div>
                                     <span className="text-xs font-bold text-slate-500">{table.status === 'available' ? 'ว่าง' : 'ไม่ว่าง'}</span>
                                 </button>
                             ))}
                             {allTables.length === 0 && <p className="col-span-3 text-center text-slate-400 py-4">ไม่มีข้อมูลโต๊ะ</p>}
                         </div>
                    </div>
                </div>
            )}

            {/* 2. Modal QR Code */}
            {qrTableData && (
                <TableQrModal 
                    table={qrTableData} 
                    brandId={currentBrand?.id} 
                    brandSlug={currentBrand?.slug}
                    qrLogoUrl={getFullImageUrl(currentBrand?.qr_image_url)} 
                    onClose={() => setQrTableData(null)} 
                />
            )}

            {/* Status Modal (PromptPay / Alert) */}
            {statusModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="bg-white rounded-[40px] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
                        {statusModal.type === 'qrcode' ? (
                            <div className="space-y-4">
                                <div className="bg-blue-600 p-3 rounded-2xl inline-block shadow-lg"><img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/PromptPay-logo.png" className="h-5 brightness-0 invert" alt="PP" /></div>
                                <div className="bg-slate-100 px-4 py-1 rounded-lg inline-block"><p className="text-slate-500 font-bold text-xs">โอนเข้า: {currentBrand?.promptpay_number || '0000000000'}</p></div>
                                <div className="bg-white p-2 border-4 border-blue-600 rounded-3xl inline-block shadow-inner"><img src={`https://promptpay.io/${currentBrand?.promptpay_number || '0000000000'}/${payableAmount}.png`} className="w-52 h-52" alt="QR" /></div>
                                <p className="text-3xl font-black text-slate-900 uppercase">{formatCurrency(payableAmount)}</p>
                                <div className="flex flex-col gap-2 pt-2">
                                    <button onClick={handlePayment} className="w-full py-4 bg-green-500 text-white rounded-3xl font-black text-lg shadow-lg shadow-green-200">โอนสำเร็จแล้ว</button>
                                    <button onClick={() => setStatusModal(prev => ({ ...prev, show: false }))} className="text-slate-400 font-black text-xs uppercase tracking-widest mt-2">ยกเลิกรายการ</button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-4">
                                <div className="flex justify-center mb-4">{statusModal.type === 'success' ? <IconCheckCircle size={70} /> : <IconAlertCircle size={70} />}</div>
                                <h3 className="text-2xl font-black mb-1 text-slate-800 uppercase">{statusModal.title}</h3>
                                <p className="text-slate-500 font-bold mb-8 text-lg">{statusModal.message}</p>
                                <button onClick={() => setStatusModal(prev => ({ ...prev, show: false }))} className="w-full py-5 rounded-3xl font-black text-white text-lg bg-slate-900 active:scale-95 transition-all shadow-xl shadow-slate-200">ตกลง</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Variant Modal */}
            {variantModalProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden p-8 animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-slate-800 uppercase">เลือกขนาด</h3><button onClick={() => setVariantModalProduct(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><IconX size={20}/></button></div>
                        <div className="space-y-4">
                            {[
                                { label: 'ธรรมดา', key: 'normal', ...calculatePrice(variantModalProduct, 'normal') },
                                variantModalProduct.price_special && { label: 'พิเศษ ✨', key: 'special', ...calculatePrice(variantModalProduct, 'special') },
                                variantModalProduct.price_jumbo && { label: 'จัมโบ้ 🔥', key: 'jumbo', ...calculatePrice(variantModalProduct, 'jumbo') }
                            ].filter(Boolean).map((opt: any) => (
                                <button key={opt.key} onClick={() => addToCart(variantModalProduct, opt.key)} className="w-full flex justify-between items-center p-5 rounded-3xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all font-black text-lg group">
                                    <div className="text-left flex flex-col">
                                        <span className="text-slate-600 group-hover:text-orange-600 uppercase tracking-tight">{opt.label}</span>
                                        {/* โชว์ป้ายประหยัดใน Modal ด้วย */}
                                        {opt.discount > 0 && <span className="text-[10px] text-white bg-red-500 px-2 py-0.5 rounded w-fit">ประหยัด {formatCurrency(opt.discount)}</span>}
                                    </div>
                                    <div className="text-right leading-none">
                                        {opt.final < opt.original && <span className="text-[10px] text-slate-400 line-through font-bold block">{formatCurrency(opt.original)}</span>}
                                        <span className={`font-black ${opt.final < opt.original ? 'text-red-500' : 'text-slate-900'}`}>{formatCurrency(opt.final)}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {completedReceipt && <ReceiptModal receipt={completedReceipt} onClose={() => setCompletedReceipt(null)} />}
        </div>
    );
}