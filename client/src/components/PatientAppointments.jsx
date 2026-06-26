import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import fetchWithAuth from '../fetchWithAuth';

export default function PatientAppointments() {
    const { accessToken, setAccessToken } = useOutletContext();
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!accessToken) return;

        async function fetchData() {
            const { data } = await fetchWithAuth({
                url: `${import.meta.env.VITE_SERVER_URL}/patient/appointments`,
                accessToken,
                setAccessToken,
                navigate,
                method: 'GET',
                options: { withCredentials: true }
            });

            setAppointments(data);
        }

        fetchData();
    }, [accessToken]);

    return (
        <div className="flex flex-col w-full h-full p-6 gap-6 bg-gray-100">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                    Appointment History
                </h1>
                <p className="text-gray-500 text-sm">
                    Overview of your appointments
                </p>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl shadow-md p-6">

                {/* Title */}
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Appointments
                    </h2>
                    <span className="text-sm text-gray-400">
                        {appointments.length} total
                    </span>
                </div>

                {appointments.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        No appointments found
                    </div>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto border rounded-lg">

                        <table className="min-w-full text-sm text-left">

                            {/* Header */}
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3">Doctor</th>
                                    <th className="px-4 py-3">Specialization</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Start</th>
                                    <th className="px-4 py-3">End</th>
                                    <th className="px-4 py-3">Room</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>

                            {/* Body */}
                            <tbody className="divide-y">

                                {appointments.map((apt, index) => (
                                    <tr key={index} className="hover:bg-gray-50">

                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {apt.doctor_name}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {apt.doctor_specialization}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {apt.appointment_date}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {apt.start_time}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {apt.end_time}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {apt.room_number} ({apt.room_type})
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                                apt.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : apt.status === 'cancelled'
                                                    ? 'bg-red-100 text-red-700'
                                                    : apt.status === 'scheduled'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {apt.status}
                                            </span>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}