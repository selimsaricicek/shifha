
const express = require('express');
const router = express.Router();
const { supabaseAuthMiddleware } = require('../middleware/auth.middleware');
const { validateAssayAnalysis } = require('../middleware/validation.middleware');
module.exports = router;

// POST /api/analysis/assay - Assay analizi için güvenli endpoint
router.post('/assay', supabaseAuthMiddleware, validateAssayAnalysis, (req, res) => {
  // TODO: Analiz işlevi burada olacak
  res.json({ success: true, message: 'Assay analizi endpointi güvenli şekilde çalışıyor.' });
});
