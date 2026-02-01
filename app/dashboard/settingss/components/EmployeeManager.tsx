// app/dashboard/settings/components/EmployeeManager.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation' // ใช้ router ของ Next.js เพื่อ refresh แบบไม่กระพริบ
import AddEmployeeForm from './AddEmployeeForm'
import DeleteEmployeeButton from './DeleteEmployeeButton'

// Helper สี Avatar
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-orange-100 text-orange-600 ring-orange-50', 
    'bg-blue-100 text-blue-600 ring-blue-50', 
    'bg-emerald-100 text-emerald-600 ring-emerald-50', 
    'bg-violet-100 text-violet-600 ring-violet-50', 
    'bg-rose-100 text-rose-600 ring-rose-50',
    'bg-amber-100 text-amber-600 ring-amber-50'
  ]
  return colors[name.length % colors.length]
}

export default function EmployeeManager({ initialEmployees, brandId }: { initialEmployees: any[], brandId: string }) {
  const [employees, setEmployees] = useState(initialEmployees)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  // ฟังก์ชันรีเฟรชหน้าจอแบบ Soft Refresh
  const handleRefresh = () => {
    router.refresh()
    // หมายเหตุ: ในโปรเจคจริงอาจจะต้อง fetch data ใหม่มา setEmployees 
    // หรือรอ router refresh เสร็จแล้ว update state แต่เบื้องต้นใช้ router.refresh() 
    // จะไป trigger ให้ server component โหลดข้อมูลใหม่เอง
  }

  return (
    <div>
      {/* Header + ปุ่มเพิ่มพนักงาน */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">จัดการพนักงาน</h1>
          <p className="text-slate-500 mt-2 font-medium">
             จัดการสิทธิ์ เพิ่ม/ลบ และตรวจสอบสถานะบัญชีผู้ใช้
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="
            group
            bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 
            text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 
            transition-all duration-300 active:scale-95 flex items-center gap-2.5
          "
        >
          <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
          <span>เพิ่มพนักงานใหม่</span>
        </button>
      </div>

      {/* ตารางรายชื่อ */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden relative">
        {employees.length > 0 ? (
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                   <th className="p-5 pl-8">ข้อมูลพนักงาน</th>
                   <th className="p-5">เบอร์โทรศัพท์ (Login)</th>
                   <th className="p-5 text-center">สถานะบัญชี</th>
                   <th className="p-5 pr-8 text-right">ดำเนินการ</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {employees.map((emp) => (
                   <tr key={emp.id} className="group hover:bg-blue-50/30 transition-colors duration-200">
                     <td className="p-5 pl-8">
                       <div className="flex items-center gap-4">
                         {/* Avatar with Ring */}
                         <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm ring-4 ${getAvatarColor(emp.full_name)}`}>
                           {emp.full_name.charAt(0)}
                         </div>
                         <div>
                            <div className="font-bold text-slate-800 text-[15px]">{emp.full_name}</div>
                            <div className="text-xs text-slate-400 font-medium mt-0.5">{emp.email}</div>
                         </div>
                       </div>
                     </td>
                     <td className="p-5">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                             </div>
                             <span className="font-mono text-sm text-slate-600 font-bold tracking-tight">
                                {emp.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}
                             </span>
                        </div>
                     </td>
                     <td className="p-5 text-center">
                        <div className={`
                            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border shadow-sm uppercase tracking-wide
                            ${emp.is_active 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                            }
                        `}>
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                          {emp.is_active ? 'Active' : 'Suspended'}
                        </div>
                     </td>
                     <td className="p-5 pr-8 text-right">
                       <DeleteEmployeeButton userId={emp.id} employeeName={emp.full_name} />
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        ) : (
          /* Empty State ที่ดูดีขึ้น */
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-lg shadow-slate-100">
               <svg className="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-700 mb-2">ยังไม่มีพนักงานในร้าน</h3>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-8">
               เริ่มต้นด้วยการเพิ่มพนักงานคนแรกของคุณ เพื่อช่วยจัดการร้านและรับออเดอร์
            </p>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 font-bold text-sm hover:underline"
            >
                + เพิ่มพนักงานตอนนี้
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL (Popup) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                 <h3 className="text-xl font-black text-slate-800">เพิ่มพนักงานใหม่</h3>
                 <p className="text-xs text-slate-400 mt-1">กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้ใหม่</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-red-500 flex items-center justify-center transition-all"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-8 bg-slate-50/30">
              <AddEmployeeForm 
                brandId={brandId} 
                onSuccess={() => {
                   setIsModalOpen(false)
                   handleRefresh()
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}