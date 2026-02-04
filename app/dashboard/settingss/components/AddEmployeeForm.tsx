// app/dashboard/settings/components/AddEmployeeForm.tsx
'use client'

import { useState } from 'react'
// ✅ นำเข้า Server Action (ตรวจสอบว่า path นี้ถูกต้องตามโครงสร้างโปรเจคของคุณ)
import { createEmployee } from '@/app/actions/backend/actions'

// --- Icons ---
const IconUser = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
const IconPhone = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
const IconMail = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
const IconLock = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
const IconEye = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
const IconEyeOff = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
const Spinner = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>

// ✅ Component InputGroup (แยกออกมาเพื่อแก้ปัญหา Focus หลุด)
const InputGroup = ({ 
  id, label, icon: Icon, type = "text", placeholder, value, onChange, maxLength, suffix, isPasswordToggle = false,
  focusedField, setFocusedField, showPassword, setShowPassword,
  autoComplete 
}: any) => (
  <div className="group">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
      {label}
    </label>
    <div 
      className={`
        relative flex items-center bg-slate-50 border transition-all duration-200 rounded-xl overflow-hidden
        ${focusedField === id ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white' : 'border-slate-200 hover:border-slate-300'}
      `}
    >
      <div className={`pl-4 pr-3 ${focusedField === id ? 'text-blue-500' : 'text-slate-400'}`}>
        <Icon />
      </div>

      <input 
        type={isPasswordToggle ? (showPassword ? 'text' : 'password') : type}
        className="flex-1 bg-transparent py-3.5 text-slate-800 font-medium placeholder:text-slate-400 outline-none w-full min-w-0"
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={onChange}
        onFocus={() => setFocusedField(id)}
        onBlur={() => setFocusedField(null)}
        autoComplete={autoComplete}
        required
      />

      <div className="pr-4 pl-2 flex items-center">
          {suffix && (
              <span className="text-sm font-bold text-slate-400 select-none bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                  {suffix}
              </span>
          )}
          
          {isPasswordToggle && (
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
              >
                 {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
          )}

          {!suffix && !isPasswordToggle && maxLength && (
              <span className={`text-[10px] font-bold ${value.length === maxLength ? 'text-green-500' : 'text-slate-300'}`}>
                  {value.length}/{maxLength}
              </span>
          )}
      </div>
    </div>
  </div>
)

export default function AddEmployeeForm({ brandId, onSuccess }: { brandId: string, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    username: '',
    password: ''
  })

  // ✅ แก้ไขฟังก์ชัน handleSubmit ให้เรียก Server Action โดยตรง
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. เตรียมข้อมูลใส่ FormData (Server Action ต้องการ FormData)
      const formDataToSend = new FormData()
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('username', formData.username)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('brandId', brandId)
      // สร้างอีเมลหลอกๆ เพื่อใช้กับ Auth System
      formDataToSend.append('email', `${formData.username}@gmail.com`) 

      // 2. เรียกใช้ Server Action (แทนการ fetch)
      const result = await createEmployee(formDataToSend)

      if (!result.success) {
        throw new Error(result.error)
      }
      
      alert('เพิ่มพนักงานเรียบร้อย!')
      setFormData({ fullName: '', phone: '', username: '', password: '' })
      if (onSuccess) onSuccess()

    } catch (error: any) {
      // แสดงข้อความ error ที่ชัดเจนขึ้น
      alert('เกิดข้อผิดพลาด: ' + (error.message || 'ไม่ทราบสาเหตุ'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* 1. ชื่อ-นามสกุล */}
      <InputGroup 
        id="fullname"
        label="ชื่อ-นามสกุล (ชื่อเล่น)"
        icon={IconUser}
        placeholder="เช่น สมชาย ใจดี (ชาย)"
        value={formData.fullName}
        onChange={(e: any) => setFormData({...formData, fullName: e.target.value})}
        focusedField={focusedField}
        setFocusedField={setFocusedField}
      />

      {/* 2. เบอร์โทรศัพท์ */}
      <InputGroup 
        id="phone"
        label="เบอร์โทรศัพท์ (Login)"
        icon={IconPhone}
        type="tel"
        maxLength={10}
        placeholder="081xxxxxxx"
        value={formData.phone}
        onChange={(e: any) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
        focusedField={focusedField}
        setFocusedField={setFocusedField}
      />

      {/* 3. Username */}
      <InputGroup 
        id="username"
        label="ชื่อบัญชี (Username)"
        icon={IconMail}
        placeholder="somchai99"
        value={formData.username}
        onChange={(e: any) => setFormData({...formData, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '')})}
        suffix="@gmail.com"
        focusedField={focusedField}
        setFocusedField={setFocusedField}
        autoComplete="off" 
      />

      {/* 4. Password */}
      <InputGroup 
        id="password"
        label="รหัสผ่านเริ่มต้น"
        icon={IconLock}
        placeholder="••••••••"
        value={formData.password}
        onChange={(e: any) => setFormData({...formData, password: e.target.value})}
        isPasswordToggle={true}
        focusedField={focusedField}
        setFocusedField={setFocusedField}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        autoComplete="new-password"
      />
      
      {/* 5. Password Hint */}
      <div className="flex items-start gap-2 px-1">
        <div className={`mt-1 w-1.5 h-1.5 rounded-full ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
        <p className="text-xs text-slate-500">
           รหัสผ่านควรมีความยาวอย่างน้อย 6 ตัวอักษร
        </p>
      </div>

      <div className="pt-2"></div>

      <button 
        type="submit" 
        disabled={loading || !formData.username || !formData.password || !formData.fullName}
        className={`
            w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 
            transition-all duration-300 flex items-center justify-center gap-2
            ${loading || !formData.username 
                ? 'bg-slate-300 cursor-not-allowed transform-none' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]'
            }
        `}
      >
        {loading ? (
            <>
                <Spinner />
                <span>กำลังบันทึกข้อมูล...</span>
            </>
        ) : (
            <>
                <span>บันทึกพนักงาน</span>
                <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </>
        )}
      </button>

    </form>
  )
}