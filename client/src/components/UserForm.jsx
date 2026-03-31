import { useState } from "react";

export default function UserForm(props) {
    const {mode,setFormData}=props;
    function handleChange(e){
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }
    function handleSubmit(e){
        e.preventDefault();
        setFormData(prev => ({
            ...prev,
            submitted: true
        }));
    }
  return (
    <form
        className="max-w-xl mx-auto flex flex-col p-6 bg-white shadow-lg rounded-xl" onSubmit={handleSubmit}>
        {mode === "signup" ? (
            <>
            <h2 className="text-2xl font-semibold mb-6">Patient Sign Up</h2>

            {/* Common Fields */}
            <div className="space-y-4">
                <input
                onChange={handleChange}
                name="name"
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2 border rounded-lg"
                required
                />
                <input
                onChange={handleChange}
                name="email"
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg"
                required
                />
                <input
                onChange={handleChange}
                name="password"
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-lg"
                required
                />
            </div>

            {/* Patient-specific */}
            <div className="mt-6 space-y-4">
                <select
                onChange={handleChange}
                name="blood_type"
                defaultValue=""
                className="w-full px-4 py-2 border rounded-lg"
                required
                >
                <option value="" disabled hidden>
                    Select a Blood Type
                </option>
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
                onChange={handleChange}
                name="dob"
                type="date"
                className="w-full px-4 py-2 border rounded-lg"
                required
                />

                <select
                onChange={handleChange}
                name="gender"
                defaultValue=""
                className="w-full px-4 py-2 border rounded-lg"
                required
                >
                <option value="" disabled hidden>
                    Select Gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                </select>
            </div>
            </>
        ) : (
            <>
            <h2 className="text-2xl font-semibold mb-6">Patient Log In</h2>

            <div className="space-y-4">
                <input
                onChange={handleChange}
                type="email"
                name="email"
                placeholder="Enter email"
                className="w-full px-4 py-2 border rounded-lg"
                required
                />
                <input
                onChange={handleChange}
                type="password"
                name="password"
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-lg"
                required
                />
            </div>
            </>
        )}

        {/* Submit */}
        <button
            type="submit"
            className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
            {mode === "signup" ? "Sign Up" : "Log in"}
        </button>
    </form>
  );
}