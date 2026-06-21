'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Trash2, Phone, Mail, Shield, X, ChevronRight, UserCheck, Clock, History, CheckCircle2, XCircle, MinusCircle
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
const getAvatarColor = (name: string, isPending: boolean) => {
  if (isPending) return 'bg-amber-50 text-amber-600 border border-amber-200';
  if (!name) return 'bg-slate-100 text-slate-500';
  const colors = [
    'bg-orange-50 text-orange-600 border border-orange-100', 
    'bg-blue-50 text-blue-600 border border-blue-100', 
    'bg-emerald-50 text-emerald-600 border border-emerald-100', 
    'bg-violet-50 text-violet-600 border border-violet-100', 
    'bg-rose-50 text-rose-600 border border-rose-100'
  ];
  return colors[name.length % colors.length];
}

// 🟢 เพิ่มการรับ Props: invitationLogs เข้ามาใช้งานตรงนี้ครับนาย
export default function EmployeeManager({ 
  initialEmployees, 
  brandId,
  invitationLogs = [] 
}: { 
  initialEmployees: any[], 
  brandId: string,
  invitationLogs?: any[]
}) {
  const [employees, setEmployees] = useState(initialEmployees || []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const router = useRouter();

  // =====================================================================
  // 🟢 ลอจิกแยกกลุ่มพนักงานแบบคลีนๆ รองรับระบบความปลอดภัยใหม่ชัวร์ 100%
  // =====================================================================
  // 1. พนักงานที่ทำงานอยู่: แบรนด์หลักตรงกับร้านเรา และกดยอมรับเงื่อนไขแล้ว
  const activeEmployees = employees.filter(
    (emp) => emp.brand_id === brandId && emp.is_joined === true
  );

  // 2. อยู่ระหว่างเชิญ (Pending): โดนร้านเราเชิญส่งสิทธิ์ไปพักไว้ และพนักงานยังไม่ได้กดยอมรับ
  const pendingInvites = employees.filter(
    (emp) => emp.invited_brand_id === brandId && emp.is_joined === false
  );
  // =====================================================================

  const handleDelete = async (id: string) => {
    if(!confirm('ยืนยันการยกเลิกสิทธิ์หรือลบคำเชิญของพนักงานคนนี้?')) return;
    // ... เรียกใช้ Server Action ลบของนายตามปกติ ...
    setEmployees(prev => prev.filter(e => e.id !== id));
    setSelectedEmployee(null);
    router.refresh();
  };

  const handleSuccessAdd = () => {
    setIsAddModalOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-12">
      
      {/* 1. ส่วนปุ่มกดเพิ่มพนักงาน */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/10 active:scale-95 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus size={18} />
          <span>ส่งคำเชิญพนักงานใหม่</span>
        </button>
      </div>

      {/* 2. MOBILE VIEW: แยก Section ให้ชัดเจนในจอมือถือ */}
      <div className="md:hidden space-y-6">
        {/* กลุ่มรอการตอบรับ (Pending) */}
        {pendingInvites.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-amber-600 uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <Clock size={14} /> อยู่ระหว่างเชิญ ({pendingInvites.length})
            </h2>
            {pendingInvites.map((emp) => (
              <div 
                key={emp.id} 
                onClick={() => setSelectedEmployee(emp)}
                className="bg-amber-50/40 p-4 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between active:bg-amber-100/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${getAvatarColor(emp.full_name, true)}`}>
                    {emp.full_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{emp.full_name || 'รอการลงทะเบียนชื่อ'}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{emp.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded uppercase">
                      {emp.invited_role || 'staff'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md uppercase tracking-wide">Pending</span>
              </div>
            ))}
          </div>
        )}

        {/* กลุ่มพนักงานปัจจุบัน (Active) */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
            <UserCheck size={14} /> พนักงานทำงานอยู่ ({activeEmployees.length})
          </h2>
          {activeEmployees.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
              ยังไม่มีพนักงานในร้านค้าของคุณ
            </div>
          ) : (
            activeEmployees.map((emp) => (
              <div 
                key={emp.id} 
                onClick={() => setSelectedEmployee(emp)}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${getAvatarColor(emp.full_name, false)}`}>
                    {emp.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{emp.full_name}</h3>
                    <span className="inline-block mt-1 text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">
                      {emp.role}
                    </span>
                  </div>
                </div>
                <div className="text-slate-300"><ChevronRight size={18} /></div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. DESKTOP VIEW: ตารางหลักพนักงานปัจจุบันและคนที่รอตอบรับ */}
      <div className="hidden md:block bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-5 pl-8">พนักงาน</th>
                    <th className="p-5">เบอร์โทรศัพท์</th>
                    <th className="p-5">ตำแหน่ง</th>
                    <th className="p-5 text-center">สถานะเข้าร่วม</th>
                    <th className="p-5 pr-8 text-right"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-10 text-slate-400">ไม่พบข้อมูลรายชื่อพนักงาน</td>
                  </tr>
                ) : (
                  employees.map((emp) => {
                    const isPending = emp.invited_brand_id === brandId && emp.brand_id !== brandId;
                    
                    return (
                      <tr key={emp.id} className={`transition-colors ${isPending ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-slate-50/50'}`}>
                          <td className="p-5 pl-8">
                              <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${getAvatarColor(emp.full_name, isPending)}`}>
                                      {emp.full_name?.charAt(0) || '?'}
                                  </div>
                                  <div>
                                      <div className="font-bold text-slate-800">{emp.full_name || 'รอการลงทะเบียนชื่อ'}</div>
                                      <div className="text-xs text-slate-400">{emp.email}</div>
                                  </div>
                              </div>
                          </td>
                          <td className="p-5 font-mono text-sm text-slate-600">{formatPhone(emp.phone)}</td>
                          <td className="p-5">
                            <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                              isPending ? 'text-amber-600 bg-amber-50 border border-amber-100' : 'text-slate-600 bg-slate-100'
                            }`}>
                              {isPending ? (emp.invited_role || 'staff') : (emp.role || 'staff')}
                            </span>
                          </td>
                          <td className="p-5 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                isPending 
                                  ? 'bg-amber-50 text-amber-600 border-amber-100' 
                                  : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              }`}>
                                  {isPending ? 'PENDING (รอตอบรับ)' : 'ACTIVE (ทำงานอยู่)'}
                              </span>
                          </td>
                          <td className="p-5 pr-8 text-right">
                              <button onClick={() => handleDelete(emp.id)} className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer" title={isPending ? "ยกเลิกคำเชิญ" : "ลบพนักงาน"}>
                                  <Trash2 size={16} />
                              </button>
                          </td>
                      </tr>
                    )
                  })
                )}
            </tbody>
         </table>
      </div>

      {/* 📜 4. NEW SECTION: ตารางประวัติการเชิญย้อนหลัง (History Logs) */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
          <History size={18} className="text-slate-500" />
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">ประวัติการส่งคำเชิญย้อนหลัง</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                <th className="p-4 pl-8">พนักงานที่ถูกเชิญ</th>
                <th className="p-4">ตำแหน่งที่เชิญ</th>
                <th className="p-4">วันที่ส่งคำเชิญ</th>
                <th className="p-4 text-center">สถานะประวัติ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {invitationLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-slate-400 text-xs font-medium">ไม่มีประวัติบันทึกการส่งคำเชิญในระบบ</td>
                </tr>
              ) : (
                invitationLogs.map((log) => {
                  // แสดงผลสีตามสถานะประวัติคำเชิญแบบ Soft UI
                  let statusStyles = 'bg-slate-50 text-slate-600 border-slate-100';
                  let StatusIcon = MinusCircle;
                  let statusText = log.status;

                  if (log.status === 'accepted') {
                    statusStyles = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                    StatusIcon = CheckCircle2;
                    statusText = 'เข้าร่วมสำเร็จ';
                  } else if (log.status === 'rejected') {
                    statusStyles = 'bg-rose-50 text-rose-600 border-rose-100';
                    StatusIcon = XCircle;
                    statusText = 'ปฏิเสธคำเชิญ';
                  } else if (log.status === 'pending') {
                    statusStyles = 'bg-amber-50 text-amber-600 border-amber-100';
                    StatusIcon = Clock;
                    statusText = 'รอการตอบรับ';
                  } else if (log.status === 'cancelled') {
                    statusStyles = 'bg-slate-100 text-slate-500 border-slate-200';
                    StatusIcon = X;
                    statusText = 'ยกเลิกคำเชิญ';
                  }

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-4 pl-8">
                        <div className="font-bold text-slate-700">{log.employee?.full_name || 'ไม่ระบุชื่อ'}</div>
                        <div className="text-xs text-slate-400 font-medium">{log.employee?.email || '-'}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-600 uppercase text-xs">
                        {log.role || 'staff'}
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-500">
                        {log.created_at ? new Date(log.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyles}`}>
                          <StatusIcon size={12} />
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DETAIL (Mobile Only) --- */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedEmployee(null)}></div>
            
            <div className="bg-white w-full sm:max-w-sm rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">ข้อมูลรายละเอียด</h3>
                    <button onClick={() => setSelectedEmployee(null)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 pb-10">
                    <div className="flex flex-col items-center mb-8">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black mb-4 ${getAvatarColor(selectedEmployee.full_name, selectedEmployee.invited_brand_id === brandId && selectedEmployee.is_joined === false)}`}>
                            {selectedEmployee.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <h2 className="text-xl font-black text-slate-900">{selectedEmployee.full_name || 'รอตอบรับคำเชิญ'}</h2>
                        <p className="text-sm text-slate-500 mt-0.5">{selectedEmployee.email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">เบอร์โทรศัพท์</span>
                            <div className="flex items-center gap-2 text-slate-800 font-bold font-mono text-base">
                                <Phone size={14} className="text-slate-400"/>
                                {formatPhone(selectedEmployee.phone)}
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">สถานะระบบ</span>
                            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mt-0.5">
                                <Shield size={14} className="text-slate-400"/>
                                {selectedEmployee.invited_brand_id === brandId && selectedEmployee.is_joined === false ? 'รอตอบรับ' : 'ทำงานอยู่'}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => handleDelete(selectedEmployee.id)}
                        className="w-full py-4 rounded-xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center gap-2 hover:bg-rose-100 border border-rose-100/60 transition-colors active:scale-95"
                    >
                        <Trash2 size={18} /> {selectedEmployee.invited_brand_id === brandId && selectedEmployee.is_joined === false ? 'ยกเลิกคำเชิญนี้' : 'ลบออกจากร้านค้า'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- ADD MODAL (ฟอร์มยิงเมลเชิญของนาย) --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
            <div className="bg-white rounded-[28px] w-full max-w-md relative z-10 p-6 animate-in zoom-in-95 border border-slate-50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-slate-900">เชิญพนักงานเข้าร่วมทีม</h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                </div>
                <AddEmployeeForm brandId={brandId} onSuccess={handleSuccessAdd} />
            </div>
        </div>
      )}

    </div>
  )
}