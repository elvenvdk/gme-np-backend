const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const GoalSchema = new mongoose.Schema(
  {
    org: {
      type: ObjectId,
      ref: 'Org',
    },
    mainGoal: {
      amount: {
        type: Number,
      },
      dateAdded: {
        type: Date,
      },
      dateUpdated: {
        type: Date,
      },
      actual: {
        type: Number,
      },
      success: {
        type: Boolean,
        default: false,
      },
      difference: {
        type: Number,
      },
    },
  },
  { timestamp: true },
);

module.exports = mongoose.model('Goal', GoalSchema);
