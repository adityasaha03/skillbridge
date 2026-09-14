const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      unique: true,
      trim: true,
      minlength: [1, 'Tag name cannot be empty'],
      maxlength: [100, 'Tag name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Tag category is required'],
      trim: true,
      default: 'General',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

tagSchema.index({ name: 'text', category: 'text' });

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
