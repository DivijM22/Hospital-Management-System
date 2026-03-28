import { useState } from "react";

export default function UserForm(props) {
    const {mode}=props;
  return (
    <div className="max-w-xl mx-auto flex flex-col p-6 bg-white shadow-lg rounded-xl">
    {
        mode==='signup' ? 
        <>
            <h2 className="text-2xl font-semibold mb-6">Patient Sign Up</h2>

            {/* Common Fields */}
            <div className="space-y-4">
                <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-lg"
                />

            </div>

            <div className="mt-6 space-y-4">
                <select className="w-full px-4 py-2 border rounded-lg">
                    <option value="" disabled selected hidden>Select a Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                </select>
                <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg"
                />
                <select className="w-full px-4 py-2 border rounded-lg">
                    <option value="" disabled selected hidden>Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                </select>
            </div>
        </> : <>
            <h2 className="text-2xl font-semibold mb-6">Patient Log In</h2>
            <div className="space-y-4">
                <input type="text" placeholder="Enter email" className="w-full px-4 py-2 border rounded-lg"/>
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-2 border rounded-lg"
                />
            </div>
        </>
        }
      {/* Submit */}
      <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
        Sign Up
      </button>
    </div> 
  );
}