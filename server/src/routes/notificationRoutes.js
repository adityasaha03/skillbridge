const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationRead,
  markAllRead,
} = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markNotificationRead);

module.exports = router;
