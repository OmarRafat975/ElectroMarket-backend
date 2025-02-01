const express = require('express');
const {
  getUserCart,
  updateCart,
  addToCart,
  deleteCartItem,
} = require('../controllers/cartController');
const { protect } = require('../helpers/authJWT');

const router = express.Router();

router
  .get('/', protect, getUserCart)
  .patch('/add', protect, addToCart)
  .patch('/update', protect, updateCart)
  .patch('/delete', protect, deleteCartItem);

module.exports = router;
