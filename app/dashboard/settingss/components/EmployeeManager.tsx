// app/dashboard/settings/components/EmployeeManager.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, Plus, Trash2, Phone, Mail, Shield, X, ChevronRight, MoreHorizontal 
} from 'lucide-react';
import AddEmployeeForm from './AddEmployeeForm' 

// ฟังก์ชันจัดเบอร์โทรสวยๆ
const formatPhone = (phone: string) => {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  const match = clean.match(/^(\d{2,3})(\d{3})(\d{4})$/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  return phone;
};

// Helper สี Avatar
const getAvatarColor = (name: string) => {
  if (!name) return 'bg-slate-100 text-slate-500';
  const colors = [
    'bg-orange-100 text-orange-600', 
    'bg-blue-100 text-blue-600', 
    'bg-emerald-100 text-emerald-600', 
    'bg-violet-100 text-violet-600', 
    'bg-rose-100 text-rose-600'
  ];
  return colors[name.length % colors.length];
}

export default function EmployeeManager({ initialEmployees, brandId }: { initialEmployees: any[], brandId: string }) {
  const [employees, setEmployees] = useState(initialEmployees || []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // ✅ State สำหรับ Modal ดูรายละเอียด (เมื่อกดที่การ์ดในมือถือ)
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  
  const router = useRouter();

  // Mock Delete (พี่เปลี่ยนไปใช้ Logic ลบจริงของพี่ได้เลย)
  const handleDelete = async (id: string) => {
    if(!confirm('ยืนยันการลบพนักงาน?')) return;
    // ... call api delete ...
    setEmployees(prev => prev.filter(e => e.id !== id));
    setSelectedEmployee(null); // ปิด Modal ด้วย
    router.refresh();
  };

  const handleSuccessAdd = () => {
      setIsAddModalOpen(false);
      router.refresh();
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Header & ปุ่มเพิ่ม (เหมือนเดิม) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
           {/* ในมือถือ Header อาจจะซ้ำกับ Sticky Bar ข้างบน ถ้าพี่มี Sticky Bar แล้ว ตรงนี้ลบ h1/p ออกได้ครับ */}
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 transition-all"
        >
          <div className="bg-white/20 p-1 rounded-lg"><Plus size={18} /></div>
          <span>เพิ่มพนักงานใหม่</span>
        </button>
      </div>

      {/* 2. MOBILE VIEW: รายการแบบการ์ด (ซ่อนเบอร์) */}
      <div className="md:hidden space-y-3">
        {employees.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                ไม่พบข้อมูลพนักงาน
            </div>
        ) : (
            employees.map((emp) => (
                <div 
                    key={emp.id} 
                    onClick={() => setSelectedEmployee(emp)} // ✅ กดเพื่อเปิด Modal
                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-4 min-w-0">
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 ${getAvatarColor(emp.full_name)}`}>
                            {emp.full_name?.charAt(0).toUpperCase()}
                        </div>
                        
                        {/* Info (ไม่มีเบอร์โทร ตามสั่ง) */}
                        <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm truncate pr-2">
                                {emp.full_name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                {/* Role Badge */}
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                                    {emp.role}
                                </span>
                                {/* Status Dot */}
                                <div className={`flex items-center gap-1 text-[10px] font-bold ${emp.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    <div className={`w-2 h-2 rounded-full ${emp.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                    {emp.is_active ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chevron Icon (บอกว่ากดได้) */}
                    <div className="text-slate-300">
                        <ChevronRight size={20} />
                    </div>
                </div>
            ))
        )}
      </div>

      {/* 3. DESKTOP VIEW: ตารางเต็ม (เหมือนเดิม) */}
      <div className="hidden md:block bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-5 pl-8">พนักงาน</th>
                    <th className="p-5">เบอร์โทรศัพท์</th>
                    <th className="p-5">PIN</th>
                    <th className="p-5 text-center">สถานะ</th>
                    <th className="p-5 pr-8 text-right"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5 pl-8">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${getAvatarColor(emp.full_name)}`}>
                                    {emp.full_name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">{emp.full_name}</div>
                                    <div className="text-xs text-slate-400">{emp.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-5 font-mono text-sm text-slate-600">{formatPhone(emp.phone)}</td>
                        <td className="p-5 font-mono text-sm text-slate-600">{emp.pin_code || '----'}</td>
                        <td className="p-5 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${emp.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                {emp.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </td>
                        <td className="p-5 pr-8 text-right">
                            <button onClick={() => handleDelete(emp.id)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
         </table>
      </div>

      {/* --- MODAL DETAIL (Mobile Only) --- */}
      {/* นี่คือโมดูลที่เด้งขึ้นมาเมื่อกดชื่อคน เพื่อโชว์เบอร์และข้อมูลครบๆ */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedEmployee(null)}></div>
            
            <div className="bg-white w-full sm:max-w-sm rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-bottom duration-300">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">ข้อมูลพนักงาน</h3>
                    <button onClick={() => setSelectedEmployee(null)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 pb-10">
                    {/* Profile Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-4xl font-black mb-4 shadow-sm ${getAvatarColor(selectedEmployee.full_name)}`}>
                            {selectedEmployee.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">{selectedEmployee.full_name}</h2>
                        <p className="text-slate-500">{selectedEmployee.email}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* เบอร์โทร (โชว์ตรงนี้แทน) */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">เบอร์โทรศัพท์</span>
                            <div className="flex items-center gap-2 text-slate-900 font-bold font-mono text-lg">
                                <Phone size={16} className="text-slate-400"/>
                                {formatPhone(selectedEmployee.phone)}
                            </div>
                        </div>
                        {/* PIN */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">PIN Code</span>
                            <div className="flex items-center gap-2 text-slate-900 font-bold font-mono text-lg">
                                <Shield size={16} className="text-slate-400"/>
                                {selectedEmployee.pin_code || '----'}
                            </div>
                        </div>
                    </div>

                    {/* Delete Action */}
                    <button 
                        onClick={() => handleDelete(selectedEmployee.id)}
                        className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-bold flex items-center justify-center gap-2 hover:bg-red-100 border border-red-100 transition-colors"
                    >
                        <Trash2 size={20} /> ลบบัญชีผู้ใช้นี้
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- ADD MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
            <div className="bg-white rounded-[32px] w-full max-w-lg relative z-10 p-8 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">เพิ่มพนักงาน</h3>
                    <button onClick={() => setIsAddModalOpen(false)}><X size={24} className="text-slate-400"/></button>
                </div>
                <AddEmployeeForm brandId={brandId} onSuccess={handleSuccessAdd} />
            </div>
        </div>
      )}

    </div>
  )
}