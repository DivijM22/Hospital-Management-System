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
                where doctor_id=? and appointment_date=?
            `,[doctor_id,date]);
        
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
                where room_id=? and appointment_date=?
            `,[room_id,date]);
        
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

module.exports={bookAppointment};