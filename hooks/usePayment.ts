// hooks/usePayment.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase'; // Client for Realtime
import { 
    getPaymentInitialDataAction, 
    getUnpaidOrdersAction, 
    processPaymentAction,
    updateOrderStatusAction,
    getPendingOrdersAction 
} from '@/app/actions/paymentActions';
import { getLatestTableDataAction } from '@/app/actions/tableActions';
// ✅ 1. เพิ่ม Import ฟังก์ชันเช็กโควต้า
import { getOrderUsage } from '@/app/actions/limitGuard';

export function usePayment() {
    // --- State ---
    const [activeTab, setActiveTab] = useState<'tables' | 'pos'>('tables');
    const [loading, setLoading] = useState(true);
    const [autoKitchen, setAutoKitchen] = useState(false);
    
    // ✅ 2. เพิ่ม State เก็บสถานะโควต้า
    const [limitStatus, setLimitStatus] = useState<any>(null);

    // Data
    const [brandId, setBrandId] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [unpaidOrders, setUnpaidOrders] = useState<any[]>([]);
    const [allTables, setAllTables] = useState<any[]>([]);
    
    // User
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentProfile, setCurrentProfile] = useState<any>(null);
    const [currentBrand, setCurrentBrand] = useState<any>(null);

    // UI
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [cart, setCart] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [receivedAmount, setReceivedAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'promptpay'>('cash');

    // Modals
    const [variantModalProduct, setVariantModalProduct] = useState<any>(null);
    const [statusModal, setStatusModal] = useState<{ show: boolean; type: 'success' | 'error' | 'alert' | 'qrcode'; title: string; message: string }>({
        show: false, type: 'success', title: '', message: ''
    });
    const [completedReceipt, setCompletedReceipt] = useState<any>(null);
    const [qrTableData, setQrTableData] = useState<any>(null);
    const [showTableSelector, setShowTableSelector] = useState(false);

    // --- Helpers ---
    const roundForCash = (amount: number) => Math.ceil(amount * 4) / 4;

    const getFullImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const fullPath = brandId ? `${brandId}/${path}` : path;
        const { data } = supabase.storage.from('brands').getPublicUrl(fullPath);
        return data.publicUrl;
    };

    // ✅ 3. Helper สำหรับรีเฟรชโควต้า (ใช้ตอนจ่ายเงินเสร็จ)
    const refreshQuota = useCallback(async () => {
        if (!brandId) return;
        const usage = await getOrderUsage(brandId);
        setLimitStatus(usage);
    }, [brandId]);

    // --- Init ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedAuto = localStorage.getItem('auto_kitchen_enabled');
            if (savedAuto === 'true') setAutoKitchen(true);
            
            const savedCart = localStorage.getItem('pos_cart');
            if (savedCart) {
                try { const parsed = JSON.parse(savedCart); if (parsed.length > 0) setCart(parsed); } catch (e) { console.error(e); }
            }
        }
        
        const init = async () => {
            const res = await getPaymentInitialDataAction();
            if (res.success) {
                setBrandId(res.brandId!);
                setCurrentUser(res.user);
                setCurrentProfile(res.profile);
                setCurrentBrand(res.brand);
                setCategories(res.categories || []);
                setProducts(res.products || []);
                setDiscounts(res.discounts || []);
                setAllTables(res.tables || []);
                
                // ✅ 4. ดึงข้อมูลโควต้าตั้งแต่เริ่มต้น
                const usage = await getOrderUsage(res.brandId!);
                setLimitStatus(usage);

                // Load unpaid orders
                const orders = await getUnpaidOrdersAction(res.brandId!);
                setUnpaidOrders(orders);
            }
            setLoading(false);
        };
        init();
    }, []);

    // Save Cart & Auto Settings
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('pos_cart', JSON.stringify(cart));
            localStorage.setItem('auto_kitchen_enabled', String(autoKitchen));
        }
    }, [cart, autoKitchen]);

    // --- Logic: Refresh Orders ---
    const refreshOrders = useCallback(async () => {
        if (!brandId) return;
        const orders = await getUnpaidOrdersAction(brandId);
        setUnpaidOrders(orders);
        // ✅ 5. อัปเดตโควต้าด้วยทุกครั้งที่มีการเปลี่ยนแปลง Order
        refreshQuota(); 
    }, [brandId, refreshQuota]);

    // --- Logic: Auto Kitchen & Realtime ---
    useEffect(() => {
        if (!brandId) return;

        // 1. Process Logic
        const processOrder = async (orderId: string, currentStatus: string) => {
            if (!autoKitchen) return;

            if (currentStatus === 'pending') {
                await updateOrderStatusAction(orderId, 'preparing');
                console.log(`🤖 Auto: Accepted ${orderId}`);
                
                // Schedule Done (5 mins)
                setTimeout(async () => {
                    await updateOrderStatusAction(orderId, 'done');
                    console.log(`🤖 Auto: Done ${orderId}`);
                    refreshOrders();
                }, 5 * 60 * 1000); 
            }
        };

        // 2. Scan Existing Pending (On Toggle On)
        if (autoKitchen) {
            getPendingOrdersAction(brandId).then(orders => {
                orders.forEach(o => processOrder(o.id, o.status));
            });
        }

        // 3. Realtime Listener
        const channel = supabase.channel('payment_realtime_v2')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `brand_id=eq.${brandId}` }, 
            (payload) => {
                // Refresh list
                refreshOrders();

                // Check Auto Kitchen
                if (autoKitchen && payload.eventType === 'INSERT') {
                    const newOrder = payload.new;
                    if (newOrder.status === 'pending') processOrder(newOrder.id, 'pending');
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [brandId, autoKitchen, refreshOrders]);

    // --- Logic: Pricing ---
    const calculatePrice = useCallback((product: any, variant: string = 'normal') => {
        let basePrice = Number(product.price || 0);
        
        // Handle Variants
        if (variant === 'special' && product.price_special) basePrice = Number(product.price_special);
        if (variant === 'jumbo' && product.price_jumbo) basePrice = Number(product.price_jumbo);

        // Fallback for modal product which might be incomplete
        if (!product.price_special && !product.price_jumbo && products.length > 0) {
             const originalProduct = products.find(p => p.id === product.id);
             if(originalProduct) {
                 if(variant === 'normal') basePrice = Number(originalProduct.price);
                 if(variant === 'special') basePrice = Number(originalProduct.price_special);
                 if(variant === 'jumbo') basePrice = Number(originalProduct.price_jumbo);
             }
        }

        const now = new Date();
        const applicableDiscounts = discounts.filter(d => {
            const isTimeValid = (!d.start_date || new Date(d.start_date) <= now) && (!d.end_date || new Date(d.end_date) >= now);
            if (!isTimeValid) return false;
            
            // Check Scope
            if (variant === 'normal' && !d.apply_normal) return false;
            if (variant === 'special' && !d.apply_special) return false;
            if (variant === 'jumbo' && !d.apply_jumbo) return false;
            
            if (d.apply_to === 'all') return true;
            if (d.apply_to === 'specific') return d.discount_products?.some((dp: any) => dp.product_id === product.id);
            return false;
        });

        if (applicableDiscounts.length === 0) return { original: basePrice, final: basePrice, discount: 0, promoDetails: null };

        let bestPrice = basePrice;
       let bestDiscountObj: any = null;

        applicableDiscounts.forEach(d => {
            let final = basePrice;
            if (d.type === 'percentage') final = basePrice - (basePrice * d.value / 100);
            else if (d.type === 'fixed') final = basePrice - d.value;
            final = Math.max(0, final);
            if (final < bestPrice) {
                bestPrice = final;
                bestDiscountObj = d;
            }
        });

        return { 
            original: basePrice, final: bestPrice, discount: basePrice - bestPrice,
            promoDetails: bestDiscountObj ? { id: bestDiscountObj.id, name: bestDiscountObj.name, type: bestDiscountObj.type, value: bestDiscountObj.value, savedAmount: basePrice - bestPrice } : null
        };
    }, [discounts, products]);

    // --- Logic: Cart ---
    const addToCart = useCallback((product: any, variant: string) => {
        const pricing = calculatePrice(product, variant);
        setCart(prev => {
            const idx = prev.findIndex(item => item.id === product.id && item.variant === variant);
            if (idx > -1) {
                const newCart = [...prev];
                newCart[idx] = { ...newCart[idx], quantity: newCart[idx].quantity + 1 };
                return newCart;
            }
            return [...prev, { id: product.id, name: product.name, variant, price: pricing.final, originalPrice: pricing.original, quantity: 1, image_url: product.image_url, promotion_snapshot: pricing.promoDetails }];
        });
        setVariantModalProduct(null);
    }, [calculatePrice]);

    const removeFromCart = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));

    // --- Logic: Payment ---
    const rawTotal = useMemo(() => activeTab === 'tables' ? (selectedOrder?.total_price || 0) : cart.reduce((s, i) => s + (i.price * i.quantity), 0), [activeTab, selectedOrder, cart]);
    
    const payableAmount = useMemo(() => {
        if (paymentMethod === 'cash') return roundForCash(rawTotal);
        return Number(rawTotal.toFixed(2));
    }, [rawTotal, paymentMethod]);

    const handlePayment = async () => {
        if (payableAmount <= 0) return;
        if (paymentMethod === 'cash' && receivedAmount < payableAmount) {
            setStatusModal({ show: true, type: 'error', title: 'ยอดเงินไม่พอ', message: 'กรุณารับเงินเพิ่มจากลูกค้า' });
            return;
        }
        
        const change = paymentMethod === 'promptpay' ? 0 : receivedAmount - payableAmount;

        const payload = {
            brandId,
            userId: currentUser?.id,
            totalAmount: payableAmount,
            receivedAmount: paymentMethod === 'promptpay' ? payableAmount : receivedAmount,
            changeAmount: change,
            paymentMethod,
            type: activeTab,
            selectedOrder,
            cart
        };

        const res = await processPaymentAction(payload);

        if (res.success) {
            setCompletedReceipt({
                id: res.payRecord.id, 
                created_at: new Date().toISOString(), 
                total_amount: payableAmount,
                received_amount: paymentMethod === 'promptpay' ? payableAmount : receivedAmount,
                change_amount: change, 
                payment_method: paymentMethod, 
                cashier: currentProfile, 
                brand: currentBrand,
                table_label: res.tableLabel, 
                items: res.receiptItems
            });

            setStatusModal({ show: false, type: 'success', title: '', message: '' });
            setSelectedOrder(null);
            setReceivedAmount(0);
            setCart([]);
            localStorage.removeItem('pos_cart');
            refreshOrders();
            // ✅ 6. จ่ายเงินสำเร็จแล้ว อัปเดตตัวเลขโควต้าทันที
            refreshQuota(); 
        } else {
            setStatusModal({ show: true, type: 'error', title: 'ผิดพลาด', message: res.error });
        }
    };

    const handleSelectTableForQR = async (table: any) => {
        const { success, data } = await getLatestTableDataAction(table.id);
        setQrTableData(success && data ? data : table);
        setShowTableSelector(false);
    };

    return {
        // State
        activeTab, setActiveTab,
        loading, autoKitchen, setAutoKitchen,
        categories, products: selectedCategory === 'ALL' ? products : products.filter((p: any) => p.category_id === selectedCategory),
        unpaidOrders, allTables,
        selectedCategory, setSelectedCategory,
        cart, selectedOrder, setSelectedOrder,
        receivedAmount, setReceivedAmount,
        paymentMethod, setPaymentMethod,
        payableAmount, rawTotal,
        // Modals
        variantModalProduct, setVariantModalProduct,
        statusModal, setStatusModal,
        completedReceipt, setCompletedReceipt,
        qrTableData, setQrTableData,
        showTableSelector, setShowTableSelector,
        currentBrand,
        // ✅ 7. ส่งค่าโควต้าและฟังก์ชันรีเฟรชออกไปให้ UI ใช้
        limitStatus, 
        refreshQuota,

        // Methods
        getFullImageUrl,
        handleSelectTableForQR,
        handleProductClick: (p: any) => (p.price_special || p.price_jumbo) ? setVariantModalProduct(p) : addToCart(p, 'normal'),
        addToCart, removeFromCart,
        handlePayment,
        calculatePrice,
        formatCurrency: (amt: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(amt || 0)
    };
}