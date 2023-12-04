const mongoose=require('mongoose');
const slugify=require("slugify");
// const validator=require("validator");
const User =require('./userModel');

const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'A tour must have a name'],
        unique:true,
        trim:true,
        maxlength:[ 40,'A tour must have less or equal than 40 characters'],
        minlength:[ 10,'A tour must have more or equal than 10 characters']
       // validate:[ validator.isAlpha , 'the name should only contain letters spaces are also not allowed']
    },
    slug:{
        type:String
    },
    duration:{
        type:String,
        required:[true,'A tour must have a duration'],
        
    },
    maxGroupSize:{
        type:Number,
        required:[true,'A tour must have a group size'],    
    },
    difficulty:{
        type:String,
        required:[true,'A tour must have difficulty'],
        enum:{
            values : ['easy','medium','difficult'],
            message: " difficulty is either easy medium difficult"
        }
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1,"ratings average should be more than or equal to 1 "],
        max:[5,"ratings average should be les than or equal to 5 "],
        set: val => Math.round(val*10)/10   //4.66666667  //4.7  //46.6666667  //47   //4.7
    },
    ratingQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,'A tour must have a price']
    },
    priceDiscount:{
        type:Number,
        validate: {
            //this keyword will point to current document only when new document is created and not occour on update 
            validator: function(val){
                   return val<this.price; 
            },
            message:"discount price  ({VALUE}) should be less than price"
        }
            
           
        //val pointing to priceDiscount
        //remember if we are using this keyword then we can't use arrow function and use a simple function in such a case
    },
    summary:{
        type:String,
        trim:true,
        required:[true,'tour must have summary']
    },
    description:{ 
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'a tour must have cover image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    startDates:[Date],
    secretTour:{
        type :Boolean,
        default:false
    },
    startLocation:{
        //GeoJson
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    locations:[
        {
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String,
        day:Number
    }],
    // guides:Array 
    guides:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User'

    }]
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});
// tourSchema.index({price:1});
tourSchema.index({price:1 , ratingsAverage: -1});
tourSchema.index({slug:1});
//tourSchema.index({startLocation:'2dsphere'})


tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7
})

//virtualing populate reviews into tours

tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
});
//document middleware runs before the .save and .create() command
 tourSchema.pre('save',function(next){
    this.slug=slugify(this.name,{lower:true});
    next();
})
tourSchema.pre('save',function(next){
    console.log("will save document......")
    next();
})  

tourSchema.post('save',function(doc,next){
 //   console.log(doc);
    next();
})


//below code is for embedding user into tour
// tourSchema.pre('save',async function(next){
   
//     const guidesPromises = this.guides.map(async id=>await User.findById(id));
//     //async function returns a promise so guidesPromises is an array of promises

//     //to run all these promises at same time
//     this.guides = await Promise.all(guidesPromises);

//     next();
// });


//QUERY MIDDLEWARE->hook is find here which makes it a query middleware and this keyword will point to query her and not document
// tourSchema.pre('find',function(next)
tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}});
    this.start=Date.now();
    next();
}); 
//this keyword is not allowedd in post
tourSchema.post(/^find/,function(docs,next){
     console.log(docs);
      console.log(`query took ${Date.now()-this.start} milliseconds!`);
    next();
})
tourSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-_v -passwordChangedAt'
    })
    next();
})

//AGGREGATION MIDDLEWARE : USE=> IF WE WANT TO REMOVE SECRET TOUR FROM AGGREGATION......
// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}});
//    console.log(this.pipeline());
//    next();
// })
const Tour=mongoose.model('Tour',tourSchema);

module.exports=Tour; 