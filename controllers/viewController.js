const AppError = require('../utils/appError');
const Tour = require ('./../models/tourModel');
const Booking= require('./../models/bookingModel')
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');



exports.getOverview=catchAsync(async(req,res)=>{
const tours = await Tour.find();

    res.status(200).render('overview',{
        title:'All Tours',
        tours
    });
});


exports.getTour = catchAsync(async(req,res) =>{
    const tour= await Tour.findOne({slug: req.params.slug}).populate({
        path:'reviews',
        fields:'review rating user'
    })
    if(!tour){
        return next(new AppError('there is no tour with that name',404));
    }
    res.status(200).render('tour',{
        title:`${tour.name} Tour`,
        tour
    });
});

exports.getLoginForm = (req,res) => {

    res.status(200).render('login',{
        title:'Log into your account'
    });
    
};

exports.getAccount = (req,res) =>{
    res.status(200).render('account',{
        title:'Your Account'
    });
};

exports.getMyTours = catchAsync(async(req,res,next) =>{

    //1)find all bookings
    const bookings = await Booking.find({user:req.user.id});

    //2) find tours with the returned ID's

    const tourIDs = bookings.map(el => el.tour);
    const tours =await Tour.find({ _id:{ $in:tourIDs}});

    res.status(200).render('overview',{
        title: 'My Tours',
        tours
    });
});



exports.updateUserData = catchAsync(async(req,res,next) =>{
    const updatedUser = await User.findByIdAndUpdate(req.user.id,{
        name:req.body.name,
        email:req.body.email
    },{
        new:true,
        runValidators:true
    }
    );

    res.status(200).render('account',{
        title:'Your Account',
        user:updatedUser
    });
});