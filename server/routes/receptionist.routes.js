const express=require('express');
const {handleAuth}=require('../middleware/auth');
const {bookAppointment}=require('../controllers/receptionist.controller');
const {connectionPool}=require('../database_access');

const router=express.Router();


async function checkAppointmentBook(req,res,next){
    try{
        const {user}=req;
        if(user.role!=='receptionist')
            return res.status(403).json({
                success : false,
                message : 'Not authorized!'
            });
        const {id : receptionist_id}=req.user;
        const {patient_id,doctor_id,room_id,date,start_time,end_time}=req.body;
        if(!patient_id || !doctor_id || !room_id || !date || !start_time || !end_time) 
            return res.status(400).json({
                success : false,
                message : 'Incomplete credentials'
            });
        const [check_patient]=await connectionPool.query('select 1 from patient where patient_id=?',[patient_id]);
        if(check_patient.length==0)
            return res.status(404).json({
                success : false,
                message : 'Patient not found.'
            });
        const [check_doctor]=await connectionPool.query('select 1 from doctor where doctor_id=?',[doctor_id]);
        if(check_doctor.length==0)
            return res.status(404).json({
                success : false,
                message : 'Doctor not found.'
            });
        const [check_receptionist]=await connectionPool.query('select 1 from receptionist where receptionist_id=?',[receptionist_id]);
        if(check_receptionist.length==0)
            return res.status(404).json({
                success : false,
                message : 'Receptionist not found.'
            });
        const [check_room]=await connectionPool.query('select 1 from room where room_id=?',[room_id]);
        if(check_room.length===0)
            return res.status(404).json({
                success : false,
                message : 'Room not found.'
            });
        next();
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Some error ocurred. Please try again.'
        })
    }
}

router.post('/book_appointment',handleAuth,checkAppointmentBook,bookAppointment);

module.exports=router;