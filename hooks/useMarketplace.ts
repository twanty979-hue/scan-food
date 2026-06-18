// hooks/useMarketplace.ts
import { useState, useEffect, useMemo } from 'react';
// ลบ import supabase ออกไปเลย เพราะเราไม่ใช้มันดึงรูปแล้ว!
import { getMarketplaceDataAction } from '@/app/actions/marketplaceActions';
import { useRouter } from 'next/navigation';

// 🌟 ตัวแปร URL ของ Cloudflare R2
const CDN_BASE_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

export function useMarketplace() {
    const router = useRouter();
    const [currentPlan, setCurrentPlan] = useState('free');
    
    // Data States
    const [categories, setCategories] = useState<any[]>([]);
    const [allThemes, setAllThemes] = useState<any[]>([]);
    const [ownedThemeIds, setOwnedThemeIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [coins, setCoins] = useState<number>(0);

    // Filter States
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [ownershipFilter, setOwnershipFilter] = useState<'ALL' | 'OWNED' | 'NOT_OWNED'>('ALL');
    const [tierFilter, setTierFilter] = useState('ALL');
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    // --- Responsive Items Logic ---
    useEffect(() => {
        const calculateItemsPerPage = () => {
            const width = window.innerWidth;
            let columns = 2; // เริ่มต้นที่ 2 คอลัมน์สำหรับมือถือ

            if (width >= 1280) columns = 6;       // จอใหญ่มาก
            else if (width >= 1024) columns = 4;  // จอคอม
            else if (width >= 768) columns = 3;   // ไอแพดแนวนอน
            else columns = 2;                     // มือถือและไอแพดแนวตั้ง

            setItemsPerPage(columns * 3); // จำนวนคอลัมน์ x 3 แถว
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
                if (res.coins !== undefined) setCoins(res.coins);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // Reset Page on Filter Change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, ownershipFilter, tierFilter]);

    // ✅✅ 1. แก้ไข Logic การดึงรูปภาพ (บังคับใช้ Cloudflare R2)
    const getImageUrl = (fileName: string | null) => {
        if (!fileName || fileName.trim() === '') return '/placeholder.png';

        // 🚨 ดักจับกรณีข้อมูลเก่าเป็น URL ของ Supabase
        if (fileName.includes('supabase.co')) {
            const cleanFileName = fileName.split('/').pop(); 
            return `${CDN_BASE_URL}/themes/${cleanFileName}`;
        }

        // ถ้าเป็นลิงก์เว็บภายนอก (ที่ไม่ใช่ Supabase) ให้ใช้ลิงก์เดิม
        if (fileName.startsWith('http')) return fileName;

        // ถ้าระบุโฟลเดอร์ themes/ มาแล้ว
        if (fileName.startsWith('themes/')) return `${CDN_BASE_URL}/${fileName}`;

        // กรณีทั่วไป: ชื่อไฟล์เพียวๆ
        return `${CDN_BASE_URL}/themes/${fileName}`;
    };

    const goToDetails = (themeId: string) => {
        router.push(`/dashboard/marketplace/${themeId}`);
    };

    const tierCounts = useMemo(() => {
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

        if (selectedCategory !== 'ALL') {
            result = result.filter(t => t.category_id === selectedCategory);
        }

        if (ownershipFilter === 'OWNED') {
            result = result.filter(t => ownedThemeIds.includes(t.id));
        } else if (ownershipFilter === 'NOT_OWNED') {
            result = result.filter(t => !ownedThemeIds.includes(t.id));
        }

        if (tierFilter !== 'ALL') {
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
        categories,
        currentThemes,
        ownedThemeIds,
        loading,
        coins,
        currentPlan, 
        currentPage,
        totalPages,
        totalItems: filteredThemes.length,
        tierCounts,
        selectedCategory, setSelectedCategory,
        ownershipFilter, setOwnershipFilter,
        tierFilter, setTierFilter,
        changePage,
        getImageUrl, // ส่งฟังก์ชันที่อัปเกรดแล้วออกไป
        goToDetails
    };
}