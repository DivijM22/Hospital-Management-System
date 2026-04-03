import { createRoot } from 'react-dom/client';
import { createBrowserRouter,RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import LoginPage from './components/LoginPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import './index.css';
import PatientDashboard from './components/PatientDashboard.jsx';
import DashboardController from './components/DashboardController.jsx';
import PatientAppointments from './components/PatientAppointments.jsx';
import SearchDoctors from './components/SearchDoctors.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Profile from './components/Profile.jsx';
import DoctorDashboard from './components/DoctorDashboard.jsx';
import SearchPatient from './components/SearchPatients.jsx'
import ManageAppointments from './components/ManageAppointments.jsx';
import ReceptionistDashboard from './components/ReceptionistDashboard.jsx';
import BookAppointment from './components/BookAppointment.jsx';
import CancelAppointment from './components/CancelAppointment.jsx';
import RescheduleAppointment from './components/RescheduleAppointment.jsx';

const router=createBrowserRouter([
    {
        path : '/',
        element : <App/>,
        children : [
            {
                index : true,
                element : <LoginPage/>
            },
            {
                element : <ProtectedRoute/>,
                children : [
                    {
                        path : 'dashboard',
                        element : <Dashboard/>,
                        children : [
                            {
                                index : true,
                                element : <DashboardController/>
                            },
                            {
                                path : 'patient',
                                element : <PatientDashboard/>,
                            },
                            {
                                path: 'patient/appointments',
                                element : <PatientAppointments/>
                            },
                            {
                                path : 'patient/search/doctors',
                                element : <SearchDoctors/>
                            },
                            {
                                path : 'profile',
                                element : <Profile/>
                            },
                            {
                                path : 'doctor',
                                element : <DoctorDashboard/>
                            },
                            {
                                path : 'doctor/search/patients',
                                element : <SearchPatient/>
                            },
                            {
                                path : 'doctor/appointments/manage',
                                element : <ManageAppointments/>
                            },
                            {
                                path : 'receptionist',
                                element : <ReceptionistDashboard/>
                            },
                            {
                                path : 'receptionist/book',
                                element : <BookAppointment/>
                            },
                            {
                                path : 'receptionist/cancel',
                                element : <CancelAppointment/>
                            },
                            {
                                path : 'receptionist/reschedule',
                                element : <RescheduleAppointment/>
                            }
                        ]
                    }
                ]
                
            }
        ]
    }
]);

createRoot(document.getElementById('root')).render(
    <RouterProvider router={router}/>
);