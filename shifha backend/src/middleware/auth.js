const jwt = require('jsonwebtoken');
const supabase = require('../services/supabaseClient');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token bulunamadı'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Kullanıcı bilgilerini veritabanından al
      const { data: user, error } = await supabase
        .from('profiles')
        .select(`
          *,
          doctor_profiles (
            id,
            first_name,
            last_name,
            specialization,
            hospital_id,
            department
          )
        `)
        .eq('id', decoded.userId)
        .single();

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: 'Geçersiz token'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
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

module.exports = {
  authenticateUser,
  requireRole,
  requireOrganizationAccess
};