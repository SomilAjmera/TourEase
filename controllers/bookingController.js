const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);  
const AppError = require('../utils/appError');
const Tour=require('../models/tourModel');
const Booking=require('../models/bookingModel');
const catchAsync=require('../utils/catchAsync')
const factory = require('./handlerFactory');

 


exports.getCheckoutSession = catchAsync(async(req,res,next) =>{
   
  //1)get the currently booked tour

   const tour= await Tour.findById(req.params.tourId);

  //2)create checkout session

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment', 
    success_url:`${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url:`${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email:req.user.email,
    client_reference_id:req.params.tourId,
    line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              //image will come once the website is hosted
              images: [`http://127.0.0.1:3000/img/tours/${tour.imageCover}`],
            },
            unit_amount: tour.price * 100,
          },
          quantity: 1 
        },
    ],
  }) 

  //3)create session as response 

  res.status(200).json({ 
    status:'success',
    session
})
}); 

exports.createBookingCheckout = catchAsync(async(req,res,next) =>{
    //this is only temporary, because it is unsecure everyone can make bookings without paying by knowing that query string
    const {tour,user,price} = req.query;

    if(!tour && !user && !price) return next();
    await Booking.create({tour,user,price});
 
    next();

    res.redirect(req.originalUrl.split('?')[0]); 
});


exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.getAllBookings = factory.getAll(Booking);

