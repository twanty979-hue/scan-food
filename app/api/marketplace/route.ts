// app/api/marketplace/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const PURCHASED_THEME_TYPES = ['free', 'weekly', 'monthly', 'yearly', 'lifetime'];
const CDN_BASE_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://img.pos-foodscan.com';
const DAY_MS = 24 * 60 * 60 * 1000;

type BrandRow = {
  coins?: number | null;
  plan?: string | null;
  expiry_basic?: string | null;
  expiry_pro?: string | null;
  expiry_ultimate?: string | null;
};

type OwnedThemeRow = {
  id?: string;
  marketplace_theme_id: string;
  purchase_type?: string | null;
  expires_at?: string | null;
  updated_at?: string | null;
};

type MarketplaceThemeRow = Record<string, unknown> & {
  id: string;
  image_url?: string | null;
  preview_image?: string | null;
  image_path?: string | null;
  gallery?: unknown;
  min_plan?: string | null;
  marketplace_categories?: unknown;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

const getSupabaseAndBrandInfo = async (request: Request) => {
  const authHeader = request.headers.get('authorization');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error('Unauthorized');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('brand_id, role')
    .eq('id', user.id)
    .single();

  if (profileError) throw profileError;
  if (!profile?.brand_id) throw new Error('No brand assigned');

  return {
    supabase,
    userId: user.id,
    brandId: profile.brand_id,
    isOwner: profile.role === 'owner',
  };
};

const isFutureDate = (date: string | null | undefined) => {
  if (!date) return false;
  return new Date(date).getTime() > Date.now();
};

const calculateEffectivePlan = (brand: BrandRow) => {
  if (isFutureDate(brand?.expiry_ultimate)) return 'ultimate';
  if (isFutureDate(brand?.expiry_pro)) return 'pro';
  if (isFutureDate(brand?.expiry_basic)) return 'basic';
  return 'free';
};

const getImageUrl = (fileName: string | null | undefined) => {
  if (!fileName || fileName.trim() === '') return `${CDN_BASE_URL}/placeholder.png`;

  if (fileName.includes('supabase.co')) {
    const cleanFileName = fileName.split('/').pop();
    return `${CDN_BASE_URL}/themes/${cleanFileName}`;
  }

  if (fileName.startsWith('http')) return fileName;
  if (fileName.startsWith('themes/')) return `${CDN_BASE_URL}/${fileName}`;
  return `${CDN_BASE_URL}/themes/${fileName}`;
};

const getGalleryItems = (gallery: unknown, key: 'mobile' | 'ipad') => {
  if (!gallery || typeof gallery !== 'object') return [];

  const value = (gallery as Record<string, unknown>)[key];
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is string => typeof item === 'string');
};

const normalizeGallery = (gallery: unknown) => {
  const mobile = getGalleryItems(gallery, 'mobile');
  const ipad = getGalleryItems(gallery, 'ipad');

  return {
    mobile: mobile.map(getImageUrl),
    ipad: ipad.map(getImageUrl),
  };
};

const formatOwnership = (ownedTheme: OwnedThemeRow | null) => {
  if (!ownedTheme) {
    return {
      is_owned: false,
      type: null,
      expires_at: null,
      days_left: null,
      is_expired: false,
    };
  }

  const expiresAt = ownedTheme.expires_at || null;
  const expiresAtMs = expiresAt ? new Date(expiresAt).getTime() : null;
  const isExpired = Boolean(expiresAtMs && expiresAtMs < Date.now());
  const daysLeft = expiresAtMs ? Math.max(0, Math.ceil((expiresAtMs - Date.now()) / DAY_MS)) : null;

  return {
    is_owned: true,
    type: ownedTheme.purchase_type || null,
    expires_at: expiresAt,
    days_left: daysLeft,
    is_expired: isExpired,
  };
};

const getCategoryName = (category: unknown) => {
  const categoryRow = Array.isArray(category) ? category[0] : category;
  if (!categoryRow || typeof categoryRow !== 'object') return 'Uncategorized';

  const name = (categoryRow as Record<string, unknown>).name;
  return typeof name === 'string' && name.trim() ? name : 'Uncategorized';
};

