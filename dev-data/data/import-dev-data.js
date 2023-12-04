//load the js on file into the database

const fs = require('fs');
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const Tour=require('./../../models/tourModel');
const User=require('./../../models/userModel');
const Review=require('./../../models/reviewModel');

dotenv.config({path:'./config.env'});

//console.log(app.get('env')); 
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// mongoose.set("strictQuery", false);
mongoose.connect(DB,{
    useNewUrlParser:true, 
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
}).then(()=>{
    console.log('DB connection successful');
}).catch((err)=> console.log(err));

// read json file
const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const users=JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const reviews=JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));

//import data into database

const importData=async()=>{
    try {
        await Tour.create(tours);
        await User.create(users,{validateBeforeSave:false});
        await Review.create(reviews);

        console.log("data loaded successfully");
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

const deleteData=async()=>{
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();

        console.log("data deleted successfully");
    } catch (err) {
        console.log(err);
    }
    process.exit();
};
//  console.log(process.argv);

if(process.argv[2]=== '--import'){
   importData();
}


if(process.argv[2]=== '--delete'){
    deleteData();
 }
