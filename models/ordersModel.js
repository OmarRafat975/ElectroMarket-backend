const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderItems: [
    {
      quantity: {
        type: Number,
        required: true,
      },
      product: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Product',
        required: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },
  address: {
    type: Object,
    required: true,
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    required: true,
    default: 'Order placed',
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

orderSchema.set('toJSON', {
  virtuals: true,
});

orderSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' }).populate({
    path: 'orderItems',
    populate: {
      path: 'product',
    },
  });
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
