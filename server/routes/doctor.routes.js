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

//Get's all the available time slots of a doctor on given date.
router.get('/slots/available',handleAuth,getAvailableSlots);

//Get all the doctors of a department id. Query parameter 'dept' is required.
router.get('/doctors',handleAuth,getDoctors);

//Gets all appointments of the doctor. Takes query parameters status, date and patient_id to filter those appointments.//
router.get('/appointments',handleAuth,checkDoctor,getAppointments); 

//Updates status of an appointment to either 'cancelled' or 'completed'. Takes appointment id as a search parameter.
router.patch('/appointments/:id',handleAuth,checkDoctor,updateStatus);

module.exports=router;