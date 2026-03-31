import { createRoot } from 'react-dom/client';
import { createBrowserRouter,RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import LoginPage from './components/LoginPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import './index.css';
import PatientDashboard from './components/PatientDashboard.jsx';
import DashboardController from './components/DashboardController.jsx';

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
                path : 'dashboard',
                element : <Dashboard/>,
                children : [
                    {
                        index : true,
                        element : <DashboardController/>
                    },
                    {
                        path : 'patient',
                        element : <PatientDashboard/>
                    },
                    /*Other children */
                ]
            }
        ]
    }
]);
createRoot(document.getElementById('root')).render(
    <RouterProvider router={router}/>
);