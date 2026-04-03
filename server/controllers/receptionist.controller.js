const {connectionPool}=require('../database_access');

async function bookAppointment(req,res){
    const {id : receptionist_id}=req.user;
    const {patient_id,doctor_id,room_id,date,start_time,end_time}=req.body;
    const days=['sun','mon','tue','wed','thu','fri','sat'];
    const day=days[new Date(date).getDay()];
    const conn=await connectionPool.getConnection();
    try{
        await conn.beginTransaction();
        const [result]=await conn.query(`
            insert into appointment (patient_id,doctor_id,room_id,start_time,end_time,receptionist_id,appointment_date)
            select ?,?,?,?,?,?,?
            where exists ( select 1 from doctor_schedule 
                where doctor_id=? and day_of_week=? 
                and start_time<? and end_time>?
            ) and not exists ( select 1 from appointment
                where doctor_id=? and appointment_date=? and start_time<? and end_time>? and status='scheduled'
            ) and not exists ( select 1 from appointment
                where room_id=? and appointment_date=? and start_time<? and end_time>? and status='scheduled')`,
            [patient_id,doctor_id,room_id,start_time,end_time,receptionist_id,date,doctor_id,day,end_time,start_time,doctor_id,date,end_time,start_time,room_id,date,end_time,start_time]);
        if(result.affectedRows===0)
        {
            await conn.rollback();
            return res.status(409).json({
                success : false,
                message : 'No available slot found.'
            });
        }
        const appointment_id=result.insertId;
        await conn.query(`
            insert into audit (appointment_id,action) values (?,?)    
        `,[appointment_id,`Booked an appointment for Patient patient_id:${patient_id} with Doctor doctor_id:${doctor_id} by Receptionist receptionist_id:${receptionist_id}`]);
        await conn.commit();

        return res.status(200).json({
            success : true,
            message : 'Successfully booked appointment'
        });
    }catch(err){
        await conn.rollback();
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Some error occured while making appointment. Please try again.'
        });
    }finally{
        conn.release();
    }
}

async function getAppointments(req,res){
    const {doctor_name,patient_name,appointment_date,room_number}=req.query;
    var query="select * from appointment_view";
    const params=[];
    const conditions=[];
    
    if(doctor_name){
        conditions.push('doctor_name like ?');
        params.push(`%${doctor_name}%`);
    }

    if(patient_name){
        conditions.push('patient_name like ?');
        params.push(`%${patient_name}%`);
    }

    if(appointment_date){
        conditions.push('appointment_date = ?');
        params.push(appointment_date);
    }

    if(room_number){
        conditions.push('room_number=?');
        params.push(room_number);
    }

    if(conditions.length>0) query+= ' where ' + conditions.join(' and ');

    try{
        const [results]=await connectionPool.query(query,params);
        return res.status(200).json({
            success : true,
            message : 'Successfully fetched appointments',
            data : results
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong. Please try again.'
        });
    }
}

async function cancelAppointment(req,res){
    const {id}=req.params;
    const {id : receptionist_id}=req.user;
    const conn=await connectionPool.getConnection();
    try{
        await conn.beginTransaction();
        const [result]=await conn.query(`
            update appointment set status='cancelled' 
            where appointment_id=? and receptionist_id=? and status='scheduled' 
            and date_format(appointment_date,'%Y-%m-%d')>=curdate()  
        `,[id,receptionist_id]);
        if(result.affectedRows===0)
        {
            await conn.rollback();
            return res.status(409).json({
                success : false,
                message : 'Appointment not found or cannot be cancelled.'
            });
        }
        await conn.query(`insert into audit (appointment_id,action) values (?,?)`,
            [id,`Appontment appointment_id:${id} cancelled by receptionist receptionist_id:${receptionist_id}`]
        );
        await conn.commit();
        return res.status(200).json({
            success : true,
            message : 'Appointment cancelled successfully'
        });
    }catch(err){
        await conn.rollback();
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong. Please try again.'
        });
    }finally{
        conn.release();
    }
}

// rescheduling using same doctor and room id to keep logic simple
async function rescheduleAppointment(req,res){
    const {id}=req.params;
    const {id : receptionist_id}=req.user;
    const {start_time,end_time,date}=req.body;
    if(!start_time || !end_time || !date)
        return res.status(400).json({
            success : false,
            message : 'Incomplete credentials'
        });
    if(start_time>=end_time)
        return res.status(400).json({
            success : false,
            message : 'Invalid time range'
        });
    const conn=await connectionPool.getConnection();
    try{
        await conn.beginTransaction();
        const [appointment]=await conn.query(`select doctor_id,room_id,patient_id from appointment where appointment_id=? and status='scheduled'`,[id]);
        if(appointment.length===0){
            await conn.rollback();
            return res.status(409).json({
                success : false,
                message : 'Appointment not found or cannot be rescheduled.'
            });
        }
        const {doctor_id,room_id,patient_id}=appointment[0];
        const DAYS=['sun','mon','tue','wed','thu','fri','sat'];
        const day=DAYS[new Date(date).getDay()];
        const [schedules]=await conn.query(`select start_time,end_time from doctor_schedule where doctor_id=? and day_of_week=?`,[doctor_id,day]);
        const matched=schedules.some(s=>s.start_time<end_time && s.end_time>start_time);

        if(!matched)
        {
            await conn.rollback();
            return res.status(409).json({
                success : false,
                message : 'Doctor not available'
            });
        }

        const [result]=await conn.query(`
            update appointment set start_time=?, end_time=?, appointment_date=? 
            where appointment_id=?
            and not exists ( select 1 from (
                select 1 from appointment 
                where doctor_id=? 
                and appointment_date=?
                and appointment_id!=?
                and status='scheduled'
                and start_time<? and end_time>?) as temp1)
            and not exists ( select 1 from (
                select 1 from appointment
                where room_id=?
                and appointment_date=?
                and appointment_id!=?
                and status='scheduled'
                and start_time<? and end_time>?) as temp2)`
        ,[start_time,end_time,date,id,doctor_id,date,id,end_time,start_time,room_id,date,id,end_time,start_time]);
        if(result.affectedRows===0)
        {
            await conn.rollback();
            return res.status(409).json({
                success : false,
                message : 'Invalid time slot'
            });
        }
        await conn.query(`insert into audit (appointment_id,action) values (?,?)`,[id,
        `Rescheduled appointment for Patient patient_id:${patient_id} by Receptionist receptionist_id:${receptionist_id} to Date: ${date} Time: ${start_time} - ${end_time}`]);
        await conn.commit();
        return res.status(200).json({
            success : true,
            message : 'Successfully rescheduled appointment'
        });
    }catch(err){
        await conn.rollback();
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong. Please try again.'
        });
    }finally{
        conn.release();
    }
}

async function getAvailableRooms(req,res){
    const {start_time,end_time,date}=req.query;
    if(!start_time || !end_time || !date)
        return res.status(400).json({
            success : false,
            message : 'Mandatory query params start_time, end_time and date not provided'
        });
    try{
        const [rows]=await connectionPool.query(`
        select r.room_id,r.room_number,r.room_type 
        from room r where not exists (
            select 1 from appointment a 
            where a.room_id=r.room_id
            and a.status='scheduled'
            and (a.appointment_date=? and (a.start_time<? and a.end_time>?)))`,[date,end_time,start_time]);
        return res.status(200).json({
            success : true,
            message : 'Successfully fetched rooms',
            data : rows
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong. Please try again.'
        });
    }
}

module.exports={bookAppointment,cancelAppointment,rescheduleAppointment,getAppointments,getAvailableRooms};