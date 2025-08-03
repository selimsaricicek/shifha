// Dosya Adı: src/controllers/location.controller.js

const { supabaseAdmin } = require('../config/supabase');

/**
 * Tüm şehirleri getirir
 * @route GET /api/locations/cities
 */
const getAllCities = async (req, res, next) => {
  try {
    console.log("getAllCities isteği alındı.");
    const { data, error } = await supabaseAdmin
      .from('cities')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    
    console.log(`${data?.length || 0} şehir bulundu.`);
    res.json({ success: true, data: data || [] });
  } catch (err) {
    next(err);
  }
};

/**
 * Şehre ait ilçeleri getirir
 * @route GET /api/locations/cities/:cityId/districts
 */
const getDistrictsByCity = async (req, res, next) => {
  try {
    const { cityId } = req.params;
    console.log(`getDistrictsByCity isteği alındı: cityId=${cityId}`);

    const { data, error } = await supabase
      .from('districts')
      .select('*')
      .eq('city_id', cityId)
      .order('name', { ascending: true });

    if (error) throw error;
    
    console.log(`${data?.length || 0} ilçe bulundu.`);
    res.json({ success: true, data: data || [] });
  } catch (err) {
    next(err);
  }
};

/**
 * İlçeye ait hastaneleri getirir (organizasyon bazlı)
 * @route GET /api/locations/districts/:districtId/hospitals
 */
const getHospitalsByDistrict = async (req, res, next) => {
  try {
    const { districtId } = req.params;
    console.log(`getHospitalsByDistrict isteği alındı: districtId=${districtId}, organizationId=${req.organizationId}`);

    const { data, error } = await supabase
      .from('hospitals')
      .select(`
        *,
        districts:district_id (
          id,
          name,
          cities:city_id (
            id,
            name
          )
        )
      `)
      .eq('district_id', districtId)
      .eq('organization_id', req.organizationId)
      .order('name', { ascending: true });

    if (error) throw error;
    
    console.log(`${data?.length || 0} hastane bulundu.`);
    res.json({ success: true, data: data || [] });
  } catch (err) {
    next(err);
  }
};

/**
 * Tüm hastaneleri getirir (organizasyon bazlı)
 * @route GET /api/locations/hospitals
 */
const getAllHospitals = async (req, res, next) => {
  try {
    console.log("getAllHospitals isteği alındı. Organization ID:", req.organizationId);
    const { data, error } = await supabase
      .from('hospitals')
      .select(`
        *,
        districts:district_id (
          id,
          name,
          cities:city_id (
            id,
            name
          )
        )
      `)
      .eq('organization_id', req.organizationId)
      .order('name', { ascending: true });

    if (error) throw error;
    
    console.log(`${data?.length || 0} hastane bulundu.`);
    res.json({ success: true, data: data || [] });
  } catch (err) {
    next(err);
  }
};

/**
 * Yeni şehir ekle
 * @route POST /api/locations/cities
 */
const addCity = async (req, res, next) => {
  try {
    const { name } = req.body;
    console.log('Yeni şehir ekleniyor:', name);

    const { data, error } = await supabase
      .from('cities')
      .insert([{ name }])
      .select();

    if (error) throw error;
    
    console.log('Şehir başarıyla eklendi:', data[0]);
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Yeni ilçe ekle
 * @route POST /api/locations/districts
 */
const addDistrict = async (req, res, next) => {
  try {
    const { city_id, name } = req.body;
    console.log('Yeni ilçe ekleniyor:', { city_id, name });

    const { data, error } = await supabase
      .from('districts')
      .insert([{ city_id, name }])
      .select(`
        *,
        cities:city_id (
          id,
          name
        )
      `);

    if (error) throw error;
    
    console.log('İlçe başarıyla eklendi:', data[0]);
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Yeni hastane ekle
 * @route POST /api/locations/hospitals
 */
const addHospital = async (req, res, next) => {
  try {
    const { district_id, name, address, phone, email } = req.body;
    console.log('Yeni hastane ekleniyor:', { district_id, name, address, phone, email, organizationId: req.organizationId });

    const { data, error } = await supabase
      .from('hospitals')
      .insert([{ district_id, name, address, phone, email, organization_id: req.organizationId }])
      .select(`
        *,
        districts:district_id (
          id,
          name,
          cities:city_id (
            id,
            name
          )
        )
      `);

    if (error) throw error;
    
    console.log('Hastane başarıyla eklendi:', data[0]);
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Hastane güncelle
 * @route PUT /api/locations/hospitals/:id
 */
const updateHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { district_id, name, address, phone, email } = req.body;
    console.log(`Hastane güncelleniyor: ID=${id}`, { district_id, name, address, phone, email, organizationId: req.organizationId });

    const { data, error } = await supabase
      .from('hospitals')
      .update({ district_id, name, address, phone, email, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', req.organizationId)
      .select(`
        *,
        districts:district_id (
          id,
          name,
          cities:city_id (
            id,
            name
          )
        )
      `);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Hastane bulunamadı' 
      });
    }

    console.log('Hastane başarıyla güncellendi:', data[0]);
    res.json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Hastane sil
 * @route DELETE /api/locations/hospitals/:id
 */
const deleteHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Hastane siliniyor: ID=${id}, organizationId=${req.organizationId}`);

    const { error } = await supabase
      .from('hospitals')
      .delete()
      .eq('id', id)
      .eq('organization_id', req.organizationId);

    if (error) throw error;
    
    console.log('Hastane başarıyla silindi');
    res.json({ success: true, message: 'Hastane başarıyla silindi' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCities,
  getDistrictsByCity,
  getHospitalsByDistrict,
  getAllHospitals,
  addCity,
  addDistrict,
  addHospital,
  updateHospital,
  deleteHospital
};