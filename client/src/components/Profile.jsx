import {useOutletContext,useNavigate} from 'react-router-dom';
import {useEffect,useState} from 'react';
import fetchWithAuth from '../fetchWithAuth';

export default function Profile(){
    const {accessToken,setAccessToken,role}=useOutletContext();
    const [userData,setUserData]=useState(null);
    const [editBox,setEditBox]=useState(false);
    const [formData,setFormData]=useState(null);
    const navigate=useNavigate();

    async function fetchUserInfo()
    {
        const res=await fetchWithAuth({
            url : 'http://localhost:3000/api/me',
            method : 'GET',
            accessToken,
            setAccessToken,
            navigate,
            options : {
                withCredentials : true
            }
        });
        console.log(res.data);
        setUserData(res.data);
    }

    async function patchUserInfo()
    {
        const res=await fetchWithAuth({
            url : 'http://localhost:3000/api/me/edit',
            method : 'PATCH',
            accessToken,
            setAccessToken,
            body : {...formData,role},
            navigate,
            options : {
                withCredentials : true
            }
        });
        setUserData(res.data);
        setEditBox(false);
        return;
    }

    function handleChange(e){
        const {name,value}=e.target;
        setFormData(prev=>(
            {
                ...prev,
                [name] : value
            }
        ))
    }

    useEffect(()=>{
        if(!accessToken) return;
        fetchUserInfo();
    },[accessToken]);

    return (
        <div className="flex w-full min-h-screen items-start justify-center bg-gray-50 pt-32 px-4 relative">
            
            {/* --- MAIN PROFILE CARD --- */}
            <div className="relative flex flex-col w-full max-w-sm bg-white shadow-lg border border-gray-100 rounded-2xl p-6">
            
            {/* Overlapping Avatar */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex justify-center items-center text-3xl text-white font-bold rounded-full w-20 h-20 bg-blue-600 border-4 border-white shadow-md">
                {userData?.name ? userData.name?.charAt(0).toUpperCase() : 'P'}
            </div>

            {/* Profile Header */}
            <div className="flex flex-col items-center mt-10 pb-6 border-b border-gray-100">
                <h2 className="text-gray-800 text-2xl font-bold">{userData?.name}</h2>
                <span className="text-gray-500 text-sm mt-1">{userData?.email}</span>
                
                {/* Dynamic Role Badge */}
                {role && (
                <span className={`mt-4 px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${
                    role === 'doctor' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                }`}>
                    {role}
                </span>
                )}
            </div>

            {/* Details Section */}
            <div className="w-full mt-6 flex flex-col gap-4">
                {role === 'patient' ? (
                <>
                    <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-medium">Blood Group</span>
                    <span className="text-gray-900 font-semibold">{userData?.blood_group}</span>
                    </div>
                    <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-medium">Gender</span>
                    <span className="text-gray-900 font-semibold">{userData?.gender}</span>
                    </div>
                    <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-medium">Date of Birth</span>
                    <span className="text-gray-900 font-semibold">{userData?.dob?.split('T')[0]}</span>
                    </div>
                </>
                ) : role === 'doctor' ? (
                <>
                    <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-medium">Specialization</span>
                    <span className="text-gray-900 font-semibold">{userData?.specialization}</span>
                    </div>
                    <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-medium">Department</span>
                    <span className="text-gray-900 font-semibold">{userData?.dept_name}</span>
                    </div>
                </>
                ) : null}

                {/* Edit Button */}
                {(role === 'patient' || role==='receptionist') && (
                <button 
                    onClick={() =>{
                        setEditBox(true);
                        setFormData(userData);
                    }}
                    className="mt-4 w-full py-2.5 px-4 text-blue-600 font-semibold justify-center rounded-xl bg-blue-50 border border-blue-100 transition duration-300 ease-out hover:bg-blue-600 hover:text-white"
                >
                    Edit Profile
                </button>
                )}
            </div>
            </div>

            {/* --- EDIT MODAL OVERLAY --- */}
            {editBox && (
            <div 
                onClick={() => setEditBox(false)} 
                className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4"
            >
                {/* Modal Container */}
                <div 
                onClick={e => e.stopPropagation()} 
                className="flex flex-col w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
                    <button 
                    onClick={() => setEditBox(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
                    >
                    &times;
                    </button>
                </div>

                {/* Modal Body (Form) */}
                <div className="p-6 space-y-4">
                    
                    {/* Name Input */}
                    <div className="flex flex-col gap-1.5">
                    <label htmlFor='name' className="text-sm font-medium text-gray-700">Full Name</label>
                    <input 
                        onChange={handleChange}
                        value={formData.name || ''} 
                        name="name"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    />
                    </div>

                    {/* Email Input */}
                    <div className="flex flex-col gap-1.5">
                    <label htmlFor='email' className="text-sm font-medium text-gray-700">Email Address</label>
                    <input 
                        onChange={handleChange}
                        type="email"
                        value={formData.email || ''} 
                        name="email"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    />
                    </div>
                    
                    {/* Patient Specific Inputs */}
                    {(role === 'patient') && (
                    <div className="grid grid-cols-2 gap-4">
                        
                        {/* Blood Group */}
                        <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                        <label htmlFor='blood_group' className="text-sm font-medium text-gray-700">Blood Group</label>
                        <input 
                            onChange={handleChange}
                            value={formData.blood_group || ''} 
                            name="blood_group"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                        />
                        </div>

                        {/* Gender */}
                        <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                        <label htmlFor='gender' className="text-sm font-medium text-gray-700">Gender</label>
                        <input
                            onChange={handleChange}
                            value={formData.gender || ''} 
                            name="gender"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                        />
                        </div>

                        {/* Date of Birth */}
                        <div className="flex flex-col gap-1.5 col-span-2">
                        <label htmlFor='dob' className="text-sm font-medium text-gray-700">Date of Birth</label>
                        <input 
                            onChange={handleChange}
                            type="date"
                            value={formData.dob?.split('T')[0] || ''} 
                            name="dob"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-700" 
                        />
                        </div>
                    </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button 
                    onClick={() => setEditBox(false)} 
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                    Cancel
                    </button>
                    <button 
                    onClick={()=>{
                        patchUserInfo();
                    }}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                    Save Changes
                    </button>
                </div>

                </div>
            </div>
            )}

        </div>
    );
}