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

// Gemini AI endpointini ekle
const geminiRoutes = require('../routes/api');
router.use('/gemini', geminiRoutes);

module.exports = router;
