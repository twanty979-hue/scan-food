const { createClient } = require('@supabase/supabase-js');


const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function debug() {
    console.log('--- DEBUGGING PAI_ORDERS ---');

    // 1. Get any recent pai_order to see its structure
    const { data: recentPaiOrders, error: pErr } = await supabase
        .from('pai_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (pErr) {
        console.log('Error fetching pai_orders:', pErr.message);
        return;
    }
    
    console.log('Recent pai_orders:');
    console.log(JSON.stringify(recentPaiOrders, null, 2));

    if (!recentPaiOrders || recentPaiOrders.length === 0) {
        console.log('No pai_orders found in the database!');
        return;
    }

    // 2. Take the first pai_order's order_id and fetch the order
    const samplePai = recentPaiOrders[0];
    const { data: order, error: oErr } = await supabase
        .from('orders')
        .select('*')
        .eq('id', samplePai.order_id)
        .single();
    
    console.log('\nRelated order for the first pai_order:');
    console.log(JSON.stringify(order, null, 2));

    if (order) {
        // 3. Let's test the exact query from limitGuard with this brandId
        const brandId = order.brand_id;
        const now = new Date();
        const startOfPeriod = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const endOfPeriod = now.toISOString();

        console.log('\nTesting limitGuard query with brandId:', brandId);
        const { data: joinData, error: jErr } = await supabase.from('pai_orders')
            .select('created_at, orders!pai_orders_order_id_fkey!inner(type, table_id, brand_id)')
            .eq('orders.brand_id', brandId)
            .eq('orders.type', 'table')
            .not('orders.table_id', 'is', null)
            .gte('created_at', startOfPeriod)
            .lte('created_at', endOfPeriod);
        
        console.log('Join result:', joinData?.length, 'error:', jErr?.message);
        console.log(JSON.stringify(joinData, null, 2));

        // 4. Test WITHOUT the inner join conditions (type, table_id) to see what we get
        const { data: joinDataNoFilter, error: jErrNoFilter } = await supabase.from('pai_orders')
            .select('created_at, orders!pai_orders_order_id_fkey!inner(type, table_id, brand_id)')
            .eq('orders.brand_id', brandId)
            .gte('created_at', startOfPeriod)
            .lte('created_at', endOfPeriod);
        console.log('\nJoin result WITHOUT type/table_id filter:', joinDataNoFilter?.length);
    }
}

debug();
