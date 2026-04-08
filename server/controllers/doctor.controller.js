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
        const now=new Date();
        const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        const isToday = (date === todayStr);
        // Convert current time to minutes for easy math (e.g., 2:30 PM = 14 * 60 + 30 = 870)
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const totalSlots=[];
        for(const schedule of schedules){
            var startMinutes=timeToMinutes(schedule['start_time']);
            var endMinutes=timeToMinutes(schedule['end_time']);
            while(startMinutes+15<=endMinutes){
            if (!isToday || startMinutes >= currentMinutes) {
                        const start = minutesToTime(startMinutes);
                        const end = minutesToTime(startMinutes + 15);
                        totalSlots.push({start, end});
                    }
                    startMinutes += 15;
            }
        }

        const [bookedSlots]=await connectionPool.query(`
            select start_time,end_time
            from appointment
            where doctor_id=? and appointment_date=?    
            and status='scheduled'
        `,[doctor_id,date]);

        // for all slots, remove those which overlap with booked slots
        const availableSlots=totalSlots.filter(slot=>!bookedSlots.some(bookedSlot=>(bookedSlot.start_time<slot.end && bookedSlot.end_time>slot.start)));

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
    const {dept,searchQuery,doctor_id}=req.query;
    try{
        var query='select * from doctor_view';
        const conditions=[];
        const params=[];
        if(searchQuery)
        {
            conditions.push('(name like ? or specialization like ?)');
            params.push(`%${searchQuery}%`,`%${searchQuery}%`);
        }
        if(dept){
            conditions.push('dept_id=?');
            params.push(dept);
        }
        if(doctor_id){
            conditions.push('user_id=?');
            params.push(doctor_id);
        }
        if(conditions.length>0)
            query+= ' where ' + conditions.join(' and ');
        const [rows]=await connectionPool.query(query,params);
        return res.status(200).json({
            success : true,
            message : 'Successfully fetched doctors',
            data : rows
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
    if(status)
        if(!['scheduled','completed','cancelled','past'].includes(status))
            return res.status(400).json({
                success : false,
                message : 'Invalid status'
            })
    try{
        var query=`
                select a.appointment_id,u1.name as patient_name,u1.email,u2.name as doctor_name,
                d.specialization as doctor_specialization,r.room_number,r.room_type,a.start_time,
                a.end_time,DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointment_date,a.status
                from users u1, users u2, doctor d, appointment a, room r
                where u1.user_id=a.patient_id
                and u2.user_id=a.doctor_id
                and d.doctor_id=a.doctor_id
                and a.room_id=r.room_id
                and a.doctor_id=?`;
        const params=[doctor_id];
        if(status)
        {
            if(status==='past' && !date){
                query+=' and a.appointment_date<curdate()'
            }else if(status!=='past'){
                query+=' and a.status=?';
                params.push(status);
            }
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
        query+=' order by a.appointment_date asc';
        const [appointments]=await connectionPool.query(query,params);
        const today=new Date();
        const todayStr=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
        const updatedAppointments=appointments.map(appt=>{
            var derived_status=appt.status;
            const d = appt.appointment_date;
            if(appt.appointment_date<todayStr && appt.status==='scheduled') derived_status='missed';
            return {
                ...appt,
                derived_status
            }
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
    const todayStr=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
    try{
        const [appointment]=await connectionPool.query(`
            select appointment_date,status from appointment where appointment_id=? and doctor_id=?
        `,[id,doctor_id]);
        if(appointment.length===0)
            return res.status(404).json({
                success : false,
                message : 'Appointment not found'
            });
        const appointmentStr=new Date(appointment[0].appointment_date).toISOString().split('T')[0];
        const currentStatus=appointment[0].status;
        if(currentStatus!=='scheduled')
            return res.status(409).json({
                success : false,
                message : `Can't update status`
            });
            
        if(todayStr<appointmentStr && status==='completed')
            return res.status(403).json({
                success : false,
                message : `Can't mark future appointment as completed`
            });
        if(todayStr>appointmentStr && status==='cancelled')
            return res.status(403).json({
                success : false,
                message : `Can't mark past appointment as cancelled`
            });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong. Please try again.'
        });
    }
    var conn;
    try{
        conn=await connectionPool.getConnection();
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

async function getSchedule(req,res){
    const {doctor_id}=req.params;
    try{
        const [rows]=await connectionPool.query(`
        select start_time,end_time,day_of_week from doctor_schedule where doctor_id=?`,[doctor_id]);
        return res.status(200).json({
            success : true,
            message : 'Successfully fetched schedule',
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

async function getAvailableDoctors(req,res){
    const {start_time,end_time,date,dept_id}=req.query;
    if(!start_time || !end_time || !date)
        return res.status(400).json({
            success : false,
            message : 'Query params- start_time, end_time, date required'
        });
    const DAYS=['sun','mon','tue','wed','thu','fri','sat','sun'];
    const day = DAYS[new Date(date + 'T00:00:00').getDay()];
    try{
        var query=`select * from doctor_view where exists (
                select 1 from doctor_schedule ds
                where ds.day_of_week=?
                and (ds.start_time<=? and ds.end_time>=?)
                and ds.doctor_id=user_id) 
                and not exists (
                select 1 from appointment a
                where a.doctor_id=user_id
                and a.appointment_date=?
                and (a.start_time<? and a.end_time>?))`;
        const params=[day,start_time,end_time,date,end_time,start_time];
        if(dept_id)
        {
            query+=' and dept_id=?';
            params.push(dept_id);
        }
        const [rows]=await connectionPool.query(query,params);
        return res.status(200).json({
            success : true,
            message : 'Successfully fetched available doctors',
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

module.exports={getAvailableSlots,getDoctors,getAppointments,updateStatus,getSchedule,getAvailableDoctors};