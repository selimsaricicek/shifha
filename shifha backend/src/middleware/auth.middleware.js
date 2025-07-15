const jwt = require('jsonwebtoken');
const axios = require('axios');

// Supabase JWT public key'i dinamik olarak almak için (isteğe bağlı, sabit de yazılabilir)
let SUPABASE_JWT_PUBLIC_KEY = process.env.SUPABASE_JWT_PUBLIC_KEY;

// Eğer public key .env'de yoksa, Supabase JWK endpointinden çekilebilir (isteğe bağlı gelişmiş)
// const SUPABASE_JWK_URL = 'https://<your-project-id>.supabase.co/auth/v1/keys';

async function supabaseAuthMiddleware(req, res, next) {
  if (process.env.NODE_ENV === 'development') {
    req.user = { id: 'dev-user', role: 'admin' };
    return next();
  }
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Yetkilendirme gerekli (Bearer token eksik)' });
  }
  const token = authHeader.split(' ')[1];
  try {
    // Public key .env'den alınır
    if (!SUPABASE_JWT_PUBLIC_KEY) {
      throw new Error('Supabase JWT public key tanımlı değil');
    }
    const user = jwt.verify(token, SUPABASE_JWT_PUBLIC_KEY, { algorithms: ['RS256'] });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Geçersiz veya süresi dolmuş token', details: err.message });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ success: false, error: 'Yetkisiz: Bu işlem için admin yetkisi gerekli.' });
    }
    next();
  };
}

module.exports = { supabaseAuthMiddleware, requireRole };
