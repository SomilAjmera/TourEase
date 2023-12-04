const express= require("express");

const tourContoller=require('./../controllers/tourController');
const authController=require('./../controllers/authController');
// const reviewController=require('./../controllers/reviewController');
const reviewRouter=require('./reviewRoutes');

const router = express.Router();
//router.param('id',tourContoller.checkID);

// //POST /tour/1234/reviews
// //GET /tour/1234/reviews
// //GET /tour/1234/reviews/5678

// router.route('/:tourId/reviews').post(authController.protect,authController.restrictTo('user'),reviewController.createReview);


//for this specific route use reviewrouter
router.use('/:tourId/reviews',reviewRouter);


router.route('/top-5-cheap').get(tourContoller.aliasTopTours,tourContoller.getallTours);
 

router.route('/tour-stats').get(tourContoller.getTourStats);
router.route('/monthly-plan/:year').get(authController.protect,authController.restrictTo('admin','lead-guide','guide'),tourContoller.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourContoller.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourContoller.getDistances);

router.route('/:id').get(tourContoller.getTour).patch(authController.protect,authController.restrictTo('admin','lead-guide'),tourContoller.uploadTourImages,tourContoller.resizeTourImages,tourContoller.updateTour).delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourContoller.deleteTour);
router.route('/').get(tourContoller.getallTours).post(authController.protect,authController.restrictTo('admin','lead-guide'),tourContoller.createTour);



module.exports=router; 
