// Dosya Adı: src/routes/patient.routes.js

const express = require('express');
const router = express.Router();
const { getAllPatients, getPatientByTC, addPatient, updatePatient, deletePatient } = require('../controllers/patient.controller.js');
const { validatePatient } = require('../middleware/validation.middleware');
const { supabaseAuthMiddleware, requireRole } = require('../middleware/auth.middleware');

// Bütün hastaları getiren rota: GET /api/patients
router.get('/', supabaseAuthMiddleware, getAllPatients);
// Yeni hasta ekle: POST /api/patients
router.post('/', supabaseAuthMiddleware, validatePatient, addPatient);
// Tek bir hastayı getiren rota: GET /api/patients/:tc
router.get('/:tc', supabaseAuthMiddleware, getPatientByTC);
// Hasta güncelle: PUT /api/patients/:tc
router.put('/:tc', supabaseAuthMiddleware, validatePatient, updatePatient);
// Hasta sil: DELETE /api/patients/:tc
router.delete('/:tc', supabaseAuthMiddleware, requireRole('admin'), deletePatient);

module.exports = router;