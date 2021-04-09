const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const crypto = require('crypto');
const sendEmail = require('./../utils/email');
const { STATUS_CODES } = require('http');

//HELPER METHODS for concise code

const signToken = (id) => {
    return jwt.sign({id:id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const sendJWTToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24*60*60*1000),
        //secure: true,
        httpOnly: true
    };
    if(process.env.NODE_ENV == 'production') cookieOptions.secure = false;
    res.cookie('jwt', token, cookieOptions);
    user.password = undefined
    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user: user
        }
    });
};

const filterObj = (obj, ...allowedFields)=> {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

exports.signup = catchAsync( async (req, res, next) => {
    //console.log(req.body);
    // try{
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    // const token = jwt.sign({id:newUser._id}, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN
    // });
    sendJWTToken(newUser, 201, res);
});


exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
    
    //1. check if email exists
    if(!email || !password){
        return next(new AppError('Incorrect email or Password!', 400));
    }

    //2. check if password is correct
    const currUser = await User.findOne({email: email}).select('+password');
    console.log(currUser);
    if(!currUser || ! (await currUser.correctPassword(password, currUser.password))){
        return next(new AppError('Incorrect email or Password!', 401));
    }

    //3. send back a token to client
    sendJWTToken(currUser, 200, res);
    // const token = signToken(currUser._id);
    // res.status(200).json({
    //     status: 'success',
    //     token
    // });
});

exports.protect = catchAsync(async (req, res, next) => {
    //1. Check if token exists
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return next(new AppError('You are not logged in. Please login again', 401));
    }

    //console.log(token);
    //2. Check if the token is valid
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //console.log(decoded);

    //3. Check if the user exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return next(new AppError('The user no longer exists. Token invalid. Please login again', 401));
    }

    //4. Check if the user has not changed password
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('Password Changed Recently. Please login again!', 401));
    }

    //5. Put the user data on req if all tests are passed
    req.user = freshUser;
    //6. call next()
    next();
});


//Unlike the previours middleware functions we want restricTo() to be able to take args
//In order to facilitate passing args, we use a wrapper function on top of actual logic
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles is an array: [admin, lead guide]
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have the permission to do this action', 403));
            //403: forbidden
        }
        next();
    };  
};

//Password Reset Functions
exports.forgotPassword = catchAsync( async (req, res, next) => {
    //1. Get user from the email id provided
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new AppError('No user exists with that email', 404));
    }

    //2. Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    //console.log(resetToken);
    await user.save({validateBeforeSave: false});

    //3. Send it to user's email address
    //Define the resetURL to be sent
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    //console.log(resetURL);
    //build the message to be sent
    const message = `Forgot your password? Submit a PATCH request with a new password and confirm password to ${resetURL}\n. If you did not forget your password, ignore this email. Link Expires in 10 mins`;

    try{
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 mins)',
            message: message
        });
        
        res.status(200).json({
            status: 'success',
            message: 'Password reset link has been sent to your email address'
        });
        
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError('There was an error sending the email. Please try again later!', 500));
    }

});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //0. convert the token in req params to a hashed token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    //1. Get the user based on the token from req params token
    //2. Simultaneously check if the token has not expired
    console.log(hashedToken);
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    });
    if(!user){
        return next(new AppError('Password reset token is invalid or expired', 400));
    }
    //3. Update the password changed at property for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    //user.passwordChangedAt = Date.now();
    //password changed at will be autoset by pre-save hook defined in the userModle.js
    await user.save();
    //4. Log the user, send JWT
    sendJWTToken(user, 200, res);
});

exports.updatePassword = catchAsync (async (req, res, next) => {
    //1. Get the user from the collection
    //const user = await getUserFromJWTToken(req);
    const user = await User.findById(req.user.id).select('+password');

    //2. Check if the posted current password is correct
    if(!user.correctPassword(req.body.password, user.password)){
        return next(new AppError('Current Password entered did not match the Database records', 401));
    }

    //3. If correct, update the new password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4. send back the JWT to client
    sendJWTToken(user, 200, res);
});

exports.updateMyData = catchAsync( async (req, res, next) => {
    //1. create error if user posts password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This page is not for updating password', 400));
    }

    //2. update user data for allowed, simple data fields (not related to auth or roles)
    const userData = filterObj(req.body, 'name', 'email');
    console.log(userData);
    //Cannot use --> await user.save(); here, because of validations for pass and passconfirm
    const updatedUser = await User.findByIdAndUpdate(req.user.id, userData, {
        new: true,
        runValidators: true
    });

    //3. Send response
    res.status(200).json({
        status: "success",
        data:{
            user: updatedUser
        }
    });
});

exports.deleteMyAccount = catchAsync( async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({status: 'success'});
});