const mongoose = require('mongoose');

const OrgSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    addressLine1: {
      type: String,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: Number,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamp: true },
);

module.exports = mongoose.model('Org', OrgSchema);
