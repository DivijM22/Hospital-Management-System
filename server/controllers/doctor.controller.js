const {connectionPool}=require('../database_access');

async function getAvailableSlots(req,res){
    const {doctor_id,date}=req.query;
    if(!doctor_id || !date)
        return res.status(400).json({
            success : false,
            message : 'Incomplete credentials'
        });
    const days=['sun','mon','tue','wed','thu','fri','sat'];
    const day=days[new Date(date).getDay()];
    try{
        const [schedules]=await connectionPool.query(`
            select start_time,end_time from doctor_schedule
            where doctor_id=? and day_of_week=?`,[doctor_id,day]);
        if(schedules.length===0)
            return res.status(200).json({
                success : true,
                message : 'No schedules found!',
                data : []
            });
        
        function timeToMinutes(time){
            const [h,m]=time.split(':').map(Number);
            return h*60+m;
        }

        function minutesToTime(totalMinutes){
            const h=Math.floor(totalMinutes/60),m=totalMinutes%60;
            const hours=h.toString().padStart(2,'0');
            const minutes=m.toString().padStart(2,'0');
            return `${hours}:${minutes}:00`;
        }

        const totalSlots=[];
        for(const schedule of schedules){
            var startMinutes=timeToMinutes(schedule['start_time']);
            var endMinutes=timeToMinutes(schedule['end_time']);
            while(startMinutes+15<=endMinutes){
                const start=minutesToTime(startMinutes);
                const end=minutesToTime(startMinutes+15);
                totalSlots.push({start,end});
                startMinutes+=15;
            }
        }

        const [bookedSlots]=await connectionPool.query(`
            select start_time,end_time
            from appointment
            where doctor_id=? and appointment_date=?    
            and status='scheduled'
        `,[doctor_id,date,date]);

        // for all slots, remove those which overlap with booked slots
        const availableSlots=totalSlots.filter(slot=>!bookedSlots.some(bookedSlot=>bookedSlot.start_time<slot.end && bookedSlot.end_time>slot.start));

        return res.status(200).json({
            success : true,
            message : 'Successfully fetched available slots',
            data : availableSlots
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong. Please try again.'
        });
    }
}

async function getDoctors(req,res){
    const {dept}=req.query;
    try{
        var doctors=[];
        if(dept)
            [doctors]=await connectionPool.query(`
                select u.name,u.email,d.specialization,dep.dept_name
                from users u, doctor d, department dep
                where u.user_id=d.doctor_id
                and d.dept_id=dep.dept_id
                and dep.dept_id=?
            `,[dept]);
        else
            [doctors]=await connectionPool.query(`
                select u.name,u.email,d.specialization,dep.dept_name
                from users u, doctor d, department dep
                where u.user_id=d.doctor_id
                and d.dept_id=dep.dept_id
            `);
        return res.status(200).json({
            success : true,
            message : 'Successfully fetched doctors',
            data : doctors
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Some error ocurred. Please try again.'
        });
    }
}

async function getAppointments(req,res){
    const {date,patient_id,status}=req.query;
    const {id : doctor_id}=req.user;
    try{
        var query=`
                select a.appointment_id,u1.name as patient_name,u1.email,u2.name as doctor_name,d.specialization as doctor_specialization,r.room_number,r.room_type,a.start_time,a.end_time,a.appointment_date,a.status
                from users u1, users u2, doctor d, appointment a, room r
                where u1.user_id=a.patient_id
                and u2.user_id=a.doctor_id
                and d.doctor_id=a.doctor_id
                and a.room_id=r.room_id
                and a.doctor_id=?`;
        const params=[doctor_id];

        if(status)
        {
            query+=' and a.status=?';
            params.push(status);
        }
        
        if(date) 
        {
            query+=' and a.appointment_date=?';
            params.push(date);
        }

        if(patient_id)
        {
            query+=' and a.patient_id=?';
            params.push(patient_id);
        }
        
        const [appointments]=await connectionPool.query(query,params);
        const today=new Date();
        today.setHours(0,0,0,0);
        const updatedAppointments=appointments.map(appt=>{
            const derived_status=appt.status;
            const apptDate=new Date(appt.appointment_date);
            apptDate.setHours(0,0,0,0);
            if(apptDate<today && appt.status==='scheduled')
                derived_status='missed';
            return{
                ...appt,
                derived_status
            };
        });
        return res.status(200).json({
            success : true,
            message : 'Successfully fetched appointments',
            data : updatedAppointments
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong. Please try again.'
        });
    }
}

async function updateStatus(req,res){
    const {id : doctor_id}=req.user;
    const {id}=req.params;
    const {status}=req.body;
    if(!['completed','cancelled'].includes(status))
        return res.status(400).json({
            success : false,
            message : 'Invalid status'
        });
    const today=new Date();
    const [appointment]=await connectionPool.query(`
        select appointment_date from appointment where appointment_id=? and doctor_id=?
    `,[id,doctor_id]);
    if(appointment.length===0)
        return res.status(404).json({
            success : false,
            message : 'Appointment not found'
        });
    const date=appointment[0].appointment_date;
    if(today<date && status==='completed')
        return res.status(403).json({
            success : false,
            message : `Can't mark future appointment as completed`
        });
    if(today>date && status==='cancelled')
        return res.status(403).json({
            success : false,
            message : `Can't mark past appointment as cancelled`
        });
    const conn=await connectionPool.getConnection();
    try{
        await conn.beginTransaction();
        const [result]=await conn.query(`
            update appointment set status=? where appointment_id=? and doctor_id=? and status!=?`,[status,id,doctor_id,status]);
        if(result.affectedRows===0)
        {
            await conn.rollback();
            return res.status(404).json({
                success : false,
                message : 'Appointment not found.'
            });
        }
        await conn.query(`insert into audit (appointment_id,action) values (?,?)`,
            [id,`Doctor doctor_id:${doctor_id} marked appointment appointment_id:${id} as ${status}`]
        );
        await conn.commit();
        return res.status(200).json({
            success : true,
            message : 'Successfully updated status'
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

module.exports={getAvailableSlots,getDoctors,getAppointments,updateStatus};