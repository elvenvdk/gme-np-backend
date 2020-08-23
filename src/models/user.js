const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      // required: true,
      true: true,
    },
    lastName: {
      type: String,
      // required: true,
      trim: true,
    },
    email: {
      type: String,
      // required: true,
      trim: true,
    },
    userName: {
      type: String,
      // required: true,
      trim: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: 'seller',
      // required: true,
    },
    orgType: {
      type: String,
      default: 'non-profit',
    },
    sessionToken: {
      type: String,
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamp: true },
);

module.exports = mongoose.model('User', UserSchema);
