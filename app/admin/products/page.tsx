'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Cropper from 'react-easy-crop';

interface Category {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

interface Product {
  id: string;
  category_id: string | null;
  barcode: string | null;
  sku: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  cost_price: number;
  is_active: boolean;
}

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  // Form states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    barcode: '',
    sku: '',
    price: 0,
    cost_price: 0,
    description: '',
    image_url: '',
    is_active: true
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [cropModal, setCropModal] = useState<{ open: boolean; image: string | null }>({ open: false, image: null });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropModal({ open: true, image: reader.result as string });
      });
      reader.readAsDataURL(e.target.files[0]);
    }
    e.target.value = '';
  };

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<File> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      let quality = 0.8;
      const targetSize = 60 * 1024; // 60KB
      const loop = () => {
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size > targetSize && quality > 0.1) {
              quality -= 0.1;
              loop();
            } else if (blob) {
              resolve(new File([blob], `product_${Date.now()}.webp`, { type: 'image/webp' }));
            } else {
              reject(new Error("Canvas to Blob failed"));
            }
          },
          'image/webp',
          quality
        );
      };
      loop();
    });
  };

  const handleConfirmCrop = async () => {
    if (!cropModal.image || !croppedAreaPixels) return;
    setUploadingImage(true);
    try {
      const file = await getCroppedImg(cropModal.image, croppedAreaPixels);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "admin-products");

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd
      });

      if (!res.ok) throw new Error("อัปโหลดรูปภาพล้มเหลว");
      const data = await res.json();
      if (data.success) {
        setProductForm(prev => ({ ...prev, image_url: data.url }));
        setCropModal({ open: false, image: null });
      } else {
        throw new Error(data.error || "อัปโหลดรูปภาพล้มเหลว");
      }
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setUploadingImage(false);
    }
  };

  const downloadCSVTemplate = () => {
    const csvContent = 'name,category_name,barcode,sku,price,cost_price,description,image_url\n' +
      'น้ำดื่มสิงห์ 600 มล.,เครื่องดื่ม,8851013710118,DRINK-001,10.00,6.00,น้ำดื่มสะอาดตราสิงห์,https://img.pos-foodscan.com/sample.png\n' +
      'ข้าวผัดหมู,อาหารจานด่วน,,FOOD-002,45.00,25.00,ข้าวผัดหมูใส่ไข่แสนอร่อย,\n';
    
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'admin_products_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const result = [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      // Handle commas inside quotes
      const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      const row = matches ? matches.map(val => val.trim().replace(/^"|"$/g, '')) : lines[i].split(',');
      
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      result.push(obj);
    }
    return result;
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        const rows = parseCSV(text);
        if (rows.length === 0) {
          alert('ไม่พบข้อมูลในไฟล์ CSV');
          return;
        }

        const categoryNames = Array.from(new Set(rows.map(r => r.category_name).filter(Boolean)));
        
        const { data: existingCats } = await supabase.from('admin_master_categories').select('*');
        const catMap = new Map<string, string>();
        existingCats?.forEach(c => catMap.set(c.name.toLowerCase(), c.id));

        for (const catName of categoryNames) {
          const key = catName.toLowerCase();
          if (!catMap.has(key)) {
            const { data: newCat, error } = await supabase
              .from('admin_master_categories')
              .insert({ name: catName, sort_order: 99 })
              .select()
              .single();
            if (error) throw error;
            catMap.set(key, newCat.id);
          }
        }

        const productsToInsert = rows.map(r => {
          const catId = r.category_name ? catMap.get(r.category_name.toLowerCase()) : null;
          return {
            category_id: catId || null,
            name: r.name,
            barcode: r.barcode || null,
            sku: r.sku || null,
            price: Number(r.price) || 0,
            cost_price: Number(r.cost_price) || 0,
            description: r.description || null,
            image_url: r.image_url || null,
            is_active: true
          };
        });

        const { error: insertError } = await supabase
          .from('admin_product_master')
          .insert(productsToInsert);

        if (insertError) throw insertError;

        alert(`นำเข้าสำเร็จ ${productsToInsert.length} รายการ!`);
        fetchData();
      };
      reader.readAsText(file);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการนำเข้าไฟล์ CSV');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    sort_order: 0,
    is_active: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('admin_product_master').select('*').order('created_at', { ascending: false }),
        supabase.from('admin_master_categories').select('*').order('sort_order', { ascending: true })
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Products CRUD
  const handleOpenProductModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        category_id: product.category_id || '',
        barcode: product.barcode || '',
        sku: product.sku || '',
        price: product.price,
        cost_price: product.cost_price,
        description: product.description || '',
        image_url: product.image_url || '',
        is_active: product.is_active
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        category_id: '',
        barcode: '',
        sku: '',
        price: 0,
        cost_price: 0,
        description: '',
        image_url: '',
        is_active: true
      });
    }
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        category_id: productForm.category_id || null,
        barcode: productForm.barcode || null,
        sku: productForm.sku || null,
        name: productForm.name,
        description: productForm.description || null,
        image_url: productForm.image_url || null,
        price: Number(productForm.price) || 0,
        cost_price: Number(productForm.cost_price) || 0,
        is_active: productForm.is_active
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('admin_product_master')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_product_master')
          .insert(payload);
        if (error) throw error;
      }
      setShowProductModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    }
  };

  const handleProductDelete = async (id: string) => {
    if (!confirm('ยืนยันลบสินค้านี้ใช่หรือไม่?')) return;
    try {
      const { error } = await supabase
        .from('admin_product_master')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error deleting product');
    }
  };

  // Categories CRUD
  const handleOpenCategoryModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        sort_order: category.sort_order,
        is_active: category.is_active
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        sort_order: 0,
        is_active: true
      });
    }
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: categoryForm.name,
        sort_order: Number(categoryForm.sort_order) || 0,
        is_active: categoryForm.is_active
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('admin_master_categories')
          .update(payload)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_master_categories')
          .insert(payload);
        if (error) throw error;
      }
      setShowCategoryModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error saving category');
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (!confirm('ยืนยันลบหมวดหมู่นี้ใช่หรือไม่? (สินค้าในหมวดหมู่นี้จะกลายเป็นไม่มีหมวดหมู่)')) return;
    try {
      const { error } = await supabase
        .from('admin_master_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A27] flex items-center gap-2">
            📦 จัดการสินค้าแอดมินกลาง
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            เพิ่มและจัดการรายการสินค้า/หมวดหมู่กลางที่ระบบอนุญาตให้แต่ละร้านค้าดึงไปใช้ได้
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'products'
              ? 'border-[#5F8565] text-[#2C4A34]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          สินค้า ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'categories'
              ? 'border-[#5F8565] text-[#2C4A34]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          หมวดหมู่ ({categories.length})
        </button>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5F8565]"></div>
        </div>
      ) : (
        <div>
          {/* Active Tab: Products */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#2C4A34]">รายการสินค้าทั้งหมด</h2>
                <div className="flex gap-2">
                  <button
                    onClick={downloadCSVTemplate}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
                    title="ดาวน์โหลดไฟล์ตัวอย่างสำหรับนำเข้าข้อมูล"
                  >
                    📥 ดาวน์โหลดเทมเพลต CSV
                  </button>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="hidden"
                    id="admin_csv_import"
                  />
                  <label
                    htmlFor="admin_csv_import"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    📤 นำเข้าไฟล์ CSV
                  </label>
                  <button
                    onClick={() => handleOpenProductModal()}
                    className="px-4 py-2 bg-[#5F8565] hover:bg-[#4E6E53] text-white rounded-xl font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
                  >
                    + เพิ่มสินค้า
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm bg-white">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-600">
                  <thead className="bg-[#FAF9F5] font-semibold text-[#2C4A34]">
                    <tr>
                      <th className="px-4 py-3">รูปภาพ</th>
                      <th className="px-4 py-3">ชื่อสินค้า</th>
                      <th className="px-4 py-3">หมวดหมู่</th>
                      <th className="px-4 py-3">บาร์โค้ด</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">ราคาขาย</th>
                      <th className="px-4 py-3">ราคาทุน</th>
                      <th className="px-4 py-3">สถานะ</th>
                      <th className="px-4 py-3">การทำงาน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-slate-400">
                          ไม่พบข้อมูลสินค้า
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => {
                        const catName = categories.find((c) => c.id === p.category_id)?.name || '-';
                        return (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  alt={p.name}
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-100 bg-slate-100"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-bold">
                                  ไม่มีรูป
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800">{p.name}</td>
                            <td className="px-4 py-3">{catName}</td>
                            <td className="px-4 py-3 font-mono text-xs">{p.barcode || '-'}</td>
                            <td className="px-4 py-3 font-mono text-xs">{p.sku || '-'}</td>
                            <td className="px-4 py-3 font-semibold text-[#1E3A27]">{p.price} ฿</td>
                            <td className="px-4 py-3 text-slate-500">{p.cost_price} ฿</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  p.is_active
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-rose-50 text-rose-600'
                                }`}
                              >
                                {p.is_active ? 'พร้อมใช้' : 'ปิดการใช้งาน'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleOpenProductModal(p)}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                                  title="แก้ไข"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleProductDelete(p.id)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                                  title="ลบ"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Active Tab: Categories */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#2C4A34]">รายการหมวดหมู่ทั้งหมด</h2>
                <button
                  onClick={() => handleOpenCategoryModal()}
                  className="px-4 py-2 bg-[#5F8565] hover:bg-[#4E6E53] text-white rounded-xl font-semibold text-sm shadow-sm transition-all flex items-center gap-2"
                >
                  + เพิ่มหมวดหมู่
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm bg-white">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-600">
                  <thead className="bg-[#FAF9F5] font-semibold text-[#2C4A34]">
                    <tr>
                      <th className="px-4 py-3">ชื่อหมวดหมู่</th>
                      <th className="px-4 py-3">ลำดับการจัดเรียง</th>
                      <th className="px-4 py-3">สถานะ</th>
                      <th className="px-4 py-3">การทำงาน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-400">
                          ไม่พบข้อมูลหมวดหมู่
                        </td>
                      </tr>
                    ) : (
                      categories.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-800">{c.name}</td>
                          <td className="px-4 py-3">{c.sort_order}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                c.is_active
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-rose-50 text-rose-600'
                              }`}
                            >
                              {c.is_active ? 'เปิดใช้งาน' : 'ปิดการใช้งาน'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenCategoryModal(c)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                                title="แก้ไข"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleCategoryDelete(c.id)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                                title="ลบ"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#1E3A27]">
                {editingProduct ? '✏️ แก้ไขสินค้าหลักแอดมิน' : '🆕 เพิ่มสินค้าใหม่แอดมิน'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อสินค้า *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5F8565]"
                  placeholder="เช่น ข้าวกะเพราหมูสับไข่ดาว"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">หมวดหมู่</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5F8565] bg-white"
                  >
                    <option value="">-- เลือกหมวดหมู่ --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">รูปภาพสินค้า</label>
                  <div className="flex gap-3 items-center">
                    {productForm.image_url ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 relative group flex-shrink-0 bg-slate-100">
                        <img src={productForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setProductForm(prev => ({ ...prev, image_url: '' }))}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                        >
                          ลบ
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px] font-bold bg-slate-50 flex-shrink-0">
                        ไม่มีรูป
                      </div>
                    )}
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="admin_prod_file"
                      />
                      <label
                        htmlFor="admin_prod_file"
                        className={`inline-block px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          uploadingImage ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        {uploadingImage ? 'กำลังอัปโหลด...' : '☁️ อัปโหลดรูปภาพ'}
                      </label>
                      <input
                        type="text"
                        value={productForm.image_url}
                        onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                        className="w-full px-3 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#5F8565]"
                        placeholder="หรือวางลิ้งก์ URL รูปภาพโดยตรงที่นี่..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">บาร์โค้ด</label>
                  <input
                    type="text"
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5F8565]"
                    placeholder="เช่น 885..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">SKU</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5F8565]"
                    placeholder="เช่น FO-G-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ราคาขายเริ่มต้น (฿) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5F8565]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ราคาทุนเริ่มต้น (฿)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.cost_price}
                    onChange={(e) => setProductForm({ ...productForm, cost_price: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5F8565]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">คำอธิบาย</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5F8565]"
                  placeholder="รายละเอียดสินค้า..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="prod_active"
                  checked={productForm.is_active}
                  onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                  className="rounded text-[#5F8565]"
                />
                <label htmlFor="prod_active" className="text-xs font-semibold text-slate-600 select-none">
                  เปิดใช้งานสำหรับนำเข้าร้านค้า
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-sm transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#5F8565] hover:bg-[#4E6E53] text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
                >
                  บันทึกสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#1E3A27]">
                {editingCategory ? '✏️ แก้ไขหมวดหมู่แอดมิน' : '🆕 เพิ่มหมวดหมู่ใหม่แอดมิน'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อหมวดหมู่ *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5F8565]"
                  placeholder="เช่น เครื่องดื่ม, ของหวาน"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ลำดับการแสดงผล</label>
                <input
                  type="number"
                  value={categoryForm.sort_order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#5F8565]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cat_active"
                  checked={categoryForm.is_active}
                  onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                  className="rounded text-[#5F8565]"
                />
                <label htmlFor="cat_active" className="text-xs font-semibold text-slate-600 select-none">
                  เปิดใช้งานสำหรับนำเข้าร้านค้า
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-sm transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#5F8565] hover:bg-[#4E6E53] text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
                >
                  บันทึกหมวดหมู่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Image Cropper Modal (1:1 Ratio) --- */}
      {cropModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden flex flex-col h-[80vh] shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-white">
              <div>
                <h3 className="font-bold text-slate-800 text-lg uppercase tracking-wider">
                  ✂️ ครอบตัดรูปภาพสินค้า (1:1)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  ปรับตำแหน่งและขนาดซูมของรูปภาพให้อยู่ในกรอบสี่เหลี่ยมจัตุรัสพอดี
                </p>
              </div>
              <button
                onClick={() => setCropModal({ open: false, image: null })}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="relative flex-1 bg-slate-100">
              <Cropper
                image={cropModal.image!}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                onZoomChange={setZoom}
                showGrid={true}
              />
            </div>

            <div className="p-6 bg-white border-t space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest min-w-[50px]">ซูมรูป</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.01}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#5F8565]"
                />
                <span className="text-xs font-bold text-[#5F8565] w-10 text-right">{Math.round(zoom * 100)}%</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCropModal({ open: false, image: null })}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all text-sm border border-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleConfirmCrop}
                  disabled={uploadingImage}
                  className="flex-[2] bg-[#5F8565] hover:bg-[#4E6E53] text-white py-3 rounded-xl font-bold tracking-wider shadow-md shadow-[#5F8565]/20 active:scale-98 transition-all disabled:opacity-50 text-sm"
                >
                  {uploadingImage ? 'กำลังอัปโหลด...' : 'ยืนยันครอบตัดรูปภาพ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
