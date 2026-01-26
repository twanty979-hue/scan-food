// hooks/useCategories.ts
import { useState, useEffect, useMemo } from 'react';
import { 
    getCategoriesAction, 
    upsertCategoryAction, 
    deleteCategoryAction, 
    toggleCategoryStatusAction 
} from '@/app/actions/categoryActions';

export type Category = {
    id: string;
    name: string;
    is_active: boolean;
    sort_order: number;
};

export function useCategories() {
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
        if (!formData.name.trim()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                id: editId,
                name: formData.name,
                sort_order: formData.sort_order
            };

            const res = await upsertCategoryAction(payload);
            
            if (!res.success) throw new Error(res.error);

            await fetchCategories(); // Refresh data
            setIsModalOpen(false);

        } catch (error: any) {
            alert('บันทึกไม่สำเร็จ: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ยืนยันลบหมวดหมู่นี้? เมนูอาหารข้างในจะหายไปด้วยนะ!')) return;
        
        // Optimistic Update (ลบจากหน้าจอก่อน เพื่อความลื่น)
        const originalData = [...categories];
        setCategories(prev => prev.filter(c => c.id !== id));

        const res = await deleteCategoryAction(id);
        if (!res.success) {
            alert('ลบไม่สำเร็จ: ' + res.error);
            setCategories(originalData); // ย้อนค่าคืนถ้าพัง
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        // Optimistic Update
        const originalData = [...categories];
        setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));

        const res = await toggleCategoryStatusAction(id, !currentStatus);
        if (!res.success) {
            alert('แก้ไขสถานะไม่สำเร็จ');
            setCategories(originalData); // ย้อนค่าคืน
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