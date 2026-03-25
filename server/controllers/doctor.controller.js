const {connectionPool}=require('../database_access');

async function getAvailableSlots(req,res){
    const {doctor_id,date}=req.body;
    const days=['sun','mon','tue','wed','thu','fri','sat'];
    const day=days[new Date(date).getDay()];
    try{

        const [schedules]=await connectionPool.query(`
            select start_time,end_time from doctor_schedule
            where doctor_id=? and day_of_week=?    
        `,[doctor_id,day]);
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
            return `${hours}:${minutes}`;
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
        `,[doctor_id,date]);

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

module.exports={getAvailableSlots};