export default function AppointmentCard(props){
    const {patient_name,doctor_name,doctor_specialization,start_time,end_time,room_number,room_type,appointment_date}=props;
    return <div className="flex flex-col p-2 bg-slate-400 text-white rounded-md text-sm">
        <span>Patient : {patient_name}</span>
        <span>Doctor Name: {doctor_name}</span>
        <span>Doctor Specialization : {doctor_specialization}</span>
        <span>Start Time: {start_time}</span>
        <span>End Time: {end_time}</span>
        <span>Room Number: {room_number}</span>
        <span>Room Type: {room_type}</span>
        <span>Appointment Date: {appointment_date?.split('T')[0]}</span>
    </div>
}