// hooks/useProductMaster.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
    getMasterProducts, 
    getMasterCategories, 
    createMasterProduct, 
    updateMasterProduct, 
    deleteMasterProduct, 
    toggleProductStatus,
    createMasterCategory 
} from '@/app/actions/productMasterActions';
import getCroppedImg from '@/app/utils/cropImage'; 
import { useGlobalAlert } from '@/components/providers/GlobalAlertProvider';

const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

export function useProductMaster() {
  const { showAlert, showConfirm } = useGlobalAlert(); // ✅ เอา showConfirm มาใช้ตอนลบด้วย
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandId, setBrandId] = useState<string | null>(null); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [initialStock, setInitialStock] = useState(0);

  const defaultForm = {
    name: '', barcode: '', sku: '',
    price: '', cost_price: '', category_id: '',
    image_url: '', is_active: true
  };
  const [formData, setFormData] = useState<any>(defaultForm);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isCatSubmitting, setIsCatSubmitting] = useState(false);
  const [catFormData, setCatFormData] = useState({ name: '', sort_order: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); 
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    fetchData();
    fetchBrandId();
  }, []);

  const fetchBrandId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
        if (profile) setBrandId(profile.brand_id);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        getMasterProducts(),
        getMasterCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchTerm)) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchCategory = selectedCategoryId === 'ALL' || p.category_id === selectedCategoryId;
    return matchSearch && matchCategory;
  });

  const openModal = (product?: any) => {
    if (product) {
      setEditId(product.id);
      setSelectedFile(null); 
      setFormData({
        name: product.name,
        barcode: product.barcode || '',
        sku: product.sku || '',
        price: product.price,
        cost_price: product.cost_price || '',
        category_id: product.category_id || '',
        image_url: product.image_url || '',
        is_active: product.is_active
      });
      setInitialStock(0); 
    } else {
      setEditId(null);
      setSelectedFile(null); 
      setFormData(defaultForm);
      setInitialStock(0);
    }
    setIsModalOpen(true);
  };

  const getImageUrl = (imageName: string | null) => {
    if (!imageName) return null;
    if (imageName.startsWith('blob:')) return imageName; 
    if (imageName.startsWith('http')) return imageName;
    return `${CDN_URL}/${imageName}`; 
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageToCrop(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
      setIsCropModalOpen(true);
      e.target.value = '';
    }
  };

  const handleCropComplete = useCallback(async () => {
  if (!imageToCrop || !croppedAreaPixels) return;
  
  try {
    setUploading(true);
    setIsCropModalOpen(false);

    // 1. ตัดรูปตามพิกัดที่เลือก
    const croppedImageURL = await getCroppedImg(imageToCrop, croppedAreaPixels);
    const image = await createImage(croppedImageURL);
    
    // 2. สร้าง Canvas เพื่อปรับขนาดรูป (แนะนำ 600x600 px เพื่อความชัดแต่ไฟล์เล็ก)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    const TARGET_SIZE = 600; 
    canvas.width = TARGET_SIZE;
    canvas.height = TARGET_SIZE;

    ctx.drawImage(image, 0, 0, TARGET_SIZE, TARGET_SIZE);

    // 3. 🚀 ลูปบีบอัดไฟล์ให้เหลือ <= 25KB
    let quality = 0.9; // เริ่มที่คุณภาพ 90%
    let webpBlob: Blob | null = null;
    const MAX_BYTES = 25 * 1024; // 25KB เป๊ะๆ

    do {
      webpBlob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/webp', quality);
      });
      quality -= 0.1; // ลดคุณภาพทีละ 10% ถ้าไฟล์ยังใหญ่เกิน
    } while (webpBlob && webpBlob.size > MAX_BYTES && quality >= 0.1);

    if (!webpBlob) throw new Error('การบีบอัดล้มเหลว');

    console.log(`✅ บีบอัดสำเร็จ! ขนาดไฟล์: ${(webpBlob.size / 1024).toFixed(2)} KB`);

    // 4. เตรียมไฟล์เพื่อรออัปโหลด
    const fileName = `retail_${Date.now()}.webp`;
    const webpFile = new File([webpBlob], fileName, { type: 'image/webp' });

    setSelectedFile(webpFile);
    setFormData((prev: any) => ({ ...prev, image_url: URL.createObjectURL(webpFile) }));
    
  } catch (error) {
    console.error('Compression Error:', error);
    showAlert('error', 'ประมวลผลรูปไม่สำเร็จ', 'ระบบไม่สามารถบีบอัดรูปภาพได้');
  } finally {
    setUploading(false);
    setImageToCrop(null);
  }
}, [imageToCrop, croppedAreaPixels, showAlert]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
        showAlert('warning', 'ข้อมูลไม่ครบ', 'กรุณากรอกชื่อสินค้าและราคาให้ครบถ้วน');
        return;
    }

    setIsSubmitting(true);
    try {
      let finalImageName = formData.image_url;
      let oldImageNameToDelete = null;

      if (selectedFile) {
        setUploading(true);
        const apiFormData = new FormData();
        apiFormData.append("file", selectedFile);
        apiFormData.append("folder", brandId || "retail_master"); 

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: apiFormData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'UPLOAD_FAILED');

        finalImageName = data.fileName;

        if (editId) {
            const currentProduct = products.find(p => p.id === editId);
            if (currentProduct && currentProduct.image_url) {
                oldImageNameToDelete = currentProduct.image_url;
            }
        }
      }

      if (finalImageName.startsWith('blob:')) {
          finalImageName = '';
      }

      const payloadToSave = { ...formData, image_url: finalImageName };
      
      let result;
      if (editId) {
        result = await updateMasterProduct(editId, payloadToSave);
      } else {
        result = await createMasterProduct(payloadToSave, initialStock);
      }

      if (!result.success) throw new Error(result.error);

      if (oldImageNameToDelete) {
          fetch('/api/delete-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileName: oldImageNameToDelete })
          }).catch(err => console.error("Failed to delete old image:", err));
      }

      showAlert('success', 'บันทึกสำเร็จ', 'อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว');
      await fetchData(); 
      setIsModalOpen(false);
      setSelectedFile(null);

    } catch (error: any) {
      // ✅ ศูนย์รวมแปลภาษา Error ให้มนุษย์อ่านรู้เรื่อง
      const errMessage = error.message || '';
      
      // ดักบาร์โค้ดซ้ำ
      if (errMessage.includes('product_master_barcode_key') || errMessage.includes('product_master_brand_barcode_unique')) {
          showAlert('error', 'บาร์โค้ดซ้ำ!', `รหัสบาร์โค้ดนี้ (${formData.barcode}) มีอยู่ในร้านของคุณแล้ว กรุณาใช้รหัสอื่นครับ`);
      } 
      // ✅ เพิ่มตัวดัก SKU ซ้ำตรงนี้ครับ!
      else if (errMessage.includes('product_master_brand_sku_unique')) {
          showAlert('error', 'SKU ซ้ำ!', `รหัส SKU นี้ (${formData.sku}) มีอยู่ในระบบแล้ว กรุณาตั้งรหัสใหม่ครับ`);
      }
      else if (errMessage === 'UPLOAD_FAILED') {
          showAlert('error', 'อัปโหลดรูปไม่สำเร็จ', 'ไม่สามารถส่งรูปไปที่ Server ได้ กรุณาเช็คอินเทอร์เน็ต');
      }
      else {
          showAlert('error', 'ระบบขัดข้อง', `พังเพราะ: ${errMessage}`);
      }
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  const handleCatSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCatSubmitting(true);
    try {
      const result = await createMasterCategory(catFormData);
      if (result.success) {
        setCategories((prev) => [...prev, result.data].sort((a, b) => a.sort_order - b.sort_order));
        setFormData((prev: any) => ({ ...prev, category_id: result.data.id }));
        setIsCatModalOpen(false);
        setCatFormData({ name: '', sort_order: 0 });
        showAlert('success', 'สำเร็จ', 'สร้างหมวดหมู่ใหม่เรียบร้อยแล้ว');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      showAlert('error', 'สร้างหมวดหมู่ไม่สำเร็จ', error.message);
    } finally {
      setIsCatSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    // ✅ เปลี่ยนจาก confirm ธรรมดา เป็น Global Alert ของพี่
    const isConfirmed = await showConfirm(
        'ยืนยันการลบ?',
        'คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้? ข้อมูลจะหายไปถาวรนะ',
        'ลบทิ้งเลย',
        'ยกเลิก',
        'error'
    );
    
    if (!isConfirmed) return;

    try {
      const product = products.find(p => p.id === id);
      const result = await deleteMasterProduct(id);
      
      if (result.success) {
          setProducts(products.filter(p => p.id !== id));
          
          if (product && product.image_url) {
              fetch('/api/delete-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ fileName: product.image_url })
              }).catch(err => console.error("Failed to delete image:", err));
          }
          showAlert('success', 'ลบสำเร็จ', 'นำสินค้าออกจากระบบแล้ว');
      } else {
          throw new Error(result.error);
      }
    } catch (error: any) {
        if(error.message.includes('foreign key constraint')) {
            showAlert('error', 'ลบไม่ได้', 'สินค้านี้อาจมีการผูกกับประวัติสต็อกไว้ครับ');
        } else {
            showAlert('error', 'ลบไม่สำเร็จ', error.message);
        }
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const oldProducts = [...products];
    setProducts(products.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
    try {
      const result = await toggleProductStatus(id, currentStatus);
      if (!result.success) throw new Error();
    } catch (error) {
      setProducts(oldProducts); // คืนค่าเดิมถ้าพัง
      showAlert('error', 'อัปเดตไม่สำเร็จ', 'สลับสถานะไม่ได้ กรุณาลองใหม่');
    }
  };

  return {
    products, filteredProducts, categories, loading,
    searchTerm, setSearchTerm, selectedCategoryId, setSelectedCategoryId,
    isModalOpen, setIsModalOpen, isSubmitting, editId, uploading,
    formData, setFormData, initialStock, setInitialStock,
    fileInputRef, getImageUrl, handleImageUpload,
    handleSave, handleDelete, handleToggle, openModal,
    imageToCrop, isCropModalOpen, setIsCropModalOpen,
    crop, setCrop, zoom, setZoom,
    setCroppedAreaPixels, handleCropComplete,
    isCatModalOpen, setIsCatModalOpen, isCatSubmitting, catFormData, setCatFormData, handleCatSave
  };
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });