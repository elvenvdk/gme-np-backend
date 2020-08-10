const mongoose = require('mongoose');

const SellerSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      true: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      require: true,
      trim: true,
    },
    password: {
      type: String,
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamp: true },
);

module.exports = mongoose.model('Sellers', SellerSchema);
