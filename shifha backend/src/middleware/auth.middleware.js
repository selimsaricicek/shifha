const jwt = require('jsonwebtoken');

/**
 * JWT doğrulama ve rol kontrolü middleware'i
 * @param {Array<string>} allowedRoles - Erişime izin verilen roller (opsiyonel)
 */
function authenticate(allowedRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Yetkilendirme gerekli' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      // Sadece userId ve role payload'ı kabul edilir
      req.user = { userId: payload.userId, role: payload.role };
      if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ success: false, error: 'Yetkisiz erişim' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Geçersiz veya süresi dolmuş token' });
    }
  };
}

module.exports = { authenticate };
