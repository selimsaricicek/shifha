// Dosya Adı: src/routes/location.routes.js

const express = require('express');
const router = express.Router();
const { 
  getAllCities,
  getDistrictsByCity,
  getHospitalsByDistrict,
  getAllHospitals,
  addCity,
  addDistrict,
  addHospital,
  updateHospital,
  deleteHospital
} = require('../controllers/location.controller.js');

// Şehir route'ları
router.get('/cities', getAllCities);
router.post('/cities', addCity);

// İlçe route'ları
router.get('/cities/:cityId/districts', getDistrictsByCity);
router.post('/districts', addDistrict);

// Hastane route'ları
router.get('/districts/:districtId/hospitals', getHospitalsByDistrict);
router.get('/hospitals', getAllHospitals);
router.post('/hospitals', addHospital);
router.put('/hospitals/:id', updateHospital);
router.delete('/hospitals/:id', deleteHospital);

module.exports = router;