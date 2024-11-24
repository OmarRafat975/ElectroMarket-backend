const Order = require('../models/ordersModel');

exports.getAllOrders = async (req, res, next) => {
  const products = await Order.find();
  res.status(200).json({
    status: 'Success',
    data: products,
  });
};
