const express = require('express');
const router = express.Router();
const {
  createConsultation,
  getDoctorConsultations,
  getConsultationDetails,
  respondToConsultation,
  uploadConsultationAttachment,
  getAvailableDoctorsForConsultation,
  getPatientConsultations
} = require('../controllers/consultationController');
const { authenticateUser } = require('../middleware/auth.js');


router.post('/', authenticateUser, createConsultation);

router.get('/:organizationId', authenticateUser, getDoctorConsultations);

router.get('/details/:consultationId', authenticateUser, getConsultationDetails);

router.put('/:consultationId/respond', authenticateUser, respondToConsultation);

router.post('/:consultationId/attachments', authenticateUser, uploadConsultationAttachment);

router.get('/:organizationId/available-doctors', authenticateUser, getAvailableDoctorsForConsultation);

router.get('/patient/:patientTc', authenticateUser, getPatientConsultations);

module.exports = router;