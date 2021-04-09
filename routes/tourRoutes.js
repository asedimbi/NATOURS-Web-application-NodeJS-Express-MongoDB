
const express = require('express');
const router = express.Router();
const tourController = require(`./../controller/tourController`);
const authController = require('./../controller/authController');

// router.param('id', tourController.checkID);

router.route('/top-5-cheap').get(tourController.aliasTopCheap, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
.route('/')
.get(authController.protect, tourController.getAllTours)
// .post(tourController.checkBody, tourController.createNewTour);
.post(tourController.createNewTour);

router
.route('/:id')
.get(tourController.getTourById)
.patch(tourController.updateTourbyId)
.delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTourById);

module.exports = router;