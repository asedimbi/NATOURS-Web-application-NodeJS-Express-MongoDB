const mongoose = require('mongoose');
const validator = require('validator');
const catchAsync = require('./../utils/catchAsync');

//review, rating, createdAt, reftotour, reftouser

const reviewSchema = new mongoose.Schema(
    //Schema Definition
    {
        review:{
            type: String,
            required: [true, 'Please write a review for the tour']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        tour:{
            type: mongoose.Schema.ObjectId,
            ref:'tours',
            required: [true, 'Review must be associated with a tour']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref:'users',
            required: [true, 'Review must be associated with a user']
        }
    },
    //Schema Options
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'refToUser',
        select: 'name'
    });
    // .populate({
    //     path: 'refToTour',
    //     //select: '-__v -passwordChangedAt'
    //     select: 'name'
    // })
    next();
});


const Review = mongoose.model('reviews', reviewSchema);

module.exports = Review;