const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const OrgSessionSchema = new mongoose.Schema(
  {
    org: {
      type: ObjectId,
      ref: 'Org',
      unique: true,
    },
    owner: {
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

module.exports = mongoose.model('OrgSession', OrgSessionSchema);
