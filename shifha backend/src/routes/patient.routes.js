// Dosya Adı: src/routes/patient.routes.js

const express = require('express');
const router = express.Router();
const { getAllPatients, getPatientByTC, addPatient, updatePatient, deletePatient, getBloodTestResults, getDoctorNotes, addDoctorNote, addPatientAccess, removePatientAccess, getPatientAccess, createBulkPatientAccess } = require('../controllers/patient.controller.js');
const { validatePatient } = require('../middleware/validation.middleware');
const { requireRole } = require('../middleware/auth');

// Bütün hastaları getiren rota: GET /api/patients (auth ve tenant context zaten API router'da uygulandı)
router.get('/', getAllPatients);
// Yeni hasta ekle: POST /api/patients
router.post('/', validatePatient, addPatient);
// Hasta güncelle: PUT /api/patients/:tc
router.put('/:tc', validatePatient, updatePatient);
// Hasta sil: DELETE /api/patients/:tc
router.delete('/:tc', deletePatient);
// Kan tahlili sonuçlarını getir: GET /api/patients/:tc/blood-test-results
router.get('/:tc/blood-test-results', getBloodTestResults);
// Bir hastanın doktor notlarını getir (sadece doktorlar)
router.get('/:tc/notes', requireRole(['doctor']), getDoctorNotes);
// Mevcut doktor profilini kontrol et
router.get('/check-doctor-profile', async (req, res) => {
  try {
    const supabase = require('../services/supabaseClient');
    const user_id = req.user.id;
    
    console.log('Doktor profili kontrol ediliyor, user_id:', user_id);
    
    const { data: doctorProfile, error } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();
    
    console.log('Doktor profili sonucu:', { doctorProfile, error });
    
    if (error || !doctorProfile) {
      return res.status(404).json({ 
        success: false, 
        error: 'Doktor profili bulunamadı',
        user_id: user_id,
        details: error 
      });
    }
    
    res.json({ 
      success: true, 
      data: doctorProfile,
      user_id: user_id 
    });
  } catch (err) {
    console.error('Doktor profili kontrol hatası:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bir hastaya yeni doktor notu ekle (sadece doktorlar)
router.post('/:tc/notes', requireRole(['doctor']), addDoctorNote);

// Hasta-doktor erişim yönetimi
router.post('/:tc/access', requireRole(['doctor']), addPatientAccess);
router.delete('/:tc/access/:doctorId', requireRole(['doctor']), removePatientAccess);
router.get('/:tc/access', requireRole(['doctor']), getPatientAccess);

// Toplu hasta-doktor erişimi oluştur (test için)
router.post('/bulk-access', requireRole(['doctor']), createBulkPatientAccess);

// Test verisi ekleme endpoint'i (sadece development için)
router.post('/test-data', async (req, res) => {
  try {
    const supabase = require('../services/supabaseClient');
    
    // Test organizasyon oluştur
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .upsert([{
        id: 'test-org-id',
        name: 'Test Hastanesi',
        type: 'hastane',
        is_active: true
      }], { onConflict: 'id' })
      .select()
      .single();

    if (orgError) throw orgError;

    // Test doktor profili oluştur
    const { data: doctor, error: doctorError } = await supabase
      .from('doctor_profiles')
      .upsert([{
        user_id: 'bffed644-81d2-4732-b2f6-296a23c1a234',
        tc_kimlik_no: '11111111111',
        full_name: 'Dr. Test Doktor',
        email: 'test@saglik.gov.tr',
        phone: '+90 555 123 4567',
        specialization: 'Dahiliye',
        organization_id: org.id,
        is_active: true
      }], { onConflict: 'user_id' })
      .select();

    if (doctorError) throw doctorError;

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
        sosyal_destek: 'Aile desteği var'
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
        sosyal_destek: 'Arkadaş desteği var'
      }
    ];

    const { data, error } = await supabase
      .from('patients')
      .upsert(testPatients, { onConflict: 'tc_kimlik_no' })
      .select();

    if (error) throw error;
    
    res.status(201).json({ 
      success: true, 
      message: 'Test verileri ve doktor profili eklendi', 
      data: { patients: data, doctor: doctor, organization: org }
    });
  } catch (err) {
    console.error('Test veri ekleme hatası:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Test verileri eklenemedi: ' + err.message 
    });
  }
});

// Tek bir hastayı getiren rota: GET /api/patients/:tc (GENERIC, en sonda)
router.get('/:tc', getPatientByTC);

module.exports = router;