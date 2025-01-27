const express = require('express');
const productController = require('../controllers/productController');
const { protect, restrict } = require('../helpers/authJWT');

const router = express.Router();

router
  .route('/')
  .post(
    restrict,
    protect,
    productController.validateCategory,
    productController.createProduct,
  )
  .get(productController.getAllProducts);

/////////////////////////////Filtering//////////////////////////////////
router.route('/featured').get(productController.getFeaturedProducts);
///////////////////////////////////////////////////////////////////////

router
  .route('/:id')
  .all(productController.validateID)
  .get(productController.getProduct)
  .patch(
    restrict,
    productController.checkCategory,
    productController.updateProduct,
  )
  .delete(restrict, productController.deleteProduct);

module.exports = router;
