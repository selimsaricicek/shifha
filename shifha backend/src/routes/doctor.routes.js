// Dosya Adı: src/routes/doctor.routes.js

const express = require('express');
const router = express.Router();
const { 
  getAllDoctors, 
  getDoctorById, 
  addDoctor, 
  updateDoctor, 
  deleteDoctor,
  assignDoctorToHospital 
} = require('../controllers/doctor.controller.js');

// Tüm doktorları getir: GET /api/doctors
router.get('/', getAllDoctors);

// ID ile doktor getir: GET /api/doctors/:id
router.get('/:id', getDoctorById);

// Yeni doktor ekle: POST /api/doctors
router.post('/', addDoctor);

// Doktor güncelle: PUT /api/doctors/:id
router.put('/:id', updateDoctor);

// Doktor sil: DELETE /api/doctors/:id
router.delete('/:id', deleteDoctor);

// Doktoru hastaneye ata: PUT /api/doctors/:id/assign-hospital
router.put('/:id/assign-hospital', assignDoctorToHospital);

module.exports = router;