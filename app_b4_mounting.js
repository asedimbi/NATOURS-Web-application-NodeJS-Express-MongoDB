//0) PACKAGES

const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

//1) APP Global variables
const app = express();
const port = 3000;


//2) MIDDLEWARE
app.use(morgan('dev'));
app.use(express.json());

//3) PRIORI Data
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));


//4) ROUTE Handler Methods

//REFACTORED handler methods
//1. GET all tours
const getAllTours = (req, res) => {
    res.status(200)
    .json(
        {status:'Success', 
        results: tours.length,
        data: {tours: tours}});
};

//2. GET tour by id
const getTourById = (req, res) => {
    const id = req.params.id * 1;
    const tour = tours.find(el => el.id === id);
    if(!tour){
        //if tour with requested id is not found
        return res.status(404).json({
            status:'failed',
            message:'Invalid ID'
        })
    }
    //console.log(req.params);
    res.status(200)
    .json(
        {status:'Success', 
        // results: tours.length,
        data: {tour: tour}
    });
};

//3. POST a new Tour
const createNewTour = (req, res) => {
    //create new ID for the incoming record
    const newID = tours[tours.length -1].id + 1;
    const newTour = Object.assign({id: newID}, req.body);
    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
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
const updateTourbyId = (req, res) => {
    const id = req.params.id * 1;
    if(id > tours.length){
        return res.status(404).json({
            status:'failed', message:'InvalidID'
        });
    }
    res.status(200).json({
        status:'success',
        data: {
            tour: `<Updated tour id: ${id}>`
        }
    });

};

//5. DELETE tour by ID
const deleteTourById = (req, res) => {
    const id = req.params.id * 1;
    if(id > tours.length){
        return res.status(404).json({
            status:'failed', message:'InvalidID'
        });
    }
    res.status(204).json({
        status:'success',
        data: null
    });
};

//6. User route handlers. Temporary
const getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'Error',
        message: 'This Functionality is yet to be implemented'
    });
};
const getUserById = (req, res) => {
    res.status(500).json({
        status: 'Error',
        message: 'This Functionality is yet to be implemented'
    });
};
const createNewUser = (req, res) => {
    res.status(500).json({
        status: 'Error',
        message: 'This Functionality is yet to be implemented'
    });
};
const updateUserById = (req, res) => {
    res.status(500).json({
        status: 'Error',
        message: 'This Functionality is yet to be implemented'
    });
};
const deleteUserById = (req, res) => {
    res.status(500).json({
        status: 'Error',
        message: 'This Functionality is yet to be implemented'
    });
};


//5) ROUTE handling

//app.get('/api/v1/tours', getAllTours);
//app.get('/api/v1/tours/:id', getTourById);
//app.post('/api/v1/tours', createNewTour);
//app.patch('/api/v1/tours/:id', updateTourbyId);
//app.delete('/api/v1/tours/:id', deleteTourById);

//Further Refactoring the route handlers
app
.route('/api/v1/tours')
.get(getAllTours)
.post(createNewTour);

app
.route('/api/v1/tours/:id')
.get(getTourById)
.patch(updateTourbyId)
.delete(deleteTourById);

app
.route('/api/v1/users')
.get(getAllUsers)
.post(createNewUser);

app
.route('/api/v1/users/:id')
.get(getUserById)
.patch(updateUserById)
.delete(deleteUserById);


//6) Start Server
app.listen(port, () => {
    console.log(`App is running on the port ${port}`);
});

/*************************/
//DEPRECATED

// app.get('/', (req, res) => {
//     res
//     .status(200)
//     .json({message:'Hello From Server Side', app:'Natours'});
// });

// app.post('/', (req,res) =>{
//     res.send('You can post to this end point...');
// });