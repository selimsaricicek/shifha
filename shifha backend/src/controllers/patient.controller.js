// Dosya Adı: src/controllers/patient.controller.js

const supabase = require('../services/supabaseClient');

// Tüm hastaları getiren fonksiyon
const getAllPatients = async (req, res) => {
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

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Hastalar getirilemedi', details: err.message });
  }
};

// Tek bir hastayı TC kimlik numarasına göre getiren fonksiyon
const getPatientByTC = async (req, res) => {
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
      return res.status(404).json({ error: 'Hasta bulunamadı' });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Hasta getirilemedi', details: err.message });
  }
};

module.exports = {
  getAllPatients,
  getPatientByTC,
};