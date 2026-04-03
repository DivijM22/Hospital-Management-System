export default function AppointmentCard(props) {
    const {
        patient_name,
        doctor_name,
        doctor_specialization,
        start_time,
        end_time,
        room_number,
        room_type,
        appointment_date,
        tabular,
        status
    } = props;

    const formattedDate = appointment_date?.split('T')[0];

    const statusColor = {
        confirmed: "bg-green-100 text-green-700",
        pending: "bg-yellow-100 text-yellow-700",
        cancelled: "bg-red-100 text-red-700"
    };

    return (
        <>
            {!tabular ? (
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-800">
                            {patient_name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColor[status] || "bg-gray-100 text-gray-600"}`}>
                            {status || "unknown"}
                        </span>
                    </div>

                    {/* Doctor */}
                    <p className="text-sm text-blue-600 font-medium">
                        {doctor_name} • {doctor_specialization}
                    </p>

                    {/* Divider */}
                    <div className="border-t my-3"></div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                        <span>Date</span>
                        <span className="font-medium text-gray-800">{formattedDate}</span>

                        <span>Time</span>
                        <span className="font-medium text-gray-800">
                            {start_time} - {end_time}
                        </span>

                        <span>Room</span>
                        <span className="font-medium text-gray-800">
                            {room_number}
                        </span>

                        <span>Type</span>
                        <span className="font-medium text-gray-800">
                            {room_type}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">

                    <table className="min-w-full text-sm text-left">

                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Patient</th>
                                <th className="px-4 py-3">Doctor</th>
                                <th className="px-4 py-3">Specialization</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Start</th>
                                <th className="px-4 py-3">End</th>
                                <th className="px-4 py-3">Room</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            <tr className="hover:bg-gray-50">
                                <td className="px-4 py-3">{patient_name}</td>
                                <td className="px-4 py-3">{doctor_name}</td>
                                <td className="px-4 py-3 text-blue-600 font-medium">
                                    {doctor_specialization}
                                </td>
                                <td className="px-4 py-3">{formattedDate}</td>
                                <td className="px-4 py-3">{start_time}</td>
                                <td className="px-4 py-3">{end_time}</td>
                                <td className="px-4 py-3">{room_number}</td>
                                <td className="px-4 py-3">{room_type}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[status] || "bg-gray-100 text-gray-600"}`}>
                                        {status}
                                    </span>
                                </td>
                            </tr>
                        </tbody>

                    </table>
                </div>
            )}
        </>
    );
}