import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://xvhibjejvbriotfpunvv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aGliamVqdmJyaW90ZnB1bnZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ4MzkyNywiZXhwIjoyMDg0MDU5OTI3fQ.TQJgo_8ksMgrHutzisaN7eq-gOLWqhLDbIyLWgBn0so');
const { data, error } = await supabase.from('dashboard_product_stats').select('*').limit(5);
console.log(JSON.stringify(data, null, 2));
