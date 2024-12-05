const Category = require('../models/categoryModel');
const handlerFactory = require('./handlerFactory');

exports.createCategory = handlerFactory.createData(Category);
exports.getAllCategories = handlerFactory.getAll(Category);
exports.getCategory = handlerFactory.getById(Category);
exports.updateCategory = handlerFactory.updateData(Category);
exports.deleteCategory = handlerFactory.deleteData(Category);
