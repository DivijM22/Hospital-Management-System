require('dotenv').config();
const express=require('express');
const cors=require('cors');
const cookieParser=require('cookie-parser');
const authRouter=require('./routes/auth.routes');
const doctorRouter=require('./routes/doctor.routes')
const receptionistRouter=require('./routes/receptionist.routes');
const patientRouter=require('./routes/patient.routes.js');
const {connectionPool}=require('./database_access');
const {handleAuth,handleAccess}=require('./middleware/auth.js');

const app=express();
const port=3000;

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cors({
    origin : ['http://localhost:5173',process.env.FRONTEND_URL],
    credentials : true
}));
app.use(cookieParser());
app.use('/api/auth',authRouter);
app.use('/api/doctor',doctorRouter);
app.use('/api/receptionist',receptionistRouter);
app.use('/api/patient',patientRouter);

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

app.get('/api/me',handleAuth,async(req,res)=>{
    const {id,role}=req.user;
    try{
        var roleRows=[];
        const [userRows]=await connectionPool.query(`select user_id,name,email from users where user_id=?`,[id]);
        if(role==='patient')
            [roleRows]=await connectionPool.query(`select gender,blood_group,date_format(dob,'%Y-%m-%d') as dob from patient where patient_id=?`,[id]);
        else if(role==='doctor')
            [roleRows]=await connectionPool.query(`select name,dept_name,specialization from doctor_view where user_id=?`,[id]);
        const userData=userRows[0] || {};
        const roleData=roleRows[0] || {};
        return res.status(200).json({
            success : true,
            message : 'Successfully fetched user data',
            data : {
                ...userData,
                ...roleData
            }
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong. Please try again'
        });
    }
});

app.patch('/api/me/edit',handleAuth,async(req,res)=>{
    const formData=req.body;
    if(formData.role==='doctor')
        return res.status(403).json({
            success : false,
            message : 'Not authorized to change userinfo'
        });
    const conn=await connectionPool.getConnection();
    try{
        await conn.beginTransaction();
        await conn.query(`update users set name=?,email=? where user_id=?`,[formData.name,formData.email,formData.user_id]);
        if(formData.blood_group && formData.dob && formData.gender)
            await conn.query(`update patient set blood_group=?, dob=?, gender=? where patient_id=?`,[formData.blood_group,formData.dob.split('T')[0],formData.gender,formData.user_id]);
        await conn.commit();
        return res.status(200).json({
            success : false,
            message : 'Successfully updated user info',
            data : formData
        });
    }catch(err){
        console.log(err);
        await conn.rollback();
        return res.status(500).json({
            success : false,
            message : 'Something went wrong. Please try again.'
        });
    }finally{
        conn.release();
    }
});

app.listen(port,()=>console.log("App is listening on port",port));