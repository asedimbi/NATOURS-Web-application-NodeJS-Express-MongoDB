const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const catchAsync = require('./../utils/catchAsync');

//name, email, photo, password, confirmPassword

const UserSchema = new mongoose.Schema(
    //SCHEMA DEFINITION
    {
        name: {
            type: String,
            required: [true, 'Please enter your name'],
            maxLength: [128, 'A user name cannot be longer than 128 chars']
        },
        email: {
            type: String,
            required: [true, 'Please enter your email ID'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Please provide a valid email ID']
        },
        photo: {
            type: String,
            //required: [true, 'A user must have a profile photo']
        },
        password: {
            type: String,
            required: [true, 'Please enter a password for your account'],
            minLength: [8, 'Password must be at least 8 characters long'],
            select: false
        },
        passwordConfirm: {
            type: String,
            required: [true, 'Please confirm the typed password again'],
            validate: {
                //This only works on save. Not on Update
                validator: function(val) {
                    return val == this.password;
                }
            },
            select: false
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
            type: Boolean,
            default: true,
            select: false
        },
        role: {
            type: String,
            enum: ['user', 'guide', 'lead-guide', 'admin'],
            default: 'user'
        }
    },
    //SCHEMA OPTIONS
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

//Mongoose Middleware

UserSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 10);
    //use a CPU cost or 12. can be 10 etc.
    this.passwordConfirm = undefined;
    //At this stage, we have already passed the model validatior for pass==passConfirm
    //there is no more use of the passConfirm field value. Set it to undefined
    next();
});

UserSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});


UserSchema.pre(/^find/, function(next){
    this.find({active: {$ne: false}});
    next();
});

//INSTANCE METHODS
UserSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function(JWT_Timestamp){
    if(this.passwordChangedAt){
        const pwdChangedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        //console.log(pwdChangedAt, JWT_Timestamp);
        return JWT_Timestamp < pwdChangedAt;
    }
    return false;
};

UserSchema.methods.createPasswordResetToken = function(){
    //console.log(crypto.randomBytes(32));
    const resetToken = crypto.randomBytes(32).toString('hex');
    

    //Not safe to store reset tokens without encryption
    //Using builtin crypto module again for encryption
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    //console.log(resetToken);
    //console.log(this.passwordResetToken);
    
    this.passwordResetExpires = Date.now() + 30*60*1000; //milliseconds for 10 mins

    return resetToken;
};



//Making a model out of the schema

const userModel = mongoose.model('users', UserSchema);

module.exports = userModel;