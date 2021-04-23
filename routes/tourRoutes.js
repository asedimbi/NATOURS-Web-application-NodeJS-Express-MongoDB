
const express = require('express');
const router = express.Router();
const tourController = require(`./../controller/tourController`);
const authController = require('./../controller/authController');
const reviewController = require(`./../controller/reviewController`);
const reviewRouter = require('./../routes/reviewRoutes');


router.use('/:tourId/reviews', reviewRouter);
// POST /tour/tourID12132/reviews
// GET /tour/toruID12323/reivews
// GET /tour/tourID23434/reviews/reviewID12243

// router.route('/:tourId/reviews').post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createNewReview
// );

router.route('/top-5-cheap').get(tourController.aliasTopCheap, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year')
        .get(authController.protect,
            authController.restrictTo('admin', 'lead-guide', 'guide'),
            tourController.getMonthlyPlan);


router
.route('/')
.get(tourController.getAllTours)
.post(
    authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.createNewTour
    );

router
.route('/:id')
.get(tourController.getTourById)
.patch(authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTourbyId)
.delete(authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTourById);


module.exports = router;