const express = require('express');
const router = express.Router();

// Auth rotalarını ekle
const authRoutes = require('../routes/auth.routes');
router.use('/auth', authRoutes);

// Hasta rotalarını ekle
const patientRoutes = require('../routes/patient.routes');
router.use('/patients', patientRoutes);

// PDF rotalarını ekle
const pdfRoutes = require('../routes/pdf.routes');
router.use('/pdf', pdfRoutes);

// Upload-pdf endpoint'ini doğrudan ekle (eski frontend uyumluluğu için)
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { parsePatientPdf } = require('../services/pdfParser.service');

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

// POST /api/upload-pdf (eski frontend uyumluluğu için)
router.post('/upload-pdf', pdfRateLimiter, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('PDF dosyası yüklenmedi.');
    }
    
    const { patientId } = req.body;
    console.log('PDF yükleme isteği alındı. PatientId:', patientId);
    console.log('Dosya bilgisi:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'Dosya yok');
    
    // PatientId varsa mevcut hastayı güncelle, yoksa yeni hasta oluştur
    const result = await parsePatientPdf(req.file.buffer, patientId || null);
    
    res.status(201).json({ 
      success: true, 
      message: patientId ? 'Kan tahlili başarıyla güncellendi.' : 'Yeni hasta başarıyla oluşturuldu.',
      data: result 
    });
  } catch (err) {
    console.error('PDF yükleme hatası:', err);
    // Multer veya fileFilter hatası için özel mesaj
    if (err instanceof multer.MulterError || err.message.includes('PDF')) {
      return res.status(400).json({ success: false, error: err.message });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// Gemini AI endpointini ekle
const geminiRoutes = require('../routes/api');
router.use('/gemini', geminiRoutes);

// Tıbbi analiz rotalarını ekle
const medicalAnalysisRoutes = require('../routes/medicalAnalysis.routes');
router.use('/medical-analysis', medicalAnalysisRoutes);

// Doktor rotalarını ekle
const doctorRoutes = require('../routes/doctor.routes');
router.use('/doctors', doctorRoutes);

// Lokasyon rotalarını ekle (şehir, ilçe, hastane)
const locationRoutes = require('../routes/location.routes');
router.use('/locations', locationRoutes);

module.exports = router;
