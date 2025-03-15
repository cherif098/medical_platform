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
  CreditCard,
  MessageCircle,
  Bed,
  Bell,
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  Cpu,
} from "lucide-react";

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken, subscriptionPlan } = useContext(DoctorContext);
  const { nToken } = useContext(NurseContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [unreadChats, setUnreadChats] = useState(0);

  // State for managing dropdown toggles
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [listDropdownOpen, setListDropdownOpen] = useState(false);

  // Toggle functions
  const toggleAddDropdown = () => setAddDropdownOpen(!addDropdownOpen);
  const toggleListDropdown = () => setListDropdownOpen(!listDropdownOpen);

  // Fetch unread message count
  const fetchUnreadChats = async () => {
    try {
      const token = dToken || nToken;
      if (!token) return;

      const { data } = await axios.get(
        `${backendUrl}/api/messages/unread-count`,
        {
          headers: { dtoken: dToken || "", ntoken: nToken || "" },
        }
      );

      setUnreadChats(data.unreadCount);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  };

  // Auto-refresh every 2 seconds
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

          {/* Add Staff Dropdown */}
          <div className="relative">
            <div
              className={`flex items-center justify-between gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors hover:bg-gray-50`}
              onClick={toggleAddDropdown}
            >
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5" />
                <p className="hidden md:block">Add Staff</p>
              </div>
              {addDropdownOpen ? (
                <ChevronDown className="w-4 h-4 hidden md:block" />
              ) : (
                <ChevronRight className="w-4 h-4 hidden md:block" />
              )}
            </div>

            {addDropdownOpen && (
              <div className="pl-8 bg-gray-50 py-1">
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-2 py-2.5 px-3 md:px-4 cursor-pointer transition-colors ${
                      isActive
                        ? "text-primary font-medium"
                        : "text-gray-600 hover:text-primary"
                    }`
                  }
                  to="/add-doctors"
                >
                  <Plus className="w-4 h-4" />
                  <p className="hidden md:block text-sm">Add Doctor</p>
                </NavLink>

                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-2 py-2.5 px-3 md:px-4 cursor-pointer transition-colors ${
                      isActive
                        ? "text-primary font-medium"
                        : "text-gray-600 hover:text-primary"
                    }`
                  }
                  to="/add-nurse"
                >
                  <Plus className="w-4 h-4" />
                  <p className="hidden md:block text-sm">Add Nurse</p>
                </NavLink>

                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-2 py-2.5 px-3 md:px-4 cursor-pointer transition-colors ${
                      isActive
                        ? "text-primary font-medium"
                        : "text-gray-600 hover:text-primary"
                    }`
                  }
                  to="/add-secretary"
                >
                  <Plus className="w-4 h-4" />
                  <p className="hidden md:block text-sm">Add Secretary</p>
                </NavLink>

                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-2 py-2.5 px-3 md:px-4 cursor-pointer transition-colors ${
                      isActive
                        ? "text-primary font-medium"
                        : "text-gray-600 hover:text-primary"
                    }`
                  }
                  to="/add-manager"
                >
                  <Plus className="w-4 h-4" />
                  <p className="hidden md:block text-sm">Add Manager</p>
                </NavLink>
              </div>
            )}
          </div>

          {/* List Staff Dropdown */}
          <div className="relative">
            <div
              className={`flex items-center justify-between gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors hover:bg-gray-50`}
              onClick={toggleListDropdown}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <p className="hidden md:block">Staff List</p>
              </div>
              {listDropdownOpen ? (
                <ChevronDown className="w-4 h-4 hidden md:block" />
              ) : (
                <ChevronRight className="w-4 h-4 hidden md:block" />
              )}
            </div>

            {listDropdownOpen && (
              <div className="pl-8 bg-gray-50 py-1">
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-2 py-2.5 px-3 md:px-4 cursor-pointer transition-colors ${
                      isActive
                        ? "text-primary font-medium"
                        : "text-gray-600 hover:text-primary"
                    }`
                  }
                  to="/doctors-list"
                >
                  <List className="w-4 h-4" />
                  <p className="hidden md:block text-sm">Doctors List</p>
                </NavLink>

                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-2 py-2.5 px-3 md:px-4 cursor-pointer transition-colors ${
                      isActive
                        ? "text-primary font-medium"
                        : "text-gray-600 hover:text-primary"
                    }`
                  }
                  to="/nurses-list"
                >
                  <List className="w-4 h-4" />
                  <p className="hidden md:block text-sm">Nurses List</p>
                </NavLink>

                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-2 py-2.5 px-3 md:px-4 cursor-pointer transition-colors ${
                      isActive
                        ? "text-primary font-medium"
                        : "text-gray-600 hover:text-primary"
                    }`
                  }
                  to="/secretaries-list"
                >
                  <List className="w-4 h-4" />
                  <p className="hidden md:block text-sm">Secretaries List</p>
                </NavLink>

                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-2 py-2.5 px-3 md:px-4 cursor-pointer transition-colors ${
                      isActive
                        ? "text-primary font-medium"
                        : "text-gray-600 hover:text-primary"
                    }`
                  }
                  to="/managers-list"
                >
                  <List className="w-4 h-4" />
                  <p className="hidden md:block text-sm">Managers List</p>
                </NavLink>
              </div>
            )}
          </div>
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
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5" />
              <p className="hidden md:block">Messages</p>
            </div>
            {unreadChats > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ml-auto">
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
            to="/ai-assistant"
          >
            <Bot className="w-5 h-5" />
            <p className="hidden md:block">AI Assistant</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/ai-image-scanner"
          >
            <ImagePlus className="w-5 h-5" />
            <p className="hidden md:block">AI Image Scanner</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/medical-ai-scanner"
          >
            <Cpu className="w-5 h-5" />
            <p className="hidden md:block">Medical X-Ray Analysis</p>
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
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5" />
              <p className="hidden md:block">Messages</p>
            </div>
            {unreadChats > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ml-auto">
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
