const express = require('express');
const router = express.Router();
const userController = require(`./../controller/userController`);
const authController = require(`./../controller/authController`);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMyPassword', authController.protect, authController.updatePassword);
router.patch('/updateMyData', authController.protect, authController.updateMyData);
router.delete('/deleteMyAccount', authController.protect, authController.deleteMyAccount);

router
.route('/')
.get(userController.getAllUsers)
.post(userController.createNewUser);

router
.route('/:id')
.get(userController.getUserById)
.patch(userController.updateUserById)
.delete(userController.deleteUserById);

module.exports = router;