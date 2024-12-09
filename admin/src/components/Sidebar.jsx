import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { DoctorContext } from "../context/DoctorContext";
import { CreditCard, Bot, ImagePlus } from "lucide-react";

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken, subscriptionPlan } = useContext(DoctorContext);

  return (
    <div className="min-h-screen bg-white border-r">
      {/* Section Admin */}
      {aToken && (
        <ul className="text-[#515151] mt-5">
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive
                  ? "bg-[#F2F3FF] border-r-4 border-primary"
                  : "bg-transparent border-none"
              }`
            }
            to={"/admin-dashboard"}
          >
            <img src={assets.home_icon} alt="" />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive
                  ? "bg-[#F2F3FF] border-r-4 border-primary"
                  : "bg-transparent border-none"
              }`
            }
            to={"/all-apointments"}
          >
            <img src={assets.appointment_icon} alt="" />
            <p className="hidden md:block">Appointements</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive
                  ? "bg-[#F2F3FF] border-r-4 border-primary"
                  : "bg-transparent border-none"
              }`
            }
            to={"/add-doctors"}
          >
            <img src={assets.add_icon} alt="" />
            <p className="hidden md:block">Add Doctor</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive
                  ? "bg-[#F2F3FF] border-r-4 border-primary"
                  : "bg-transparent border-none"
              }`
            }
            to={"/doctors-list"}
          >
            <img src={assets.people_icon} alt="" />
            <p className="hidden md:block">Doctors List</p>
          </NavLink>
        </ul>
      )}

      {/* Section Doctor */}
      {dToken && (
        <ul className="text-[#515151] mt-5">
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive
                  ? "bg-[#F2F3FF] border-r-4 border-primary"
                  : "bg-transparent border-none"
              }`
            }
            to={"/doctor-dashboard"}
          >
            <img src={assets.home_icon} alt="" />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive
                  ? "bg-[#F2F3FF] border-r-4 border-primary"
                  : "bg-transparent border-none"
              }`
            }
            to={"/doctor-appointments"}
          >
            <img src={assets.appointment_icon} alt="" />
            <p className="hidden md:block">Appointements</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive
                  ? "bg-[#F2F3FF] border-r-4 border-primary"
                  : "bg-transparent border-none"
              }`
            }
            to={"/medical-reports"}
          >
            <img src={assets.add_icon} alt="" />
            <p className="hidden md:block">Medical Reports</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive
                  ? "bg-[#F2F3FF] border-r-4 border-primary"
                  : "bg-transparent border-none"
              }`
            }
            to={"/doctor-profile"}
          >
            <img src={assets.people_icon} alt="" />
            <p className="hidden md:block">Profile</p>
          </NavLink>

          {/* AI Assistant (visible for PRO and PLATINUM) */}
          {(subscriptionPlan === "PRO" || subscriptionPlan === "PLATINUM") && (
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive
                    ? "bg-[#F2F3FF] border-r-4 border-primary"
                    : "bg-transparent border-none"
                }`
              }
              to={"/ai-assistant"}
            >
              <Bot className="h-5 w-5" />
              <p className="hidden md:block">AI Assistant</p>
            </NavLink>
          )}

          {/* AI Image Scanner (visible only for PLATINUM) */}
          {subscriptionPlan === "PLATINUM" && (
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive
                    ? "bg-[#F2F3FF] border-r-4 border-primary"
                    : "bg-transparent border-none"
                }`
              }
              to={"/ai-image-scanner"}
            >
              <ImagePlus className="h-5 w-5" />
              <p className="hidden md:block">AI Image Scanner</p>
            </NavLink>
          )}
          <NavLink></NavLink>
          <NavLink></NavLink>
          <NavLink></NavLink>
          <NavLink></NavLink>
          <NavLink></NavLink>
          <NavLink></NavLink>
          {/* Mon abonnement link (visible pour tous les médecins) */}
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive
                  ? "bg-[#F2F3FF] border-r-4 border-primary"
                  : "bg-transparent border-none"
              }`
            }
            to={"/subscription-plans"}
          >
            <CreditCard className="h-5 w-5" />
            <p className="hidden md:block">My plans</p>
          </NavLink>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
