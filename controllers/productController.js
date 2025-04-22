const mongoose = require('mongoose');
// const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/productsModel');
const handlerFactory = require('./handlerFactory');
const Category = require('../models/categoryModel');
const AppError = require('../helpers/appError');

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

exports.createProduct = async (req, res, next) => {
  const { images } = req.files;
  const imagesUrl = await Promise.all(
    images.map(async (image) => {
      const result = await cloudinary.uploader.upload(image.path, {
        resource_type: 'image',
      });
      return result.secure_url;
    }),
  );

  req.body.images = imagesUrl;

  const data = await Product.create(req.body);
  if (!data)
    return res.status(404).json({
      status: 'fail',
      message: 'The Product Cannot be Created!',
    });
  res.status(201).json({
    status: 'success',
    data,
  });
};

exports.getAllProducts = async (req, res, next) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(',') };
  }
  let query = Product.find(filter).populate({
    path: 'category',
    select: 'name -_id',
  });

  const page = +req.query.page || 1;
  const pageSize = +req.query.limit || 6;
  const skip = (page - 1) * pageSize;
  const total = await Product.countDocuments();

  const pages = Math.ceil(total / pageSize);

  query = query.skip(skip).limit(pageSize);

  const products = await query;

  if (page > pages) {
    return res.status(404).json({
      status: 'fail',
      message: 'No page found',
    });
  }

  res.status(200).json({
    status: 'success',
    count: products.length,
    page,
    pages,
    products,
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
