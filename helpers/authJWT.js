const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('./appError');
const User = require('../models/userModel');

const secret = process.env.JWT_SECRET;

exports.createToken = (id) =>
  jwt.sign({ id: id }, secret, {
    expiresIn: process.env.JWT_EXPIRES,
  });

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError('You are not Logged in! Please log in to get access! ', 401),
    );

  const decoded = await promisify(jwt.verify)(token, secret);

  const user = await User.findById(decoded.id);

  if (!user) return next(new AppError('the user is no longer exist!', 401));

  if (user.isChangedPasswordAfter(decoded.iat))
    return next(
      new AppError(
        'User recently changed the password! please log in again.',
        401,
      ),
    );

  req.user = user;

  next();
};

exports.restrict = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+isAdmin');
  if (!user.isAdmin) {
    return next(
      new AppError('you dont have permission to perform this action', 403),
    );
  }
  next();
};

exports.hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');
