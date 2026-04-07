const express=require('express');
const {handleAuth}=require('../middleware/auth');
const {getAppointments,getAppointmentCount,getPatients,makeRequest}=require('../controllers/patient.controller');

const router=express.Router();

function checkPatient(req,res,next){
    const {user}=req;
    if(user.role!=='patient')
        return res.status(403).json({
            success : false,
            message : 'Unauthorized'
        });
    next();
}

router.get('/appointments',handleAuth,checkPatient,getAppointments); // Optional : query param status
router.get('/appointments/count/:status',handleAuth,checkPatient,getAppointmentCount);
router.get('/patients',handleAuth,getPatients);
router.post('/request',handleAuth,checkPatient,makeRequest);

module.exports=router;