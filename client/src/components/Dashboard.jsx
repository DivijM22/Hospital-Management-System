import { useEffect,useState } from 'react';
import {useOutletContext,Outlet,useNavigate} from 'react-router-dom';
import Sidebar from './Sidebar';
import {jwtDecode} from 'jwt-decode'
import fetchWithAuth from '../fetchWithAuth';

export default function Dashboard(){
    const {accessToken,setAccessToken}=useOutletContext();
    const navigate=useNavigate();
    const decoded = (accessToken && typeof accessToken === 'string') ? jwtDecode(accessToken) : null;
    const role=decoded?.role;
    const [collapsed,setCollapsed]=useState(false);

    async function handleLogout()
    {
        await fetchWithAuth({
            url : `${import.meta.env.VITE_SERVER_URL}/auth/logout`,
            method : 'GET',
            accessToken,
            setAccessToken,
            navigate,
            options : {
                withCredentials : true
            }
        });
        setAccessToken(null);
        navigate('/',{replace : true});
        return;
    }

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
        <div className={`flex min-h-screen`}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} handleLogout={handleLogout} role={role}/>
            <div className={`w-full h-full flex ${collapsed ? `ml-[5vw]` : `ml-[20vw]`}`}>
                <Outlet context={{accessToken,setAccessToken,role}}/>
            </div>
        </div>
    )
}