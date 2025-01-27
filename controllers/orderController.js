const Order = require('../models/ordersModel');
const Product = require('../models/productsModel');
const handlerFactory = require('./handlerFactory');

exports.createOrder = async (req, res, next) => {
  const totalPrices = await Promise.all(
    req.body.orderItems.map(async (item) => {
      const itemProduct = await Product.findById(item.product);
      return itemProduct.price * item.quantity;
    }),
  );
  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
  const order = await Order.create({
    ...req.body,
    totalPrice: totalPrice,
  });
  res.status(200).json({
    status: 'success',
    data: order,
  });
};
exports.getAllOrders = handlerFactory.getAll(Order);
exports.getOrder = handlerFactory.getById(Order);
exports.updateOrder = handlerFactory.updateData(Order);
exports.deleteOrder = handlerFactory.deleteData(Order);
