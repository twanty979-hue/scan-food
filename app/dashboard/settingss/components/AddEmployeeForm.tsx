'use client'

import { useState } from 'react'
import { inviteEmployee, searchEmployeeByEmail } from '@/app/actions/backend/actions'
import { Mail, User, Phone, CheckCircle2, AlertCircle, Loader2, Search, Send, Briefcase } from 'lucide-react'

export default function AddEmployeeForm({ brandId, onSuccess }: { brandId: string, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('cashier') // 👈 ค่าเริ่มต้นเป็นแคชเชียร์
  const [previewUser, setPreviewUser] = useState<any | null>(null)
  const [searchError, setSearchError] = useState('')

  const handleSearch = async () => {
    if (!email.trim()) return
    
    setSearching(true)
    setSearchError('')
    setPreviewUser(null)

    try {
      const result = await searchEmployeeByEmail(email.trim())
      if (result.success && result.profile) {
        setPreviewUser(result.profile)
      } else {
        setSearchError(result.message || 'ไม่พบอีเมลนี้ในระบบสมาชิก')
      }
    } catch (error) {
      setSearchError('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล')
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!previewUser) return
    
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('email', email.trim())
      formData.append('brandId', brandId)
      formData.append('role', role) // 👈 ส่งค่าตำแหน่งไปด้วย

      const result = await inviteEmployee(formData)
      if (!result.success) throw new Error(result.error)
      
      alert(result.message || 'ส่งคำเชิญเข้าร่วมทีมสำเร็จ!')
      setEmail('')
      setPreviewUser(null)
      if (onSuccess) onSuccess()
    } catch (error: any) {
      alert(error.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      
      {/* 1. ช่องกรอกอีเมล + ปุ่มค้นหา */}
      <div className="group">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
          อีเมลพนักงาน
        </label>
        <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white transition-all duration-200 rounded-xl overflow-hidden p-1.5">
          <div className="pl-3 pr-2 text-slate-400 group-focus-within:text-blue-500">
            <Mail className="w-5 h-5" />
          </div>
          <input 
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (previewUser) setPreviewUser(null)
              if (searchError) setSearchError('')
            }}
            className="flex-1 bg-transparent py-2.5 text-slate-800 font-medium placeholder:text-slate-400 outline-none w-full min-w-0 text-sm"
            placeholder="เช่น oonmw2@gmail.com"
          />
          <button
            type="button"
            disabled={searching || !email.trim()}
            onClick={handleSearch}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all duration-200 shrink-0
              ${!email.trim() || searching
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-sm'
              }`}
          >
            {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>ตรวจสอบ</span>
          </button>
        </div>
      </div>

      {/* 2. ช่องเลือกตำแหน่ง (Dropdown) สไตล์คลีนๆ */}
      <div className="group">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
          ตำแหน่งหน้าที่ในร้าน
        </label>
        <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white transition-all duration-200 rounded-xl overflow-hidden p-3">
          <div className="text-slate-400 mr-3">
            <Briefcase className="w-5 h-5" />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex-1 bg-transparent text-slate-800 text-sm font-bold outline-none cursor-pointer w-full"
          >
            <option value="cashier">คิดเงิน (แคชเชียร์)</option>
            <option value="chef">ออเดอร์ (ครัว)</option>
            <option value="staff">พนักงานทั่วไป (ดูคลัง/ระบบ)</option>
          </select>
        </div>
      </div>

      {/* 🎯 กล่องแสดงพรีวิวเมื่อค้นหาเจอ */}
      {previewUser && (
        <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-blue-100 p-4 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">
            <CheckCircle2 size={12} className="text-blue-500" /> ตรวจสอบพบพนักงานในระบบ
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 text-white font-black rounded-xl flex items-center justify-center text-lg shadow-md shadow-blue-500/10 shrink-0">
              {previewUser.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-slate-400" />
                <p className="text-sm font-bold text-slate-800 truncate">{previewUser.full_name}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={14} className="text-slate-400" />
                <p className="text-xs font-mono font-bold text-slate-500">{previewUser.phone}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ กล่องแจ้งเตือน */}
      {searchError && (
        <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-center gap-2.5 text-amber-800 animate-in fade-in duration-200">
          <AlertCircle size={18} className="text-amber-500 shrink-0" />
          <p className="text-xs font-bold leading-relaxed">{searchError}</p>
        </div>
      )}

      <div className="pt-1"></div>

      {/* 🚀 ปุ่มส่งคำเชิญ */}
      <button 
        type="button"
        disabled={loading || !previewUser}
        onClick={handleSubmit}
        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 
          ${loading || !previewUser
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/20 active:scale-[0.98]'
          }`}
      >
        {loading ? (
          <><Loader2 className="animate-spin h-5 w-5" /><span>กำลังส่งคำเชิญ...</span></>
        ) : (
          <><Send className="w-4 h-4" /><span>ส่งคำเชิญเข้าร่วมทีม</span></>
        )}
      </button>

    </div>
  )
}