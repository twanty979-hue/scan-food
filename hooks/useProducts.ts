// hooks/useProducts.ts
import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase'; // ใช้ Client สำหรับ Storage Upload
import { 
    getProductsInitialDataAction, 
    upsertProductAction, 
    deleteProductAction, 
    toggleProductStatusAction 
} from '@/app/actions/productActions';

// Config
const CDN_URL = "https://xvhibjejvbriotfpunvv.supabase.co/storage/v1/object/public/menus/";

export type Category = { id: string; name: string };
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
};

export function useProducts() {
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandId, setBrandId] = useState<string | null>(null);

  // Filter States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', price_special: '', price_jumbo: '',
    category_id: '', image_name: '', is_recommended: false
  });

  // --- Init ---
  const fetchAllData = async () => {
    setLoading(true);
    const res = await getProductsInitialDataAction();
    if (res.success) {
        setBrandId(res.brandId!);
        setCategories(res.categories || []); // ถ้าไม่มีหมวดหมู่ ให้ใส่ตะกร้าเปล่า
setProducts(res.products || []);     // ถ้าไม่มีสินค้า ให้ใส่ตะกร้าเปล่า
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- Helper: Get Image URL ---
  const getImageUrl = (imageName: string | null) => {
    if (!imageName || !brandId) return null;
    if (imageName.startsWith('http')) return imageName;
    return `${CDN_URL}${brandId}/${imageName}`;
  };

  // --- Handlers ---

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      // WebP Compression (Client Side)
      const webpBlob = await new Promise<Blob>((resolve, reject) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error('Conversion failed')); }, 'image/webp', 0.8);
          } else reject(new Error('Canvas failed'));
        };
        img.onerror = (err) => reject(err);
        img.src = URL.createObjectURL(file);
      });
      
      const fileNameOnly = `${Date.now()}.webp`; 
      const uploadPath = `${brandId}/${fileNameOnly}`; 
      
      // Upload to Storage (Client Side)
      const { error: uploadError } = await supabase.storage.from('menus').upload(uploadPath, webpBlob, { contentType: 'image/webp', upsert: true });
      if (uploadError) throw uploadError;

      setFormData(prev => ({ ...prev, image_name: fileNameOnly }));

    } catch (error: any) { 
        alert('Upload failed: ' + error.message); 
    } finally { 
        setUploading(false); 
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category_id) { 
        alert('กรุณากรอกข้อมูลสำคัญให้ครบ'); 
        return; 
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        id: editId,
        name: formData.name, 
        description: formData.description,
        price: parseFloat(formData.price),
        price_special: formData.price_special ? parseFloat(formData.price_special) : null,
        price_jumbo: formData.price_jumbo ? parseFloat(formData.price_jumbo) : null,
        category_id: formData.category_id, 
        image_name: formData.image_name,
        is_recommended: formData.is_recommended
      };

      const res = await upsertProductAction(payload);
      
      if (!res.success) throw new Error(res.error);

      // Update Local State
      if (editId) {
        setProducts(prev => prev.map(p => p.id === editId ? { ...p, ...res.data } : p));
      } else {
        setProducts(prev => [res.data, ...prev]);
      }
      setIsModalOpen(false);

    } catch (error: any) { 
        alert('Error: ' + error.message); 
    } finally { 
        setIsSubmitting(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันลบเมนูนี้?')) return;
    
    // Optimistic Update
    const oldProducts = [...products];
    setProducts(prev => prev.filter((p: any) => p.id !== id));

    const res = await deleteProductAction(id);
    if (!res.success) {
        alert('Error deleting: ' + res.error);
        setProducts(oldProducts);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    // Optimistic Update
    const oldProducts = [...products];
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: !currentStatus } : p));

    const res = await toggleProductStatusAction(id, !currentStatus);
    if (!res.success) {
        alert('Error updating status');
        setProducts(oldProducts);
    }
  };

  const openModal = (product: Product | null = null) => {
    setEditId(product ? product.id : null);
    setFormData({
      name: product?.name || '', 
      description: product?.description || '',
      price: product?.price.toString() || '',
      price_special: product?.price_special?.toString() || '',
      price_jumbo: product?.price_jumbo?.toString() || '',
      category_id: product?.category_id || (categories[0]?.id || ''),
      image_name: product?.image_name || '',
      is_recommended: product?.is_recommended || false
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
    getImageUrl, handleImageUpload, handleSave, handleDelete, handleToggle, openModal
  };
}