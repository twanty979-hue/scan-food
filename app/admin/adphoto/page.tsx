//app/admin/adphoto/page.tsx
'use client'

import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Cropper from 'react-easy-crop'

const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

// Helper function สร้าง Image object สำหรับ Crop (อยู่นอก Component ได้)
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })

// --- Types ---
type Category = {
  id: number
  name: string
}

type ImageData = {
  id: number
  name: string
  url: string
  price: number | null 
  category_id: number | null
  categoriesphotoadmin?: {
    name: string
  }
}

export default function AdminPhotoPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<ImageData[]>([])
  
  // --- UI States ---
  const [showCatModal, setShowCatModal] = useState(false)
  const [showImgModal, setShowImgModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false) 
  const [activeCategory, setActiveCategory] = useState<number | 'ALL'>('ALL')

  // ✅ แก้ไขจุดที่ 1: ย้าย Hook มาไว้ข้างใน Body ของ Component
  const [isEditingExistingImage, setIsEditingExistingImage] = useState(false);

  // --- Form States (Add) ---
  const [newCatName, setNewCatName] = useState('')
  const [isCatLoading, setIsCatLoading] = useState(false)

  const [imgName, setImgName] = useState('')
  const [imgPrice, setImgPrice] = useState('') 
  const [selectedCatId, setSelectedCatId] = useState<string>('')
  const [isImgUploading, setIsImgUploading] = useState(false)

  // 🌟 State สำหรับระบบ Crop & อัปโหลด
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  // --- Form States (Edit) ---
  const [editingImage, setEditingImage] = useState<ImageData | null>(null) 
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editCatId, setEditCatId] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // --- 1. Fetch Data ---
  const fetchData = async () => {
    const { data: catData } = await supabase
      .from('categoriesphotoadmin')
      .select('*')
      .order('id', { ascending: true })
    if (catData) setCategories(catData)

    const { data: imgData } = await supabase
      .from('images')
      .select('*, categoriesphotoadmin(name)')
      .order('id', { ascending: false })
    if (imgData) setImages(imgData as unknown as ImageData[])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredImages = activeCategory === 'ALL' 
    ? images 
    : images.filter(img => img.category_id === activeCategory)

  // --- 2. Logic: เพิ่มหมวดหมู่ ---
  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault()
    if (!newCatName) return
    setIsCatLoading(true)
    try {
      const { error } = await supabase.from('categoriesphotoadmin').insert([{ name: newCatName }])
      if (error) throw error
      alert('เพิ่มหมวดหมู่สำเร็จ!')
      setNewCatName('')
      setShowCatModal(false)
      fetchData()
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setIsCatLoading(false)
    }
  }

  // ✅ แก้ไขจุดที่ 2: ปรับ handleFileChange ให้รองรับการเปลี่ยนรูปแบบแก้ไข
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const imageUrl = URL.createObjectURL(file);
        setImageToCrop(imageUrl);
        setIsCropModalOpen(true); 
        
        // 🌟 ระบุว่าเป็นการแก้ไขรูปเดิมหรือไม่
        if (showEditModal) {
            setIsEditingExistingImage(true);
        } else {
            setIsEditingExistingImage(false);
        }
        e.target.value = ''; 
    }
  }

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
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
        croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0, TARGET_SIZE, TARGET_SIZE
      );

      let quality = 0.9;
      let webpBlob: Blob | null = null;
      const MAX_BYTES = 30 * 1024; 

      do {
        webpBlob = await new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/webp', quality));
        quality -= 0.1;
      } while (webpBlob && webpBlob.size > MAX_BYTES && quality >= 0.4);

      if (!webpBlob) throw new Error('Canvas to Blob failed');

      const fileNameOnly = `master_${Date.now()}.webp`; 
      const webpFile = new File([webpBlob], fileNameOnly, { type: 'image/webp' });

      setSelectedFile(webpFile);
      setPreviewUrl(URL.createObjectURL(webpFile));
      setIsCropModalOpen(false);
      setImageToCrop(null);
    } catch (e: any) {
      alert('การตัดรูปภาพล้มเหลว: ' + e.message);
    }
  }

  const handleAddImage = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !imgName) return alert('กรุณากรอกข้อมูลและเลือกรูปภาพให้ครบ')
    
    setIsImgUploading(true)
    try {
      const apiFormData = new FormData()
      apiFormData.append('file', selectedFile)
      apiFormData.append('folder', 'master_assets') 

      const response = await fetch('/api/upload', { method: 'POST', body: apiFormData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Upload to R2 failed')

      const publicUrl = `${CDN_URL}/${data.fileName}`
      
      const { error: dbError } = await supabase.from('images').insert([{
        name: imgName, 
        url: publicUrl, 
        price: imgPrice ? parseFloat(imgPrice) : 0,
        category_id: selectedCatId ? parseInt(selectedCatId) : null
      }])
      if (dbError) throw dbError

      alert('บันทึกรูปภาพสำเร็จ!')
      setImgName(''); setImgPrice(''); setSelectedCatId(''); setSelectedFile(null); setPreviewUrl('');
      setShowImgModal(false)
      fetchData()
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setIsImgUploading(false)
    }
  }

  const openEditModal = (img: ImageData) => {
    setEditingImage(img)
    setEditName(img.name)
    setEditPrice(img.price ? img.price.toString() : '')
    setEditCatId(img.category_id ? img.category_id.toString() : '')
    setPreviewUrl('') // เคลียร์รูปเก่าถ้ามีค้าง
    setSelectedFile(null)
    setShowEditModal(true)
  }

  // ✅ แก้ไขจุดที่ 3: ปรับปรุง handleUpdateImage ให้รองรับการเปลี่ยนรูปใหม่
  const handleUpdateImage = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingImage) return
    setIsUpdating(true)
    try {
      let finalUrl = editingImage.url;
      let oldImageToDelete = null;

      // 🌟 ถ้ามีการเลือกรูปใหม่ (selectedFile) ให้โหลดขึ้น R2 ก่อน
      if (selectedFile) {
        const apiFormData = new FormData()
        apiFormData.append('file', selectedFile)
        apiFormData.append('folder', 'master_assets')

        const response = await fetch('/api/upload', { method: 'POST', body: apiFormData })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)

        finalUrl = `${CDN_URL}/${data.fileName}`;
        oldImageToDelete = editingImage.url; // จำ URL เก่าไว้เพื่อตามไปลบ
      }

      const { error } = await supabase
        .from('images')
        .update({
          name: editName,
          price: editPrice ? parseFloat(editPrice) : 0,
          category_id: editCatId ? parseInt(editCatId) : null,
          url: finalUrl // อัปเดต URL (ถ้ามีใหม่)
        })
        .eq('id', editingImage.id)

      if (error) throw error

      // 🗑️ ลบรูปเก่าใน R2 ทิ้ง (ถ้าเปลี่ยนรูปใหม่สำเร็จ)
      if (oldImageToDelete && oldImageToDelete.includes('master_assets')) {
          const oldFileName = oldImageToDelete.split('/').pop();
          fetch('/api/delete-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileName: `master_assets/${oldFileName}` })
          }).catch(err => console.error("Clean up failed"));
      }

      alert('แก้ไขข้อมูลสำเร็จ!')
      setShowEditModal(false)
      setPreviewUrl('');
      setSelectedFile(null);
      fetchData() 
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!editingImage) return
    if (!confirm('ยืนยันที่จะลบรูปภาพนี้? (กู้คืนไม่ได้นะ)')) return

    setIsUpdating(true)
    try {
        const { error } = await supabase.from('images').delete().eq('id', editingImage.id)
        if (error) throw error
        
        const fileName = editingImage.url.split('/').pop();
        if (fileName && editingImage.url.includes('master_assets')) {
             fetch('/api/delete-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ fileName: `master_assets/${fileName}` })
             }).catch(err => console.error("Failed to delete image from R2:", err));
        }

        alert('ลบรูปภาพเรียบร้อย')
        setShowEditModal(false)
        fetchData()
    } catch (error: any) {
        alert('Error: ' + error.message)
    } finally {
        setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      
      {/* --- Header --- */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">คลังรูปภาพอาหาร</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCatModal(true)}
            className="bg-white border-2 border-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl shadow-sm hover:border-gray-300 hover:bg-gray-50 transition flex items-center gap-2"
          >
            <span>📁</span> จัดการหมวดหมู่
          </button>
          <button 
            onClick={() => setShowImgModal(true)}
            className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition flex items-center gap-2 active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            เพิ่มรูปภาพใหม่
          </button>
        </div>
      </div>

      {/* --- Filter Tabs --- */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeCategory === 'ALL' ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-500 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            ทั้งหมด ({images.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* --- Gallery Display --- */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredImages.map((img) => (
          <div key={img.id} onClick={() => openEditModal(img)} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col cursor-pointer hover:-translate-y-1">
            <div className="aspect-square overflow-hidden bg-gray-100 relative">
              <img src={img.url} alt={img.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
              <div className="absolute top-3 right-3 bg-white/90 w-8 h-8 rounded-full flex items-center justify-center shadow-md text-gray-600 group-hover:text-blue-600 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-1.5 flex-1 justify-between">
              <div>
                {img.categoriesphotoadmin && (
                  <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    {img.categoriesphotoadmin.name}
                  </span>
                )}
                <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mt-2 leading-tight">{img.name}</h3>
              </div>
              <p className="text-red-500 font-black text-lg">฿ {img.price?.toLocaleString() || '0'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL 1: เพิ่มรูปภาพ --- */}
      {showImgModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></span>
                เพิ่มรูปภาพส่วนกลาง
              </h2>
              <button onClick={() => setShowImgModal(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500">✕</button>
            </div>
            
            <form onSubmit={handleAddImage} className="p-6 space-y-5">
              <div className="flex justify-center">
                <div className="relative group cursor-pointer w-48 h-48" onClick={() => document.getElementById('add-file-input')?.click()}>
                    <div className={`w-full h-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden relative ${previewUrl ? 'border-transparent bg-gray-900' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'}`}>
                      {previewUrl ? (
                          <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                          <div className="text-gray-400 flex flex-col items-center gap-2 group-hover:text-blue-500">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                              <span className="text-xs font-bold uppercase tracking-wider">อัปโหลดรูป 1:1</span>
                          </div>
                      )}
                      <input type="file" id="add-file-input" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อเมนูอาหาร</label>
                    <input type="text" value={imgName} onChange={(e) => setImgName(e.target.value)} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 mt-1.5 font-bold text-gray-800 outline-none" placeholder="เช่น กะเพรา" required />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ราคาแนะนำ</label>
                    <input type="number" value={imgPrice} onChange={(e) => setImgPrice(e.target.value)} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 mt-1.5 font-bold text-gray-800 outline-none" placeholder="0" />
                </div>
              </div>
              
              <button type="submit" disabled={isImgUploading} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-700 transition-all">
                {isImgUploading ? 'กำลังอัปโหลด...' : 'บันทึกเข้าคลังภาพ'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✅ แก้ไขจุดที่ 4: เพิ่ม UI การเลือกรูปภาพใหม่ใน Modal แก้ไข */}
      {showEditModal && editingImage && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-800">แก้ไขข้อมูลรูปภาพ</h2>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">✕</button>
            </div>

            <form onSubmit={handleUpdateImage} className="p-6 space-y-5">
              <div className="flex justify-center mb-6">
                {/* 🌟 คลิกที่รูปเพื่อเปลี่ยนรูปใหม่ */}
                <div className="relative group cursor-pointer w-32 h-32" onClick={() => document.getElementById('edit-file-input')?.click()}>
                    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border-4 border-gray-50 bg-gray-900">
                        <img src={previewUrl || editingImage.url} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">เปลี่ยนรูป</span>
                        </div>
                    </div>
                    <input type="file" id="edit-file-input" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อรูปภาพ</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 mt-1.5 font-bold text-gray-800 outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ราคา (บาท)</label>
                        <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 mt-1.5 font-bold text-gray-800 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">หมวดหมู่</label>
                        <select value={editCatId} onChange={(e) => setEditCatId(e.target.value)} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 mt-1.5 font-bold text-gray-800 outline-none">
                            <option value="">-- ไม่ระบุ --</option>
                            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                        </select>
                    </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={handleDeleteImage} disabled={isUpdating} className="px-5 py-3.5 bg-red-50 text-red-600 font-bold rounded-xl flex items-center justify-center">
                    ลบทิ้ง
                </button>
                <button type="submit" disabled={isUpdating} className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg">
                    {isUpdating ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: จัดการหมวดหมู่ --- */}
      {showCatModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-800">จัดการหมวดหมู่</h2>
              <button onClick={() => setShowCatModal(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">✕</button>
            </div>
            <div className="p-6">
                <form onSubmit={handleAddCategory} className="flex gap-3 mb-6">
                <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="ชื่อหมวดหมู่ใหม่..." className="flex-1 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 font-bold outline-none" required />
                <button type="submit" disabled={isCatLoading} className="bg-gray-800 text-white font-bold px-6 py-3 rounded-xl">เพิ่ม</button>
                </form>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {categories.map(c => (<span key={c.id} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-bold">{c.name}</span>))}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: Crop รูปภาพ --- */}
      {isCropModalOpen && imageToCrop && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setIsCropModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-800">จัดตำแหน่งรูปภาพ</h3>
              <button onClick={() => setIsCropModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500">✕</button>
            </div>
            <div className="relative w-full h-80 bg-gray-50">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                showGrid={true}
              />
            </div>
            <div className="p-6 bg-white">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-400 text-sm font-bold">Zoom</span>
                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
              <button onClick={handleCropSave} className="w-full py-3.5 rounded-xl font-bold text-white bg-blue-600 shadow-lg">
                ยืนยันการตัดรูป
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}