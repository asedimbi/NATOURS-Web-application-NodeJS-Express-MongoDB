const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose
// .connect(process.env.DATABASE_LOCAL, {
.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    //console.log(con.connections);
    console.log('DB connection Successful');
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//Import data into DB
const importData = async () => {
    try{
        await Tour.create(tours);
        await User.create(users, {validateBeforeSave : false});
        await Review.create(reviews);
        //Tour.create can accept an array of jsons
        console.log('Data Successfully Loaded!');
        process.exit();
    }catch (err){
        console.log(err);
    }
};

//Delete All Data from DB
const deleteData = async () => {
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        //Tour.create can accept an array of jsons
        console.log('Data Deleted Successfully!');
        process.exit();
    }catch (err){
        console.log(err);
    }
}

if(process.argv[2] == "--import"){
    importData();
}
else if(process.argv[2] == '--delete'){
    deleteData();
}

//console.log(process.argv);