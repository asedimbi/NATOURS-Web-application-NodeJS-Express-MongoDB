const fs = require('fs');
const process = require('process');
const Tours = require('./../models/tourModel');
const apiFeatures = require('./../utils/apiFeatures');

//Alias Top 5 Cheap
exports.aliasTopCheap = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,difficulty,duration';
    next();
};



//1. GET all tours
exports.getAllTours = async (req, res) => {
    try{
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
    }catch (err){
        res.status(404).json({
            status:'failed',
            message: err
        });
    }

};

//2. GET a single tour by Id
exports.getTourById = async (req, res) => {
    try{
     tour = await Tours.findById(req.params.id);
     //tour.findOne({_id: req.params.id});
     res.status(200)
        .json(
            {status:'Success',
            data: tour
        });
    }catch (err){
        res.status(404).json({
            status:'failed',
            message: err
        });
    }
};

//3. POST a new Tour
exports.createNewTour = async (req, res) => {
    try{

        // const newTour = new Tour({});
        // newTour.save();

        const newTour = await Tours.create(req.body);

        res.status(201).json({
            status: 'success',
            data:{
                tour: newTour
            }
        });
    }catch (err) {
        res.status(400).json({
            status: 'failed',
            message: err
        });
    }

};

//Update tours --> PUT or PATCH
//PUT requires the entire object that is being updated to be sent
//PATCH requires only the parameters that are being changed in the object to be sent
//PATCH needs lesser data and is more easy to implement with MongoDB later

//4. PATCH a tour by ID and some params
exports.updateTourbyId = async (req, res) => {
    try{
        const tour = await Tours.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            status:'success',
            data: {
                // tour: tour
                tour
            }
        });

    }catch (err){
        res.status(404).json({
            status: 'failed',
            message: err
        });
    }
};

//5. DELETE tour by ID
exports.deleteTourById = async (req, res) => {
    try{
       await Tours.findByIdAndDelete(req.params.id);
       res.status(204).json({
           status:'success',
           data: null
       })
    }catch (err){
        res.status(404).json({
            status: 'failed',
            message: err
        })
    }
};

exports.getTourStats = async (req, res) => {
    try{
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
    }catch(err){
        res.status(404).json({
            status: 'Falied',
            message: err
        });
    }
};

exports.getMonthlyPlan = async (req, res)=>{
    try{
        console.log(req.params.year);
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
        
    }catch(err){
        res.status(404).json({
            status:'Failed',
            message: err
        });
    }
}

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