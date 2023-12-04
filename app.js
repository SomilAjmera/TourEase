const path = require("path");
const fs = require("fs");
const morgan=require("morgan");
const express= require("express");
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const app = express();
const rateLimit=require('express-rate-limit');
const helmet =require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const userrouter =  require('./routes/userRoutes');
const tourrouter = require('./routes/tourRoutes');
const reviewrouter = require('./routes/reviewRoutes');
const bookingrouter = require('./routes/bookingRoutes');

const viewrouter = require('./routes/viewRoutes');
const cookieParser = require('cookie-parser');

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
//global middlewares
//serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname,'public')));
// set security http headers  //should be at top
app.use( helmet({ contentSecurityPolicy: false }) );

 

//development logging    
app.use(morgan('dev'));

// const tours=JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)); 


//limit request from same api
const limiter = rateLimit({
  max:100,
  WindowMS:60*60*1000,
  message:'too many request from this ip please try again in an hour'
});

app.use('/api',limiter);


//Body parser,reading data from body into req.body
app.use(express.json({limit:'10kb'}));

//to store updated data in req.body on account page 
app.use(express.urlencoded({extended:true,limit:'10kb'}));
app.use(cookieParser());
 

//data sanitization against NoSQLquery injection
app.use(mongoSanitize());


//data sanitization against xss
app.use(xss());

//prevent parameter pollution //should be at last because cleans query   //will consider sort of last one
app.use(hpp({
  whitelist: [
    'duration',
    'ratingQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ] 
}));

// test middleware
app.use((req,res,next) => {
  req.requestTime = new Date().toISOString();
 // console.log(req.cookies);
  next(); 
})
//routes
app.use('/',viewrouter);
app.use('/api/v1/users',userrouter);

app.use('/api/v1/tours',tourrouter);

app.use('/api/v1/reviews',reviewrouter);

app.use('/api/v1/bookings',bookingrouter);





app.all('*',(req,res,next)=>{
  //  const err = new Error(`can't find ${req.originalUrl} on this erver!`);
  //  err.status=fail;
  //  err.statusCode=404;
  next(new AppError(`can't find ${req.originalUrl} on this server!`,404));
});
app.use(globalErrorHandler);
  
 
  module.exports=app;
 


