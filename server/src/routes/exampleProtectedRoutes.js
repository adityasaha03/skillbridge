const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { verifyCsrf } = require('../middleware/csrfMiddleware');
const User = require('../models/User');

router.get('/dashboard-data', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    return res.status(200).json({
      success: true,
      message: `Welcome to your protected SkillBridge dashboard, ${user?.fullName || 'User'}!`,
      authenticatedUser: {
        userId: req.user.userId,
        email: req.user.email,
        roles: req.user.roles,
      },
      dashboardMetrics: {
        sessionsCompleted: 12,
        activeStudyMatches: 3,
        academicReputationScore: 98,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load protected dashboard data.',
    });
  }
});

router.post('/update-bio', requireAuth, verifyCsrf, async (req, res) => {
  try {
    const { contextBio } = req.body;
    if (typeof contextBio !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Bio must be a valid text string.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { contextBio: contextBio.slice(0, 500) },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Bio updated successfully.',
      contextBio: user.contextBio,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update bio.',
    });
  }
});

router.get('/admin-only', requireAuth, requireRole('admin'), (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Authorized! Welcome to the Admin Management Console.',
    operator: req.user,
  });
});

module.exports = router;
