import { createClient } from '@supabase/supabase-js';
const supabase = createClient('', '');

const { data: d1 } = await supabase.from('orders').select('*').eq('id', '598e49e2-c164-4bbe-a708-326714852dbc').limit(1);
console.log("orders id match:", JSON.stringify(d1, null, 2));

const { data: d2 } = await supabase.from('orders').select('*').eq('payment_id', '70b7a0ef-9ffa-44e3-b89d-b68640e63107').limit(1);
console.log("orders payment_id match:", JSON.stringify(d2, null, 2));

