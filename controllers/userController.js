const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const handlerFactory = require('./handlerFactory');
const AppError = require('../helpers/appError');

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES },
  );
}

exports.register = async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 13),
    phone: req.body.phone,
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
  });
  if (!user) return next(new AppError('the User Cannot be Created!', 404));
  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
};

exports.login = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !bcrypt.compareSync(req.body.password, user.password))
    return next(new AppError('Invalid Email or Password', 404));
  const token = createToken(user);
  return res.status(200).json({
    status: 'success',
    data: {
      user,
      token,
    },
  });
};

exports.getAllUsers = handlerFactory.getAll(User);
exports.getUser = handlerFactory.getById(User);
exports.updateUser = handlerFactory.updateData(User);
exports.deleteUser = handlerFactory.deleteData(User);
