const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const moment = require('moment');

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
    goalPerDay: {
      type: Array,
      default: [],
    },
    goalPerHour: {
      type: Array,
      default: [],
    },
  },
  { timestamp: true },
);

module.exports = mongoose.model('Goal', GoalSchema);
