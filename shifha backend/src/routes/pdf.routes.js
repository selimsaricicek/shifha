const express = require('express');
const multer = require('multer');
const { parsePatientPdf } = require('../services/pdfParser.service');
const router = express.Router();

// multer'ı başlatıyoruz. Bu ayarla dosyaları hafızada (buffer) tutar.
const upload = multer();

// POST /api/pdf/parse
router.post('/parse', upload.single('file'), async (req, res) => {
  
  // ----> EKLEDİĞİMİZ KODLAR BURASI <----
  console.log("PDF route handler'ına (/parse) istek geldi!");
  console.log("Multer tarafından işlenen dosya (req.file):", req.file);
  // ----> KODUN SONU <----

  try {
    // req.file'ın var olup olmadığını kontrol etmek önemlidir.
    if (!req.file) {
      throw new Error('PDF dosyası yüklenmedi.');
    }
    const result = await parsePatientPdf(req.file.buffer);
    res.json(result);
  } catch (err) {
    // Hata durumunda loglama yapmak da faydalıdır.
    console.error("PDF işlenirken hata oluştu:", err.message);
    res.status(500).json({ error: 'PDF işlenemedi', details: err.message });
  }
});

module.exports = router;