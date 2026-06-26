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
        className="w-full max-w-md mx-auto flex flex-col p-8 bg-white/95 border border-slate-100 shadow-xl rounded-3xl" onSubmit={handleSubmit}>
        {mode === "signup" ? (
            <>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h2>
                <p className="text-slate-500 text-sm mt-1">Register as a patient to manage appointments</p>
            </div>

            {/* Common Fields */}
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                    <input
                        onChange={handleChange}
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-800 placeholder-slate-400"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                    <input
                        onChange={handleChange}
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-800 placeholder-slate-400"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                    <input
                        onChange={handleChange}
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-800 placeholder-slate-400"
                        required
                    />
                </div>
            </div>

            {/* Patient-specific */}
            <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Blood Type</label>
                        <select
                            onChange={handleChange}
                            name="blood_group"
                            defaultValue=""
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-800"
                            required
                        >
                            <option value="" disabled hidden>
                                Select
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
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Gender</label>
                        <select
                            onChange={handleChange}
                            name="gender"
                            defaultValue=""
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-800"
                            required
                        >
                            <option value="" disabled hidden>
                                Select
                            </option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="O">Other</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Date of Birth</label>
                    <input
                        onChange={handleChange}
                        name="dob"
                        type="date"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-800"
                        required
                    />
                </div>
            </div>
            </>
        ) : (
            <>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                <p className="text-slate-500 text-sm mt-1">Sign in to access your dashboard</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                    <input
                        onChange={handleChange}
                        type="email"
                        name="email"
                        placeholder="yourname@example.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-800 placeholder-slate-400"
                        required
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1.5 ml-1">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                    </div>
                    <input
                        onChange={handleChange}
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-slate-800 placeholder-slate-400"
                        required
                    />
                </div>
            </div>
            </>
        )}

        {/* Submit */}
        <button
            type="submit"
            className="mt-8 w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-teal-600/10 hover:shadow-teal-600/20 hover:scale-[1.01] active:scale-[0.99]"
        >
            {mode === "signup" ? "Create Account" : "Sign In"}
        </button>
    </form>
  );
}