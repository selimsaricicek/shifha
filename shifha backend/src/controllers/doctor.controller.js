// Dosya Adı: src/controllers/doctor.controller.js

const { supabaseAdmin } = require('../config/supabase');

/**
 * Tüm doktorları getirir (organizasyon bazlı)
 * @route GET /api/doctors
 * @returns {Object} 200 - { success, data }
 */
const getAllDoctors = async (req, res, next) => {
  try {
    console.log("getAllDoctors isteği alındı. Organization ID:", req.organizationId);
    const { data, error } = await supabaseAdmin
      .from('doctor_profiles')
      .select(`
        *,
        departments:department_id(id, name),
        organizations:organization_id(id, name),
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
      .eq('organization_id', req.organizationId)
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
 * ID ile doktor getirir (organizasyon bazlı)
 * @route GET /api/doctors/:id
 * @returns {Object} 200 - { success, data } | 404 - { success: false, error }
 */
const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`getDoctorById isteği alındı: ID=${id}, Organization ID: ${req.organizationId}`);

    const { data, error } = await supabase
      .from('doctor_profiles')
      .select(`
        *,
        departments:department_id(id, name),
        organizations:organization_id(id, name),
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
      .eq('organization_id', req.organizationId)
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
 * Yeni doktor ekle (organizasyon bazlı)
 * @route POST /api/doctors
 */
const addDoctor = async (req, res, next) => {
  try {
    const { body } = req;
    // Organizasyon ID'sini otomatik olarak ekle
    const doctorData = {
      ...body,
      organization_id: req.organizationId
    };
    console.log('Yeni doktor ekleniyor:', doctorData);

    const { data, error } = await supabase
      .from('doctor_profiles')
      .insert([doctorData])
      .select(`
        *,
        departments:department_id(id, name),
        organizations:organization_id(id, name),
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
 * Doktor güncelle (organizasyon bazlı)
 * @route PUT /api/doctors/:id
 */
const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req;
    console.log(`Doktor güncelleniyor: ID=${id}, Organization ID: ${req.organizationId}`, body);

    const { data, error } = await supabase
      .from('doctor_profiles')
      .update(body)
      .eq('id', id)
      .eq('organization_id', req.organizationId)
      .select(`
        *,
        departments:department_id(id, name),
        organizations:organization_id(id, name),
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
 * Doktor sil (organizasyon bazlı)
 * @route DELETE /api/doctors/:id
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Doktor siliniyor: ID=${id}, Organization ID: ${req.organizationId}`);

    const { error } = await supabase
      .from('doctor_profiles')
      .delete()
      .eq('id', id)
      .eq('organization_id', req.organizationId);

    if (error) throw error;
    
    console.log('Doktor başarıyla silindi');
    res.json({ success: true, message: 'Doktor başarıyla silindi' });
  } catch (err) {
    next(err);
  }
};

/**
 * Hastaneye doktor ata (organizasyon bazlı)
 * @route PUT /api/doctors/:id/assign-hospital
 */
const assignDoctorToHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hospital_id, department_id } = req.body;
    console.log(`Doktor hastaneye atanıyor: ID=${id}, Hospital=${hospital_id}, DepartmentID=${department_id}, Organization ID: ${req.organizationId}`);

    const { data, error } = await supabase
      .from('doctor_profiles')
      .update({ 
        hospital_id, 
        department_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', req.organizationId)
      .select(`
        *,
        departments:department_id(id, name),
        organizations:organization_id(id, name),
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