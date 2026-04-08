export default function DoctorCard(props){
    const {doctor_name,doctor_specialization,doctor_department,setSelectedDoctor,doctor_id, button_text,onRequest}=props;
    return (
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="font-semibold text-lg text-gray-800">
                {doctor_name}
            </h2>
            <p className="text-sm text-blue-600 font-medium">
                {doctor_specialization}
            </p>
            <p className="text-sm text-gray-500 mt-2">
                Department: {doctor_department}
            </p>
            <button onClick={e=>setSelectedDoctor({
                doctor_id,
                doctor_name
            })} className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                {button_text}
            </button>
            {
                onRequest && 
                <button onClick={()=>onRequest(doctor_id)} className="mt-4 w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                    Request Appointment
                </button>
            }
        </div>
    );
}