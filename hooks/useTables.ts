import { useState, useEffect } from 'react';
import * as actions from '@/app/actions/tableActions';
import { getOrderUsage } from '@/app/actions/limitGuard';
// ✅ 1. Import ตัว Hook มาใช้
import { useGlobalAlert } from '@/components/providers/GlobalAlertProvider';

export function useTables() {
    // ✅ 2. ดึงฟังก์ชัน showAlert และ showConfirm ออกมา
    const { showAlert, showConfirm } = useGlobalAlert();

    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [brandId, setBrandId] = useState<string | null>(null);
    const [qrLogoUrl, setQrLogoUrl] = useState<string | null>(null);
    const [brandSlug, setBrandSlug] = useState<string>('shop');
    const [searchTerm, setSearchTerm] = useState('');
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
        if (res.success) {
            setTables(prev => [...prev, res.data]);
            showAlert('success', 'เพิ่มโต๊ะสำเร็จ', `โต๊ะ "${label}" พร้อมใช้งานแล้ว`);
        } else {
            showAlert('error', 'เพิ่มไม่สำเร็จ', res.error || 'เกิดข้อผิดพลาด');
        }
        return res;
    };

    const deleteTable = async (id: string) => {
        const table = tables.find(t => t.id === id);

        // ✅ 3. ใช้ showConfirm แบบ 'error' เพื่อโชว์ถังขยะแดง
        const isConfirmed = await showConfirm(
            'ยืนยันลบโต๊ะ?',
            `คุณแน่ใจหรือไม่ที่จะลบ "${table?.label || 'โต๊ะนี้'}"?\nQR Code เดิมของโต๊ะนี้จะใช้งานไม่ได้ทันที!`,
            'ลบทิ้ง',
            'ยกเลิก',
            'error' // 🔥 จัดไปถังขยะแดง!
        );

        if (!isConfirmed) return;

        const res = await actions.deleteTableAction(id);
        if (res.success) {
            setTables(prev => prev.filter(t => t.id !== id));
            showAlert('success', 'ลบโต๊ะเรียบร้อย', 'ข้อมูลโต๊ะถูกนำออกจากระบบแล้ว');
        } else {
            showAlert('error', 'ลบไม่สำเร็จ', res.error);
        }
    };

    const refreshToken = async (table: any) => {
        // ✅ 4. ใช้ showConfirm สำหรับการแจ้งเตือนทั่วไป
        const isConfirmed = await showConfirm(
            'รีเซ็ตโต๊ะ?',
            `คุณต้องการรีเซ็ตสถานะและสร้าง QR ใหม่สำหรับ "${table.label}" ใช่หรือไม่?\n(ลูกค้าที่สแกนค้างอยู่จะหลุดจากระบบทันที)`,
            'ยืนยันรีเซ็ต',
            'ยกเลิก'
        );

        if (!isConfirmed) return;

        const res = await actions.refreshTokenAction(table.id);
        if (res.success) {
            setTables(prev => prev.map(t => t.id === table.id ? { ...t, access_token: res.newToken, status: 'available' } : t));
            showAlert('success', 'รีเซ็ตสำเร็จ', 'สร้าง Token ใหม่และล้างสถานะโต๊ะเรียบร้อย');
        } else {
            showAlert('error', 'รีเซ็ตไม่สำเร็จ', res.error);
        }
    };

    const filteredTables = tables.filter(t => t.label.toLowerCase().includes(searchTerm.toLowerCase()));

    return {
        tables, filteredTables, loading, brandId, qrLogoUrl, brandSlug,
        searchTerm, setSearchTerm, addTable, deleteTable, refreshToken,
        limitStatus 
    };
}