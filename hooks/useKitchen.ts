// hooks/useKitchen.ts
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { getKitchenOrdersAction, updateOrderStatusAction } from '@/app/actions/kitchenActions';

export function useKitchen() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        const result = await getKitchenOrdersAction();
        if (result.success) setOrders(result.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
        // ระบบ Real-time: ใครสั่งอาหารปุ๊บ เด้งเข้าจอเชฟปั๊บ
        const channel = supabase.channel('kitchen_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchOrders();
            }).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
        // Optimistic Update: ปรับ UI ทันทีไม่ต้องรอกด
        if (nextStatus === 'done') {
            setOrders(prev => prev.filter(o => o.id !== orderId));
        }
        await updateOrderStatusAction(orderId, nextStatus);
        fetchOrders();
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(o => o.status === activeTab && 
            (o.table_label || '').toLowerCase().includes(searchTerm.toLowerCase()));
    }, [orders, activeTab, searchTerm]);

    return {
        orders, filteredOrders, loading, activeTab, setActiveTab,
        searchTerm, setSearchTerm, handleUpdateStatus, fetchOrders
    };
}