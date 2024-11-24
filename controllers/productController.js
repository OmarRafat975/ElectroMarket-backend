const Product = require('../models/productsModel');

exports.getAllProducts = async (req, res, next) => {
  const products = await Product.find();
  res.status(200).json({
    status: 'Success',
    data: products,
  });
};
