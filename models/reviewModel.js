const mongoose = require('mongoose');
const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema(
    {
        review:{
            type:String,
            required:[true,'Review cannot be empty']
        },
        rating:{
            type:Number,
            min:1,
            max:5,


        },
        createdAt:{
            type:Date,
            default:Date.now
        },
        tour:{
            type:mongoose.Schema.ObjectId,
            ref:'Tour',
            required:[true,'review must belong to a tour']
        },
        user:{
            type:mongoose.Schema.ObjectId,
            ref:'User',
            required:[true,'review must have a user']
        }
    },
    {
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
);

//we want that a particular user writes a single review on a tour

reviewSchema.index({tour:1,user:1},{unique:true});

reviewSchema.pre(/^find/,function(next){
    this.populate({
        path:'tour',
        select:'name'

    }).populate({
        path:'user',
        select:'name photo'
    })
    next();
})


//in static method this refers to model
  reviewSchema.statics.calcAverageRatings =  async function(tourId){
    
   const stats =    await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group: {
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{$avg:'$rating'}                
            }
        }
    ]);
    console.log(stats);
    if(stats.length>0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingQuantity:stats[0].nRating,
            ratingsAverage:stats[0].avgRating
        })
    }else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingQuantity:0,
            ratingsAverage:4
        });
    }
   
  }
 //but problem is Review will not work here as it is not defined
reviewSchema.post('save',function(){
   //this points to current review
   //but problem is Review will not work here as it is not defined
   // Review.calcAverageRatings(this.tour); 
   //so use this.constructor where this is current document(review whose constructor is Review) and constructor is model who created that document

   this.constructor.calcAverageRatings(this.tour);
});
//reviews are update and delete by findbyidandupdate  or findbyidanddelete
//so we cant use document middleware

//also we cant use post here because after execution of query we cant access query
//we save awaited query to this.r so we can pass it and use it in next function
reviewSchema.pre(/^findOneAnd/,async function (next){
    this.r = await this.findOne();
  //  console.log(this.r);
    next();  
})
 

  // post method so no next function
  //this.r is the current document
reviewSchema.post(/^findOneAnd/,async function (){
   await this.r.constructor.calcAverageRatings(this.r.tour);  
})
 
const Review = mongoose.model('Review',reviewSchema);

module.exports=Review;





