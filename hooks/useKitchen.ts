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
    
    // State เช็คว่าเสียงพร้อมใช้งานหรือยัง (เริ่มมาเป็น false)
    const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
    
    const autoAcceptRef = useRef(autoAccept);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // ✅ สร้าง Audio Object รอไว้
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio('/sounds/alert.mp3');
        }
    }, []);

    // ✅ ฟังก์ชันเล่นเสียง (ใช้แจ้งเตือนเมื่อมีออเดอร์)
    const playSound = () => {
        if (!audioRef.current) return;
        const audio = audioRef.current;
        audio.volume = 1.0;
        audio.currentTime = 0;
        audio.play().catch(err => console.warn("Audio blocked:", err));
    };

    // ✅ ฟังก์ชันปลดล็อกเสียง (ใช้ผูกกับปุ่มใน Modal เริ่มงาน)
    const unlockAudio = () => {
        if (!audioRef.current) return;
        const audio = audioRef.current;
        
        // เล่นเสียงเงียบๆ 1 ที เพื่อหลอก Browser ว่า User อนุญาตแล้ว
        audio.volume = 0.0; 
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1.0; // คืนค่าความดัง
            setIsAudioUnlocked(true); // ✅ จำค่าว่าปลดล็อกแล้ว
        }).catch(err => {
            console.error("Unlock failed:", err);
        });
    };

    // ✅ Toggle Auto Accept (แค่เปลี่ยนค่า ไม่ต้องยุ่งเรื่องเสียงแล้ว)
    const toggleAutoAccept = () => {
        setAutoAccept(prev => !prev);
    };

    // --- Init & LocalStorage ---
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

    // --- Realtime Logic ---
    const fetchOrders = async () => {
        const result = await getKitchenOrdersAction();
        if (result.success) setOrders(result.data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
        const channel = supabase.channel('kitchen_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async (payload) => {
                if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
                    // เล่นเสียงแจ้งเตือนเสมอ (ถ้าปลดล็อกแล้ว)
                    playSound();

                    // Logic Auto Accept
                    if (autoAcceptRef.current) {
                        await updateOrderStatusAction(payload.new.id, 'preparing');
                        console.log(`🤖 Auto Accepted Order: ${payload.new.id}`);
                    }
                }
                fetchOrders();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    // --- Handlers (ส่วนเดิม ไม่ตัดออก) ---
    const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
        if (nextStatus === 'done') {
            setOrders(prev => prev.filter(o => o.id !== orderId));
        } else {
             setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
        }
        await updateOrderStatusAction(orderId, nextStatus);
        fetchOrders();
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm("ต้องการยกเลิกออเดอร์นี้ทั้งหมดใช่หรือไม่?")) return;
        setOrders(prev => prev.filter(o => o.id !== orderId));
        await cancelOrderAction(orderId);
        fetchOrders();
    };

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

    const filteredOrders = useMemo(() => {
        return (orders || []).filter(o => {
            const statusMatch = o.status === activeTab;
            const tableLabel = o.table_label || '';
            const searchMatch = tableLabel.toLowerCase().includes(searchTerm.toLowerCase());
            return statusMatch && searchMatch;
        });
    }, [orders, activeTab, searchTerm]);

    return {
        orders, filteredOrders, loading, 
        activeTab, setActiveTab,
        searchTerm, setSearchTerm, 
        handleUpdateStatus, fetchOrders,
        autoAccept, toggleAutoAccept,
        handleCancelOrder, handleCancelItem, handleRestoreItem,
        unlockAudio, // ✅ ส่งฟังก์ชันปลดล็อกออกไป
        isAudioUnlocked // ✅ ส่งสถานะออกไป
    };
}