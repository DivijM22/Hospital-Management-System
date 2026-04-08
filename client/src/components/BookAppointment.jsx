import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate,useSearchParams} from 'react-router-dom';
import fetchWithAuth from '../fetchWithAuth';
import PatientCard from './PatientCard';
import DoctorCard from './DoctorCard';

const DEPARTMENTS = [
    { id: 1, name: "Cardiology" },
    { id: 2, name: "Orthopedics" },
    { id: 3, name: "Dermatology" },
];

const STEPS = ['Patient', 'Doctor', 'Slot', 'Room', 'Confirm'];

export default function BookAppointment() {
    const { accessToken, setAccessToken } = useOutletContext();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);

    // Step 1 - Patient
    const [search, setSearch] = useState('');
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null); // full object

    // Step 2 - Department & Doctor
    const [dept, setDept] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null); // { doctor_id, doctor_name }

    // Step 3 - Date & Slot
    const [date, setDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null); // { start, end }

    // Step 4 - Room
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null); // { room_id, room_number, room_type }

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [searchParams] = useSearchParams();
    const request_id = searchParams.get('request_id');
    const searchRef = useRef();

    // ─── API helpers ──────────────────────────────────────────────────────────

    async function searchPatients() {
        if (!search.trim()) { setPatients([]); return; }
        setLoading(true);
        try {
            const res = await fetchWithAuth({
                url: `http://localhost:3000/api/patient/patients?searchQuery=${encodeURIComponent(search)}`,
                method: 'GET', accessToken, setAccessToken, navigate,
                options: { withCredentials: true }
            });
            setPatients(res.data || []);
        } catch (e) {
            setError('Failed to search patients.');
        } finally {
            setLoading(false);
        }
    }

    async function fetchDoctors(deptId) {
        setLoading(true);
        try {
            const url = `http://localhost:3000/api/doctor/doctors${deptId ? `?dept=${deptId}` : ''}`;
            const res = await fetchWithAuth({
                url, method: 'GET', accessToken, setAccessToken, navigate,
                options: { withCredentials: true }
            });
            setDoctors(res.data || []);
        } catch (e) {
            setError('Failed to fetch doctors.');
        } finally {
            setLoading(false);
        }
    }

    async function fetchSlots(doctorId, selectedDate) {
        if (!doctorId || !selectedDate) return;
        setLoading(true);
        try {
            const res = await fetchWithAuth({
                url: `http://localhost:3000/api/doctor/slots/available?doctor_id=${doctorId}&date=${selectedDate}`,
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

    async function fetchRooms(startTime, endTime, selectedDate) {
        setLoading(true);
        try {
            const res = await fetchWithAuth({
                url: `http://localhost:3000/api/receptionist/rooms/available?start_time=${startTime}&end_time=${endTime}&date=${selectedDate}`,
                method: 'GET', accessToken, setAccessToken, navigate,
                options: { withCredentials: true }
            });
            setRooms(res.data || []);
        } catch (e) {
            setError('Failed to fetch rooms.');
        } finally {
            setLoading(false);
        }
    }

    async function handleBook() {
        setLoading(true);
        setError('');
        try {
            await fetchWithAuth({
                url: 'http://localhost:3000/api/receptionist/appointment',
                method: 'POST', accessToken, setAccessToken, navigate,
                body: {
                    patient_id: selectedPatient.user_id,
                    doctor_id: selectedDoctor.doctor_id,
                    room_id: selectedRoom.room_id,
                    date,
                    start_time: selectedSlot.start,
                    end_time: selectedSlot.end,
                    request_id
                },
                options: { withCredentials: true }
            });
            navigate('/dashboard');
        } catch (e) {
            setError('Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    // ─── Side-effects ─────────────────────────────────────────────────────────

    useEffect(() => {
        if (step === 1) fetchDoctors(dept);
    }, [step, dept]);

    useEffect(() => {
        if (step === 2 && selectedDoctor && date) fetchSlots(selectedDoctor.doctor_id, date);
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
                    <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
                    <p className="text-gray-500 text-sm mt-1">Complete each step to schedule a new appointment</p>
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

                    {/* ── STEP 0: Select Patient ── */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800">Select Patient</h2>
                            <div className="flex gap-2">
                                <input
                                    ref={searchRef}
                                    placeholder="Type patient name..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && searchPatients()}
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={searchPatients}
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Searching...' : 'Search'}
                                </button>
                            </div>

                            {selectedPatient && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                    <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">Selected Patient</p>
                                    <PatientCard {...selectedPatient} />
                                </div>
                            )}

                            {patients.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                                    {patients.map(p => (
                                        <div
                                            key={p.user_id}
                                            onClick={() => setSelectedPatient(p)}
                                            className={`cursor-pointer rounded-xl border-2 transition-all ${
                                                selectedPatient?.user_id === p.user_id
                                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                                    : 'border-transparent hover:border-gray-200'
                                            }`}
                                        >
                                            <PatientCard {...p} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={goNext}
                                    disabled={!selectedPatient}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next: Select Doctor →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 1: Select Department & Doctor ── */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800">Select Doctor</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                                <select
                                    value={dept}
                                    onChange={e => { setDept(e.target.value); setSelectedDoctor(null); }}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Departments</option>
                                    {DEPARTMENTS.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            {loading ? (
                                <p className="text-sm text-gray-400 py-4 text-center">Loading doctors...</p>
                            ) : doctors.length === 0 ? (
                                <p className="text-sm text-gray-400 py-4 text-center">No doctors found for this department.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                    {doctors.map(d => (
                                        <div
                                            key={d.user_id}
                                            className={`rounded-xl border-2 transition-all ${
                                                selectedDoctor?.doctor_id === d.user_id
                                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                                    : 'border-transparent'
                                            }`}
                                        >
                                            <DoctorCard
                                                doctor_id={d.user_id}
                                                doctor_name={d.name}
                                                doctor_specialization={d.specialization}
                                                doctor_department={d.dept_name}
                                                setSelectedDoctor={setSelectedDoctor}
                                                button_text="Select"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between pt-2">
                                <button onClick={goBack} className="text-gray-500 text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                    ← Back
                                </button>
                                <button
                                    onClick={goNext}
                                    disabled={!selectedDoctor}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next: Pick Slot →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Select Date & Slot ── */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800">Select Date & Time Slot</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Appointment Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => {
                                        setDate(e.target.value);
                                        setSelectedSlot(null);
                                        setSlots([]);
                                        if (e.target.value) fetchSlots(selectedDoctor.doctor_id, e.target.value);
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
                                    onClick={() => {
                                        fetchRooms(selectedSlot.start, selectedSlot.end, date);
                                        goNext();
                                    }}
                                    disabled={!selectedSlot}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next: Assign Room →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Assign Room ── */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800">Assign Room</h2>
                            <p className="text-sm text-gray-500">
                                Showing rooms available on <span className="font-medium text-gray-700">{date}</span> from{' '}
                                <span className="font-medium text-gray-700">{selectedSlot?.start?.slice(0,5)} – {selectedSlot?.end?.slice(0,5)}</span>
                            </p>

                            {loading ? (
                                <p className="text-sm text-gray-400 py-2">Loading rooms...</p>
                            ) : rooms.length === 0 ? (
                                <p className="text-sm text-gray-400 py-4 text-center">No rooms available for this slot.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {rooms.map(r => (
                                        <button
                                            key={r.room_id}
                                            onClick={() => setSelectedRoom(r)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                                                selectedRoom?.room_id === r.room_id
                                                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                                                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                                            }`}
                                        >
                                            <p className="font-semibold text-gray-800 text-sm">Room {r.room_number}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{r.room_type}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between pt-2">
                                <button onClick={goBack} className="text-gray-500 text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                    ← Back
                                </button>
                                <button
                                    onClick={goNext}
                                    disabled={!selectedRoom}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next: Confirm →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4: Confirm & Book ── */}
                    {step === 4 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-semibold text-gray-800">Confirm Appointment</h2>

                            <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-100">
                                <SummaryRow label="Patient" value={selectedPatient?.name} />
                                <SummaryRow label="Doctor" value={selectedDoctor?.doctor_name} />
                                <SummaryRow label="Date" value={date} />
                                <SummaryRow
                                    label="Time"
                                    value={`${selectedSlot?.start?.slice(0,5)} – ${selectedSlot?.end?.slice(0,5)}`}
                                />
                                <SummaryRow
                                    label="Room"
                                    value={`Room ${selectedRoom?.room_number} (${selectedRoom?.room_type})`}
                                />
                            </div>

                            <div className="flex justify-between pt-2">
                                <button onClick={goBack} className="text-gray-500 text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                    ← Back
                                </button>
                                <button
                                    onClick={handleBook}
                                    disabled={loading}
                                    className="bg-green-600 text-white px-8 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Booking...' : '✓ Confirm Booking'}
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
            <span className="text-gray-800 font-semibold">{value || '—'}</span>
        </div>
    );
}