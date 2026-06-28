'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

// --- 🎨 Custom Icons ---
const IconBuilding = ({ size = 28 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>;
const IconPlus = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconSearch = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconCopy = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconEdit = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconCalendar = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconActivity = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;

// อัปเดต Type ให้ตรงกับข้อมูลจาก View
type BrandReport = {
  id: string;
  name: string;
  status: 'trial' | 'active' | 'expired';
  plan: 'free' | 'basic' | 'pro' | 'ultimate';
  created_at: string;
  updated_at: string;
  logo_url?: string;
  slug?: string;
  total_coins: number;
  current_theme: string;
  total_banners: number;
  total_categories: number;
  total_tables: number;
  total_discounts: number;
  total_products: number;
  today_orders: number;
};

export default function SuperAdminBrands() {
  const router = useRouter();
  const [brands, setBrands] = useState<BrandReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    setLoading(true);
    // เปลี่ยนจาก .from('brands') เป็น .from('brand_dashboard_report')
    const { data, error } = await supabase.from('brand_dashboard_report').select('*').order('created_at', { ascending: false });
    if (data) setBrands(data);
    if (error) console.error("Error fetching views:", error);
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('คัดลอก ID แล้ว!');
  };

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] p-6 md:p-10 font-sans text-[#1E3A27] pb-32">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-[#2C4A34] tracking-tight flex items-center gap-3">
              <span className="p-3 bg-[#5F8565] text-white rounded-2xl shadow-lg">
                <IconBuilding size={28} />
              </span>
              สรุปภาพรวมร้านค้า (Super Admin)
            </h1>
            <p className="text-[#608367] font-bold text-sm mt-2 ml-1">ข้อมูลถูกดึงแบบ Real-time จาก Report View</p>
          </div>
          
          <button className="group bg-[#2C4A34] hover:bg-[#5F8565] text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl transition-all active:scale-95">
            <span className="bg-white/20 p-1.5 rounded-lg"><IconPlus size={18} /></span>
            <span>เพิ่มร้านค้าใหม่</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-[28px] shadow-sm border border-[#D0DDD0] mb-8 flex items-center gap-3 sticky top-4 z-10 max-w-2xl">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FAF96]"><IconSearch /></div>
            <input 
              type="text" 
              placeholder="ค้นหาชื่อร้าน..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#F4F7F4] border border-[#D0DDD0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5F8565]/20 transition-all font-bold text-[#2C4A34] text-lg"
            />
          </div>
        </div>

        {/* 📋 Data Table */}
        {loading ? (
          <div className="text-center py-20 text-[#8FAF96] font-black animate-pulse uppercase tracking-widest">LOADING DATA...</div>
        ) : (
          <div className="bg-white rounded-[32px] shadow-sm border border-[#D0DDD0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-[#E2ECE2] border-b border-[#D0DDD0] text-[#3B5E44] text-xs uppercase tracking-widest font-black">
                    <th className="p-6">ข้อมูลร้านค้า (Brand)</th>
                    <th className="p-6">สถานะ & แพ็กเกจ</th>
                    <th className="p-6">สถิติระบบ (สินค้า / โต๊ะ)</th>
                    <th className="p-6 bg-[#D5E4D5]">ออเดอร์วันนี้</th>
                    <th className="p-6">วันที่เปิดร้าน</th>
                    <th className="p-6 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2ECE2]">
                  {filteredBrands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-[#F4F7F4] transition-colors group">
                      
                      {/* 1. ข้อมูลร้านค้า */}
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-[#DBE6DB] flex items-center justify-center text-xl font-black text-[#5F8565] shadow-inner overflow-hidden flex-shrink-0">
                            {brand.logo_url ? <img src={brand.logo_url} className="w-full h-full object-cover" alt="logo"/> : brand.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-[#2C4A34] mb-1">{brand.name}</h3>
                            <div className="flex items-center gap-2 group/copy cursor-pointer" onClick={() => copyToClipboard(brand.id)}>
                              <p className="text-xs font-mono font-bold text-[#8FAF96] truncate w-32 group-hover/copy:text-[#5F8565]">{brand.id}</p>
                              <span className="text-[#D0DDD0] group-hover/copy:text-[#5F8565]"><IconCopy size={12} /></span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. สถานะ & แพ็กเกจ */}
                      <td className="p-6">
                        <div className="flex flex-col gap-2 items-start">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1 ${
                            brand.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                            brand.status === 'trial' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${brand.status === 'active' ? 'bg-green-500' : brand.status === 'trial' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                            {brand.status}
                          </span>
                          <span className="text-[10px] font-bold text-[#5F8565] uppercase tracking-wider bg-[#E2ECE2] px-2 py-1 rounded-lg">
                            {brand.plan}
                          </span>
                        </div>
                      </td>

                      {/* 3. สถิติระบบ */}
                      <td className="p-6">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-bold text-[#608367]">
                          <p>📦 สินค้า: <span className="text-[#2C4A34]">{brand.total_products}</span></p>
                          <p>🪑 โต๊ะ: <span className="text-[#2C4A34]">{brand.total_tables}</span></p>
                          <p>🏷️ ส่วนลด: <span className="text-[#2C4A34]">{brand.total_discounts}</span></p>
                          <p>🪙 คอยน์: <span className="text-[#2C4A34]">{brand.total_coins}</span></p>
                        </div>
                      </td>

                      {/* 4. ออเดอร์วันนี้ */}
                      <td className="p-6 bg-[#F4F7F4]/50">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${brand.today_orders > 0 ? 'bg-[#5F8565] text-white' : 'bg-[#D0DDD0] text-[#608367]'}`}>
                            <IconActivity size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-[#8FAF96] uppercase">Today's Orders</p>
                            <p className={`text-xl font-black ${brand.today_orders > 0 ? 'text-[#2C4A34]' : 'text-[#8FAF96]'}`}>
                              {brand.today_orders} <span className="text-sm font-bold">บิล</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 5. วันที่เปิดร้าน */}
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-[#608367] font-medium text-sm">
                          <span className="text-[#8FAF96]"><IconCalendar size={16} /></span>
                          {formatDate(brand.created_at)}
                        </div>
                      </td>

                      {/* 6. จัดการ (Action) */}
                      <td className="p-6">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-3 bg-[#F4F7F4] text-[#608367] rounded-xl hover:bg-[#2C4A34] hover:text-white transition-all shadow-sm">
                            <IconEdit size={16} />
                          </button>
                          <button className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}