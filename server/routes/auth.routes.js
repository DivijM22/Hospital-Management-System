const express=require('express');
const router=express.Router();
const {registerUser,loginUser,refreshUser,logoutUser}=require('../controllers/auth.controller');

router.post('/login',loginUser);
router.post('/register',registerUser);
router.get('/refresh',refreshUser);
router.get('/logout',logoutUser);

module.exports=router;