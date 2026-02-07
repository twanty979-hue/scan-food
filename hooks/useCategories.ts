import { useState, useEffect, useMemo } from 'react';
import { 
    getCategoriesAction, 
    upsertCategoryAction, 
    deleteCategoryAction, 
    toggleCategoryStatusAction 
} from '@/app/actions/categoryActions';
// ✅ 1. Import ตัว Hook มาใช้
import { useGlobalAlert } from '@/components/providers/GlobalAlertProvider';

export type Category = {
    id: string;
    name: string;
    is_active: boolean;
    sort_order: number;
};

export function useCategories() {
    // ✅ 2. ดึงฟังก์ชัน showAlert และ showConfirm ออกมา
    const { showAlert, showConfirm } = useGlobalAlert();

    // Data States
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', sort_order: 0 });

    // Init Data
    const fetchCategories = async () => {
        setLoading(true);
        const res = await getCategoriesAction();
        if (res.success) {
            setCategories(res.data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // --- Actions Handlers ---

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showAlert('warning', 'ข้อมูลไม่ครบ', 'กรุณาระบุชื่อหมวดหมู่');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                id: editId,
                name: formData.name,
                sort_order: formData.sort_order
            };

            const res = await upsertCategoryAction(payload);
            
            if (!res.success) throw new Error(res.error);

            await fetchCategories(); 
            setIsModalOpen(false);
            
            // ✅ 3. แจ้งเตือนเมื่อบันทึกสำเร็จ
            showAlert('success', 'บันทึกสำเร็จ', `หมวดหมู่ "${formData.name}" ถูกจัดเก็บเรียบร้อยแล้ว`);

        } catch (error: any) {
            // ✅ 4. แจ้งเตือนเมื่อบันทึกพลาด
            showAlert('error', 'บันทึกไม่สำเร็จ', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        const cat = categories.find(c => c.id === id);

        // ✅ 5. ใช้ showConfirm พร้อม type 'error' เพื่อโชว์ไอคอนถังขยะ
        const isConfirmed = await showConfirm(
            'ยืนยันการลบหมวดหมู่?',
            `คุณแน่ใจไหมที่จะลบ "${cat?.name}"?\n**คำเตือน:** เมนูอาหารในหมวดหมู่นี้จะหายไปด้วย!`,
            'ลบทิ้ง',
            'ยกเลิก',
            'error' // 🔥 ส่งค่า 'error' เข้าไปเพื่อให้ไอคอนเป็นถังขยะสีแดง
        );
        
        if (!isConfirmed) return;
        
        const originalData = [...categories];
        setCategories(prev => prev.filter(c => c.id !== id));

        const res = await deleteCategoryAction(id);
        if (!res.success) {
            showAlert('error', 'ลบไม่สำเร็จ', res.error || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            setCategories(originalData); 
        } else {
            showAlert('success', 'ลบเรียบร้อย', 'ข้อมูลหมวดหมู่ถูกนำออกจากระบบแล้ว');
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const originalData = [...categories];
        setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));

        const res = await toggleCategoryStatusAction(id, !currentStatus);
        if (!res.success) {
            showAlert('error', 'ผิดพลาด', 'ไม่สามารถเปลี่ยนสถานะได้ในขณะนี้');
            setCategories(originalData); 
        }
    };

    // --- Helper Functions ---

    const openAddModal = () => {
        setEditId(null);
        setFormData({ name: '', sort_order: categories.length + 1 });
        setIsModalOpen(true);
    };

    const openEditModal = (cat: Category) => {
        setEditId(cat.id);
        setFormData({ name: cat.name, sort_order: cat.sort_order });
        setIsModalOpen(true);
    };

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const filteredCategories = useMemo(() => {
        return categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [categories, searchTerm]);

    return {
        categories, filteredCategories, loading, 
        searchTerm, setSearchTerm,
        isModalOpen, setIsModalOpen, isSubmitting, editId,
        formData, updateFormData,
        openAddModal, openEditModal, handleSave, handleDelete, handleToggle
    };
}