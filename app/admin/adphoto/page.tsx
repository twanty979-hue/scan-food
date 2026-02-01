'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import imageCompression from 'browser-image-compression'

// --- Types ---
type Category = {
  id: number
  name: string
}

type ImageData = {
  id: number
  name: string
  url: string
  price: number | null // <--- เพิ่ม Type ราคา
  category_id: number | null
  categoriesphotoadmin?: {
    name: string
  }
}

export default function AdminPhotoPage() {
  // --- Data States ---
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<ImageData[]>([])
  
  // --- UI States ---
  const [showCatModal, setShowCatModal] = useState(false)
  const [showImgModal, setShowImgModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false) // <--- Modal แก้ไข
  const [activeCategory, setActiveCategory] = useState<number | 'ALL'>('ALL')

  // --- Form States (Add) ---
  const [newCatName, setNewCatName] = useState('')
  const [isCatLoading, setIsCatLoading] = useState(false)

  const [imgName, setImgName] = useState('')
  const [imgPrice, setImgPrice] = useState('') // <--- State ราคารูปใหม่
  const [selectedCatId, setSelectedCatId] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [isImgUploading, setIsImgUploading] = useState(false)

  // --- Form States (Edit) ---
  const [editingImage, setEditingImage] = useState<ImageData | null>(null) // <--- เก็บรูปที่กำลังแก้
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

  // --- Filter Logic ---
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

  // --- 3. Logic: เพิ่มรูปภาพ (WebP + Price) ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
  }

  const handleAddImage = async (e: FormEvent) => {
    e.preventDefault()
    if (!file || !imgName) return alert('กรุณากรอกข้อมูลให้ครบ')
    setIsImgUploading(true)
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true, fileType: 'image/webp'
      })
      const fileName = `img_${Date.now()}.webp`
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, compressedFile)
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName)
      
      const { error: dbError } = await supabase.from('images').insert([{
        name: imgName, 
        url: publicUrl, 
        price: imgPrice ? parseFloat(imgPrice) : 0, // <--- บันทึกราคา
        category_id: selectedCatId ? parseInt(selectedCatId) : null
      }])
      if (dbError) throw dbError

      alert('บันทึกรูปภาพสำเร็จ!')
      setImgName(''); setImgPrice(''); setSelectedCatId(''); setFile(null);
      setShowImgModal(false)
      fetchData()
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setIsImgUploading(false)
    }
  }

  // --- 4. Logic: เปิดหน้าต่างแก้ไข (Setup Edit) ---
  const openEditModal = (img: ImageData) => {
    setEditingImage(img)
    setEditName(img.name)
    setEditPrice(img.price ? img.price.toString() : '')
    setEditCatId(img.category_id ? img.category_id.toString() : '')
    setShowEditModal(true)
  }

  // --- 5. Logic: บันทึกการแก้ไข (Update) ---
  const handleUpdateImage = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingImage) return
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('images')
        .update({
          name: editName,
          price: editPrice ? parseFloat(editPrice) : 0,
          category_id: editCatId ? parseInt(editCatId) : null
        })
        .eq('id', editingImage.id) // อัปเดตเฉพาะ ID นี้

      if (error) throw error

      alert('แก้ไขข้อมูลสำเร็จ!')
      setShowEditModal(false)
      fetchData() // รีเฟรชข้อมูล
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  // --- 6. Logic: ลบรูปภาพ (Delete - แถมให้ครับเผื่ออยากลบ) ---
  const handleDeleteImage = async () => {
    if (!editingImage) return
    if (!confirm('ยืนยันที่จะลบรูปภาพนี้? (กู้คืนไม่ได้นะ)')) return

    setIsUpdating(true)
    try {
        // ลบจาก Database
        const { error } = await supabase.from('images').delete().eq('id', editingImage.id)
        if (error) throw error
        
        // หมายเหตุ: ถ้าจะลบไฟล์จาก Storage ด้วยต้องเขียนเพิ่ม แต่เพื่อความชัวร์ลบแค่ DB ก่อน
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
        <h1 className="text-3xl font-bold text-gray-800">คลังรูปภาพอาหาร</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCatModal(true)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition flex items-center gap-2"
          >
            <span>📁</span> จัดการหมวดหมู่
          </button>
          <button 
            onClick={() => setShowImgModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>＋</span> เพิ่มรูปภาพใหม่
          </button>
        </div>
      </div>

      {/* --- Filter Tabs --- */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === 'ALL' ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            ทั้งหมด ({images.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
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
          <div key={img.id} className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            {/* รูปภาพ */}
            <div className="aspect-square overflow-hidden bg-gray-200 relative">
              <img 
                src={img.url} 
                alt={img.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                loading="lazy"
              />
              {/* ปุ่มแก้ไข (โผล่มาตอนเอาเมาส์ชี้ หรือจิ้ม) */}
              <button 
                onClick={() => openEditModal(img)}
                className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-md text-gray-600 hover:text-blue-600 hover:bg-white transition opacity-0 group-hover:opacity-100"
                title="แก้ไขข้อมูล"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
            </div>
            
            {/* รายละเอียด */}
            <div className="p-3">
              {/* หมวดหมู่ */}
              {img.categoriesphotoadmin && (
                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                  {img.categoriesphotoadmin.name}
                </span>
              )}
              
              <div className="mt-1">
                <h3 className="font-medium text-gray-800 truncate text-sm">{img.name}</h3>
                {/* แสดงราคา */}
                <p className="text-red-500 font-bold text-sm">฿ {img.price?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
        ))}
        
        {filteredImages.length === 0 && (
          <div className="col-span-full h-60 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
            <p>ไม่มีรูปภาพในหมวดหมู่นี้</p>
          </div>
        )}
      </div>

      {/* ... MODAL: เพิ่มรูปภาพ ... */}
      {showImgModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-green-700">เพิ่มรูปภาพใหม่</h2>
              <button onClick={() => setShowImgModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleAddImage} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">ชื่อรูปภาพ</label>
                    <input type="text" value={imgName} onChange={(e) => setImgName(e.target.value)} className="w-full border rounded-lg p-2 mt-1 outline-none focus:border-green-500" required />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">ราคา (บาท)</label>
                    <input type="number" value={imgPrice} onChange={(e) => setImgPrice(e.target.value)} className="w-full border rounded-lg p-2 mt-1 outline-none focus:border-green-500" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">หมวดหมู่</label>
                <select value={selectedCatId} onChange={(e) => setSelectedCatId(e.target.value)} className="w-full border rounded-lg p-2 mt-1 bg-white">
                  <option value="">-- ไม่ระบุ --</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">ไฟล์รูปภาพ</label>
                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer relative hover:bg-gray-50">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                  <div className="text-gray-500">{file ? <span className="text-green-600">{file.name}</span> : <span>คลิกเพื่อเลือกรูปภาพ</span>}</div>
                </div>
              </div>
              <button type="submit" disabled={isImgUploading} className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:bg-gray-300">
                {isImgUploading ? 'กำลังอัปโหลด...' : 'บันทึกรูปภาพ'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ... MODAL: แก้ไขรูปภาพ (ใหม่) ... */}
      {showEditModal && editingImage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-700">แก้ไขข้อมูล</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* แสดงรูปตัวอย่าง */}
            <div className="flex justify-center mb-4">
                <img src={editingImage.url} alt="Preview" className="h-32 rounded-lg shadow-sm object-cover" />
            </div>

            <form onSubmit={handleUpdateImage} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">ชื่อรูปภาพ</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border rounded-lg p-2 mt-1 outline-none focus:border-blue-500" required />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">ราคา (บาท)</label>
                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full border rounded-lg p-2 mt-1 outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">หมวดหมู่</label>
                <select value={editCatId} onChange={(e) => setEditCatId(e.target.value)} className="w-full border rounded-lg p-2 mt-1 bg-white">
                  <option value="">-- ไม่ระบุ --</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleDeleteImage} disabled={isUpdating} className="flex-1 bg-red-100 text-red-600 py-2.5 rounded-lg hover:bg-red-200">
                    ลบรูปนี้
                </button>
                <button type="submit" disabled={isUpdating} className="flex-2 w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700">
                    {isUpdating ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ... MODAL: เพิ่มหมวดหมู่ (เหมือนเดิม) ... */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">จัดการหมวดหมู่</h2>
              <button onClick={() => setShowCatModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">ชื่อหมวดหมู่ใหม่</label>
                <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <button type="submit" disabled={isCatLoading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                {isCatLoading ? 'กำลังบันทึก...' : 'สร้างหมวดหมู่'}
              </button>
            </form>
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">หมวดหมู่ที่มีอยู่แล้ว:</p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {categories.map(c => (<span key={c.id} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs border">{c.name}</span>))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}