const catchAsync=require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const { Model } = require('mongoose');
const APIFeatures=require('./../utils/apiFeatures');


exports.deleteOne = Model => catchAsync(async (req,res,next)=>{
   
    const doc= await Model.findByIdAndDelete(req.params.id);
     if(!doc){
      return next(new AppError('No document found with that id',404))
  }
      res.status(204).json({
          status:'success',
         data:null
      });
     
});
  
exports.updateOne = Model => catchAsync(async(req,res,next)=>{



    const doc=await Model.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    });
    if(!doc){
        return next(new AppError('No document found with that id',404))
    }
    res.status(200).json({
      status:'success',
      data:{
        data:doc
      }
  });

});


exports.createOne = Model => catchAsync(async(req,res,next)=>
{   //const newTour = new Tour({});
    //newTour.save() 
    //can be madde like this also but we are now making it another way by using special functions applied on Tour.......
    
   // try{
    const doc=await Model.create(req.body);

    res.status(201).json({
        status:'success',
        data:{
            data:doc
        }
    });
} 
);

exports.getOne =(Model,popOptions) => catchAsync(async(req,res,next)=>{
    let query = Model.findById(req.params.id);
    if(popOptions)  query=query.populate(popOptions);
    const doc =await query;

   // const doc = await Model.findById(req.params.id).populate('reviews');
    if(!doc){
        return next(new AppError('No document found with that id',404))
    }
    res.status(200).json({
        status:'success',
        data:{
            data:doc
        }
    }); 

});

exports.getAll = Model =>catchAsync(async (req,res,next)=>{
    //to allow for nested get reviews on tour
    let filter = {}
    if(req.params.tourId)  filter={tour:req.params.tourId};
     //Execute query
      const features =new APIFeatures(Model.find(filter),req.query)
      .filter() 
      .sort()
      .limitFields()
      .paginate();
    //   const doc=await features.query.explain();
      const doc=await features.query;

     res.status(200).json({
         status:'success',
         results:doc.length,
         data:{
             data:doc
         }
     });  
 
 
 
 });

