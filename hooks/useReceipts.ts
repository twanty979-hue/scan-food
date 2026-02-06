import { useState } from 'react';
import { getReceiptsAction } from '@/app/actions/receiptActions'; 

export function useReceipts() {
    const [receipts, setReceipts] = useState<any[]>([]);
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchReceipts = async (startDate: string, endDate: string, isLoadMore: boolean = false) => {
        if (loading) return; 
        setLoading(true);
        setErrorMsg(null);
        
        const currentPage = isLoadMore ? page + 1 : 1;

        const result = await getReceiptsAction(startDate, endDate, currentPage);

        if (result.success) {
            if (isLoadMore) {
                setReceipts(prev => [...prev, ...(result.data || [])]);
            } else {
                setReceipts(result.data || []);
            }
            setPage(currentPage);
            setHasMore(result.hasMore || false);
        } else {
            setErrorMsg(result.error || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
        
        setLoading(false);
    };

    // ✅✅✅ แก้ตรงนี้ครับ: ให้รองรับทั้งแบบ Paid และ Cancelled
    const getFlattenedItems = (receipt: any) => {
        if (!receipt) return [];

        // 1. ถ้ามี items อยู่ที่ชั้นนอกสุด (กรณี Cancelled หรือแบบใหม่ที่ map มาแล้ว) ให้ใช้เลย
        if (receipt.items && Array.isArray(receipt.items) && receipt.items.length > 0) {
            return receipt.items;
        }
        
        // 2. ถ้าไม่มี ให้มุดไปหาใน orders (กรณี Paid แบบเดิม)
        const orders = receipt.orders;
        if (!orders) return [];
        
        if (Array.isArray(orders)) {
            return orders.flatMap(o => o.order_items || []);
        }
        
        return orders.order_items || [];
    };

    return {
        receipts,
        selectedReceipt,
        setSelectedReceipt,
        loading,
        errorMsg,
        fetchReceipts,
        getFlattenedItems,
        hasMore
    };
}