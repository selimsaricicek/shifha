// ...existing code...
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { v4: uuidv4 } = require('uuid');

// QR giriş oturumlarını takip için in-memory store
const qrSessions = {};

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin-login', authController.adminLogin);

// QR session endpoint'i
router.get('/qr-session', (req, res) => {
  const loginAttemptId = uuidv4();
  const sessionData = {
    status: 'pending',
    createdAt: Date.now(),
    expiresAt: Date.now() + 60000,
    sessionId: null
  };
  qrSessions[loginAttemptId] = sessionData;
  
  // 65 saniye sonra otomatik temizle
  setTimeout(() => {
    delete qrSessions[loginAttemptId];
  }, 65000);
  
  res.json({ loginAttemptId });
});

// QR doğrulama endpoint'i
router.post('/verify-qr-scan', (req, res) => {
  const { loginAttemptId, doctorId } = req.body;
  if (!loginAttemptId || !doctorId) {
    return res.status(400).json({ success: false, message: 'Eksik veri' });
  }
  
  const session = qrSessions[loginAttemptId];
  if (!session) {
    return res.status(404).json({ success: false, message: 'Geçersiz veya süresi dolmuş QR kodu' });
  }
  if (session.status === 'completed') {
    return res.status(410).json({ success: false, message: 'Bu QR kodu zaten kullanıldı, lütfen yeni kod isteyin.' });
  }
  if (Date.now() > session.expiresAt) {
    return res.status(410).json({ success: false, message: 'QR kodunun süresi doldu, lütfen yeni kod isteyin.' });
  }
  
  session.status = 'completed';
  session.doctorId = doctorId;
  
  // 5 saniye sonra session'ı temizle
  setTimeout(() => {
    delete qrSessions[loginAttemptId];
  }, 5000);
  
  return res.json({ success: true, message: 'Giriş başarılı' });
});

module.exports = router;
// ...existing code...
