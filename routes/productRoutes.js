const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router
  .route('/')
  .post(productController.validateCategory, productController.createProduct)
  .get(productController.getAllProducts);

/////////////////////////////Filtering//////////////////////////////////
router.route('/featured').get(productController.getFeaturedProducts);
///////////////////////////////////////////////////////////////////////

router
  .route('/:id')
  .all(productController.validateID)
  .get(productController.getProduct)
  .patch(productController.checkCategory, productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
