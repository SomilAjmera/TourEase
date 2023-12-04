const mongoose=require('mongoose');
const dotenv=require('dotenv');

dotenv.config({path:'./config.env'});
const app = require('./app'); 



//console.log(app.get('env')); 
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// mongoose.set("strictQuery", false);
mongoose.connect(DB,{
    useNewUrlParser:true, 
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
}).then(()=>{
    console.log('DB connection successful');
}).catch((err)=> console.log(err));

//model schema , tour model , test tour was created here.........which was transferred to model folder=>tourModel.js

const port = process.env.PORT || 3000;
app.listen(port,() => {
    console.log(`app running on ports ${port}......`);
    console.log(process.env.NODE_ENV);
});

    