// hooks/useSettings.ts
import { useState, useEffect, useRef } from 'react';
import { 
    getBrandSettingsAction, 
    updateBrandSettingsAction, 
    upgradeBrandPlanAction, 
    createPromptPayChargeAction, 
    checkPaymentStatusAction 
} from '@/app/actions/settingsActions';
import { useRouter } from 'next/navigation';
import { useGlobalAlert } from '@/components/providers/GlobalAlertProvider';

const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

declare global { interface Window { Omise: any; OmiseCard: any; } }

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export function useSettings() {
    const router = useRouter();
    const { showAlert, showConfirm } = useGlobalAlert();
    const logoInputRef = useRef<HTMLInputElement>(null);
    const qrInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [brandId, setBrandId] = useState<string | null>(null);
    
    const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [isAutoRenew, setIsAutoRenew] = useState(true); 

    const [paymentModal, setPaymentModal] = useState<{
        isOpen: boolean; qrImage: string | null; chargeId: string | null; plan: string | null;
    }>({ isOpen: false, qrImage: null, chargeId: null, plan: null });

    const [formData, setFormData] = useState({
        name: '', phone: '', address: '', promptpay_number: '', 
        logo_url: '', qr_image_url: '', plan: 'free', vat: 0, service_charge: 0,
        expiry: null as string | null
    });

    // --- ✂️ STATE สำหรับ CROP รูปภาพ ---
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [croppingField, setCroppingField] = useState<'logo_url' | 'qr_image_url' | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<{ logo_url?: File; qr_image_url?: File }>({});
    
    // 🌟 พระเอกที่ผมลืมใส่ให้พี่: แยก State สำหรับพรีวิวรูปใหม่ เพื่อไม่ให้ไปทับชื่อรูปเก่าใน DB
    const [previewUrls, setPreviewUrls] = useState<{ logo_url?: string; qr_image_url?: string }>({});

    useEffect(() => {
        const init = async () => {
            const res = await getBrandSettingsAction();
            if (res.success) {
                setBrandId(res.brandId || '');
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
                        expiry: currentExpiry
                    });
                    
                    if (res.brand.is_auto_renew !== undefined) setIsAutoRenew(res.brand.is_auto_renew);
                }
            } else {
                if (res.error === "Unauthorized") router.replace('/login');
            }
            setLoading(false);
        };
        init();
    }, [router]);

    // 🌟 แก้ไข: ให้เช็คจาก Preview ก่อน ถ้าไม่มีค่อยไปดึงจาก DB
    const getImageUrl = (imageName: string | null, fieldType?: 'logo_url' | 'qr_image_url') => {
        if (fieldType && previewUrls[fieldType]) {
             return previewUrls[fieldType] as string; // โชว์รูป Blob ก่อน
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

            // 🌟 แก้ไข: เก็บ File ไว้ Upload และเก็บ Preview ไว้โชว์ โดยไม่ไปยุ่งกับ formData 
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
            // ดึงชื่อไฟล์ดั้งเดิมจาก DB ไว้ก่อน
            let finalLogoUrl = formData.logo_url;
            let finalQrUrl = formData.qr_image_url;
            let oldImagesToDelete: string[] = [];
            const uploadQueue = [];

            // 🌟 ตอนนี้ formData.logo_url จะเป็นชื่อไฟล์เดิมจริงๆ แล้ว ไม่ใช่ Blob
            if (pendingFiles.logo_url) {
                const fd = new FormData(); fd.append("file", pendingFiles.logo_url); fd.append("folder", brandId);
                uploadQueue.push(fetch('/api/upload', { method: 'POST', body: fd }).then(r => r.json()).then(d => {
                    if (formData.logo_url && !formData.logo_url.startsWith('http')) {
                         oldImagesToDelete.push(formData.logo_url); // เก็บชื่อไฟล์เก่าเตรียมลบ
                    }
                    finalLogoUrl = d.fileName; // อัปเดตชื่อไฟล์ใหม่
                }));
            }

            if (pendingFiles.qr_image_url) {
                const fd = new FormData(); fd.append("file", pendingFiles.qr_image_url); fd.append("folder", brandId);
                uploadQueue.push(fetch('/api/upload', { method: 'POST', body: fd }).then(r => r.json()).then(d => {
                    if (formData.qr_image_url && !formData.qr_image_url.startsWith('http')) {
                        oldImagesToDelete.push(formData.qr_image_url); // เก็บชื่อไฟล์เก่าเตรียมลบ
                    }
                    finalQrUrl = d.fileName; // อัปเดตชื่อไฟล์ใหม่
                }));
            }

            if (uploadQueue.length > 0) await Promise.all(uploadQueue);

            const res = await updateBrandSettingsAction(brandId, {
                name: formData.name, phone: formData.phone, address: formData.address,
                promptpay_number: formData.promptpay_number, logo_url: finalLogoUrl, qr_image_url: finalQrUrl
            });

            if (!res.success) throw new Error((res as any).error || 'Unknown error');

            // 🌟 สั่งลบรูปเก่าทิ้งจริงๆ แล้วครับ
            oldImagesToDelete.forEach(fileName => {
                fetch('/api/delete-image', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ fileName }) 
                }).catch(e => console.error(e));
            });

            // ล้าง State และอัปเดต DB ใหม่
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

    // ... (ส่วนที่เหลือของ Omise / UpgradePlan เหมือนเดิม) ...
    const createOmiseToken = (amount: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!window.OmiseCard) return reject(new Error("Payment System Loading..."));
            window.OmiseCard.configure({ publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!, frameLabel: 'Spring POS', submitLabel: 'Pay', currency: 'thb' });
            window.OmiseCard.open({ amount: amount, onCreateTokenSuccess: (token: string) => resolve(token), onFormClosed: () => reject(new Error("Payment cancelled")) });
        });
    };

    const createPromptPaySource = (amount: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!window.Omise) return reject(new Error("Payment System Loading..."));
            window.Omise.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!);
            window.Omise.createSource('promptpay', { amount, currency: 'thb' }, (statusCode: number, response: any) => {
                if (statusCode === 200) resolve(response.id); else reject(new Error(response.message));
            });
        });
    };

    const handleUpgradePlan = async (newPlan: string, method: 'credit_card' | 'promptpay') => {
        if (!isOwner || !brandId) return;
        const basePrices: Record<string, number> = { free: 0, basic: 25000, pro: 48900, ultimate: 199900 };
        let amount = basePrices[newPlan] || 0;
        if (period === 'yearly') amount = Math.floor((amount * 12) * 0.8);

        if (amount === 0 && newPlan === 'free') {
             setSubmitting(true);
             try {
                 const res = await createPromptPayChargeAction(brandId, newPlan, 'monthly', 'dummy_source');
                 if (res.success) {
                     setFormData(prev => ({ ...prev, plan: newPlan }));
                     showAlert('success', 'เปลี่ยนแพ็กเกจสำเร็จ', 'กลับมาใช้ Free Plan แล้ว');
                 }
             } catch(err: any) { showAlert('error', 'Error', err.message) }
             setSubmitting(false);
             return;
        }

        let msg = `ยืนยันสมัคร ${newPlan.toUpperCase()} (${period === 'monthly' ? 'รายเดือน' : 'รายปี'})\nยอดชำระ: ${(amount/100).toLocaleString()} บาท`;
        if (method === 'credit_card' && isAutoRenew) msg += `\n(ระบบจะตัดบัตรอัตโนมัติเมื่อครบกำหนด)`;
        const isConfirmed = await showConfirm('ยืนยันการชำระเงิน?', msg, 'ชำระเงิน', 'ยกเลิก');
        if (!isConfirmed) return;

        setSubmitting(true);
        try {
            if (method === 'credit_card') {
                const token = await createOmiseToken(amount);
                const res = await upgradeBrandPlanAction(brandId, newPlan, period, token, isAutoRenew);
                if (res.success) {
                    setFormData(prev => ({ ...prev, plan: newPlan }));
                    showAlert('success', 'ชำระเงินสำเร็จ!', 'อัปเกรดแพ็กเกจเรียบร้อยแล้ว');
                } else throw new Error(res.error);
            } else {
                const sourceId = await createPromptPaySource(amount);
                const res = await createPromptPayChargeAction(brandId, newPlan, period, sourceId);
                if (res.success && res.type === 'promptpay' && res.qrImage) {
                    setPaymentModal({ isOpen: true, qrImage: res.qrImage, chargeId: res.chargeId, plan: newPlan });
                } else throw new Error("Failed to generate QR");
            }
        } catch (err: any) {
            if (err.message !== "Payment cancelled") showAlert('error', 'เกิดข้อผิดพลาด', err.message);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (paymentModal.isOpen && paymentModal.chargeId && brandId) {
            interval = setInterval(async () => {
                const res = await checkPaymentStatusAction(brandId, paymentModal.chargeId!, paymentModal.plan!, period);
                if (res.status === 'successful') {
                    clearInterval(interval);
                    setPaymentModal({ isOpen: false, qrImage: null, chargeId: null, plan: null });
                    setFormData(prev => ({ ...prev, plan: paymentModal.plan! }));
                    showAlert('success', 'ชำระเงินสำเร็จ!', 'อัปเกรดแพ็กเกจเรียบร้อยแล้ว');
                } else if (res.status === 'failed') {
                    clearInterval(interval);
                    setPaymentModal({ isOpen: false, qrImage: null, chargeId: null, plan: null });
                    showAlert('error', 'รายการล้มเหลว', 'หมดเวลาหรือยกเลิก');
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [paymentModal.isOpen, paymentModal.chargeId, brandId, period]); 

    const closePaymentModal = () => setPaymentModal({ isOpen: false, qrImage: null, chargeId: null, plan: null });

    return {
        loading, submitting, isOwner, brandId, formData, setFormData, logoInputRef, qrInputRef,
        getImageUrl, copyBrandId, handleUpload, handleSave, 
        handleUpgradePlan, paymentModal, closePaymentModal,
        isAutoRenew, setIsAutoRenew, period, setPeriod,
        imageToCrop, isCropModalOpen, setIsCropModalOpen,
        setCroppedAreaPixels, handleCropComplete, croppingField
    };
}