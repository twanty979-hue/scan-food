// hooks/useSettings.ts
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    getBrandSettingsAction, 
    updateBrandSettingsAction, 
    upgradeBrandPlanAction, 
    createPromptPayChargeAction, 
    checkPaymentStatusAction 
} from '@/app/actions/settingsActions';
import { useRouter } from 'next/navigation';
import { useGlobalAlert } from '@/components/providers/GlobalAlertProvider';

const CDN_URL = "https://xvhibjejvbriotfpunvv.supabase.co/storage/v1/object/public/brands/";

declare global { interface Window { Omise: any; OmiseCard: any; } }

export function useSettings() {
    const router = useRouter();
    const { showAlert, showConfirm } = useGlobalAlert();
    const logoInputRef = useRef<HTMLInputElement>(null);
    const qrInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [brandId, setBrandId] = useState<string | null>(null);
    
    // ✅ เพิ่ม State
    const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [isAutoRenew, setIsAutoRenew] = useState(true); 

    const [paymentModal, setPaymentModal] = useState<{
        isOpen: boolean; qrImage: string | null; chargeId: string | null; plan: string | null;
    }>({ isOpen: false, qrImage: null, chargeId: null, plan: null });

    const [formData, setFormData] = useState({
        name: '', phone: '', address: '', promptpay_number: '', 
        logo_url: '', qr_image_url: '', plan: 'free', vat: 0, service_charge: 0
    });

    useEffect(() => {
        const init = async () => {
            const res = await getBrandSettingsAction();
            if (res.success) {
                setBrandId(res.brandId || '');
                setIsOwner(res.isOwner || false);
                if (res.brand) {
                    setFormData({
                        name: res.brand.name || '', phone: res.brand.phone || '', address: res.brand.address || '',
                        promptpay_number: res.brand.promptpay_number || '', logo_url: res.brand.logo_url || '',
                        qr_image_url: res.brand.qr_image_url || '', plan: res.brand.plan || 'free',
                        vat: res.brand.config?.vat || 0, service_charge: res.brand.config?.service_charge || 0
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

    const getImageUrl = (imageName: string | null) => {
        if (!imageName || !brandId) return null;
        if (imageName.startsWith('http')) return imageName;
        return `${CDN_URL}${brandId}/${imageName}`;
    };

    const copyBrandId = () => {
        if (brandId) {
            navigator.clipboard.writeText(brandId);
            showAlert('success', 'คัดลอกเรียบร้อย', 'รหัสร้านถูกคัดลอกไปยังคลิปบอร์ดแล้ว');
        }
    };

    const createOmiseToken = (amount: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!window.OmiseCard) return reject(new Error("Payment System Loading..."));
            window.OmiseCard.configure({
                publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!,
                frameLabel: 'Spring POS',
                submitLabel: `PAY ฿${(amount/100).toLocaleString()}`,
                currency: 'thb',
            });
            window.OmiseCard.open({
                amount: amount,
                onCreateTokenSuccess: (token: string) => resolve(token),
                onFormClosed: () => reject(new Error("Payment cancelled")),
            });
        });
    };

    const createPromptPaySource = (amount: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!window.Omise) return reject(new Error("Payment System Loading..."));
            window.Omise.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY!);
            window.Omise.createSource('promptpay', { amount, currency: 'thb' }, (statusCode: number, response: any) => {
                if (statusCode === 200) resolve(response.id);
                else reject(new Error(response.message));
            });
        });
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'qr_image_url') => {
        if (!isOwner || !e.target.files || !e.target.files[0] || !brandId) return;
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileNameOnly = `${field === 'logo_url' ? 'logo' : 'qr'}_${Date.now()}.${fileExt}`;
        const uploadPath = `${brandId}/${fileNameOnly}`;
        try {
            setSubmitting(true);
            const { error } = await supabase.storage.from('brands').upload(uploadPath, file, { upsert: true });
            if (error) throw error;
            setFormData(prev => ({ ...prev, [field]: fileNameOnly }));
            showAlert('success', 'อัปโหลดสำเร็จ', 'บันทึกรูปภาพเรียบร้อยแล้ว');
        } catch (err: any) {
            showAlert('error', 'อัปโหลดล้มเหลว', err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isOwner || !brandId) return;
        setSubmitting(true);
        try {
            const res = await updateBrandSettingsAction(brandId, {
                name: formData.name, phone: formData.phone, address: formData.address,
                promptpay_number: formData.promptpay_number, logo_url: formData.logo_url, qr_image_url: formData.qr_image_url
            });
            if (res.success) showAlert('success', 'บันทึกสำเร็จ', 'ข้อมูลอัปเดตแล้ว');
            else throw new Error((res as any).error || 'Unknown error');
        } catch (err: any) {
            showAlert('error', 'เกิดข้อผิดพลาด', err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Upgrade Function (Updated with Period)
    const handleUpgradePlan = async (newPlan: string, method: 'credit_card' | 'promptpay') => {
        if (!isOwner || !brandId) return;
        
        // ราคารายเดือน (ใช้เพื่อคำนวณเบื้องต้นโชว์ Alert)
        const basePrices: Record<string, number> = { free: 0, basic: 39900, pro: 129900, ultimate: 199900 };
        let amount = basePrices[newPlan] || 0;

        // ถ้าเลือกรายปี คำนวณส่วนลด 20%
        if (period === 'yearly') {
            amount = Math.floor((amount * 12) * 0.8);
        }

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

    // ✅ Check Status Loop (Updated with Period)
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
        isAutoRenew, setIsAutoRenew,
        period, setPeriod // ✅ ส่ง period ออกไป
    };
}