import { useState, useEffect } from 'react';
import { getThemeDetailAction, installThemeAction, buyThemeWithCoinsAction } from '@/app/actions/marketplaceDetailActions';
import { useRouter, useParams } from 'next/navigation';
import dayjs from 'dayjs';

const CDN_BASE_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

type PlanType = 'weekly' | 'monthly' | 'yearly';

export function useThemeDetail() {
    const { id } = useParams();
    const router = useRouter();

    const [theme, setTheme] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<{ isOwner: boolean }>({ isOwner: false });
    const [coins, setCoins] = useState<number>(0);
    const [ownership, setOwnership] = useState<{
        isOwned: boolean; type: string | null; expiresAt: string | null; daysLeft: number | null; isExpired: boolean;
    }>({ isOwned: false, type: null, expiresAt: null, daysLeft: null, isExpired: false });

    const [processing, setProcessing] = useState(false);
    const [viewMode, setViewMode] = useState<'mobile' | 'ipad'>('mobile');
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [displayImages, setDisplayImages] = useState<string[]>([]);
    
    const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');

    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean; type: 'success' | 'error' | 'confirm'; title: string; message: string; onConfirm?: () => void;
    }>({ isOpen: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            const res = await getThemeDetailAction(id as string);
            
            if (res.success) {
                setTheme(res.theme);
                setUserRole({ isOwner: res.isOwner || false });
                if (res.coins !== undefined) setCoins(res.coins);
                
                if (res.isOwned && res.ownedData) {
                    const owned = res.ownedData;
                    const isExpired = owned.expires_at && dayjs(owned.expires_at).isBefore(dayjs());
                    const daysLeft = owned.expires_at ? dayjs(owned.expires_at).diff(dayjs(), 'day') : null;

                    setOwnership({
                        isOwned: true, type: owned.purchase_type, expiresAt: owned.expires_at,
                        daysLeft: daysLeft, isExpired: isExpired
                    });
                } else {
                    setOwnership({ isOwned: false, type: null, expiresAt: null, daysLeft: null, isExpired: false });
                }
                
                let images: string[] = [];
                if (res.theme.image_url) images.push(res.theme.image_url);
                if (res.theme.gallery?.mobile) images = [...images, ...res.theme.gallery.mobile];
                const finalImages = images.slice(0, 5); 
                setDisplayImages(finalImages);
                if (finalImages.length > 0) setActiveImage(finalImages[0]);
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (!theme) return;
        let images: string[] = [];
        if (viewMode === 'mobile') {
            if (theme.image_url) images.push(theme.image_url);
            if (theme.gallery?.mobile) images = [...images, ...theme.gallery.mobile];
        } else {
            if (theme.gallery?.ipad) images = [...theme.gallery.ipad];
        }
        const finalImages = images.slice(0, 5);
        setDisplayImages(finalImages);
        if (finalImages.length > 0) setActiveImage(finalImages[0]);
        else setActiveImage(null);
    }, [viewMode, theme]);

    const performInstallFree = async () => {
        setProcessing(true);
        setAlertModal(prev => ({ ...prev, isOpen: false })); 

        const res = await installThemeAction(theme.id, null, selectedPlan);
        
        setProcessing(false);
        setShowPaymentModal(false);

        if (res.success) {
            // Update UI State instantly instead of reloading
            setOwnership({
                isOwned: true,
                type: 'free',
                expiresAt: null,
                daysLeft: null,
                isExpired: false
            });
            
            setAlertModal({
                isOpen: true, type: 'success', title: 'Installation Successful!',
                message: 'Your new theme is ready to use.',
                onConfirm: () => closeAlertModal()
            });
        } else {
            setAlertModal({
                isOpen: true, type: 'error', title: 'Installation Failed',
                message: res.error || 'Something went wrong.',
                onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false }))
            });
        }
    };

    const confirmCoinPurchase = async (planToBuy: PlanType) => {
        setProcessing(true);
        setAlertModal(prev => ({ ...prev, isOpen: false }));

        const res = await buyThemeWithCoinsAction(theme.id, planToBuy);
        
        setProcessing(false);
        setShowPaymentModal(false);

        if (res.success) {
            // Update UI State instantly instead of reloading
            if (res.newCoinBalance !== undefined) {
                setCoins(res.newCoinBalance);
            }
            if (res.expiresAt) {
                const daysLeft = dayjs(res.expiresAt).diff(dayjs(), 'day');
                setOwnership({
                    isOwned: true,
                    type: planToBuy,
                    expiresAt: res.expiresAt,
                    daysLeft: daysLeft,
                    isExpired: false
                });
            }

            setAlertModal({
                isOpen: true, type: 'success', title: 'สั่งซื้อสำเร็จ!',
                message: 'ธีมใหม่ของคุณพร้อมใช้งานแล้ว',
                onConfirm: () => closeAlertModal()
            });
        } else {
            setAlertModal({
                isOpen: true, type: 'error', title: 'สั่งซื้อล้มเหลว',
                message: res.error || 'เกิดข้อผิดพลาดบางอย่าง',
                onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false }))
            });
        }
    };

    const handleGetTheme = async (overridePlan?: PlanType) => {
        if (!userRole.isOwner) {
            setAlertModal({
                isOpen: true, type: 'error', title: 'Access Denied', 
                message: 'Only the store owner can perform this action.',
                onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        const planToBuy = overridePlan || selectedPlan;

        let currentPrice = 0;
        if (planToBuy === 'weekly') currentPrice = theme.price_weekly ?? 0;
        else if (planToBuy === 'monthly') currentPrice = theme.price_monthly ?? 0;
        else if (planToBuy === 'yearly') currentPrice = theme.price_yearly ?? 0;

        if (currentPrice === 0) {
            setAlertModal({
                isOpen: true, type: 'confirm', title: 'ยืนยันการติดตั้ง',
                message: `ติดตั้ง "${theme.name}" ฟรี?`,
                onConfirm: () => performInstallFree()
            });
            return;
        }

        // Show confirmation modal instead of payment modal
        setShowPaymentModal(true);
    };

    const getImageUrl = (fileName: string | null) => {
        if (!fileName) return null;
        if (fileName.startsWith('http')) return fileName;
        if (fileName.startsWith('themes/')) return `${CDN_BASE_URL}/${fileName}`;
        return `${CDN_BASE_URL}/themes/${fileName}`;
    };
    
    const handleShare = () => { /* ... */ };
    
    const closePaymentModal = () => {
        setShowPaymentModal(false);
    };

    const closeAlertModal = () => {
        setAlertModal(prev => ({ ...prev, isOpen: false }));
    };

    return {
        theme, loading, ownership, processing, userRole, coins,
        viewMode, setViewMode, activeImage, setActiveImage, displayImages,
        getImageUrl, handleGetTheme, handleShare, router,
        showPaymentModal, closePaymentModal, confirmCoinPurchase,
        selectedPlan, setSelectedPlan,
        alertModal, closeAlertModal 
    };
}
