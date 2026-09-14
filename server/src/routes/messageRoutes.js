const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
} = require('../controllers/messageController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/conversations', getConversations);
router.get('/:matchId', getMessages);
router.post('/:matchId', sendMessage);

module.exports = router;
