const express = require('express');
const router = express.Router();
const { getStructuredDataFromText } = require('../services/gemini.service');

// Gemini AI ile hasta verisi analiz endpointi
router.post('/', async (req, res) => {
  try {
    console.log('🤖 ChatBot isteği alındı!');
    console.log('📝 GELEN BODY:', req.body);
    console.log('📋 Headers:', req.headers);
    const { text } = req.body;
    if (!text) {
      console.log('❌ Text alanı eksik!');
      return res.status(400).json({ error: 'text alanı zorunlu.' });
    }
    console.log('✅ Gemini servisine gönderiliyor...');
    const result = await getStructuredDataFromText(text);
    console.log('🎯 Gemini yanıtı:', result);
    res.json(result);
  } catch (err) {
    console.error('❌ Gemini endpoint hata:', err);
    res.status(500).json({ error: err.message || 'Gemini servis hatası.' });
  }
});

module.exports = router;