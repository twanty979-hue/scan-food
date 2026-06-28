const { createClient } = require('@supabase/supabase-js');


const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test(brandId) {
    const now = new Date();
    const startOfPeriod = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endOfPeriod = now.toISOString();

    console.log('Testing with brand_id:', brandId);

    // 1. Try querying orders directly
    const { data: orders, error: oErr } = await supabase.from('orders').select('*').eq('brand_id', brandId).eq('type', 'table').not('table_id', 'is', null);
    console.log('orders count:', orders?.length, 'error:', oErr?.message);

    // 2. Try querying pai_orders without join
    const { data: pOrders, error: pErr } = await supabase.from('pai_orders').select('*').eq('brand_id', brandId);
    console.log('pai_orders count:', pOrders?.length, 'error:', pErr?.message);

    // 3. Try the join query with brand_id on pai_orders
    const { data: join1, error: j1Err } = await supabase.from('pai_orders')
        .select('created_at, orders!inner(type, table_id)')
        .eq('brand_id', brandId)
        .eq('orders.type', 'table')
        .not('orders.table_id', 'is', null);
    console.log('join (pai_orders.brand_id) count:', join1?.length, 'error:', j1Err?.message);

    // 4. Try the join query with specific fkey
    const { data: join2, error: j2Err } = await supabase.from('pai_orders')
        .select('created_at, orders!pai_orders_order_id_fkey!inner(type, table_id, brand_id)')
        .eq('orders.brand_id', brandId)
        .eq('orders.type', 'table')
        .not('orders.table_id', 'is', null);
    console.log('join (specific fkey) count:', join2?.length, 'error:', j2Err?.message);
}

// We need a valid brand_id to test. Let's get one from the db.
async function run() {
    // wait, we need a user session to bypass RLS possibly?
    // anon key might not work. Let's try service_role key if available.
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey);

    const { data: profiles } = await adminSupabase.from('profiles').select('brand_id').not('brand_id', 'is', null).limit(1);
    if (profiles && profiles.length > 0) {
        await test(profiles[0].brand_id);
    } else {
        console.log('No brand found');
    }
}

run();
