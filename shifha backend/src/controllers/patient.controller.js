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
    const { tc } = req.params;
    console.log(`getPatientByTC isteği alındı: TC=${tc}`);

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('tc_kimlik_no', tc)
      .single(); // Sadece 1 sonuç bekliyoruz

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

module.exports = {
  getAllPatients,
  getPatientByTC,
  addPatient,
  updatePatient,
  deletePatient,
};