const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    console.log("Fetching some pai_orders...");
    const { data: pOrders, error: pErr } = await supabase.from('pai_orders').select('*, orders!inner(*)').limit(10);
    
    if (pErr) {
        console.log("Error:", pErr);
        return;
    }
    console.log("Got pai_orders:");
    console.log(JSON.stringify(pOrders, null, 2));
}

run();
