const express=require('express');
const router=express.Router();
const {getAvailableSlots,getDoctors,getAppointments,updateStatus}=require('../controllers/doctor.controller');
const {handleAuth}=require('../middleware/auth');

function checkDoctor(req,res,next){
    const {user}=req;
    if(user.role!=='doctor')
        return res.status(403).json({
            success : false,
            message : 'Unauthorized'
        });
    next();
}

router.get('/slots/available',handleAuth,getAvailableSlots);
router.get('/doctors',handleAuth,getDoctors);
router.get('/appointments',handleAuth,checkDoctor,getAppointments);
router.patch('/appointments/:id/status',handleAuth,checkDoctor,updateStatus);

module.exports=router;