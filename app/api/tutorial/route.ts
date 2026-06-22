import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const admin = () => createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

const generateRandomToken = () => Math.random().toString(36).substring(2, 10)

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null
    if (!token) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบใหม่' }, { status: 401 })
    }
    const db = admin()
    const { data: { user }, error: authError } = await db.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' }, { status: 401 })
    }
    const { brandId, timezone } = await request.json()
    if (!brandId || !timezone) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 })
    }
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('brand_id')
      .eq('id', user.id)
      .maybeSingle()
    if (profileError || profile?.brand_id !== brandId) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ตั้งค่าร้านนี้' }, { status: 403 })
    }

    const { error: timezoneError } = await db
      .from('brands')
      .update({ timezone })
      .eq('id', brandId)
    if (timezoneError) throw timezoneError

    const { count: tableCount } = await db
      .from('tables')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', brandId)
    if (!tableCount) {
      const tables = Array.from({ length: 10 }, (_, index) => ({
        brand_id: brandId,
        label: `T-${index + 1}`,
        capacity: 4,
        status: 'available',
        access_token: generateRandomToken(),
      }))
      const { error } = await db.from('tables').insert(tables)
      if (error) throw error
    }

    const { count: bannerCount } = await db
      .from('banners')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', brandId)
    if (!bannerCount) {
      const { error } = await db.from('banners').insert({
        brand_id: brandId,
        image_name: 'https://img.pos-foodscan.com/268dccbf-a568-4a90-b184-d23811937d9f/1772290694984-1772290692774.webp',
        title: 'Welcome',
        sort_order: 1,
      })
      if (error) throw error
    }

    const { count: productCount } = await db
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', brandId)
    let seededProducts = false
    if (!productCount) {
      const [{ data: sourceCategories, error: categorySourceError }, { data: sourceImages, error: imageSourceError }] = await Promise.all([
        db.from('categoriesphotoadmin').select('*'),
        db.from('images').select('*'),
      ])
      if (categorySourceError) throw categorySourceError
      if (imageSourceError) throw imageSourceError
      const categoryMap: Record<string, string> = {}
      for (const category of sourceCategories || []) {
        const { data: createdCategory, error } = await db
          .from('categories')
          .insert({ brand_id: brandId, name: category.name, is_active: true })
          .select('id')
          .single()
        if (error) throw error
        categoryMap[String(category.id)] = createdCategory.id
      }
      const products = (sourceImages || []).map((image, index) => ({
        brand_id: brandId,
        name: image.name,
        image_name: image.url,
        price: image.price || 0,
        category_id: image.category_id
          ? categoryMap[String(image.category_id)] || null
          : null,
        is_available: true,
        is_recommended: index < 4,
      }))
      if (products.length) {
        const { error } = await db.from('products').insert(products)
        if (error) throw error
        seededProducts = true
      }
    }

    return NextResponse.json({
      success: true,
      seededProducts,
      message: 'System configured successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Setup failed' },
      { status: 500 },
    )
  }
}
