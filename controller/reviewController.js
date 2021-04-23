const Reviews = require('../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const Review = require('../models/reviewModel');
const factory = require('./../controller/handlerFactory');

//Helper Middleware for createOne through nested routes
exports.setTourAndUserIds = (req, res, next) => {
    //Allow nested routes
    if(! req.body.tour) req.body.tour = req.params.tourId;
    if(! req.body.user) req.body.user = req.user.id;
    next();
};

exports.getAllReviews = factory.getAll(Reviews);
exports.getReviewById = factory.getOne(Review);
exports.createNewReview = factory.createOne(Review);
exports.updateReviewById = factory.updateOne(Review);
exports.deleteReviewById = factory.deleteOne(Review);