const express=require('express');
const router=express.Router();
const {getAvailableSlots}=require('../controllers/doctor.controller');
const {handleAuth}=require('../middleware/auth');

router.post('/get_available_slots',handleAuth,getAvailableSlots);

module.exports=router;