import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://xvhibjejvbriotfpunvv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aGliamVqdmJyaW90ZnB1bnZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ4MzkyNywiZXhwIjoyMDg0MDU5OTI3fQ.TQJgo_8ksMgrHutzisaN7eq-gOLWqhLDbIyLWgBn0so');

async function check() {
  const { data, error } = await supabase.from('order_items').select('*').limit(1);
  console.log(data);
}
check();
