import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import OwnerTabs from './components/OwnerTabs' // นำเข้า Tab Bar

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Security Check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'owner') {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col h-full">
      {/* ✅ 1. ใส่ Tab Bar ตรงนี้ (มันจะไปโผล่ใต้ Header ของ DashboardLayout) */}
      <OwnerTabs /> 

      {/* ✅ 2. เนื้อหา (Products, Tables, etc.) */}
      <div className="flex-1 bg-slate-50/50">
        {children}
      </div>
    </div>
  )
}