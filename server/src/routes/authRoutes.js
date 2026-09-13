const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  getCsrfToken,
} = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validateAuth');
const { requireAuth } = require('../middleware/authMiddleware');
const { verifyCsrf } = require('../middleware/csrfMiddleware');

router.get('/csrf-token', getCsrfToken);

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.post('/logout', verifyCsrf, logout);

router.get('/me', requireAuth, getMe);

module.exports = router;
