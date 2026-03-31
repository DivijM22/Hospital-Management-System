import {useOutletContext,useNavigate} from 'react-router-dom';
import {useEffect} from 'react';

export default function DashboardController(props){
 
    const {role}=useOutletContext();
    const navigate=useNavigate();
    useEffect(()=>{
        if(!role) return;
        if(role==='patient')
            navigate('/dashboard/patient',{replace : true});
    },[role]);
    return <div className="text-4xl font-bold text-slate-600">Loading....</div>
}