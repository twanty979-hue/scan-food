// app/actions/shop.ts
'use server'

import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { checkOrderLimitOrThrow } from './limitGuard';
import { sendBrandNotification } from '@/lib/brandNotifications';

// 🌟 ตัวแปรดึง URL ของ Cloudflare จาก .env
const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";
const PURCHASED_THEME_TYPES = ['free', 'weekly', 'monthly', 'yearly', 'lifetime'];

// ✅ 1. Banner มาตรฐาน (จะถูกบังคับใช้เมื่อหมดโปร)
// (⚠️ ตอนนี้ Banner พื้นฐานก็ควรเปลี่ยนเป็นชื่อไฟล์ที่อยู่ใน R2 ด้วยนะ หรือเป็น URL ตรงๆ เลย)
const STANDARD_BANNERS = [
  {
    id: 'default-standard',
    image_name: 'system/standard_banner_default.jpg', // 👈 ใส่โฟลเดอร์ให้ชัดเจน หรือใช้ชื่อเต็มไปเลย
    title: 'Standard Mode',
    link_url: null,
    sort_order: 0,
    is_active: true
  }
];

// ✅ สร้าง Client
const supabaseServer = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

type ShopParams = {
  brandId: string;
  combinedId: string;
  slug: string;
};

const getQrMode = (brand: any) => brand?.table_qr_mode || brand?.config?.qr_mode || 'rotating';
const shouldRequireTableToken = (brand: any) => getQrMode(brand) !== 'static';
const getTableTokens = (table: any) => Array.isArray(table?.access_tokens) ? table.access_tokens.filter(Boolean).map(String) : [];
const isValidTableToken = (table: any, token: string) => {
  const tokens = getTableTokens(table);
  if (tokens.length > 0) return tokens.includes(token);
  return table?.access_token === token;
};

const roundToQuarter = (value: number) => Math.round(value * 4) / 4;
const ALLOWED_VARIANTS = new Set(['normal', 'special', 'jumbo']);

function productPrice(product: any, variant: string) {
  if (variant === 'special') return Number(product.price_special ?? product.price ?? 0);
  if (variant === 'jumbo') return Number(product.price_jumbo ?? product.price ?? 0);
  return Number(product.price ?? 0);
}

function calculateServerPrice(
  product: any,
  variant: string,
  discounts: any[],
) {
  const original = roundToQuarter(productPrice(product, variant));
  const now = new Date();
  const applicable = discounts.filter((discount) => {
    if (discount.start_date && new Date(discount.start_date) > now) return false;
    if (discount.end_date && new Date(discount.end_date) < now) return false;
    if (variant === 'normal' && !discount.apply_normal) return false;
    if (variant === 'special' && !discount.apply_special) return false;
    if (variant === 'jumbo' && !discount.apply_jumbo) return false;
    if (discount.apply_to === 'all') return true;
    return (
      discount.apply_to === 'specific' &&
      discount.discount_products?.some(
        (item: any) => String(item.product_id) === String(product.id),
      )
    );
  });

  const final = applicable.reduce((best, discount) => {
    const candidate =
      discount.type === 'percentage'
        ? original - (original * Number(discount.value || 0)) / 100
        : original - Number(discount.value || 0);
    return Math.min(best, Math.max(0, candidate));
  }, original);

  const roundedFinal = roundToQuarter(final);
  return {
    original,
    final: roundedFinal,
    discount: Math.max(0, original - roundedFinal),
  };
}

