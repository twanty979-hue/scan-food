// app/api/setup/tutorial/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const generateRandomToken = () => Math.random().toString(36).substring(2, 10);

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    const { brandId, timezone } = await request.json();

    if (!brandId || !timezone) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // 1. อัปเดต Timezone
    await supabaseAdmin.from('brands').update({ timezone }).eq('id', brandId);

    // 2. สร้างโต๊ะเริ่มต้น (10 โต๊ะ)
    const tablesData = Array.from({ length: 10 }, (_, i) => ({
      brand_id: brandId,
      label: `T-${i + 1}`,
      capacity: 4,
      status: 'available',
      access_token: generateRandomToken()
    }));
    await supabaseAdmin.from('tables').insert(tablesData);

    // 3. สร้าง Banner เริ่มต้น
    await supabaseAdmin.from('banners').insert([{ 
      brand_id: brandId, 
      image_name: 'https://img.pos-foodscan.com/268dccbf-a568-4a90-b184-d23811937d9f/1772290694984-1772290692774.webp', 
      title: 'Welcome', 
      sort_order: 1 
    }]);

    // 4. ดึงข้อมูลสินค้าตัวอย่างและจัดการ Categories
    const { data: sourceCats } = await supabaseAdmin.from('categoriesphotoadmin').select('*');
    const { data: sourceImages } = await supabaseAdmin.from('images').select('*');

    if (sourceCats && sourceImages) {
      const catMap: Record<number, string> = {};
      for (const cat of sourceCats) {
        const { data: newCat } = await supabaseAdmin.from('categories')
          .insert({ brand_id: brandId, name: cat.name, is_active: true })
          .select().single();
        if (newCat) catMap[cat.id] = newCat.id;
      }

      const productsToInsert = sourceImages.map((img, index) => ({
        brand_id: brandId,
        name: img.name,
        image_name: img.url,
        price: img.price || 0,
        category_id: img.category_id ? catMap[img.category_id] : null,
        is_available: true,
        is_recommended: index < 4 
      }));
      await supabaseAdmin.from('products').insert(productsToInsert);
    }

    const response = NextResponse.json({ success: true, message: "System configured successfully" });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}