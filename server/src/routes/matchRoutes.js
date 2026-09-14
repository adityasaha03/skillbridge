const express = require('express');
const router = express.Router();
const {
  getSuggestions,
  sendMatchRequest,
  acceptMatch,
  declineMatch,
  getMatchHistory,
} = require('../controllers/matchController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/suggestions', getSuggestions);
router.post('/request', sendMatchRequest);
router.patch('/:id/accept', acceptMatch);
router.patch('/:id/decline', declineMatch);
router.get('/history', getMatchHistory);

module.exports = router;
