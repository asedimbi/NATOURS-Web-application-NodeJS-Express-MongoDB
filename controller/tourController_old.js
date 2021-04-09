const fs = require('fs');
const { nextTick } = require('process');
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

//0. Check ID Param
exports.checkID = (req, res, next, val) =>{
    console.log(`Tour ID is: ${val}`);
    if(req.params.id * 1 > tours.length){
        return res.status(404).json({
            status:'failed',
            message:'Invalid ID'
        });
    }
    next();
};

//0.1 check name and price in the req body
exports.checkBody = (req, res, next) => {
    if(!req.body.name || !req.body.price){
        return res.status(400).json({
            status: 'failed',
            message: 'Missing name or price'
        });
    }
    next();
};


//1. GET all tours
exports.getAllTours = (req, res) => {
    res.status(200)
    .json(
        {status:'Success', 
        results: tours.length,
        data: {tours: tours}});
};

//2. GET tour by id
exports.getTourById = (req, res) => {
    const id = req.params.id * 1;
    const tour = tours.find(el => el.id === id);
    res.status(200)
    .json(
        {status:'Success', 
        // results: tours.length,
        data: {tour: tour}
    });
};

//3. POST a new Tour
exports.createNewTour = (req, res) => {
    //create new ID for the incoming record
    const newID = tours[tours.length -1].id + 1;
    const newTour = Object.assign({id: newID}, req.body);
    tours.push(newTour);

    fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success',
            data: {tour:newTour}
        });
    });

    //console.log(req.body);
    //res.send('Done');
};

//Update tours --> PUT or PATCH
//PUT requires the entire object that is being updated to be sent
//PATCH requires only the parameters that are being changed in the object to be sent
//PATCH needs lesser data and is more easy to implement with MongoDB later

//4. PATCH a tour by ID and some params
exports.updateTourbyId = (req, res) => {
    const id = req.params.id * 1;
    res.status(200).json({
        status:'success',
        data: {
            tour: `<Updated tour id: ${id}>`
        }
    });

};

//5. DELETE tour by ID
exports.deleteTourById = (req, res) => {
    const id = req.params.id * 1;
    res.status(204).json({
        status:'success',
        data: null
    });
};
