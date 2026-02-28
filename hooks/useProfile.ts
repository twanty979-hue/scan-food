// hooks/useProfile.ts
import { useState, useEffect, useRef } from 'react';
import { getProfileDataAction, updateProfileAction } from '@/app/actions/profileActions';
import { useRouter } from 'next/navigation';
import { useGlobalAlert } from '@/components/providers/GlobalAlertProvider'; // 🌟 ดึง Alert พี่มาใช้

const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export function useProfile() {
    const router = useRouter();
    const { showAlert } = useGlobalAlert(); // 🌟 เรียกใช้งาน Alert Provider
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        avatar_url: '',
        role: ''
    });

    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const res = await getProfileDataAction();
            if (res.success && res.user) {
                setUserId(res.user.id);
                setEmail(res.user.email || '');
                if (res.profile) {
                    setFormData({
                        full_name: res.profile.full_name || '',
                        phone: res.profile.phone || '',
                        avatar_url: res.profile.avatar_url || '',
                        role: res.profile.role || 'staff'
                    });
                }
            } else {
                router.replace('/login');
            }
            setLoading(false);
        };
        init();
    }, [router]);

    const getImageUrl = (imageName: string | null) => {
        if (!imageName) return null;
        if (imageName.startsWith('blob:')) return imageName;
        if (imageName.startsWith('http')) return imageName;
        return `${CDN_URL}/${imageName}`;
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setImageToCrop(imageUrl);
            setIsCropModalOpen(true);
            e.target.value = ''; 
        }
    };

    const handleCropComplete = async () => {
        if (!imageToCrop || !croppedAreaPixels) return;

        try {
            const image = await createImage(imageToCrop);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const TARGET_SIZE = 600; 
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
            const MAX_BYTES = 30 * 1024; // 🌟 30KB ตามใจสั่ง

            do {
                webpBlob = await new Promise((resolve) => {
                    canvas.toBlob((blob) => resolve(blob), 'image/webp', quality);
                });
                quality -= 0.1;
            } while (webpBlob && webpBlob.size > MAX_BYTES && quality >= 0.3);

            if (!webpBlob) throw new Error('Failed to create image');

            const croppedFile = new File([webpBlob], `profile-${Date.now()}.webp`, { type: 'image/webp' });
            setSelectedFile(croppedFile);
            setPreviewUrl(URL.createObjectURL(croppedFile));
            setIsCropModalOpen(false);
            setImageToCrop(null);

        } catch (err) {
            showAlert('error', 'ตัดรูปไม่สำเร็จ', 'ไม่สามารถประมวลผลรูปภาพได้');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setSubmitting(true);
        try {
            let finalAvatarUrl = formData.avatar_url;
            let oldAvatarToDelete = null;

            if (selectedFile) {
                const apiFormData = new FormData();
                apiFormData.append("file", selectedFile);
                apiFormData.append("folder", "profiles");

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: apiFormData,
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Upload failed');

                finalAvatarUrl = data.fileName;
                if (formData.avatar_url) oldAvatarToDelete = formData.avatar_url;
            }

            const res = await updateProfileAction(userId, {
                full_name: formData.full_name,
                phone: formData.phone,
                avatar_url: finalAvatarUrl
            });

            if (!res.success) throw new Error(res.error);

            if (oldAvatarToDelete) {
                fetch('/api/delete-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileName: oldAvatarToDelete })
                }).catch(err => console.error("Deletion failed:", err));
            }

            setFormData(prev => ({ ...prev, avatar_url: finalAvatarUrl }));
            setSelectedFile(null);
            
            // 🌟 แจ้งเตือนแบบพรีเมียมด้วย Alert พี่เอง
            showAlert('success', 'บันทึกสำเร็จ', 'ข้อมูลโปรไฟล์ของคุณได้รับการอัปเดตแล้ว');

        } catch (err: any) {
            showAlert('error', 'บันทึกล้มเหลว', err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return {
        loading, submitting, userId, email,
        formData, setFormData,
        fileInputRef, getImageUrl, 
        onFileChange, handleSave,
        imageToCrop, isCropModalOpen, setIsCropModalOpen,
        setCroppedAreaPixels, handleCropComplete, previewUrl
    };
}