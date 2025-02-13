const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Order = require('../models/ordersModel');
const User = require('../models/userModel');
const handlerFactory = require('./handlerFactory');

const currency = 'usd';
const deliveryCharges = 10;

exports.createOrderCash = async (req, res, next) => {
  const { products, address, totalPrice } = req.body;
  const orderItems = products.map((product) => ({
    quantity: product.quantity,
    product: product.id,
  }));

  const orderData = {
    orderItems,
    paymentMethod: 'Cash',
    payment: false,
    address,
    totalPrice,
    user: req.user,
  };

  await Order.create(orderData);

  await User.findByIdAndUpdate(req.user, { cartData: [] });

  res.status(200).json({
    status: 'success',
    message: 'Order placed.',
  });
};

exports.createOrderPayment = async (req, res, next) => {
  const { products, address, totalPrice } = req.body;
  const { origin } = req.headers;

  const orderItems = products.map((product) => ({
    quantity: product.quantity,
    product: product.id,
  }));

  const orderData = {
    orderItems,
    totalPrice,
    paymentMethod: 'Stripe',
    payment: false,
    address,
    user: req.user,
  };

  const lineItems = products.map((product) => ({
    price_data: {
      currency: currency,
      product_data: {
        name: product.name,
        description: product.description,
        images: product.images,
      },
      unit_amount: product.price * 100,
    },
    quantity: product.quantity,
  }));

  lineItems.push({
    price_data: {
      currency: currency,
      product_data: {
        name: 'Delivery Charges',
      },
      unit_amount: deliveryCharges * 100,
    },
    quantity: 1,
  });

  const newOrder = await Order.create(orderData);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${origin}/verify?success=true&orderId=${newOrder.id}`,
    cancel_url: `${origin}/verify?success=false&orderId=${newOrder.id}`,
    line_items: lineItems,
    mode: 'payment',
  });

  // res.status(200).json({
  //   status: 'success',
  //   session: session,
  // });

  res.status(200).json({
    status: 'success',
    sessionUrl: session.url,
  });
};

exports.verifyOrders = async (req, res, next) => {
  const { orderId, success } = req.body;

  if (success === 'true') {
    await Order.findByIdAndUpdate(orderId, { payment: true });
    await User.findByIdAndUpdate(req.user, { cartData: [] });
    res.status(200).json({
      status: 'success',
    });
  } else {
    await Order.findByIdAndDelete(orderId);
    res.status(404).json({
      status: 'fail',
    });
  }
};

exports.getUserOrders = async (req, res, next) => {
  const orders = await Order.find({ user: req.user });

  const ordersData = orders.map((order) =>
    order.orderItems.map((item) => ({
      quantity: item.quantity,
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      richDescription: item.product.richDescription,
      images: item.product.images,
      price: item.product.price,
      category: item.product.category.name,
      countInStock: item.product.countInStock,
      isFeatured: item.product.isFeatured,
      dateCreated: item.product.dateCreated,
      orderedDate: order.dateOrdered,
      status: order.status,
      paymentMethod: order.paymentMethod,
    })),
  );

  ordersData.reverse();

  res.status(200).json({
    status: 'success',
    ordersData,
  });
};

//admin

exports.updateStatus = async (req, res, next) => {
  const { orderId, status } = req.body;

  await Order.findByIdAndUpdate(orderId, { status });

  res.status(200).json({
    status: 'success',
    message: 'Status updated',
  });
};

exports.getAllOrders = handlerFactory.getAll(Order);
exports.updateOrder = handlerFactory.updateData(Order);
exports.deleteOrder = handlerFactory.deleteData(Order);
