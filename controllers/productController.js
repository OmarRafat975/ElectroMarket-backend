const mongoose = require('mongoose');
// const multer = require('multer');
const Product = require('../models/productsModel');
const handlerFactory = require('./handlerFactory');
const Category = require('../models/categoryModel');
const AppError = require('../helpers/appError');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/uploads');
//   },
//   filename: function (req, file, cb) {
//     const fileName = file.originalname.replace(' ', '-');
//     cb(null, `${fileName}-${Date.now()}`);
//   },
// });

// const upload = multer({ storage: storage });

exports.validateID = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError('Invalid Product ID', 400));
  }
  next();
};

exports.validateCategory = async (req, res, next) => {
  const category = await Category.findById(req.body.category);
  if (!category) return next(new AppError('invalid Category', 400));
  next();
};

exports.checkCategory = async (req, res, next) => {
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) return next(new AppError('invalid Category', 400));
  }
  next();
};

exports.createProduct = handlerFactory.createData(Product);

exports.getAllProducts = async (req, res, next) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(',') };
  }
  const products = await Product.find(filter).populate({
    path: 'category',
    select: 'name -_id',
  });
  console.log(products);

  res.status(200).json({
    status: 'Success',
    data: products,
  });
};

exports.getProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate({
    path: 'category',
    select: 'name -_id',
  });
  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
};
exports.updateProduct = handlerFactory.updateData(Product);
exports.deleteProduct = handlerFactory.deleteData(Product);

/////////////////////////////Filtering//////////////////////////////////

exports.getFeaturedProducts = handlerFactory.getAll(Product, {
  isFeatured: true,
});
