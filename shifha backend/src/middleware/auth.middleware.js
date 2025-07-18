const jwt = require('jsonwebtoken');
const axios = require('axios');

// Supabase JWT public key'i dinamik olarak almak için (isteğe bağlı, sabit de yazılabilir)
let SUPABASE_JWT_PUBLIC_KEY = process.env.SUPABASE_JWT_PUBLIC_KEY;

// Eğer public key .env'de yoksa, Supabase JWK endpointinden çekilebilir (isteğe bağlı gelişmiş)
// const SUPABASE_JWK_URL = 'https://<your-project-id>.supabase.co/auth/v1/keys';

async function supabaseAuthMiddleware(req, res, next) {
  req.user = { id: 'dev-user', role: 'admin' };
  return next();
}

function requireRole(role) {
  return (req, res, next) => {
    next();
  };
}

module.exports = { supabaseAuthMiddleware, requireRole };
