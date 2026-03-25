require('dotenv').config();
const express=require('express');
const cors=require('cors');
const cookieParser=require('cookie-parser');
const authRouter=require('./routes/auth.routes');
const doctorRouter=require('./routes/doctor.routes')
const receptionistRouter=require('./routes/receptionist.routes');
const {connectionPool}=require('./database_access');
const {handleAuth,handleAccess}=require('./middleware/auth.js');

const app=express();
const port=3000;

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cors());
app.use(cookieParser());
app.use('/api/auth',authRouter);
app.use('/api/doctor',doctorRouter);
app.use('/api/receptionist',receptionistRouter);

app.get('/patients',handleAuth,handleAccess,async (req,res)=>{
    try{
        const [rows]=await connectionPool.query(`
            select p.patient_id,u.name,u.email,p.gender,p.blood_group,date_format(p.dob,'%d-%m-%Y') as dob
            from patient p, users u 
            where p.patient_id=u.user_id`);
        return res.status(200).json({
            success : true,
            message : 'Successfully fetched patients',
            data : rows
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Some error ocurred. Please try again.'
        });
    }
});

app.listen(port,()=>console.log("App is listening on port",port));