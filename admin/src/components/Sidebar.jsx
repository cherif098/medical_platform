import React, { useContext, useState, useEffect } from "react";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import {NurseContext} from "../context/NurseContext";
import { NavLink } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Calendar,
  UserPlus,
  Users,
  FileText,
  User,
  Bot,
  ImagePlus,
  CreditCard,
  MessageCircle,
   Bed,
   Bell
} from "lucide-react";

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken, subscriptionPlan } = useContext(DoctorContext);
  const { nToken } = useContext(NurseContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [unreadChats, setUnreadChats] = useState(0);


  // récupérer le nombre de discussions non lues
  const fetchUnreadChats = async () => {
    try {
      const token = dToken || nToken;
      if (!token) return;

      const { data } = await axios.get(`${backendUrl}/api/messages/unread-count`, {
        headers: { dtoken: dToken || "", ntoken: nToken || "" },
      });

      setUnreadChats(data.unreadCount);
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre de discussions non lues :", error);
    }
  };

  // Auto-refresh 
  useEffect(() => {
    fetchUnreadChats();
    const interval = setInterval(fetchUnreadChats, 2000);
    return () => clearInterval(interval);
  }, [dToken, nToken]);


  return (
    <div className="min-h-screen bg-white border-r border-gray-100">
      {/* Section Admin */}
      {aToken && (
        <ul className="text-gray-600 mt-5">
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/admin-dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/all-apointments"
          >
            <Calendar className="w-5 h-5" />
            <p className="hidden md:block">Appointments</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/add-doctors"
          >
            <UserPlus className="w-5 h-5" />
            <p className="hidden md:block">Add Doctor</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/doctors-list"
          >
            <Users className="w-5 h-5" />
            <p className="hidden md:block">Doctors List</p>
          </NavLink>
        </ul>
      )}

      {/* Section Doctor */}
      {dToken && (
        <ul className="text-gray-600 mt-5">
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/doctor-dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/doctor-appointments"
          >
            <Calendar className="w-5 h-5" />
            <p className="hidden md:block">Appointments</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/medical-reports"
          >
            <FileText className="w-5 h-5" />
            <p className="hidden md:block">Medical Reports</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/doctor-profile"
          >
            <User className="w-5 h-5" />
            <p className="hidden md:block">Profile</p>
          </NavLink>
          <NavLink
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
            isActive
              ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
              : "hover:bg-gray-50"
          }`
        }
        to="/doctor/messages"
      >
        <MessageCircle className="w-5 h-5" />
        <p className="hidden md:block">Messages</p>
        
        {unreadChats > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {unreadChats}
          </span>
        )}
      </NavLink>
        </ul>
      )}

     {/* Section Nurse */}
{nToken && (
  <ul className="text-gray-600 mt-5">
    <NavLink
      className={({ isActive }) =>
        `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
          isActive
            ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
            : "hover:bg-gray-50"
        }`
      }
      to="/nurse-dashboard"
    >
      <LayoutDashboard className="w-5 h-5" />
      <p className="hidden md:block">Dashboard</p>
    </NavLink>

    <NavLink
      className={({ isActive }) =>
        `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
          isActive
            ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
            : "hover:bg-gray-50"
        }`
      }
      to="/medicalreports-list"
    >
      <FileText className="w-5 h-5" />
      <p className="hidden md:block">Medical Reports</p>
    </NavLink>

    <NavLink
      className={({ isActive }) =>
        `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
          isActive
            ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
            : "hover:bg-gray-50"
        }`
      }
      to="/bed-status"
    >
      <Bed className="w-5 h-5" />
      <p className="hidden md:block">Bed Status</p>
    </NavLink>

    <NavLink
      className={({ isActive }) =>
        `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
          isActive
            ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
            : "hover:bg-gray-50"
        }`
      }
      to="/notifications"
    >
      <Bell className="w-5 h-5" />
      <p className="hidden md:block">Notifications</p>
    </NavLink>
    <NavLink
        className={({ isActive }) =>
          `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
            isActive
              ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
              : "hover:bg-gray-50"
          }`
        }
        to="/nurse/messages"
      >
        <MessageCircle className="w-5 h-5" />
        <p className="hidden md:block">Messages</p>
        
        {unreadChats > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {unreadChats}
          </span>
        )}
      </NavLink>

    <NavLink
      className={({ isActive }) =>
        `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
          isActive
            ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
            : "hover:bg-gray-50"
        }`
      }
      to="/nurse-profile"
    >
      <User className="w-5 h-5" />
      <p className="hidden md:block">Profile</p>
    </NavLink>
  </ul>
)}


    </div>
  );
};

export default Sidebar;
