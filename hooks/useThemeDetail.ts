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
    
    // ✅ Ownership & Permission State
    const [userRole, setUserRole] = useState<{ isOwner: boolean }>({ isOwner: false }); // เก็บสิทธิ์ user
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

    // --- Init Data ---
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            const res = await getThemeDetailAction(id as string);
            
            if (res.success) {
                setTheme(res.theme);
                setUserRole({ isOwner: res.isOwner }); // ✅ รับค่าสิทธิ์มาเก็บไว้
                
                // ✅ คำนวณสถานะการซื้อ
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

                    // ถ้ามีรายเดือนแล้วแต่ยังไม่หมด ให้ default เป็น lifetime เผื่อจะอัปเกรด
                    if (owned.purchase_type === 'monthly' && !isExpired) {
                        setSelectedPlan('lifetime');
                    }
                } else {
                    setOwnership({ isOwned: false, type: null, expiresAt: null, daysLeft: null, isExpired: false });
                }
                
                // Init Images
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

    // ... (View & Payment Effects เหมือนเดิม) ...
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

    const performInstall = async (verifiedChargeId?: string | null) => {
        setProcessing(true);
        const res = await installThemeAction(theme.id, verifiedChargeId, selectedPlan);
        if (res.success) {
            alert('🎉 Success!');
            window.location.reload(); 
        } else {
            alert('Error: ' + res.error);
            setProcessing(false);
            setShowPaymentModal(false);
        }
    };

    // --- Handlers ---
    const handleGetTheme = async () => {
        // 🔒 CHECK PERMISSION: ถ้าไม่ใช่ Owner ห้ามซื้อ
        if (!userRole.isOwner) {
            alert("⚠️ ขออภัย: เฉพาะเจ้าของร้าน (Owner) เท่านั้นที่สามารถสั่งซื้อได้");
            return;
        }

        if (ownership.isOwned && ownership.type === 'lifetime') {
            router.push('/dashboard/theme');
            return;
        }

        const currentPrice = selectedPlan === 'monthly' ? (theme.price_monthly ?? 0) : (theme.price_lifetime ?? 0);

        if (currentPrice === 0) {
            if (!confirm(`ยืนยันรับธีม "${theme.name}" ฟรี?`)) return;
            await performInstall(null);
            return;
        }

        if (!confirm(`ยืนยันซื้อธีม "${theme.name}" ราคา ฿${currentPrice.toLocaleString()}?`)) return;
        
        setProcessing(true);
        const res = await createPromptPayQRCode(currentPrice);

        if (res.success && res.qrImage) {
            setQrCode(res.qrImage);
            setChargeId(res.chargeId);
            setPaymentStatus('pending');
            setShowPaymentModal(true);
        } else {
            alert('Error: ' + res.error);
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
        if (confirm('ยกเลิกการชำระเงิน?')) {
            setShowPaymentModal(false);
            setQrCode(null);
            setChargeId(null);
            setPaymentStatus('idle');
        }
    };

    return {
        theme, loading, ownership, processing, userRole, // ✅ ส่ง userRole ออกไป
        viewMode, setViewMode,
        activeImage, setActiveImage,
        displayImages,
        getImageUrl, handleGetTheme, handleShare, router,
        showPaymentModal, qrCode, paymentStatus, closePaymentModal,
        selectedPlan, setSelectedPlan
    };
}