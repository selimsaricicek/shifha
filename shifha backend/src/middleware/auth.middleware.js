const jwt = require('jsonwebtoken');
const supabase = require('../services/supabaseClient');

// Supabase JWT secret - bu genellikle service role key ile aynıdır
const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabaseAuthMiddleware = (req, res, next) => {
  console.log('🔍 Auth middleware called for:', req.method, req.path);
  
  const authHeader = req.headers.authorization;
  console.log('🔍 Auth header:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No auth header or invalid format');
    return res.status(401).json({ message: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔍 Token extracted:', token ? 'Yes' : 'No');
  
  if (!token) {
    console.log('❌ No token found');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Token'ı decode et (verification olmadan)
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    
    console.log('✅ Token decoded successfully');
    console.log('🔍 User email:', payload.email);
    console.log('🔍 User role from token:', payload.user_metadata?.role);
    console.log('🔍 Full user_metadata:', payload.user_metadata);
    
    // Role'ü belirle
    const userRole = payload.user_metadata?.role || 'authenticated';
    console.log('🔍 Determined role:', userRole);
    
    // req.user'ı ayarla
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: userRole,
      user_metadata: payload.user_metadata,
      aud: payload.aud,
      exp: payload.exp,
      iat: payload.iat,
      iss: payload.iss,
      sub: payload.sub
    };
    
    // Final role kontrolü
    console.log('🔍 Final req.user.role:', req.user.role);
    console.log('✅ Auth middleware completed successfully');
    next();
  } catch (error) {
    console.log('❌ Error decoding token:', error.message);
    return res.status(401).json({ message: 'Invalid token format' });
  }
};

function requireRole(requiredRole) {
  return (req, res, next) => {
    console.log('🔍 RequireRole middleware called');
    console.log('🔍 Required role:', requiredRole);
    console.log('🔍 User object:', req.user ? 'Present' : 'Missing');
    console.log('🔍 User role:', req.user?.role);
    console.log('🔍 Role match:', req.user?.role === requiredRole);
    
    if (!req.user || req.user.role !== requiredRole) {
      console.log('❌ Access denied - role mismatch');
      return res.status(403).json({ 
        message: `Access denied. Required role: ${requiredRole}, but got: ${req.user?.role}` 
      });
    }
    
    console.log('✅ Role check passed');
    next();
  };
}

// Organization ID'yi belirleyen middleware
const setOrganizationId = async (req, res, next) => {
  try {
    console.log('🔍 SetOrganizationId middleware called for user:', req.user?.id);
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // User'ın organizasyon ID'sini bul
    const { data: userOrg, error } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', req.user.id)
      .single();

    if (error || !userOrg) {
      console.log('❌ User organization not found:', error);
      return res.status(403).json({ message: 'User organization not found' });
    }

    req.organizationId = userOrg.organization_id;
    console.log('✅ Organization ID set:', req.organizationId);
    next();
  } catch (error) {
    console.log('❌ Error setting organization ID:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { supabaseAuthMiddleware, requireRole, setOrganizationId };
