const supabase = require('../services/supabaseClient');

/**
 * Get admin profile
 * @route GET /api/admin/profile
 * @returns {Object} 200 - { success, data }
 */
const getProfile = async (req, res, next) => {
  try {
    const adminData = req.admin;
    
    // Get additional profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', adminData.user_id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    const response = {
      ...adminData,
      profile: profileData
    };

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Get admin profile error:', error);
    next(error);
  }
};

/**
 * Get all admins (Super admin only)
 * @route GET /api/admin/admins
 * @returns {Object} 200 - { success, data }
 */
const getAllAdmins = async (req, res, next) => {
  try {
    const { data: admins, error } = await supabase
      .from('admins')
      .select(`
        *,
        profiles:user_id (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.json({ success: true, data: admins });
  } catch (error) {
    console.error('Get all admins error:', error);
    next(error);
  }
};

/**
 * Create new admin (Super admin only)
 * @route POST /api/admin/admins
 * @returns {Object} 201 - { success, data }
 */
const createAdmin = async (req, res, next) => {
  try {
    const { email, password, full_name, role = 'admin' } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, şifre ve tam ad gereklidir'
      });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name: full_name, 
        role: 'admin' 
      },
      email_confirm: true
    });

    if (authError) {
      throw new Error(authError.message);
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          name: full_name,
          updated_at: new Date().toISOString()
        }
      ]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    // Create admin record
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .insert([
        {
          user_id: authData.user.id,
          email,
          full_name,
          role,
          is_active: true,
          created_by: req.admin.user_id
        }
      ])
      .select()
      .single();

    if (adminError) {
      throw new Error(adminError.message);
    }

    res.status(201).json({ success: true, data: adminData });
  } catch (error) {
    console.error('Create admin error:', error);
    next(error);
  }
};

/**
 * Update admin (Super admin only)
 * @route PUT /api/admin/admins/:id
 * @returns {Object} 200 - { success, data }
 */
const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, role, is_active, permissions } = req.body;

    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (permissions !== undefined) updateData.permissions = permissions;

    const { data: adminData, error } = await supabase
      .from('admins')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    res.json({ success: true, data: adminData });
  } catch (error) {
    console.error('Update admin error:', error);
    next(error);
  }
};

/**
 * Delete admin (Super admin only)
 * @route DELETE /api/admin/admins/:id
 * @returns {Object} 200 - { success, message }
 */
const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get admin data first
    const { data: adminData, error: getError } = await supabase
      .from('admins')
      .select('user_id')
      .eq('id', id)
      .single();

    if (getError || !adminData) {
      return res.status(404).json({
        success: false,
        message: 'Admin bulunamadı'
      });
    }

    // Prevent self-deletion
    if (adminData.user_id === req.admin.user_id) {
      return res.status(400).json({
        success: false,
        message: 'Kendi hesabınızı silemezsiniz'
      });
    }

    // Delete admin record (this will cascade to auth.users due to foreign key)
    const { error: deleteError } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    // Delete user from Supabase Auth
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(adminData.user_id);
    
    if (authDeleteError) {
      console.error('Auth user deletion error:', authDeleteError);
    }

    res.json({ 
      success: true, 
      message: 'Admin başarıyla silindi' 
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    next(error);
  }
};

/**
 * Get dashboard statistics
 * @route GET /api/admin/dashboard/stats
 * @returns {Object} 200 - { success, data }
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Get various statistics
    const [
      doctorsResult,
      patientsResult,
      appointmentsResult,
      organizationsResult
    ] = await Promise.all([
      supabase.from('doctor_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('patients').select('tc_kimlik_no', { count: 'exact', head: true }),
      supabase.from('appointments').select('id', { count: 'exact', head: true }),
      supabase.from('organizations').select('id', { count: 'exact', head: true })
    ]);

    const stats = {
      totalDoctors: doctorsResult.count || 0,
      totalPatients: patientsResult.count || 0,
      totalAppointments: appointmentsResult.count || 0,
      totalOrganizations: organizationsResult.count || 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    next(error);
  }
};

module.exports = {
  getProfile,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getDashboardStats
};