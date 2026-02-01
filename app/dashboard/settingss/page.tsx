// app/dashboard/settingss/page.tsx (หรือ path ที่คุณสร้างหน้าจัดการพนักงาน)
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation' // ✅ 1. Import redirect
import EmployeeManager from './components/EmployeeManager'

export default async function ManageStaffPage() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  )

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login') // ถ้าไม่มี user ดีดไป login

  // ดึง Profile เพื่อเอา brand_id
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('brand_id')
    .eq('id', user.id)
    .single()

  if (!profile?.brand_id) return <div>ไม่พบข้อมูลร้านค้า</div>

  // ✅ 2. ดึงข้อมูล Plan ของร้านค้ามาเช็ค (Security Check)
  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('plan')
    .eq('id', profile.brand_id)
    .single()

  const currentPlan = brand?.plan || 'free';
  const ALLOWED_PLANS = ['pro', 'ultimate'];

  // ⛔️ ถ้าไม่ใช่ Pro หรือ Ultimate ให้ดีดกลับไปหน้า Settings
  if (!ALLOWED_PLANS.includes(currentPlan)) {
    redirect('/dashboard/settings')
  }

  // --- ถ้าผ่านเงื่อนไขข้างบนมาได้ ถึงจะยอมดึงข้อมูลพนักงาน ---

  const { data: employees } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('brand_id', profile.brand_id)
    .neq('role', 'owner') 
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">จัดการพนักงาน</h1>
        <p className="text-slate-500 text-sm">เพิ่มลบและกำหนดสิทธิ์การเข้าถึง</p>
      </div>

      <EmployeeManager 
        initialEmployees={employees || []} 
        brandId={profile.brand_id} 
      />
    </div>
  )
}