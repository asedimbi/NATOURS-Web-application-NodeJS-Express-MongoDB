const User = require('../models/userModel');
//const apiFeatures = require('../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');

exports.getAllUsers = catchAsync( async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users: users
        }
    });
});
exports.getUserById = (req, res) => {
    res.status(500).json({
        status: 'Error',
        message: 'This Functionality is yet to be implemented'
    });
};
exports.createNewUser = (req, res) => {
    res.status(500).json({
        status: 'Error',
        message: 'This Functionality is yet to be implemented'
    });
};
exports.updateUserById = (req, res) => {
    res.status(500).json({
        status: 'Error',
        message: 'This Functionality is yet to be implemented'
    });
};
exports.deleteUserById = (req, res) => {
    res.status(500).json({
        status: 'Error',
        message: 'This Functionality is yet to be implemented'
    });
};