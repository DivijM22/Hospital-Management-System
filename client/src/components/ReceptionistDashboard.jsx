import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import fetchWithAuth from '../fetchWithAuth';
import PatientCard from './PatientCard';
import DoctorCard from './DoctorCard';

export default function ReceptionistDashboard() {
    const { accessToken, setAccessToken } = useOutletContext();
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [requests, setRequests] = useState([]);
    const [enrichedRequests, setEnrichedRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);

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

    async function fetchRequests() {
        const { data } = await fetchWithAuth({
            url: 'http://localhost:3000/api/receptionist/requests?status=pending',
            method: 'GET',
            accessToken,
            setAccessToken,
            navigate,
            options: { withCredentials: true }
        });
        setRequests(data || []);
    }

    // After requests load, fetch patient + doctor details for each
    useEffect(() => {
        if (!requests.length) { setEnrichedRequests([]); return; }

        async function enrichRequests() {
            setRequestsLoading(true);
            try {
                const enriched = await Promise.all(
                    requests.map(async (req) => {
                        const [patientRes, doctorRes] = await Promise.all([
                            fetchWithAuth({
                                url: `http://localhost:3000/api/patient/patients?patient_id=${req.patient_id}`,
                                method: 'GET', accessToken, setAccessToken, navigate,
                                options: { withCredentials: true }
                            }),
                            fetchWithAuth({
                                url: `http://localhost:3000/api/doctor/doctors?doctor_id=${req.doctor_id}`,
                                method: 'GET', accessToken, setAccessToken, navigate,
                                options: { withCredentials: true }
                            })
                        ]);
                        return {
                            ...req,
                            patient: patientRes.data?.[0] || null,
                            doctor: doctorRes.data?.[0] || null,
                        };
                    })
                );
                setEnrichedRequests(enriched);
            } catch (e) {
                console.error('Failed to enrich requests', e);
            } finally {
                setRequestsLoading(false);
            }
        }

        enrichRequests();
    }, [requests]);

    useEffect(() => {
        if (!accessToken) return;
        fetchAppointments();
        fetchRequests();
    }, [accessToken]);


    async function handleRejectRequest(requestId) {
        if (!window.confirm("Are you sure you want to reject this appointment request?")) return;

        try {
            // 🔥 FIX 1: Capture the whole response, don't destructure { data }
            const response = await fetchWithAuth({
                url: `http://localhost:3000/api/receptionist/request/reject`,
                method: 'PATCH',
                body: { id: requestId }, 
                accessToken,
                setAccessToken,
                navigate,
                options: { withCredentials: true }
            });

            // 🔥 FIX 2: Check response.success
            if (response?.success) {
                // Remove from both states instantly so the UI snaps perfectly
                setRequests(prev => prev.filter(r => (r.req_id || r.request_id) != requestId));
                setEnrichedRequests(prev => prev.filter(r => (r.req_id || r.request_id) != requestId));
            } else {
                alert(response?.message || "Failed to reject request");
            }
        } catch (err) {
            console.error("Rejection error:", err);
            alert("An error occurred while rejecting the request.");
        }
    }

    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    const todayAppointments = appointments.filter(a => a.appointment_date === todayStr);
    const scheduled = appointments.filter(a => a.status === 'scheduled');
    const completed = appointments.filter(a => a.status === 'completed');
    const cancelled = appointments.filter(a => a.status === 'cancelled');

    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Receptionist Dashboard</h1>
                <p className="text-gray-500">Manage appointments efficiently</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow">
                    <p className="text-sm text-gray-500">Scheduled</p>
                    <h2 className="text-2xl font-bold text-blue-600">{scheduled.length}</h2>
                </div>
                <div className="bg-white p-4 rounded-xl shadow">
                    <p className="text-sm text-gray-500">Completed</p>
                    <h2 className="text-2xl font-bold text-green-600">{completed.length}</h2>
                </div>
                <div className="bg-white p-4 rounded-xl shadow">
                    <p className="text-sm text-gray-500">Cancelled</p>
                    <h2 className="text-2xl font-bold text-red-600">{cancelled.length}</h2>
                </div>
            </div>

            {/* Quick Actions */}
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

            {/* Today's Appointments */}
            <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-semibold">Today's Appointments</h2>
                    <span className="text-sm text-gray-400">{todayAppointments.length}</span>
                </div>

                {todayAppointments.length === 0 ? (
                    <p className="text-gray-500">No appointments today</p>
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
                                        <td className="px-4 py-2">{a.patient_name}</td>
                                        <td className="px-4 py-2">{a.doctor_name}</td>
                                        <td className="px-4 py-2 text-center">{a.start_time} - {a.end_time}</td>
                                        <td className="px-4 py-2 text-center">{a.room_number}</td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                a.status === 'completed' ? 'bg-green-100 text-green-700'
                                                : a.status === 'cancelled' ? 'bg-red-100 text-red-700'
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

            {/* Requests Section */}
            <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Appointment Requests</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Patients requesting appointments with specific doctors</p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full border border-blue-100">
                        {enrichedRequests.length} pending
                    </span>
                </div>

                {requestsLoading ? (
                    <div className="flex items-center justify-center py-12 text-gray-400 text-sm gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Loading requests...
                    </div>
                ) : enrichedRequests.length === 0 ? (
                    <p className="text-gray-400 text-sm py-8 text-center">No pending requests</p>
                ) : (
                    <div className="space-y-4">
                        {enrichedRequests.map((req, i) => {
                                // Safely grab the ID whether your DB calls it req_id or request_id
                                const currentReqId = req.req_id || req.request_id;

                                return (
                                    <div
                                        key={currentReqId ?? i}
                                        className="border border-gray-100 rounded-xl p-4 bg-gray-50 hover:bg-white hover:shadow-sm transition-all"
                                    >
                                        {/* Request meta */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                Request #{currentReqId ?? i + 1}
                                            </span>
                                            {req.preferred_date && (
                                                <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-lg">
                                                    Preferred: {req.preferred_date}
                                                </span>
                                            )}
                                        </div>

                                        {/* Patient + Doctor side by side */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                            {/* Patient */}
                                            <div>
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                                                    Patient
                                                </p>
                                                {req.patient ? (
                                                    <PatientCard {...req.patient} />
                                                ) : (
                                                    <div className="text-sm text-gray-400 bg-white border border-gray-100 rounded-xl p-4">
                                                        Patient details unavailable
                                                    </div>
                                                )}
                                            </div>

                                            {/* Doctor */}
                                            <div>
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                                                    Requested Doctor
                                                </p>
                                                {req.doctor ? (
                                                    <DoctorCard
                                                        doctor_id={req.doctor.user_id}
                                                        doctor_name={req.doctor.name}
                                                        doctor_specialization={req.doctor.specialization}
                                                        doctor_department={req.doctor.dept_name}
                                                        // We can remove setSelectedDoctor here since the new Approve button handles it!
                                                    />
                                                ) : (
                                                    <div className="text-sm text-gray-400 bg-white border border-gray-100 rounded-xl p-4">
                                                        Doctor details unavailable
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notes if present */}
                                        {req.notes && (
                                            <div className="mt-3 px-3 py-2 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-800">
                                                <span className="font-medium">Note: </span>{req.notes}
                                            </div>
                                        )}

                                        {/* 🔥 NEW: Action Buttons */}
                                        <div className="mt-5 pt-4 border-t border-gray-200 flex gap-3">
                                            <button
                                                onClick={() => navigate('/dashboard/receptionist/book', {
                                                    state: {
                                                        prefill: {
                                                            patient: req.patient,
                                                            doctor: req.doctor,
                                                            request_id: currentReqId
                                                        }
                                                    }
                                                })}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                Approve & Book
                                            </button>
                                            
                                            <button
                                                onClick={() => handleRejectRequest(currentReqId)}
                                                className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-lg font-medium transition-colors"
                                            >
                                                Reject Request
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

        </div>
    );
}