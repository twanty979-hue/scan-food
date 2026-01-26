// hooks/useBanners.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // ใช้ Client สำหรับ Upload Storage
import { getBannersAction, upsertBannerAction, deleteBannerAction } from '@/app/actions/bannerActions';

export type Banner = {
  id: string;
  image_name: string;
  title: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
};

// Config Storage URL
const CDN_URL = "https://xvhibjejvbriotfpunvv.supabase.co/storage/v1/object/public/banners/"; 

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandId, setBrandId] = useState<string | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    linkUrl: '',
    sortOrder: 0,
    isActive: true,
  });
  
  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [currentImageName, setCurrentImageName] = useState('');

  // --- Helpers ---
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

  // --- Main Actions ---
  const fetchBanners = async () => {
    setLoading(true);
    const res = await getBannersAction();
    if (res.success) {
      setBanners(res.data || []);
      setBrandId(res.brandId); // ได้ brandId มาจาก Server Action เลย
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
    if (!brandId || (!imageFile && !editingId)) return;

    setIsSubmitting(true);
    try {
      let finalImageName = currentImageName;

      // 1. Upload รูป (Client Side -> Storage)
      if (imageFile) {
        const webpBlob = await compressToWebP(imageFile);
        const fileNameOnly = `${Date.now()}.webp`;
        const uploadPath = `${brandId}/${fileNameOnly}`;
        
        const { error: uploadError } = await supabase.storage.from('banners').upload(uploadPath, webpBlob, { contentType: 'image/webp', upsert: true });
        if (uploadError) throw uploadError;
        finalImageName = fileNameOnly;
      }

      // 2. Save ลง Database (Server Action)
      const payload = {
        id: editingId, // ถ้ามี ID คือ Update
        title: formData.title,
        link_url: formData.linkUrl,
        image_name: finalImageName,
        sort_order: formData.sortOrder,
        is_active: formData.isActive
      };

      const res = await upsertBannerAction(payload);
      if (!res.success) throw new Error(res.error);

      closeModal();
      fetchBanners();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบแบนเนอร์นี้?')) return;
    const res = await deleteBannerAction(id);
    if (res.success) fetchBanners();
  };

  // --- UI Helpers ---
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