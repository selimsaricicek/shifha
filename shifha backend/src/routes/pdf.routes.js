const express = require('express');
const multer = require('multer');
const { parsePatientPdf } = require('../services/pdfParser.service');
const router = express.Router();
const upload = multer();

// POST /api/pdf/parse
router.post('/parse', upload.single('file'), async (req, res, next) => {
  try {
    // req.file'ın var olup olmadığını kontrol etmek önemlidir.
    if (!req.file) {
      throw new Error('PDF dosyası yüklenmedi.');
    }
    const result = await parsePatientPdf(req.file.buffer);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;