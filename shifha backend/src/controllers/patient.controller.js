// Dosya Adı: src/controllers/patient.controller.js

const supabase = require('../services/supabaseClient');

/**
 * Tüm hastaları getirir
 * @route GET /api/patients
 * @returns {Object} 200 - { success, data }
 */
const getAllPatients = async (req, res, next) => {
  try {
    console.log("getAllPatients isteği alındı.");
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false }); // En son eklenen en üstte olsun

    if (error) {
      // Supabase'den gelen hatayı loglayalım
      console.error('Supabase get all error:', error);
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * TC Kimlik No ile hasta getirir
 * @route GET /api/patients/:tc
 * @returns {Object} 200 - { success, data } | 404 - { success: false, error }
 */
const getPatientByTC = async (req, res, next) => {
  try {
    let { tc } = req.params;
    tc = String(tc).trim();
    console.log(`getPatientByTC isteği alındı: TC=`, tc, '| typeof:', typeof tc);

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('tc_kimlik_no', tc)
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
 * Yeni hasta ekle
 * @route POST /api/patients
 */
const addPatient = async (req, res, next) => {
  try {
    const { body } = req;
    const { data, error } = await supabase
      .from('patients')
      .insert([body])
      .select();
    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Hasta güncelle
 * @route PUT /api/patients/:tc
 */
const updatePatient = async (req, res, next) => {
  try {
    const { tc } = req.params;
    const { body } = req;
    const { data, error } = await supabase
      .from('patients')
      .update(body)
      .eq('tc_kimlik_no', tc)
      .select();
    if (error) throw error;
    res.status(200).json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Hasta sil
 * @route DELETE /api/patients/:tc
 */
const deletePatient = async (req, res, next) => {
  try {
    const { tc } = req.params;
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('tc_kimlik_no', tc);
    if (error) throw error;
    res.status(204).json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * Hastanın kan tahlili sonuçlarını getirir
 * @route GET /api/patients/:tc/blood-test-results
 * @returns {Object} 200 - { success, data } | 404 - { success: false, error }
 */
const getBloodTestResults = async (req, res, next) => {
  try {
    let { tc } = req.params;
    tc = String(tc).trim();
    console.log(`getBloodTestResults isteği alındı: TC=${tc}`);

    const { data, error } = await supabase
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
 * Hastanın doktor notlarını getirir
 * @route GET /api/patients/:tc/notes
 */
const getDoctorNotes = async (req, res, next) => {
  try {
    const { tc } = req.params;
    console.log('getDoctorNotes çağrıldı, TC:', tc);
    
    const { data, error } = await supabase
      .from('doctor_notes')
      .select('*')
      .eq('patient_tc', tc)
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
 * Hastaya yeni doktor notu ekler
 * @route POST /api/patients/:tc/notes
 */
const addDoctorNote = async (req, res, next) => {
  try {
    const { tc } = req.params;
    const { note } = req.body;
    const user_id = req.user.id; // Middleware'den gelen kullanıcı ID'si

    console.log('addDoctorNote çağrıldı:', { tc, note, user_id });

    if (!note) {
      console.log('Not içeriği boş!');
      return res.status(400).json({ success: false, error: 'Not içeriği boş olamaz.' });
    }

    // Kullanıcı ID'si ile doktor profilini bul
    console.log('Doktor profili aranıyor, user_id:', user_id);
    const { data: doctorProfile, error: doctorError } = await supabase
      .from('doctor_profiles')
      .select('id, organization_id')
      .eq('user_id', user_id)
      .single();

    console.log('Doktor profili sonucu:', { doctorProfile, doctorError });

    if (doctorError || !doctorProfile) {
      console.log('Doktor profili bulunamadı!');
      return res.status(400).json({ success: false, error: 'Doktor profili bulunamadı.' });
    }

    // organization_id null ise varsayılan organizasyon ID'si kullan
    let organizationId = doctorProfile.organization_id;
    if (!organizationId) {
      // Varsayılan organizasyonu bul
      const { data: defaultOrg, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single();
      
      if (defaultOrg && !orgError) {
        organizationId = defaultOrg.id;
        console.log('Varsayılan organizasyon kullanılıyor:', organizationId);
      } else {
        console.log('Varsayılan organizasyon bulunamadı, organization_id null bırakılıyor');
      }
    }

    const insertData = { 
      patient_tc: tc, 
      doctor_id: doctorProfile.id, 
      organization_id: organizationId,
      note_content: note 
    };

    console.log('Doctor note insert edilecek data:', insertData);

    const { data, error } = await supabase
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

module.exports = {
  getAllPatients,
  getPatientByTC,
  addPatient,
  updatePatient,
  deletePatient,
  getBloodTestResults,
  getDoctorNotes,
  addDoctorNote,
};