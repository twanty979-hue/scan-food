// app/actions/shop.ts
'use server'

import { createClient } from '@supabase/supabase-js';

// ✅ 1. Banner มาตรฐาน (จะถูกบังคับใช้เมื่อหมดโปร)
// (⚠️ อย่าลืมอัปโหลดรูปชื่อ 'standard_banner_default.jpg' เข้า Storage ของคุณนะครับ)
const STANDARD_BANNERS = [
  {
    id: 'default-standard',
    image_name: 'standard_banner_default.jpg', // 👈 แก้ชื่อไฟล์ตรงนี้ให้ตรงกับรูปใน Storage
    title: 'Standard Mode',
    link_url: null,
    sort_order: 0,
    is_active: true
  }
];

// ✅ สร้าง Client
const supabaseServer = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

type ShopParams = {
  brandId: string;
  combinedId: string;
  slug: string;
};

// --- Action 1: ดึงข้อมูลร้านค้า (Initial Data) ---
export async function fetchShopData(params: ShopParams) {
  const { brandId, combinedId, slug } = params;
  const realTableId = combinedId?.substring(0, 36);
  const providedCode = combinedId?.substring(36);

  try {
    // 1. ตรวจสอบ Table & Code
    const { data: tableData, error: tableError } = await supabaseServer
      .from('tables')
      .select('label, access_token')
      .eq('id', realTableId)
      .single();

    if (tableError || !tableData || tableData.access_token !== providedCode) {
      return { success: false, error: 'Invalid Table or Access Code' };
    }

    // 2. ตรวจสอบ Brand
    const { data: brandData, error: brandError } = await supabaseServer
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .single();

    if (brandError || !brandData) {
      return { success: false, error: 'Brand Not Found' };
    }

    // Check Slug mismatch
    const dbSlug = brandData.slug || 'shop';
    if (slug && slug !== dbSlug) {
      return { 
        success: false, 
        redirect: `/${dbSlug}/${brandId}/table/${combinedId}` 
      };
    }

    // ---------------------------------------------------------
    // 🛡️ KILL SWITCH LOGIC (ระบบตรวจสอบวันหมดอายุ)
    // ---------------------------------------------------------
    let isPlanExpired = false;

    // ถ้าไม่ใช่ Standard -> ต้องตรวจสิทธิ์การใช้งาน
    if (brandData.theme_mode && brandData.theme_mode !== 'standard') {
        const { data: themeUsage } = await supabaseServer
            .from('themes')
            // ✅ ดึง expires_at และ purchase_type มาตรวจสอบ
            .select('expires_at, purchase_type, marketplace_themes!inner(theme_mode)')
            .eq('brand_id', brandId)
            // หาธีมที่ตรงกับ Mode ปัจจุบันของร้าน
            .eq('marketplace_themes.theme_mode', brandData.theme_mode) 
            .single();

        // ตรวจสอบสถานะ Lifetime และ วันหมดอายุ
        const isLifetime = themeUsage?.purchase_type === 'lifetime';
        const isExpired = themeUsage?.expires_at && new Date(themeUsage.expires_at) < new Date();

        // 🚨 เงื่อนไขการตัดสิทธิ์:
        // 1. หาไม่เจอ (อาจจะแอบเปลี่ยนค่าใน DB เอง)
        // 2. ไม่ใช่ Lifetime (เป็น Monthly) AND หมดอายุแล้ว
        if (!themeUsage || (!isLifetime && isExpired)) {
            console.log(`⚠️ Theme "${brandData.theme_mode}" Expired for Brand ${brandId}. Reverting to Standard.`);
            
            // 1. เปลี่ยนค่าในตัวแปรทันที (เพื่อให้หน้าเว็บแสดงผลเป็น Standard เดี๋ยวนี้)
            brandData.theme_mode = 'standard'; 
            isPlanExpired = true;

            // 2. สั่งอัปเดต Database ทันที (ใช้ await เพื่อความชัวร์ว่าค่าเปลี่ยนจริง)
            await supabaseServer
                .from('brands')
                .update({ theme_mode: 'standard' })
                .eq('id', brandId);
        }
    }

    // 3. ดึงข้อมูลอื่นๆ แบบ Parallel
    const [bannerRes, catRes, prodRes, discRes, ordersRes] = await Promise.all([
      supabaseServer.from('banners').select('*').eq('brand_id', brandId).eq('is_active', true).order('sort_order'),
      supabaseServer.from('categories').select('*').eq('brand_id', brandId).eq('is_active', true).order('sort_order'),
      supabaseServer.from('products').select('*').eq('brand_id', brandId).eq('is_available', true).order('is_recommended', { ascending: false }),
      supabaseServer.from('discounts').select(`*, discount_products(product_id)`).eq('brand_id', brandId).eq('is_active', true),
      supabaseServer.from('orders').select(`*, order_items(*)`).eq('table_id', realTableId).neq('status', 'paid').order('created_at', { ascending: false })
    ]);

    // ---------------------------------------------------------
    // 🎨 BANNERS LOGIC (บังคับใช้ Standard Banner ถ้าหมดอายุ)
    // ---------------------------------------------------------
    let finalBanners = bannerRes.data || [];

    if (isPlanExpired) {
        console.log("🔒 Plan Expired: Forcing Standard Banners");
        // ⛔️ ถ้าหมดอายุ: บังคับใช้ Banner มาตรฐานทันที (ไม่สน DB)
        finalBanners = STANDARD_BANNERS as any; 
    }

    return {
      success: true,
      data: {
        brand: brandData, // ✅ ค่านี้จะเป็น 'standard' ถ้าหมดอายุ
        tableLabel: tableData.label,
        banners: finalBanners, // ✅ ค่านี้จะเป็น STANDARD_BANNERS ถ้าหมดอายุ
        categories: catRes.data?.length ? [{ id: "all", name: "All" }, ...catRes.data] : [{ id: "all", name: "All" }],
        products: prodRes.data || [],
        discounts: discRes.data || [],
        orders: ordersRes.data || []
      }
    };

  } catch (err: any) {
    console.error("Server Fetch Error:", err);
    return { success: false, error: err.message };
  }
}

