import AppointmentCard from "./AppointmentCard";
import { AlertCircle, X } from 'lucide-react'; // Added X icon
import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import fetchWithAuth from "../fetchWithAuth";
import httpErrorHandler from "../httpErrorHandler";

function AppointmentTable(props) {
  const {type,appointments,accessToken,setAccessToken,navigate,fetchAppointments}=props;
  const today=new Date();
  const todayStr=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');

  return (
    <div className="mt-4 flow-root" onClick={e=>e.stopPropagation()}>
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg bg-white max-h-[60vh] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Patient Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Start Time</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">End Time</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Room</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments?.map((apt,index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {apt.patient_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {apt.appointment_date.split('T')[0]}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {apt.start_time}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {apt.end_time}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        {apt.room_number}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {apt.room_type}
                    </td>
                    {
                      type!=='past' &&
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right gap-2 text-sm font-medium sm:pr-6">
                        <button onClick={
                          async()=>{
                            try{
                              console.log(apt);
                              const res=await fetchWithAuth({
                                url : `http://localhost:3000/api/doctor/appointments/${apt.appointment_id}`,
                                method : 'PATCH',
                                accessToken,
                                setAccessToken,
                                navigate,
                                options : {
                                  withCredentials : true
                                },
                                body : {status : 'completed'}
                              });
                              alert(res.message);
                              fetchAppointments();
                            }catch(err){
                              alert(err.message);
                            }
                          }
                        } className="bg-blue-500 hover:bg-blue-600 text-white font-semibold mr-4 p-2 rounded-xl">
                          Mark Completed
                        </button>
                        {
                          (type==='scheduled' && apt.appointment_date > todayStr) &&
                            <button onClick={
                              async()=>{
                                try{
                                  const res=await fetchWithAuth({
                                    url : `http://localhost:3000/api/doctor/appointments/${apt.appointment_id}`,
                                    method : 'PATCH',
                                    accessToken,
                                    setAccessToken,
                                    navigate,
                                    options : {
                                      withCredentials : true
                                    },
                                    body : {status : 'cancelled'}
                                  });
                                  console.log(res);
                                  alert(res.message);
                                  fetchAppointments();
                                }catch(err){
                                  const error=httpErrorHandler(err);
                                  console.log(error);
                                }
                              }
                            } className="bg-red-600 hover:bg-red-700 text-white font-semibold p-2 rounded-xl" type="button">
                              Cancel
                            </button>
                        }
                      </td>
                    }
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Empty State Handling */}
            {appointments?.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No appointments found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManageAppointments() {

  const [showScheduledModal,setShowScheduledModal]=useState(false);
  const [showPastModal,setShowPastModal]=useState(false);
  const [showMissedModal,setShowMissedModal]=useState(false);

  const {accessToken,setAccessToken}=useOutletContext();
  const navigate=useNavigate();

  const [scheduledAppointments,setScheduledAppointments]=useState([]);
  const [missedAppointments,setMissedAppointments]=useState([]);
  const [pastAppointments,setPastAppointments]=useState([]);

  async function fetchAppointments()
  {
    const config={
      method : 'GET',
      accessToken,
      setAccessToken,
      navigate,
      options : {
        withCredentials : true
      }
    }
    const [scheduledRes,pastRes]=await Promise.all([
        await fetchWithAuth({
            url : 'http://localhost:3000/api/doctor/appointments?status=scheduled',
            ...config
          }),
        await fetchWithAuth({
            url : 'http://localhost:3000/api/doctor/appointments?status=past',
            ...config
        })]);
    console.log(scheduledRes);
    console.log(pastRes);
    console.log(scheduledRes.data.filter(appt=>appt.derived_status==='missed'));
    setScheduledAppointments(scheduledRes.data);
    setPastAppointments(pastRes.data);
    setMissedAppointments(scheduledRes.data.filter(appt=>appt.derived_status==='missed'));
  }

  useEffect(()=>{
    if(!accessToken) return;
    fetchAppointments();
  },[accessToken]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 md:p-12" >
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Manage Appointments</h1>
            <p className="mt-2 text-gray-600">Overview of your clinic's schedule and history.</p>
          </div>
        </header>

        <div className="space-y-10">
          {/* Section: Scheduled */}
          <section>
            <div className="mb-4 flex items-end justify-between border-b border-gray-200 pb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
                Scheduled <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-600">{scheduledAppointments.length}</span>
              </h2>
              <button onClick={e=>setShowScheduledModal(true)} className="text-sm font-medium text-blue-600 hover:underline">Manage</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {
                  scheduledAppointments
                    .filter(value => value.derived_status === 'scheduled')
                    .slice(0, 4)
                    .map((value, index) => (
                      <AppointmentCard key={index} {...value} />
                    ))
                }
            </div>
          </section>

          {/* Section: Past */}
          <section>
            <div className="mb-4 flex items-end justify-between border-b border-gray-200 pb-4">
              <h2 className="text-xl font-bold text-gray-800">Past</h2> 
              <button onClick={e=>setShowPastModal(true)} className="text-sm font-medium text-blue-600 hover:underline">Manage</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 opacity-80">
              {
                    pastAppointments.map((value,index)=>{
                      return <AppointmentCard key={index} {...value}/>
                    }).slice(0,4)
                }
            </div>
          </section>

          {/* Section: Missed */}
          <section>
            <div className="mb-4 flex items-end justify-between border-b border-gray-200 pb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-red-600"><AlertCircle size={20} /> Missed
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-600">{missedAppointments.length}</span>
              </h2>
              <button onClick={e=>setShowMissedModal(true)} className="text-sm font-medium text-blue-600 hover:underline">Manage</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {
                  missedAppointments.map((value,index)=>{
                    return <AppointmentCard key={index} {...value}/>
                  }).slice(0,4)
                }
            </div>
          </section>
        </div>
      </div>
      
      {/* MODALS SECTION */}
      {
        showScheduledModal && 
        <div onClick={e=>setShowScheduledModal(false)} className="flex fixed inset-0 z-50 bg-black/80 justify-center items-center">
          <div 
            onClick={e=>e.stopPropagation()} 
            className="bg-white w-[900px] max-h-[80vh] rounded-xl p-6 flex flex-col"
          >
            {/* Header Added Here */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-gray-800">Scheduled Appointments</h2>
              <button onClick={() => setShowScheduledModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <AppointmentTable fetchAppointments={fetchAppointments} accessToken={accessToken} setAccessToken={setAccessToken} navigate={navigate} appointments={scheduledAppointments} type='scheduled'/>
          </div>
        </div>
      }
      
      {
          showPastModal && 
          <div onClick={e=>setShowPastModal(false)} className="flex fixed inset-0 z-50 bg-black/80 justify-center items-center">
            <div 
              onClick={e=>e.stopPropagation()} 
              className="bg-white w-[900px] max-h-[80vh] rounded-xl p-6 flex flex-col"
            >
              {/* Header Added Here */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-gray-800">Past Appointments</h2>
                <button onClick={() => setShowPastModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Fixed: Changed type from 'scheduled' to 'past' */}
              <AppointmentTable fetchAppointments={fetchAppointments} accessToken={accessToken} setAccessToken={setAccessToken} navigate={navigate} appointments={pastAppointments} type='past'/>
            </div>
          </div>
      }
      
      {
          showMissedModal && 
          <div onClick={e=>setShowMissedModal(false)} className="flex fixed inset-0 z-50 bg-black/80 justify-center items-center">
            <div 
              onClick={e=>e.stopPropagation()} 
              className="bg-white w-[900px] max-h-[80vh] rounded-xl p-6 flex flex-col"
            >
              {/* Header Added Here */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-red-600 flex items-center gap-2">
                  <AlertCircle size={24} />
                  Missed Appointments
                </h2>
                <button onClick={() => setShowMissedModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Fixed: Changed type from 'scheduled' to 'missed' */}
              <AppointmentTable fetchAppointments={fetchAppointments} accessToken={accessToken} setAccessToken={setAccessToken} navigate={navigate} appointments={missedAppointments} type='missed'/>
            </div>
        </div>
      }
    </div>
  );
};