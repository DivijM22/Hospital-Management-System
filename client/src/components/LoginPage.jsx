import UserForm from "./UserForm";
import {useState} from 'react';

export default function LoginPage() {
  const [mode, setMode] = useState("login");

  const greenBG = "bg-gradient-to-br from-[#1E6966] to-[#15514E]";
  const grayBG = "bg-gray-100";

  return (
    <div className="min-h-screen w-full flex">

      {/* LEFT PANEL */}
      <div className={`w-1/2 flex items-center justify-center relative overflow-hidden ${mode === "signup" ? greenBG : grayBG}`}>

        {mode === "signup" ? (
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
        ) : (
          <UserForm mode="login" />
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className={`w-1/2 flex items-center justify-center ${mode === "signup" ? grayBG : greenBG}`}>

        {mode === "signup" ? (
          <UserForm mode="signup" />
        ) : (
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
          </div>
        )}
      </div>

    </div>
  );
}