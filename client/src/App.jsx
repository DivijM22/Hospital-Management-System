import LoginPage from './components/LoginPage';
import { useState,useEffect } from 'react';
import {Outlet} from 'react-router-dom';
import httpErrorHandler from './httpErrorHandler';
import axios from 'axios';

export default function App(){
    const [accessToken,setAccessToken]=useState(null);
    const [loading,setLoading]=useState(true);
    useEffect(()=>{
        async function fetchData()
        {
            try{
                const refreshRes=await axios.get(`${import.meta.env.VITE_SERVER_URL}/auth/refresh`,{withCredentials : true});
                const {data}=refreshRes;
                setAccessToken(data.accessToken);
            }catch(err){
                const error=httpErrorHandler(err);
                if(error.status===401)
                {
                    alert("Session expired. Kindly Log in again.");
                    setAccessToken(null);
                }
            }finally{
                setLoading(false);
            }
        }
        fetchData();
    },[]);

    return <div className="w-full h-screen flex-col">
        <Outlet context={{accessToken,setAccessToken,loading}}/>
    </div>
}