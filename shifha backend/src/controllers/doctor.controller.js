// Dosya Adı: src/controllers/doctor.controller.js

const supabase = require('../services/supabaseClient');

/**
 * Tüm doktorları getirir
 * @route GET /api/doctors
 * @returns {Object} 200 - { success, data }
 */
const getAllDoctors = async (req, res, next) => {
  try {
    console.log("getAllDoctors isteği alındı.");
    const { data, error } = await supabase
      .from('doctor_profiles')
      .select(`
        *,
        hospitals:hospital_id (
          id,
          name,
          address,
          districts:district_id (
            id,
            name,
            cities:city_id (
              id,
              name
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Doktor listesi getirme hatası:', error);
      throw error;
    }

    console.log(`${data?.length || 0} doktor bulundu.`);
    res.json({ success: true, data: data || [] });
  } catch (err) {
    next(err);
  }
};

/**
 * ID ile doktor getirir
 * @route GET /api/doctors/:id
 * @returns {Object} 200 - { success, data } | 404 - { success: false, error }
 */
const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`getDoctorById isteği alındı: ID=${id}`);

    const { data, error } = await supabase
      .from('doctor_profiles')
      .select(`
        *,
        hospitals:hospital_id (
          id,
          name,
          address,
          districts:district_id (
            id,
            name,
            cities:city_id (
              id,
              name
            )
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false, 
          error: 'Doktor bulunamadı' 
        });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * Yeni doktor ekle
 * @route POST /api/doctors
 */
const addDoctor = async (req, res, next) => {
  try {
    const { body } = req;
    console.log('Yeni doktor ekleniyor:', body);

    const { data, error } = await supabase
      .from('doctor_profiles')
      .insert([body])
      .select(`
        *,
        hospitals:hospital_id (
          id,
          name,
          address,
          districts:district_id (
            id,
            name,
            cities:city_id (
              id,
              name
            )
          )
        )
      `);

    if (error) throw error;
    
    console.log('Doktor başarıyla eklendi:', data[0]);
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Doktor güncelle
 * @route PUT /api/doctors/:id
 */
const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req;
    console.log(`Doktor güncelleniyor: ID=${id}`, body);

    const { data, error } = await supabase
      .from('doctor_profiles')
      .update(body)
      .eq('id', id)
      .select(`
        *,
        hospitals:hospital_id (
          id,
          name,
          address,
          districts:district_id (
            id,
            name,
            cities:city_id (
              id,
              name
            )
          )
        )
      `);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Doktor bulunamadı' 
      });
    }

    console.log('Doktor başarıyla güncellendi:', data[0]);
    res.json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Doktor sil
 * @route DELETE /api/doctors/:id
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Doktor siliniyor: ID=${id}`);

    const { error } = await supabase
      .from('doctor_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    console.log('Doktor başarıyla silindi');
    res.json({ success: true, message: 'Doktor başarıyla silindi' });
  } catch (err) {
    next(err);
  }
};

/**
 * Hastaneye doktor ata
 * @route PUT /api/doctors/:id/assign-hospital
 */
const assignDoctorToHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hospital_id, department } = req.body;
    console.log(`Doktor hastaneye atanıyor: ID=${id}, Hospital=${hospital_id}, Department=${department}`);

    const { data, error } = await supabase
      .from('doctor_profiles')
      .update({ 
        hospital_id, 
        department,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        hospitals:hospital_id (
          id,
          name,
          address,
          districts:district_id (
            id,
            name,
            cities:city_id (
              id,
              name
            )
          )
        )
      `);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Doktor bulunamadı' 
      });
    }

    console.log('Doktor başarıyla hastaneye atandı:', data[0]);
    res.json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  assignDoctorToHospital
};