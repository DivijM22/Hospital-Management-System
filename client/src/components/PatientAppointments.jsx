import { useState,useEffect } from 'react';
import {useOutletContext,useNavigate} from 'react-router-dom';
import fetchWithAuth from '../fetchWithAuth';
import AppointmentCard from './AppointmentCard';

export default function PatientAppointments(props){
    const {accessToken,setAccessToken}=useOutletContext();
    const [appointments,setAppointments]=useState([]);
    const navigate=useNavigate();

    useEffect(()=>{
        if(!accessToken) return;
        async function fetchData()
        {
            const {data}=await fetchWithAuth({
                url : 'http://localhost:3000/api/patient/appointments',
                accessToken,
                setAccessToken,
                navigate,
                method : 'GET',
                options : {
                    withCredentials : true
                }
            });
            setAppointments(data);
            return data;
        }
        fetchData();
    },[accessToken]);

    useEffect(()=>{
        if(appointments.length===0) return;
        console.log(appointments);
    },[appointments]);

    return (
        <div className="flex flex-col w-full h-full p-6 gap-6 bg-gray-100">

        {/* Page Title */}
        <div>
            <h1 className="text-3xl font-bold text-gray-800">
            Dashboard
            </h1>
            <p className="text-gray-500 text-sm">
            Overview of your recent activity
            </p>
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4">

            {/* Section Header */}
            <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
                Appointments
            </h2>

            <span className="text-sm text-gray-400">
                {appointments.length} total
            </span>
            </div>

            {/* Content */}
            {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-gray-600 font-medium">
                No appointments found
                </p>
                <p className="text-gray-400 text-sm mt-1">
                You're all caught up 🎉
                </p>
            </div>
            ) : (
            <div className="flex flex-col gap-4 items-start max-h-[400px] overflow-y-auto pr-2">
                {appointments.map((value, index) => (
                <AppointmentCard
                    key={index}
                    patient_name={value.patient_name}
                    doctor_name={value.doctor_name}
                    doctor_specialization={value.doctor_specialization}
                    start_time={value.start_time}
                    end_time={value.end_time}
                    room_number={value.room_number}
                    room_type={value.room_type}
                    appointment_date={value.appointment_date}
                />
                ))}
            </div>
            )}

        </div>
        </div>
    )
}