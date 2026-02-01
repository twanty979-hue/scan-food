import { useState } from 'react';
import { getReceiptsAction } from '@/app/actions/receiptActions'; 

export function useReceipts() {
    const [receipts, setReceipts] = useState<any[]>([]);
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    // State สำหรับ Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // ฟังก์ชันดึงข้อมูล (รับ Date Range มาจากหน้าเว็บ)
    const fetchReceipts = async (startDate: string, endDate: string, isLoadMore: boolean = false) => {
        if (loading) return; // กันกดรัว
        setLoading(true);
        setErrorMsg(null);
        
        const currentPage = isLoadMore ? page + 1 : 1; // ถ้าโหลดเพิ่ม page+1, ถ้าเปลี่ยนวัน page=1

        const result = await getReceiptsAction(startDate, endDate, currentPage);

        if (result.success) {
            if (isLoadMore) {
                // ถ้าโหลดเพิ่ม ให้เอาของเก่า + ของใหม่
                setReceipts(prev => [...prev, ...(result.data || [])]);
            } else {
                // ถ้าเปลี่ยนวัน ให้ทับของเดิมเลย
                setReceipts(result.data || []);
            }
            
            setPage(currentPage);
            setHasMore(result.hasMore || false);
        } else {
            setErrorMsg(result.error || "เกิดข้อผิดพลาด");
        }
        
        setLoading(false);
    };

    const getFlattenedItems = (receipt: any) => {
        if (!receipt) return [];
        const orders = receipt.orders;
        // รองรับโครงสร้างทั้งแบบเก่าและแบบใหม่
        return orders.order_items || (Array.isArray(orders) ? orders.flatMap(o => o.order_items || []) : []);
    };

    return {
        receipts,
        selectedReceipt,
        setSelectedReceipt,
        loading,
        errorMsg,
        fetchReceipts,
        getFlattenedItems,
        hasMore // ส่งสถานะไปบอกหน้าเว็บว่ายังมีข้อมูลเหลือไหม
    };
}