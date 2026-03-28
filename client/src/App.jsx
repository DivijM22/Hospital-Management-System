import LoginPage from './components/LoginPage';
import { useState,useEffect } from 'react';
import axios from 'axios';

export default function App(){
    const [accessToken,setAccessToken]=useState();
    const [refreshToken,setRefreshToken]=useState();

    useEffect(()=>{
            
    },[]);

    return <div className="w-full h-screen flex-col">
        <LoginPage/>
    </div>
}