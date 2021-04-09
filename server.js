const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const port = process.env.PORT || 3000;
const app = require('./app');
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

process.on('uncaughtException', err => {
    console.log('Uncaught Exception!!! Shutting Down!!!');
    console.log(err.name);
});

mongoose
// .connect(process.env.DATABASE_LOCAL, {
.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    //console.log(con.connections);
    console.log('DB connection Successful');
// }).catch( err => {
//     console.log('Error Connecting to DB');
});

// console.log(app.get('env'));
// console.log(process.env);
const server = app.listen(port, () => {
    console.log(`App is running on the port ${port}`);
});

process.on('unhandledRejection', err => {
    console.log('Unhandled Rejection!!! Shutting Down!!!');
    console.log(err.name);
    server.close(() => {
        process.exit(1);
    });
});
