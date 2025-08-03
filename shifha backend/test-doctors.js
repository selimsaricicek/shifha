require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDoctors() {
  try {
    const { data, error } = await supabase
      .from('doctor_profiles')
      .select('*');
    
    if (error) {
      console.error('❌ Hata:', error);
    } else {
      console.log('✅ Mevcut doktorlar:', data);
    }
  } catch (err) {
    console.error('❌ Genel hata:', err);
  }
}

testDoctors();