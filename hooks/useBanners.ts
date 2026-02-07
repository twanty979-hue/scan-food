import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getBannersAction, upsertBannerAction, deleteBannerAction } from '@/app/actions/bannerActions';
// ✅ 1. Import ตัว Hook มาใช้
import { useGlobalAlert } from '@/components/providers/GlobalAlertProvider';

export type Banner = {
  id: string;
  image_name: string;
  title: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
};

const CDN_URL = "https://xvhibjejvbriotfpunvv.supabase.co/storage/v1/object/public/banners/"; 

export function useBanners() {
  // ✅ 2. ดึงฟังก์ชัน showAlert และ showConfirm ออกมา
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
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [currentImageName, setCurrentImageName] = useState('');

  const getImageUrl = (imageName: string | null) => {
    if (!imageName || !brandId) return null;
    if (imageName.startsWith('http')) return imageName;
    return `${CDN_URL}${brandId}/${imageName}`;
  };

  const compressToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1600;
          if (width > MAX_WIDTH) {
            height = (MAX_WIDTH / width) * height;
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context failed'));
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error('WebP error')); }, 'image/webp', 0.82);
        };
      };
      reader.onerror = (error) => reject(error);
    });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId || (!imageFile && !editingId)) {
        showAlert('warning', 'ข้อมูลไม่ครบ', 'กรุณาเลือกรูปภาพแบนเนอร์');
        return;
    }

    setIsSubmitting(true);
    try {
      let finalImageName = currentImageName;

      if (imageFile) {
        const webpBlob = await compressToWebP(imageFile);
        const fileNameOnly = `${Date.now()}.webp`;
        const uploadPath = `${brandId}/${fileNameOnly}`;
        
        const { error: uploadError } = await supabase.storage.from('banners').upload(uploadPath, webpBlob, { contentType: 'image/webp', upsert: true });
        if (uploadError) throw uploadError;
        finalImageName = fileNameOnly;
      }

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

      closeModal();
      // ✅ 3. แจ้งเตือนเมื่อบันทึกสำเร็จ
      showAlert('success', 'บันทึกสำเร็จ', 'ข้อมูลแบนเนอร์ของคุณถูกอัปเดตเรียบร้อยแล้ว');
      fetchBanners();
    } catch (err: any) {
      // ✅ 4. แจ้งเตือนเมื่อพลาด
      showAlert('error', 'เกิดข้อผิดพลาด', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    // ✅ 5. ใช้ showConfirm พร้อม 'error' เพื่อโชว์ถังขยะแดง
    const isConfirmed = await showConfirm(
        'ยืนยันการลบ?',
        'คุณแน่ใจหรือไม่ว่าต้องการลบแบนเนอร์นี้ออกจากหน้าเว็บบริการของคุณ?',
        'ลบทิ้ง',
        'ยกเลิก',
        'error' // 🔥 ถังขยะแดงมาแน่!
    );

    if (!isConfirmed) return;

    const res = await deleteBannerAction(id);
    if (res.success) {
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
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingId(null);
    setFormData({ title: '', linkUrl: '', sortOrder: 0, isActive: true });
    setImageFile(null);
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
    imageFile, previewUrl, handleFileChange,
    openEdit, closeModal, handleSubmit, handleDelete, setIsModalOpen,
    getImageUrl
  };
}