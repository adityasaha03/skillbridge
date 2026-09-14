const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    matchedOnTags: {
      A_teaches_B: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tag',
        },
      ],
      B_teaches_A: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tag',
        },
      ],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed'],
      default: 'pending',
      index: true,
    },
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate pending connections between the same pair
matchSchema.index({ userA: 1, userB: 1, status: 1 });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
