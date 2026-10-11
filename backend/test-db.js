require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('--- ENV CHECK ---');
console.log('URL:', process.env.SUPABASE_URL);
console.log('KEY Length:', process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.length : 0);

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function test() {
  try {
    const { data, error } = await supabase.from('equipments').select('id').limit(1);
    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('SUCCESS! Data:', data);
    }
  } catch (err) {
    console.error('Fetch Catch Error:', err);
  }
}

test();