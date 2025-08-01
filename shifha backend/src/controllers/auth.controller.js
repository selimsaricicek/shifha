const authService = require('../services/auth.service');

/**
 * Kullanıcı kaydı
 * @route POST /api/auth/register
 * @returns {Object} 201 - { success, data }
 */
const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * Kullanıcı girişi
 * @route POST /api/auth/login
 * @returns {Object} 200 - { success, data }
 */
const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    res.json({ success: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin girişi
 * @route POST /api/auth/admin-login
 * @returns {Object} 200 - { success, data }
 */
const adminLogin = async (req, res, next) => {
  try {
    const { user, token } = await authService.adminLogin(req.body);
    res.json({ success: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, adminLogin };
