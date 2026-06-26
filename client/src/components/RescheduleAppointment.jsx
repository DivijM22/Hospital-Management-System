import { useState, useRef, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import fetchWithAuth from '../fetchWithAuth';
import AppointmentCard from './AppointmentCard';

const STEPS = ['Select Appointment', 'New Slot', 'Confirm'];

export default function RescheduleAppointment() {
    const { accessToken, setAccessToken } = useOutletContext();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);

    // Step 0 - Appointment
    const [search, setSearch] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Step 1 - Date & Slot
    const [date, setDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null); // { start, end }

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
            // Only show appointments that can actually be rescheduled
            const scheduledAppts = (res.data || []).filter(a => a.status === 'scheduled');
            setAppointments(scheduledAppts);
            if (scheduledAppts.length === 0) setError('No scheduled appointments found for this patient.');
        } catch (e) {
            setError('Failed to search appointments.');
        } finally {
            setLoading(false);
        }
    }

    async function fetchSlots(doctorId, selectedDate) {
        if (!doctorId || !selectedDate) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetchWithAuth({
                url: `${import.meta.env.VITE_SERVER_URL}/doctor/slots/available?doctor_id=${doctorId}&date=${selectedDate}`,
                method: 'GET', accessToken, setAccessToken, navigate,
                options: { withCredentials: true }
            });
            setSlots(res.data || []);
        } catch (e) {
            setError('Failed to fetch slots.');
        } finally {
            setLoading(false);
        }
    }

    async function handleReschedule() {
        setLoading(true);
        setError('');
        try {
            const res = await fetchWithAuth({
                url: `${import.meta.env.VITE_SERVER_URL}/receptionist/appointment/${selectedAppointment.appointment_id}/reschedule`,
                method: 'PATCH', accessToken, setAccessToken, navigate,
                body: {
                    date,
                    start_time: selectedSlot.start,
                    end_time: selectedSlot.end,
                },
                options: { withCredentials: true }
            });
            
            // Your backend throws 409 if the same room isn't available at the new time
            if (!res.success && res.message) {
                 setError(res.message);
                 return;
            }
            
            navigate('/dashboard/receptionist');
        } catch (e) {
            setError('Rescheduling failed. The room or doctor might be booked for this slot.');
        } finally {
            setLoading(false);
        }
    }

    // ─── Side-effects ─────────────────────────────────────────────────────────

    useEffect(() => {
        // Fetch slots automatically when a date is picked in Step 1
        if (step === 1 && selectedAppointment && date) {
            // Note: appointment_view needs to expose doctor_id for this to work
            fetchSlots(selectedAppointment.doctor_id, date);
        }
    }, [date]);

    // ─── Step navigation ──────────────────────────────────────────────────────

    function goNext() { setError(''); setStep(s => s + 1); }
    function goBack() { setError(''); setStep(s => s - 1); }

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Reschedule Appointment</h1>
                    <p className="text-gray-500 text-sm mt-1">Change the date or time of an existing appointment</p>
                </div>

                {/* Stepper */}
                <div className="flex items-center mb-8 gap-0">
                    {STEPS.map((label, i) => (
                        <div key={i} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all
                                    ${i < step ? 'bg-blue-600 border-blue-600 text-white'
                                    : i === step ? 'bg-white border-blue-600 text-blue-600'
                                    : 'bg-white border-gray-200 text-gray-400'}`}>
                                    {i < step ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : i + 1}
                                </div>
                                <span className={`text-xs mt-1 font-medium ${i === step ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />
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
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={searchAppointments}
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Searching...' : 'Search'}
                                </button>
                            </div>

                            {selectedAppointment && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                    <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">Selected Appointment</p>
                                    <AppointmentCard {...selectedAppointment} />
                                </div>
                            )}

                            {appointments.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                                    {appointments.map(a => (
                                        <div
                                            key={a.appointment_id}
                                            onClick={() => {
                                                setSelectedAppointment(a);
                                                // reset slot selections if they change the appointment
                                                setDate('');
                                                setSelectedSlot(null);
                                            }}
                                            className={`cursor-pointer rounded-xl border-2 transition-all ${
                                                selectedAppointment?.appointment_id === a.appointment_id
                                                    ? 'border-blue-500 ring-2 ring-blue-200'
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
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next: Select New Slot →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 1: Select Date & Slot ── */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800">Select New Date & Time</h2>
                            
                            <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-600">
                                Rescheduling for <span className="font-semibold">{selectedAppointment?.doctor_name}</span>.
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">New Appointment Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => {
                                        setDate(e.target.value);
                                        setSelectedSlot(null);
                                        setSlots([]);
                                    }}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {loading && <p className="text-sm text-gray-400 py-2">Loading slots...</p>}

                            {!loading && date && slots.length === 0 && (
                                <p className="text-sm text-gray-400 py-4 text-center">No available slots for this date.</p>
                            )}

                            {slots.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">Available Slots</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                                        {slots.map((slot, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`text-xs py-2 px-2 rounded-lg border font-medium transition-all ${
                                                    selectedSlot?.start === slot.start && selectedSlot?.end === slot.end
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                                                }`}
                                            >
                                                {slot.start.slice(0, 5)} – {slot.end.slice(0, 5)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between pt-2">
                                <button onClick={goBack} className="text-gray-500 text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                    ← Back
                                </button>
                                <button
                                    onClick={goNext}
                                    disabled={!selectedSlot}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next: Confirm →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Confirm & Book ── */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-semibold text-gray-800">Confirm Reschedule</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Old Appointment Details */}
                                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Previous Details</h3>
                                    <SummaryRow label="Date" value={selectedAppointment?.appointment_date?.split('T')[0]} />
                                    <SummaryRow label="Time" value={`${selectedAppointment?.start_time?.slice(0,5)} – ${selectedAppointment?.end_time?.slice(0,5)}`} />
                                </div>

                                {/* New Appointment Details */}
                                <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                                    <h3 className="text-xs font-bold text-blue-500 uppercase mb-3">New Details</h3>
                                    <SummaryRow label="Date" value={date} />
                                    <SummaryRow label="Time" value={`${selectedSlot?.start?.slice(0,5)} – ${selectedSlot?.end?.slice(0,5)}`} />
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-100 mt-2">
                                <SummaryRow label="Patient" value={selectedAppointment?.patient_name} />
                                <SummaryRow label="Doctor" value={selectedAppointment?.doctor_name} />
                                <SummaryRow label="Room" value={`Room ${selectedAppointment?.room_number}`} />
                            </div>

                            <div className="flex justify-between pt-2">
                                <button onClick={goBack} className="text-gray-500 text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                    ← Back
                                </button>
                                <button
                                    onClick={handleReschedule}
                                    disabled={loading}
                                    className="bg-yellow-500 text-white px-8 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Rescheduling...' : '✓ Confirm Reschedule'}
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
        <div className="flex justify-between px-2 py-1.5 text-sm">
            <span className="text-gray-500 font-medium">{label}</span>
            <span className="text-gray-800 font-semibold text-right">{value || '—'}</span>
        </div>
    );
}