import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    restoreOrderItemAction, 
    getKitchenOrdersAction, 
    updateOrderStatusAction, 
    cancelOrderAction,      
    cancelOrderItemAction   
} from '@/app/actions/kitchenActions';

export function useKitchen() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    
    // State สำหรับ Auto Accept
    const [autoAccept, setAutoAccept] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const autoAcceptRef = useRef(autoAccept);

    // ✅ แก้ไข: ฟังก์ชันเล่นเสียงที่รองรับ Browser Policy
    const playSound = () => {
        const audio = new Audio('/sounds/alert.mp3');
        audio.volume = 1.0;
        
        // ใช้ Promise เพื่อดักจับ Error กรณี Browser บล็อก
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Log เงียบๆ หรือแจ้งเตือน UI ว่าต้องกดเปิดเสียง
                console.warn("Audio playback failed (User interaction required):", error);
            });
        }
    };

    // ✅ เพิ่มใหม่: ฟังก์ชันสำหรับปุ่ม "ทดสอบเสียง/เริ่มงาน" เพื่อปลดล็อก Audio Context
    const unlockAudio = () => {
        const audio = new Audio('/sounds/alert.mp3');
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(() => {});
    };

    // --- Init & Auto Accept Logic ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kitchen_auto_accept');
            if (saved === 'true') {
                setAutoAccept(true);
                autoAcceptRef.current = true;
            }
            setIsInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (!isInitialized) return;
        autoAcceptRef.current = autoAccept;
        if (typeof window !== 'undefined') {
            localStorage.setItem('kitchen_auto_accept', String(autoAccept));
        }
    }, [autoAccept, isInitialized]);

    const fetchOrders = async () => {
        const result = await getKitchenOrdersAction();
        if (result.success) setOrders(result.data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
        const channel = supabase.channel('kitchen_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async (payload) => {
                // Logic Auto Accept
                if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
                    // ถ้าเปิด Auto Accept ให้รับออเดอร์ทันที
                    if (autoAcceptRef.current) {
                        playSound(); // พยายามเล่นเสียง
                        await updateOrderStatusAction(payload.new.id, 'preparing');
                        console.log(`🤖 Auto Accepted Order: ${payload.new.id}`);
                    } else {
                        // ถ้าไม่ได้เปิด Auto Accept ก็เล่นเสียงแจ้งเตือนเฉยๆ (ถ้า Browser อนุญาต)
                        playSound();
                    }
                }
                fetchOrders();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    // --- Handlers ---
    const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
        // Optimistic Update: อัปเดต UI ทันที
        if (nextStatus === 'done') {
            setOrders(prev => prev.filter(o => o.id !== orderId));
        } else {
             setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
        }

        await updateOrderStatusAction(orderId, nextStatus);
        fetchOrders(); // ดึงข้อมูลจริงอีกครั้งเพื่อความชัวร์
    };

    // ยกเลิกทั้งออเดอร์
    const handleCancelOrder = async (orderId: string) => {
        if (!confirm("ต้องการยกเลิกออเดอร์นี้ทั้งหมดใช่หรือไม่?")) return;
        
        // Optimistic UI Update
        setOrders(prev => prev.filter(o => o.id !== orderId));
        
        await cancelOrderAction(orderId);
        fetchOrders();
    };

    // ยกเลิกรายการอาหาร
    const handleCancelItem = async (orderId: string, itemId: string) => {
        if (!confirm("ต้องการยกเลิกรายการสินค้านี้ใช่หรือไม่?")) return;
        
        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                return {
                    ...o,
                    order_items: o.order_items.map((i: any) => 
                        i.id === itemId ? { ...i, status: 'cancelled' } : i
                    )
                };
            }
            return o;
        }));

        await cancelOrderItemAction(itemId);
    };

    // กู้คืนรายการ
    const handleRestoreItem = async (orderId: string, itemId: string) => {
        if (!confirm("ต้องการกู้คืนรายการนี้ใช่หรือไม่?")) return;

        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                return {
                    ...o,
                    order_items: o.order_items.map((i: any) => 
                        i.id === itemId ? { ...i, status: 'active' } : i
                    )
                };
            }
            return o;
        }));

        await restoreOrderItemAction(itemId);
    };

    // ✅ Filter Orders
    const filteredOrders = useMemo(() => {
        return (orders || []).filter(o => {
            // กรองตาม Tab สถานะ
            const statusMatch = o.status === activeTab;
            
            // กรองตามคำค้นหา (เบอร์โต๊ะ)
            const tableLabel = o.table_label || '';
            const searchMatch = tableLabel.toLowerCase().includes(searchTerm.toLowerCase());
            
            return statusMatch && searchMatch;
        });
    }, [orders, activeTab, searchTerm]);

    return {
        orders,
        filteredOrders,
        loading, 
        activeTab, setActiveTab,
        searchTerm, setSearchTerm, 
        handleUpdateStatus, fetchOrders,
        autoAccept, setAutoAccept,
        handleCancelOrder,
        handleCancelItem,
        handleRestoreItem,
        unlockAudio // ✅ ส่ง function นี้ออกไปให้ปุ่มกดใช้
    };
}