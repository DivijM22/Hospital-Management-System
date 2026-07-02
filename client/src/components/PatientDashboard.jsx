import {useOutletContext,useNavigate} from 'react-router-dom';
import {useState,useEffect} from 'react'
import fetchWithAuth from '../fetchWithAuth';
import AppointmentCard from './AppointmentCard';

export default function PatientDashboard(){

    const {accessToken,setAccessToken}=useOutletContext();
    const [upcomingAppointments,setUpcomingAppointments]=useState(null);
    const [completedAppointments,setCompletedAppointments]=useState(null);
    const [missedAppointments,setMissedAppointments]=useState(null);
    const [userInfo,setUserInfo]=useState(null);
    const [appointments,setAppointments]=useState(null);
    const [upcoming,setUpcoming]=useState(null);
    const [completed,setCompleted]=useState(null);
    const [mode,setMode]=useState(null);
    const navigate=useNavigate();

    async function fetchData()
    {
        async function helper(url){
            try{
                const res=await fetchWithAuth({
                    url,
                    accessToken,
                    setAccessToken,
                    navigate,
                    method : 'GET',
                    options : {
                        withCredentials : true
                    }
                });
                return res;
            }catch(err){
                alert(err.message);
            }
        }

        try{
            const [upcomingRes,completedRes,missedRes,userInfoRes,appointmentRes,upcomingAppointmentRes,completedAppointmentRes]=await Promise.all([
                helper(`${import.meta.env.VITE_SERVER_URL}/patient/appointments/count/upcoming`),
                helper(`${import.meta.env.VITE_SERVER_URL}/patient/appointments/count/completed`),
                helper(`${import.meta.env.VITE_SERVER_URL}/patient/appointments/count/missed`),
                helper(`${import.meta.env.VITE_SERVER_URL}/me`),
                helper(`${import.meta.env.VITE_SERVER_URL}/patient/appointments`),
                helper(`${import.meta.env.VITE_SERVER_URL}/patient/appointments?status=upcoming`),
                helper(`${import.meta.env.VITE_SERVER_URL}/patient/appointments?status=completed`)
            ]);
            console.log(upcomingRes);
            console.log(completedRes);
            console.log(missedRes);
            console.log(userInfoRes.data);
            console.log(appointmentRes.data);
            console.log(upcomingAppointmentRes.data);
            console.log(completedAppointmentRes.data);
            setUpcomingAppointments(upcomingRes.data.appointment_count);
            setCompletedAppointments(completedRes.data.appointment_count);
            setMissedAppointments(missedRes.data.appointment_count);
            setUserInfo(userInfoRes.data);
            setAppointments(appointmentRes.data);
            setUpcoming(upcomingAppointmentRes.data);
            setCompleted(completedAppointmentRes.data);
        }catch(err){
            console.log(err);
        }
    }

    useEffect(()=>{
        if(!accessToken) return;
        fetchData();
    },[accessToken]);

    return (
        <div className="w-full min-h-screen bg-gray-100 p-6">

            <h1 className="text-4xl font-semibold text-gray-700 mb-6">
                My Dashboard
            </h1>
            {/* Page Title */}
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">
                Appointments
            </h3>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow">
                <p className="text-sm text-gray-500">Upcoming</p>
                <h2 className="text-2xl font-semibold text-gray-700">{upcomingAppointments}</h2>
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                <p className="text-sm text-gray-500">Completed</p>
                <h2 className="text-2xl font-semibold text-gray-700">{completedAppointments}</h2>
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                <p className="text-sm text-gray-500">Missed</p>
                <h2 className="text-2xl font-semibold text-gray-700">{missedAppointments}</h2>
                </div>
            </div>

            <div className="flex gap-6">

                {/* Left: Main Content */}
                <div className="flex-1">

                {/* Filters / Actions */}
                <div className="bg-white p-4 rounded-xl shadow mb-4 flex justify-between items-center">
                    <div className="flex gap-3">
                    <button onClick={e=>setMode("all")} className="px-4 py-1 rounded-full bg-gray-200 hover:bg-blue-400 text-gray-700 text-sm">
                        All
                    </button>
                    <button onClick={e=>setMode("upcoming")} className="px-4 py-1 rounded-full bg-gray-200 hover:bg-blue-400 text-gray-700 text-sm">
                        Upcoming
                    </button>
                    <button onClick={e=>setMode("completed")} className="px-4 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-blue-400 text-sm">
                        Completed
                    </button>
                    </div>
                </div>

                {/* Appointments List Placeholder */}
                    <div className="bg-white h-[400px] rounded-xl shadow flex items-start justify-center text-gray-400 overflow-y-auto">
                           {(appointments?.length===0 || mode===null) ? (<div className="flex w-full h-full border-2 flex items-center justify-center text-gray-400">
                                Appointments will appear here
                            </div>) :
                                
                            <div className="w-full flex-wrap grid grid-cols-1 md:grid-cols-4 gap-4 align-content-start items-start">
                                {
                                    (mode==="all") ? 
                                    appointments?.map((value,index)=>{
                                        return <AppointmentCard key={index}
                                        patient_name={value?.patient_name}
                                        doctor_name={value?.doctor_name}
                                        doctor_specialization={value?.doctor_specialization}
                                        start_time={value?.start_time}
                                        end_time={value?.end_time}
                                        room_number={value?.room_number}
                                        room_type={value?.room_type}
                                        appointment_date={value?.appointment_date}
                                        status={value?.status}
                                        />
                                    }) : ((mode==="upcoming")  ? upcoming?.map((value,index)=>{
                                          return <AppointmentCard key={index}
                                        patient_name={value?.patient_name}
                                        doctor_name={value?.doctor_name}
                                        doctor_specialization={value?.doctor_specialization}
                                        start_time={value?.start_time}
                                        end_time={value?.end_time}
                                        room_number={value?.room_number}
                                        room_type={value?.room_type}
                                        appointment_date={value?.appointment_date}
                                        status={value?.status}
                                        />
                                    }) : ( mode==="completed" && completed?.map((value,index)=>{
                                        return <AppointmentCard key={index}
                                        patient_name={value?.patient_name}
                                        doctor_name={value?.doctor_name}
                                        doctor_specialization={value?.doctor_specialization}
                                        start_time={value?.start_time}
                                        end_time={value?.end_time}
                                        room_number={value?.room_number}
                                        room_type={value?.room_type}
                                        appointment_date={value?.appointment_date}
                                        status={value?.status}
                                        />
                                    })))
                                }
                            </div>
                            }
                
                    </div>
                </div>

                {/* Right: Profile / Info Panel */}
                <div className="w-80 hidden lg:block">

                    <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-semibold mb-3">
                            {userInfo?.name && userInfo?.name[0]}
                        </div>

                        <h2 className="font-semibold text-gray-700">{userInfo?.name ? userInfo?.name : null}</h2>
                        <p className="text-sm text-gray-500 mb-4">{userInfo?.email}</p>

                        <div className="w-full text-left text-sm text-gray-600 space-y-2">
                        <p><span className="font-medium">Blood: </span>{userInfo?.blood_group}</p>
                        <p><span className="font-medium">DOB: </span>{userInfo?.dob?.split('T')[0]}</p>
                        <p><span className="font-medium">Gender: </span>{userInfo?.gender}</p>
                        </div>
                    </div>

                </div>
            </div>
            </div>
    );
}