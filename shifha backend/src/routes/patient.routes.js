// Dosya Adı: src/routes/patient.routes.js

const express = require('express');
const router = express.Router();
const { getAllPatients, getPatientByTC } = require('../controllers/patient.controller.js');

// Bütün hastaları getiren rota: GET /api/patients
router.get('/', getAllPatients);

// Tek bir hastayı getiren rota: GET /api/patients/:tc
router.get('/:tc', getPatientByTC);

module.exports = router;