const express = require('express');
const router = express.Router();
const { getAllTags, createTag, getCategories } = require('../controllers/tagController');
const { requireAuth } = require('../middleware/authMiddleware');

// Publicly readable or authenticated
router.get('/', getAllTags);
router.get('/categories', getCategories);
router.post('/', requireAuth, createTag);

module.exports = router;
