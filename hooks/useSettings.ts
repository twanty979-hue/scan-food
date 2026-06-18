// hooks/useSettings.ts
import { useState, useEffect, useRef } from 'react';
import { 
    getBrandSettingsAction, 
    updateBrandSettingsAction, 
    createBeamCheckoutAction, // 🌟 นำเข้าฟังก์ชันของ Beam ที่เราเพิ่งสร้าง
    checkPaymentStatusAction,
    getAvailablePlansAction 
} from '@/app/actions/settingsActions';
import { useRouter, useSearchParams } from 'next/navigation'; // 🌟 เพิ่ม useSearchParams
import { useGlobalAlert } from '@/components/providers/GlobalAlertProvider';

const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export function useSettings() {
    const router = useRouter();
    const searchParams = useSearchParams(); // 🌟 สำหรับดักจับสถานะหลังจ่ายเงินเสร็จ
    const { showAlert, showConfirm } = useGlobalAlert();
    const logoInputRef = useRef<HTMLInputElement>(null);
    const qrInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [brandId, setBrandId] = useState<string | null>(null);
    
    const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [isAutoRenew, setIsAutoRenew] = useState(true); 

    const [dbPlans, setDbPlans] = useState<any[]>([]);
    const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(true);

    // เก็บ Dummy State ไว้ก่อน หน้า UI จะได้ไม่ Error (เดี๋ยวเราค่อยไปลบ Modal QR ออกจากหน้าหลัก)
    const [paymentModal, setPaymentModal] = useState({ isOpen: false, qrImage: null, chargeId: null, plan: null });

    const [formData, setFormData] = useState({
        name: '', phone: '', address: '', promptpay_number: '', 
        logo_url: '', qr_image_url: '', plan: 'free', vat: 0, service_charge: 0,
        expiry: null as string | null,
        qr_mode: 'rotating' as 'rotating' | 'static'
    });

    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [croppingField, setCroppingField] = useState<'logo_url' | 'qr_image_url' | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<{ logo_url?: File; qr_image_url?: File }>({});
    
    const [previewUrls, setPreviewUrls] = useState<{ logo_url?: string; qr_image_url?: string }>({});

    // 🌟 ดักจับตอนที่ Beam Redirect กลับมาที่หน้าเว็บเรา
    useEffect(() => {
        const paymentStatus = searchParams.get('payment');
        if (paymentStatus === 'success') {
            showAlert('success', 'ชำระเงินสำเร็จ!', 'อัปเกรดแพ็กเกจเรียบร้อยแล้ว');
            // ล้าง URL ให้กลับมาสะอาด
            router.replace('/dashboard/settings'); 
        } else if (paymentStatus === 'cancel') {
            showAlert('error', 'ยกเลิกการทำรายการ', 'คุณได้ยกเลิกการชำระเงิน');
            router.replace('/dashboard/settings');
        }
    }, [searchParams, router]);

    useEffect(() => {
        const init = async () => {
            const res = await getBrandSettingsAction();
            if (res.success && res.brandId) {
                setBrandId(res.brandId);
                setIsOwner(res.isOwner || false);
                
                if (res.brand) {
                    let currentExpiry = null;
                    const p = res.brand.plan;
                    if (p === 'basic') currentExpiry = res.brand.expiry_basic;
                    else if (p === 'pro') currentExpiry = res.brand.expiry_pro;
                    else if (p === 'ultimate') currentExpiry = res.brand.expiry_ultimate;

                    setFormData({
                        name: res.brand.name || '', 
                        phone: res.brand.phone || '', 
                        address: res.brand.address || '',
                        promptpay_number: res.brand.promptpay_number || '', 
                        logo_url: res.brand.logo_url || '',
                        qr_image_url: res.brand.qr_image_url || '', 
                        plan: res.brand.plan || 'free',
                        vat: res.brand.config?.vat || 0, 
                        service_charge: res.brand.config?.service_charge || 0,
                        expiry: currentExpiry,
                        qr_mode: (res.brand.table_qr_mode || res.brand.config?.qr_mode) === 'static' ? 'static' : 'rotating'
                    });
                    
                    if (res.brand.is_auto_renew !== undefined) setIsAutoRenew(res.brand.is_auto_renew);
                }

                const plansRes = await getAvailablePlansAction(res.brandId);
                if (plansRes.success) {
                    setDbPlans(plansRes.plans || []);
                    setIsFirstTimeBuyer(plansRes.isFirstTime ?? true);
                }

            } else {
                if (res.error === "Unauthorized") router.replace('/login');
            }
            setLoading(false);
        };
        init();
    }, [router]);

    const getImageUrl = (imageName: string | null, fieldType?: 'logo_url' | 'qr_image_url') => {
        if (fieldType && previewUrls[fieldType]) {
             return previewUrls[fieldType] as string; 
        }
        if (!imageName) return null;
        if (imageName.startsWith('blob:')) return imageName;
        if (imageName.startsWith('http')) return imageName;
        return `${CDN_URL}/${imageName}`; 
    };

    const copyBrandId = () => {
        if (brandId) {
            navigator.clipboard.writeText(brandId);
            showAlert('success', 'คัดลอกเรียบร้อย', 'รหัสร้านถูกคัดลอกไปยังคลิปบอร์ดแล้ว');
        }
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'qr_image_url') => {
        if (!isOwner || !e.target.files || !e.target.files[0] || !brandId) return;
        const file = e.target.files[0];
        const imageUrl = URL.createObjectURL(file);
        setImageToCrop(imageUrl);
        setCroppingField(field);
        setIsCropModalOpen(true);
        e.target.value = ''; 
    };

    const handleCropComplete = async () => {
        if (!imageToCrop || !croppedAreaPixels || !croppingField) return;

        try {
            const image = await createImage(imageToCrop);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const TARGET_SIZE = 300; 
            canvas.width = TARGET_SIZE;
            canvas.height = TARGET_SIZE;

            ctx.drawImage(
                image,
                croppedAreaPixels.x, croppedAreaPixels.y,
                croppedAreaPixels.width, croppedAreaPixels.height,
                0, 0, TARGET_SIZE, TARGET_SIZE
            );

            let quality = 0.8;
            let webpBlob: Blob | null = null;
            const MAX_BYTES = 10 * 1024; 

            do {
                webpBlob = await new Promise((resolve) => {
                    canvas.toBlob((blob) => resolve(blob), 'image/webp', quality);
                });
                quality -= 0.1;
            } while (webpBlob && webpBlob.size > MAX_BYTES && quality >= 0.2);

            if (!webpBlob) throw new Error('Failed to create image');

            const fileName = `${croppingField}-${Date.now()}.webp`;
            const croppedFile = new File([webpBlob], fileName, { type: 'image/webp' });
            
            const previewUrl = URL.createObjectURL(croppedFile);

            setPendingFiles(prev => ({ ...prev, [croppingField]: croppedFile }));
            setPreviewUrls(prev => ({ ...prev, [croppingField]: previewUrl }));
            
            setIsCropModalOpen(false);
            setImageToCrop(null);

        } catch (err) {
            showAlert('error', 'ข้อผิดพลาด', 'ไม่สามารถตัดรูปภาพได้');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!brandId) return; 

        setSubmitting(true);
        try {
            let finalLogoUrl = formData.logo_url;
            let finalQrUrl = formData.qr_image_url;
            let oldImagesToDelete: string[] = [];
            const uploadQueue = [];

            if (pendingFiles.logo_url) {
                const fd = new FormData(); fd.append("file", pendingFiles.logo_url); fd.append("folder", brandId);
                uploadQueue.push(fetch('/api/upload', { method: 'POST', body: fd }).then(r => r.json()).then(d => {
                    if (formData.logo_url && !formData.logo_url.startsWith('http')) {
                         oldImagesToDelete.push(formData.logo_url); 
                    }
                    finalLogoUrl = d.fileName; 
                }));
            }

            if (pendingFiles.qr_image_url) {
                const fd = new FormData(); fd.append("file", pendingFiles.qr_image_url); fd.append("folder", brandId);
                uploadQueue.push(fetch('/api/upload', { method: 'POST', body: fd }).then(r => r.json()).then(d => {
                    if (formData.qr_image_url && !formData.qr_image_url.startsWith('http')) {
                        oldImagesToDelete.push(formData.qr_image_url); 
                    }
                    finalQrUrl = d.fileName; 
                }));
            }

            if (uploadQueue.length > 0) await Promise.all(uploadQueue);

            const res = await updateBrandSettingsAction(brandId, {
                name: formData.name, phone: formData.phone, address: formData.address,
                promptpay_number: formData.promptpay_number, logo_url: finalLogoUrl, qr_image_url: finalQrUrl,
                qr_mode: formData.qr_mode
            });

            if (!res.success) throw new Error((res as any).error || 'Unknown error');

            oldImagesToDelete.forEach(fileName => {
                fetch('/api/delete-image', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ fileName }) 
                }).catch(e => console.error(e));
            });

            setPendingFiles({});
            setPreviewUrls({});
            setFormData(prev => ({ ...prev, logo_url: finalLogoUrl, qr_image_url: finalQrUrl }));
            showAlert('success', 'บันทึกสำเร็จ', 'ข้อมูลอัปเดตแล้ว');
        } catch (err: any) {
            showAlert('error', 'เกิดข้อผิดพลาด', err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // 🌟 พระเอกของเรา โค้ดใหม่สำหรับการอัปเกรด
    const handleUpgradePlan = async (newPlan: string) => {
        if (!isOwner || !brandId) return;
        
        let amount = 0;
        if (newPlan !== 'free') {
            const planDB = dbPlans.find(p => p.plan_key === newPlan);
            if (planDB) {
                if (period === 'monthly') {
                    amount = (isFirstTimeBuyer && planDB.first_time_price_monthly !== null && planDB.first_time_price_monthly !== undefined)
                        ? planDB.first_time_price_monthly
                        : planDB.price_monthly;
                } else {
                    amount = (isFirstTimeBuyer && planDB.first_time_price_yearly !== null && planDB.first_time_price_yearly !== undefined)
                        ? planDB.first_time_price_yearly
                        : planDB.price_yearly;
                }
            }
        }

        // กรณีเลือกแพ็กเกจฟรี
        if (amount === 0) {
             setSubmitting(true);
             try {
                 // ส่งค่าว่างให้ successUrl, cancelUrl ไปเลย เพราะตัวแปร 0 บาท ข้ามระบบจ่ายเงินอยู่แล้ว
                 const res = await createBeamCheckoutAction(brandId, newPlan, period, '', '');
                 if (res.success) {
                     setFormData(prev => ({ ...prev, plan: newPlan }));
                     const msg = newPlan === 'free' ? 'กลับมาใช้ Free Plan แล้ว' : 'รับสิทธิ์ใช้ฟรีสำเร็จ!';
                     showAlert('success', 'สำเร็จ!', msg);
                 } else {
                     throw new Error(res.error);
                 }
             } catch(err: any) { 
                 showAlert('error', 'Error', err.message);
             }
             setSubmitting(false);
             return;
        }

        // กรณีมีค่าใช้จ่าย (เด้งไป Beam)
        let msg = `ยืนยันสมัคร ${newPlan.toUpperCase()} (${period === 'monthly' ? 'รายเดือน' : 'รายปี'})\nยอดชำระ: ${(amount/100).toLocaleString()} บาท`;
        const isConfirmed = await showConfirm('ยืนยันการชำระเงิน?', msg, 'ชำระเงิน', 'ยกเลิก');
        if (!isConfirmed) return;

        setSubmitting(true);
        try {
            // สร้าง URL ตอนจ่ายเสร็จ หรือกดยกเลิก
            const currentUrl = window.location.origin;
            const successUrl = `${currentUrl}/dashboard/settings?payment=success`;
            const cancelUrl = `${currentUrl}/dashboard/settings?payment=cancel`;

            const res = await createBeamCheckoutAction(brandId, newPlan, period, successUrl, cancelUrl);
            
            if (res.success && res.checkoutUrl) {
                // 🚀 ไฮไลท์: สั่งเด้งพาผู้ใช้ไปหน้าเว็บของ Beam ตรงนี้เลย!
                window.location.href = res.checkoutUrl; 
            } else {
                throw new Error(res.error || "Failed to generate checkout link");
            }
        } catch (err: any) {
             showAlert('error', 'เกิดข้อผิดพลาด', err.message);
             setSubmitting(false);
        }
    };

    const closePaymentModal = () => setPaymentModal({ isOpen: false, qrImage: null, chargeId: null, plan: null });

    return {
        loading, submitting, isOwner, brandId, formData, setFormData, logoInputRef, qrInputRef,
        getImageUrl, copyBrandId, handleUpload, handleSave, 
        handleUpgradePlan, paymentModal, closePaymentModal,
        isAutoRenew, setIsAutoRenew, period, setPeriod,
        imageToCrop, isCropModalOpen, setIsCropModalOpen,
        setCroppedAreaPixels, handleCropComplete, croppingField,
        dbPlans, isFirstTimeBuyer 
    };
}
