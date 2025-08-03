const supabase = require('../services/supabaseClient');

/**
 * Tüm departmanları getirir
 * @route GET /api/departments
 */
const getAllDepartments = async (req, res, next) => {
  try {
    console.log("getAllDepartments isteği alındı.");
    
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Departman listesi getirme hatası:', error);
      throw error;
    }

    console.log(`${data?.length || 0} departman bulundu.`);
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getAllDepartments hatası:', err);
    next(err);
  }
};

/**
 * Organizasyona göre departmanları getirir
 * @route GET /api/organizations/:organizationId/departments
 */
const getDepartmentsByOrganization = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    console.log(`Organizasyon departmanları getiriliyor: organizationId=${organizationId}`);

    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Organizasyon departmanları getirme hatası:', error);
      throw error;
    }

    console.log(`${data?.length || 0} departman bulundu.`);
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getDepartmentsByOrganization hatası:', err);
    next(err);
  }
};

/**
 * Departman ekler
 * @route POST /api/departments
 */
const addDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    console.log('Yeni departman ekleniyor:', { name, description, organizationId: req.organizationId });

    if (!name) {
      return res.status(400).json({ success: false, error: 'Departman adı zorunludur.' });
    }

    const insertData = {
      name: name.trim(),
      description: description?.trim() || null,
      organization_id: req.organizationId
    };

    const { data, error } = await supabase
      .from('departments')
      .insert([insertData])
      .select('*');

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ success: false, error: 'Bu departman adı zaten kullanılıyor.' });
      }
      throw error;
    }

    console.log('Departman başarıyla eklendi:', data[0]);
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    console.error('addDepartment hatası:', err);
    next(err);
  }
};

/**
 * Departman günceller
 * @route PUT /api/departments/:id
 */
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    console.log(`Departman güncelleniyor: ID=${id}`, { name, description, organizationId: req.organizationId });

    if (!name) {
      return res.status(400).json({ success: false, error: 'Departman adı zorunludur.' });
    }

    const updateData = {
      name: name.trim(),
      description: description?.trim() || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('departments')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', req.organizationId)
      .select('*');

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ success: false, error: 'Bu departman adı zaten kullanılıyor.' });
      }
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Departman bulunamadı' 
      });
    }

    console.log('Departman başarıyla güncellendi:', data[0]);
    res.status(200).json({ success: true, data: data[0] });
  } catch (err) {
    console.error('updateDepartment hatası:', err);
    next(err);
  }
};

/**
 * Departman siler
 * @route DELETE /api/departments/:id
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Departman siliniyor: ID=${id}, organizationId=${req.organizationId}`);

    // Önce bu departmana bağlı doktor var mı kontrol et (organizasyon bazlı)
    const { data: doctors, error: doctorError } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('department_id', id)
      .eq('organization_id', req.organizationId);

    if (doctorError) throw doctorError;

    if (doctors && doctors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Bu departmana bağlı doktorlar bulunuyor. Önce doktorları başka departmanlara atayın.' 
      });
    }

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)
      .eq('organization_id', req.organizationId);

    if (error) throw error;

    console.log('Departman başarıyla silindi');
    res.status(204).json({ success: true });
  } catch (err) {
    console.error('deleteDepartment hatası:', err);
    next(err);
  }
};

/**
 * Departmana bağlı doktorları getirir
 * @route GET /api/departments/:id/doctors
 */
const getDepartmentDoctors = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Departman doktorları getiriliyor: ID=${id}, organizationId=${req.organizationId}`);

    const { data, error } = await supabase
      .from('doctor_profiles')
      .select(`
        *,
        departments:department_id(id, name),
        organizations:organization_id(id, name)
      `)
      .eq('department_id', id)
      .eq('organization_id', req.organizationId)
      .order('name', { ascending: true });

    if (error) throw error;

    console.log(`${data?.length || 0} doktor bulundu.`);
    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getDepartmentDoctors hatası:', err);
    next(err);
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentsByOrganization,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentDoctors
};