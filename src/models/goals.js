const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const DayGoal = new mongoose.Schema(
  {
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
    dateAdded: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamp: true },
);

const HourGoal = new mongoose.Schema(
  {
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
    dateAdded: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamp: true },
);

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
      type: [DayGoal],
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
