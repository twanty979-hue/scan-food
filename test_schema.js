import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://xvhibjejvbriotfpunvv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aGliamVqdmJyaW90ZnB1bnZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ4MzkyNywiZXhwIjoyMDg0MDU5OTI3fQ.TQJgo_8ksMgrHutzisaN7eq-gOLWqhLDbIyLWgBn0so');

const { data: d1 } = await supabase.from('orders').select('id, payment_id, table_label, order_type').limit(1);
console.log("orders:", JSON.stringify(d1, null, 2));

const { data: d2 } = await supabase.from('dashboard_table_stats').select('*').limit(1);
console.log("table_stats:", JSON.stringify(d2, null, 2));
