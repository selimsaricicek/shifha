const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { adminAuth, superAdminAuth } = require('../middleware/adminAuth');

// Admin profile routes
router.get('/profile', adminAuth, adminController.getProfile);

// Dashboard routes
router.get('/dashboard/stats', adminAuth, adminController.getDashboardStats);

// Admin management routes (Super admin only)
router.get('/admins', superAdminAuth, adminController.getAllAdmins);
router.post('/admins', superAdminAuth, adminController.createAdmin);
router.put('/admins/:id', superAdminAuth, adminController.updateAdmin);
router.delete('/admins/:id', superAdminAuth, adminController.deleteAdmin);

module.exports = router;