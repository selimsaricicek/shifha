const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * Middleware to extract and validate organization context for multi-tenancy
 * Adds req.organizationId to all authenticated requests
 */
const tenantContext = async (req, res, next) => {
  try {
    console.log('🏢 TenantContext middleware başladı');
    console.log('🛣️ Request path:', req.path);
    console.log('👤 User ID:', req.user?.id);
    console.log('📧 User Email:', req.user?.email);
    
    // Skip tenant context for auth routes and public endpoints
    const publicPaths = ['/api/auth', '/api/health', '/api/public'];
    const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
    
    if (isPublicPath) {
      console.log('🚪 Public path, tenant context atlanıyor');
      return next();
    }

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log('❌ User authenticated değil');
      return res.status(401).json({ 
        error: 'Authentication required for tenant context' 
      });
    }

    // Get organization ID from header or query/body parameters (preferred methods)
    let organizationId = req.headers['x-organization-id']
      || req.query.organizationId
      || (req.body ? req.body.organizationId : undefined)
      || req.params.organizationId;
    console.log('📋 Gelen organization ID (header/query/body/params):', organizationId);
    
    // If no header provided, get user's default/active organization
    if (!organizationId) {
      console.log('🔍 Header\'da org ID yok, user\'ın default org\'unu arıyorum...');
      const { data: userOrgs, error } = await supabaseAdmin
        .from('user_organizations')
        .select('organization_id, role')
        .eq('user_id', req.user.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: false })
        .limit(1);

      console.log('🏢 User organizations sorgusu:', { userOrgs, error });

      if (error) {
        console.error('❌ Error fetching user organizations:', error);
        return res.status(500).json({ 
          error: 'Failed to determine organization context' 
        });
      }

      if (!userOrgs || userOrgs.length === 0) {
        console.log('❌ User hiçbir organizasyona bağlı değil');
        return res.status(403).json({ 
          error: 'User not associated with any organization' 
        });
      }

      organizationId = userOrgs[0].organization_id;
      req.userRole = userOrgs[0].role;
      console.log('✅ Default organization bulundu:', organizationId, 'Role:', req.userRole);
    } else {
      // Validate that user belongs to the specified organization
      const { data: userOrg, error } = await supabaseAdmin
        .from('user_organizations')
        .select('role')
        .eq('user_id', req.user.id)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .single();

      if (error || !userOrg) {
        console.log('❌ User specified organization\'a ait değil');
        return res.status(403).json({ 
          error: 'User does not belong to specified organization' 
        });
      }

      req.userRole = userOrg.role;
      console.log('✅ Header organization validated:', organizationId, 'Role:', req.userRole);
    }

    // Validate organization exists and is active
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, name, is_active')
      .eq('id', organizationId)
      .eq('is_active', true)
      .single();

    console.log('🏥 Organization validation:', { organization, orgError });

    if (orgError || !organization) {
      console.log('❌ Organization bulunamadı veya aktif değil');
      return res.status(404).json({ 
        error: 'Organization not found or inactive' 
      });
    }

    // Add organization context to request
    req.organizationId = organizationId;
    req.organization = organization;
    
    console.log('✅ TenantContext tamamlandı - Organization ID:', req.organizationId);
    console.log('🏢 Organization Name:', organization.name);
    
    // Add helper function to check if user is admin
    req.isOrgAdmin = () => {
      return req.userRole && ['org_admin', 'super_admin'].includes(req.userRole);
    };

    // Add helper function to get organization filter for queries
    req.getOrgFilter = () => {
      return { organization_id: req.organizationId };
    };

    next();
  } catch (error) {
    console.error('💥 Tenant context middleware error:', error);
    res.status(500).json({ 
      error: 'Internal server error in tenant context' 
    });
  }
};

module.exports = tenantContext;
