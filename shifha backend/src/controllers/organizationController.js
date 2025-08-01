const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);



const createOrganization = async (req, res) => {
  try {
    const { name, type, address, phone, email, website, license_number, max_doctors, max_patients } = req.body;
    const userId = req.user.id;

    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        type,
        address,
        phone,
        email,
        website,
        license_number,
        max_doctors: max_doctors || 5,
        max_patients: max_patients || 100
      })
      .select()
      .single();

    if (orgError) throw orgError;

    const { error: userOrgError } = await supabase
      .from('user_organizations')
      .insert({
        user_id: userId,
        organization_id: organization.id,
        role: 'org_admin'
      });

    if (userOrgError) throw userOrgError;

    res.status(201).json({
      success: true,
      data: organization,
      message: 'Organizasyon başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Organizasyon oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Organizasyon oluşturulamadı',
      error: error.message
    });
  }
};

const getUserOrganizations = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('user_organizations')
      .select(`
        *,
        organizations (
          id,
          name,
          type,
          address,
          phone,
          email,
          website,
          is_active,
          subscription_plan,
          max_doctors,
          max_patients,
          created_at
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Organizasyonları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Organizasyonlar getirilemedi',
      error: error.message
    });
  }
};

const getOrganizationDetails = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const userId = req.user.id;

    const { data: userOrg, error: userOrgError } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();

    if (userOrgError || !userOrg) {
      return res.status(403).json({
        success: false,
        message: 'Bu organizasyona erişim yetkiniz yok'
      });
    }

    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select(`
        *,
        departments (
          id,
          name,
          description,
          is_active,
          head_doctor_id
        )
      `)
      .eq('id', organizationId)
      .single();

    if (orgError) throw orgError;

    const { count: doctorCount } = await supabase
      .from('user_organizations')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .in('role', ['doctor', 'head_doctor'])
      .eq('is_active', true);

    const { count: patientCount } = await supabase
      .from('patient_access_permissions')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    res.json({
      success: true,
      data: {
        ...organization,
        stats: {
          doctor_count: doctorCount || 0,
          patient_count: patientCount || 0
        },
        user_role: userOrg.role
      }
    });
  } catch (error) {
    console.error('Organizasyon detayları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Organizasyon detayları getirilemedi',
      error: error.message
    });
  }
};

const addDoctorToOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { doctorEmail, role = 'doctor', departmentId } = req.body;
    const userId = req.user.id;

    const { data: userOrg, error: userOrgError } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();

    if (userOrgError || !userOrg || !['org_admin', 'head_doctor'].includes(userOrg.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }

    const { data: doctor, error: doctorError } = await supabase
      .from('doctor_profiles')
      .select('id, user_id')
      .eq('email', doctorEmail)
      .single();

    if (doctorError || !doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doktor bulunamadı'
      });
    }

    const { data: newUserOrg, error: addError } = await supabase
      .from('user_organizations')
      .insert({
        user_id: doctor.user_id,
        organization_id: organizationId,
        role,
        department_id: departmentId
      })
      .select()
      .single();

    if (addError) {
      if (addError.code === '23505') { 
        return res.status(400).json({
          success: false,
          message: 'Bu doktor zaten organizasyonda mevcut'
        });
      }
      throw addError;
    }

    res.status(201).json({
      success: true,
      data: newUserOrg,
      message: 'Doktor başarıyla organizasyona eklendi'
    });
  } catch (error) {
    console.error('Doktor ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Doktor eklenemedi',
      error: error.message
    });
  }
};

const getOrganizationDoctors = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const userId = req.user.id;

    const { data: userOrg, error: userOrgError } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();

    if (userOrgError || !userOrg) {
      return res.status(403).json({
        success: false,
        message: 'Bu organizasyona erişim yetkiniz yok'
      });
    }

    const { data, error } = await supabase
      .from('user_organizations')
      .select(`
        *,
        doctor_profiles (
          id,
          first_name,
          last_name,
          email,
          phone,
          specialization,
          license_number,
          years_of_experience,
          consultation_fee,
          available_for_consultation,
          bio,
          profile_image_url
        ),
        departments (
          id,
          name
        )
      `)
      .eq('organization_id', organizationId)
      .in('role', ['doctor', 'head_doctor'])
      .eq('is_active', true);

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Doktorları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Doktorlar getirilemedi',
      error: error.message
    });
  }
};


const createDepartment = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { name, description, headDoctorId } = req.body;
    const userId = req.user.id;

    const { data: userOrg, error: userOrgError } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();

    if (userOrgError || !userOrg || !['org_admin', 'head_doctor'].includes(userOrg.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }

    const { data: department, error } = await supabase
      .from('departments')
      .insert({
        organization_id: organizationId,
        name,
        description,
        head_doctor_id: headDoctorId
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: department,
      message: 'Departman başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Departman oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Departman oluşturulamadı',
      error: error.message
    });
  }
};

const getOrganizationDepartments = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const userId = req.user.id;

    const { data: userOrg, error: userOrgError } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();

    if (userOrgError || !userOrg) {
      return res.status(403).json({
        success: false,
        message: 'Bu organizasyona erişim yetkiniz yok'
      });
    }

    const { data, error } = await supabase
      .from('departments')
      .select(`
        *,
        doctor_profiles!departments_head_doctor_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Departmanları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Departmanlar getirilemedi',
      error: error.message
    });
  }
};

module.exports = {
  createOrganization,
  getUserOrganizations,
  getOrganizationDetails,
  addDoctorToOrganization,
  getOrganizationDoctors,
  createDepartment,
  getOrganizationDepartments
};