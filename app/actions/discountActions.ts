// app/actions/discountActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper: สร้าง Client
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );
}

// Helper: หา Brand ID
async function getMyBrandId(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
  if (!profile?.brand_id) throw new Error("No brand assigned");
  return profile.brand_id;
}

// --- Actions ---

export async function getInitialDataAction() {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);

    // Run parallel queries
    const [discountsRes, productsRes, categoriesRes] = await Promise.all([
      supabase.from('discounts')
        .select(`id, name, type, value, apply_to, apply_normal, apply_special, apply_jumbo, start_date, end_date, discount_products(product_id)`)
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false }),
      supabase.from('products')
        .select('id, name, category_id, price, price_special, price_jumbo')
        .eq('brand_id', brandId),
      supabase.from('categories')
        .select('id, name')
        .eq('brand_id', brandId)
        .order('sort_order')
    ]);

    if (discountsRes.error) throw discountsRes.error;

    return { 
        success: true, 
        brandId,
        discounts: discountsRes.data || [],
        products: productsRes.data || [],
        categories: categoriesRes.data || []
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function upsertDiscountAction(payload: any, productIds: string[]) {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    
    // Base payload
    const discountData = {
        brand_id: brandId,
        name: payload.name,
        type: payload.type,
        value: payload.value,
        apply_to: payload.apply_to,
        apply_normal: payload.apply_normal,
        apply_special: payload.apply_special,
        apply_jumbo: payload.apply_jumbo,
        start_date: payload.start_date || null,
        end_date: payload.end_date || null
    };

    let discountId = payload.id;

    if (discountId) {
        // Update
        const { error } = await supabase.from('discounts').update(discountData).eq('id', discountId).eq('brand_id', brandId);
        if (error) throw error;
        
        // Clear old relations
        await supabase.from('discount_products').delete().eq('discount_id', discountId);
    } else {
        // Insert
        const { data, error } = await supabase.from('discounts').insert([discountData]).select('id').single();
        if (error) throw error;
        discountId = data.id;
    }

    // Insert new relations if needed
    if (payload.apply_to === 'specific' && productIds.length > 0 && discountId) {
        const relations = productIds.map(pId => ({ discount_id: discountId, product_id: pId }));
        const { error: relError } = await supabase.from('discount_products').insert(relations);
        if (relError) throw relError;
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDiscountAction(id: string) {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    const { error } = await supabase.from('discounts').delete().eq('id', id).eq('brand_id', brandId);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}