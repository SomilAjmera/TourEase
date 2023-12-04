const fs = require("fs");
const User=require('./../models/userModel');
const catchAsync=require('./../utils/catchAsync');
const AppError = require("../utils/appError");
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//     destination:(req,file,cb) =>{
//         cb(null,'public/img/users');
//     },
//     filename:(req,file,cb) =>{
//         //user-112jgh345-1234342.jpeg
//         const ext =file.mimetype.split('/')[1];
//         cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });


//this way image is stored as buffer
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
       


exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req,res,next) => {
  if(!req.file) return next();

  req.file.filename= `user-${req.user.id}-${Date.now()}.jpeg`;

 await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/users/${req.file.filename}`);
  
  next();
});

//const =JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/users.json`));

const filterObj=(obj,...allowedFields)=>{
    const newObj={};
    Object.keys(obj).forEach(el =>{
        if(allowedFields.includes(el))  newObj[el]=obj[el];
    });
    return newObj;
};
// exports.getallUsers = catchAsync(async(req,res,next)=>{
//     const users=await User.find();
//     res.status(200).json({
//         status:'success',
//         results:users.length,
//         data:{
//            users
//         }
// }); 
// });
exports.getallUsers = factory.getAll(User);

exports.getMe = (req,res,next) =>
{
    req.params.id = req.user.id;

    next();
};
exports.updateMe = async (req,res,next)=>{
    //create error if user post password data

    if(req.body.password  || req.body.passwordConfirm){
        return next(new AppError('this route is not for password update please use /updateMyPassword',400));
    }
    //filtered out unwanted field names that are not allowed to be updated
    const filteredBody = filterObj(req.body , 'name' , 'email');
    if(req.file)  filteredBody.photo = req.file.filename; 

    //update user document
   //dont want all datA OF BODY TO BE UPDATED as someone can change role to admin then
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    });
   
     
    res.status(200).json({
        status:'success',
        data:{
            user:updatedUser
        }
    });
};
exports.deleteMe=catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false})

    res.status(204).json({
        status:'success',
        data:null
    })
})

exports.getUser = factory.getOne(User);
// exports.getUser = (req,res)=>{
//     res.status(500).json({
//         status:'error',
//         message:"this route is not yet defined"
//     });
// };

//Do not update passwords with this
exports.updateUser = factory.updateOne(User);
// exports.updateUser = (req,res)=>{
//     res.status(500).json({
//         status:'error',
//         message:"this route is not yet defined"
//     });
// };
exports.deleteUser = factory.deleteOne(User);

// exports.deleteUser = (req,res)=>{
//     res.status(500).json({
//         status:'error',
//         message:"this route is not yet defined"
//     });
// };
exports.createUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        message:"this route is not yet defined please use /SignUp instead"
    });
};
