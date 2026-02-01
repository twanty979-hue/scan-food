// hooks/useMarketplace.ts
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { getMarketplaceDataAction } from '@/app/actions/marketplaceActions';
import { useRouter } from 'next/navigation';

const BUCKET_NAME = 'theme-images';

export function useMarketplace() {
    const router = useRouter();
    const [currentPlan, setCurrentPlan] = useState('free');
    
    // Data States
    const [categories, setCategories] = useState<any[]>([]);
    const [allThemes, setAllThemes] = useState<any[]>([]);
    const [ownedThemeIds, setOwnedThemeIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [ownershipFilter, setOwnershipFilter] = useState<'ALL' | 'OWNED' | 'NOT_OWNED'>('ALL');
    
    // ✅ State กรอง Level (เริ่มต้นเป็น ALL)
    const [tierFilter, setTierFilter] = useState('ALL');
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    // --- Responsive Items Logic ---
    useEffect(() => {
        const calculateItemsPerPage = () => {
            const width = window.innerWidth;
            let columns = 1;
            if (width >= 1280) columns = 6;       
            else if (width >= 1024) columns = 4;  
            else if (width >= 768) columns = 3;   
            else if (width >= 640) columns = 2;   
            else columns = 1;
            setItemsPerPage(columns * 4);
        };
        calculateItemsPerPage();
        window.addEventListener('resize', calculateItemsPerPage);
        return () => window.removeEventListener('resize', calculateItemsPerPage);
    }, []);

    // Init Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await getMarketplaceDataAction();
            if (res.success) {
                setCategories(res.categories || []);
                setAllThemes(res.themes || []);
                setOwnedThemeIds(res.ownedThemeIds || []);
                setCurrentPlan((res as any).currentPlan || 'free');
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // Reset Page on Filter Change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, ownershipFilter, tierFilter]);

    // --- Logic ---
    const getImageUrl = (fileName: string | null) => {
        if (!fileName || fileName.trim() === '') return '/placeholder.png';
        if (fileName.startsWith('http')) return fileName;
        const filePath = fileName.startsWith('themes/') ? fileName : `themes/${fileName}`;
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        return data.publicUrl;
    };

    const goToDetails = (themeId: string) => {
        router.push(`/dashboard/marketplace/${themeId}`);
    };

    // ✅✅ 1. คำนวณจำนวนธีมในแต่ละ Tier (เพื่อนับเลขโชว์ที่ปุ่ม)
    const tierCounts = useMemo(() => {
        // นับจาก allThemes (หรือจะนับจากหมวดหมู่ที่เลือกก็ได้ ถ้าอยากให้สัมพันธ์กัน)
        // ในที่นี้ผมนับจาก "หมวดหมู่ที่เลือกอยู่" เพื่อความแม่นยำครับ
        const source = selectedCategory === 'ALL' 
            ? allThemes 
            : allThemes.filter(t => t.category_id === selectedCategory);

        const counts = { ALL: source.length, FREE: 0, BASIC: 0, PRO: 0, ULTIMATE: 0 };

        source.forEach(t => {
            const plan = (t.min_plan || 'free').toUpperCase();
            if (plan === 'FREE') counts.FREE++;
            else if (plan === 'BASIC') counts.BASIC++;
            else if (plan === 'PRO') counts.PRO++;
            else if (plan === 'ULTIMATE') counts.ULTIMATE++;
        });

        return counts;
    }, [allThemes, selectedCategory]);

    const filteredThemes = useMemo(() => {
        let result = allThemes;

        // 1. Filter by Category
        if (selectedCategory !== 'ALL') {
            result = result.filter(t => t.category_id === selectedCategory);
        }

        // 2. Filter by Ownership
        if (ownershipFilter === 'OWNED') {
            result = result.filter(t => ownedThemeIds.includes(t.id));
        } else if (ownershipFilter === 'NOT_OWNED') {
            result = result.filter(t => !ownedThemeIds.includes(t.id));
        }

        // 3. ✅ Filter by Tier (Level)
        if (tierFilter !== 'ALL') {
            // เทียบค่า min_plan (แปลงเป็น lowerCase ให้ชัวร์)
            result = result.filter(t => (t.min_plan || 'free').toLowerCase() === tierFilter.toLowerCase());
        }

        return result;
    }, [selectedCategory, ownershipFilter, tierFilter, allThemes, ownedThemeIds]);

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
        // Data
        categories,
        currentThemes,
        ownedThemeIds,
        loading,
        currentPlan, 
        
        // Pagination info
        currentPage,
        totalPages,
        totalItems: filteredThemes.length,
        tierCounts, // ✅ ส่งค่าจำนวนนับออกไป

        // Actions / Setters
        selectedCategory, setSelectedCategory,
        ownershipFilter, setOwnershipFilter,
        tierFilter, setTierFilter,
        changePage,
        getImageUrl,
        goToDetails
    };
}