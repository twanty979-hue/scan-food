import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://xvhibjejvbriotfpunvv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aGliamVqdmJyaW90ZnB1bnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODM5MjcsImV4cCI6MjA4NDA1OTkyN30.TSpdU0BDIauM5eYoK7x7cGULf4_SSXr-VqJBN4jIyso');
const { data, error } = await supabase.from('pai_orders').select('*').limit(1);
console.log(JSON.stringify(data, null, 2));
