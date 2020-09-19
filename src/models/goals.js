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
      actual: {
        type: Number,
      },
      success: {
        type: Boolean,
      },
      difference: {
        type: Number,
      },
    },
    goalPerDay: {
      type: [],
      default: undefined,
    },
    goalPerHour: {
      type: [HourGoal],
      default: undefined,
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamp: true },
);

module.exports = mongoose.model('Goal', GoalSchema);
