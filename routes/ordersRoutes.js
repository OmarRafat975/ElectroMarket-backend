const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrict } = require('../helpers/authJWT');

const router = express.Router();

router
  .get('/user-orders', protect, orderController.getUserOrders)
  .post('/cash', protect, orderController.createOrderCash)
  .post('/stripe', protect, orderController.createOrderPayment)
  .post('/verify', protect, orderController.verifyOrders);
router
  .get('/list', protect, restrict, orderController.getAllOrders)
  .patch('/status', protect, restrict, orderController.updateStatus)
  .delete('/list/:id', protect, restrict, orderController.deleteOrder);
module.exports = router;
