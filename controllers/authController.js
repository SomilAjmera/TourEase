const jwt = require('jsonwebtoken');
const crypto =require('crypto');
const {promisify} = require('util');
const User = require('./../models/userModel');
const Email = require('./../utils/email');

const catchAsync=require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken=id =>{  
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN});

};

const createSendToken=(user,statusCode,res)=>{
    const token = signToken(user._id);

    const cookieOptions ={
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000
        ),
        httpOnly:true
    };

    if(process.env.NODE_ENV === 'production')   cookieOptions.secure = true;

    res.cookie('jwt',token,cookieOptions);

    //remove password from output
    user.password=undefined;

    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    });
}
exports.signup=catchAsync(async (req,res,next)=>{
    // const newUser = await User.create(req.body);   //can also use User.save instead os User.create   //Major flaw in this code  lecture number 129 

    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        role:req.body.role
    });
    const url = `${req.protocol}://${req.get('host')}/me`;

    await new Email(newUser,url).sendWelcome();

    createSendToken(newUser,201,res);
  
 
}
);

exports.login=catchAsync(async(req,res,next)=>{

    const {email,password}=req.body;
    
    if(!email ||!password){
        return next(new AppError('please provide email and password',400));
    }
   
    const user =await User.findOne({email}).select('+password') ;

    const correct = await user.correctPassword(password,user.password);

    if(!user  || !correct){
        return next(new AppError('incorrect email or password',401));
    }
//    console.log(user);
    createSendToken(user,200,res);
});
exports.logout=(req,res)=>{
    res.cookie('jwt','loggedout', {
        expires: new Date(Date.now()+10*1000),
        httpOnly : true
    });
    res.status(200).json({status:'success'});  
};
exports.protect = catchAsync(async(req,res,next)=>{
    //getting token and check if it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if(!token){
        return next( new AppError('you are not logged in ! please login to get access',401));
    }
    //verification token
    const decoded= await promisify(jwt.verify)(token,process.env.JWT_SECRET);
   //check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError('the user belonging to this token no longer exist.',401));
    }

//check if user changed password after the token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(
            new AppError('User recently changrd password! Please login again',401)
        );
    }

//Grant access to protected route
req.user=currentUser;
res.locals.user= currentUser;




    next();
});

// only for rendered pages, so no error!
exports.isLoggedIn = async(req,res,next)=>{
   
    if (req.cookies.jwt) {
        try{

    //verification token
    const decoded= await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);

   //check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next();
    }

//check if user changed password after the token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next();       
    }

//there is a logged in user
//it makes user accesible to templates
  res.locals.user= currentUser;

   return next();
}catch(err){
    return next();
}
}
next();
};



exports.restrictTo = (...roles) => {
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new AppError('You dont have permission to perform this action',403));
        }
        next();

    };

};

exports.forgotPassword = catchAsync(async(req,res,next)=>{

     //get user based on posted email
      
     const user = await User.findOne({email:req.body.email});

     if(!user){ 
        return next(new AppError('there is no user with this email address',404));
     }

     //generate the random reset token
      
     const resetToken = user.createPasswordResetToken();
     await user.save({validateBeforeSave : false});

     //send it to user's email
     
    //const resetURL =`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
 
    //   const message= `forgot your password? submit a patch request with your new password and passwordConfirm to : 
    //   ${resetURL} .\n if you didn't forgot your password ignore this email.`
  try{
    //   await sendEmail({
    //     email: user.email,
    //     subject: 'Your password reset token (valid for 10 min only)',
    //     message
    //   });
    const resetURL =`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

      await new Email(user,resetURL).sendPasswordReset();
       
      res.status(200).json({
        status:'success',
        message:'Token sent to email'
      });
    } catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires=undefined;

        await user.save({validateBeforeSave:false});

        return next(new AppError('there was an error sending this email . try again later !'),500);
    }
});

exports.resetPassword = catchAsync(async(req,res,next)=>{

    //get user based on token
const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

const user = await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}
});


    //if token has not expired and there is user set the new password

if(!user){
    return next(new AppError('Token is invalid or has expired',400))
}

user.password=req.body.password;
user.passwordConfirm=req.body.passwordConfirm;
user.passwordResetToken=undefined;
user.passwordResetExpires=undefined;
await user.save();
    //update changedPasswordAt property for the user


    //log the user in ,send JWT
   createSendToken(user,200,res);

});


exports.updatePassword=catchAsync(async(req,res,next)=>{
    //get user from collection
    const user = await User.findById(req.user.id).select('+password');

    //check if posted current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
        return next(new AppError('your current password is wrong.',401));
    }

//if so update password
user.password=req.body.password;
user.passwordConfirm=req.body.passwordConfirm;

await user.save();

//User.findByIdAndUpdate will not work here as intended because the pre save middleware fynction will not work

//log user in send jwt

createSendToken(user,200,res);

});