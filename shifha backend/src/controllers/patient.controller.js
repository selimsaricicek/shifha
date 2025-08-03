// Dosya Adı: src/controllers/patient.controller.js

const { supabaseAdmin } = require('../config/supabase');

/**
 * Doktorun erişim yetkisi olan hastaları getirir (multi-doktor desteği)
 * @route GET /api/patients
 * @returns {Object} 200 - { success, data }
 */
const getAllPatients = async (req, res, next) => {
  try {
    console.log("🔍 getAllPatients isteği alındı");
    console.log("📋 Organization ID:", req.organizationId);
    console.log("👤 User ID:", req.user.id);
    console.log("📧 User Email:", req.user.email);
    
    // Önce doktor profilini al
    const { data: doctorProfile, error: doctorError } = await supabaseAdmin
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('organization_id', req.organizationId)
      .single();

    console.log("🩺 Doktor profili sorgusu sonucu:", { doctorProfile, doctorError });

    if (doctorError || !doctorProfile) {
      console.error('❌ Doktor profili bulunamadı:', doctorError);
      return res.status(403).json({ 
        success: false, 
        error: 'Doktor profili bulunamadı' 
      });
    }

    console.log('✅ Doktor ID bulundu:', doctorProfile.id);

    // Önce erişim izinlerini kontrol et
    const { data: accessPermissions, error: accessError } = await supabaseAdmin
      .from('patient_access_permissions')
      .select('*')
      .eq('doctor_id', doctorProfile.id)
      .eq('is_active', true);

    console.log("🔐 Erişim izinleri:", { accessPermissions, accessError });

    // Doktorun erişim yetkisi olan hastaları getir (manual join)
    if (!accessPermissions || accessPermissions.length === 0) {
      console.log("⚠️ Bu doktor için hiç erişim izni bulunamadı");
      return res.status(200).json({ success: true, data: [] });
    }

    // Erişim izni olan hasta TC'lerini al
    const allowedPatientTCs = accessPermissions
      .filter(perm => perm.organization_id === req.organizationId)
      .map(perm => perm.patient_tc);

    console.log("📋 Erişim izni olan hasta TC'leri:", allowedPatientTCs);

    if (allowedPatientTCs.length === 0) {
      console.log("⚠️ Bu organizasyon için erişim izni olan hasta bulunamadı");
      return res.status(200).json({ success: true, data: [] });
    }

    // Bu TC'lere sahip hastaları getir
    console.log("🔍 Hasta sorgusu parametreleri:", {
      organization_id: req.organizationId,
      allowedPatientTCs: allowedPatientTCs,
      tcCount: allowedPatientTCs.length
    });

    const { data, error } = await supabaseAdmin
      .from('patient_profiles')
      .select('*')
      .eq('organization_id', req.organizationId)
      .in('tc_kimlik_no', allowedPatientTCs)
      .order('created_at', { ascending: false }); // En son eklenen en üstte olsun

    console.log("🏥 Hasta sorgusu sonucu:", { 
      data: data ? data.map(p => ({ tc: p.tc_kimlik_no, name: p.ad_soyad, org_id: p.organization_id })) : null, 
      error,
      dataLength: data ? data.length : 0
    });

    if (error) {
      console.error('❌ Supabase get patients with access error:', error);
      throw error;
    }

    console.log(`✅ Doktor ${doctorProfile.id} için ${data?.length || 0} hasta bulundu`);
    if (data && data.length > 0) {
      console.log("📝 Bulunan hastalar:", data.map(p => ({ 
        tc: p.tc_kimlik_no, 
        ad_soyad: p.ad_soyad,
        yas: p.yas,
        cinsiyet: p.cinsiyet,
        patient_data: p.patient_data ? 'var' : 'yok'
      })));
    }
    
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("💥 getAllPatients hatası:", err);
    next(err);
  }
};

/**
 * TC Kimlik No ile hasta getirir (organizasyon bazlı)
 * @route GET /api/patients/:tc
 * @returns {Object} 200 - { success, data } | 404 - { success: false, error }
 */
