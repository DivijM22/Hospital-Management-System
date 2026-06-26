import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import fetchWithAuth from '../fetchWithAuth';
import PatientCard from './PatientCard';
import DoctorCard from './DoctorCard';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Trash2, 
  CalendarClock, 
  User, 
  Stethoscope, 
  AlertCircle, 
  RefreshCw,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function ReceptionistDashboard() {
    const { accessToken, setAccessToken } = useOutletContext();
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [requests, setRequests] = useState([]);
    const [enrichedRequests, setEnrichedRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);

    async function fetchAppointments() {
        const { data } = await fetchWithAuth({
            url: `${import.meta.env.VITE_SERVER_URL}/receptionist/appointments`,
            method: 'GET',
            accessToken,
            setAccessToken,
            navigate,
            options: { withCredentials: true }
        });
        setAppointments(data || []);
    }

    async function fetchRequests() {
        const { data } = await fetchWithAuth({
            url: `${import.meta.env.VITE_SERVER_URL}/receptionist/requests?status=pending`,
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
                                url: `${import.meta.env.VITE_SERVER_URL}/patient/patients?patient_id=${req.patient_id}`,
                                method: 'GET', accessToken, setAccessToken, navigate,
                                options: { withCredentials: true }
                            }),
                            fetchWithAuth({
                                url: `${import.meta.env.VITE_SERVER_URL}/doctor/doctors?doctor_id=${req.doctor_id}`,
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
            const response = await fetchWithAuth({
                url: `${import.meta.env.VITE_SERVER_URL}/receptionist/request/reject`,
                method: 'PATCH',
                body: { id: requestId }, 
                accessToken,
                setAccessToken,
                navigate,
                options: { withCredentials: true }
            });

            if (response?.success) {
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
        <div className="p-8 space-y-10 bg-[#fafbfc] min-h-screen w-full">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Receptionist Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage clinical appointments, requests, and schedules efficiently</p>
                </div>
                <div className="bg-white border border-slate-200/60 px-4 py-2.5 rounded-2xl shadow-sm text-sm text-slate-600 font-semibold flex items-center gap-2">
                    <Calendar size={16} className="text-teal-600" />
                    <span>{today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 relative overflow-hidden group hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500" />
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled</p>
                            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{scheduled.length}</h2>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                            <Clock size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 relative overflow-hidden group hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
                            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{completed.length}</h2>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 relative overflow-hidden group hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cancelled</p>
                            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{cancelled.length}</h2>
                        </div>
                        <div className="bg-rose-50 p-3 rounded-2xl text-rose-600">
                            <XCircle size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 flex-wrap">
                <button
                    onClick={() => navigate('/dashboard/receptionist/book')}
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-teal-600/10 hover:shadow-teal-600/20 active:scale-[0.98] transition-all flex items-center gap-2 text-sm"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    Book Appointment
                </button>
                <button
                    onClick={() => navigate('/dashboard/receptionist/cancel')}
                    className="bg-white hover:bg-rose-50/40 border border-rose-200 text-rose-600 px-6 py-3.5 rounded-2xl font-bold hover:shadow-lg hover:shadow-rose-100/50 active:scale-[0.98] transition-all flex items-center gap-2 text-sm"
                >
                    <Trash2 size={18} />
                    Cancel Appointment
                </button>
                <button
                    onClick={() => navigate('/dashboard/receptionist/reschedule')}
                    className="bg-white hover:bg-amber-50/40 border border-amber-200 text-amber-600 px-6 py-3.5 rounded-2xl font-bold hover:shadow-lg hover:shadow-amber-100/50 active:scale-[0.98] transition-all flex items-center gap-2 text-sm"
                >
                    <CalendarClock size={18} />
                    Reschedule
                </button>
            </div>

            {/* Today's Appointments */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Today's Appointments</h2>
                        <p className="text-slate-400 text-xs mt-0.5">Live view of patient visits scheduled for today</p>
                    </div>
                    <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-100">
                        {todayAppointments.length} today
                    </span>
                </div>

                {todayAppointments.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm border border-dashed border-slate-150 rounded-2xl bg-slate-50/30">
                        No appointments scheduled for today.
                    </div>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto pr-1">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0 text-slate-500 font-bold border-b border-slate-100 z-10">
                                <tr>
                                    <th className="px-6 py-3.5 text-left font-semibold">Patient</th>
                                    <th className="px-6 py-3.5 text-left font-semibold">Doctor</th>
                                    <th className="px-6 py-3.5 text-center font-semibold">Time Slot</th>
                                    <th className="px-6 py-3.5 text-center font-semibold">Room</th>
                                    <th className="px-6 py-3.5 text-center font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {todayAppointments.map((a) => (
                                    <tr key={a.appointment_id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-800">{a.patient_name}</td>
                                        <td className="px-6 py-4">{a.doctor_name}</td>
                                        <td className="px-6 py-4 text-center font-medium text-slate-500">{a.start_time.slice(0,5)} - {a.end_time.slice(0,5)}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-teal-600">Room {a.room_number}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border inline-block ${
                                                a.status === 'completed' 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : a.status === 'cancelled' 
                                                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                                                        : 'bg-blue-50 text-blue-700 border-blue-100'
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
            <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Appointment Requests</h2>
                        <p className="text-slate-400 text-xs mt-0.5">Patients requesting appointments with specific doctors</p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
                        {enrichedRequests.length} pending
                    </span>
                </div>

                {requestsLoading ? (
                    <div className="flex items-center justify-center py-16 text-slate-400 text-sm gap-2">
                        <RefreshCw className="animate-spin w-5 h-5 text-teal-600" />
                        <span>Loading pending requests...</span>
                    </div>
                ) : enrichedRequests.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-sm border border-dashed border-slate-150 rounded-2xl bg-slate-50/30">
                        No pending appointment requests.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {enrichedRequests.map((req, i) => {
                                const currentReqId = req.req_id || req.request_id;

                                return (
                                    <div
                                        key={currentReqId ?? i}
                                        className="border border-slate-100 rounded-3xl p-6 bg-slate-50/30 hover:bg-white hover:shadow-lg hover:border-teal-500/10 transition-all duration-300"
                                    >
                                        {/* Request meta */}
                                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                Request #{currentReqId ?? i + 1}
                                            </span>
                                            {req.preferred_date && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200/60 rounded-xl text-xs text-slate-600 font-semibold shadow-sm">
                                                    <Calendar size={12} className="text-teal-600" />
                                                    <span>Preferred: {req.preferred_date}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Patient + Doctor side by side */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                            {/* Patient */}
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                                                    Patient Profile
                                                </p>
                                                {req.patient ? (
                                                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-500/10 transition-colors">
                                                        <PatientCard {...req.patient} />
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-slate-400 bg-white border border-slate-100 rounded-2xl p-5 text-center">
                                                        Patient details unavailable
                                                    </div>
                                                )}
                                            </div>

                                            {/* Doctor */}
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                                    Requested Doctor
                                                </p>
                                                {req.doctor ? (
                                                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-emerald-500/10 transition-colors">
                                                        <DoctorCard
                                                            doctor_id={req.doctor.user_id}
                                                            doctor_name={req.doctor.name}
                                                            doctor_specialization={req.doctor.specialization}
                                                            doctor_department={req.doctor.dept_name}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-slate-400 bg-white border border-slate-100 rounded-2xl p-5 text-center">
                                                        Doctor details unavailable
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notes if present */}
                                        {req.notes && (
                                            <div className="mt-5 px-4 py-3 bg-amber-50 border border-amber-100/50 rounded-2xl text-sm text-amber-800 flex items-start gap-2">
                                                <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                <p>
                                                    <span className="font-bold">Patient Note: </span>
                                                    {req.notes}
                                                </p>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="mt-6 pt-5 border-t border-slate-100 flex gap-4">
                                            <button
                                                onClick={() => navigate(`/dashboard/receptionist/book?request_id=${currentReqId}`, {
                                                    state: {
                                                        prefill: {
                                                            patient: req.patient,
                                                            doctor: req.doctor,
                                                            request_id: currentReqId
                                                        }
                                                    }
                                                })}
                                                className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-3 rounded-2xl font-bold transition-all duration-200 shadow-lg shadow-teal-600/10 hover:shadow-teal-600/20 flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                                            >
                                                <Plus size={16} strokeWidth={2.5} />
                                                Approve & Book
                                            </button>
                                            
                                            <button
                                                onClick={() => handleRejectRequest(currentReqId)}
                                                className="flex-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50/40 py-3 rounded-2xl font-bold transition-all duration-200 text-sm active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                <XCircle size={16} />
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