import UserForm from "./UserForm";
import {useState,useEffect} from 'react';
import {useOutletContext,useNavigate} from 'react-router-dom';
import axios from 'axios';
import httpErrorHandler from "../httpErrorHandler";

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
  const greenBG = "bg-gradient-to-br from-[#1E6966] to-[#15514E]";
  const grayBG = "bg-gray-100";
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
          const loginRes=await axios.post("http://localhost:3000/api/auth/login",{formData},{
            withCredentials : true,
            headers:{
              'Content-Type' : 'application/json',
            }
          });
          const {data}=loginRes;
          setAccessToken(data.accessToken);
        }else{
          const signUpRes=await axios.post("http://localhost:3000/api/auth/register",{formData},{
            withCredentials : true,
            headers : {
              'Content-Type' : 'application/json'
            }
          });
          alert("User successfully registered! Please log in to continue.");
          setMode("login");
        }
      }catch(err){
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
    <div className="min-h-screen w-full flex">

      {/* LEFT PANEL */}
      <div className={`w-1/2 flex items-center justify-center relative overflow-hidden ${mode === "signup" ? greenBG : grayBG}`}>
        {mode === "signup" ? (
          <>
          <div className="absolute w-72 h-72 bg-white/10 rounded-full top-[-50px] left-[-50px]" />
          <div className="absolute w-96 h-96 bg-white/5 rounded-full bottom-[-100px] right-[-100px]" />
          <div className="w-2/3 flex flex-col gap-6 text-white z-10">
            <h2 className="text-lg opacity-80">🏥 HMS</h2>
            <h1 className="text-4xl font-bold">Welcome Back 👋</h1>
            <p className="text-white/70 text-sm">
              Pick up where you left off!
            </p>

            <button
              onClick={() => setMode("login")}
              className="mt-4 px-6 py-2 rounded-full border border-white/40 hover:bg-white hover:text-[#1E6966]"
            >
              Go to Log in
            </button>
          </div>
          </>
        ) : (
          <UserForm mode="login" formData={formData} setFormData={setFormData}/>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className={`w-1/2 flex items-center relative justify-center ${mode === "signup" ? grayBG : greenBG}`}>

        {mode === "signup" ? (
          <UserForm mode="signup" formData={formData} setFormData={setFormData}/>
        ) : (
          <>
          <div className="absolute w-72 h-72 bg-white/10 rounded-full top-[-50px] left-[-50px]" />
          <div className="absolute w-96 h-96 bg-white/5 rounded-full bottom-[-100px] right-[-100px]" />
          <div className="w-2/3 flex flex-col gap-6 text-white">
            <h2 className="text-lg opacity-80">🏥 HMS</h2>
            <h1 className="text-4xl font-bold">New Here?</h1>
            <p className="text-white/70 text-sm">
              Create an account to get started.
            </p>

            <button
              onClick={() => setMode("signup")}
              className="mt-4 px-6 py-2 rounded-full border border-white/40 hover:bg-white hover:text-[#1E6966]"
            >
              Go to Signup
            </button>
          </div></>
        )}
      </div>

    </div>
  );
}