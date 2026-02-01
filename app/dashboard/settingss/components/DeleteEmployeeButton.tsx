'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteEmployee } from '@/app/actions/backend/actions'

// --- Icons ---
const IconTrash = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
const IconLoader = () => <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
const IconWarning = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>

export default function DeleteEmployeeButton({ userId, employeeName }: { userId: string, employeeName: string }) {
  const [isOpen, setIsOpen] = useState(false) // State สำหรับเปิด/ปิด Modal
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleConfirmDelete = async () => {
    setLoading(true)
    
    // เรียก Server Action
    const res = await deleteEmployee(userId)

    if (res.success) {
      setIsOpen(false) // ปิด Modal
      router.refresh() // รีเฟรชหน้าจอเพื่อให้ข้อมูลหายไป
    } else {
      alert(res.error || 'ลบไม่สำเร็จ กรุณาลองใหม่')
      setLoading(false)
    }
  }

  return (
    <>
      {/* 1. ปุ่ม Trigger (รูปถังขยะ) */}
      <button 
        onClick={() => setIsOpen(true)} // กดแล้วเปิด Modal
        disabled={loading}
        className="group relative w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-500 hover:shadow-md hover:shadow-rose-100 transition-all duration-200 active:scale-95"
        title="ลบพนักงาน"
      >
        <IconTrash />
      </button>

      {/* 2. ตัว Modal (Popup) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* Backdrop (พื้นหลังมัวๆ) */}
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => !loading && setIsOpen(false)} // กดพื้นหลังเพื่อปิด (ถ้าไม่โหลดอยู่)
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            
            <div className="flex flex-col items-center text-center">
              {/* Icon Warning ใหญ่ๆ */}
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4 ring-4 ring-rose-50/50">
                <IconWarning />
              </div>

              <h3 className="text-xl font-black text-slate-800 mb-2">ยืนยันการลบ?</h3>
              
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                คุณแน่ใจหรือไม่ที่จะลบพนักงาน <br/>
                <span className="font-bold text-slate-800">"{employeeName}"</span><br/>
                การกระทำนี้<span className="text-rose-500 font-bold">ไม่สามารถย้อนกลับได้</span>
              </p>

              {/* ปุ่ม Action */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                
                <button
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <IconLoader /> <span>กำลังลบ...</span>
                    </>
                  ) : (
                    'ลบพนักงาน'
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}