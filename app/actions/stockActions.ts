// app/actions/stockActions.ts
'use server'
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
        cookies: { get(name) { return cookieStore.get(name)?.value } }
    });
}

export async function recordStockBatchAction(payload: { 
    brandId: string, 
    refNo: string, 
    note: string, 
    items: any[] 
}) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        const { data: tx, error: txErr } = await supabase
            .from('stock_transactions')
            .insert({
                brand_id: payload.brandId,
                ref_no: payload.refNo,
                note: payload.note,
                created_by: user.id
            })
            .select().single();

        if (txErr) throw txErr;

        const logs = payload.items.map(item => ({
            transaction_id: tx.id,
            product_id: item.id,
            change_amount: item.qty,
            action_type: 'IN',
            note: payload.note || 'รับเข้าผ่านแอป'
        }));

        const { error: logsErr } = await supabase.from('stock_logs').insert(logs);
        if (logsErr) throw logsErr;

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// 🌟 ฟังก์ชันสำหรับหน้า Adjustment (ใส่ try { ... } ให้ถูกต้องแล้ว)
export async function recordStockAdjustmentAction(payload: { 
    brandId: string, 
    refNo?: string, 
    note: string, 
    items: any[] 
}) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try { // ✅ ใส่ try ตรงนี้ที่รอบที่แล้วผมลืม
        const { data: tx, error: txErr } = await supabase
            .from('stock_transactions')
            .insert({
                brand_id: payload.brandId,
                ref_no: payload.refNo || `ADJ-${Date.now()}`,
                note: payload.note,
                created_by: user.id
            })
            .select().single();

        if (txErr) throw txErr;

        const logs = payload.items.map(item => ({
            transaction_id: tx.id,
            product_id: item.id,
            change_amount: item.qty,
            action_type: item.qty >= 0 ? 'ADJUST_IN' : (item.type || 'ADJUST_OUT'),
            note: payload.note || 'ปรับปรุงสต็อกหน้าร้าน'
        }));

        const { error: logsErr } = await supabase.from('stock_logs').insert(logs);
        if (logsErr) throw logsErr;

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// 🌟 ใช้ !inner join เพื่อให้ดึงข้อมูลได้ชัวร์ 100%
export async function getStockListAction(brandId: string) {
    const supabase = await getSupabase();
    
    try {
        const { data, error } = await supabase
            .from('stock')
            .select(`
                quantity,
                updated_at,
                product_master!inner (
                    id,
                    name,
                    barcode,
                    sku,
                    image_url,
                    brand_id
                )
            `)
            .eq('product_master.brand_id', brandId)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        const formatted = (data || []).map((item: any) => ({
            id: item.product_master.id,
            name: item.product_master.name,
            barcode: item.product_master.barcode,
            sku: item.product_master.sku,
            quantity: item.quantity,
            updated_at: item.updated_at,
            image_url: item.product_master.image_url
        }));

        return { success: true, data: formatted };
    } catch (err: any) {
        console.error("Fetch Stock Error:", err);
        return { success: false, error: err.message };
    }
}

export async function quickAdjustStockAction(productId: string, amount: number, note: string) {
    const supabase = await getSupabase();
    const { error } = await supabase.from('stock_logs').insert({
        product_id: productId,
        change_amount: amount,
        action_type: amount > 0 ? 'ADJUST_IN' : 'ADJUST_OUT',
        note: note
    });
    return { success: !error, error: error?.message };
}

// 🌟 4. ฟังก์ชันดึงภาพรวมคลังสินค้า (Overview) + คำนวณมูลค่า
export async function getInventoryOverviewAction(brandId: string) {
    const supabase = await getSupabase();
    
    try {
        const { data: stocks, error: stockErr } = await supabase
            .from('stock')
            .select(`
                quantity,
                product_master!inner(brand_id, price, cost_price)
            `)
            .eq('product_master.brand_id', brandId);

        if (stockErr) throw stockErr;

        let totalSKUs = 0;
        let totalItems = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        let totalValue = 0;

        if (stocks) {
            totalSKUs = stocks.length;
            stocks.forEach((s: any) => {
                if (s.quantity > 0) {
                    totalItems += s.quantity;
                    const itemPrice = Number(s.product_master.cost_price || s.product_master.price || 0);
                    totalValue += s.quantity * itemPrice;
                }
                if (s.quantity > 0 && s.quantity <= 5) lowStockCount++;
                if (s.quantity <= 0) outOfStockCount++;
            });
        }

        const { data: lostLogs, error: lostErr } = await supabase
            .from('stock_logs')
            .select(`
                change_amount,
                product_master!inner(brand_id, price, cost_price)
            `)
            .eq('product_master.brand_id', brandId)
            .in('action_type', ['ADJUST_OUT', 'WASTE']);

        let lostValue = 0;
        let lostItemsCount = 0;

        if (lostLogs) {
            lostLogs.forEach((log: any) => {
                const amount = Math.abs(log.change_amount); 
                const itemPrice = Number(log.product_master.cost_price || log.product_master.price || 0);
                lostValue += amount * itemPrice;
                lostItemsCount += amount;
            });
        }

        const { data: recentTx, error: txErr } = await supabase
            .from('stock_transactions')
            .select('id, ref_no, note, created_at')
            .eq('brand_id', brandId)
            .order('created_at', { ascending: false })
            .limit(5);

        return {
            success: true,
            stats: { 
                totalSKUs, 
                totalItems, 
                lowStockCount, 
                outOfStockCount, 
                totalValue,
                lostValue,
                lostItemsCount 
            },
            recentTransactions: recentTx || []
        };
    } catch (err: any) {
        console.error("Overview Error:", err);
        return { success: false, error: err.message };
    }
}

// 🌟 5. ฟังก์ชันดึงประวัติ (เวอร์ชันเช็คความสัมพันธ์ในตัว - ไม่ต้องพึ่ง Foreign Key)
export async function getStockTransactionsAction(brandId: string) {
    const supabase = await getSupabase();
    const dayjs = (await import('dayjs')).default;
    
    try {
        const { data: otherTx, error: txErr } = await supabase
            .from('stock_transactions')
            .select(`
                id, ref_no, note, created_at,
                stock_logs (
                    id, 
                    change_amount, 
                    action_type, 
                    product_master!inner(id, name, image_url, barcode)
                )
            `)
            .eq('brand_id', brandId)
            .not('ref_no', 'ilike', 'POS-%') 
            .order('created_at', { ascending: false });

        if (txErr) throw txErr;

        const [saleStatsResp, masterProdsResp] = await Promise.all([
            supabase.from('dashboard_product_stats').select('*').eq('brand_id', brandId),
            supabase.from('product_master').select('id, name, image_url, barcode').eq('brand_id', brandId)
        ]);

        if (saleStatsResp.error) throw saleStatsResp.error;

        const masterMap = new Map();
        masterProdsResp.data?.forEach(p => masterMap.set(p.id, p));

        const dailySaleGroups = (saleStatsResp.data || []).reduce((acc: any, curr: any) => {
            const masterInfo = masterMap.get(curr.product_id);
            if (!masterInfo) return acc;

            const dateStr = curr.report_date;
            if (!acc[dateStr]) {
                acc[dateStr] = {
                    id: `SALE-${dateStr}`,
                    ref_no: `สรุปยอดขายวันที่ ${dayjs(dateStr).format('DD/MM/YYYY')}`,
                    note: 'ยอดขายของชำรวมรายวัน',
                    created_at: dateStr,
                    is_summary: true,
                    stock_logs: []
                };
            }

            acc[dateStr].stock_logs.push({
                change_amount: -Math.abs(curr.total_quantity),
                product_master: masterInfo
            });
            return acc;
        }, {});

        const finalResults = [
            ...Object.values(dailySaleGroups),
            ...(otherTx || [])
        ].sort((a: any, b: any) => 
            dayjs(b.created_at).unix() - dayjs(a.created_at).unix()
        );

        return { success: true, data: finalResults };

    } catch (err: any) {
        console.error("Fetch History Error:", err);
        return { success: false, error: err.message };
    }
}

// 🌟 7. ฟังก์ชันตัดสต็อกอัตโนมัติ (เวอร์ชันสะอาด: ตัดยอดตรง ไม่ลง Log ให้รก!)
export async function autoDeductStockAction(brandId: string, orderId: string, items: any[]) {
    const supabase = await getSupabase();

    try {
        if (!items || items.length === 0) return { success: false };

        const itemIds = items.map(i => i.product_id || i.id);
        const { data: retailProducts } = await supabase
            .from('product_master')
            .select('id')
            .in('id', itemIds);

        if (!retailProducts || retailProducts.length === 0) return { success: true };

        const retailProductIds = retailProducts.map(p => p.id);

        const mergedItems: Record<string, number> = {};
        items.forEach(item => {
            const id = item.product_id || item.id;
            if (retailProductIds.includes(id)) {
                mergedItems[id] = (mergedItems[id] || 0) + Math.abs(item.quantity);
            }
        });

        for (const [productId, qty] of Object.entries(mergedItems)) {
            const { error: updateErr } = await supabase.rpc('decrement_stock', {
                p_product_id: productId,
                p_amount: Number(qty)
            });
            
            if (updateErr) console.error(`❌ ตัดสต็อกสินค้า ${productId} ล้มเหลว:`, updateErr.message);
        }

        return { success: true, message: "Stock deducted directly without logs" };
    } catch (err: any) {
        console.error("❌ Auto Deduct Error:", err.message);
        return { success: false, error: err.message };
    }
}