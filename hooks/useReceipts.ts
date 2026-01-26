// hooks/useReceipts.ts
import { useState, useEffect } from 'react';
import { getReceiptsAction } from '@/app/actions/receiptActions'; 

// ⚠️ ต้องมีคำว่า export function แบบนี้เท่านั้นนะครับ!
export function useReceipts() {
    const [receipts, setReceipts] = useState<any[]>([]);
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        setLoading(true);
        setErrorMsg(null);
        
        const result = await getReceiptsAction();

        if (result.success) {
            setReceipts(result.data || []);
        } else {
            setErrorMsg(result.error || "เกิดข้อผิดพลาด");
        }
        
        setLoading(false);
    };

    const getFlattenedItems = (receipt: any) => {
        if (!receipt) return [];
        const orders = receipt.orders;
        if (Array.isArray(orders)) {
            return orders.flatMap(o => o.order_items || []);
        }
        return orders?.order_items || [];
    };

    return {
        receipts,
        selectedReceipt,
        setSelectedReceipt,
        loading,
        errorMsg,
        fetchReceipts,
        getFlattenedItems
    };
}