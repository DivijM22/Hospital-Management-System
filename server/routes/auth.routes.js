const express=require('express');
const router=express.Router();
const {registerUser,loginUser,refreshUser,logoutUser,registerStaff}=require('../controllers/auth.controller');
const {handleAuth,checkAdmin}=require('../middleware/auth');

router.post('/login',loginUser);
router.post('/register',registerUser);
router.post('/register/staff',handleAuth,checkAdmin,registerStaff);
router.get('/refresh',refreshUser);
router.get('/logout',logoutUser);

module.exports=router;