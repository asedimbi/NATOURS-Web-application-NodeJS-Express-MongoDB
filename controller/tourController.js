const fs = require('fs');
const process = require('process');
const Tours = require('../models/tourModel');
const apiFeatures = require('../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');

//Alias Top 5 Cheap
exports.aliasTopCheap = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,difficulty,duration';
    next();
};


//1. GET all tours
exports.getAllTours = catchAsync(async (req, res, next) => {
    
    //BUILD QUERY
    const features = new apiFeatures(Tours.find(), req.query)
    .filter()
    .sort()
    .project()
    .paginate();

    //EXECUTE QUERY
    const tours = await features.query;
    
    //const tours = await query;
    //const tours = await Tours.find(queryObj);
    res.status(200)
    .json(
        {status:'success', 
        results: tours.length,
        data: {tours: tours}
    });

});

//2. GET a single tour by Id
exports.getTourById = catchAsync(async (req, res, next) => {
    
    tour = await Tours.findById(req.params.id);
    //tour.findOne({_id: req.params.id});

    if(!tour){
        return next(new appError('No tour found with that ID', 404));
    }

    res.status(200)
        .json(
            {status:'Success',
            data: tour
        });
});


//3. POST a new Tour
exports.createNewTour = catchAsync(async (req, res, next) => {
    
    const newTour = await Tours.create(req.body);

    res.status(201).json({
        status: 'success',
        data:{
            tour: newTour
        }
    });
});

//Update tours --> PUT or PATCH
//PUT requires the entire object that is being updated to be sent
//PATCH requires only the parameters that are being changed in the object to be sent
//PATCH needs lesser data and is more easy to implement with MongoDB later

//4. PATCH a tour by ID and some params
exports.updateTourbyId = catchAsync(async (req, res, next) => {
    const tour = await Tours.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!tour){
        return next(new appError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status:'success',
        data: {
            // tour: tour
            tour
        }
    });
});

//5. DELETE tour by ID
exports.deleteTourById = catchAsync(async (req, res, next) => {
    
    const tour = await Tours.findByIdAndDelete(req.params.id);

    if(!tour){
        return next(new appError('No tour found with that ID', 404));
    }

    res.status(204).json({
        status:'success',
        data: null
    });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tours.aggregate([
        {
            $match: {ratingsAverage: {$gte: 4.5}}
        },
        {
            $group: {
                //_id: null,
                _id: {$toUpper: '$difficulty'},
                numTours: {$sum: 1},
                numRatings: {$sum: '$ratingsQuantity'},
                avgRating: {$avg: '$ratingsAverage'},
                avgPrice: {$avg: '$price'},
                minPrice: {$min: '$price'},
                maxPrice: {$max: '$price'}
            }
        },
        {
            $sort: {avgPrice: -1}
        },
        // {
        //     $match: {_id: {$ne:'EASY'}}
        // }
    ]);
    res.status(200).json({
        status:'success',
        data: stats
        }
    );
});

exports.getMonthlyPlan = catchAsync(async (req, res, next)=>{
    //console.log(req.params.year);
    const year = req.params.year * 1;
    const plan = await Tours.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: {$month: '$startDates'},
                numToursStarts: {$sum: 1},
                tours: {$push: '$name'}
            }
        },
        {
            $addFields: {month: '$_id'}
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {numToursStarts: -1}
        },
        {
            $limit: 12
        }
    ]);
    res.status(200).json({
        status: 'Success',
        data: plan
    });
});

//DEPRECATED
// //0. Check ID Param
// exports.checkID = (req, res, next, val) =>{
//     console.log(`Tour ID is: ${val}`);
//     if(req.params.id * 1 > tours.length){
//         return res.status(404).json({
//             status:'failed',
//             message:'Invalid ID'
//         });
//     }
//     next();
// };

//0.1 check name and price in the req body
// exports.checkBody = (req, res, next) => {
//     if(!req.body.name || !req.body.price){
//         return res.status(400).json({
//             status: 'failed',
//             message: 'Missing name or price'
//         });
//     }
//     next();
// };