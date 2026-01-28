// hooks/useThemes.ts
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase'; // Client for Storage
import { getThemesDataAction, applyThemeAction } from '@/app/actions/themeActions';
import { useRouter } from 'next/navigation';

const BUCKET_NAME = 'theme-images';
const ITEMS_PER_PAGE = 10;

export function useThemes() {
    const router = useRouter();

    // Data State
    const [themes, setThemes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [brandId, setBrandId] = useState<string | null>(null);
    const [currentConfig, setCurrentConfig] = useState<{slug: string, mode: string} | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    
    // UI State
    const [applyingId, setApplyingId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // --- Init ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await getThemesDataAction();
            
            if (res.success) {
    setThemes(res.themes || []);           // ถ้าไม่มีธีม ให้ส่งอาร์เรย์เปล่า
    setCurrentConfig(res.currentConfig || null); // ถ้าไม่มี Config ให้ส่ง null
    setBrandId(res.brandId || '');         // ถ้าไม่มี BrandId ให้ส่งสตริงว่าง
    setIsOwner(res.isOwner || false);      // ถ้าไม่รู้สิทธิ์ ให้ถือว่าไม่ใช่เจ้าของ
} else {
                // Handle auth error (optional)
                if (res.error === "Unauthorized") router.replace('/login');
            }
            setLoading(false);
        };
        fetchData();
    }, [router]);

    // --- Logic: Apply Theme ---
    const handleApplyTheme = async (theme: any) => {
        if (!isOwner) return alert('เฉพาะเจ้าของร้านเท่านั้นที่เปลี่ยนธีมได้');
        
        const mkt = theme.marketplace_themes;
        const confirmChange = confirm(`ยืนยันการใช้ธีม "${mkt.name}"?\n- URL: /${mkt.slug}\n- Mode: ${mkt.theme_mode}`);
        if (!confirmChange) return;
    
        setApplyingId(theme.id);
        try {
            const res = await applyThemeAction(mkt.slug, mkt.theme_mode);
            if (res.success) {
                setCurrentConfig({ slug: mkt.slug, mode: mkt.theme_mode });
                alert('เปิดใช้งานธีมสำเร็จ!');
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
    const totalPages = Math.ceil(themes.length / ITEMS_PER_PAGE);
    
    const currentThemes = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return themes.slice(start, start + ITEMS_PER_PAGE);
    }, [currentPage, themes]);
    
    const changePage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return {
        themes, loading, brandId, currentConfig, isOwner,
        applyingId, currentThemes, currentPage, totalPages,
        changePage, handleApplyTheme, getImageUrl
    };
}