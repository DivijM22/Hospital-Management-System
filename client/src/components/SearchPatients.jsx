import {useOutletContext,useNavigate} from 'react-router-dom';
import {useState,useEffect} from 'react';
import fetchWithAuth from '../fetchWithAuth';
import PatientCard from './PatientCard';

export default function SearchPatient()
{
    const {accessToken,setAccessToken}=useOutletContext();
    const navigate=useNavigate();
    const [search,setSearch]=useState("");
    const [patients,setPatients]=useState([]);

    async function fetchSearchResults(searchQuery)
    {
        const res=await fetchWithAuth({
            url : `${import.meta.env.VITE_SERVER_URL}/patient/patients?searchQuery=${searchQuery}`,
            method : 'GET',
            accessToken,
            setAccessToken,
            navigate,
            options : {
                withCredentials : true
            }
        });
        console.log(res.data);
        setPatients(res.data);
    }

    return (
        <div className="flex flex-col items-start w-full p-6 min-h-screen bg-gray-50">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Find Patient
                </h1>
                <p className="text-gray-500">
                    Search by name
                </p>
            </div>
            <div className="mb-6 w-full max-w-4xl bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4">
                <input
                    value={search}
                    onChange={e=>setSearch(e.target.value)}
                    type="text"
                    placeholder="Search patients"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button onClick={e=>fetchSearchResults(search)} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">Search</button>
            </div>

            {
                patients.length>0 &&
                <div className="grid grid-cols-3 gap-4 w-full rounded-xl border-2">
                    {
                        patients.map((value,index)=>{
                            return <PatientCard key={index}
                                    name={value.name}
                                    blood_group={value.blood_group}
                                    email={value.email}
                                    gender={value.gender}
                                    dob={value.dob.split('T')[0]}
                            />
                        })
                    }
                </div>
            }
        </div>
    );
}