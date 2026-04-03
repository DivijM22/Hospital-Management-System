import { useState } from "react";
import {useNavigate} from 'react-router-dom';
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
  Users
} from "lucide-react";

export default function Sidebar(props) {
  const { role,handleLogout,setCollapsed,collapsed} = props;
  const navigate=useNavigate();

  const menus = {
    patient: [
      { name: "Dashboard", icon: Home, navigate : '/dashboard'},
      { name: "Appointment History", icon: History , navigate : '/dashboard/patient/appointments'},
      { name: "Search Doctors", icon: Search, navigate : '/dashboard/patient/search/doctors'},
      { name: "Profile", icon: User, navigate : '/dashboard/profile'},
    ],

    receptionist: [
      { name: "Dashboard", icon: Home, navigate: '/dashboard'},
      { name: "Book Appointment", icon: CalendarPlus, navigate: '/dashboard/receptionist/book'},
      { name: "Cancel Appointment", icon: CalendarX, navigate: '/dashboard/receptionist/cancel' },
      { name: "Reschedule Appointment", icon: CalendarClock, navigate : '/dashboard/receptionist/reschedule'},
      { name: "Profile", icon: User, navigate : '/dashboard/profile'},
    ],

    doctor: [
      { name: "Dashboard", icon: Home, navigate: '/dashboard'},
      { name: "Search Patient", icon: Users, navigate: '/dashboard/doctor/search/patients'},
      { name: "Manage Appointments", icon: CalendarClock, navigate : '/dashboard/doctor/appointments/manage'},
      { name: "Profile", icon: User, navigate : '/dashboard/profile' },
    ],
  };

  const menuItems = menus[role] || [];

  return (
    <div
      className={`h-screen bg-[#1E6966] text-white transition-all duration-300 fixed
      ${collapsed ? "w-[5vw]" : "w-[20vw]"} flex flex-col`}
    >
      {/* Top Section */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && <h1 className="text-lg font-bold">🏥 HMS</h1>}
        <button onClick={() => setCollapsed(!collapsed)}>
          <Menu />
        </button>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-2 mt-4 px-2 flex-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/20 transition"
              onClick={()=>navigate(item.navigate,{replace : true})}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.name}</span>}
            </button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/20">
        <button className="flex items-center gap-4 w-full p-3 rounded-lg hover:bg-red-500/70 transition" onClick={e=>handleLogout()}>
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}