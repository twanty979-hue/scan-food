// hooks/useTables.ts
import { useState, useEffect } from 'react';
import * as actions from '@/app/actions/tableActions';
// ✅ 1. Import ฟังก์ชันเช็คยอด
import { getOrderUsage } from '@/app/actions/limitGuard';

export function useTables() {
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [brandId, setBrandId] = useState<string | null>(null);
    const [qrLogoUrl, setQrLogoUrl] = useState<string | null>(null);
    const [brandSlug, setBrandSlug] = useState<string>('shop');
    const [searchTerm, setSearchTerm] = useState('');
    
    // ✅ 2. เพิ่ม State สำหรับเก็บสถานะโควต้า
    const [limitStatus, setLimitStatus] = useState<any>(null);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const res = await actions.getBrandConfigAction();
        if (res.success) {
            setBrandId(res.brandId!);
            setQrLogoUrl(res.qrLogoUrl!);
            setBrandSlug(res.brandSlug!);
            
            // ✅ 3. ดึงสถานะโควต้ามาเก็บไว้
            if (res.brandId) {
                const status = await getOrderUsage(res.brandId);
                setLimitStatus(status);
            }

            fetchTables(); 
        }
    };

    const fetchTables = async () => { 
        setLoading(true);
        const res = await actions.getTablesAction(); 
        if (res.success) setTables(res.data || []);
        setLoading(false);
    };

    const addTable = async (label: string) => {
        const res = await actions.addTableAction(label); 
        if (res.success) setTables(prev => [...prev, res.data]);
        return res;
    };

    const deleteTable = async (id: string) => {
        if (!confirm('ยืนยันลบโต๊ะนี้?')) return;
        const res = await actions.deleteTableAction(id);
        if (res.success) setTables(prev => prev.filter(t => t.id !== id));
    };

    const refreshToken = async (table: any) => {
        if (!confirm(`รีเซ็ตโต๊ะ ${table.label}?`)) return;
        const res = await actions.refreshTokenAction(table.id);
        if (res.success) {
            setTables(prev => prev.map(t => t.id === table.id ? { ...t, access_token: res.newToken, status: 'available' } : t));
        }
    };

    const filteredTables = tables.filter(t => t.label.toLowerCase().includes(searchTerm.toLowerCase()));

    return {
        tables, filteredTables, loading, brandId, qrLogoUrl, brandSlug,
        searchTerm, setSearchTerm, addTable, deleteTable, refreshToken,
        // ✅ 4. ส่ง limitStatus ออกไปให้หน้า TablesPage ใช้
        limitStatus 
    };
}