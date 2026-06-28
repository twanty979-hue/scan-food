import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://xvhibjejvbriotfpunvv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aGliamVqdmJyaW90ZnB1bnZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ4MzkyNywiZXhwIjoyMDg0MDU5OTI3fQ.TQJgo_8ksMgrHutzisaN7eq-gOLWqhLDbIyLWgBn0so');
async function run() {
  const sql = "SELECT p.proname, p.prosrc FROM pg_trigger t JOIN pg_proc p ON p.oid = t.tgfoid JOIN pg_class c ON c.oid = t.tgrelid WHERE c.relname = 'order_items';";
  const { data, error } = await supabase.rpc('run_sql', { sql });
  console.log('RPC ERROR:', error);
  console.log('RPC DATA:', data);
}
run();
