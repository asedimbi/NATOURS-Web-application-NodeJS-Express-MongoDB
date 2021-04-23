const User = require('../models/userModel');
//const apiFeatures = require('../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./../controller/handlerFactory');


//Create new user is uniquely defined in AuthController as signup
// exports.createNewUser = (req, res) => {
//     res.status(500).json({
//         status: 'Error',
//         message: 'This Functionality is yet to be implemented'
//     });
// };

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUserById = factory.getOne(User);
exports.updateUserById = factory.updateOne(User);
exports.deleteUserById = factory.deleteOne(User);