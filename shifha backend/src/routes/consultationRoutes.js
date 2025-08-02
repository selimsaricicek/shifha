const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  createConsultation,
  getDoctorConsultations,
  getConsultationDetails,
  respondToConsultation,
  uploadConsultationAttachment,
  getAvailableDoctorsForConsultation,
  getPatientConsultations,
  getUrgencyLevels
} = require('../controllers/consultationController');

// Konsültasyon oluştur
router.post('/', authenticateUser, createConsultation);

// Doktorun konsültasyonlarını getir
router.get('/doctor', authenticateUser, getDoctorConsultations);

// Konsültasyon detaylarını getir
router.get('/:consultationId', authenticateUser, getConsultationDetails);

// Konsültasyona yanıt ver
router.post('/:consultationId/respond', authenticateUser, respondToConsultation);

// Konsültasyona dosya ekle
router.post('/:consultationId/attachments', authenticateUser, uploadConsultationAttachment);

// Uygun doktorları getir
router.get('/organization/:organizationId/available-doctors', authenticateUser, getAvailableDoctorsForConsultation);

// Hasta konsültasyonlarını getir
router.get('/patient/:patientTc', authenticateUser, getPatientConsultations);

// Aciliyet etiketlerini getir
router.get('/organization/:organizationId/urgency-levels', authenticateUser, getUrgencyLevels);

module.exports = router;