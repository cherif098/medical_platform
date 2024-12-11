import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { NavLink } from "react-router-dom";
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
} from "lucide-react";

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken, subscriptionPlan } = useContext(DoctorContext);

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

          {/* AI Assistant (PRO et PLATINUM) */}
          {(subscriptionPlan === "PRO" || subscriptionPlan === "PLATINUM") && (
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
          )}

          {/* AI Image Scanner (PLATINUM) */}
          {subscriptionPlan === "PLATINUM" && (
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
          )}

          {/* Subscription Plans */}
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/subscription-plans"
          >
            <CreditCard className="w-5 h-5" />
            <p className="hidden md:block">My Plans</p>
          </NavLink>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
