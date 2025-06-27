const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');

// Get patient by TC Kimlik No
router.get('/api/patient/:tc_kimlik_no', patientController.getPatient);

// Update patient by TC Kimlik No
router.put('/api/patient/:tc_kimlik_no', patientController.updatePatient);

module.exports = router;
