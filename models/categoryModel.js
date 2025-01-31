const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
  },
  icon: {
    type: String,
  },
});

categorySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
