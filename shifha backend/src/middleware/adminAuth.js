const jwt = require('jsonwebtoken');
const supabase = require('../services/supabaseClient');

/**
 * Admin authentication middleware
 * Verifies that the user is an authenticated admin
 */
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token gerekli'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }

    // Check if user is an admin in the database
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (adminError || !adminData) {
      return res.status(403).json({
        success: false,
        message: 'Admin yetkiniz bulunmamaktadır'
      });
    }

    // Update last login time
    await supabase
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', adminData.id);

    // Attach user and admin data to request
    req.user = user;
    req.admin = adminData;
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

/**
 * Super admin authentication middleware
 * Verifies that the user is a super admin
 */
const superAdminAuth = async (req, res, next) => {
  try {
    // First run admin auth
    await new Promise((resolve, reject) => {
      adminAuth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is super admin
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Super admin yetkiniz bulunmamaktadır'
      });
    }

    next();
  } catch (error) {
    console.error('Super admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

module.exports = { adminAuth, superAdminAuth };