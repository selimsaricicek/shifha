const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { adminAuth, superAdminAuth } = require('../middleware/adminAuth');
const { authenticateUser, requireAdmin } = require('../middleware/auth');
const supabase = require('../config/supabase');

// Admin profile routes
router.get('/profile', adminAuth, adminController.getProfile);

// Dashboard routes
router.get('/dashboard/stats', adminAuth, adminController.getDashboardStats);

// Admin management routes (Super admin only)
router.get('/admins', superAdminAuth, adminController.getAllAdmins);
router.post('/admins', superAdminAuth, adminController.createAdmin);
router.put('/admins/:id', superAdminAuth, adminController.updateAdmin);
router.delete('/admins/:id', superAdminAuth, adminController.deleteAdmin);

// Doctors management for admin panel
router.get('/doctors', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('Admin doctors endpoint called. Organization ID:', req.organizationId, 'User ID:', req.user.id);
    
    // Get organization ID from tenant context or user's default organization
    let organizationId = req.organizationId;
    
    if (!organizationId) {
      // Fallback: get user's default organization
      const { data: userOrgs, error: userOrgError } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', req.user.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: false })
        .limit(1);

      if (userOrgError || !userOrgs || userOrgs.length === 0) {
        console.error('User has no organization:', userOrgError);
        return res.status(403).json({ 
          success: false, 
          error: 'Kullanıcı herhangi bir organizasyona bağlı değil' 
        });
      }
      
      organizationId = userOrgs[0].organization_id;
      console.log('Using fallback organization ID:', organizationId);
    }

    const { data: doctors, error } = await supabase
      .from('doctor_profiles')
      .select(`
        id,
        tc_kimlik_no,
        full_name,
        email,
        phone,
        specialization,
        is_active,
        created_at,
        updated_at,
        organization_id,
        department_id,
        license_number,
        years_of_experience,
        consultation_fee,
        available_for_consultation,
        bio,
        departments:department_id (
          id,
          name
        ),
        organizations:organization_id (
          id,
          name
        )
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching doctors:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Doktor listesi alınamadı' 
      });
    }

    console.log(`Found ${doctors?.length || 0} doctors for organization ${organizationId}`);

    // Transform data for admin panel
    const transformedDoctors = doctors.map(doctor => ({
      id: doctor.id,
      tc_kimlik_no: doctor.tc_kimlik_no,
      full_name: doctor.full_name,
      first_name: doctor.full_name ? doctor.full_name.split(' ')[0] : '',
      last_name: doctor.full_name ? doctor.full_name.split(' ').slice(1).join(' ') : '',
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      license_number: doctor.license_number,
      years_of_experience: doctor.years_of_experience,
      consultation_fee: doctor.consultation_fee,
      available_for_consultation: doctor.available_for_consultation,
      bio: doctor.bio,
      department: doctor.departments?.name || 'Belirtilmemiş',
      hospital: doctor.organizations?.name || 'Belirtilmemiş',
      is_active: doctor.is_active,
      status: doctor.is_active ? 'Aktif' : 'Pasif',
      created_at: doctor.created_at,
      updated_at: doctor.updated_at
    }));

    res.json({
      success: true,
      data: transformedDoctors
    });
  } catch (error) {
    console.error('Error in admin doctors endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Sunucu hatası' 
    });
  }
});

// Patients management for admin panel
router.get('/patients', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('Admin patients endpoint called. User ID:', req.user.id);

    // Get organization ID from tenant context or user's default organization
    let organizationId = req.organizationId;

    if (!organizationId) {
      const { data: userOrgs, error: userOrgError } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', req.user.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: false })
        .limit(1);

      if (userOrgError || !userOrgs || userOrgs.length === 0) {
        console.error('User has no organization:', userOrgError);
        return res.status(403).json({ success: false, error: 'Kullanıcı herhangi bir organizasyona bağlı değil' });
      }

      organizationId = userOrgs[0].organization_id;
      console.log('Using fallback organization ID:', organizationId);
    }

    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patients:', error);
      return res.status(500).json({ success: false, error: 'Hasta listesi alınamadı' });
    }

    console.log(`Found ${patients?.length || 0} patients for organization ${organizationId}`);

    // Transform data for admin panel - mevcut patients tablosu yapısına göre
    const transformedPatients = patients.map(patient => ({
      id: patient.id,
      tc_kimlik_no: patient.tc_kimlik_no,
      first_name: patient.ad_soyad ? patient.ad_soyad.split(' ')[0] : '',
      last_name: patient.ad_soyad ? patient.ad_soyad.split(' ').slice(1).join(' ') : '',
      full_name: patient.ad_soyad || 'Belirtilmemiş',
      birth_date: patient.dogum_tarihi,
      age: patient.yas,
      gender: patient.cinsiyet,
      height: patient.boy,
      weight: patient.kilo,
      bmi: patient.vki,
      blood_type: patient.kan_grubu,
      marital_status: patient.medeni_durum,
      profession: patient.meslek,
      education: patient.egitim_durumu,
      chronic_diseases: patient.kronik_hastaliklar,
      surgeries: patient.ameliyatlar,
      allergies: patient.allerjiler,
      family_history: patient.aile_oykusu,
      infections: patient.enfeksiyonlar,
      regular_medications: patient.ilac_duzenli,
      irregular_medications: patient.ilac_duzensiz,
      alternative_medications: patient.ilac_alternatif,
      exercise: patient.hareket,
      sleep: patient.uyku,
      smoking_alcohol: patient.sigara_alkol,
      nutrition: patient.beslenme,
      psychology: patient.psikoloji,
      sleep_disorder: patient.uyku_bozuklugu,
      social_support: patient.sosyal_destek,
      created_at: patient.created_at,
      updated_at: patient.updated_at,
      patient_data: patient.patient_data
    }));

    res.json({
      success: true,
      data: transformedPatients
    });
  } catch (error) {
    console.error('Error in admin patients endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Sunucu hatası' 
    });
  }
});

module.exports = router;