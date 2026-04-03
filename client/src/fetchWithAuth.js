import axios from 'axios';
import httpErrorHandler from './httpErrorHandler';

export default async function fetchWithAuth({url,accessToken,setAccessToken,navigate,method='GET',options=null,body=null}){
    const config={
            url,
            method,
            ...options,
            headers : {
                ...(options?.headers || {}),
                Authorization : `Bearer ${accessToken}`,
                'Content-Type' : 'application/json'
            },
            data : (method==='GET' ? undefined : body)
        };
    try{
        const res=await axios(config);
        return res.data;
    }catch(err){
        const error=httpErrorHandler(err);
        if(error.status===401){
            try{
                const refreshRes=await axios.get("http://localhost:3000/api/auth/refresh",{withCredentials : true});
                console.log(refreshRes.data);
                const newAccessToken=refreshRes.data.accessToken;
                setAccessToken(newAccessToken);
                config.headers.Authorization=`Bearer ${newAccessToken}`;
                const res=await axios(config);
                return res.data;
            }catch(refreshErr){
                alert("Cannot refresh user session. Please log in again.");
                await fetchWithAuth({url : 'http://localhost:3000/api/auth/logout',method : 'GET', accessToken,setAccessToken,navigate,options :{
                    withCredentials : true
                }});
                setAccessToken(null);
                navigate("/",{replace : true});
                throw refreshErr;
            }
        }else throw error;
    }
}
