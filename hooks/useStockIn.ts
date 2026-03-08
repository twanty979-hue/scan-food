// hooks/useStockIn.ts
import { useState, useCallback, useEffect } from 'react';
import { db } from '@/lib/db'; 
import { recordStockBatchAction } from '@/app/actions/stockActions';
import { useGlobalAlert } from '@/components/providers/GlobalAlertProvider';

export function useStockIn(brandId: string | null) {
    const [drafts, setDrafts] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const { showAlert } = useGlobalAlert();

    const loadDrafts = useCallback(async () => {
        const data = await db.stock_drafts.toArray();
        setDrafts(data);
    }, []);

    useEffect(() => { loadDrafts(); }, [loadDrafts]);

    // สแกนเจอแล้วบวกเข้า Dexie ทันที
    const addToDraft = useCallback(async (product: any, qty: number) => {
        const existing = await db.stock_drafts.get(product.id);
        const newQty = existing ? existing.qty + qty : qty;

        if (newQty <= 0) {
            await db.stock_drafts.delete(product.id);
        } else {
            await db.stock_drafts.put({
                id: product.id,
                name: product.name,
                barcode: product.barcode,
                qty: newQty
            });
        }
        await loadDrafts();
    }, [loadDrafts]);

    const removeDraftItem = async (id: string) => {
        await db.stock_drafts.delete(id);
        await loadDrafts();
    };

    const submitToCloud = async (refNo: string, note: string) => {
        if (!brandId || drafts.length === 0) return;
        setIsSaving(true);
        
        const res = await recordStockBatchAction({
            brandId,
            refNo,
            note,
            items: drafts
        });

        if (res.success) {
            await db.stock_drafts.clear();
            setDrafts([]);
            showAlert('success', 'สำเร็จ', 'อัปเดตสต็อกเรียบร้อยแล้ว');
        } else {
            showAlert('error', 'ล้มเหลว', res.error);
        }
        setIsSaving(false);
        return res.success;
    };

    return { drafts, addToDraft, removeDraftItem, submitToCloud, isSaving };
}