const mongoose=require('mongoose');
const crypto = require('crypto');
const validator=require("validator");
const bcrypt=require("bcryptjs");
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please tell us your name"]
    },
    email:{
        type:String,
        required:[true,"Please provide your email"],
        unique:true,
        lowercase:true,     //converts email to lowercase
        validate: [validator.isEmail,'please provide a valid email']
    },
    photo:{
        type:String,
        default:'default.jpg'
    },
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'please provide a password'],
        minlength:8,
        select:false

    },
    passwordConfirm:{
        type:String,
        required:[true,'please confirm your password'],
        validate:{
            //this only works on create and save.....as it is a custom validator ansd not on update
            validator: function(el) {
                return el===this.password;
            },
            message:"Passwords are not the same....!"
        }
       
    },
    passwordChangedAt: Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
});

userSchema.pre('save',async function(next){
    //only run this if password was actually modified
    if(!this.isModified('password'))  return next();

    //hash the password with cost of 12
    //hash is an async function so use await
    this.password=await bcrypt.hash(this.password,12);

    //Delete passwordConfirm field
    this.passwordConfirm=undefined;
    next();
});

userSchema.pre('save',function(next){
    if(!this.isModified('password')  || this.isNew) return next();

    this.passwordChangedAt = Date.now()-1000;
    next();
});
userSchema.pre(/^find/,function(next){
    //query middleware run pre a query with find and will show only those who are active
    this.find({active:{$ne:false}});
    next();
})

userSchema.methods.correctPassword = async function(candidatePassword,userPassword){

    return await bcrypt.compare(candidatePassword,userPassword);
};

userSchema.methods.changedPasswordAfter=function(JWTTimestamp){

    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);

        return JWTTimestamp < changedTimestamp;
    }
  


    return false;
}

userSchema.methods.createPasswordResetToken = function(){
   
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken=crypto.createHash('Sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now()+ 10*60*1000;

    return resetToken;

}

const User = mongoose.model('User',userSchema);
 
module.exports=User;