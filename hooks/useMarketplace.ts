// hooks/useMarketplace.ts
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase'; // ใช้สำหรับ Storage getPublicUrl (Client Side)
import { getMarketplaceDataAction } from '@/app/actions/marketplaceActions';
import { useRouter } from 'next/navigation';

const BUCKET_NAME = 'theme-images';
const ITEMS_PER_PAGE = 10;

export function useMarketplace() {
    const router = useRouter();
    
    // Data States
    const [categories, setCategories] = useState<any[]>([]);
    const [allThemes, setAllThemes] = useState<any[]>([]);
    const [ownedThemeIds, setOwnedThemeIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter & Pagination States
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [ownershipFilter, setOwnershipFilter] = useState<'ALL' | 'OWNED' | 'NOT_OWNED'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    // Init Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await getMarketplaceDataAction();
            if (res.success) {
                setCategories(res.categories || []);       // ถ้าว่าง ให้ใส่ []
setAllThemes(res.themes || []);           // ถ้าว่าง ให้ใส่ []
setOwnedThemeIds(res.ownedThemeIds || []); // ถ้าว่าง ให้ใส่ []
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // Reset Page on Filter Change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, ownershipFilter]);

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

        // Filter by Category
        if (selectedCategory !== 'ALL') {
            result = result.filter(t => t.category_id === selectedCategory);
        }

        // Filter by Ownership
        if (ownershipFilter === 'OWNED') {
            result = result.filter(t => ownedThemeIds.includes(t.id));
        } else if (ownershipFilter === 'NOT_OWNED') {
            result = result.filter(t => !ownedThemeIds.includes(t.id));
        }

        return result;
    }, [selectedCategory, ownershipFilter, allThemes, ownedThemeIds]);

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
        
        // Pagination info
        currentPage,
        totalPages,
        totalItems: filteredThemes.length,

        // Actions / Setters
        selectedCategory, setSelectedCategory,
        ownershipFilter, setOwnershipFilter,
        changePage,
        getImageUrl,
        goToDetails
    };
}