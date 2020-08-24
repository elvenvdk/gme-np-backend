const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamp: true },
);

module.exports = mongoose.model('Goal', GoalSchema);
