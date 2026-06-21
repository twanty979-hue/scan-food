'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptInvitation, rejectInvitation } from '@/app/actions/backend/actions'
import { Bell, Check, X, Store, Loader2, Calendar } from 'lucide-react'

// 🟢 เพิ่ม props isOpen และ onClose
export default function InviteNotification({ profile, isOpen, onClose, onSuccess }: { profile: any, isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 🟢 ถ้า Modal ถูกสั่งปิด หรือไม่มีคำเชิญ ก็ซ่อนไปเลย
  if (!isOpen || !profile?.invited_brand_id || profile?.is_joined === true) return null

  // แปลงชื่อตำแหน่งใน Log ให้พนักงานอ่านเข้าใจง่าย
  const displayRole = profile.invited_role === 'cashier' ? 'คิดเงิน (แคชเชียร์)' : profile.invited_role === 'chef' ? 'ออเดอร์ (ครัว)' : 'พนักงานทั่วไป';
  
  // จัดฟอร์แมตวันที่เชิญ
  const displayDate = profile.invited_at 
    ? new Date(profile.invited_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '-';

  const handleAccept = async () => {
    setLoading(true)
    const result = await acceptInvitation(profile.id, profile.invited_brand_id, profile.invited_role)
    
    if (result.success) {
      window.location.replace('/login?reset=store_changed')
      return
      alert(result.message || 'เข้าร่วมร้านค้าสำเร็จ!')
      if (profile.invited_role === 'chef') {
        router.push('/dashboard/orders')
      } else {
        router.push('/dashboard/pai_order')
      }
      router.refresh()
    } else {
      alert(result.error || 'เกิดข้อผิดพลาดในการเข้าร่วม')
      setLoading(false)
    }
  }

const handleReject = async () => {
    if (!confirm('คุณต้องการปฏิเสธคำเชิญนี้ใช่หรือไม่?')) return
    setLoading(true)
    
    const result = await rejectInvitation(profile.id, profile.invited_brand_id)
    if (result.success) {
      alert(result.message || 'ปฏิเสธคำเชิญเรียบร้อย')
      onSuccess() // 🚀 ใช้งานตรงนี้! สั่งลบกระดิ่งและปิด Modal ทันทีที่ API ตอบกลับว่าสำเร็จ
      router.refresh()
    } else {
      alert(result.error || 'เกิดข้อผิดพลาด')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop สีดำเบลอๆ */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* ตัวกล่อง Modal */}
      <div className="bg-white rounded-[32px] w-full max-w-sm relative z-10 p-6 sm:p-8 animate-in zoom-in-95 shadow-2xl overflow-hidden text-center">
         
         {/* แสงสีตกแต่งด้านบน */}
         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/5"></div>

         {/* ปุ่มปิด X ด้านมุมขวาบน */}
         <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors z-20">
            <X size={18} />
         </button>

         <div className="relative z-10 flex flex-col items-center">
            {/* ไอคอนกระดิ่ง */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-5">
              <Bell className="w-8 h-8 animate-bounce" />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-2">คำเชิญใหม่!</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              คุณได้รับคำเชิญให้เข้าร่วมทำงานกับทีมร้าน<br/>
              <span className="font-bold text-slate-800 text-base">{profile.invited_brand_name}</span><br/>
              ในตำแหน่ง <span className="font-bold text-blue-600 underline decoration-blue-200 decoration-2">{displayRole}</span>
            </p>

            {/* กล่องสรุปข้อมูล */}
            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8 text-left">
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  <Store size={14} /> ร้านที่เชิญ
               </div>
               <div className="font-bold text-sm text-slate-700 mb-3">{profile.invited_brand_name}</div>

               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  <Calendar size={14} /> ส่งเมื่อ
               </div>
               <div className="font-bold text-sm text-slate-700">{displayDate}</div>
            </div>

            {/* ปุ่ม Action */}
            <div className="flex w-full gap-3">
               <button 
                  disabled={loading} 
                  onClick={handleReject} 
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
               >
                  ปฏิเสธ
               </button>
               <button 
                  disabled={loading} 
                  onClick={handleAccept} 
                  className="flex-[2] py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
               >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} ยอมรับ
               </button>
            </div>
         </div>
      </div>
    </div>
  )
}
