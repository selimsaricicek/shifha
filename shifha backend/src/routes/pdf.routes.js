const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { parsePatientPdf } = require('../services/pdfParser.service');
const router = express.Router();
const { supabaseAuthMiddleware } = require('../middleware/auth.middleware');

// Dosya tipi ve boyut limiti
const upload = multer({
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Sadece PDF dosyası yükleyebilirsiniz.'));
    }
    cb(null, true);
  }
});

// Rate limit: 10 istek/dk
const pdfRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 10,
  message: { success: false, error: 'Çok fazla istek! Lütfen daha sonra tekrar deneyin.' }
});

// POST /api/pdf/parse
router.post('/parse', pdfRateLimiter, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('PDF dosyası yüklenmedi.');
    }
    const result = await parsePatientPdf(req.file.buffer);
    res.status(201).json(result);
  } catch (err) {
    // Multer veya fileFilter hatası için özel mesaj
    if (err instanceof multer.MulterError || err.message.includes('PDF')) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
  }
});

module.exports = router;