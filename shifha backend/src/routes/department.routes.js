const express = require('express');
const router = express.Router();
const { 
  getAllDepartments, 
  addDepartment, 
  updateDepartment, 
  deleteDepartment,
  getDepartmentDoctors 
} = require('../controllers/department.controller.js');

router.get('/', getAllDepartments);

router.post('/', addDepartment);

router.put('/:id', updateDepartment);

router.delete('/:id', deleteDepartment);

router.get('/:id/doctors', getDepartmentDoctors);

module.exports = router;
