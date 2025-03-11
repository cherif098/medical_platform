import React, { useContext, useState, useEffect } from "react";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { NurseContext } from "../context/NurseContext";
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
  MessageCircle,
  Bed,
  Bell,
  ChevronDown,
  ChevronRight,
  Plus,
  List,
} from "lucide-react";

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken, subscriptionPlan } = useContext(DoctorContext);
  const { nToken } = useContext(NurseContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [unreadChats, setUnreadChats] = useState(0);

  // 📌 Récupérer le nombre de discussions non lues
  const fetchUnreadChats = async () => {
    try {
      const token = dToken || nToken;
      if (!token) return;

      const { data } = await axios.get(`${backendUrl}/api/messages/unread-count`, {
        headers: { dtoken: dToken || "", ntoken: nToken || "" },
      });

      setUnreadChats(data.unreadCount);
    } catch (error) {
      console.error("Erreur récupération des messages non lus :", error);
    }
  };

  // 📌 Auto-refresh toutes les 2 secondes
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
          <NavLink to="/admin-dashboard" className="sidebar-link">
            <LayoutDashboard className="w-5 h-5" />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>
          <NavLink to="/all-apointments" className="sidebar-link">
            <Calendar className="w-5 h-5" />
            <p className="hidden md:block">Appointments</p>
          </NavLink>
        </ul>
      )}

      {/* Section Doctor */}
      {dToken && (
        <ul className="text-gray-600 mt-5">
          <NavLink to="/doctor-dashboard" className="sidebar-link">
            <LayoutDashboard className="w-5 h-5" />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>
          <NavLink to="/doctor-appointments" className="sidebar-link">
            <Calendar className="w-5 h-5" />
            <p className="hidden md:block">Appointments</p>
          </NavLink>
          <NavLink to="/medical-reports" className="sidebar-link">
            <FileText className="w-5 h-5" />
            <p className="hidden md:block">Medical Reports</p>
          </NavLink>
          <NavLink to="/doctor-profile" className="sidebar-link">
            <User className="w-5 h-5" />
            <p className="hidden md:block">Profile</p>
          </NavLink>
          <NavLink to="/doctor/messages" className="sidebar-link">
            <MessageCircle className="w-5 h-5" />
            <p className="hidden md:block">Messages</p>
            {unreadChats > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {unreadChats}
              </span>
            )}
          </NavLink>
          <NavLink to="/ai-assistant" className="sidebar-link">
            <Bot className="w-5 h-5" />
            <p className="hidden md:block">AI Assistant</p>
          </NavLink>
          <NavLink to="/ai-image-scanner" className="sidebar-link">
            <ImagePlus className="w-5 h-5" />
            <p className="hidden md:block">AI Image Scanner</p>
          </NavLink>
        </ul>
      )}

      {/* Section Nurse */}
      {nToken && (
        <ul className="text-gray-600 mt-5">
          <NavLink to="/nurse-dashboard" className="sidebar-link">
            <LayoutDashboard className="w-5 h-5" />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>
          <NavLink to="/medicalreports-list" className="sidebar-link">
            <FileText className="w-5 h-5" />
            <p className="hidden md:block">Medical Reports</p>
          </NavLink>
          <NavLink to="/bed-status" className="sidebar-link">
            <Bed className="w-5 h-5" />
            <p className="hidden md:block">Bed Status</p>
          </NavLink>
          <NavLink to="/notifications" className="sidebar-link">
            <Bell className="w-5 h-5" />
            <p className="hidden md:block">Notifications</p>
          </NavLink>
          <NavLink to="/nurse/messages" className="sidebar-link">
            <MessageCircle className="w-5 h-5" />
            <p className="hidden md:block">Messages</p>
            {unreadChats > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {unreadChats}
              </span>
            )}
          </NavLink>
          <NavLink to="/nurse-profile" className="sidebar-link">
            <User className="w-5 h-5" />
            <p className="hidden md:block">Profile</p>
          </NavLink>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
