const mongoose = require('mongoose');
const Product = require('../models/productsModel');
const Category = require('../models/categoryModel');

exports.validateID = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(500).json({
      status: 'fail',
      message: 'Invalid Product ID',
    });
  }
  next();
};

exports.createProduct = async (req, res, next) => {
  const category = await Category.findById(req.body.category);
  if (!category)
    return res.status(400).json({
      status: 'fail',
      message: 'invalid Category',
    });

  const product = await Product.create({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    images: [...req.body.images],
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  if (!product)
    return res.status(500).json({
      status: 'fail',
      message: "Can't create new Product",
    });
  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
};

exports.getAllProducts = async (req, res, next) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(',') };
  }
  const products = await Product.find(filter).populate({
    path: 'category',
    select: 'name -_id',
  });
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

exports.updateProduct = async (req, res, next) => {
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category)
      return res.status(400).json({
        status: 'fail',
        message: 'invalid Category',
      });
  }
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      images: [...req.body.images],
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true },
  );
  if (!product)
    return res.status(404).json({
      status: 'fail',
      message: 'the Product Cannot be Updated!',
    });
  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
};

exports.deleteProduct = async (req, res, next) => {
  await Product.findByIdAndDelete(req.params.id);
  res.status(201).json({
    status: 'success',
    message: 'Product Deleted Successfully',
  });
};

/////////////////////////////Filtering//////////////////////////////////

exports.getFeaturedProducts = async (req, res, next) => {
  const products = await Product.find({ isFeatured: true }).populate({
    path: 'category',
    select: 'name -_id',
  });
  res.status(200).json({
    status: 'Success',
    data: products,
  });
};
