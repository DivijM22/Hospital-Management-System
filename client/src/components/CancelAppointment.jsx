import { useState, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import fetchWithAuth from '../fetchWithAuth';
import AppointmentCard from './AppointmentCard';

const STEPS = ['Select Appointment', 'Confirm Cancel'];

export default function CancelAppointment() {
    const { accessToken, setAccessToken } = useOutletContext();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);

    // Step 0 - Appointment
    const [search, setSearch] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const searchRef = useRef();

    // ─── API helpers ──────────────────────────────────────────────────────────

    async function searchAppointments() {
        if (!search.trim()) { setAppointments([]); return; }
        setLoading(true);
        setError('');
        try {
            const res = await fetchWithAuth({
                url: `${import.meta.env.VITE_SERVER_URL}/receptionist/appointments?patient_name=${encodeURIComponent(search)}`,
                method: 'GET', accessToken, setAccessToken, navigate,
                options: { withCredentials: true }
            });
            // Only show appointments that are currently scheduled
            const scheduledAppts = (res.data || []).filter(a => a.status === 'scheduled');
            setAppointments(scheduledAppts);
            if (scheduledAppts.length === 0) setError('No scheduled appointments found for this patient.');
        } catch (e) {
            setError('Failed to search appointments.');
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel() {
        if(!window.confirm("Are you sure you want to cancel this appointment? This action cannot be undone.")) return;
        
        setLoading(true);
        setError('');
        try {
            const res = await fetchWithAuth({
                url: `${import.meta.env.VITE_SERVER_URL}/receptionist/appointment/${selectedAppointment.appointment_id}/cancel`,
                method: 'PATCH', accessToken, setAccessToken, navigate, body: {},
                options: { withCredentials: true }
            });
            
            if (!res.success && res.message) {
                 setError(res.message);
                 return;
            }
            
            navigate('/dashboard/receptionist');
        } catch (e) {
            setError('Failed to cancel the appointment. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    // ─── Step navigation ──────────────────────────────────────────────────────

    function goNext() { setError(''); setStep(s => s + 1); }
    function goBack() { setError(''); setStep(s => s - 1); }

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Cancel Appointment</h1>
                    <p className="text-gray-500 text-sm mt-1">Locate and cancel an existing scheduled appointment</p>
                </div>

                {/* Stepper */}
                <div className="flex items-center mb-8 gap-0">
                    {STEPS.map((label, i) => (
                        <div key={i} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all
                                    ${i < step ? 'bg-red-600 border-red-600 text-white'
                                    : i === step ? 'bg-white border-red-600 text-red-600'
                                    : 'bg-white border-gray-200 text-gray-400'}`}>
                                    {i < step ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : i + 1}
                                </div>
                                <span className={`text-xs mt-1 font-medium ${i === step ? 'text-red-600' : 'text-gray-400'}`}>{label}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < step ? 'bg-red-600' : 'bg-gray-200'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
                    )}

                    {/* ── STEP 0: Select Appointment ── */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800">Find Appointment</h2>
                            <div className="flex gap-2">
                                <input
                                    ref={searchRef}
                                    placeholder="Type patient name..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && searchAppointments()}
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <button
                                    onClick={searchAppointments}
                                    disabled={loading}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Searching...' : 'Search'}
                                </button>
                            </div>

                            {selectedAppointment && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wide">Selected for Cancellation</p>
                                    <AppointmentCard {...selectedAppointment} />
                                </div>
                            )}

                            {appointments.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                                    {appointments.map(a => (
                                        <div
                                            key={a.appointment_id}
                                            onClick={() => setSelectedAppointment(a)}
                                            className={`cursor-pointer rounded-xl border-2 transition-all ${
                                                selectedAppointment?.appointment_id === a.appointment_id
                                                    ? 'border-red-500 ring-2 ring-red-200'
                                                    : 'border-transparent hover:border-gray-200'
                                            }`}
                                        >
                                            <AppointmentCard {...a} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={goNext}
                                    disabled={!selectedAppointment}
                                    className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next: Review & Cancel →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 1: Confirm Cancel ── */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-semibold text-gray-800">Confirm Cancellation</h2>

                            <div className="bg-red-50 rounded-xl border border-red-100 p-4 mb-4">
                                <p className="text-sm text-red-700">
                                    <strong>Warning:</strong> You are about to permanently cancel the following appointment. The time slot and room will be released back into the available pool.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-100">
                                <SummaryRow label="Patient" value={selectedAppointment?.patient_name} />
                                <SummaryRow label="Doctor" value={selectedAppointment?.doctor_name} />
                                <SummaryRow label="Date" value={selectedAppointment?.appointment_date?.split('T')[0]} />
                                <SummaryRow label="Time" value={`${selectedAppointment?.start_time?.slice(0,5)} – ${selectedAppointment?.end_time?.slice(0,5)}`} />
                                <SummaryRow label="Room" value={`Room ${selectedAppointment?.room_number}`} />
                            </div>

                            <div className="flex justify-between pt-4">
                                <button onClick={goBack} className="text-gray-500 text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                    ← Back
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="bg-red-600 text-white px-8 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Processing...' : 'Cancel Appointment'}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

function SummaryRow({ label, value }) {
    return (
        <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-gray-500 font-medium">{label}</span>
            <span className="text-gray-800 font-semibold text-right">{value || '—'}</span>
        </div>
    );
}