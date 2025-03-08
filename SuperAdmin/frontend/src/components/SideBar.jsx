import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Hospital, Handshake, ScrollText } from 'lucide-react'

const SideBar = () => {
  return (
    <div className="min-h-screen bg-white border-r border-gray-100">
        <ul className="text-gray-600 mt-5">
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/dashboard"
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
            to="/add-hospital"
          >
            <Hospital className="w-5 h-5" />
            <p className="hidden md:block">Add Hospital</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/hospital-list"
          >
            <ScrollText  className="w-5 h-5" />
            <p className="hidden md:block">Hospital List</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/partnership"
          >
            <Handshake className="w-5 h-5" />
            <p className="hidden md:block">Partnership</p>
          </NavLink>
        </ul>
    </div>
  )
}

export default SideBar