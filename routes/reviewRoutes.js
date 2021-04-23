const express = require('express');
const reviewController = require(`./../controller/reviewController`);
const authController = require('./../controller/authController');

const router = express.Router({mergeParams : true});

router.use(authController.protect);

router
.route('/')
.get(reviewController.getAllReviews)
.post(authController.restrictTo('user'),
    reviewController.setTourAndUserIds,
    reviewController.createNewReview);


router
.route('/:id')
.get(reviewController.getReviewById)
.patch(authController.restrictTo('user', 'admin'), reviewController.updateReviewById)
.delete(authController.restrictTo('user', 'admin'), reviewController.deleteReviewById);

module.exports = router;