// --- Action 2: สั่งซื้อสินค้า (Checkout) - คงเดิม ---
export async function submitOrder(payload: {
  brandId: string;
  combinedId: string;
  tableLabel: string;
  totalPrice: number;
  cart: any[];
}) {
  const { brandId, combinedId, tableLabel, totalPrice, cart } = payload;
  const realTableId = combinedId?.substring(0, 36);
  const providedCode = combinedId?.substring(36);

  try {
    const { data: checkTable } = await supabaseServer
      .from('tables')
      .select('access_token')
      .eq('id', realTableId)
      .single();

    if (!checkTable || checkTable.access_token !== providedCode) {
      return { success: false, error: 'Security Check Failed: Invalid Table Access' };
    }

    const { data: order, error: orderErr } = await supabaseServer
      .from('orders')
      .insert([{
        brand_id: brandId,
        table_id: realTableId,
        table_label: tableLabel,
        total_price: totalPrice,
        status: 'pending'
      }])
      .select()
      .single();

    if (orderErr) throw orderErr;

    const orderItemsPayload = cart.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name || item.product_name,
      quantity: item.quantity,
      price: item.price,
      variant: item.variant,
      note: item.note || null,
      original_price: item.original_price,
      discount: item.discount,
      promotion_snapshot: {
        base_price: item.original_price,
        final_price: item.price,
        discount_amount: item.discount,
        applied_at: new Date().toISOString()
      }
    }));

    const { error: itemsErr } = await supabaseServer
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsErr) throw itemsErr;

    const { data: updatedOrders } = await supabaseServer
      .from('orders')
      .select(`*, order_items(*)`)
      .eq('table_id', realTableId)
      .neq('status', 'paid')
      .order('created_at', { ascending: false });

    return { success: true, orders: updatedOrders || [] };

  } catch (err: any) {
    console.error("Checkout Error:", err);
    return { success: false, error: err.message };
  }
}