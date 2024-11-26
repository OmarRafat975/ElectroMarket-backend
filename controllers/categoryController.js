const Category = require('../models/categoryModel');

exports.createCategory = async (req, res, next) => {
  const category = await Category.create({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  if (!category)
    return res.status(404).json({
      status: 'fail',
      message: 'the Category Cannot be Created!',
    });
  res.status(201).json({
    status: 'success',
    data: {
      category,
    },
  });
};

exports.getAllCategories = async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    status: 'Success',
    data: categories,
  });
};
exports.getCategory = async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  res.status(201).json({
    status: 'success',
    data: {
      category,
    },
  });
};

exports.updateCategory = async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      color: req.body.color,
      icon: req.body.icon,
    },
    { new: true },
  );
  if (!category)
    return res.status(404).json({
      status: 'fail',
      message: 'the Category Cannot be Updated!',
    });
  res.status(201).json({
    status: 'success',
    data: {
      category,
    },
  });
};

exports.deleteCategory = async (req, res, next) => {
  await Category.findByIdAndDelete(req.params.id);
  res.status(201).json({
    status: 'success',
  });
};
