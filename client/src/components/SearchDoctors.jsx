import DoctorCard from "./DoctorCard";
import {useOutletContext,useNavigate} from "react-router-dom";
import {useState,useEffect} from 'react';
import fetchWithAuth from "../fetchWithAuth";
import httpErrorHandler from "../httpErrorHandler";

export default function SearchDoctors(){
    const {accessToken,setAccessToken}=useOutletContext();
    const [search,setSearch]=useState("");
    const [dept,setDept]=useState("");
    const [doctors,setDoctors]=useState([]);
    const [selectedDoctor,setSelectedDoctor]=useState(null);
    const [schedules,setSchedules]=useState(null);
    const navigate=useNavigate();

    async function fetchDoctor(searchQuery=null,dept=null)
    {
        var url=`${import.meta.env.VITE_SERVER_URL}/doctor/doctors`;
        const params=[];
        if(searchQuery)
            params.push(`searchQuery=${searchQuery}`);
        if(dept)
            params.push(`dept=${dept}`);
        if(params.length>0)
            url+='?'+params.join('&');
        const res=await fetchWithAuth({
            url,
            method : 'GET',
            accessToken,
            setAccessToken,
            navigate,
            options : {
                withCredentials : true
            }
        });
        console.log(res.data);
        setDoctors(res.data);
    }

    async function fetchDoctorSchedule()
    {
        const res=await fetchWithAuth({
            url : `${import.meta.env.VITE_SERVER_URL}/doctor/schedule/${selectedDoctor.doctor_id}`,
            method : 'GET',
            accessToken,
            setAccessToken,
            navigate,
            options : {
                withCredentials : true
            }
        });
        setSchedules(res.data);
        console.log(res.data);
        console.log(selectedDoctor);
    }

    useEffect(()=>{
        if(!accessToken) return;
        fetchDoctor();
    },[accessToken]);

    useEffect(()=>{
        if(!selectedDoctor) return;
        fetchDoctorSchedule();
    },[selectedDoctor]);

    function handleClick()
    {
        fetchDoctor(search,dept);
        setSearch("");
    }

    async function onRequest(doctorId)
    {
        try{
            const res=await fetchWithAuth({
                url : `${import.meta.env.VITE_SERVER_URL}/patient/request`,
                method : 'POST',
                accessToken,
                setAccessToken,
                navigate,
                options:{
                    withCredentials : true
                },
                body:{doctor_id : doctorId}
            });
            console.log(res);
            alert("Successfully made request.");
            navigate("/");
        console.log(res);
        }catch(err){
            const error=httpErrorHandler(err);
            alert(err.message);
        }
    }

    return (
        <div className="flex flex-col items-start w-full p-6 min-h-screen bg-gray-50">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Find Your Doctor
                </h1>
                <p className="text-gray-500">
                    Search by name, specialization or department
                </p>
            </div>
            <div className="mb-6 w-full max-w-4xl bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    value={search}
                    placeholder="Search doctors or specialization..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={e=>setSearch(e.target.value)}
                />

                <select className="px-4 py-2 border rounded-lg bg-white" value={dept} onChange={e=>setDept(e.target.value)}>
                    <option value={""}>All Departments</option>
                    <option value={1}>Cardiology</option>
                    <option value={2}>Orthopedics</option>
                    <option value={3}>Dermatology</option>
                    <option value={4}>Pediatrics</option>
                    <option value={5}>Neurology</option>
                    <option value={6}>General Surgery</option>
                    <option value={7}>Psychiatry</option>
                </select>
                <button onClick={handleClick} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">Search</button>
            </div>
            {doctors.length === 0 ? (
                    <div className="text-center mt-10 text-gray-500">
                        <p className="text-lg">No doctors found 😕</p>
                        <p>Try searching another specialization</p>
                    </div>
                ) : (
                    <><h2 className="text-xl font-semibold mb-4 text-gray-700">
                    Available Doctors
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        {
                            doctors.map((value,index)=>{
                                return <DoctorCard
                                    key={index}
                                    doctor_name={value.name}
                                    doctor_specialization={value.specialization}
                                    doctor_department={value.dept_name}
                                    doctor_id={value.user_id}
                                    setSelectedDoctor={setSelectedDoctor}
                                    button_text="View availability"
                                    onRequest={onRequest}
                                />
                            })
                        }
                    </div></>
                )}
                {selectedDoctor && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-xl w-[400px] max-h-[80vh] overflow-y-auto">

                        <h2 className="text-lg font-semibold mb-4">
                            {selectedDoctor.doctor_name}'s Schedule
                        </h2>

                        {schedules?.map((slot, index) => (
                            <div key={index} className="flex justify-between border-b py-2 text-sm">
                            <span className="capitalize">{slot.day_of_week}</span>
                            <span>{slot.start_time} - {slot.end_time}</span>
                            </div>
                        ))}

                        <button
                            onClick={() => setSelectedDoctor(null)}
                            className="mt-4 w-full bg-gray-200 py-2 rounded-lg"
                        >
                            Close
                        </button>
                        </div>
                    </div>
                    )}
        </div>
    );
}