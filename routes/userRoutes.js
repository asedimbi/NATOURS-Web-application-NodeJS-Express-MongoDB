const express = require('express');
const router = express.Router();
const userController = require(`./../controller/userController`);
const authController = require(`./../controller/authController`);
const reviewController = require(`./../controller/reviewController`);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMyData', authController.updateMyData);
router.delete('/deleteMyAccount', authController.deleteMyAccount);
router.get('/me', userController.getMe, userController.getUserById);

router.use(authController.restrictTo('admin'));

router
.route('/')
.get(userController.getAllUsers)

router
.route('/:id')
.get(userController.getUserById)
.patch(userController.updateUserById)
.delete(userController.deleteUserById);


module.exports = router;