import UserForm from "./UserForm";
import {useState,useEffect} from 'react';
import {useOutletContext,useNavigate} from 'react-router-dom';
import axios from 'axios';
import httpErrorHandler from "../httpErrorHandler";
import { Activity } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const {accessToken,setAccessToken}=useOutletContext();
  const [formData,setFormData]=useState({
    name : "",
    email : "",
    password : "",
    gender : "",
    blood_group: "",
    dob : "",
    submitted : false
  });
  const meshBG = "mesh-gradient";
  const grayBG = "bg-slate-50/50";
  const navigate=useNavigate();

  useEffect(()=>{
    if(!accessToken) return;
    navigate('/dashboard',{replace : true});
  },[accessToken]);

  useEffect(()=>{
    if(!formData.submitted) return;
    async function fetchData()
    {
      try{
        if(mode==="login"){
          const loginRes=await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/login`,{formData},{
            withCredentials : true,
            headers:{
              'Content-Type' : 'application/json',
            }
          });
          const {data}=loginRes;
          setAccessToken(data.accessToken);
        }else{
          const signUpRes=await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/register`,{formData},{
            withCredentials : true,
            headers : {
              'Content-Type' : 'application/json'
            }
          });
          alert("User successfully registered! Please log in to continue.");
          setMode("login");
        }
      }catch(err){
          console.log(err);
          console.log(err.message);
          console.log(err.code);
          console.log(err.response);
          const error=httpErrorHandler(err);
        if(err.status===401)
        {
          setFormData(prev=>({
            ...prev,
            submitted : false
          }));
          setAccessToken(null);
          alert("Invalid email or password");
        }else
          alert(error.message);
      }finally{
        setFormData(prev=>({...prev,submitted : false}));
      }
    
    }
    console.log(formData);
    fetchData();
  },[formData.submitted]);

  return (
    <div className="min-h-screen w-full flex bg-slate-50">

      {/* LEFT PANEL */}
      <div className={`w-1/2 flex items-center justify-center relative overflow-hidden transition-all duration-500 ${mode === "signup" ? meshBG : grayBG}`}>
        {mode === "signup" ? (
          <>
            {/* Glowing floating decorative shapes */}
            <div className="absolute w-80 h-80 bg-teal-400/10 rounded-full blur-2xl top-[-100px] left-[-100px] animate-float-slow" />
            <div className="absolute w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl bottom-[-150px] right-[-100px] animate-float-slower" />
            
            <div className="w-2/3 flex flex-col gap-6 text-white z-10">
              <div className="flex items-center gap-2">
                <div className="bg-white/10 p-2 rounded-xl border border-white/15 text-teal-300">
                  <Activity size={24} className="animate-pulse" />
                </div>
                <h2 className="text-lg font-bold tracking-wider">HMS Care</h2>
              </div>
              
              <h1 className="text-5xl font-extrabold tracking-tight mt-4 leading-tight">Welcome Back 👋</h1>
              <p className="text-white/80 text-base leading-relaxed font-light">
                Sign in to continue managing your medical schedules, records, and appointments effortlessly.
              </p>

              <button
                onClick={() => setMode("login")}
                className="mt-6 self-start px-8 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white hover:text-teal-950 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-sm text-white"
              >
                Sign In Instead
              </button>
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-center p-6 z-10">
            <UserForm mode="login" formData={formData} setFormData={setFormData}/>
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className={`w-1/2 flex items-center relative justify-center overflow-hidden transition-all duration-500 ${mode === "signup" ? grayBG : meshBG}`}>

        {mode === "signup" ? (
          <div className="w-full flex items-center justify-center p-6 z-10">
            <UserForm mode="signup" formData={formData} setFormData={setFormData}/>
          </div>
        ) : (
          <>
            {/* Glowing floating decorative shapes */}
            <div className="absolute w-80 h-80 bg-emerald-400/10 rounded-full blur-2xl top-[-100px] left-[-100px] animate-float-slower" />
            <div className="absolute w-96 h-96 bg-teal-300/10 rounded-full blur-3xl bottom-[-150px] right-[-100px] animate-float-slow" />
            
            <div className="w-2/3 flex flex-col gap-6 text-white z-10">
              <div className="flex items-center gap-2">
                <div className="bg-white/10 p-2 rounded-xl border border-white/15 text-teal-300">
                  <Activity size={24} className="animate-pulse" />
                </div>
                <h2 className="text-lg font-bold tracking-wider">HMS Care</h2>
              </div>
              
              <h1 className="text-5xl font-extrabold tracking-tight mt-4 leading-tight">New Here?</h1>
              <p className="text-white/80 text-base leading-relaxed font-light">
                Join our comprehensive digital care system. Sign up now to request appointments, consult top doctors, and view your history.
              </p>

              <button
                onClick={() => setMode("signup")}
                className="mt-6 self-start px-8 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white hover:text-teal-950 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-sm text-white"
              >
                Create Account
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}