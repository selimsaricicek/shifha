const express = require('express');
const router = express.Router();
const { getStructuredDataFromText } = require('../services/gemini.service');

// Gemini AI ile hasta verisi analiz endpointi
router.post('/', async (req, res) => {
  try {
    console.log('GELEN BODY:', req.body);
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text alanı zorunlu.' });
    const result = await getStructuredDataFromText(text);
    res.json(result);
  } catch (err) {
    console.error('Gemini endpoint hata:', err);
    res.status(500).json({ error: err.message || 'Gemini servis hatası.' });
  }
});

module.exports = router;