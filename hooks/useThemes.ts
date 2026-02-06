// hooks/useThemes.ts
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase'; 
import { getThemesDataAction, applyThemeAction } from '@/app/actions/themeActions';
import { useRouter } from 'next/navigation';

const BUCKET_NAME = 'theme-images';

export function useThemes() {
    const router = useRouter();

    // Data State
    const [themes, setThemes] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]); 
    const [selectedCategory, setSelectedCategory] = useState('ALL'); 
    
    // ✅ เพิ่ม State สำหรับกรอง Lifetime
    const [filterLifetime, setFilterLifetime] = useState(false);

    const [loading, setLoading] = useState(true);
    const [brandId, setBrandId] = useState<string | null>(null);
    const [currentConfig, setCurrentConfig] = useState<{slug: string, mode: string} | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    
    // UI State
    const [applyingId, setApplyingId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);

    // --- Responsive Items Logic ---
    useEffect(() => {
        const calculateItemsPerPage = () => {
            const width = window.innerWidth;
            let columns = 1;
            if (width >= 1280) columns = 5;      
            else if (width >= 1024) columns = 4; 
            else if (width >= 768) columns = 3;  
            else if (width >= 640) columns = 2;  
            else columns = 1;
            setItemsPerPage(columns * 3);
        };
        calculateItemsPerPage();
        window.addEventListener('resize', calculateItemsPerPage);
        return () => window.removeEventListener('resize', calculateItemsPerPage);
    }, []);

    // --- Init Data ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await getThemesDataAction();
            if (res.success) {
                setThemes(res.themes || []);
                setCategories(res.categories || []); 
                setCurrentConfig(res.currentConfig || null); 
                setBrandId(res.brandId || '');        
                setIsOwner(res.isOwner || false);      
            } else {
                if (res.error === "Unauthorized") router.replace('/login');
            }
            setLoading(false);
        };
        fetchData();
    }, [router]);

    // ✅ Logic กรองข้อมูล (เพิ่ม Lifetime Filter)
    const filteredThemes = useMemo(() => {
        let result = themes;

        // 1. กรอง Category
        if (selectedCategory !== 'ALL') {
            result = result.filter((t: any) => t.marketplace_themes?.category_id === selectedCategory);
        }

        // 2. กรอง Lifetime (ถ้าเปิด)
        if (filterLifetime) {
            result = result.filter((t: any) => t.purchase_type === 'lifetime');
        }

        return result;
    }, [themes, selectedCategory, filterLifetime]); // เพิ่ม dependency

    // ✅ ฟังก์ชันเปิด/ปิด Lifetime
    const toggleLifetimeFilter = () => {
        setFilterLifetime(prev => !prev);
        setCurrentPage(1); // รีเซ็ตหน้าเมื่อกรอง
    };

    const handleCategoryChange = (catId: string) => {
        setSelectedCategory(catId);
        setCurrentPage(1);
    };

    // --- Logic: Apply Theme ---
   const handleApplyTheme = async (theme: any) => {
        if (!isOwner) return alert('เฉพาะเจ้าของร้านเท่านั้นที่เปลี่ยนธีมได้');
        
        // ❌ ลบส่วนนี้ออกครับ
        // const mkt = theme.marketplace_themes;
        // const confirmChange = confirm(`ยืนยันการใช้ธีม...`);
        // if (!confirmChange) return;
        
        // ✅ เหลือไว้แค่นี้ (Logic การยิง API ล้วนๆ)
        const mkt = theme.marketplace_themes;
        setApplyingId(theme.id);
        try {
            const res = await applyThemeAction(mkt.slug, mkt.theme_mode);
            if (res.success) {
                setCurrentConfig({ slug: mkt.slug, mode: mkt.theme_mode });
                // alert('เปิดใช้งานธีมสำเร็จ!'); // จะลบ alert นี้ออกด้วยก็ได้ถ้าอยากให้ Modal ปิดเองเงียบๆ
            } else {
                throw new Error(res.error);
            }
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setApplyingId(null);
        }
    };

    // --- Helpers ---
    const getImageUrl = (fileName: string | null) => {
        if (!fileName) return null;
        const filePath = fileName.startsWith('themes/') ? fileName : `themes/${fileName}`;
        return supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;
    };

    // --- Pagination ---
    const totalPages = Math.ceil(filteredThemes.length / Math.max(1, itemsPerPage));
    const currentThemes = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredThemes.slice(start, start + itemsPerPage); 
    }, [currentPage, filteredThemes, itemsPerPage]); 
    
    const changePage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return {
        themes, loading, brandId, currentConfig, isOwner,
        applyingId, currentThemes, currentPage, totalPages,
        changePage, handleApplyTheme, getImageUrl,
        categories, selectedCategory, handleCategoryChange,
        filterLifetime, toggleLifetimeFilter // ✅ ส่งค่าใหม่ออกไป
    };
}