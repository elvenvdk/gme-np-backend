const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const OrdersSchema = mongoose.Schema(
  {
    orderType: {
      type: String,
      required: true,
    },
    product: {
      type: ObjectId,
      ref: 'Product',
    },
    vendorId: {
      type: ObjectId,
      ref: 'Vendor',
    },
    customerId: {
      type: ObjectId,
      ref: 'Customer',
    },
    seller: {
      type: ObjectId,
      ref: 'Sellers',
    },
    quantity: {
      type: Number,
      trim: true,
    },
    price: {
      type: Number,
      trim: true,
    },
    totalPrice: {
      type: Number,
      trim: true,
    },
    cancelled: {
      type: Boolean,
      default: false,
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamp: true },
);

module.exports = mongoose.model('Orders', OrdersSchema);
