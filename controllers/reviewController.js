// const AppError = require('../utils/appError');
const Review=require('./../models/reviewModel');
// const APIFeatures=require('./../utils/apiFeatures');
// const catchAsync=require('./../utils/catchAsync');
const factory = require('./handlerFactory');



exports.getallReviews = factory.getAll(Review)
// exports.getallReviews = catchAsync(async (req,res,next)=>{
//     let filter = {}
//     if(req.params.tourId)  filter={tour:req.params.tourId};
//     const reviews=await Review.find(filter);

//     res.status(200).json({
//         status:'success',
//         results:reviews.length,
//         data:{
//             reviews
//         }
// }); 

// });


// exports.createReview=catchAsync(async(req,res,next)=>
// {   
//     //Allowing nested routes
//     if(!req.body.tour)  req.body.tour=req.params.tourId;
//     //user taken from protect middleware
//     if(!req.body.user)  req.body.user=req.user.id;
//     const newReview=await Review.create(req.body);

//     res.status(201).json({
//         status:'success',
//         data:{
//             review:newReview
//         }
//     });
// } );

exports.setTourUserIds = (req,res,next) =>{
    //Allowing nested routes
    if(!req.body.tour)  req.body.tour=req.params.tourId;
//     //user taken from protect middleware
    if(!req.body.user)  req.body.user=req.user.id;
    next();
}

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);