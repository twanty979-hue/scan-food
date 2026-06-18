// app/api/themes/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

// 🌐 จัดการ CORS Preflight ให้แอปยิงผ่านได้ฉลุย
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// 🔐 Helper พระเอกแกะตัวตนและสิทธิ์จาก Token
const getSupabaseAndBrandInfo = async (request: Request) => {
  const authHeader = request.headers.get('authorization');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('brand_id, role')
    .eq('id', user.id)
    .single();

  if (!profile?.brand_id) throw new Error('No brand assigned');
  return { supabase, brandId: profile.brand_id, isOwner: profile.role === 'owner' };
};

const PURCHASED_THEME_TYPES = ['free', 'weekly', 'monthly', 'yearly', 'lifetime'];

// 🏆 คำนวณหา Plan ปัจจุบันตามวันหมดอายุจริง
function calculateEffectivePlan(brand: any) {
  const now = dayjs();
  if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) return { plan: 'ultimate', expiry: brand.expiry_ultimate };
  if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) return { plan: 'pro', expiry: brand.expiry_pro };
  if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) return { plan: 'basic', expiry: brand.expiry_basic };
  return { plan: 'free', expiry: null };
}

// 🔄 ระบบ Sync สิทธิ์การใช้ธีมตามระดับ Plan (Smart Merge)
async function syncThemesWithPlan(supabase: any, brandId: string, plan: string, planExpiry: string | null) {
  return;
}

// 📥 [GET] ดึงข้อมูลสถานะธีมทั้งหมด
export async function GET(request: Request) {
  try {
    const { supabase, brandId, isOwner } = await getSupabaseAndBrandInfo(request);

    // 1. ดึงข้อมูลหมวดหมู่ (Categories) ทั้งหมด
    const { data: categories } = await supabase
      .from('marketplace_categories')
      .select('id, name')
      .order('name');

    // 2. ดึงข้อมูลสถานะแบรนด์และวันหมดอายุ Plan หลัก
    const { data: brand } = await supabase
      .from('brands')
      .select('slug, theme_mode, plan, expiry_basic, expiry_pro, expiry_ultimate')
      .eq('id', brandId)
      .single();

    if (!brand) throw new Error("Brand not found");

    // 3. รันระบบคำนวณและ Force Sync สิทธิ์ธีมให้ตรงกับความเป็นจริงล่าสุด
    const { plan: effectivePlan } = calculateEffectivePlan(brand);

    // อัปเดตข้อมูลระดับ Plan ล่าสุดลงตารางหลักถ้ามีการเปลี่ยนแปลง
    if (brand.plan !== effectivePlan) {
      await supabase.from('brands').update({ plan: effectivePlan }).eq('id', brandId);
    }

    // 4. ดึงรายการธีมที่แบรนด์นี้ถือครองสิทธิ์อยู่ทั้งหมด
    const { data: ownedThemes } = await supabase
      .from('themes')
      .select(`
        id, purchase_type, expires_at, marketplace_theme_id,
        marketplace_themes ( 
          name, slug, image_url, theme_mode, category_id, description,
          marketplace_categories ( name ) 
        )
      `)
      .eq('brand_id', brandId)
      .in('purchase_type', PURCHASED_THEME_TYPES)
      .order('created_at', { ascending: false });

    const { data: freeMarketplaceThemes } = await supabase
      .from('marketplace_themes')
      .select(`
        id, name, slug, image_url, theme_mode, category_id, description,
        marketplace_categories ( name )
      `)
      .eq('is_active', true)
      .eq('min_plan', 'free')
      .order('created_at', { ascending: false });

    const ownedThemeIds = new Set((ownedThemes || []).map((t: any) => t.marketplace_theme_id));
    const freeThemeRows = (freeMarketplaceThemes || [])
      .filter((theme: any) => !ownedThemeIds.has(theme.id))
      .map((theme: any) => ({
        id: `free-${theme.id}`,
        purchase_type: 'free',
        expires_at: null,
        marketplace_theme_id: theme.id,
        marketplace_themes: theme,
      }));
    const themes = [...(ownedThemes || []), ...freeThemeRows];

    // 5. 🚨 ระบบ Kill Switch ดึงสิทธิ์ธีมกลับหากตรวจพบว่าธีมปัจจุบันหมดอายุการใช้งานแล้ว
    let currentThemeMode = brand.theme_mode || 'standard';
    if (currentThemeMode !== 'standard') {
      const activeThemeExists = themes?.some((t: any) => {
        const isPermanent = t.purchase_type === 'free' || t.purchase_type === 'lifetime';
        const isUsable = isPermanent || Boolean(t.expires_at && dayjs(t.expires_at).isAfter(dayjs()));
        return t.marketplace_themes?.theme_mode === currentThemeMode && isUsable;
      });
      if (!activeThemeExists) {
        await supabase.from('brands').update({ theme_mode: 'standard' }).eq('id', brandId);
        currentThemeMode = 'standard';
      }
    }

    // 6. ปรุงข้อมูลเพื่อส่งให้หน้าบ้านเรนเดอร์ง่ายขึ้น (เพิ่มวันเวลาคงเหลือ)
    const processedThemes = themes?.map((theme: any) => {
      const isExpired = theme.expires_at && dayjs(theme.expires_at).isBefore(dayjs());
      let daysLeft: string | number = 'Lifetime';
      if (theme.expires_at) {
        const diff = dayjs(theme.expires_at).diff(dayjs(), 'day');
        daysLeft = diff < 0 ? 0 : diff;
      }
      return {
        ...theme,
        is_expired: isExpired,
        days_left: daysLeft
      };
    }) || [];

    const response = NextResponse.json({
      success: true,
      data: {
        themes: processedThemes,
        categories: categories || [],
        currentConfig: { slug: brand.slug || '', mode: currentThemeMode },
        currentPlan: effectivePlan,
        isOwner
      }
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
