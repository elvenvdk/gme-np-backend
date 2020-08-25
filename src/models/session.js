const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const SessionSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
    },
    token: {
      type: String,
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamp: true },
);

module.exports = mongoose.model('Session', SessionSchema);
