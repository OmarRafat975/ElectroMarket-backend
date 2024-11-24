const User = require('../models/userModel');

exports.getAllUsers = async (req, res, next) => {
  const products = await User.find();
  res.status(200).json({
    status: 'Success',
    data: products,
  });
};
