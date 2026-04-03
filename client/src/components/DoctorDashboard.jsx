import {useOutletContext,useNavigate} from 'react-router-dom';
import fetchWithAuth from '../fetchWithAuth';
import {useState,useEffect} from 'react';
import AppointmentCard from './AppointmentCard';

export default function DoctorDashboard(){
    const {accessToken,setAccessToken,role}=useOutletContext();
    const [appointments,setAppointments]=useState([]);

    const navigate=useNavigate();

    useEffect(()=>{
        if(!role || !navigate) return;
        if(role!=='doctor') navigate('/');
    },[role,navigate]);

    const today=new Date();

    async function fetchAppointments()
    {
        const res=await fetchWithAuth({
            url : 'http://localhost:3000/api/doctor/appointments',
            method : 'GET',
            accessToken,
            setAccessToken,
            navigate,
            options : {
                withCredentials : true
            }
        });
        console.log(res.data);
        setAppointments(res.data);
    }

    useEffect(()=>{
        if(!accessToken) return;
        fetchAppointments();
    },[accessToken]);

    const isSameDay = (d1, d2) =>
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();

    return (
        <div className="flex w-full min-h-screen flex-col items-start bg-gray-50 p-6 md:p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">My Dashboard</h1>
            
            <div className="flex flex-col w-full gap-4">
                
                <h2 className="text-2xl md:text-2xl font-bold text-gray-900">
                    Appointments
                </h2>

                <div className="flex w-full flex-col bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <h2 className="text-xl font-semibold text-gray-800">Today</h2>
                    </div>
                    {/* Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {appointments
                            .filter(value => isSameDay(new Date(value.appointment_date),today))
                            .map((value, index) => {
                                return <div key={index} className="flex w-full">
                                    <AppointmentCard {...value} />
                                </div>
                        })}
                    </div>
                </div>

                <div className="flex w-full flex-col bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <h2 className="text-xl font-semibold text-gray-800">Upcoming</h2>
                    </div>
                    {/* Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {appointments
                            .filter(value => new Date(value.appointment_date)>today).slice(0,15)
                            .map((value, index) => {
                                return <div key={index} className="flex w-full">
                                    <AppointmentCard {...value}/>
                                </div>
                        })}
                    </div>
                </div>

                <div className="flex w-full flex-col bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <h2 className="text-xl font-semibold text-gray-800">Past</h2>
                    </div>
                    {/* Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {appointments
                            .filter(value => {
                                const appointmentDate=value.appointment_date
                                const todayStr=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
                                return appointmentDate<todayStr
                            }).slice(0,15)
                            .map((value, index) => {
                                return <div key={index} className="flex w-full">
                                    <AppointmentCard {...value} />
                                </div>
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}