// Dosya Adı: src/routes/doctor.routes.js

const express = require('express');
const router = express.Router();
const { 
  getAllDoctors, 
  getDoctorById, 
  addDoctor, 
  updateDoctor, 
  deleteDoctor,
  assignDoctorToHospital 
} = require('../controllers/doctor.controller.js');

// Tüm doktorları getir: GET /api/doctors
router.get('/', getAllDoctors);

// ID ile doktor getir: GET /api/doctors/:id
router.get('/:id', getDoctorById);

// Yeni doktor ekle: POST /api/doctors
router.post('/', addDoctor);

// Doktor güncelle: PUT /api/doctors/:id
router.put('/:id', updateDoctor);

// Doktor sil: DELETE /api/doctors/:id
router.delete('/:id', deleteDoctor);

// Doktoru hastaneye ata: PUT /api/doctors/:id/assign-hospital
router.put('/:id/assign-hospital', assignDoctorToHospital);

// Test verisi ekleme endpoint'i (sadece development için)
router.post('/create-sample-doctors', async (req, res) => {
  try {
    const supabase = require('../services/supabaseClient');
    
    // Test organizasyon oluştur veya mevcut olanı al
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .upsert([{
        id: 'test-org-id',
        name: 'Sağlık Bakanlığı Test Hastanesi',
        type: 'hastane',
        is_active: true,
        license_number: 'SB-TEST-001'
      }], { onConflict: 'id' })
      .select()
      .single();

    if (orgError) throw orgError;

    // Test departmanları oluştur
    const departments = [
      { name: 'Dahiliye', organization_id: org.id },
      { name: 'Kardiyoloji', organization_id: org.id },
      { name: 'Nöroloji', organization_id: org.id },
      { name: 'Ortopedi', organization_id: org.id },
      { name: 'Göz Hastalıkları', organization_id: org.id }
    ];

    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .upsert(departments, { onConflict: 'name,organization_id' })
      .select();

    if (deptError) throw deptError;

    // Sample doktorlar oluştur
    const sampleDoctors = [
      {
        tc_kimlik_no: '11111111111',
        full_name: 'Dr. Ahmet Yılmaz',
        email: 'ahmet.yilmaz@saglik.gov.tr',
        phone: '+90 555 123 4567',
        specialization: 'Dahiliye',
        organization_id: org.id,
        department_id: deptData.find(d => d.name === 'Dahiliye')?.id,
        license_number: 'DR-001',
        years_of_experience: 15,
        is_active: true
      },
      {
        tc_kimlik_no: '22222222222',
        full_name: 'Dr. Fatma Kaya',
        email: 'fatma.kaya@saglik.gov.tr',
        phone: '+90 555 234 5678',
        specialization: 'Kardiyoloji',
        organization_id: org.id,
        department_id: deptData.find(d => d.name === 'Kardiyoloji')?.id,
        license_number: 'DR-002',
        years_of_experience: 12,
        is_active: true
      },
      {
        tc_kimlik_no: '33333333333',
        full_name: 'Dr. Mehmet Özkan',
        email: 'mehmet.ozkan@saglik.gov.tr',
        phone: '+90 555 345 6789',
        specialization: 'Nöroloji',
        organization_id: org.id,
        department_id: deptData.find(d => d.name === 'Nöroloji')?.id,
        license_number: 'DR-003',
        years_of_experience: 20,
        is_active: true
      },
      {
        tc_kimlik_no: '44444444444',
        full_name: 'Dr. Ayşe Demir',
        email: 'ayse.demir@saglik.gov.tr',
        phone: '+90 555 456 7890',
        specialization: 'Ortopedi',
        organization_id: org.id,
        department_id: deptData.find(d => d.name === 'Ortopedi')?.id,
        license_number: 'DR-004',
        years_of_experience: 8,
        is_active: true
      },
      {
        tc_kimlik_no: '55555555555',
        full_name: 'Dr. Can Şahin',
        email: 'can.sahin@saglik.gov.tr',
        phone: '+90 555 567 8901',
        specialization: 'Göz Hastalıkları',
        organization_id: org.id,
        department_id: deptData.find(d => d.name === 'Göz Hastalıkları')?.id,
        license_number: 'DR-005',
        years_of_experience: 10,
        is_active: true
      }
    ];

    const { data: doctors, error: doctorError } = await supabase
      .from('doctor_profiles')
      .upsert(sampleDoctors, { onConflict: 'tc_kimlik_no' })
      .select(`
        *,
        departments:department_id(id, name),
        organizations:organization_id(id, name)
      `);

    if (doctorError) throw doctorError;
    
    res.status(201).json({ 
      success: true, 
      message: 'Sample doktorlar başarıyla eklendi', 
      data: { 
        doctors: doctors, 
        organization: org,
        departments: deptData
      }
    });
  } catch (err) {
    console.error('Sample doktor ekleme hatası:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Sample doktorlar eklenemedi: ' + err.message 
    });
  }
});

module.exports = router;