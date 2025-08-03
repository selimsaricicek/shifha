const { supabaseAdmin } = require('../config/supabase');

/**
 * Get admin profile
 * @route GET /api/admin/profile
 * @returns {Object} 200 - { success, data }
 */
const getProfile = async (req, res, next) => {
  try {
    const adminData = req.admin;
    
    // Get additional profile data
    const { data: profileData, error: profileError } = await supabaseAdmin
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
    const { data: admins, error } = await supabaseAdmin
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
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
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
    const { error: profileError } = await supabaseAdmin
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
    const { data: adminData, error: adminError } = await supabaseAdmin
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

    const { data: adminData, error } = await supabaseAdmin
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
    const { data: adminData, error: getError } = await supabaseAdmin
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
    const { error: deleteError } = await supabaseAdmin
      .from('admins')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    // Delete user from Supabase Auth
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(adminData.user_id);
    
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
 * Get dashboard statistics (tüm sistem)
 * @route GET /api/admin/dashboard/stats
 * @returns {Object} 200 - { success, data }
 */
const getDashboardStats = async (req, res, next) => {
  try {
    console.log('Admin dashboard stats alınıyor...');

    // Get system-wide statistics
    const [
      doctorsResult,
      patientsResult,
      organizationsResult,
      hospitalsResult
    ] = await Promise.all([
      supabaseAdmin.from('doctor_profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('patients').select('tc_kimlik_no', { count: 'exact', head: true }),
      supabaseAdmin.from('organizations').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('hospitals').select('id', { count: 'exact', head: true })
    ]);

    // Get recent activity
    const { data: recentDoctors } = await supabaseAdmin
      .from('doctor_profiles')
      .select('full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentPatients } = await supabaseAdmin
      .from('patients')
      .select('ad_soyad, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const stats = {
      totalDoctors: doctorsResult.count || 0,
      totalPatients: patientsResult.count || 0,
      totalOrganizations: organizationsResult.count || 0,
      totalHospitals: hospitalsResult.count || 0,
      recentDoctors: recentDoctors || [],
      recentPatients: recentPatients || [],
      lastUpdated: new Date().toISOString()
    };

    console.log('Dashboard stats:', stats);
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