// app/dashboard/settingss/page.tsx
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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
  if (!user) redirect('/login')

  // 1. ดึง Profile ของเจ้าของร้านเพื่อเอา brand_id หลัก
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('brand_id')
    .eq('id', user.id)
    .single()

  if (!profile?.brand_id) return <div className="p-6 text-slate-500">ไม่พบข้อมูลร้านค้าในระบบครับ</div>

  // 2. ตรวจสอบสิทธิ์ Plan ของร้านค้า (Security Check)
  const { data: brand } = await supabaseAdmin
    .from('brands')
    .select('plan')
    .eq('id', profile.brand_id)
    .single()

  const currentPlan = brand?.plan || 'free';
  const ALLOWED_PLANS = ['pro', 'ultimate'];

  if (!ALLOWED_PLANS.includes(currentPlan)) {
    redirect('/dashboard/settings')
  }

  // =====================================================================
  // 🟢 1. คิวรีดึงข้อมูลพนักงานปัจจุบัน + คนที่กำลังเชิญ (Pending)
  // =====================================================================
  const { data: rawEmployees } = await supabase
    .from('profiles')
    .select(`
      *,
      invitation_logs(role, status)
    `)
    .or(`brand_id.eq.${profile.brand_id},invited_brand_id.eq.${profile.brand_id}`)
    .order('created_at', { ascending: false });

  const employees = rawEmployees
    ?.filter(emp => emp.id !== user.id)
    .map(emp => {
      const pendingLog = Array.isArray(emp.invitation_logs) 
        ? emp.invitation_logs.find((log: any) => log.status === 'pending')
        : emp.invitation_logs;

      return {
        ...emp,
        invited_role: pendingLog?.role || null
      };
    }) || [];

  // =====================================================================
  // 📜 2. ดึงประวัติการเชิญทั้งหมด (Logs) ของร้านนี้ เพื่อไปทำตาราง History
  // =====================================================================
  const { data: inviteHistoryLogs } = await supabase
    .from('invitation_logs')
    .select(`
      id,
      status,
      role,
      created_at,
      updated_at,
      employee:employee_id(id, full_name, email, avatar_url)
    `)
    .eq('from_brand_id', profile.brand_id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto suppressHydrationWarning">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">จัดการพนักงาน</h1>
        <p className="text-slate-500 text-sm">เพิ่มลบและกำหนดสิทธิ์การเข้าถึงข้อมูลภายในร้าน</p>
      </div>

      <EmployeeManager 
        initialEmployees={employees} 
        brandId={profile.brand_id} 
        invitationLogs={inviteHistoryLogs || []} // 🚀 ส่งประวัติแนบไปให้หน้าจอด้วย
      />
    </div>
  )
}