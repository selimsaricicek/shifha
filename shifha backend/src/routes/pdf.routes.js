const express = require('express');
const multer = require('multer');
const { parsePatientPdf } = require('../services/pdfParser.service');
const router = express.Router();
const upload = multer();

// POST /api/pdf/parse
router.post('/parse', upload.single('file'), async (req, res) => {
  try {
    const result = await parsePatientPdf(req.file.buffer);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'PDF işlenemedi', details: err.message });
  }
});

module.exports = router;
