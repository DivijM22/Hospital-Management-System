import { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  User,
  Search,
  LogOut,
  Menu,
  History,
  CalendarPlus,
  CalendarX,
  CalendarClock,
  Users,
  Activity
} from "lucide-react";

export default function Sidebar(props) {
  const { role, handleLogout, setCollapsed, collapsed } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const menus = {
    patient: [
      { name: "Dashboard", icon: Home, navigate: '/dashboard' },
      { name: "Appointment History", icon: History, navigate: '/dashboard/patient/appointments' },
      { name: "Search Doctors", icon: Search, navigate: '/dashboard/patient/search/doctors' },
      { name: "Profile", icon: User, navigate: '/dashboard/profile' },
    ],

    receptionist: [
      { name: "Dashboard", icon: Home, navigate: '/dashboard' },
      { name: "Book Appointment", icon: CalendarPlus, navigate: '/dashboard/receptionist/book' },
      { name: "Cancel Appointment", icon: CalendarX, navigate: '/dashboard/receptionist/cancel' },
      { name: "Reschedule", icon: CalendarClock, navigate: '/dashboard/receptionist/reschedule' },
      { name: "Profile", icon: User, navigate: '/dashboard/profile' },
    ],

    doctor: [
      { name: "Dashboard", icon: Home, navigate: '/dashboard' },
      { name: "Search Patient", icon: Users, navigate: '/dashboard/doctor/search/patients' },
      { name: "Manage Appointments", icon: CalendarClock, navigate: '/dashboard/doctor/appointments/manage' },
      { name: "Profile", icon: User, navigate: '/dashboard/profile' },
    ],
  };

  const menuItems = menus[role] || [];

  return (
    <div
      className={`h-screen bg-gradient-to-b from-[#113837] to-[#081f1e] text-slate-100 transition-all duration-300 fixed z-20
      ${collapsed ? "w-[5vw] min-w-[70px]" : "w-[20vw] min-w-[240px]"} flex flex-col border-r border-teal-950 shadow-2xl`}
    >
      {/* Top Section - Brand */}
      <div className="flex items-center justify-between p-5 border-b border-teal-950">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="bg-teal-500/10 p-2 rounded-xl border border-teal-500/20 text-teal-400">
              <Activity size={20} className="animate-pulse" />
            </div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent">
              HMS Care
            </h1>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-white/5 text-teal-400 hover:text-white transition-colors flex items-center justify-center mx-auto"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex flex-col gap-1.5 mt-6 px-3 flex-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          // Check if current path matches the item's destination
          const isActive = location.pathname === item.navigate;

          return (
            <button
              key={index}
              onClick={() => navigate(item.navigate, { replace: true })}
              className={`group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 text-left relative ${
                isActive
                  ? "bg-teal-500/20 text-white font-medium border-l-4 border-teal-400 pl-2.5 active-glow"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              }`}
            >
              <Icon
                size={20}
                className={`transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? "text-teal-400" : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              {!collapsed && (
                <span className="text-sm tracking-wide">{item.name}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-slate-950 text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-teal-900/50">
                  {item.name}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Section - Logout */}
      <div className="p-4 border-t border-teal-950/60 bg-[#071b1a]/50">
        <button
          onClick={() => handleLogout()}
          className="group flex items-center gap-4 w-full p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 text-left relative"
        >
          <LogOut size={20} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          {!collapsed && <span className="text-sm font-medium tracking-wide">Logout</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2 py-1 bg-red-950 text-red-200 text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-red-900/30">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
}