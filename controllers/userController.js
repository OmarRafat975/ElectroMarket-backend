const AppError = require('../helpers/appError');
const User = require('../models/userModel');
const handlerFactory = require('./handlerFactory');

const filterObj = (obj, ...allowedFieldes) => {
  const newObj = {};
  Object.keys(
    obj.forEach((el) => {
      if (allowedFieldes.includes(el)) newObj[el] = obj[el];
    }),
  );
  return newObj;
};

exports.getAllUsers = handlerFactory.getAll(User);
exports.getUser = handlerFactory.getById(User);
exports.updateUser = handlerFactory.updateData(User);
exports.deleteUser = handlerFactory.deleteData(User);

exports.UpdateMyData = async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'this route is not for changing password please use /updateMyPassword',
        400,
      ),
    );

  const filterdBody = filterObj(
    req.body,
    'name',
    'email',
    'phone',
    'street',
    'apartment',
    'city',
    'zip',
    'country',
  );

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
};
