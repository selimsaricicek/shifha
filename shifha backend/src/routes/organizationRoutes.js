const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getUserOrganizations,
  getOrganizationDetails,
  addDoctorToOrganization,
  getOrganizationDoctors,
  createDepartment,
  getOrganizationDepartments
} = require('../controllers/organizationController');
const { authenticateUser } = require('../middleware/auth');

router.post('/', authenticateUser, createOrganization);

router.get('/', authenticateUser, getUserOrganizations);

router.get('/:organizationId', authenticateUser, getOrganizationDetails);

router.post('/:organizationId/doctors', authenticateUser, addDoctorToOrganization);


router.get('/:organizationId/doctors', authenticateUser, getOrganizationDoctors);

router.post('/:organizationId/departments', authenticateUser, createDepartment);

router.get('/:organizationId/departments', authenticateUser, getOrganizationDepartments);

module.exports = router;