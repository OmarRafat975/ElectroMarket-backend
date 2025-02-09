const User = require('../models/userModel');
const AppError = require('../helpers/appError');
const jwt = require('../helpers/authJWT');
const sendEmail = require('../helpers/email');

const cookieExpires = process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000;
const cookieOptions = {
  maxAge: cookieExpires,
  sameSite: 'None',
  httpOnly: true,
  secure: true,
};

const createSendToken = async (user, statusCode, res) => {
  const token = jwt.createToken(user.id);
  const refreshToken = jwt.createToken(
    user.id,
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRES,
  );

  await User.findByIdAndUpdate(user.id, { token: refreshToken });
  res.cookie('jwt', refreshToken, cookieOptions);

  user.password = undefined;
  user.isAdmin = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
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
  const user = await User.findById(req.user).select('+password');

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

exports.adminLogin = async (req, res, next) => {
  if (!req.body.email || !req.body.password)
    return next(new AppError('Please Enter Your Email and Password!', 400));

  const user = await User.findOne({ email: req.body.email }).select(
    '+password +isAdmin',
  );

  if (!user || !(await user.correctPassword(req.body.password, user.password)))
    return next(new AppError('Incorrect Email or Password', 401));

  if (!user.isAdmin)
    return next(new AppError('Incorrect Email or Password!', 401));

  createSendToken(user, 200, res);
};

exports.HandleRefreshToken = async (req, res, next) => {
  const { cookies } = req;

  if (!cookies.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;
  const user = await User.findOne({ token: refreshToken });
  if (!user) return res.sendStatus(403);

  const decoded = await jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
  );

  const accessToken = jwt.createToken(decoded.id);
  res.status(200).json({ token: accessToken });
};

exports.Logout = async (req, res, next) => {
  const { cookies } = req;

  if (!cookies.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;
  const user = await User.findOne({ token: refreshToken });

  if (!user) {
    res.clearCookie('jwt', cookieOptions);
    return res.sendStatus(204);
  }

  await User.findByIdAndUpdate(user._id, { token: '' });

  res.clearCookie('jwt', cookieOptions);

  res.sendStatus(204);
};
