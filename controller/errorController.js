const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) =>{
    //console.log('handleCastErrorDB');
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400);
}

const handleDuplicateFieldDB = (err) => {
    const value = err.keyValue['name'];
    const message = `Duplicate field value: ${value}. Please use a different field value`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = (err) => {
    const message = err.message;
    return new AppError(`Invalid Token. Please login again (error: ${err.message})`, 401);
}

const handleJWTExpiredError = (err) => new AppError(`Token Expired. Please login again (error: ${err.message})`, 401);

const sendErrorDev= (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    if(err.isOperational){
        //Operational or known trusted error. Can send details to client
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message || err.shortMessage || 'No message captured'
        });
    }else{
        //programming or other unknown error. DONT sent details to client for security
        //Log the error to console.
        //console.log('Error', err);
        res.status(500).json({
            status:'error',
            message: 'something went very wrong!'
        });
    }
};



module.exports = (err, req, res, next) => {
    console.log(err);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    //Separating error messages logic for dev and prod
    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res);
    }else if (process.env.NODE_ENV === 'production'){
        let error = {...err};
        if (error.kind == 'ObjectId') error = handleCastErrorDB(error);
        if (error.code == 11000) error = handleDuplicateFieldDB(error);
        if (error._message == 'Validation failed') error = handleValidationErrorDB(error);
        if (error.name == 'JsonWebTokenError') error = handleJWTError(error);
        if (error.name == 'TokenExpiredError') error = handleJWTExpiredError(error);
        sendErrorProd(error, res);
    }
    
    next();
}