// Helper Function: แปลงชื่อรูปเป็น Cloudflare URL เต็มๆ
const getImageUrl = (imageName: string | null) => {
    if (!imageName) return null;
    if (imageName.startsWith('http')) return imageName;
    // คืนค่า https://img.pos-foodscan.com/ชื่อรูป.webp
    return `${CDN_URL}/${imageName}`;
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
      .select('label, access_token, access_tokens, brand_id')
      .eq('id', realTableId)
      .eq('brand_id', brandId)
      .single();

    if (tableError || !tableData) {
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

    if (shouldRequireTableToken(brandData) && !isValidTableToken(tableData, providedCode)) {
      return { success: false, error: 'Invalid Table or Access Code' };
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
            .select('expires_at, purchase_type, marketplace_themes!inner(theme_mode)')
            .eq('brand_id', brandId)
            .eq('marketplace_themes.theme_mode', brandData.theme_mode) 
            .in('purchase_type', PURCHASED_THEME_TYPES)
            .single();

        const isLifetime = themeUsage?.purchase_type === 'lifetime';
        const isExpired = themeUsage?.expires_at && new Date(themeUsage.expires_at) < new Date();
        let hasFreeThemeAccess = false;

        if (!themeUsage) {
            const { data: freeTheme } = await supabaseServer
                .from('marketplace_themes')
                .select('id')
                .eq('theme_mode', brandData.theme_mode)
                .eq('is_active', true)
                .eq('min_plan', 'free')
                .maybeSingle();

            hasFreeThemeAccess = !!freeTheme;
        }

        if ((!themeUsage && !hasFreeThemeAccess) || (!isLifetime && isExpired)) {
            console.log(`⚠️ Theme "${brandData.theme_mode}" Expired for Brand ${brandId}. Reverting to Standard.`);
            
            brandData.theme_mode = 'standard'; 
            isPlanExpired = true;

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
      supabaseServer.from('orders').select(`*, order_items(*)`).eq('brand_id', brandId).eq('table_id', realTableId).neq('status', 'paid').order('created_at', { ascending: false })
    ]);

    // ---------------------------------------------------------
    // 🎨 BANNERS LOGIC (บังคับใช้ Standard Banner ถ้าหมดอายุ)
    // ---------------------------------------------------------
    let finalBanners = bannerRes.data || [];

    if (isPlanExpired) {
        console.log("🔒 Plan Expired: Forcing Standard Banners");
        finalBanners = STANDARD_BANNERS as any; 
    }

    // 🚀 NEW LOGIC: แปลง image_name ให้เป็น Cloudflare URL แบบเต็มก่อนส่งไปหน้าบ้าน
    // เพื่อให้โค้ด UI หน้าบ้านไม่ต้องเขียน CDN_URL ซ้ำซ้อน และใช้รูปได้เลย
    const mappedBanners = finalBanners.map(b => ({
      ...b,
      image_url: getImageUrl(b.image_name) // เพิ่ม property image_url เข้าไป
    }));

    const mappedProducts = (prodRes.data || []).map(p => ({
      ...p,
      image_url: getImageUrl(p.image_name) // เพิ่ม property image_url เข้าไป
    }));

    return {
      success: true,
      data: {
        brand: brandData, 
        tableLabel: tableData.label,
        banners: mappedBanners, // ✅ ส่งแบนเนอร์ที่แปลงเป็น R2 URL แล้ว
        categories: catRes.data?.length ? [{ id: "all", name: "All" }, ...catRes.data] : [{ id: "all", name: "All" }],
        products: mappedProducts, // ✅ ส่งเมนูอาหารที่แปลงเป็น R2 URL แล้ว
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
export async function fetchShopOrderStatus(params: ShopParams) {
  const { brandId, combinedId } = params;
  const realTableId = combinedId?.substring(0, 36);
  const providedCode = combinedId?.substring(36);

  try {
    const { data: table } = await supabaseServer
      .from('tables')
      .select(
        'access_token, access_tokens, brand_id, brands!inner(config, table_qr_mode)',
      )
      .eq('id', realTableId)
      .eq('brand_id', brandId)
      .single();

    const brand = (table as any)?.brands;
    if (
      !table ||
      (shouldRequireTableToken(brand) &&
        !isValidTableToken(table, providedCode))
    ) {
      return { success: false, error: 'Invalid Table or Access Code' };
    }

    const { data: orders, error } = await supabaseServer
      .from('orders')
      .select('*, order_items(*)')
      .eq('brand_id', brandId)
      .eq('table_id', realTableId)
      .neq('status', 'paid')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, orders: orders || [] };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Unable to refresh orders',
    };
  }
}

export async function submitOrder(payload: {
  brandId: string;
  combinedId: string;
  tableLabel: string;
  totalPrice: number;
  cart: any[];
}) {
  const { brandId, combinedId, tableLabel, cart } = payload;
  const realTableId = combinedId?.substring(0, 36);
  const providedCode = combinedId?.substring(36);

  try {
    if (!Array.isArray(cart) || cart.length === 0 || cart.length > 100) {
      return { success: false, error: 'Invalid cart' };
    }

    const { data: checkTable } = await supabaseServer
      .from('tables')
      .select('access_token, access_tokens, brand_id, brands!inner(config, table_qr_mode)')
      .eq('id', realTableId)
      .eq('brand_id', brandId)
      .single();

    const requiresToken = shouldRequireTableToken((checkTable as any)?.brands);
    if (!checkTable || (requiresToken && !isValidTableToken(checkTable, providedCode))) {
      return { success: false, error: 'Security Check Failed: Invalid Table Access' };
    }

    try {
      await checkOrderLimitOrThrow(brandId);
    } catch (limitErr: any) {
      return {
        success: false,
        code: 'ORDER_LIMIT_REACHED',
        error: limitErr?.message || 'ร้านนี้ถึงขีดจำกัดแพ็กเกจ กรุณาให้ร้านสมัครสมาชิกเพื่อใช้งานต่อ'
      };
    }

    const productIds = [...new Set(cart.map((item) => String(item.id || '')))]
      .filter(Boolean);
    const [{ data: productRows, error: productError }, { data: discountRows, error: discountError }] =
      await Promise.all([
        supabaseServer
          .from('products')
          .select('id,name,price,price_special,price_jumbo,is_available')
          .eq('brand_id', brandId)
          .eq('is_available', true)
          .in('id', productIds),
        supabaseServer
          .from('discounts')
          .select('*, discount_products(product_id)')
          .eq('brand_id', brandId)
          .eq('is_active', true),
      ]);

    if (productError || discountError) {
      throw productError || discountError;
    }

    const productsById = new Map(
      (productRows || []).map((product) => [String(product.id), product]),
    );
    const securedItems = cart.map((item) => {
      const product = productsById.get(String(item.id));
      const quantity = Number(item.quantity);
      const variant = String(item.variant || 'normal');
      const note = String(item.note || '').trim().slice(0, 300);

      if (
        !product ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 99 ||
        !ALLOWED_VARIANTS.has(variant)
      ) {
        throw new Error('Invalid product, quantity, or variant');
      }

      const pricing = calculateServerPrice(product, variant, discountRows || []);
      return {
        product,
        quantity,
        variant,
        note: note || null,
        pricing,
      };
    });
    const serverTotal = roundToQuarter(
      securedItems.reduce(
        (sum, item) => sum + item.pricing.final * item.quantity,
        0,
      ),
    );

    const { data: order, error: orderErr } = await supabaseServer
      .from('orders')
      .insert([{
        brand_id: brandId,
        table_id: realTableId,
        table_label: tableLabel,
        total_price: serverTotal,
        status: 'pending',
        table_access_token: requiresToken ? providedCode : null
      }])
      .select()
      .single();

    if (orderErr) throw orderErr;

    const orderItemsPayload = securedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      price: item.pricing.final,
      variant: item.variant,
      note: item.note,
      original_price: item.pricing.original,
      discount: item.pricing.discount,
      promotion_snapshot: {
        base_price: item.pricing.original,
        final_price: item.pricing.final,
        discount_amount: item.pricing.discount,
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
      .eq('brand_id', brandId)
      .eq('table_id', realTableId)
      .neq('status', 'paid')
      .order('created_at', { ascending: false });

    await sendBrandNotification({
      brandId,
      title: 'มีออเดอร์ใหม่!',
      message: `โต๊ะ ${tableLabel} สั่งอาหาร`,
      type: 'NEW_ORDER',
      orderData: {
        tableName: String(tableLabel),
        time: new Date().toLocaleString('th-TH'),
        orderId: String(order.id),
        items: securedItems.map((item) => ({
          name: String(item.product.name),
          qty: item.quantity,
          variant: item.variant,
          note: item.note || '',
          isCancelled: false,
        })),
      },
    }).catch((error) => {
      console.error('Order notification failed:', error);
    });

    return { success: true, orders: updatedOrders || [] };

  } catch (err: any) {
    console.error("Checkout Error:", err);
    return { success: false, error: err.message };
  }
}
