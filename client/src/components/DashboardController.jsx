import {useOutletContext,Navigate,useLocation} from 'react-router-dom';

export default function DashboardController(props){
    const {role}=useOutletContext();
    const location=useLocation();
    if(!role)
        return <div className="text-4xl font-bold text-slate-600">Loading....</div>
    if(location.pathname==='/dashboard'){
        if(role==='patient')
            return <Navigate to='/dashboard/patient' replace/>
        else if(role==='doctor')
            return <Navigate to='/dashboard/doctor' replace/>
        else return <Navigate to='/dashboard/receptionist' replace/>
    }

    return null;
}