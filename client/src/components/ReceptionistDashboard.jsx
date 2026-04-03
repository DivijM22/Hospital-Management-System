import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import fetchWithAuth from '../fetchWithAuth';

export default function ReceptionistDashboard() {
    const { accessToken, setAccessToken } = useOutletContext();
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);

    async function fetchAppointments() {
        const { data } = await fetchWithAuth({
            url: 'http://localhost:3000/api/receptionist/appointments',
            method: 'GET',
            accessToken,
            setAccessToken,
            navigate,
            options: { withCredentials: true }
        });

        setAppointments(data);
    }

    useEffect(() => {
        if (!accessToken) return;
        fetchAppointments();
    }, [accessToken]);

    const today=new Date();
    const todayStr=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');

    const todayAppointments = appointments.filter(
        a => a.appointment_date === todayStr
    );

    const scheduled = appointments.filter(a => a.status === 'scheduled');
    const completed = appointments.filter(a => a.status === 'completed');
    const cancelled = appointments.filter(a => a.status === 'cancelled');

    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Receptionist Dashboard
                </h1>
                <p className="text-gray-500">
                    Manage appointments efficiently
                </p>
            </div>

            {/* 🔥 Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="bg-white p-4 rounded-xl shadow">
                    <p className="text-sm text-gray-500">Scheduled</p>
                    <h2 className="text-2xl font-bold text-blue-600">
                        {scheduled.length}
                    </h2>
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                    <p className="text-sm text-gray-500">Completed</p>
                    <h2 className="text-2xl font-bold text-green-600">
                        {completed.length}
                    </h2>
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                    <p className="text-sm text-gray-500">Cancelled</p>
                    <h2 className="text-2xl font-bold text-red-600">
                        {cancelled.length}
                    </h2>
                </div>

            </div>

            {/* 🔥 Quick Actions */}
            <div className="flex gap-4 flex-wrap">
                <button
                    onClick={() => navigate('/dashboard/receptionist/book')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    Book Appointment
                </button>

                <button
                    onClick={() => navigate('/dashboard/receptionist/cancel')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                    Cancel Appointment
                </button>

                <button
                    onClick={() => navigate('/dashboard/receptionist/reschedule')}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                >
                    Reschedule
                </button>
            </div>

            {/* 🔥 Today’s Appointments */}
            <div className="bg-white p-6 rounded-xl shadow">

                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-semibold">
                        Today’s Appointments
                    </h2>
                    <span className="text-sm text-gray-400">
                        {todayAppointments.length}
                    </span>
                </div>

                {todayAppointments.length === 0 ? (
                    <p className="text-gray-500">
                        No appointments today
                    </p>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto">

                        <table className="min-w-full text-sm">

                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left">Patient</th>
                                    <th className="px-4 py-2 text-left">Doctor</th>
                                    <th className="px-4 py-2">Time</th>
                                    <th className="px-4 py-2">Room</th>
                                    <th className="px-4 py-2">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {todayAppointments.map((a) => (
                                    <tr key={a.appointment_id} className="border-t">

                                        <td className="px-4 py-2">
                                            {a.patient_name}
                                        </td>

                                        <td className="px-4 py-2">
                                            {a.doctor_name}
                                        </td>

                                        <td className="px-4 py-2 text-center">
                                            {a.start_time} - {a.end_time}
                                        </td>

                                        <td className="px-4 py-2 text-center">
                                            {a.room_number}
                                        </td>

                                        <td className="px-4 py-2 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                a.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : a.status === 'cancelled'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {a.status}
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