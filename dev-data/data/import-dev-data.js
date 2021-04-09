const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const Tour = require('./../../models/tourModel');

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

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

//Import data into DB
const importData = async () => {
    try{
        await Tour.create(tours);
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