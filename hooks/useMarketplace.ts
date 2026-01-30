// hooks/useMarketplace.ts
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { getMarketplaceDataAction } from '@/app/actions/marketplaceActions';
import { useRouter } from 'next/navigation';

const BUCKET_NAME = 'theme-images';
const ITEMS_PER_PAGE = 10;

export function useMarketplace() {
    const router = useRouter();
    const [currentPlan, setCurrentPlan] = useState('free');
    
    // Data States
    const [categories, setCategories] = useState<any[]>([]);
    const [allThemes, setAllThemes] = useState<any[]>([]);
    const [ownedThemeIds, setOwnedThemeIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter & Pagination States
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [ownershipFilter, setOwnershipFilter] = useState<'ALL' | 'OWNED' | 'NOT_OWNED'>('ALL');
    const [tierFilter, setTierFilter] = useState('ALL'); // ✅ เพิ่ม State กรอง Level
    const [currentPage, setCurrentPage] = useState(1);

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
    }, [selectedCategory, ownershipFilter, tierFilter]); // ✅ เพิ่ม tierFilter ใน dependency

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
            result = result.filter(t => (t.min_plan || 'free') === tierFilter);
        }

        return result;
    }, [selectedCategory, ownershipFilter, tierFilter, allThemes, ownedThemeIds]);

    const totalPages = Math.ceil(filteredThemes.length / ITEMS_PER_PAGE);

    const currentThemes = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredThemes.slice(start, start + ITEMS_PER_PAGE);
    }, [currentPage, filteredThemes]);

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

        // Actions / Setters
        selectedCategory, setSelectedCategory,
        ownershipFilter, setOwnershipFilter,
        tierFilter, setTierFilter, // ✅ ส่งออกไปใช้หน้า UI
        changePage,
        getImageUrl,
        goToDetails
    };
}