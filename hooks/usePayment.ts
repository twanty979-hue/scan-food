import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { 
    getPaymentInitialDataAction, 
    getUnpaidOrdersAction, 
    processPaymentAction,
    updateOrderStatusAction,
    getPendingAndPreparingOrdersAction,
    getAllTablesAction, // ✅ 1. เพิ่ม Import นี้
    cancelOrderAction,
    cancelOrderItemAction
} from '@/app/actions/paymentActions';
import { getLatestTableDataAction } from '@/app/actions/tableActions';
import { getOrderUsage } from '@/app/actions/limitGuard';


export function usePayment() {
    // --- State ---
    const [activeTab, setActiveTab] = useState<'tables' | 'pos'>('tables');
    const [loading, setLoading] = useState(true);
    const [autoKitchen, setAutoKitchen] = useState(false);
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

    // ✅ เพิ่ม Ref เพื่อกันยิงซ้ำ (Race Condition)
    const processedOrdersRef = useRef<Set<string>>(new Set());

    // --- Helpers ---
    const roundForCash = (amount: number) => Math.ceil(amount * 4) / 4;

    const getFullImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const fullPath = brandId ? `${brandId}/${path}` : path;
        const { data } = supabase.storage.from('brands').getPublicUrl(fullPath);
        return data.publicUrl;
    };

    const refreshQuota = useCallback(async () => {
        if (!brandId) return;
        const usage = await getOrderUsage(brandId);
        setLimitStatus(usage);
    }, [brandId]);

    // ✅ 2. เพิ่มฟังก์ชันโหลดโต๊ะใหม่ (Refresh Tables)
    const refreshTables = useCallback(async () => {
        if (!brandId) return;
        const tables = await getAllTablesAction(brandId);
        setAllTables(tables);
    }, [brandId]);

    const playSound = () => {
        const audio = new Audio('/sounds/alert.mp3'); 
        audio.volume = 1.0; 
        audio.play().catch(e => console.error("เล่นเสียงไม่ได้: ", e));
    };

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
                
                const usage = await getOrderUsage(res.brandId!);
                setLimitStatus(usage);

                const orders = await getUnpaidOrdersAction(res.brandId!);
                setUnpaidOrders(orders);
            }
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('pos_cart', JSON.stringify(cart));
            localStorage.setItem('auto_kitchen_enabled', String(autoKitchen));
        }
    }, [cart, autoKitchen]);

    const refreshOrders = useCallback(async () => {
        if (!brandId) return;
        const orders = await getUnpaidOrdersAction(brandId);
        setUnpaidOrders(orders);
        refreshQuota(); 
    }, [brandId, refreshQuota]);
