const Category = require('../models/categoryModel');

exports.getAllCategories = async (req, res, next) => {
  const products = await Category.find();
  res.status(200).json({
    status: 'Success',
    data: products,
  });
};
