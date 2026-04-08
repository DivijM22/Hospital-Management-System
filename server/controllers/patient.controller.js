const {connectionPool}=require('../database_access');

async function getAppointments(req,res){
    const {id : patient_id}=req.user;
    const {status,doctor_id,date,type}=req.query;
    try{
        const params=[patient_id];
        var query=`select u1.name as patient_name, u2.name as doctor_name, d.specialization as doctor_specialization, r.room_number, r.room_type,a.start_time,a.end_time,a.appointment_date, a.appointment_id, a.status
                    from users u1, users u2, doctor d, room r, appointment a
                    where u1.user_id=a.patient_id
                    and u2.user_id=a.doctor_id
                    and d.doctor_id=a.doctor_id
                    and a.room_id=r.room_id
                    and u1.user_id=?`
        if(status){
            if(status==='upcoming'){
                query+=' and a.status=? and timestamp(a.appointment_date,a.start_time)>now()'
                params.push('scheduled');
            }else{
                query+=' and a.status=?'
                params.push(status);
            }
        }
        if(doctor_id){
            query+=' and u2.user_id=?';
            params.push(doctor_id);
        }
        if(date){
            query+=' and a.appointment_date=?';
            params.push(date);
        }
        const [appointments]=await connectionPool.query(query,params);
        return res.status(200).json({
            success : true,
            data : appointments
        });
    }catch(err){
        return res.status(500).json({
            success : false,
            message : 'Something went wrong. Please try again.'
        });
    }
}

async function getAppointmentCount(req,res){
    const {status}=req.params;
    const {id : patient_id}=req.user;
    if(!['scheduled','completed','cancelled','missed','upcoming'].includes(status))
        return res.status(400).json({
            success : false,
            message : 'Invalid request'
        });
    try{
        var data;
        if(status==='missed'){
            const [missed]=await connectionPool.query(`
            select count(*) as appointment_count
            from appointment where patient_id=? and (status='scheduled' and timestamp(appointment_date,end_time)<now())`,[patient_id]);
            data=missed[0];   
        }else if(status==='upcoming'){
            const [upcoming]=await connectionPool.query(`
                select count(*) as appointment_count from appointment where patient_id=? 
                and (status='scheduled' and timestamp(appointment_date,start_time)>now())`,[patient_id]);
            data=upcoming[0];
        }else{
            const [count]=await connectionPool.query(`select count(*) as appointment_count 
            from appointment where patient_id=? and status=?`,[patient_id,status]);
            data=count[0];
        }
        return res.status(200).json({
            success : true,
            message : 'Successfully fetched appointment count',
            data
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong. Please try again'
        });
    }
}

async function getPatients(req,res){
    const {searchQuery,patient_id}=req.query;
    try{
        var query= `select user_id,name,email,gender,blood_group,date_format(dob,'%Y-%m-%d') as dob from patient_view`;
        const params=[];
        const conditions=[];
        if(searchQuery)
        {
            conditions.push('name like ?');
            params.push(`%${searchQuery}%`);
        }
        if(patient_id)
        {
            conditions.push('user_id=?');
            params.push(patient_id);
        }
        query+= ' where ' + conditions.join(' and ');
        const [rows]=await connectionPool.query(query,params);
        
        return res.status(200).json({
            success : true,
            message : 'Successfully fetched patients',
            data : rows
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong. Please try again'
        });
    }   
}

async function makeRequest(req,res){
    const {id : patient_id}=req.user;
    const {doctor_id}=req.body;
    try{
        var [check]=await connectionPool.query(`select 1 from doctor where doctor_id=?`,[doctor_id]);
        if(check.length===0)
            return res.status(400).json({
                success : false,
                message : 'Invalid doctor_id'
            });
        [check]=await connectionPool.query(`select 1 from requests where patient_id=? and doctor_id=? and status='pending'`,[patient_id,doctor_id]);
        if(check.length>0)
            return res.status(409).json({
                success : false,
                message : 'Request already pending.'
            });
        await connectionPool.query(`insert into requests (patient_id,doctor_id) values (?,?)`,[patient_id,doctor_id]);
        return res.status(200).json({
            success : true,
            message : 'Successfully made appointment request'
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong. Please try again'
        });
    }
}

module.exports={getAppointments,getAppointmentCount,getPatients,makeRequest};