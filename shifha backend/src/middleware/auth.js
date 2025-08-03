const jwt = require('jsonwebtoken');
const supabase = require('../services/supabaseClient');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔍 Auth header:', authHeader ? 'Bearer token found' : 'No auth header');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      return res.status(401).json({
        success: false,
        error: 'Token bulunamadı'
      });
    }

    const token = authHeader.substring(7);
    console.log('🔍 Token extracted, length:', token.length);
    
    try {
      // Verify Supabase JWT token
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        console.log('❌ Supabase token verification failed:', error?.message);
        return res.status(401).json({
          success: false,
          error: 'Geçersiz token'
        });
      }

      console.log('✅ Supabase token verified for user:', user.email);
      
      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // For admin users, profile might not exist, so we'll use user metadata
      let userData = {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'user',
        first_name: user.user_metadata?.first_name || profile?.first_name,
        last_name: user.user_metadata?.last_name || profile?.last_name,
        phone: user.user_metadata?.phone || profile?.phone,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      // If profile exists, merge it
      if (profile && !profileError) {
        userData = { ...userData, ...profile };
      }

      req.user = userData;
      console.log('✅ User authenticated:', userData.email, 'Role:', userData.role);
      next();
    } catch (jwtError) {
      console.log('❌ JWT error:', jwtError.message);
      return res.status(401).json({
        success: false,
        error: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Sunucu hatası'
    });
  }
};

const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Kimlik doğrulama gerekli'
        });
      }

      // Kullanıcının rollerini kontrol et
      const { data: userRoles, error } = await supabase
        .from('user_organizations')
        .select('role')
        .eq('user_id', req.user.id)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      const userRolesList = userRoles.map(r => r.role);
      const hasRequiredRole = roles.some(role => userRolesList.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          error: 'Yetkiniz bulunmuyor'
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Sunucu hatası'
      });
    }
  };
};

const requireOrganizationAccess = async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId || req.body.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organizasyon ID gerekli'
      });
    }

    // Kullanıcının bu organizasyona erişimi var mı kontrol et
    const { data: access, error } = await supabase
      .from('user_organizations')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();

    if (error || !access) {
      return res.status(403).json({
        success: false,
        error: 'Bu organizasyona erişim yetkiniz yok'
      });
    }

    req.organizationAccess = access;
    next();
  } catch (error) {
    console.error('Organization access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Sunucu hatası'
    });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Kimlik doğrulama gerekli'
      });
    }

    // Admin rolü kontrolü - email'e göre veya role'e göre
    const isAdminEmail = req.user.email && req.user.email.endsWith('@shifha.admin.tr');
    
    if (!isAdminEmail && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin yetkisi gerekli'
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Sunucu hatası'
    });
  }
};

module.exports = {
  authenticateUser,
  requireRole,
  requireOrganizationAccess,
  requireAdmin
};