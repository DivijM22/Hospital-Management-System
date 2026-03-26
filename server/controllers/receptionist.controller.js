const {connectionPool}=require('../database_access');

async function bookAppointment(req,res){
    const {id : receptionist_id}=req.user;
    const {patient_id,doctor_id,room_id,date,start_time,end_time}=req.body;
    const days=['sun','mon','tue','wed','thu','fri','sat'];
    const day=days[new Date(date).getDay()];

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

    try{
        const [schedules]=await connectionPool.query(`
            select start_time,end_time 
            from doctor_schedule 
            where doctor_id=? and day_of_week=?`,[doctor_id,day]);
        
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

        const [doctorSlotsBooked]=await connectionPool.query(`
                select start_time,end_time
                from appointment
                where doctor_id=? and appointment_date=? and status!='cancelled'`,[doctor_id,date]);
        
        const availableSlots=totalSlots.filter(slot=> !doctorSlotsBooked.some(bookedSlot=> bookedSlot.start_time<slot.end && bookedSlot.end_time>slot.start));
        const matched=availableSlots.find(slot=> slot.start===start_time && slot.end===end_time);
        if(!matched)
            return res.status(409).json({
                success : false,
                message : 'Invalid slot'
            });
        
        const [roomSlotsBooked]=await connectionPool.query(`
                select start_time,end_time
                from appointment
                where room_id=? and appointment_date=? and status!='cancelled'`,[room_id,date]);
        
        const availableRoomSlots=totalSlots.filter(slot=>!roomSlotsBooked.some(bookedSlot=>bookedSlot.start_time<slot.end && bookedSlot.end_time>slot.start));
        const roomAvailable=availableRoomSlots.find(slot=>slot.start===start_time && slot.end===end_time);
        if(!roomAvailable)
            return res.status(409).json({
                success : false,
                message : 'Invalid slot'
            });
        
        const conn=await connectionPool.getConnection();
        try{
            await conn.beginTransaction();
            const [result]=await conn.query(`
                insert into appointment (patient_id,doctor_id,room_id,start_time,end_time,receptionist_id,appointment_date)
                values (?,?,?,?,?,?,?)`,[patient_id,doctor_id,room_id,start_time,end_time,receptionist_id,date]);
            const appointment_id=result.insertId;
            await conn.query(`
                insert into audit (appointment_id,action) values (?,?)    
            `,[appointment_id,`Booked an appointment for Patient Id:${patient_id} with Doctor ID:${doctor_id}`]);
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
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Some error occurred. Please try again.'
        });
    }
}

async function cancelAppointment(req,res){
    const {id : receptionist_id}=req.user;
    const {id}=req.params;
    const conn=await connectionPool.getConnection();
    try{
        await conn.beginTransaction();
        const [result]=await conn.query(`update appointment set status='cancelled' where appointment_id=? and receptionist_id=?`,
            [id,receptionist_id]);
        if(result.affectedRows===0)
        {
            await conn.rollback();
            return res.status(404).json({
                success : false,
                message : 'Appointment not found!'
            });
        }
        else if(result[0].status!=='scheduled')
        {
            await conn.rollback();
            return res.status(409).json({
                success : false,
                message : `Cannot cancel ${result[0].status} appointment`
            });
        }
        await conn.query(`insert into audit (appointment_id,action) values (?,?)`,
            [id,`Receptionist receptionist_id:${receptionist_id} cancelled appointment appointment_id:${id}`]);
        await conn.commit();
        return res.status(200).json({
            success : true,
            message : 'Successfully cancelled appointment'
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

async function rescheduleAppointment(req,res){
    const {start_time,end_time,date}=req.body;
    const {id}=req.params;
    if(!start_time || !end_time || !date)
    {
        return res.status(400).json({
            success : false,
            message : 'Incomplete credentials'
        });
    }
    const {id : receptionist_id}=req.user;
    
    const conn=await connectionPool.getConnection();
    try{
        await conn.beginTransaction();
        const [appointment]=await conn.query(`select doctor_id,room_id from appointment where appointment_id=?`,[id]);
        if(appointment.length===0)
        {
            await conn.rollback();
            return res.status(404).json({
                success : false,
                message : 'Appointment does not exist'
            });
        }
        else if(appointment[0].status!=='scheduled'){
            await conn.rollback();
            return res.status(409).json({
                success : false,
                message : `Cannot reschedule a ${appointment[0].status} appointment`
            });
        }
        const {doctor_id,room_id}=appointment[0];
        const DAYS=['sun','mon','tue','wed','thu','fri','sat'];
        const day=DAYS[new Date(date).getDay()];
        const [schedules]=await conn.query('select start_time,end_time from doctor_schedule where doctor_id=? and day_of_week=?',[doctor_id,day]);
        const match=schedules.some(s=>s.start_time<end_time && s.end_time>start_time);
        if(!match)
        {
            await conn.rollback();
            return res.status(400).json({
                success : false,
                message : 'Invalid time slot'
            });
        }
        const [doctorConflict]=await conn.query(`
            select 1 from appointment where doctor_id=? and start_time<? and end_time>? and appointment_date=? and appointment_id!=? and status!='cancelled'`,
            [doctor_id,end_time,start_time,date,id]);
        const [roomConflict]=await conn.query(`
            select 1 from appointment where room_id=? and start_time<? and end_time>? and appointment_date=? and appointment_id!=? and status!='cancelled'`,
            [room_id,end_time,start_time,date,id]);
        if(doctorConflict.length>0 || roomConflict.length>0)
        {
            await conn.rollback();
            return res.status(409).json({
                success : false,
                message : 'Conflicting time slot'
            });
        }
        const [result]=await conn.query(`
            update appointment set start_time=?, end_time=?, appointment_date=? where appointment_id=? and receptionist_id=?`,
            [start_time,end_time,date,id,receptionist_id]);
        if(result.affectedRows===0)
        {
            await conn.rollback();
            return res.status(404).json({
                success : false,
                message : 'Appointment not found'
            });
        }
        await conn.query(`insert into audit (appointment_id,action) values (?,?)`,
            [id,`Receptionist receptionist_id:${receptionist_id} rescheduled appointment appointment_id:${id}`]);
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

module.exports={bookAppointment,cancelAppointment,rescheduleAppointment};