const formatTheme = (theme: MarketplaceThemeRow, ownedTheme: OwnedThemeRow | null = null) => {
  const rawImageUrl = theme.image_url || theme.preview_image || theme.image_path || null;
  const ownership = formatOwnership(ownedTheme);

  return {
    ...theme,
    price: theme.price, // 🚀 เพิ่มบรรทัดนี้ลงไป เพื่อดึงราคาจาก Database ส่งให้ Flutter!
    raw_image_url: rawImageUrl,
    image_url: getImageUrl(rawImageUrl),
    gallery_urls: normalizeGallery(theme.gallery),
    category_name: getCategoryName(theme.marketplace_categories),
    is_owned: ownership.is_owned,
    ownership,
  };
};

const buildTierCounts = (themes: MarketplaceThemeRow[]) => {
  const counts = { ALL: themes.length, FREE: 0, BASIC: 0, PRO: 0, ULTIMATE: 0 };

  themes.forEach((theme) => {
    const plan = (theme.min_plan || 'free').toUpperCase();
    if (plan === 'FREE') counts.FREE += 1;
    else if (plan === 'BASIC') counts.BASIC += 1;
    else if (plan === 'PRO') counts.PRO += 1;
    else if (plan === 'ULTIMATE') counts.ULTIMATE += 1;
  });

  return counts;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === 'string') return message;
  }
  return 'Unknown error';
};

const getStatusFromError = (error: unknown) => {
  const message = getErrorMessage(error);
  if (message === 'Unauthorized') return 401;
  if (message === 'Theme not found') return 404;
  return 500;
};

export async function GET(request: Request) {
  try {
    const { supabase, brandId, isOwner } = await getSupabaseAndBrandInfo(request);
    const { searchParams } = new URL(request.url);
    const themeId = searchParams.get('id') || searchParams.get('theme_id');

    const [brandRes, ownedThemesRes] = await Promise.all([
      supabase
        .from('brands')
        .select('coins, plan, expiry_basic, expiry_pro, expiry_ultimate')
        .eq('id', brandId)
        .single(),
      supabase
        .from('themes')
        .select('id, marketplace_theme_id, purchase_type, expires_at, updated_at')
        .eq('brand_id', brandId)
        .in('purchase_type', PURCHASED_THEME_TYPES),
    ]);

    if (brandRes.error) throw brandRes.error;
    if (ownedThemesRes.error) throw ownedThemesRes.error;

    const brand = (brandRes.data || {}) as BrandRow;
    const currentPlan = calculateEffectivePlan(brand);
    const coins = brand.coins || 0;
    const ownedThemes = ((ownedThemesRes.data || []) as OwnedThemeRow[]).filter(
      (theme) => theme.marketplace_theme_id
    );
    const ownedThemesByMarketplaceId = new Map(
      ownedThemes.map((theme) => [theme.marketplace_theme_id, theme])
    );
    const ownedThemeIds = ownedThemes.map((theme) => theme.marketplace_theme_id);

    if (themeId) {
      const { data: themeData, error: themeError } = await supabase
        .from('marketplace_themes')
        .select('*, min_plan, marketplace_categories(name)')
        .eq('id', themeId)
        .eq('is_active', true)
        .single();

      if (themeError || !themeData) throw new Error('Theme not found');
      const theme = themeData as MarketplaceThemeRow;

      const response = NextResponse.json({
        success: true,
        brand_id: brandId,
        coins,
        user_coins: coins,
        currentPlan,
        current_plan: currentPlan,
        isOwner,
        is_owner: isOwner,
        theme: formatTheme(theme, ownedThemesByMarketplaceId.get(theme.id) || null),
      });

      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    const [categoriesRes, themesRes] = await Promise.all([
      supabase.from('marketplace_categories').select('*').order('name'),
      supabase
        .from('marketplace_themes')
        .select('*, min_plan, marketplace_categories(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false }),
    ]);

    if (categoriesRes.error) throw categoriesRes.error;
    if (themesRes.error) throw themesRes.error;

    const themes = ((themesRes.data || []) as MarketplaceThemeRow[]).map((theme) =>
      formatTheme(theme, ownedThemesByMarketplaceId.get(theme.id) || null)
    );

    const tierCounts = buildTierCounts(themes);
    const response = NextResponse.json({
      success: true,
      brand_id: brandId,
      coins,
      user_coins: coins,
      currentPlan,
      current_plan: currentPlan,
      isOwner,
      is_owner: isOwner,
      categories: categoriesRes.data || [],
      themes,
      ownedThemeIds,
      owned_theme_ids: ownedThemeIds,
      tierCounts,
      tier_counts: tierCounts,
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } catch (error: unknown) {
    const status = getStatusFromError(error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
