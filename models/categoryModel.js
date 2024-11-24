const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    default: 0,
  },
  brand: {
    type: String,
    required: true,
  },
  State: {
    type: String,
  },
  description: {
    type: String,
  },
  additonal: {
    weight: { type: String, default: 'unknown' },
    dimensions: { type: String, default: 'unknown' },
    connection: { type: String, default: 'unknown' },
    material: { type: String, default: 'unknown' },
    power: { type: String, default: 'unknown' },
    contents: { type: String, default: 'unknown' },
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
