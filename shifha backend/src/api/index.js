const express = require('express');
const router = express.Router();

// Hasta rotalarını ekle
const patientRoutes = require('../routes/patient.routes');
router.use('/patients', patientRoutes);

// Diğer API route'ları da buraya eklenebilir

module.exports = router;
