//0) PACKAGES
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');

//1) APP Global variables
const app = express();

//2) MIDDLEWARE
// Middleware: set secure HTTP headers using helmet
app.use(helmet());

// Middleware: check if the env is development or production
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// Middleware: Apply rate limiting
const limiter = rateLimit({
    max: 100,
    windowMs: 60*60*1000,
    message: 'Too many requests from this IP. Rate Limit Exceeded. Try again after 1 hr'
});
// we want to apply the above limiter to all the api routes:
app.use('/api', limiter);


// Middleware: Body parser, reading req body as json
app.use(express.json({limit: '10kb'}));

// Data Sanitization against NOSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xssClean());

// Prevent Parameter Pollution using hpp
app.use(hpp({
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price']
}));

// Middleware: serving static files on server
app.use(express.static(`${__dirname}/public`));

//3) ROUTE handling
// Middleware: Mounting routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Middleware: Handlling Unknown routes
app.all('*', (req, res, next) => {
    next(new appError([`Can't find ${req.originalUrl} on this server!`, 404]));
});

//Middleware: Global Error Handling
app.use(globalErrorHandler);

module.exports = app;


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


//Route handling Deprecated
//app.get('/api/v1/tours', getAllTours);
//app.get('/api/v1/tours/:id', getTourById);
//app.post('/api/v1/tours', createNewTour);
//app.patch('/api/v1/tours/:id', updateTourbyId);
//app.delete('/api/v1/tours/:id', deleteTourById);