// hooks/useThemeDetail.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getThemeDetailAction, installThemeAction } from '@/app/actions/marketplaceDetailActions';
import { createPromptPayQRCode, checkOmisePaymentStatus } from '@/app/actions/omiseActions';
import { useRouter, useParams } from 'next/navigation';
import dayjs from 'dayjs';

const BUCKET_NAME = 'theme-images';

export function useThemeDetail() {
    const { id } = useParams();
    const router = useRouter();

    // Data State
    const [theme, setTheme] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<{ isOwner: boolean }>({ isOwner: false });
    const [ownership, setOwnership] = useState<{
        isOwned: boolean;
        type: 'monthly' | 'lifetime' | null;
        expiresAt: string | null;
        daysLeft: number | null;
        isExpired: boolean;
    }>({ isOwned: false, type: null, expiresAt: null, daysLeft: null, isExpired: false });

    const [processing, setProcessing] = useState(false);

    // UI State
    const [viewMode, setViewMode] = useState<'mobile' | 'ipad'>('mobile');
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [displayImages, setDisplayImages] = useState<string[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('monthly');

    // Payment State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [chargeId, setChargeId] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'successful'>('idle');

    // ✅✅ NEW: ระบบ Modal กลางจอ (แทน Alert/Confirm)
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'confirm';
        title: string;
        message: string;
        onConfirm?: () => void; // ฟังก์ชันที่จะทำเมื่อกดปุ่มยืนยัน
    }>({ isOpen: false, type: 'success', title: '', message: '' });

    // --- Init Data ---
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            const res = await getThemeDetailAction(id as string);
            
            if (res.success) {
                setTheme(res.theme);
                setUserRole({ isOwner: res.isOwner || false });
                
                if (res.isOwned && res.ownedData) {
                    const owned = res.ownedData;
                    const isExpired = owned.expires_at && dayjs(owned.expires_at).isBefore(dayjs());
                    const daysLeft = owned.expires_at ? dayjs(owned.expires_at).diff(dayjs(), 'day') : null;

                    setOwnership({
                        isOwned: true,
                        type: owned.purchase_type,
                        expiresAt: owned.expires_at,
                        daysLeft: daysLeft,
                        isExpired: isExpired
                    });

                    if (owned.purchase_type === 'monthly' && !isExpired) {
                        setSelectedPlan('lifetime');
                    }
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

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (showPaymentModal && chargeId && paymentStatus === 'pending') {
            interval = setInterval(async () => {
                const res = await checkOmisePaymentStatus(chargeId);
                if (res.success && res.status === 'successful') {
                    setPaymentStatus('successful');
                    clearInterval(interval);
                    await performInstall(chargeId);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [showPaymentModal, chargeId, paymentStatus]);

    // ---------------------------------------------------------
    // ✅ Logic การติดตั้ง (ใช้ Modal แทน Alert)
    // ---------------------------------------------------------
    const performInstall = async (verifiedChargeId?: string | null) => {
        setProcessing(true);
        // ปิด Modal ยืนยันก่อน (ถ้ามี)
        setAlertModal(prev => ({ ...prev, isOpen: false })); 

        const res = await installThemeAction(theme.id, verifiedChargeId || null, selectedPlan);
        
        setProcessing(false);
        setShowPaymentModal(false);

        if (res.success) {
            // 🎉 Success: เปิด Modal สีเขียว
            setAlertModal({
                isOpen: true,
                type: 'success',
                title: 'Installation Successful!',
                message: 'Your new theme is ready to use.',
                onConfirm: () => {
                    // พอกด OK ใน Modal สำเร็จ ให้รีโหลดหน้า
                    window.location.reload();
                }
            });
        } else {
            // ❌ Error: เปิด Modal สีแดง
            setAlertModal({
                isOpen: true,
                type: 'error',
                title: 'Installation Failed',
                message: res.error || 'Something went wrong.',
                onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false }))
            });
        }
    };

    const handleGetTheme = async () => {
        if (!userRole.isOwner) {
            setAlertModal({
                isOpen: true, type: 'error', title: 'Access Denied', 
                message: 'Only the store owner can perform this action.',
                onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        if (ownership.isOwned && ownership.type === 'lifetime') {
            router.push('/dashboard/theme');
            return;
        }

        const currentPrice = selectedPlan === 'monthly' ? (theme.price_monthly ?? 0) : (theme.price_lifetime ?? 0);

        // ✅ CASE 1: ของฟรี (Free Theme) -> เปิด Modal ยืนยัน
        if (currentPrice === 0) {
            setAlertModal({
                isOpen: true,
                type: 'confirm',
                title: 'Confirm Installation',
                message: `Install "${theme.name}" for free?`,
                onConfirm: () => performInstall(null) // ถ้ากด Yes ให้ไปติดตั้ง
            });
            return;
        }

        // ✅ CASE 2: ของเสียเงิน -> เปิด QR Code เลย (ถือว่ากดปุ่มคือยืนยันแล้ว)
        setProcessing(true);
        const res = await createPromptPayQRCode(currentPrice);

        if (res.success && res.qrImage) {
            setQrCode(res.qrImage);
            setChargeId(res.chargeId);
            setPaymentStatus('pending');
            setShowPaymentModal(true);
        } else {
            setAlertModal({
                isOpen: true, type: 'error', title: 'Payment Error', 
                message: res.error || 'Cannot generate QR Code.',
                onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false }))
            });
        }
        setProcessing(false);
    };

    const getImageUrl = (fileName: string | null) => {
        if (!fileName) return null;
        if (fileName.startsWith('http')) return fileName;
        const filePath = fileName.startsWith('themes/') ? fileName : `themes/${fileName}`;
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        return data.publicUrl;
    };
    
    const handleShare = () => { /* ... */ };
    
    const closePaymentModal = () => {
        if (paymentStatus === 'successful') return;
        setShowPaymentModal(false);
        setQrCode(null);
        setChargeId(null);
        setPaymentStatus('idle');
    };

    // Helper ปิด Modal ทั่วไป
    const closeAlertModal = () => {
        setAlertModal(prev => ({ ...prev, isOpen: false }));
    };

    return {
        theme, loading, ownership, processing, userRole,
        viewMode, setViewMode, activeImage, setActiveImage, displayImages,
        getImageUrl, handleGetTheme, handleShare, router,
        showPaymentModal, qrCode, paymentStatus, closePaymentModal,
        selectedPlan, setSelectedPlan,
        // ✅ ส่ง Modal State ออกไป
        alertModal, closeAlertModal 
    };
}