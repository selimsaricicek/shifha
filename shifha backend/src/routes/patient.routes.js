// Dosya Adı: src/routes/patient.routes.js

const express = require('express');
const router = express.Router();
const { getAllPatients, getPatientByTC, addPatient, updatePatient, deletePatient } = require('../controllers/patient.controller.js');
const { validatePatient } = require('../middleware/validation.middleware');
const { supabaseAuthMiddleware, requireRole } = require('../middleware/auth.middleware');

// Tek bir hastayı getiren rota: GET /api/patients/:tc
router.get('/:tc', getPatientByTC);
// Bütün hastaları getiren rota: GET /api/patients
router.get('/', getAllPatients);
// Yeni hasta ekle: POST /api/patients
router.post('/', validatePatient, addPatient);
// Hasta güncelle: PUT /api/patients/:tc
router.put('/:tc', validatePatient, updatePatient);
// Hasta sil: DELETE /api/patients/:tc
router.delete('/:tc', deletePatient);

// Test verisi ekleme endpoint'i (sadece development için)
router.post('/test-data', async (req, res) => {
  try {
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

    const { data, error } = await require('../services/supabaseClient')
      .from('patients')
      .upsert(testPatients, { onConflict: 'tc_kimlik_no' })
      .select();

    if (error) throw error;
    
    res.status(201).json({ 
      success: true, 
      message: 'Test verileri eklendi', 
      data: data 
    });
  } catch (err) {
    console.error('Test veri ekleme hatası:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Test verileri eklenemedi: ' + err.message 
    });
  }
});

module.exports = router;