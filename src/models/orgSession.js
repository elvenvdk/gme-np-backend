const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const OrgSessionSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'Org',
      unique: true,
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
