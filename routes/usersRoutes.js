const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { protect, restrict } = require('../helpers/authJWT');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/login/admin', authController.adminLogin);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMyPassword', protect, authController.updateMyPassword);
router.patch('/updateMyPassword', protect, userController.UpdateMyData);

router.get('/', protect, restrict, userController.getAllUsers);

router
  .route('/:id')
  .get(protect, restrict, userController.getUser)
  .patch(protect, restrict, userController.updateUser)
  .delete(protect, restrict, userController.deleteUser);

module.exports = router;
