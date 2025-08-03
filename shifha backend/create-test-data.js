const { createClient } = require('@supabase/supabase-js');

// Supabase bağlantısı
const supabaseUrl = 'https://nrtjztpqfxzsvsgezmul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ydGp6dHBxZnh6c3ZzZ2V6bXVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE4OTY0MSwiZXhwIjoyMDY5NzY1NjQxfQ.aCiLDF21JuIkbQfydee3t7KacDGzIC_LjERCjg40eVE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestData() {
  try {
    console.log('Test verileri oluşturuluyor...');

    // Mevcut organizasyonları listele
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5);

    if (orgsError) {
      console.error('Organizasyonlar listelenemedi:', orgsError);
      throw orgsError;
    }
    
    console.log('Mevcut organizasyonlar:');
    orgs.forEach(org => {
      console.log(`- ID: ${org.id}, Name: ${org.name}, Type: ${org.type}`);
    });

    // İlk organizasyonu kullan
    const org = orgs[0];
    if (!org) {
      throw new Error('Hiç organizasyon bulunamadı');
    }
    console.log('✅ Kullanılacak organizasyon:', org.name);

    // Mevcut doktor profillerini kontrol et
    const { data: existingDoctors, error: doctorsError } = await supabase
      .from('doctor_profiles')
      .select('user_id, full_name, email')
      .limit(5);

    if (doctorsError) {
      console.error('Doktor profilleri listelenemedi:', doctorsError);
      throw doctorsError;
    }
    
    console.log('Mevcut doktor profilleri:');
    existingDoctors.forEach(doctor => {
      console.log(`- User ID: ${doctor.user_id}, Name: ${doctor.full_name}, Email: ${doctor.email}`);
    });

    // Mevcut bir doktor varsa onun user_id'sini kullan, yoksa yeni bir UUID oluştur
    let testUserId;
    if (existingDoctors.length > 0) {
      testUserId = existingDoctors[0].user_id;
      console.log('✅ Mevcut doktor kullanılacak:', existingDoctors[0].full_name);
    } else {
      // Yeni bir UUID oluştur (gerçek kullanıcı olmayacak ama test için yeterli)
      testUserId = '550e8400-e29b-41d4-a716-446655440001';
      console.log('✅ Yeni test kullanıcı ID\'si oluşturuldu');
    }
    
    // User organizations tablosuna ekle
    const { error: userOrgError } = await supabase
      .from('user_organizations')
      .upsert([{
        user_id: testUserId,
        organization_id: org.id,
        role: 'doctor',
        is_active: true
      }], { onConflict: 'user_id,organization_id' });

    if (userOrgError) {
      console.error('User organization oluşturma hatası:', userOrgError);
    } else {
      console.log('✅ User organization oluşturuldu');
    }

    // Test doktor profili oluştur
    const { data: doctor, error: doctorError } = await supabase
      .from('doctor_profiles')
      .upsert([{
        user_id: testUserId,
        tc_kimlik_no: '11111111111',
        full_name: 'Dr. Test Doktor',
        email: 'test@saglik.gov.tr',
        phone: '+90 555 123 4567',
        specialization: 'Dahiliye',
        organization_id: org.id,
        is_active: true
      }], { onConflict: 'user_id' })
      .select();

    if (doctorError) {
      console.error('Doktor profili oluşturma hatası:', doctorError);
      throw doctorError;
    }
    console.log('✅ Test doktor profili oluşturuldu:', doctor[0].full_name);

    // Test hastaları oluştur
    const testPatients = [
      {
        tc_kimlik_no: '12345678901',
        ad_soyad: 'Ahmet Yılmaz',
        dogum_tarihi: '1988-05-15',
        yas: 35,
        cinsiyet: 'Erkek',
        boy: '175',
        kilo: '75',
        vki: '24.5',
        kan_grubu: 'A+',
        medeni_durum: 'Evli',
        meslek: 'Mühendis',
        egitim_durumu: 'Üniversite',
        kronik_hastaliklar: 'Hipertansiyon, Diyabet',
        ameliyatlar: 'Apandisit ameliyatı (2010)',
        allerjiler: 'Aspirin, Penisilin',
        aile_oykusu: 'Baba: Kalp hastalığı, Anne: Diyabet',
        enfeksiyonlar: 'COVID-19 (2021)',
        ilac_duzenli: 'Metformin, Lisinopril',
        ilac_duzensiz: 'Parol',
        ilac_alternatif: 'Bitkisel çaylar',
        hareket: 'Günde 30 dakika yürüyüş',
        uyku: '7-8 saat',
        sigara_alkol: 'Sigara: Hayır, Alkol: Nadiren',
        beslenme: 'Düzenli, az tuzlu',
        psikoloji: 'İyi',
        uyku_bozuklugu: 'Yok',
        sosyal_destek: 'Aile desteği var',
        organization_id: org.id
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
        kan_grubu: 'B-',
        medeni_durum: 'Bekar',
        meslek: 'Öğretmen',
        egitim_durumu: 'Üniversite',
        kronik_hastaliklar: 'Alerjik rinit',
        ameliyatlar: 'Yok',
        allerjiler: 'Polen, Toz',
        aile_oykusu: 'Anne: Alerji',
        enfeksiyonlar: 'Yok',
        ilac_duzenli: 'Antihistaminik',
        ilac_duzensiz: 'Yok',
        ilac_alternatif: 'Yok',
        hareket: 'Yoga, Pilates',
        uyku: '8-9 saat',
        sigara_alkol: 'Sigara: Hayır, Alkol: Hayır',
        beslenme: 'Vejetaryen',
        psikoloji: 'Çok iyi',
        uyku_bozuklugu: 'Yok',
        sosyal_destek: 'Arkadaş desteği var',
        organization_id: org.id
      }
    ];

    const { data: patients, error: patientsError } = await supabase
      .from('patient_profiles')
      .upsert(testPatients, { onConflict: 'tc_kimlik_no' })
      .select();

    if (patientsError) {
      console.error('Hasta profilleri oluşturma hatası:', patientsError);
      throw patientsError;
    }
    console.log('✅ Test hasta profilleri oluşturuldu:', patients.length, 'hasta');

    // Hasta erişim izinleri oluştur
    const accessPermissions = patients.map(patient => ({
      doctor_id: doctor[0].id,
      patient_tc: patient.tc_kimlik_no,
      permission_type: 'full_access',
      is_active: true
    }));

    const { error: accessError } = await supabase
      .from('patient_access_permissions')
      .upsert(accessPermissions, { onConflict: 'doctor_id,patient_tc' });

    if (accessError) {
      console.error('Erişim izinleri oluşturma hatası:', accessError);
    } else {
      console.log('✅ Hasta erişim izinleri oluşturuldu');
    }

    console.log('\n🎉 Tüm test verileri başarıyla oluşturuldu!');
    console.log('📋 Özet:');
    console.log(`   - Organizasyon: ${org.name}`);
    console.log(`   - Doktor: ${doctor[0].full_name}`);
    console.log(`   - Hastalar: ${patients.length} adet`);
    console.log(`   - Test kullanıcı ID: ${testUserId}`);

  } catch (error) {
    console.error('❌ Test veri oluşturma hatası:', error);
    process.exit(1);
  }
}

// Script'i çalıştır
createTestData();