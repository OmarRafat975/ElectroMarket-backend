const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AppError = require('./appError');
const User = require('../models/userModel');

const accessSecret = process.env.JWT_ACCESS_SECRET;

exports.createToken = (
  id,
  secret = accessSecret,
  expires = process.env.JWT_ACCESS_EXPIRES,
) =>
  jwt.sign({ id: id }, secret, {
    expiresIn: expires,
  });

exports.verify = async (token, secret) => await jwt.verify(token, secret);

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || token === undefined)
    return next(
      new AppError('You are not Logged in! Please log in to get access! ', 401),
    );

  // const decoded = await jwt.verify(token, accessSecret);

  jwt.verify(token, accessSecret, async (err, decoded) => {
    if (err) return res.sendStatus(403); //invalid token

    if (!decoded || !decoded.id) return res.sendStatus(403);

    const user = await User.findById(decoded.id);

    if (!user) return next(new AppError('the user is no longer exist!', 401));

    if (user.isChangedPasswordAfter(decoded.iat))
      return next(
        new AppError(
          'User recently changed the password! please log in again.',
          401,
        ),
      );

    req.user = decoded.id;

    next();
  });
};

exports.restrict = async (req, res, next) => {
  const user = await User.findById(req.user).select('+isAdmin');
  if (!user.isAdmin) {
    return next(
      new AppError('you dont have permission to perform this action', 403),
    );
  }
  next();
};

exports.hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');
