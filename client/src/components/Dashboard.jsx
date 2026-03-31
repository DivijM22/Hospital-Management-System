import { useEffect } from 'react';
import {useOutletContext,Outlet,useNavigate} from 'react-router-dom';
import Sidebar from './Sidebar';
import {jwtDecode} from 'jwt-decode'

export default function Dashboard(){
    const {accessToken,setAccessToken}=useOutletContext();
    const navigate=useNavigate();
    const decoded = (accessToken && typeof accessToken === 'string') ? jwtDecode(accessToken) : null;
    const role=decoded?.role;
    useEffect(()=>{
        if(!accessToken)
        {
            navigate('/',{replace : true});
            return;
        }
        console.log(accessToken);
        console.log(role);
    },[accessToken]);
    return (
        <div className="flex w-full h-screen items-center">
            <Sidebar role={role}/>
            <Outlet context={{accessToken,setAccessToken,role}}/>
        </div>
    )
}