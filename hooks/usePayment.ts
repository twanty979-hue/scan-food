// hooks/usePayment.ts

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { 
    getPaymentInitialDataAction, 
    getUnpaidOrdersAction, 
    updateOrderStatusAction,
    getPendingAndPreparingOrdersAction,
    getAllTablesAction, 
    cancelOrderAction,
    cancelOrderItemAction
} from '@/app/actions/paymentActions';
import { getLatestTableDataAction } from '@/app/actions/tableActions';
import { getOrderUsage } from '@/app/actions/limitGuard';
import { db } from '@/lib/db'; 

// ✅ ฟังก์ชันสร้าง UUID แบบปลอดภัย
const generateUUID = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export function usePayment() {
    // --- Audio State & Ref ---
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
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio('/sounds/alert.mp3');
        }
    }, []);

    const unlockAudio = useCallback(() => {
        if (!audioRef.current) return;
        const audio = audioRef.current;
        audio.volume = 0.0;
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1.0;
            setIsAudioUnlocked(true);
        }).catch(e => console.error("Unlock failed:", e));
    }, []);

    const playSound = useCallback(() => {
        if (!audioRef.current) return;
        const audio = audioRef.current;
        audio.currentTime = 0;
        audio.play().catch(e => console.error("Playback failed:", e));
    }, []);

    const toggleAutoKitchen = () => {
        const newState = !autoKitchen;
        setAutoKitchen(newState);
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
            try {
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
                    
                    const discountMappings = (res.discounts || []).flatMap((d: any) => 
                        (d.discount_products || []).map((dp: any) => ({
                            discount_id: d.id, product_id: dp.product_id
                        }))
                    );

                    await Promise.all([
                        db.categories.bulkPut(res.categories || []),
                        db.products.bulkPut(res.products || []),
                        db.discounts.bulkPut(res.discounts || []),
                        db.discount_products.bulkPut(discountMappings)
                    ]);

                    const usage = await getOrderUsage(res.brandId!);
                    setLimitStatus(usage);

                    const orders = await getUnpaidOrdersAction(res.brandId!);
                    const localSyncQueue = await db.sync_queue.toArray();
                    const paidLocalOrderIds = localSyncQueue
                        .filter(q => q.type === 'PAYMENT')
                        .map(q => q.payload.localOrderId);

                    const trulyUnpaidOrders = orders.filter((o: any) => !paidLocalOrderIds.includes(o.id));
                    setUnpaidOrders(trulyUnpaidOrders);
                    unpaidOrdersRef.current = trulyUnpaidOrders;
                } else {
                    throw new Error("Cannot fetch from cloud"); 
                }
            } catch (error) {
                console.warn("⚠️ Offline Mode: Loading from local Dexie database");
                const localCats = await db.categories.toArray();
                const localProds = await db.products.toArray();
                const localDiscs = await db.discounts.toArray();
                
                if (localCats.length > 0) setCategories(localCats);
                if (localProds.length > 0) setProducts(localProds);
                if (localDiscs.length > 0) setDiscounts(localDiscs);
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

    useEffect(() => {
        unpaidOrdersRef.current = unpaidOrders;
    }, [unpaidOrders]);

    const refreshOrders = useCallback(async () => {
        if (!brandId) return;
        
        const cloudOrders = await getUnpaidOrdersAction(brandId);
        const localSyncQueue = await db.sync_queue.toArray();
        const paidLocalOrderIds = localSyncQueue
            .filter(q => q.type === 'PAYMENT')
            .map(q => q.payload.localOrderId); 

        const trulyUnpaidOrders = cloudOrders.filter((order: any) => {
            return !paidLocalOrderIds.includes(order.id);
        });

        setUnpaidOrders(trulyUnpaidOrders);
        refreshQuota(); 
    }, [brandId, refreshQuota]);

    // --- Realtime Listener ---
    useEffect(() => {
        if (!brandId) return;

        const finishOrder = async (orderId: string) => {
            if (processedOrdersRef.current.has(orderId)) return;
            const { data: currentOrder } = await supabase.from('orders').select('status').eq('id', orderId).single();
            if (!currentOrder || currentOrder.status === 'cancelled' || currentOrder.status === 'done') return;
            await updateOrderStatusAction(orderId, 'done');
            processedOrdersRef.current.add(orderId);
            refreshOrders();
        };

        const processOrder = async (order: any) => {
            if (!autoKitchen) return;
            if (order.status === 'pending') {
                await updateOrderStatusAction(order.id, 'preparing');
                playSound();
                setTimeout(() => finishOrder(order.id), 5 * 60 * 1000);
            } else if (order.status === 'preparing') {
                const lastUpdate = dayjs(order.updated_at);
                const diffMins = dayjs().diff(lastUpdate, 'minute', true);
                if (diffMins >= 5) {
                    finishOrder(order.id);
                } else {
                    setTimeout(() => finishOrder(order.id), (5 - diffMins) * 60 * 1000);
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
                setTimeout(() => { refreshOrders(); refreshTables(); }, 500);
                if (autoKitchen && payload.eventType === 'INSERT') {
                    const newOrder = payload.new;
                    if (newOrder.status === 'pending') processOrder(newOrder);
                }
            }).subscribe();

        const tableChannel = supabase.channel('payment_realtime_tables_v3')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tables', filter: `brand_id=eq.${brandId}` }, 
            () => { setTimeout(() => refreshTables(), 500); }).subscribe();

        return () => { supabase.removeChannel(orderChannel); supabase.removeChannel(tableChannel); };
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
            final = Math.round(final * 4) / 4;
            if (final < bestPrice) { bestPrice = final; bestDiscountObj = d; }
        });

        return { original: basePrice, final: bestPrice, discount: basePrice - bestPrice, promoDetails: bestDiscountObj };
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

    const rawTotal = useMemo(() => activeTab === 'tables' ? (selectedOrder?.total_price || 0) : cart.reduce((s, i) => s + (i.price * i.quantity), 0), [activeTab, selectedOrder, cart]);
    
    const payableAmount = useMemo(() => {
        if (paymentMethod === 'cash') return roundForCash(rawTotal);
        return Number(rawTotal.toFixed(2));
    }, [rawTotal, paymentMethod]);

// =========================================================================
    // ☁️ Helper: ล้างโต๊ะบน Cloud ทันที (ยิงเฉพาะตอนจ่ายเงินโต๊ะ)
    // =========================================================================
    const clearTableOnCloud = async (brandIdStr: string, tableLabelStr: string, newTokenStr: string, payIdStr: string) => {
        try {
            const nowIso = dayjs().format();
            
            // 1. เปลี่ยนออเดอร์ของโต๊ะนี้เป็น paid
            // 🚨 เอา payment_id ออก! เพราะใบเสร็จยังไม่ขึ้น Cloud (เดี๋ยวตัวปุ่ม Sync ค่อยเอาไปอัปเดตทีหลัง)
            const { error: orderErr } = await supabase.from('orders').update({ 
                status: 'paid',
                updated_at: nowIso
            })
            .eq('brand_id', brandIdStr)
            .eq('table_label', tableLabelStr)
            .in('status', ['pending', 'preparing', 'cooking', 'served', 'done']); 
            
            if (orderErr) {
                console.error("❌ ล้างออเดอร์บน Cloud พลาด (409/อื่นๆ):", orderErr.message);
            }

            // 2. สับเปลี่ยน Token โต๊ะ
            // 🚨 เอา status: 'available' ออก! เพื่อป้องกัน Error 400 อัปเดตแค่ Token พอ
            const { error: tableErr } = await supabase.from('tables').update({ 
                access_token: newTokenStr
            })
            .eq('brand_id', brandIdStr)
            .eq('label', tableLabelStr);

            if (tableErr) {
                console.error("❌ เปลี่ยนรหัสโต๊ะบน Cloud พลาด (400/อื่นๆ):", tableErr.message);
            }

            if (!orderErr && !tableErr) {
                console.log(`🚀 เคลียร์โต๊ะบน Cloud เรียบร้อย: โต๊ะ ${tableLabelStr} (Token ใหม่: ${newTokenStr})`);
            }
        } catch (e) {
            console.error("⚠️ โหลด Cloud ไม่สำเร็จ:", e);
        }
    };

    // =========================================================================
    // 🔥 ระบบชำระเงิน
    // =========================================================================
    const handlePayment = async () => {
        const safePayable = Number(payableAmount);
        const safeReceived = Number(receivedAmount);

        if (safePayable < 0) return; 

        if (paymentMethod === 'cash' && safeReceived < safePayable) {
            setStatusModal({ show: true, type: 'error', title: 'ยอดเงินไม่พอ', message: 'กรุณารับเงินเพิ่มจากลูกค้า' });
            return;
        }
        
        const change = paymentMethod === 'promptpay' ? 0 : (safeReceived - safePayable);
        const nowIso = dayjs().format(); 
        const localPayId = generateUUID(); 

        let finalOrderId = '';
        let tableLabel = 'Walk-in';
        let itemsToSave: any[] = [];
        let orderType = activeTab === 'pos' ? 'pos' : 'table';
        
        let newToken: string | null = null; 

        if (activeTab === 'tables' && selectedOrder) {
            finalOrderId = selectedOrder.id;
            tableLabel = selectedOrder.table_label;
            newToken = Math.random().toString(36).substring(2, 6).toUpperCase(); 
            
            itemsToSave = selectedOrder.order_items
                .filter((i: any) => i.status !== 'cancelled')
                .map((i: any) => ({ ...i, order_id: finalOrderId, updated_at: nowIso }));
        } else {
            finalOrderId = generateUUID();
            itemsToSave = cart.map((i: any) => ({
                id: generateUUID(), order_id: finalOrderId, product_id: i.id, product_name: i.name,
                quantity: i.quantity, price: i.price, variant: i.variant, promotion_snapshot: i.promotion_snapshot,
                status: 'active', created_at: nowIso
            }));
        }

        const newOrderData = {
            id: finalOrderId, brand_id: brandId, status: 'paid', total_price: safePayable,
            table_label: tableLabel, type: orderType, payment_id: localPayId, created_at: nowIso, updated_at: nowIso
        };

        const paiOrderData = {
            id: localPayId, order_id: finalOrderId, brand_id: brandId, total_amount: safePayable,
            received_amount: paymentMethod === 'promptpay' ? safePayable : safeReceived, change_amount: Number(change.toFixed(2)),
            payment_method: paymentMethod, cashier_id: currentUser?.id, created_at: nowIso
        };

        try {
            // 🌟 1. บันทึกข้อมูลลง IndexedDB เสมอ (รอปุ่ม Sync ทำงานทีหลัง)
            await db.transaction('rw', 'orders', 'order_items', 'pai_orders', 'sync_queue', async () => {
                await db.orders.put(newOrderData); 
                await db.order_items.bulkPut(itemsToSave);
                await db.pai_orders.put(paiOrderData);

                await db.sync_queue.add({
                    type: 'PAYMENT',
                    payload: {
                        brandId, userId: currentUser?.id, totalAmount: safePayable, receivedAmount: paiOrderData.received_amount,
                        changeAmount: paiOrderData.change_amount, paymentMethod, type: activeTab,
                        selectedOrder: activeTab === 'tables' ? selectedOrder : null, cart: activeTab === 'pos' ? cart : [],
                        localOrderId: finalOrderId, localPayId, tableLabel, paymentTime: nowIso, newAccessToken: newToken 
                    },
                    status: 'pending'
                });
            });

            console.log("✅ บันทึกลงเครื่องสำเร็จ! (รอคิว Sync)");

            // 🌟 2. ถ้ายืนยันการ "ขายโต๊ะ" (Tables) ให้รีบไปเคลียร์ Cloud ทันที!
            // หมายเหตุ: ถ้าเป็นโหมด POS เงื่อนไขนี้จะไม่ทำงาน (ประหยัดเซิร์ฟตามที่คุณต้องการ)
            if (activeTab === 'tables' && selectedOrder && brandId && navigator.onLine) {
                clearTableOnCloud(brandId, tableLabel, newToken!, localPayId);
            }

            // 🌟 3. เด้งโชว์ใบเสร็จและรีเซ็ตหน้าจอ
            setCompletedReceipt({
                id: localPayId, created_at: nowIso, total_amount: safePayable,
                received_amount: paiOrderData.received_amount, change_amount: paiOrderData.change_amount, 
                payment_method: paymentMethod, cashier: currentProfile, brand: currentBrand,
                table_label: tableLabel, items: itemsToSave
            });

            setStatusModal({ show: false, type: 'success', title: '', message: '' });
            setReceivedAmount(0);

            if (activeTab === 'pos') {
                setCart([]);
                localStorage.removeItem('pos_cart');
            } 
            else if (activeTab === 'tables' && selectedOrder) {
                setUnpaidOrders(prev => prev.filter(o => o.table_label !== selectedOrder.table_label));
                setAllTables(prev => prev.map(t => 
                    t.label === selectedOrder.table_label 
                        ? { ...t, status: 'available', access_token: newToken }
                        : t
                ));
                setSelectedOrder(null);
            }

        } catch (error) {
            console.error("❌ บันทึกลงเครื่องล้มเหลว:", error);
            setStatusModal({ show: true, type: 'error', title: 'ข้อผิดพลาดในเครื่อง', message: 'ไม่สามารถบันทึกข้อมูลลงเครื่องได้' });
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
        toggleAutoKitchen, 
        unlockAudio, 
        isAudioUnlocked 
    };
}