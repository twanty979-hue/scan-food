// hooks/useProducts.ts
import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    getProductsInitialDataAction, 
    upsertProductAction, 
    deleteProductAction, 
    toggleProductStatusAction 
} from '@/app/actions/productActions';
import { useGlobalAlert } from '@/components/providers/GlobalAlertProvider';

const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

export type Category = { id: string; name: string };

// 🌟 เพิ่ม Type สำหรับตัวเลือกเสริม
export type ProductOptionChoice = { name: string; price: number };
export type ProductOption = {
  name: string;       // เช่น "เลือกเส้น", "เพิ่มท็อปปิ้ง"
  type: 'single' | 'multiple'; 
  required: boolean;  
  choices: ProductOptionChoice[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  price_special?: number | null;
  price_jumbo?: number | null;
  image_name: string;
  category_id: string;
  is_available: boolean;
  is_recommended: boolean;
  brand_id: string;
  options?: ProductOption[]; // 👈 รองรับตัวเลือกเสริม
};

// Helper function สร้าง Image object
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export function useProducts() {
  const { showAlert, showConfirm } = useGlobalAlert();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandId, setBrandId] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- ✂️ STATE สำหรับระบบ CROP รูป ---
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // 🌟 เพิ่ม options เข้าไปใน formData
  const [formData, setFormData] = useState({
    name: '', 
    description: '', 
    price: '', 
    price_special: '', 
    price_jumbo: '',
    category_id: '', 
    image_name: '', 
    is_recommended: false,
    options: [] as ProductOption[] // 👈 เก็บค่าตัวเลือกเสริม
  });

  const fetchAllData = async () => {
    setLoading(true);
    const res = await getProductsInitialDataAction();
    if (res.success) {
        setBrandId(res.brandId!);
        setCategories(res.categories || []);
        setProducts(res.products || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getImageUrl = (imageName: string | null) => {
    if (!imageName) return null;
    if (imageName.startsWith('blob:')) return imageName; 
    if (imageName.startsWith('http')) return imageName;
    return `${CDN_URL}/${imageName}`; 
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
    setIsCropModalOpen(true); 
    e.target.value = ''; 
  };

  const handleCropComplete = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      const image = await createImage(imageToCrop);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('No 2d context');

      const TARGET_SIZE = 600;
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        TARGET_SIZE,
        TARGET_SIZE
      );

      let quality = 0.9;
      let webpBlob: Blob | null = null;
      const MAX_BYTES = 30 * 1024; 

      do {
        webpBlob = await new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob), 'image/webp', quality);
        });
        quality -= 0.1;
      } while (webpBlob && webpBlob.size > MAX_BYTES && quality >= 0.4);

      if (!webpBlob) throw new Error('Canvas to Blob failed');

      const fileNameOnly = `${Date.now()}.webp`; 
      const webpFile = new File([webpBlob], fileNameOnly, { type: 'image/webp' });

      setSelectedFile(webpFile);
      setFormData(prev => ({ ...prev, image_name: URL.createObjectURL(webpFile) }));
      
      setIsCropModalOpen(false);
      setImageToCrop(null);

    } catch (e: any) {
      showAlert('error', 'การตัดรูปภาพล้มเหลว', e.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category_id) { 
        showAlert('warning', 'ข้อมูลไม่ครบถ้วน', 'กรุณากรอกชื่อเมนู ราคา และหมวดหมู่ให้ครบถ้วน'); 
        return; 
    }
    
    setIsSubmitting(true);
    try {
      let finalImageName = formData.image_name;
      let oldImageNameToDelete = null; 

      if (selectedFile) {
        setUploading(true); 
        const apiFormData = new FormData();
        apiFormData.append("file", selectedFile);
        apiFormData.append("folder", brandId || "system"); 

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: apiFormData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Upload to R2 failed');

        finalImageName = data.fileName;

        if (editId) {
            const currentProduct = products.find(p => p.id === editId);
            if (currentProduct && currentProduct.image_name) {
                oldImageNameToDelete = currentProduct.image_name;
            }
        }
      }

      if (finalImageName.startsWith('blob:')) {
          finalImageName = '';
      }

      // 🌟 เพิ่ม options เข้าไปใน payload ที่จะส่งไปบันทึก
      const payload = {
        id: editId,
        name: formData.name, 
        description: formData.description,
        price: parseFloat(formData.price),
        price_special: formData.price_special ? parseFloat(formData.price_special) : null,
        price_jumbo: formData.price_jumbo ? parseFloat(formData.price_jumbo) : null,
        category_id: formData.category_id, 
        image_name: finalImageName, 
        is_recommended: formData.is_recommended,
        options: formData.options // 👈 เพิ่มบรรทัดนี้ครับเฮีย!
      };

      const res = await upsertProductAction(payload);
      if (!res.success) throw new Error(res.error);

      if (oldImageNameToDelete) {
          fetch('/api/delete-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileName: oldImageNameToDelete })
          }).catch(err => console.error("Failed to delete old image:", err));
      }

      if (editId) {
        setProducts(prev => prev.map(p => p.id === editId ? { ...p, ...res.data } : p));
      } else {
        setProducts(prev => [res.data, ...prev]);
      }
      
      setIsModalOpen(false);
      setSelectedFile(null); 
      showAlert('success', 'บันทึกสำเร็จ', `เมนู ${formData.name} ได้รับการอัปเดตแล้ว`);

    } catch (error: any) { 
        showAlert('error', 'เกิดข้อผิดพลาด', error.message); 
    } finally { 
        setIsSubmitting(false); 
        setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const product = products.find(p => p.id === id);
    const isConfirmed = await showConfirm(
      'ยืนยันการลบเมนู?',
      'คุณต้องการลบรายการนี้ใช่หรือไม่?',
      'ลบทิ้ง',
      'ยกเลิก',
      'error'
    );

    if (!isConfirmed) return;
    
    const oldProducts = [...products];
    setProducts(prev => prev.filter((p: any) => p.id !== id));

    const res = await deleteProductAction(id);
    if (!res.success) {
        showAlert('error', 'ลบไม่สำเร็จ', res.error);
        setProducts(oldProducts);
    } else {
        if (product && product.image_name) {
             fetch('/api/delete-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ fileName: product.image_name })
             }).catch(err => console.error("Failed to delete image:", err));
        }
        showAlert('success', 'ลบเรียบร้อย', 'เมนูถูกนำออกจากร้านแล้ว');
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const oldProducts = [...products];
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: !currentStatus } : p));

    const res = await toggleProductStatusAction(id, !currentStatus);
    if (!res.success) {
        showAlert('error', 'อัปเดตสถานะล้มเหลว', 'กรุณาลองใหม่อีกครั้ง');
        setProducts(oldProducts);
    }
  };

  const openModal = (product: Product | null = null) => {
    setEditId(product ? product.id : null);
    setSelectedFile(null); 
    setFormData({
      name: product?.name || '', 
      description: product?.description || '',
      price: product?.price.toString() || '',
      price_special: product?.price_special?.toString() || '',
      price_jumbo: product?.price_jumbo?.toString() || '',
      category_id: product?.category_id || (categories[0]?.id || ''),
      image_name: product?.image_name || '',
      is_recommended: product?.is_recommended || false,
      options: product?.options || [] // 👈 ดึงค่าเก่ามาใส่ หรือให้เป็น array ว่างถ้าสร้างใหม่
    });
    setIsModalOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategoryId === 'ALL' || p.category_id === selectedCategoryId;
        return matchesSearch && matchesCategory;
      });
  }, [products, searchTerm, selectedCategoryId]);

  return {
    products, categories, loading, brandId,
    selectedCategoryId, setSelectedCategoryId,
    searchTerm, setSearchTerm,
    isModalOpen, setIsModalOpen, isSubmitting, editId, uploading,
    formData, setFormData, fileInputRef,
    filteredProducts,
    getImageUrl, handleImageUpload, handleSave, handleDelete, handleToggle, openModal,
    imageToCrop, setImageToCrop, isCropModalOpen, setIsCropModalOpen,
    setCroppedAreaPixels, handleCropComplete
  };
}