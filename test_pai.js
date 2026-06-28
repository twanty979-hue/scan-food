import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const { data, error } = await supabase.from('pai_orders').select('*').limit(1);
console.log(JSON.stringify(data, null, 2));
