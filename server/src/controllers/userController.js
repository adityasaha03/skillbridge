const mongoose = require('mongoose');
const User = require('../models/User');
const Tag = require('../models/Tag');

// Helper to resolve tag names or IDs to Tag ObjectIds
const resolveTagIds = async (tagList, userId) => {
  if (!Array.isArray(tagList)) return [];

  const resolvedIds = [];

  for (const item of tagList) {
    if (!item) continue;

    // Check if it's already an ObjectId string
    if (mongoose.Types.ObjectId.isValid(item) && String(new mongoose.Types.ObjectId(item)) === String(item)) {
      resolvedIds.push(item);
      continue;
    }

    if (typeof item === 'object' && item._id) {
      resolvedIds.push(item._id);
      continue;
    }

    // Otherwise treat as tag name string
    const tagName = String(item).trim();
    if (!tagName) continue;

    let tag = await Tag.findOne({
      name: { $regex: new RegExp(`^${tagName}$`, 'i') },
    });

    if (!tag) {
      tag = await Tag.create({
        name: tagName,
        category: 'General',
        createdBy: userId || null,
      });
    }

    resolvedIds.push(tag._id);
  }

  return [...new Set(resolvedIds.map((id) => id.toString()))];
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('strongTags', 'name category')
      .populate('weakTags', 'name category');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      profile: user.toJSON(),
    });
  } catch (error) {
    console.error('[getProfile Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.',
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, department, semester, phone, avatar, institution, contextBio } = req.body;

    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (department !== undefined) updates.department = department.trim();
    if (semester !== undefined) updates.semester = semester.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (avatar !== undefined) updates.avatar = avatar.trim();
    if (institution !== undefined) updates.institution = institution.trim();
    if (contextBio !== undefined) updates.contextBio = contextBio.slice(0, 500);

    const user = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    })
      .populate('strongTags', 'name category')
      .populate('weakTags', 'name category');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: user.toJSON(),
    });
  } catch (error) {
    console.error('[updateProfile Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile.',
    });
  }
};

const updateSkills = async (req, res) => {
  try {
    const { wantToLearn, canTeach } = req.body;

    const weakTagIds = await resolveTagIds(wantToLearn, req.user.userId);
    const strongTagIds = await resolveTagIds(canTeach, req.user.userId);

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        weakTags: weakTagIds,
        strongTags: strongTagIds,
      },
      { new: true }
    )
      .populate('strongTags', 'name category')
      .populate('weakTags', 'name category');

    return res.status(200).json({
      success: true,
      message: 'Skills updated successfully.',
      weakTags: user.weakTags,
      strongTags: user.strongTags,
    });
  } catch (error) {
    console.error('[updateSkills Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update skills.',
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateSkills,
  resolveTagIds,
};