// =========================================================================
// ✅ 3. Realtime Listener (แก้ใหม่: แยก Channel เพื่อความเสถียร 100%)
// =========================================================================
useEffect(() => {
    if (!brandId) return;

    // ฟังก์ชันจบงาน (Logic เดิมของคุณ)
    const finishOrder = async (orderId: string) => {
        if (processedOrdersRef.current.has(orderId)) return;
        await updateOrderStatusAction(orderId, 'done');
        console.log(`🤖 Auto: Done (Finished) ${orderId}`);
        processedOrdersRef.current.add(orderId);
        refreshOrders();
    };

    const processOrder = async (order: any) => {
        if (!autoKitchen) return;
        if (order.status === 'pending') {
            await updateOrderStatusAction(order.id, 'preparing');
            console.log(`🤖 Auto: Accepted New Order ${order.id}`);
            playSound();
            setTimeout(() => finishOrder(order.id), 5 * 60 * 1000);
        } else if (order.status === 'preparing') {
            const lastUpdate = dayjs(order.updated_at);
            const now = dayjs();
            const diffMins = now.diff(lastUpdate, 'minute', true);
            console.log(`🤖 Auto: Resuming ${order.id}, Passed: ${diffMins.toFixed(2)} mins`);
            if (diffMins >= 5) {
                finishOrder(order.id);
            } else {
                const remainingMs = (5 - diffMins) * 60 * 1000;
                console.log(`🤖 Auto: Waiting remaining ${remainingMs} ms`);
                setTimeout(() => finishOrder(order.id), remainingMs);
            }
        }
    };

    if (autoKitchen) {
        getPendingAndPreparingOrdersAction(brandId).then(orders => {
            orders.forEach(o => processOrder(o));
        });
    }

    // 🔴 แก้ไขจุดนี้: แยก Channel ออกเป็น 2 ตัว ไม่ใช้ตัวเดียวกัน
    
    // Channel 1: ฟัง Orders (เหมือนโค้ดเก่าที่เคยทำงานได้)
    const orderChannel = supabase.channel('payment_realtime_orders_v3')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `brand_id=eq.${brandId}` }, 
        (payload) => {
            console.log('🔔 Order Update:', payload);
            // หน่วงเวลานิดนึงเพื่อให้ Database บันทึกข้อมูลเสร็จชัวร์ๆ (แก้ Race Condition)
            setTimeout(() => {
                refreshOrders();
                refreshTables(); 
            }, 500);

            if (autoKitchen && payload.eventType === 'INSERT') {
                const newOrder = payload.new;
                if (newOrder.status === 'pending') processOrder(newOrder);
            }
        })
        .subscribe((status) => {
             if (status === 'SUBSCRIBED') console.log('✅ Connected to Orders');
        });

    // Channel 2: ฟัง Tables (แยกออกมาต่างหาก)
    const tableChannel = supabase.channel('payment_realtime_tables_v3')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tables', filter: `brand_id=eq.${brandId}` }, 
        () => {
            console.log('🪑 Table Update');
            setTimeout(() => {
                refreshTables();
            }, 500);
        })
        .subscribe((status) => {
             if (status === 'SUBSCRIBED') console.log('✅ Connected to Tables');
        });

    return () => { 
        // ลบทั้ง 2 channel เมื่อออกจากหน้า
        supabase.removeChannel(orderChannel); 
        supabase.removeChannel(tableChannel);
    };
}, [brandId, autoKitchen, refreshOrders, refreshTables]);

    // --- Logic: Pricing ---
    const calculatePrice = useCallback((product: any, variant: string = 'normal') => {
        let basePrice = Number(product.price || 0);
        if (variant === 'special' && product.price_special) basePrice = Number(product.price_special);
        if (variant === 'jumbo' && product.price_jumbo) basePrice = Number(product.price_jumbo);

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
        // ✅ 1. แปลงเป็นตัวเลขให้ชัวร์ก่อนเริ่มคำนวณ (แก้ปัญหา String เทียบ Number ผิดเพี้ยน)
        const safePayable = Number(payableAmount);
        const safeReceived = Number(receivedAmount);

        if (safePayable <= 0) return;

        // ✅ 2. เช็คยอดเงินด้วยตัวแปรที่แปลงเป็นตัวเลขแล้ว
        if (paymentMethod === 'cash' && safeReceived < safePayable) {
            setStatusModal({ show: true, type: 'error', title: 'ยอดเงินไม่พอ', message: 'กรุณารับเงินเพิ่มจากลูกค้า' });
            return;
        }
        
        // ✅ 3. คำนวณเงินทอน
        const change = paymentMethod === 'promptpay' ? 0 : (safeReceived - safePayable);

        const payload = {
            brandId,
            userId: currentUser?.id,
            totalAmount: safePayable,
            // ถ้า PromptPay ให้ยอดรับ = ยอดต้องจ่าย, ถ้าเงินสด = ยอดที่รับมาจริง
            receivedAmount: paymentMethod === 'promptpay' ? safePayable : safeReceived,
            changeAmount: Number(change.toFixed(2)), // ✅ ปัดเศษทศนิยมให้เรียบร้อยป้องกัน Database Error
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
                total_amount: safePayable,
                received_amount: payload.receivedAmount, // ✅ ใช้ค่าจาก payload ที่ชัวร์แล้ว
                change_amount: payload.changeAmount,     // ✅ ใช้ค่าจาก payload ที่ชัวร์แล้ว
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
            refreshQuota();
            refreshTables(); 
        } else {
            setStatusModal({ show: true, type: 'error', title: 'ผิดพลาด', message: res.error });
        }
    };
    const handleSelectTableForQR = async (table: any) => {
        // 🔥 โหลดสถานะโต๊ะล่าสุดก่อนเปิด Modal เสมอ (Double Check)
        const { success, data } = await getLatestTableDataAction(table.id);
        const updatedTable = (success && data) ? data : table;
        setQrTableData(updatedTable);
        setShowTableSelector(false);
    };

    return {
        activeTab, setActiveTab,
        loading, autoKitchen, setAutoKitchen,
        categories, products: selectedCategory === 'ALL' ? products : products.filter((p: any) => p.category_id === selectedCategory),
        unpaidOrders, allTables,
        selectedCategory, setSelectedCategory,
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
        limitStatus, 
        refreshQuota,
        getFullImageUrl,
        handleSelectTableForQR,
        handleProductClick: (p: any) => (p.price_special || p.price_jumbo) ? setVariantModalProduct(p) : addToCart(p, 'normal'),
        addToCart, removeFromCart,
        handlePayment,
        calculatePrice,
        formatCurrency: (amt: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(amt || 0),
        
        refreshTables // ✅✅✅ เติมบรรทัดนี้เข้าไปครับ แล้วหาย Error ทันที!
    };
}