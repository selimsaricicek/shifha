const { createClient } = require('@supabase/supabase-js');

// Supabase bağlantısı
const supabaseUrl = 'https://nrtjztpqfxzsvsgezmul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ydGp6dHBxZnh6c3ZzZ2V6bXVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE4OTY0MSwiZXhwIjoyMDY5NzY1NjQxfQ.aCiLDF21JuIkbQfydee3t7KacDGzIC_LjERCjg40eVE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPatientAccess() {
  try {
    console.log('Hasta erişim izinleri düzeltiliyor...');

    // Mevcut organizasyon ID'si (terminal loglarından)
    const currentOrgId = '5f31d554-1a63-4128-a7c3-8b6d49b91cab';
    
    // Mevcut doktor ID'si (terminal loglarından - selimsaricicek1@saglik.gov.tr)
    const currentUserId = 'bffed644-81d2-4732-b215-296a232a9fb9';

    // Doktor profilini bul
    const { data: doctorProfile, error: doctorError } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', currentUserId)
      .eq('organization_id', currentOrgId)
      .single();

    if (doctorError || !doctorProfile) {
      console.error('Doktor profili bulunamadı:', doctorError);
      return;
    }

    console.log('✅ Doktor ID bulundu:', doctorProfile.id);

    // Hasta profillerini oluştur (eğer yoksa)
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
        organization_id: currentOrgId
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
        organization_id: currentOrgId
      }
    ];

    // Hasta profillerini oluştur
    const { data: patients, error: patientsError } = await supabase
      .from('patient_profiles')
      .upsert(testPatients, { onConflict: 'tc_kimlik_no' })
      .select();

    if (patientsError) {
      console.error('Hasta profilleri oluşturma hatası:', patientsError);
    } else {
      console.log('✅ Hasta profilleri oluşturuldu/güncellendi:', patients.length, 'hasta');
    }

    // Mevcut erişim izinlerini güncelle
    const accessPermissions = [
      {
        doctor_id: doctorProfile.id,
        patient_tc: '12345678901',
        organization_id: currentOrgId,
        permission_type: 'read',
        granted_by: currentUserId,
        is_active: true
      },
      {
        doctor_id: doctorProfile.id,
        patient_tc: '98765432109',
        organization_id: currentOrgId,
        permission_type: 'read',
        granted_by: currentUserId,
        is_active: true
      }
    ];

    // Önce mevcut izinleri sil
    const { error: deleteError } = await supabase
      .from('patient_access_permissions')
      .delete()
      .eq('doctor_id', doctorProfile.id);

    if (deleteError) {
      console.error('Mevcut izinleri silme hatası:', deleteError);
    } else {
      console.log('✅ Mevcut erişim izinleri silindi');
    }

    // Yeni izinleri ekle
    const { error: accessError } = await supabase
      .from('patient_access_permissions')
      .insert(accessPermissions);

    if (accessError) {
      console.error('Erişim izinleri oluşturma hatası:', accessError);
    } else {
      console.log('✅ Yeni hasta erişim izinleri oluşturuldu');
    }

    console.log('\n🎉 Hasta erişim izinleri başarıyla düzeltildi!');
    console.log('📋 Özet:');
    console.log(`   - Organizasyon ID: ${currentOrgId}`);
    console.log(`   - Doktor ID: ${doctorProfile.id}`);
    console.log(`   - Hastalar: 12345678901, 98765432109`);

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

fixPatientAccess();