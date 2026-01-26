// app/actions/tableActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper: สร้าง Client (ใช้ Key ฝั่ง Server)
async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.SUPABASE_URL!,       // ✅ เปลี่ยน
        process.env.SUPABASE_ANON_KEY!,  // ✅ เปลี่ยน
        { cookies: { get(name) { return cookieStore.get(name)?.value } } }
    );
}

// Helper: หา brand_id ของ User ปัจจุบัน (ใช้ซ้ำบ่อย แยกออกมาเลย)
async function getMyBrandId(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
    if (!profile?.brand_id) throw new Error("No brand assigned");
    
    return profile.brand_id;
}

// 1. ดึง Config
export async function getBrandConfigAction() {
    const supabase = await getSupabase();
    try {
        const brandId = await getMyBrandId(supabase); // ✅ ใช้ Helper

        const { data: brand } = await supabase
            .from('brands')
            .select('id, qr_image_url, slug')
            .eq('id', brandId)
            .single();

        let finalLogoUrl = null;
        if (brand?.qr_image_url) {
            const fullPath = `${brand.id}/${brand.qr_image_url}`;
            const { data } = supabase.storage.from('brands').getPublicUrl(fullPath);
            finalLogoUrl = data.publicUrl;
        }

        return { 
            success: true, 
            brandId: brandId, 
            qrLogoUrl: finalLogoUrl, 
            brandSlug: brand?.slug || 'shop' 
        };
    } catch (err: any) { 
        return { success: false, error: err.message }; 
    }
}

// 2. ดึงโต๊ะ
export async function getTablesAction() {
    const supabase = await getSupabase();
    try {
        const brandId = await getMyBrandId(supabase); // ✅ ใช้ Helper

        const { data, error } = await supabase
            .from('tables')
            .select('*')
            .eq('brand_id', brandId)
            .order('label', { ascending: true });

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// 3. เพิ่มโต๊ะ (❌ ไม่รับ brandId จาก Client แล้ว)
export async function addTableAction(label: string) {
    const supabase = await getSupabase();
    try {
        const brandId = await getMyBrandId(supabase); // ✅ หาเองจาก Session ปลอดภัยกว่า

        const { data, error } = await supabase.from('tables').insert({
            label, 
            brand_id: brandId, 
            status: 'available',
            access_token: Math.floor(1000 + Math.random() * 9000).toString()
        }).select().single();

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// 4. ลบโต๊ะ (✅ เช็คความเป็นเจ้าของก่อนลบ)
export async function deleteTableAction(id: string) {
    const supabase = await getSupabase();
    try {
        const brandId = await getMyBrandId(supabase);

        const { error } = await supabase
            .from('tables')
            .delete()
            .eq('id', id)
            .eq('brand_id', brandId); // ✅ ต้องตรงกับร้านเราเท่านั้น

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// 5. รีเซ็ต Passcode (✅ เช็คความเป็นเจ้าของ)
export async function refreshTokenAction(id: string) {
    const supabase = await getSupabase();
    try {
        const brandId = await getMyBrandId(supabase);
        const newToken = Math.floor(1000 + Math.random() * 9000).toString();

        const { error } = await supabase
            .from('tables')
            .update({ access_token: newToken, status: 'available' })
            .eq('id', id)
            .eq('brand_id', brandId); // ✅ ต้องตรงกับร้านเราเท่านั้น

        if (error) throw error;
        return { success: true, newToken };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// 6. ดึงข้อมูลโต๊ะเดียว (Public ได้ เพราะเอาไว้ให้ลูกค้าสแกน แต่ถ้าจะกันเหนียวก็กรองได้)
export async function getLatestTableDataAction(tableId: string) {
    const supabase = await getSupabase();
    // อันนี้อาจจะไม่ต้องเช็ค Auth เพราะลูกค้าเป็นคนเรียก (Scan QR)
    try {
        const { data, error } = await supabase
            .from('tables')
            .select('*')
            .eq('id', tableId)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}