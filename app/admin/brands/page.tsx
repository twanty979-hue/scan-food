'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

// --- 🎨 Custom Icons ---
const IconBuilding = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>;
const IconPlus = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconSearch = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconX = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconCheck = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconCopy = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconEdit = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;

type Brand = {
  id: string;
  name: string;
  status: 'trial' | 'active' | 'expired';
  plan: 'free' | 'basic' | 'pro';
  created_at: string;
  logo_url?: string;
};

export default function SuperAdminBrands() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null); // เก็บร้านที่กำลังแก้ไข
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    plan: 'free' as 'free' | 'basic' | 'pro',
    status: 'trial' as 'trial' | 'active' | 'expired'
  });

  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    setLoading(true);
    const { data } = await supabase.from('brands').select('*').order('created_at', { ascending: false });
    if (data) setBrands(data);
    setLoading(false);
  };

  // ✅ เปิด Modal สำหรับ "สร้างใหม่"
  const openCreateModal = () => {
    setEditingBrand(null); // เคลียร์สถานะการแก้ไข
    setFormData({ name: '', plan: 'free', status: 'trial' }); // รีเซ็ตฟอร์ม
    setIsModalOpen(true);
  };

  // ✅ เปิด Modal สำหรับ "แก้ไข" (ดึงข้อมูลเดิมมาใส่)
  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      plan: brand.plan,
      status: brand.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingBrand) {
        // --- 📝 กรณีแก้ไข (Update) ---
        const { error } = await supabase
          .from('brands')
          .update({
            name: formData.name,
            plan: formData.plan,
            status: formData.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingBrand.id);

        if (error) throw error;
        
        // อัปเดต State โดยไม่ต้องโหลดใหม่
        setBrands(prev => prev.map(b => b.id === editingBrand.id ? { ...b, ...formData } : b));
        alert('แก้ไขข้อมูลเรียบร้อย!');

      } else {
        // --- ✨ กรณีสร้างใหม่ (Insert) ---
        const { data, error } = await supabase.from('brands').insert({
          name: formData.name,
          plan: formData.plan,
          status: formData.status,
          config: { vat: 0, service_charge: 0 }
        }).select().single();

        if (error) throw error;
        setBrands([data, ...brands]);
        alert(`สร้างร้านสำเร็จ! Brand ID: ${data.id}`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('⚠️ อันตราย: การลบร้านค้าจะทำให้ข้อมูล User, Product, Order ทั้งหมดหายไป\n\nยืนยันที่จะลบหรือไม่?')) return;
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (!error) setBrands(prev => prev.filter(b => b.id !== id));
    else alert('ลบไม่สำเร็จ: ' + error.message);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('คัดลอก ID แล้ว!');
  };

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900 pb-32">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/30">
                <IconBuilding size={28} />
              </span>
              Super Admin Dashboard
            </h1>
            <p className="text-slate-500 font-bold text-sm mt-2 ml-1">จัดการทุกร้านค้าในระบบ</p>
          </div>
          
          <button 
            onClick={openCreateModal}
            className="group bg-slate-900 hover:bg-blue-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:shadow-blue-600/30 transition-all active:scale-95"
          >
            <span className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors"><IconPlus size={18} /></span>
            <span>เพิ่มร้านค้าใหม่</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-200 mb-8 flex items-center gap-3 sticky top-4 z-10 max-w-2xl">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><IconSearch /></div>
            <input 
              type="text" 
              placeholder="ค้นหาชื่อร้าน..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700 text-lg"
            />
          </div>
        </div>

        {/* Grid Content */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-black animate-pulse uppercase tracking-widest">LOADING...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => (
              <div key={brand.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 hover:shadow-2xl hover:border-blue-200 transition-all group relative overflow-hidden flex flex-col">
                
                <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-3xl font-black text-slate-400 shadow-inner overflow-hidden">
                        {brand.logo_url ? <img src={brand.logo_url} className="w-full h-full object-cover"/> : brand.name.charAt(0)}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            brand.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 
                            brand.status === 'trial' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                            ● {brand.status}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                            {brand.plan} Plan
                        </span>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-2xl font-black text-slate-800 mb-1 truncate">{brand.name}</h3>
                    <p className="text-xs font-bold text-slate-400">Created: {new Date(brand.created_at).toLocaleDateString('th-TH')}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex justify-between items-center group/id cursor-pointer hover:bg-blue-50 hover:border-blue-100 transition-colors" onClick={() => copyToClipboard(brand.id)}>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover/id:text-blue-400">Brand ID</p>
                        <p className="text-sm font-mono font-bold text-slate-700 truncate w-40 group-hover/id:text-blue-700">{brand.id}</p>
                    </div>
                    <button className="text-slate-400 group-hover/id:text-blue-500"><IconCopy size={18} /></button>
                </div>

                <div className="mt-auto grid grid-cols-4 gap-2">
                    {/* ✅ ปุ่มแก้ไข (เปิด Modal พร้อมข้อมูล) */}
                    <button onClick={() => openEditModal(brand)} className="col-span-3 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 shadow-lg transition-all flex items-center justify-center gap-2">
                        <IconEdit size={16} /> จัดการ / แก้ไข
                    </button>
                    {/* ✅ ปุ่มลบร้าน */}
                    <button onClick={() => handleDelete(brand.id)} className="col-span-1 py-3 bg-red-50 text-red-500 border border-red-100 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                        <IconTrash size={18} />
                    </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Universal Modal (Create / Edit) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 pb-0 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                {editingBrand ? <><IconEdit /> แก้ไขร้านค้า</> : <><IconPlus /> สร้างร้านใหม่</>}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors">
                <IconX />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 pt-6 space-y-6">
              
              {/* ชื่อร้าน */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ชื่อร้านค้า (Brand Name)</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-lg text-slate-800 placeholder-slate-300"
                  placeholder="เช่น ร้านกาแฟใจดี"
                  autoFocus
                />
              </div>

              {/* เลือก Plan */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">แพ็กเกจ (Plan)</label>
                <div className="grid grid-cols-3 gap-3">
                  {['free', 'basic', 'pro'].map((plan) => (
                    <div 
                      key={plan}
                      onClick={() => setFormData({...formData, plan: plan as any})}
                      className={`cursor-pointer rounded-2xl p-3 text-center border-2 transition-all relative overflow-hidden ${
                        formData.plan === plan 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {formData.plan === plan && <div className="absolute top-2 right-2 text-blue-500"><IconCheck size={14}/></div>}
                      <span className="text-xs font-black uppercase tracking-widest block mt-1">{plan}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* เลือก Status */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">สถานะร้าน (Status)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: 'trial', color: 'bg-yellow-500', label: 'Trial' },
                    { val: 'active', color: 'bg-green-500', label: 'Active' },
                    { val: 'expired', color: 'bg-red-500', label: 'Expired' }
                  ].map((st) => (
                    <div 
                      key={st.val}
                      onClick={() => setFormData({...formData, status: st.val as any})}
                      className={`cursor-pointer rounded-2xl p-3 text-center border-2 transition-all relative overflow-hidden ${
                        formData.status === st.val 
                        ? 'border-slate-800 bg-slate-50 text-slate-900 shadow-md' 
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${st.color}`}></div>
                      <span className="text-xs font-bold uppercase tracking-wide">{st.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !formData.name}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-600 hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'กำลังบันทึก...' : (editingBrand ? 'บันทึกการแก้ไข' : 'ยืนยันสร้างร้าน')}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}