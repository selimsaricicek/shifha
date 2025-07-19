// Supabase bağlantı dosyası
const { createClient } = require('@supabase/supabase-js');

// Environment variables kontrolü
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Supabase environment variables eksik!');
  console.error('Lütfen .env dosyasında şu değişkenleri tanımlayın:');
  console.error('- SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Örnek .env dosyası:');
  console.error('SUPABASE_URL=https://your-project.supabase.co');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Test connection
supabase.auth.admin.listUsers()
  .then(() => {
    console.log('✅ Supabase bağlantısı başarılı!');
  })
  .catch((error) => {
    console.error('❌ Supabase bağlantı hatası:', error.message);
    if (error.message.includes('Invalid API key')) {
      console.error('API key yanlış veya eksik. Lütfen SUPABASE_SERVICE_ROLE_KEY değerini kontrol edin.');
    }
  });

module.exports = supabase;