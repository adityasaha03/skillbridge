const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateSkills } = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/skills', updateSkills);

module.exports = router;
