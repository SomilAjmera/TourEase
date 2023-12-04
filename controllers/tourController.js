// const fs = require("fs");
const AppError = require('../utils/appError');
const Tour=require('./../models/tourModel');
const APIFeatures=require('./../utils/apiFeatures');
const catchAsync=require('./../utils/catchAsync')
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
// const mongoose=require('mongoose');



const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb) =>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }
    else{
        cb(new AppError('Not an image! please upload only images.',400),false);
    }
};

const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
});
       
exports.uploadTourImages = upload.fields([
    {name:'imageCover',maxCount:1},
    {name:'images',maxCount:3}
]);
// upload.single('image'); //req.file
// upload.array('images',5)  //req.files

exports.resizeTourImages = catchAsync(async(req,res,next) =>{


if(!req.files.imageCover || !req.files.images) return next();

//1) Cover image

req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`

await sharp(req.files.imageCover[0].buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${req.body.imageCover}`);


//2)Images

req.body.images = [];
//use map to save all three promises 
await Promise.all(req.files.images.map(async(file,i) => {

    const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;

    await sharp(file.buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${filename}`);

    req.body.images.push(filename);
    
})
);

    next();
});

exports.aliasTopTours=(req,res,next)=>{ 
    req.query.limit='5';
    req.query.sort='-ratingsAverage,price';
    req.query.fields='name,price,ratingsAverage,summary,difficulty';
    next();
};



// const tours=JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
// exports.checkID=(req,res,next,val)=>{
//     console.log(`Tour id is ${val}`);

//     if(req.params.id*1>tours.length){
//         return res.status(404).json({
//             status:'fail',
//             message:'Invalid ID'
//         });
//     }
//     next();
// };
// exports.checkBody=(req,res,next)=>{
//     if(!req.body.name || !req.body.price){
//         return res.status(400).json({
//             status:'fail',
//             message:'missing name or price'
//         });
//     }
//     next();
// };

// exports.getallTours = (req,res)=>{
//     console.log(req.requestTime);

//     res.status(200).json({
//         status:'success',
//         // results:tours.length,
//         // data:{
//         //     tours:tours
//         // }
// });
// };  

exports.getallTours = factory.getAll(Tour); 
// exports.getallTours = catchAsync(async (req,res,next)=>{
    

//    // console.log(req.query);
// //    // Build query
// //    //1A)filtering
// //     const queryObj = {...req.query};
// //     const excludedFields = ['page','sort','limit','fields'];
// //     excludedFields.forEach(el => delete queryObj[el]);
        
// //    //1B)Advanced filtering

// //    let querystr=JSON.stringify(queryObj);
// //    querystr=querystr.replace(/\b(gte|gt|lt|lte)\b/g,match=>`$${match}`);
// //    console.log(JSON.parse(querystr));
// //     let query= Tour.find(JSON.parse(querystr));
    
// //   // 2)Sorting
// //    if(req.query.sort){
// //     const sortby=req.query.sort.split(',').join(' ');
// //       query=query.sort(sortby);
// //    }else{
// //     query=query.sort('-createdAt');
// //    }

// //  //3)limiting
// //  if(req.query.fields){
// //     const fields=req.query.fields.split(',').join(' ');
// //     query=query.select(fields);
// //  }else{
// //     query=query.select('-__v');
// //  }

// //  //4)pagination

// //  const page = req.query.page * 1 || 1;
// //  const limit  = req.query.limit * 1 || 100;
// //  const skip  = (page-1) * limit;

// //  query = query.skip(skip).limit(limit);

// //  if(req.query.page){
// //     const numTours=await Tour.countDocuments();
// //     if(skip>=numTours) throw new Error("this page doesn't exist");
// //  }



//     //Execute query
//      const features =new APIFeatures(Tour.find(),req.query)
//      .filter() 
//      .sort()
//      .limitFields()
//      .paginate();
//      const tours=await features.query;
//     //   const tours = await query;
//     // const tours = await Tour.find({ 
//     //     duration: '5', 
//     //     difficulty: 'easy'
//     // });
//     // const tours = await Tour.find().where("difficulty").equals("easy").where("duration").equals("5");
//     res.status(200).json({
//         status:'success',
//         results:tours.length,
//         data:{
//             tours
//         }
//     });  



// });

// exports.createTour=(req,res)=>
// {    res.status(201).json
//     ({
//         status:'success',
        
//     });
//     const newId=tours[tours.length-1].id+1;
//     const newTour=Object.assign({id:newId},req.body);

//     tours.push(newTour);
//     fs.writeFile(`${__dirname}/tours-simple.json`,JSON.stringify(tours), err =>{
//         res.status(201).json
//         ({
//             status:'success',
//             data:{tour:newTour}
//         });
//     }
// );
// };

exports.createTour= factory.createOne(Tour);
// exports.createTour=catchAsync(async(req,res,next)=>
// {   //const newTour = new Tour({});
//     //newTour.save() 
//     //can be madde like this also but we are now making it another way by using special functions applied on Tour.......
    
//    // try{
//     const newTour=await Tour.create(req.body);

//     res.status(201).json({
//         status:'success',
//         data:{
//             tour:newTour
//         }
//     });
// } 
// );
// catch(err){
//     res.status(400).json({
//         status:'fail',
//         message:err
//     });
// }
// };


// exports.getTour=(req,res)=>{

//     const id = req.params.id*1;
  
    // const tour=tours.find(el=>el.id === id);
    // if(!tour){
    //     return res.status(404).json({
    //                 status:"fail",
    //                 message:"Invalid Id"
    //             });
    // }


    // res.status(200).json({
    //     status:'success',
    //     data:{
    //         tours:tour
    //     }
    // });
// };
exports.getTour = factory.getOne(Tour,{path:'reviews'});
// exports.getTour=catchAsync(async(req,res,next)=>{


//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     if(!tour){
//         return next(new AppError('No tour found with that id',404))
//     }
//     res.status(200).json({
//         status:'success',
        
//         data:{
//             tour
//         }
//     }); 

// });

 
    
  

// exports.updateTour=(req,res)=>{
    
    // const { id } = req.params;
    // const updatedProperties = req.body;
    // const touri = tours.find(touri => touri.id == id);
    // if (!touri) {
    //   res.status(404).send('Tour not found');
    //   return;
    // }

    // Object.assign(touri, updatedProperties);

    // // const updatedData = JSON.stringify(tours, null, 2);

    // fs.writeFile(`${__dirname}/tours-simple.json`, JSON.stringify(tours), 'utf8', (err) => {
    //   if (err) {
    //     console.error('Error writing to tours-simple.json:', err);
    //     res.status(500).send('Internal server error');
    //     return;
    //   }
    //   res.status(201).json
    //   ({
    //       status:'success',
    //       data:tours
    //   });
    // });
// };

exports.updateTour = factory.updateOne(Tour);

// exports.updateTour=catchAsync(async(req,res,next)=>{



//         const tour=await Tour.findByIdAndUpdate(req.params.id,req.body,{
//             new:true,
//             runValidators:true
//         });
//         if(!tour){
//             return next(new AppError('No tour found with that id',404))
//         }
//         res.status(200).json({
//           status:'success',
//           data:{
//             tour
//           }
//       });
    
// });

// exports.deleteTour= (req,res)=>{
//     res.status(500).json({
//         status:'error',
//         message:"this route is not yet defined"
//     });
// };

// exports.deleteTour= catchAsync(async (req,res,next)=>{
   
//   const tour= await Tour.findByIdAndDelete(req.params.id);
//    if(!tour){
//     return next(new AppError('No tour found with that id',404))
// }
//     res.status(204).json({
//         status:'success',
//        data:null
//     });
   
// });

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats= catchAsync(async (req,res,next) =>
{


        const stats =await Tour.aggregate([
            {
                $match: {ratingsAverage : {$gte:4.5}}
            },
            {
                $group:{
                    _id:{$toUpper:'$difficulty'},
                    numTours:{$sum:1},
                    numRatings:{$sum:'$ratingsQuantity'},
                    avgRating:{$avg:'$ratingsAverage'},
                    avgPrice:{$avg:'$price'},
                    minPrice:{$min:'$price'},
                    maxPrice:{$max:'$price'},

                }

            },
            {
                $sort:{avgPrice:1}
            },
            // {
            //     $match: {_id : {$ne:"EASY"}}

            // }
        ]); 
        res.status(200).json({ 
            status:'success',
            data:{
             stats
            }
        });
});


exports.getMonthlyPlan = catchAsync(async (req,res,next)=>{
   
        
        const year = req.params.year*1;

        const plan = await Tour.aggregate([
            {
                $unwind:'$startDates'
            },
            {
                $match : {

                    startDates:{
                        $gte:new Date(`${year}-01-01`),
                        $lte:new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group:{
                    _id:{$month:'$startDates'},
                    numTourStarts:{$sum:1} ,
                    tours:{$push:'$name'}
                }
            },
            {
               $addFields:{ month :'$_id'}
            },
            {
                $project:{
                    _id:0
                }
            },
            {
                $sort :{numTourStarts:-1}
            },
            {
                $limit:12
            }
        ]);
        res.status(200).json({ 
            status:'success',
            data:{
             plan
            }
        });
    

});
 
exports.getToursWithin=catchAsync(async(req,res,next)=>{
const {distance,latlng,unit}= req.params;
const [lat,lng]  = latlng.split(',');


const radius=unit ==='mi'  ? distance/3963.2   : distance/6378.1;
if(!lat  || !lng){
    next(new AppError('please provide latitude and longitude in the format lat ,lng.',400));
}

const tours = await Tour.find({
    startLocation:{ $geoWithin:{ $centerSphere:[[lng,lat],radius]}}
});

res.status(200).json({
    status:"success",
    results:tours.length,
    data:{
        data:tours
    }
});
});

exports.getDistances=catchAsync(async(req,res,next)=>{
    const {latlng,unit}= req.params;
    const [lat,lng]  = latlng.split(',');

    const multiplier = unit ==='mi'  ?  0.000621371 : 0.001;


  if(!lat  || !lng){
    next(new AppError('please provide latitude and longitude in the format lat ,lng.',400));
   }

   const distances = await Tour.aggregate([
    {
        $geoNear:{
            near:{
                type:'Point',
                coordinates:[lng*1,lat*1]
            },
            distanceField:'distance',
            distanceMultiplier: multiplier
        }
        
    }, 
    {
        $project:{
            distance:1,
            name:1
        }
    }
   ]);

   res.status(200).json({
    status:"success", 
    data:{
        data:distances
    }
});

})