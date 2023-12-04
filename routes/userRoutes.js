const express= require("express");
const authController=require('./../controllers/authController');
const userContoller=require('./../controllers/userController');
const router = express.Router();

router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.get('/logout',authController.logout);

router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);


//protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword',authController.updatePassword);
router.get('/me',userContoller.getMe,userContoller.getUser);

router.patch('/updateMe',userContoller.uploadUserPhoto,userContoller.resizeUserPhoto,userContoller.updateMe);

router.delete('/deleteMe',userContoller.deleteMe);  

router.use(authController.restrictTo('admin'));
router.route('/:id').get(userContoller.getUser).patch(userContoller.updateUser).delete(userContoller.deleteUser);
router.route('/').get(userContoller.getallUsers).post(userContoller.createUser);

module.exports=router; 