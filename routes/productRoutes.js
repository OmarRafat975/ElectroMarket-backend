const express = require('express');
const productController = require('../controllers/productController');
const { protect, restrict } = require('../helpers/authJWT');
const upload = require('../helpers/multer');

const router = express.Router();

router
  .route('/')
  .post(
    protect,
    restrict,
    upload.fields([{ name: 'images' }]),
    productController.validateCategory,
    productController.createProduct,
  )
  .get(productController.getAllProducts);

// /////////////////////////////Filtering//////////////////////////////////
// router.route('/featured').get(productController.getFeaturedProducts);
// ///////////////////////////////////////////////////////////////////////

router
  .route('/:id')
  .all(productController.validateID)
  .get(productController.getProduct)
  .patch(
    protect,
    restrict,
    productController.checkCategory,
    productController.updateProduct,
  )
  .delete(protect, restrict, productController.deleteProduct);

module.exports = router;
