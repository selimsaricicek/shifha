// Multi-doktor test verilerini oluşturan script
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables eksik!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupMultiDoctorTest() {
  try {
    console.log('🏥 Multi-doktor test verilerini oluşturuluyor...');

    // Test organizasyonu oluştur veya mevcut olanı al
    let { data: org, error: orgError } = await supabase
      .from('organizations')
      .select()
      .eq('name', 'Multi-Doktor Test Hastanesi')
      .single();

    if (!org) {
      const { data: newOrg, error: createError } = await supabase
         .from('organizations')
         .insert([{
           name: 'Multi-Doktor Test Hastanesi',
           type: 'hospital',
           is_active: true
         }])
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Organizasyon oluşturma hatası:', createError);
        return;
      }
      org = newOrg;
    }

    if (orgError && orgError.code !== 'PGRST116') {
      console.error('❌ Organizasyon oluşturma hatası:', orgError);
      return;
    }

    console.log('✅ Organizasyon oluşturuldu:', org.name);

    // Test kullanıcıları oluştur (auth.users)
    const testUsers = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'ahmet@saglik.gov.tr',
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'ayse@saglik.gov.tr',
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        email: 'mehmet@saglik.gov.tr',
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Auth users oluştur
    for (const user of testUsers) {
      const { error: userError } = await supabase.auth.admin.createUser({
        user_id: user.id,
        email: user.email,
        email_confirm: true
      });
      
      if (userError && userError.message !== 'User already registered') {
        console.error(`❌ Kullanıcı oluşturma hatası (${user.email}):`, userError);
      }
    }

    console.log('✅ Test kullanıcıları oluşturuldu');

    // Mevcut doktorları al (ID: 1, 2, 6)
    const { data: existingDoctors, error: doctorError } = await supabase
      .from('doctor_profiles')
      .select('*')
      .in('id', [1, 2, 6]);

    if (doctorError) {
      console.error('❌ Doktor getirme hatası:', doctorError);
      return;
    }

    console.log('✅ Mevcut doktorlar alındı:', existingDoctors.length);

    // Test hastaları oluştur
    const patients = [
      {
        tc_kimlik_no: '12345678901',
        ad_soyad: 'Ahmet Yılmaz',
        dogum_tarihi: '1988-05-15',
        yas: 35,
        cinsiyet: 'Erkek',
        boy: '175',
        kilo: '75',
        vki: '24.5',
        kan_grubu: 'A+'
      },
      {
        tc_kimlik_no: '98765432109',
        ad_soyad: 'Ayşe Demir',
        dogum_tarihi: '1995-08-22',
        yas: 28,
        cinsiyet: 'Kadın',
        boy: '162',
        kilo: '55',
        vki: '21.0',
        kan_grubu: 'B-'
      },
      {
        tc_kimlik_no: '11122233344',
        ad_soyad: 'Mehmet Kaya',
        dogum_tarihi: '1980-12-10',
        yas: 43,
        cinsiyet: 'Erkek',
        boy: '180',
        kilo: '85',
        vki: '26.2',
        kan_grubu: 'O+'
      },
      {
        tc_kimlik_no: '55566677788',
        ad_soyad: 'Fatma Özkan',
        dogum_tarihi: '1992-03-25',
        yas: 31,
        cinsiyet: 'Kadın',
        boy: '165',
        kilo: '60',
        vki: '22.0',
        kan_grubu: 'AB+'
      },
      {
        tc_kimlik_no: '99988877766',
        ad_soyad: 'Ali Çelik',
        dogum_tarihi: '1975-07-18',
        yas: 48,
        cinsiyet: 'Erkek',
        boy: '172',
        kilo: '78',
        vki: '26.4',
        kan_grubu: 'A-'
      },
      {
        tc_kimlik_no: '33344455566',
        ad_soyad: 'Zeynep Arslan',
        dogum_tarihi: '1990-11-05',
        yas: 33,
        cinsiyet: 'Kadın',
        boy: '158',
        kilo: '52',
        vki: '20.8',
        kan_grubu: 'B+'
      }
    ];

    const { data: createdPatients, error: patientError } = await supabase
      .from('patients')
      .upsert(patients, { onConflict: 'tc_kimlik_no' })
      .select();

    if (patientError) {
      console.error('❌ Hasta oluşturma hatası:', patientError);
      return;
    }

    console.log('✅ Hastalar oluşturuldu:', createdPatients.length);

    // Hasta-doktor erişim ilişkilerini oluştur
    const doctor1 = existingDoctors.find(d => d.id === 1);
    const doctor2 = existingDoctors.find(d => d.id === 2);
    const doctor6 = existingDoctors.find(d => d.id === 6);

    const accessPermissions = [
      // Doktor 1'in hastaları
      { patient_tc: '12345678901', doctor_id: doctor1.id, permission_type: 'read' },
      { patient_tc: '98765432109', doctor_id: doctor1.id, permission_type: 'read' },
      { patient_tc: '98765432109', doctor_id: doctor2.id, permission_type: 'read' },
      
      // Doktor 2'nin hastaları
      { patient_tc: '11122233344', doctor_id: doctor2.id, permission_type: 'read' },
      { patient_tc: '55566677788', doctor_id: doctor2.id, permission_type: 'read' },
      { patient_tc: '12345678901', doctor_id: doctor2.id, permission_type: 'read' },
      
      // Doktor 6'nın hastaları
      { patient_tc: '99988877766', doctor_id: doctor6.id, permission_type: 'read' },
      { patient_tc: '33344455566', doctor_id: doctor6.id, permission_type: 'read' },
      { patient_tc: '11122233344', doctor_id: doctor6.id, permission_type: 'read' },
    ];

    const accessData = accessPermissions.map(permission => ({
      patient_tc: permission.patient_tc,
      doctor_id: permission.doctor_id,
      organization_id: org.id,
      permission_type: permission.permission_type,
      granted_by: doctor1.user_id,
      is_active: true
    }));

    const { data: createdAccess, error: accessError } = await supabase
      .from('patient_access_permissions')
      .upsert(accessData, { 
        onConflict: 'patient_tc,doctor_id,organization_id',
        ignoreDuplicates: false 
      })
      .select();

    if (accessError) {
      console.error('❌ Erişim izni oluşturma hatası:', accessError);
      return;
    }

    console.log('✅ Hasta-doktor erişim izinleri oluşturuldu:', createdAccess.length);

    console.log('\n🎉 Multi-doktor test verilerini başarıyla oluşturuldu!');
    console.log('\n📋 Özet:');
    console.log(`- Organizasyon: ${org.name}`);
    console.log(`- Doktor sayısı: ${existingDoctors.length}`);
    console.log(`- Hasta sayısı: ${createdPatients.length}`);
    console.log(`- Erişim izni sayısı: ${createdAccess.length}`);
    
    console.log('\n👨‍⚕️ Doktor-Hasta Dağılımı:');
    console.log('- Dr. Ahmet Yılmaz (ID: 1): Ahmet Yılmaz, Ayşe Demir');
    console.log('- Dr. Ayşe Demir (ID: 2): Mehmet Kaya, Fatma Özkan');
    console.log('- Dr. Mehmet Kaya (ID: 6): Ali Çelik, Zeynep Arslan');

  } catch (error) {
    console.error('❌ Genel hata:', error);
  }
}

// Script'i çalıştır
setupMultiDoctorTest();