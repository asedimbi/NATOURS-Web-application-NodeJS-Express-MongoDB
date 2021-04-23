const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const apiFeatures = require('./../utils/apiFeatures');

exports.getAll = (Model) => catchAsync(async (req, res, next) => {
    //Allow filters from nested routes (Simple hack. Stays empty for non-nested routes)
    let filter = {};
    if(req.params.tourId) filter = {refToTour: req.params.tourId};

    //BUILD QUERY
    const features = new apiFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .project()
    .paginate();

    //EXECUTE QUERY
    const docs = await features.query;
    
    res.status(200)
    .json(
        {status:'success', 
        results: docs.length,
        data: docs
    });

});

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if(populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    if(!doc){
        return next(new appError('No doc found with that ID', 404));
    }

    res.status(200).json(
            {status:'Success',
            data: doc
        });
});


exports.createOne = (Model) => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: doc
    });
});

exports.updateOne = (Model) => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!doc){
        return next(new appError('No document found with that ID', 404));
    }

    res.status(200).json({
        status:'success',
        data: doc
    });
});

exports.deleteOne = (Model) => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if(!doc){
        return next(new appError('No document found with that ID', 404));
    }

    res.status(204).json({
        status:'success',
        data: null
    });
});