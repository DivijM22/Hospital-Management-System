import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import fetchWithAuth from '../fetchWithAuth';
import PatientCard from './PatientCard';
import DoctorCard from './DoctorCard';
import { Calendar, Clock, Check, ArrowLeft, ArrowRight, Shield, AlertCircle, RefreshCw } from 'lucide-react';

const DEPARTMENTS = [
    { id: 1, name: "Cardiology" },
    { id: 2, name: "Orthopedics" },
    { id: 3, name: "Dermatology" },
];

const STEPS = ['Patient', 'Doctor', 'Slot', 'Room', 'Confirm'];

export default function BookAppointment() {
    const { accessToken, setAccessToken } = useOutletContext();
    const navigate = useNavigate();
    const location = useLocation();

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

    // Prefill states
    const [isPrefilled, setIsPrefilled] = useState(false);
    const [prefillLoading, setPrefillLoading] = useState(false);

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

    // ─── Prefill and Fallback Side-Effect ───────────────────────────────────────

    useEffect(() => {
        if (!accessToken) return;

        // Option A: Prefill from routing state
        if (location.state?.prefill) {
            const { patient, doctor } = location.state.prefill;
            if (patient) setSelectedPatient(patient);
            if (doctor) {
                setSelectedDoctor({
                    doctor_id: doctor.user_id,
                    doctor_name: doctor.name
                });
            }
            setIsPrefilled(true);
            setStep(2); // Leap straight to slot picker!
        }
        // Option B: Fallback for refresh - fetch requests & details
        else if (request_id) {
            async function loadPrefillFromRequest() {
                setPrefillLoading(true);
                setError('');
                try {
                    // 1. Get pending requests
                    const reqsRes = await fetchWithAuth({
                        url: 'http://localhost:3000/api/receptionist/requests?status=pending',
                        method: 'GET', accessToken, setAccessToken, navigate,
                        options: { withCredentials: true }
                    });
                    const pendingRequests = reqsRes.data || [];
                    const matchedReq = pendingRequests.find(r => (r.req_id || r.request_id) == request_id);
                    
                    if (matchedReq) {
                        // 2. Fetch patient and doctor details
                        const [patientRes, doctorRes] = await Promise.all([
                            fetchWithAuth({
                                url: `http://localhost:3000/api/patient/patients?patient_id=${matchedReq.patient_id}`,
                                method: 'GET', accessToken, setAccessToken, navigate,
                                options: { withCredentials: true }
                            }),
                            fetchWithAuth({
                                url: `http://localhost:3000/api/doctor/doctors?doctor_id=${matchedReq.doctor_id}`,
                                method: 'GET', accessToken, setAccessToken, navigate,
                                options: { withCredentials: true }
                            })
                        ]);

                        const patientObj = patientRes.data?.[0] || null;
                        const doctorObj = doctorRes.data?.[0] || null;

                        if (patientObj) setSelectedPatient(patientObj);
                        if (doctorObj) {
                            setSelectedDoctor({
                                doctor_id: doctorObj.user_id,
                                doctor_name: doctorObj.name
                            });
                        }
                        setIsPrefilled(true);
                        setStep(2);
                    } else {
                        setError('Could not find the associated appointment request. You can book manually.');
                    }
                } catch (e) {
                    console.error('Failed to load prefill details', e);
                    setError('Failed to auto-load appointment request details. You can book manually.');
                } finally {
                    setPrefillLoading(false);
                }
            }
            loadPrefillFromRequest();
        }
    }, [location.state, request_id, accessToken]);

    function handleResetPrefill() {
        setSelectedPatient(null);
        setSelectedDoctor(null);
        setIsPrefilled(false);
        setStep(0);
        navigate('/dashboard/receptionist/book', { replace: true });
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

    if (prefillLoading) {
        return (
            <div className="min-h-screen bg-[#fafbfc] flex flex-col items-center justify-center gap-4 text-slate-500">
                <RefreshCw className="animate-spin text-teal-600" size={32} />
                <p className="text-sm font-medium">Retrieving appointment request details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafbfc] py-10 px-6 w-full">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Book Appointment</h1>
                    <p className="text-slate-500 text-sm mt-1.5">Follow the guided wizard to schedule and assign a room for a new appointment</p>
                </div>

                {/* Prefilled Banner */}
                {isPrefilled && (
                    <div className="mb-8 p-4 bg-teal-500/5 border border-teal-500/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-teal-500/10 p-2.5 rounded-xl text-teal-600">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Booking for Request #{request_id}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Patient: <span className="font-semibold text-teal-700">{selectedPatient?.name}</span> • Doctor: <span className="font-semibold text-teal-700">{selectedDoctor?.doctor_name}</span>
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={handleResetPrefill}
                            className="text-xs font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200/50 px-4 py-2 rounded-xl transition-all"
                        >
                            Book Manually Instead
                        </button>
                    </div>
                )}

                {/* Stepper */}
                <div className="flex items-center mb-10 gap-0 overflow-x-auto pb-2 scrollbar-none">
                    {STEPS.map((label, i) => (
                        <div key={i} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                                    ${i < step 
                                        ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/10'
                                        : i === step 
                                            ? 'bg-white border-teal-600 text-teal-600 shadow-lg shadow-teal-600/5 ring-4 ring-teal-500/10'
                                            : 'bg-white border-slate-200 text-slate-400'
                                    }`}
                                >
                                    {i < step ? <Check size={16} strokeWidth={3} /> : i + 1}
                                </div>
                                <span className={`text-xs mt-2 font-semibold tracking-wide uppercase ${i === step ? 'text-teal-600 font-bold' : 'text-slate-400 font-medium'}`}>
                                    {label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-3 mb-6 rounded-full transition-colors duration-300 ${i < step ? 'bg-teal-600' : 'bg-slate-200'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Main Wizard Form Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 p-8">

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* ── STEP 0: Select Patient ── */}
                    {step === 0 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-950">Select Patient</h2>
                                <p className="text-slate-400 text-sm mt-0.5">Find the patient registry or choose the selected profile</p>
                            </div>

                            <div className="flex gap-2.5">
                                <input
                                    ref={searchRef}
                                    placeholder="Type patient name to search..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && searchPatients()}
                                    className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-slate-800 placeholder-slate-400 bg-slate-50/50"
                                />
                                <button
                                    onClick={searchPatients}
                                    disabled={loading}
                                    className="bg-teal-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 transition-all shadow-md shadow-teal-600/10 active:scale-[0.98]"
                                >
                                    {loading ? 'Searching...' : 'Search'}
                                </button>
                            </div>

                            {selectedPatient && (
                                <div className="p-5 bg-teal-50/50 border border-teal-100 rounded-2xl shadow-sm">
                                    <p className="text-xs font-bold text-teal-600 mb-3 uppercase tracking-wider">Selected Patient Profile</p>
                                    <PatientCard {...selectedPatient} />
                                </div>
                            )}

                            {patients.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto pr-1">
                                    {patients.map(p => (
                                        <div
                                            key={p.user_id}
                                            onClick={() => setSelectedPatient(p)}
                                            className={`cursor-pointer rounded-2xl border-2 transition-all duration-200 ${
                                                selectedPatient?.user_id === p.user_id
                                                    ? 'border-teal-500 bg-teal-50/10 ring-4 ring-teal-500/10'
                                                    : 'border-transparent hover:border-slate-200 hover:bg-slate-50/45'
                                            }`}
                                        >
                                            <PatientCard {...p} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button
                                    onClick={goNext}
                                    disabled={!selectedPatient}
                                    className="bg-teal-600 text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 active:scale-[0.98]"
                                >
                                    Next: Select Doctor <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 1: Select Department & Doctor ── */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-950">Select Doctor</h2>
                                <p className="text-slate-400 text-sm mt-0.5">Filter by clinical department to choose an attending physician</p>
                            </div>

                            <div className="max-w-xs">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                                <select
                                    value={dept}
                                    onChange={e => { setDept(e.target.value); setSelectedDoctor(null); }}
                                    className="border border-slate-200 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-slate-700 bg-slate-50/50"
                                >
                                    <option value="">All Departments</option>
                                    {DEPARTMENTS.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-12 text-slate-400 text-sm gap-2">
                                    <RefreshCw className="animate-spin w-4 h-4 text-teal-600" />
                                    Loading doctors list...
                                </div>
                            ) : doctors.length === 0 ? (
                                <p className="text-sm text-slate-400 py-12 text-center border border-dashed border-slate-200 rounded-2xl">No doctors found for this department.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-1">
                                    {doctors.map(d => (
                                        <div
                                            key={d.user_id}
                                            className={`rounded-2xl border-2 transition-all duration-200 ${
                                                selectedDoctor?.doctor_id === d.user_id
                                                    ? 'border-teal-500 bg-teal-50/10 ring-4 ring-teal-500/10'
                                                    : 'border-transparent'
                                            }`}
                                        >
                                            <DoctorCard
                                                doctor_id={d.user_id}
                                                doctor_name={d.name}
                                                doctor_specialization={d.specialization}
                                                doctor_department={d.dept_name}
                                                setSelectedDoctor={setSelectedDoctor}
                                                button_text="Select Doctor"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between pt-4 border-t border-slate-100">
                                <button onClick={goBack} className="text-slate-600 text-sm font-bold px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2">
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <button
                                    onClick={goNext}
                                    disabled={!selectedDoctor}
                                    className="bg-teal-600 text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 active:scale-[0.98]"
                                >
                                    Next: Pick Slot <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Select Date & Slot ── */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-950">Select Date & Time Slot</h2>
                                <p className="text-slate-400 text-sm mt-0.5">Pick an appointment date and browse the doctor's available schedules</p>
                            </div>

                            <div className="max-w-xs">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Appointment Date</label>
                                <div className="relative">
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
                                        className="border border-slate-200 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-slate-700 bg-slate-50/50"
                                    />
                                </div>
                            </div>

                            {loading && (
                                <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                                    <RefreshCw className="animate-spin w-4 h-4 text-teal-600" />
                                    Checking slot availability...
                                </div>
                            )}

                            {!loading && date && slots.length === 0 && (
                                <p className="text-sm text-slate-400 py-12 text-center border border-dashed border-slate-200 rounded-2xl">
                                    No available slots found for this date. Please pick another day.
                                </p>
                            )}

                            {slots.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Slots ({slots.length})</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 max-h-64 overflow-y-auto pr-1">
                                        {slots.map((slot, i) => {
                                            const isSelected = selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`text-xs py-3 px-2 rounded-xl border font-bold transition-all duration-150 flex flex-col items-center justify-center gap-1 ${
                                                        isSelected
                                                            ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/10 scale-[1.02]'
                                                            : 'bg-white border-slate-250 text-slate-700 hover:border-teal-300 hover:bg-teal-50/30'
                                                    }`}
                                                >
                                                    <Clock size={12} className={isSelected ? "text-teal-200" : "text-slate-400"} />
                                                    <span>{slot.start.slice(0, 5)} – {slot.end.slice(0, 5)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between pt-4 border-t border-slate-100">
                                <button 
                                    onClick={goBack} 
                                    disabled={isPrefilled} // Prevent backing up to patient/doctor if we came from approved request
                                    className="text-slate-600 text-sm font-bold px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <button
                                    onClick={() => {
                                        fetchRooms(selectedSlot.start, selectedSlot.end, date);
                                        goNext();
                                    }}
                                    disabled={!selectedSlot}
                                    className="bg-teal-600 text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 active:scale-[0.98]"
                                >
                                    Next: Assign Room <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Assign Room ── */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-950">Assign Operating / Consulting Room</h2>
                                <p className="text-slate-400 text-sm mt-0.5">
                                    Select an available clinical room for <span className="font-semibold text-slate-700">{date}</span> at{' '}
                                    <span className="font-semibold text-slate-700">{selectedSlot?.start?.slice(0,5)} – {selectedSlot?.end?.slice(0,5)}</span>
                                </p>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-12 text-slate-400 text-sm gap-2">
                                    <RefreshCw className="animate-spin w-4 h-4 text-teal-600" />
                                    Finding vacant rooms...
                                </div>
                            ) : rooms.length === 0 ? (
                                <p className="text-sm text-slate-400 py-12 text-center border border-dashed border-slate-200 rounded-2xl">No rooms available for this time slot.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {rooms.map(r => {
                                        const isSelected = selectedRoom?.room_id === r.room_id;
                                        return (
                                            <button
                                                key={r.room_id}
                                                onClick={() => setSelectedRoom(r)}
                                                className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between h-28 ${
                                                    isSelected
                                                        ? 'border-teal-500 bg-teal-50/10 ring-4 ring-teal-500/10 shadow-sm'
                                                        : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/5'
                                                }`}
                                            >
                                                <div>
                                                    <p className={`font-bold text-base ${isSelected ? 'text-teal-700' : 'text-slate-800'}`}>Room {r.room_number}</p>
                                                    <p className="text-xs text-slate-400 mt-1 capitalize">{r.room_type}</p>
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full self-start ${
                                                    isSelected ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    Available
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="flex justify-between pt-4 border-t border-slate-100">
                                <button onClick={goBack} className="text-slate-600 text-sm font-bold px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2">
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <button
                                    onClick={goNext}
                                    disabled={!selectedRoom}
                                    className="bg-teal-600 text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 active:scale-[0.98]"
                                >
                                    Next: Confirmation <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4: Confirm & Book ── */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-950">Confirm Appointment</h2>
                                <p className="text-slate-400 text-sm mt-0.5">Please review the medical appointment details before finalization</p>
                            </div>

                            <div className="bg-slate-50/55 rounded-2xl border border-slate-150 divide-y divide-slate-100 overflow-hidden shadow-inner">
                                <SummaryRow label="Patient Name" value={selectedPatient?.name} />
                                <SummaryRow label="Attending Doctor" value={selectedDoctor?.doctor_name} />
                                <SummaryRow label="Date" value={date} />
                                <SummaryRow
                                    label="Scheduled Slot"
                                    value={`${selectedSlot?.start?.slice(0,5)} – ${selectedSlot?.end?.slice(0,5)}`}
                                />
                                <SummaryRow
                                    label="Assigned Clinical Room"
                                    value={`Room ${selectedRoom?.room_number} (${selectedRoom?.room_type})`}
                                />
                            </div>

                            <div className="flex justify-between pt-4 border-t border-slate-100">
                                <button onClick={goBack} className="text-slate-600 text-sm font-bold px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2">
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <button
                                    onClick={handleBook}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-teal-600/10 hover:shadow-teal-600/20 active:scale-[0.98] transition-all flex items-center gap-2"
                                >
                                    {loading ? 'Finalizing Booking...' : '✓ Finalize Appointment'}
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
        <div className="flex justify-between items-center px-6 py-4 text-sm">
            <span className="text-slate-500 font-medium">{label}</span>
            <span className="text-slate-800 font-semibold">{value || '—'}</span>
        </div>
    );
}