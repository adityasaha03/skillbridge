const Tag = require('../models/Tag');

const getAllTags = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    const tags = await Tag.find(filter).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      count: tags.length,
      tags,
    });
  } catch (error) {
    console.error('[getAllTags Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve tags.',
    });
  }
};

const createTag = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required.',
      });
    }

    const trimmedName = name.trim();
    const existing = await Tag.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A tag with this name already exists.',
        tag: existing,
      });
    }

    const tag = new Tag({
      name: trimmedName,
      category: category ? category.trim() : 'General',
      createdBy: req.user?.userId || null,
    });

    await tag.save();

    return res.status(201).json({
      success: true,
      message: 'Tag created successfully.',
      tag,
    });
  } catch (error) {
    console.error('[createTag Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create tag.',
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Tag.distinct('category');
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories.',
    });
  }
};

module.exports = {
  getAllTags,
  createTag,
  getCategories,
};