const getPatientByTC = async (req, res, next) => {
  try {
    let { tc } = req.params;
    tc = String(tc).trim();
    console.log(`getPatientByTC isteği alındı: TC=`, tc, '| typeof:', typeof tc, '| Organization ID:', req.organizationId);

    const { data, error } = await supabaseAdmin
      .from('patient_profiles')
      .select('*')
      .eq('tc_kimlik_no', tc)
      .eq('organization_id', req.organizationId)
      .single(); // Sadece 1 sonuç bekliyoruz

    console.log('Supabase dönen data:', data, '| error:', error);

    if (error) {
      console.error('Supabase get by TC error:', error);
      throw error;
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Hasta bulunamadı' });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * Yeni hasta ekle (organizasyon bazlı)
 * @route POST /api/patients
 */
const addPatient = async (req, res, next) => {
  try {
    const { body } = req;
    // Organizasyon ID'sini otomatik olarak ekle
    const patientData = {
      ...body,
      organization_id: req.organizationId
    };
    console.log('Yeni hasta ekleniyor:', patientData);
    
    const { data, error } = await supabaseAdmin
      .from('patient_profiles')
      .insert([patientData])
      .select();
    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Hasta güncelle (organizasyon bazlı)
 * @route PUT /api/patients/:tc
 */
const updatePatient = async (req, res, next) => {
  try {
    const { tc } = req.params;
    const { body } = req;
    console.log(`Hasta güncelleniyor: TC=${tc}, Organization ID: ${req.organizationId}`, body);
    
    // id alanını filtreleyerek güncelleme verilerini hazırla
    const { id, ...updateData } = body;
    console.log('Güncellenecek veriler (id filtrelendi):', updateData);
    
    const { data, error } = await supabaseAdmin
      .from('patient_profiles')
      .update(updateData)
      .eq('tc_kimlik_no', tc)
      .eq('organization_id', req.organizationId)
      .select();
    if (error) throw error;
    res.status(200).json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Hasta sil (organizasyon bazlı)
 * @route DELETE /api/patients/:tc
 */
const deletePatient = async (req, res, next) => {
  try {
    const { tc } = req.params;
    console.log(`Hasta siliniyor: TC=${tc}, Organization ID: ${req.organizationId}`);
    
    const { error } = await supabaseAdmin
      .from('patient_profiles')
      .delete()
      .eq('tc_kimlik_no', tc)
      .eq('organization_id', req.organizationId);
    if (error) throw error;
    res.status(204).json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * Hastanın kan tahlili sonuçlarını getirir (organizasyon bazlı)
 * @route GET /api/patients/:tc/blood-test-results
 * @returns {Object} 200 - { success, data } | 404 - { success: false, error }
 */
const getBloodTestResults = async (req, res, next) => {
  try {
    let { tc } = req.params;
    tc = String(tc).trim();
    console.log(`getBloodTestResults isteği alındı: TC=${tc}, Organization ID: ${req.organizationId}`);

    // Önce hastanın bu organizasyonda olup olmadığını kontrol et
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patient_profiles')
      .select('tc_kimlik_no')
      .eq('tc_kimlik_no', tc)
      .eq('organization_id', req.organizationId)
      .single();

    if (patientError || !patient) {
      return res.status(404).json({ 
        success: false, 
        error: 'Hasta bu organizasyonda bulunamadı' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('blood_test_results')
      .select('*')
      .eq('patient_tc', tc)
      .order('test_date', { ascending: false }); // En yeni sonuçlar en üstte

    if (error) {
      console.error('Supabase kan tahlili hatası:', error);
      throw error;
    }

    console.log(`${tc} için ${data?.length || 0} kan tahlili sonucu bulundu`);
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Kan tahlili getirme hatası:', err);
    next(err);
  }
};

/**
 * Hastanın doktor notlarını getirir (organizasyon bazlı)
 * @route GET /api/patients/:tc/notes
 */
const getDoctorNotes = async (req, res, next) => {
  try {
    const { tc } = req.params;
    console.log('getDoctorNotes çağrıldı, TC:', tc, 'Organization ID:', req.organizationId);
    
    // Önce hastanın bu organizasyonda olup olmadığını kontrol et
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patient_profiles')
      .select('tc_kimlik_no')
      .eq('tc_kimlik_no', tc)
      .eq('organization_id', req.organizationId)
      .single();

    if (patientError || !patient) {
      return res.status(404).json({ 
        success: false, 
        error: 'Hasta bu organizasyonda bulunamadı' 
      });
    }
    
    const { data, error } = await supabaseAdmin
      .from('doctor_notes')
      .select('*')
      .eq('patient_tc', tc)
      .eq('organization_id', req.organizationId)
      .order('created_at', { ascending: false });

    console.log('getDoctorNotes sonucu:', { data, error, count: data?.length || 0 });

    if (error) throw error;
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getDoctorNotes hatası:', err);
    next(err);
  }
};

/**
 * Hastaya yeni doktor notu ekler (organizasyon bazlı)
 * @route POST /api/patients/:tc/notes
 */
const addDoctorNote = async (req, res, next) => {
  try {
    const { tc } = req.params;
    const { note } = req.body;
    const user_id = req.user.id; // Middleware'den gelen kullanıcı ID'si

    console.log('addDoctorNote çağrıldı:', { tc, note, user_id, organizationId: req.organizationId });

    if (!note) {
      console.log('Not içeriği boş!');
      return res.status(400).json({ success: false, error: 'Not içeriği boş olamaz.' });
    }

    // Önce hastanın bu organizasyonda olup olmadığını kontrol et
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patient_profiles')
      .select('tc_kimlik_no')
      .eq('tc_kimlik_no', tc)
      .eq('organization_id', req.organizationId)
      .single();

    if (patientError || !patient) {
      return res.status(404).json({ 
        success: false, 
        error: 'Hasta bu organizasyonda bulunamadı' 
      });
    }

    // Kullanıcı ID'si ile doktor profilini bul (organizasyon bazlı)
    console.log('Doktor profili aranıyor, user_id:', user_id);
    const { data: doctorProfile, error: doctorError } = await supabaseAdmin
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', user_id)
      .eq('organization_id', req.organizationId)
      .single();

    console.log('Doktor profili sonucu:', { doctorProfile, doctorError });

    if (doctorError || !doctorProfile) {
      console.log('Doktor profili bulunamadı!');
      return res.status(400).json({ success: false, error: 'Doktor profili bulunamadı.' });
    }

    const insertData = { 
      patient_tc: tc, 
      doctor_id: doctorProfile.id, 
      organization_id: req.organizationId,
      note_content: note 
    };

    console.log('Doctor note insert edilecek data:', insertData);

    const { data, error } = await supabaseAdmin
      .from('doctor_notes')
      .insert([insertData])
      .select();

    console.log('Insert sonucu:', { data, error });

    if (error) throw error;

    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    console.error('addDoctorNote hatası:', err);
    next(err);
  }
};

/**
 * Hastaya doktor erişimi ekler
 * @route POST /api/patients/:tc/access
 */
const addPatientAccess = async (req, res, next) => {
  try {
    const { tc } = req.params;
    const { doctor_id, permission_type = 'read' } = req.body;
    const user_id = req.user.id;

    console.log('addPatientAccess çağrıldı:', { tc, doctor_id, permission_type, user_id, organizationId: req.organizationId });

    // Önce hastanın bu organizasyonda olup olmadığını kontrol et
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patient_profiles')
      .select('tc_kimlik_no')
      .eq('tc_kimlik_no', tc)
      .eq('organization_id', req.organizationId)
      .single();

    if (patientError || !patient) {
      return res.status(404).json({ 
        success: false, 
        error: 'Hasta bu organizasyonda bulunamadı' 
      });
    }

    // Doktorun bu organizasyonda olup olmadığını kontrol et
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('doctor_profiles')
      .select('id')
      .eq('id', doctor_id)
      .eq('organization_id', req.organizationId)
      .single();

    if (doctorError || !doctor) {
      return res.status(404).json({ 
        success: false, 
        error: 'Doktor bu organizasyonda bulunamadı' 
      });
    }

    // Erişim izni ekle
    const accessData = {
      patient_tc: tc,
      doctor_id: doctor_id,
      organization_id: req.organizationId,
      permission_type: permission_type,
      granted_by: user_id,
      is_active: true
    };

    const { data, error } = await supabaseAdmin
      .from('patient_access_permissions')
      .upsert([accessData], { 
        onConflict: 'patient_tc,doctor_id,organization_id',
        ignoreDuplicates: false 
      })
      .select();

    if (error) throw error;

    console.log('Hasta erişimi eklendi:', data[0]);
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    console.error('addPatientAccess hatası:', err);
    next(err);
  }
};

/**
 * Hastadan doktor erişimini kaldırır
 * @route DELETE /api/patients/:tc/access/:doctorId
 */
const removePatientAccess = async (req, res, next) => {
  try {
    const { tc, doctorId } = req.params;

    console.log('removePatientAccess çağrıldı:', { tc, doctorId, organizationId: req.organizationId });

    const { error } = await supabaseAdmin
      .from('patient_access_permissions')
      .delete()
      .eq('patient_tc', tc)
      .eq('doctor_id', doctorId)
      .eq('organization_id', req.organizationId);

    if (error) throw error;

    console.log('Hasta erişimi kaldırıldı');
    res.status(204).json({ success: true });
  } catch (err) {
    console.error('removePatientAccess hatası:', err);
    next(err);
  }
};

/**
 * Hastanın erişim izinlerini listeler
 * @route GET /api/patients/:tc/access
 */
const getPatientAccess = async (req, res, next) => {
  try {
    const { tc } = req.params;

    console.log('getPatientAccess çağrıldı:', { tc, organizationId: req.organizationId });

    const { data, error } = await supabaseAdmin
      .from('patient_access_permissions')
      .select(`
        *,
        doctor_profiles (
          id,
          full_name,
          specialization,
          email
        )
      `)
      .eq('patient_tc', tc)
      .eq('organization_id', req.organizationId)
      .eq('is_active', true);

    if (error) throw error;

    console.log(`${tc} için ${data?.length || 0} erişim izni bulundu`);
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getPatientAccess hatası:', err);
    next(err);
  }
};

/**
 * Toplu hasta-doktor erişimi oluşturur (test için)
 * @route POST /api/patients/bulk-access
 */
const createBulkPatientAccess = async (req, res, next) => {
  try {
    const { assignments } = req.body; // [{ patient_tc, doctor_id, permission_type }]
    const user_id = req.user.id;

    console.log('createBulkPatientAccess çağrıldı:', { assignments, user_id, organizationId: req.organizationId });

    if (!assignments || !Array.isArray(assignments)) {
      return res.status(400).json({ 
        success: false, 
        error: 'assignments array gerekli' 
      });
    }

    const accessData = assignments.map(assignment => ({
      patient_tc: assignment.patient_tc,
      doctor_id: assignment.doctor_id,
      organization_id: req.organizationId,
      permission_type: assignment.permission_type || 'read',
      granted_by: user_id,
      is_active: true
    }));

    const { data, error } = await supabaseAdmin
      .from('patient_access_permissions')
      .upsert(accessData, { 
        onConflict: 'patient_tc,doctor_id,organization_id',
        ignoreDuplicates: false 
      })
      .select();

    if (error) throw error;

    console.log(`${data?.length || 0} hasta erişimi oluşturuldu`);
    res.status(201).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('createBulkPatientAccess hatası:', err);
    next(err);
  }
};

module.exports = {
  getAllPatients,
  getPatientByTC,
  addPatient,
  updatePatient,
  deletePatient,
  getBloodTestResults,
  getDoctorNotes,
  addDoctorNote,
  addPatientAccess,
  removePatientAccess,
  getPatientAccess,
  createBulkPatientAccess,
};