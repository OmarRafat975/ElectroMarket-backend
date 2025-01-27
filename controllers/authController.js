const User = require('../models/userModel');
const AppError = require('../helpers/appError');
const jwt = require('../helpers/authJWT');
const sendEmail = require('../helpers/email');

const createSendToken = (user, statusCode, res, data = null) => {
  const token = jwt.createToken(user.id);
  const cookieExpires = process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000;
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpires),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  user.isAdmin = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data,
  });
};

exports.register = async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(user, 201, res, { user });
};

exports.login = async (req, res, next) => {
  if (!req.body.email || !req.body.password)
    return next(new AppError('Please Enter Your Email and Password!', 400));

  const user = await User.findOne({ email: req.body.email }).select(
    '+password',
  );

  if (!user || !(await user.correctPassword(req.body.password, user.password)))
    return next(new AppError('Incorrect Email or Password', 401));

  createSendToken(user, 200, res);
};

exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is No user with that email address', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}${process.env.API_V}/users/resetPassword/${resetToken}`;

  const message = `forgot your password submit a PATCH request with your new Password and PasswordConfirm to: ${resetURL} .\nIf you didn't forget your password, please ignore this e-mail!`;
  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.PasswordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email!. Try Again Later',
        500,
      ),
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  const hashedToken = jwt.hashToken(req.params.token);

  const user = await User.findOne({
    PasswordResetToken: hashedToken,
    PasswordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('token is invalid or expired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.PasswordResetToken = undefined;
  user.PasswordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
};

exports.updateMyPassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.currentPassword, user.password)))
    return next(new AppError('your current password is wrong', 401));
  if (user.password === req.body.password)
    return next(
      new AppError(
        'you new password is the same as the old password please try new one!',
      ),
    );
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
};
