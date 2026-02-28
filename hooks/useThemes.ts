// hooks/useThemes.ts
import { useState, useEffect, useMemo } from 'react';
// ลบ import supabase ออก เพราะเราจะดึงรูปจาก Cloudflare โดยตรง
import { getThemesDataAction, applyThemeAction } from '@/app/actions/themeActions';
import { useRouter } from 'next/navigation';

// 🌟 ตัวแปร URL ของ Cloudflare R2
const CDN_BASE_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

export function useThemes() {
    const router = useRouter();

    // Data State
    const [themes, setThemes] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]); 
    const [selectedCategory, setSelectedCategory] = useState('ALL'); 
    
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
            let columns = 2; 

            if (width >= 1280) columns = 5;      
            else if (width >= 1024) columns = 4; 
            else if (width >= 768) columns = 3;  
            else columns = 2;                    

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

    // ✅ Logic กรองข้อมูล
    const filteredThemes = useMemo(() => {
        let result = themes;

        if (selectedCategory !== 'ALL') {
            result = result.filter((t: any) => t.marketplace_themes?.category_id === selectedCategory);
        }

        return result;
    }, [themes, selectedCategory]);

    const handleCategoryChange = (catId: string) => {
        setSelectedCategory(catId);
        setCurrentPage(1);
    };

    // --- Logic: Apply Theme ---
    const handleApplyTheme = async (theme: any) => {
        if (!isOwner) return alert('เฉพาะเจ้าของร้านเท่านั้นที่เปลี่ยนธีมได้');
        
        const mkt = theme.marketplace_themes;
        setApplyingId(theme.id);
        try {
            const res = await applyThemeAction(mkt.slug, mkt.theme_mode);
            if (res.success) {
                setCurrentConfig({ slug: mkt.slug, mode: mkt.theme_mode });
            } else {
                throw new Error(res.error);
            }
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setApplyingId(null);
        }
    };

    // ✅✅ เปลี่ยนการดึงรูปภาพ (บังคับใช้ Cloudflare R2 และดักจับของเก่า)
    const getImageUrl = (fileName: string | null) => {
        if (!fileName || fileName.trim() === '') return '/placeholder.png';

        // 🚨 ดักจับข้อมูลเก่า (ลิงก์ Supabase)
        if (fileName.includes('supabase.co')) {
            const cleanFileName = fileName.split('/').pop(); 
            return `${CDN_BASE_URL}/themes/${cleanFileName}`;
        }

        // ถ้าเป็นลิงก์ภายนอก
        if (fileName.startsWith('http')) return fileName;

        // ถ้าระบุโฟลเดอร์ themes/ มาแล้ว
        if (fileName.startsWith('themes/')) return `${CDN_BASE_URL}/${fileName}`;

        // กรณีทั่วไป (มีแค่ชื่อไฟล์)
        return `${CDN_BASE_URL}/themes/${fileName}`;
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
        categories, selectedCategory, handleCategoryChange
    };
}