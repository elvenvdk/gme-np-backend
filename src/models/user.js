const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const { v4: uuidv4, v4 } = require('uuid');


const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      true: true,
    },
    lastName: {
      type: String,

      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
      trim: true,
      unique: true,
      default: v4(),
    },
    role: {
      type: String,
      default: 'seller',
    },
    org: {
      type: ObjectId,
      ref: 'Org',
    },
    orgType: {
      type: String,
      default: 'non-profit',
    },
    session: {
      type: ObjectId,
      ref: 'Session',
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamp: true },
);

module.exports = mongoose.model('User', UserSchema);
