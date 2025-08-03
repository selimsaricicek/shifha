const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugTables() {
  console.log("🔍 Supabase tablolarını kontrol ediyorum...\n");

  // 1. patient_profiles tablosundaki tüm kayıtları kontrol et
  console.log("📋 patient_profiles tablosu:");
  const { data: patients, error: patientsError } = await supabase
    .from('patient_profiles')
    .select('*')
    .limit(10);

  if (patientsError) {
    console.log("❌ patient_profiles hatası:", patientsError);
  } else {
    console.log(`✅ ${patients.length} kayıt bulundu`);
    if (patients.length > 0) {
      console.log("İlk kayıt örneği:", patients[0]);
      console.log("Sütun adları:", Object.keys(patients[0]));
    }
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // 2. Belirli TC'leri ara
  console.log("🔍 Belirli TC'leri arıyorum:");
  const targetTCs = ['12345678901', '98765432109'];
  
  for (const tc of targetTCs) {
    const { data: tcData, error: tcError } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('tc_kimlik_no', tc);

    if (tcError) {
      console.log(`❌ TC ${tc} arama hatası:`, tcError);
    } else {
      console.log(`🔍 TC ${tc}: ${tcData.length} kayıt bulundu`);
      if (tcData.length > 0) {
        console.log("  Kayıt:", tcData[0]);
      }
    }
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // 3. Organization ID ile filtreleme
  const orgId = '5f31d554-1a63-4128-a7c3-8b6d49b91cab';
  console.log(`🏥 Organization ID ${orgId} ile filtreleme:`);
  
  const { data: orgPatients, error: orgError } = await supabase
    .from('patient_profiles')
    .select('*')
    .eq('organization_id', orgId);

  if (orgError) {
    console.log("❌ Organization filtreleme hatası:", orgError);
  } else {
    console.log(`✅ ${orgPatients.length} kayıt bulundu`);
    if (orgPatients.length > 0) {
      console.log("İlk kayıt:", orgPatients[0]);
    }
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // 4. Tablo şemasını kontrol et
  console.log("📊 Tablo şeması kontrolü:");
  const { data: schema, error: schemaError } = await supabase
    .from('patient_profiles')
    .select('*')
    .limit(1);

  if (!schemaError && schema.length > 0) {
    console.log("Mevcut sütunlar:", Object.keys(schema[0]));
  }
}

debugTables().catch(console.error);