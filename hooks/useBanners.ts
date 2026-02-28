import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getBannersAction, upsertBannerAction, deleteBannerAction } from '@/app/actions/bannerActions';
import { useGlobalAlert } from '@/components/providers/GlobalAlertProvider';

export type Banner = {
  id: string;
  image_name: string;
  title: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
};

// 🌟 เปลี่ยนมาใช้ Cloudflare R2 ให้เหมือนหน้าเมนู
const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com"; 

// Helper function สร้าง Image object
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export function useBanners() {
  const { showAlert, showConfirm } = useGlobalAlert();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandId, setBrandId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    linkUrl: '',
    sortOrder: 0,
    isActive: true,
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [currentImageName, setCurrentImageName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ✂️ STATE สำหรับระบบ CROP รูป ---
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const getImageUrl = (imageName: string | null) => {
    if (!imageName) return null;
    if (imageName.startsWith('blob:')) return imageName; 
    if (imageName.startsWith('http')) return imageName;
    return `${CDN_URL}/${imageName}`; 
  };

  const fetchBanners = async () => {
    setLoading(true);
    const res = await getBannersAction();
    if (res.success) {
      setBanners(res.data || []);
      setBrandId(res.brandId);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // 1. รับไฟล์เข้ามา แล้วเปิดหน้าต่าง Crop
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
    setIsCropModalOpen(true); 
    e.target.value = ''; 
  };

  // 2. ฟังก์ชัน Crop และบีบอัดสำหรับ "แบนเนอร์" (ชัดตาแตก)
  const handleCropComplete = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      const image = await createImage(imageToCrop);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('No 2d context');

      const TARGET_WIDTH = 1200;
      const TARGET_HEIGHT = (croppedAreaPixels.height / croppedAreaPixels.width) * TARGET_WIDTH;
      
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        TARGET_WIDTH,
        TARGET_HEIGHT
      );

      let quality = 0.9;
      let webpBlob: Blob | null = null;
      const MAX_BYTES = 100 * 1024; // 100KB

      do {
        webpBlob = await new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob), 'image/webp', quality);
        });
        quality -= 0.1;
      } while (webpBlob && webpBlob.size > MAX_BYTES && quality >= 0.4);

      if (!webpBlob) throw new Error('Canvas to Blob failed');

      console.log(`✅ อัตราการบีบอัดแบนเนอร์สำเร็จ: ${(webpBlob.size / 1024).toFixed(2)} KB`);

      const fileNameOnly = `${Date.now()}.webp`; 
      const webpFile = new File([webpBlob], fileNameOnly, { type: 'image/webp' });

      setSelectedFile(webpFile);
      setPreviewUrl(URL.createObjectURL(webpFile));
      
      setIsCropModalOpen(false);
      setImageToCrop(null);

    } catch (e: any) {
      showAlert('error', 'การตัดรูปภาพล้มเหลว', e.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId || (!selectedFile && !editingId && !currentImageName)) {
        showAlert('warning', 'ข้อมูลไม่ครบ', 'กรุณาเลือกรูปภาพแบนเนอร์');
        return;
    }

    setIsSubmitting(true);
    try {
      let finalImageName = currentImageName;
      let oldImageNameToDelete = null;

      if (selectedFile) {
        const apiFormData = new FormData();
        apiFormData.append("file", selectedFile);
        // 🌟 ส่ง Brand ID ไปจัดโฟลเดอร์ใน R2
        apiFormData.append("folder", brandId || "system");

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: apiFormData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Upload to R2 failed');

        finalImageName = data.fileName;

        if (editingId && currentImageName) {
            oldImageNameToDelete = currentImageName;
        }
      }

      if (finalImageName.startsWith('blob:')) { finalImageName = ''; }

      const payload = {
        id: editingId,
        title: formData.title,
        link_url: formData.linkUrl,
        image_name: finalImageName,
        sort_order: formData.sortOrder,
        is_active: formData.isActive
      };

      const res = await upsertBannerAction(payload);
      if (!res.success) throw new Error(res.error);

      // 🗑️ สั่งลบรูปเก่าใน R2 (API ลบมี Safety Guard ตรวจสอบให้แล้ว)
      if (oldImageNameToDelete && !oldImageNameToDelete.startsWith('http')) {
          fetch('/api/delete-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileName: oldImageNameToDelete })
          }).catch(err => console.error("Failed to delete old image:", err));
      }

      closeModal();
      showAlert('success', 'บันทึกสำเร็จ', 'ข้อมูลแบนเนอร์ของคุณถูกอัปเดตเรียบร้อยแล้ว');
      fetchBanners();
    } catch (err: any) {
      showAlert('error', 'เกิดข้อผิดพลาด', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const bannerToDelete = banners.find(b => b.id === id);
    const isConfirmed = await showConfirm(
        'ยืนยันการลบ?',
        'คุณแน่ใจหรือไม่ว่าต้องการลบแบนเนอร์นี้ออกจากหน้าเว็บบริการของคุณ?',
        'ลบทิ้ง',
        'ยกเลิก',
        'error' 
    );

    if (!isConfirmed) return;

    const res = await deleteBannerAction(id);
    if (res.success) {
        // 🗑️ ลบรูปจาก R2 เมื่อแบนเนอร์ถูกลบ
        if (bannerToDelete && bannerToDelete.image_name && !bannerToDelete.image_name.startsWith('http')) {
             fetch('/api/delete-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ fileName: bannerToDelete.image_name })
             }).catch(err => console.error("Failed to delete banner image:", err));
        }
        showAlert('success', 'ลบเรียบร้อย', 'แบนเนอร์ถูกนำออกจากระบบแล้ว');
        fetchBanners();
    } else {
        showAlert('error', 'ลบไม่สำเร็จ', res.error);
    }
  };

  const openEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setFormData({
      title: banner.title || '',
      linkUrl: banner.link_url || '',
      sortOrder: banner.sort_order,
      isActive: banner.is_active,
    });
    setCurrentImageName(banner.image_name);
    setPreviewUrl(getImageUrl(banner.image_name) || '');
    setSelectedFile(null); 
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingId(null);
    setFormData({ title: '', linkUrl: '', sortOrder: 0, isActive: true });
    setSelectedFile(null);
    setPreviewUrl('');
    setCurrentImageName('');
    setIsModalOpen(false);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    banners, loading, isModalOpen, isSubmitting, editingId,
    formData, updateFormData,
    previewUrl, handleImageUpload, fileInputRef,
    openEdit, closeModal, handleSubmit, handleDelete, setIsModalOpen,
    getImageUrl,
    imageToCrop, setIsCropModalOpen, isCropModalOpen,
    setCroppedAreaPixels, handleCropComplete
  };
}