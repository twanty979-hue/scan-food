// hooks/usePayment.ts

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { 
    getPaymentInitialDataAction, 
    getUnpaidOrdersAction, 
    processPaymentAction,
    updateOrderStatusAction,
    getPendingAndPreparingOrdersAction,
    getAllTablesAction, 
    cancelOrderAction,
    cancelOrderItemAction
} from '@/app/actions/paymentActions';
import { getLatestTableDataAction } from '@/app/actions/tableActions';
import { getOrderUsage } from '@/app/actions/limitGuard';

export function usePayment() {
    // --- Audio State & Ref (iPad Fix) ---
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

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

    const processedOrdersRef = useRef<Set<string>>(new Set());
    
    // ✅ เพิ่ม Ref เพื่อเก็บสถานะล่าสุดของออเดอร์ (แก้ปัญหา Closure ใน setTimeout)
    const unpaidOrdersRef = useRef(unpaidOrders);

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

    const refreshTables = useCallback(async () => {
        if (!brandId) return;
        const tables = await getAllTablesAction(brandId);
        setAllTables(tables);
    }, [brandId]);

    // --- Audio Functions ---
    // ✅ 2. Init Audio
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio('/sounds/alert.mp3');
        }
    }, []);

    // ✅ 3. ฟังก์ชันปลดล็อก (Unlock Trick)
    const unlockAudio = useCallback(() => {
        if (!audioRef.current) return;
        const audio = audioRef.current;
        audio.volume = 0.0; // เล่นเสียงเงียบๆ
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1.0; // คืนค่าความดัง
            setIsAudioUnlocked(true); // จำว่าปลดแล้ว
            console.log("🔊 Audio Context Unlocked!");
        }).catch(e => console.error("Unlock failed:", e));
    }, []);

    // ✅ 4. ฟังก์ชันเล่นเสียงจริง (Play Sound)
    const playSound = useCallback(() => {
        if (!audioRef.current) return;
        const audio = audioRef.current;
        audio.currentTime = 0;
        audio.play().catch(e => console.error("Playback failed:", e));
    }, []);

    // ✅ 5. ฟังก์ชันเปิด Auto Kitchen (ต้องผูกกับปุ่มกด)
    const toggleAutoKitchen = () => {
        const newState = !autoKitchen;
        setAutoKitchen(newState);
        
        // 🔥 ถ้าเปิด Auto ให้ถือโอกาสนี้ปลดล็อกเสียงไปด้วยเลย!
        if (newState && !isAudioUnlocked) {
            unlockAudio();
        }
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
                unpaidOrdersRef.current = orders; // Sync Ref
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

    // ✅ Sync Ref ทุกครั้งที่ unpaidOrders เปลี่ยน
    useEffect(() => {
        unpaidOrdersRef.current = unpaidOrders;
    }, [unpaidOrders]);

    const refreshOrders = useCallback(async () => {
        if (!brandId) return;
        const orders = await getUnpaidOrdersAction(brandId);
        setUnpaidOrders(orders);
        refreshQuota(); 
    }, [brandId, refreshQuota]);

    // =========================================================================
    // ✅ 3. Realtime Listener (แก้ใหม่: เช็คสถานะก่อนยิง Done)
    // =========================================================================
    useEffect(() => {
        if (!brandId) return;

        const finishOrder = async (orderId: string) => {
            if (processedOrdersRef.current.has(orderId)) return;

            // 🛑 เช็คสถานะล่าสุดจาก Database ก่อนยิง (กันเหนียวสุดๆ)
            const { data: currentOrder } = await supabase
                .from('orders')
                .select('status')
                .eq('id', orderId)
                .single();

            // ถ้าออเดอร์ไม่อยู่แล้ว หรือสถานะเป็น cancelled -> จบข่าว ไม่ต้องทำอะไร
            if (!currentOrder || currentOrder.status === 'cancelled' || currentOrder.status === 'done') {
                console.log(`🚫 Auto Skipped: Order ${orderId} is ${currentOrder?.status}`);
                return;
            }

            // ถ้าสถานะยังปกติ ค่อยอัปเดตเป็น done
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
                
                // 🔥 สั่งเล่นเสียงตรงนี้ (iPad จะยอมให้เล่นถ้า unlockAudio ถูกเรียกไปแล้ว)
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

        const orderChannel = supabase.channel('payment_realtime_orders_v3')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `brand_id=eq.${brandId}` }, 
            (payload) => {
                console.log('🔔 Order Update:', payload);
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
            supabase.removeChannel(orderChannel); 
            supabase.removeChannel(tableChannel);
        };
    }, [brandId, autoKitchen, refreshOrders, refreshTables, playSound]);

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
    
    // ✅✅✅ เพิ่มบรรทัดนี้ที่หายไปกลับมาครับ
    const payableAmount = useMemo(() => {
        if (paymentMethod === 'cash') return roundForCash(rawTotal);
        return Number(rawTotal.toFixed(2));
    }, [rawTotal, paymentMethod]);

    const handlePayment = async () => {
        const safePayable = Number(payableAmount);
        const safeReceived = Number(receivedAmount);

        if (safePayable <= 0) return;

        if (paymentMethod === 'cash' && safeReceived < safePayable) {
            setStatusModal({ show: true, type: 'error', title: 'ยอดเงินไม่พอ', message: 'กรุณารับเงินเพิ่มจากลูกค้า' });
            return;
        }
        
        const change = paymentMethod === 'promptpay' ? 0 : (safeReceived - safePayable);

        const payload = {
            brandId,
            userId: currentUser?.id,
            totalAmount: safePayable,
            receivedAmount: paymentMethod === 'promptpay' ? safePayable : safeReceived,
            changeAmount: Number(change.toFixed(2)), 
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
                received_amount: payload.receivedAmount, 
                change_amount: payload.changeAmount, 
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
        
        refreshTables,
        toggleAutoKitchen, // ✅ ส่งฟังก์ชันนี้ออกไปแทน setAutoKitchen
        unlockAudio, // ✅ ส่งฟังก์ชันปลดล็อกออกไป
        isAudioUnlocked // ✅ ส่งสถานะออกไป
    };
}